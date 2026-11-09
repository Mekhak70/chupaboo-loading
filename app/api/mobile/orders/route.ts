import { NextRequest, NextResponse } from "next/server";
import { mobileAuth } from "@/lib/mobile-auth";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  try {
    const auth = await mobileAuth(request);
    if (!auth)
      return NextResponse.json({ error: "Նախ մուտք գործիր։" }, { status: 401 });
    const { client, user } = auth;
    const rawOffset = Number(request.nextUrl.searchParams.get("offset") || 0);
    if (!Number.isSafeInteger(rawOffset) || rawOffset < 0 || rawOffset > 100000)
      return NextResponse.json({ error: "Սխալ էջ։" }, { status: 400 });
    const offset = rawOffset;
    const { data, error } = await client
      .from("mobile_order_owners")
      .select("order_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .order("order_id", { ascending: false })
      .range(offset, offset + 19);
    if (error) throw error;
    const ids = (data || []).map((r) => r.order_id);
    if (!ids.length)
      return NextResponse.json(
        { orders: [] },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    const result = await client
      .from("finance_orders")
      .select(
        "id,created_at,status,phone,delivery_info,items,delivery_fee,product_total",
      )
      .in("id", ids)
      .order("created_at", { ascending: false });
    if (result.error) throw result.error;
    // Costs exist inside finance items. Never return them to customers.
    return NextResponse.json(
      {
        orders: (result.data || []).map((o) => ({
          ...o,
          items: o.items.map((i: any) => ({
            name: i.name,
            quantity: i.quantity,
            unit_price: i.unit_price,
          })),
        })),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Պատվերները չբեռնվեցին։ Ստուգիր mobile SQL կարգավորումը։" },
      { status: 500 },
    );
  }
}
