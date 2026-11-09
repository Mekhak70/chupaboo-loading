import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { mobileAuth } from "@/lib/mobile-auth";
import {
  deliveryFee,
  drivingDistance,
  uuid,
  validateDelivery,
  validateOptions,
} from "@/lib/mobile-commerce";
export const runtime = "nodejs";
export const maxDuration = 60;
async function read(request: NextRequest) {
  const reader = request.body?.getReader();
  if (!reader) throw Error("Դատարկ հարցում։");
  const pieces: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 200000) {
      await reader.cancel();
      throw Error("Հարցումը չափազանց մեծ է։");
    }
    pieces.push(value);
  }
  return JSON.parse(Buffer.concat(pieces).toString("utf8"));
}
export async function POST(request: NextRequest) {
  try {
    const auth = await mobileAuth(request);
    if (!auth)
      return NextResponse.json(
        { error: "Նախ մուտք գործիր հաստատված էլ․ փոստով։" },
        { status: 401 },
      );
    const { client, user } = auth;
    const data = await read(request);
    if (
      !uuid(data.id) ||
      !["quote", "order"].includes(data.action) ||
      !Array.isArray(data.items) ||
      data.items.length < 1 ||
      data.items.length > 50
    )
      throw Error("Պատվերի տվյալները սխալ են։");
    // Compare original input before recalculation, so a timed-out successful order can be retried safely.
    const requestHash = createHash("sha256")
      .update(JSON.stringify({ items: data.items, delivery: data.delivery }))
      .digest("hex");
    const previous = await client
      .from("mobile_order_owners")
      .select("user_id,request_hash")
      .eq("order_id", data.id)
      .maybeSingle();
    if (previous.error) throw Error("Նախ կատարիր mobile SQL կարգավորումը։");
    if (previous.data) {
      if (
        previous.data.user_id !== user.id ||
        previous.data.request_hash !== requestHash
      )
        throw Error("Պատվերի նույնացուցիչն արդեն օգտագործված է։");
      if (data.action === "order")
        return NextResponse.json({
          id: data.id,
          status: "pending",
          duplicate: true,
        });
    }
    const ids = data.items.map((i: any) => i.id);
    if (
      ids.some(
        (id: unknown) =>
          typeof id !== "string" || !/^[-a-zA-Z0-9]{1,100}$/.test(id),
      )
    )
      throw Error("Ապրանքի նույնացուցիչը սխալ է։");
    const catalog = await client
      .from("catalog_products")
      .select("*")
      .in("id", ids)
      .eq("is_active", true);
    if (catalog.error) throw catalog.error;
    const items: any[] = [];
    const quantities = new Map<string, number>();
    let firstCakePrice: number | null = null;
    for (const input of data.items) {
      const row = catalog.data?.find((r) => r.id === input.id);
      if (
        !row ||
        !Number.isSafeInteger(input.quantity) ||
        input.quantity < 1 ||
        input.quantity > 100 ||
        !["cake", "party", "available"].includes(row.section)
      )
        throw Error("Ապրանքը հասանելի չէ կամ քանակը սխալ է։");
      const sum = (quantities.get(row.id) || 0) + input.quantity;
      quantities.set(row.id, sum);
      if (
        (row.stock_quantity !== null && sum > Number(row.stock_quantity)) ||
        (row.section !== "cake" && row.stock_quantity === null)
      )
        throw Error(`${row.name}․ առկա քանակը բավարար չէ։`);
      let price = Number(row.price),
        options: any = null;
      if (row.section === "cake") {
        const validated = validateOptions(row, input.options);
        price = validated.price;
        options = validated.options;
        if (firstCakePrice === null) firstCakePrice = price;
        if (options.customImagePath) {
          if (
            !options.customImagePath.startsWith(user.id + "/") ||
            options.customImagePath.includes("..")
          )
            throw Error("Լուսանկարը չի պատկանում այս հաշվին։");
          const file = await client.storage
            .from("mobile-order-images")
            .createSignedUrl(options.customImagePath, 604800);
          if (file.error) throw Error("Լուսանկարը չի գտնվել։ Կրկին ընտրիր։");
          options = { ...options, customImage: file.data.signedUrl };
        }
      }
      if (!Number.isFinite(price) || price < 0)
        throw Error("Ապրանքի գինը սխալ է։");
      const image = row.image_path
        ? client.storage.from("catalog-images").getPublicUrl(row.image_path)
            .data.publicUrl
        : "";
      items.push({
        id: row.id,
        name: row.name,
        quantity: input.quantity,
        price,
        options,
        ingredient:
          row.section === "available" ? row.ingredients || "Առկա" : null,
        image,
      });
    }
    const discountPercent =
      (firstCakePrice || 0) >= 20000
        ? 15
        : (firstCakePrice || 0) >= 15000
          ? 10
          : 0;
    for (const item of items)
      if (!item.options)
        item.price =
          Math.round(item.price * (1 - discountPercent / 100) * 100) / 100;
    const productTotal =
      Math.round(
        items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100,
      ) / 100;
    const delivery = validateDelivery(
      data.delivery,
      items.some((i) => !!i.ingredient),
    );
    const distance =
      delivery.deliveryOption === "delivery"
        ? await drivingDistance(delivery.deliveryAddress)
        : null;
    const fee = distance === null ? 0 : deliveryFee(productTotal, distance);
    const total = Math.round((productTotal + fee) * 100) / 100;
    if (data.action === "quote")
      return NextResponse.json(
        {
          items,
          productTotal,
          deliveryFee: fee,
          total,
          distance,
          discountPercent,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    if (data.expectedTotal !== total)
      return NextResponse.json(
        {
          error:
            "Գինը կամ առաքման արժեքը փոխվել է։ Կրկին հաշվիր վերջնական գինը։",
        },
        { status: 409 },
      );
    const saved = await client.rpc("record_mobile_checkout", {
      p_id: data.id,
      p_user_id: user.id,
      p_request_hash: requestHash,
      p_payload: {
        _catalog: catalog.data,
        phone: delivery.phoneNumber,
        delivery: { ...delivery, distance, source: "mobile" },
        deliveryFee: fee,
        items,
      },
    });
    if (saved.error) throw Error(saved.error.message);
    return NextResponse.json({ id: data.id, status: "pending" });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Պատվերը չհաջողվեց պահպանել։" },
      { status: 400 },
    );
  }
}
