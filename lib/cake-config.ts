import { parseIngredientPrices, ingredientTotal, type IngredientPrices } from "@/lib/ingredient-pricing";
export type CakeCategory = "small" | "midi" | "standart";
export type CakeDesign = "STANDARD" | "CUSTOM_PHOTO" | "CUSTOM_TEXT" | "NAME_TEXT";
export interface DonutVariant { id:string; name:string; image:string; price?:number }
export interface CatalogCake {
  id: string; name: string; price: number; image: string; category: CakeCategory;
  cream: boolean; designs: CakeDesign[]; standardText: string; description: string;
  isFeatured: boolean;
  images?:string[];
  ingredientPrices?:IngredientPrices;
  donutThreePrice?: number;
  donutVariants?:DonutVariant[];
  productKind: "CAKE" | "DONUT_BOX";
}
export interface CakeConfiguration {
  donutVariantId?:string;
  cakeType: "MEAT" | "FRUIT" | "VEGETABLES" | "";
  creamType: "DAIRY" | "PLANTBASEDMILK" | "PLANTBASED" | "";
  selectedVegetables: string[]; selectedAnimal: string; designType: CakeDesign | "";
}
export const CATALOG_CAKE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%23f8f6fb'/%3E%3Ctext x='300' y='310' text-anchor='middle' fill='%2369429a' font-size='32'%3ECHUPABOO%3C/text%3E%3C/svg%3E";
export function normalizeCake(row: Record<string, unknown>, publicImageUrl: (path: string) => string): CatalogCake {
  const price = Number(row.price);
  if (!row.id || !row.name || !Number.isFinite(price) || price < 0) {
    throw new Error("Տորթի անունը կամ գինը սխալ է։ Ստուգիր ադմինում։");
  }
  const category: CakeCategory = row.cake_size === "MINI" ? "small" : row.cake_size === "MIDI" ? "midi" : "standart";
  const designs: CakeDesign[] = [];
  for (const raw of Array.isArray(row.design_types) ? row.design_types : []) {
    const key = raw === "CUSTOM_DESIGN" ? "CUSTOM_TEXT" : raw;
    if ((key === "STANDARD" || key === "CUSTOM_PHOTO" || key === "CUSTOM_TEXT" || key === "NAME_TEXT") && !designs.includes(key)) designs.push(key);
  }
  if (designs.length === 0) throw new Error("Տորթի համար դիզայնի տեսակ ընտրված չէ։ Ստուգիր ադմինում։");
  return { id: String(row.id), name: String(row.name), price, category,
    image: typeof row.image_path === "string" && row.image_path ? publicImageUrl(row.image_path) : CATALOG_CAKE_PLACEHOLDER,
    images: [...new Set([row.image_path, ...(Array.isArray(row.additional_image_paths)?row.additional_image_paths:[])].filter((path):path is string=>typeof path === "string" && !!path).map(publicImageUrl))],
    ingredientPrices:parseIngredientPrices(row.ingredient_prices),
    cream: row.has_cream === true, designs, standardText: typeof row.standard_text === "string" ? row.standard_text : "",
    description: typeof row.description === "string" ? row.description : "",
    donutVariants: (Array.isArray(row.donut_variants)?row.donut_variants:[]).filter((variant):variant is {id:string;name:string;image_path:string;price?:unknown}=>!!variant&&typeof variant === "object"&&typeof variant.id === "string"&&typeof variant.name === "string"&&!!variant.name.trim()&&typeof variant.image_path === "string"&&variant.image_path.startsWith("catalog/")).map(variant=>{
      const price=variant.price===undefined||variant.price===null?undefined:Number(variant.price);
      if(price!==undefined&&(!Number.isFinite(price)||price<0||price>9999999999.99))throw new Error("Դոնաթի տեսակի գինը սխալ է։ Ստուգիր ադմինում։");
      return {id:variant.id,name:variant.name,image:publicImageUrl(variant.image_path),...(price!==undefined?{price}:{})};
    }),
    donutThreePrice: Number(row.donut_three_price ?? 10000),
    productKind: row.product_kind === "DONUT_BOX" ? "DONUT_BOX" : "CAKE",
    isFeatured: row.is_featured === true };
}
// Admin price is the base price of THIS size, with chicken and two regular ingredients.
// Only option adjustments are scaled; the saved base price is never divided again.
function ingredientAdjustment(product: CatalogCake, config: CakeConfiguration): number {
  const meatExtra: Record<string,number> = { CHICKEN: 0, BEEF: 1000, LAMB: 3000, TURKEY: 7000, SALMON: 9000 };
  let adjustment = config.cakeType === "FRUIT" ? -2000 : config.cakeType === "VEGETABLES" ? -1000 : meatExtra[config.selectedAnimal] ?? 0;
  for (const ingredient of config.selectedVegetables) {
    if (["SWEET_POTATO", "MANGO", "ELDERBERRY"].includes(ingredient)) adjustment += 2000;
  }
  if (config.selectedVegetables.length === 3) adjustment += 1000;
  if (product.cream && config.creamType === "PLANTBASEDMILK") adjustment += 3000;
  const divisor = product.category === "small" ? 3 : product.category === "midi" ? 2 : 1;
  const roundedAdjustment = Math.round(adjustment / divisor / 500) * 500;
  return roundedAdjustment;
}
function designAdjustment(product: CatalogCake, design: CakeDesign | ""): number {
  if (design === "NAME_TEXT" && product.designs.includes("NAME_TEXT")) return 500;
  return design === "CUSTOM_PHOTO" && product.designs.includes("CUSTOM_PHOTO") ? 5000 : 0;
}
export function calculateCatalogCakePrice(product: CatalogCake, config: CakeConfiguration): number {
  if (product.productKind === "DONUT_BOX") {
    return calculateCatalogDonutBoxPrice(product, Array.from({length:2},()=>config), config.designType);
  }
  if(product.ingredientPrices)return Math.round((ingredientTotal(product.ingredientPrices,config,product.cream)+designAdjustment(product,config.designType))*100)/100;
  return Math.round(Math.max(0, product.price + ingredientAdjustment(product,config) + designAdjustment(product,config.designType)) * 100) / 100;
}
export function calculateCatalogCakeStartingPrice(product:CatalogCake):number{
  if(product.productKind === "DONUT_BOX")return product.price*2;
  if(!product.ingredientPrices)return product.price;
  const produce=["POTATO","CARROT","BROCCOLI","PUMPKIN","PEPPER","ZUCCHINI","CAULIFLOWER","SWEET_POTATO","SPINACH","RICE","WHEAT","OATS","APPLE","BANANA","PEAR","ELDERBERRY","STRAWBERRY","MANGO"] as const;
  const cream=product.cream?Math.min(...(["DAIRY","PLANTBASEDMILK","PLANTBASED"] as const).map(key=>product.ingredientPrices![key])):0;
  const design=Math.min(...product.designs.map(key=>designAdjustment(product,key)));
  return Math.round((Math.min(...produce.map(key=>product.ingredientPrices![key]))+cream+design)*100)/100;
}
export function calculateDonutBoxBasePrice(product: CatalogCake, count: number): number {
  if (!Number.isInteger(count) || ![2,4,6].includes(count)) throw new Error("Բոքսում պետք է լինի 2, 4 կամ 6 դոնաթ։");
  return Math.round((Math.floor(count / 3) * (product.donutThreePrice ?? 10000) + (count % 3) * product.price) * 100) / 100;
}
export function donutPairIndices(index:number):number[]{
  const first=Math.floor(index/2)*2;
  return [first,first+1];
}
export function validateDonutPairs(pieces:CakeConfiguration[]):void{
  if(![2,4,6].includes(pieces.length))throw new Error("Բոքսում պետք է լինի 2, 4 կամ 6 դոնաթ։");
  const composition=(piece:CakeConfiguration)=>JSON.stringify([piece.cakeType,piece.creamType,piece.cakeType === "MEAT" ? piece.selectedAnimal : "",[...piece.selectedVegetables].sort()]);
  for(let index=0;index<pieces.length;index+=2){
    if(composition(pieces[index])!==composition(pieces[index+1]))throw new Error(`Դոնաթ ${index+1} և ${index+2}-ի բաղադրությունները պետք է նույնը լինեն։`);
  }
}
export function calculateCatalogDonutBoxPrice(product: CatalogCake, pieces: CakeConfiguration[], _design: CakeDesign | ""): number {
  validateDonutPairs(pieces);
  const base = calculateDonutBoxBasePrice(product,pieces.length);
  const variants=pieces.map(piece=>product.donutVariants?.find(variant=>variant.id===piece.donutVariantId));
  const hasIndividualPrices=product.donutVariants?.some(variant=>variant.price!==undefined)??false;
  const total = pieces.reduce((sum,piece,index)=>sum + Math.max(0, (hasIndividualPrices?(variants[index]?.price??product.price):base / pieces.length) + ingredientAdjustment(product,piece)),0);
  return Math.round(total * 100) / 100;
}
export function toggleCakeIngredient(current: string[], key: string): string[] {
  if (current.includes(key)) return current.length === 1 ? current : current.filter(item => item !== key);
  const grains = ["RICE", "WHEAT", "OATS"];
  let next = grains.includes(key) ? current.filter(item => !grains.includes(item)) : [...current];
  if (next.length >= 3) next = next.slice(1);
  return [...next, key];
}
