import {
  calculateCatalogCakePrice,
  normalizeCake,
  type CakeConfiguration,
} from "./mobile-cake-config";
export const uuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
export function deliveryFee(total: number, distance: number) {
  if (!Number.isFinite(distance) || distance < 0 || distance > 500)
    throw Error("Առաքման հեռավորությունը չի որոշվել։");
  return total >= 20000
    ? distance <= 10
      ? 0
      : Math.ceil((distance - 10) / 7) * 500
    : 1000 + Math.max(0, Math.ceil((distance - 7) / 7)) * 500;
}
export function validateOptions(row: Record<string, unknown>, raw: any) {
  const cake = normalizeCake(row, (p) => p);
  if (
    !raw ||
    !["MEAT", "FRUIT", "VEGETABLES"].includes(raw.cakeType) ||
    (cake.cream &&
      !["DAIRY", "PLANTBASEDMILK", "PLANTBASED"].includes(raw.creamType)) ||
    !cake.designs.includes(raw.designType)
  )
    throw Error("Տորթի ընտրանքները սխալ են։");
  if (
    raw.cakeType === "MEAT" &&
    !["CHICKEN", "BEEF", "LAMB", "TURKEY", "SALMON"].includes(
      raw.selectedAnimal,
    )
  )
    throw Error("Ընտրիր մսի տեսակը։");
  const allowed =
    raw.cakeType === "FRUIT"
      ? ["APPLE", "BANANA", "PEAR", "ELDERBERRY", "STRAWBERRY", "MANGO"]
      : [
          "POTATO",
          "CARROT",
          "BROCCOLI",
          "PUMPKIN",
          "PEPPER",
          "ZUCCHINI",
          "CAULIFLOWER",
          "SWEET_POTATO",
          "SPINACH",
          "RICE",
          "WHEAT",
          "OATS",
        ];
  if (
    !Array.isArray(raw.selectedVegetables) ||
    raw.selectedVegetables.length < 1 ||
    raw.selectedVegetables.length > 3 ||
    new Set(raw.selectedVegetables).size !== raw.selectedVegetables.length ||
    raw.selectedVegetables.some((v: unknown) => !allowed.includes(String(v))) ||
    raw.selectedVegetables.filter((v: string) =>
      ["RICE", "WHEAT", "OATS"].includes(v),
    ).length > 1
  )
    throw Error("Բաղադրիչների ընտրությունը սխալ է։");
  const text = (v: unknown, max: number) =>
    typeof v === "string" && v.length <= max ? v.trim() : "";
  const options = {
    cakeType: raw.cakeType,
    creamType: cake.cream ? raw.creamType : "",
    selectedAnimal: raw.cakeType === "MEAT" ? raw.selectedAnimal : "",
    selectedVegetables: raw.selectedVegetables,
    designType: raw.designType,
    petName: text(raw.petName, 60),
    customText: text(raw.customText, 500),
    ...(raw.designType === "CUSTOM_PHOTO"
      ? { customImagePath: text(raw.customImagePath, 200) }
      : {}),
  };
  if (
    (options.designType === "NAME_TEXT" && !options.petName) ||
    (options.designType === "CUSTOM_TEXT" && !options.customText) ||
    (options.designType === "CUSTOM_PHOTO" && !options.customImagePath)
  )
    throw Error("Դիզայնի տվյալները լրացված չեն։");
  return {
    options,
    price: calculateCatalogCakePrice(cake, options as CakeConfiguration),
  };
}
export function today(offset = 0) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Yerevan",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(Date.now() + offset * 86400000));
}
export function validateDelivery(d: any, available: boolean) {
  if (
    !d ||
    !["pickup", "delivery"].includes(d.deliveryOption) ||
    typeof d.phoneNumber !== "string" ||
    !/^\+?[\d\s()-]{8,25}$/.test(d.phoneNumber) ||
    d.phoneNumber.replace(/\D/g, "").length < 8 ||
    !["cash", "CARD", "bankTransfer"].includes(d.paymentMethod) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(d.deliveryTime)
  )
    throw Error("Ստուգիր հեռախոսը, ժամը և վճարման եղանակը։");
  const min = today(available ? 0 : 1);
  if (
    typeof d.deliveryDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(d.deliveryDate) ||
    isNaN(+new Date(d.deliveryDate)) ||
    new Date(d.deliveryDate).toISOString().slice(0, 10) !== d.deliveryDate ||
    d.deliveryDate < min ||
    d.deliveryDate > today(30)
  )
    throw Error("Ընտրիր թույլատրելի ամսաթիվ՝ առաջիկա 30 օրում։");
  if (
    d.deliveryOption === "delivery" &&
    (typeof d.deliveryAddress !== "string" ||
      d.deliveryAddress.trim().length < 5 ||
      d.deliveryAddress.length > 300)
  )
    throw Error("Լրացրու առաքման ամբողջական հասցեն։");
  return {
    deliveryOption: d.deliveryOption,
    deliveryAddress:
      d.deliveryOption === "delivery"
        ? d.deliveryAddress.trim()
        : "Yerevan, Kievan 15",
    deliveryDate: d.deliveryDate,
    deliveryTime: d.deliveryTime,
    phoneNumber: d.phoneNumber.trim(),
    paymentMethod: d.paymentMethod,
  };
}
export async function drivingDistance(address: string): Promise<number> {
  const target = new URL("https://nominatim.openstreetmap.org/search");
  target.searchParams.set("q", address);
  target.searchParams.set("format", "json");
  target.searchParams.set("countrycodes", "am");
  target.searchParams.set("limit", "1");
  const geocode = await fetch(target, {
    headers: { "User-Agent": "ChupabooMobile/1.0 (https://www.chupaboo.com)" },
    signal: AbortSignal.timeout(10000),
    next: { revalidate: 86400 },
  });
  if (!geocode.ok) throw Error("Հասցեի որոնումը ժամանակավորապես հասանելի չէ։");
  const places = await geocode.json();
  const lat = Number(places[0]?.lat),
    lon = Number(places[0]?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon))
    throw Error("Հասցեն չի գտնվել։ Նշիր քաղաքը և փողոցի անունը։");
  const route = await fetch(
    `https://router.project-osrm.org/route/v1/driving/44.488427,40.195059;${lon},${lat}?overview=false`,
    { signal: AbortSignal.timeout(10000), next: { revalidate: 86400 } },
  );
  if (!route.ok)
    throw Error(
      "Երթուղին չի հաշվարկվել։ Փորձիր կրկին կամ ընտրիր ինքնուրույն վերցնելը։",
    );
  const result = await route.json();
  const distance = Number(result.routes?.[0]?.distance) / 1000;
  if (result.code !== "Ok" || !Number.isFinite(distance) || distance <= 0)
    throw Error("Երթուղին չի հաշվարկվել։");
  return distance;
}
