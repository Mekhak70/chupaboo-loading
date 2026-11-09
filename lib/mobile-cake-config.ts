export type CakeCategory = "small" | "midi" | "standart";
export type CakeDesign =
  "STANDARD" | "CUSTOM_PHOTO" | "CUSTOM_TEXT" | "NAME_TEXT";
export interface CatalogCake {
  id: string;
  name: string;
  price: number;
  image: string;
  category: CakeCategory;
  cream: boolean;
  designs: CakeDesign[];
  standardText: string;
  description: string;
  isFeatured: boolean;
}
export interface CakeConfiguration {
  cakeType: "MEAT" | "FRUIT" | "VEGETABLES" | "";
  creamType: "DAIRY" | "PLANTBASEDMILK" | "PLANTBASED" | "";
  selectedVegetables: string[];
  selectedAnimal: string;
  designType: CakeDesign | "";
}
export const CATALOG_CAKE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%23f8f6fb'/%3E%3Ctext x='300' y='310' text-anchor='middle' fill='%2369429a' font-size='32'%3ECHUPABOO%3C/text%3E%3C/svg%3E";
export function normalizeCake(
  row: Record<string, unknown>,
  publicImageUrl: (path: string) => string,
): CatalogCake {
  const price = Number(row.price);
  if (!row.id || !row.name || !Number.isFinite(price) || price < 0) {
    throw new Error("Տորթի անունը կամ գինը սխալ է։ Ստուգիր ադմինում։");
  }
  const category: CakeCategory =
    row.cake_size === "MINI"
      ? "small"
      : row.cake_size === "MIDI"
        ? "midi"
        : "standart";
  const designs: CakeDesign[] = [];
  for (const raw of Array.isArray(row.design_types) ? row.design_types : []) {
    const key = raw === "CUSTOM_DESIGN" ? "CUSTOM_TEXT" : raw;
    if (
      (key === "STANDARD" ||
        key === "CUSTOM_PHOTO" ||
        key === "CUSTOM_TEXT" ||
        key === "NAME_TEXT") &&
      !designs.includes(key)
    )
      designs.push(key);
  }
  if (designs.length === 0)
    throw new Error("Տորթի համար դիզայնի տեսակ ընտրված չէ։ Ստուգիր ադմինում։");
  return {
    id: String(row.id),
    name: String(row.name),
    price,
    category,
    image:
      typeof row.image_path === "string" && row.image_path
        ? publicImageUrl(row.image_path)
        : CATALOG_CAKE_PLACEHOLDER,
    cream: row.has_cream === true,
    designs,
    standardText:
      typeof row.standard_text === "string" ? row.standard_text : "",
    description: typeof row.description === "string" ? row.description : "",
    isFeatured: row.is_featured === true,
  };
}
// Admin price is the base price of THIS size, with chicken and two regular ingredients.
// Only option adjustments are scaled; the saved base price is never divided again.
export function calculateCatalogCakePrice(
  product: CatalogCake,
  config: CakeConfiguration,
): number {
  const meatExtra: Record<string, number> = {
    CHICKEN: 0,
    BEEF: 1000,
    LAMB: 3000,
    TURKEY: 7000,
    SALMON: 9000,
  };
  let adjustment =
    config.cakeType === "FRUIT"
      ? -2000
      : config.cakeType === "VEGETABLES"
        ? -1000
        : (meatExtra[config.selectedAnimal] ?? 0);
  for (const ingredient of config.selectedVegetables) {
    if (["SWEET_POTATO", "MANGO", "ELDERBERRY"].includes(ingredient))
      adjustment += 2000;
  }
  if (config.selectedVegetables.length === 3) adjustment += 1000;
  if (product.cream && config.creamType === "PLANTBASEDMILK")
    adjustment += 3000;
  const divisor =
    product.category === "small" ? 3 : product.category === "midi" ? 2 : 1;
  const roundedAdjustment = Math.round(adjustment / divisor / 500) * 500;
  // Photo is offered only when the administrator enables it for this cake.
  const photoExtra =
    config.designType === "CUSTOM_PHOTO" &&
    product.designs.includes("CUSTOM_PHOTO")
      ? 5000
      : 0;
  return (
    Math.round(
      Math.max(0, product.price + roundedAdjustment + photoExtra) * 100,
    ) / 100
  );
}
export function toggleCakeIngredient(current: string[], key: string): string[] {
  if (current.includes(key))
    return current.length === 1
      ? current
      : current.filter((item) => item !== key);
  const grains = ["RICE", "WHEAT", "OATS"];
  let next = grains.includes(key)
    ? current.filter((item) => !grains.includes(item))
    : [...current];
  if (next.length >= 3) next = next.slice(1);
  return [...next, key];
}
