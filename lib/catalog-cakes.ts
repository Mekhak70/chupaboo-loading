import { supabase } from "@/lib/supabase";
import { normalizeCake, type CatalogCake } from "@/lib/cake-config";
export type { CatalogCake } from "@/lib/cake-config";
const fields = "id,name,price,image_path,cake_size,has_cream,design_types,standard_text,is_active,is_featured,sort_order,created_at";
const publicImageUrl = (path: string) => supabase.storage.from("catalog-images").getPublicUrl(path).data.publicUrl;
export async function getCatalogCakes(signal?: AbortSignal): Promise<CatalogCake[]> {
  const result: CatalogCake[] = [];
  for (let offset=0;;offset+=500) {
    let query = supabase.from("catalog_products").select(fields)
      .eq("section","cake").eq("is_active",true)
      .order("sort_order",{ascending:true}).order("created_at",{ascending:true}).order("id")
      .range(offset,offset+499);
    if (signal) query = query.abortSignal(signal);
    const { data,error } = await query;
    if (error) throw new Error(error.message);
    result.push(...(data??[]).map(row => normalizeCake(row,publicImageUrl)));
    if (!data || data.length<500) break;
  }
  return result;
}
export async function getCatalogCake(id:string, signal?:AbortSignal):Promise<CatalogCake|null> {
  // Admin generates UUID IDs. Old Sheet slugs are not database IDs.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  let query = supabase.from("catalog_products").select(fields).eq("section","cake")
    .eq("is_active",true).eq("id",id);
  if(signal)query=query.abortSignal(signal);
  const {data,error}=await query.maybeSingle();
  if(error)throw new Error(error.message);
  return data?normalizeCake(data,publicImageUrl):null;
}
