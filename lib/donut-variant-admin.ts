import { randomId } from "@/lib/random-id";
import { supabase } from "@/lib/supabase";

export interface DonutVariantRecord { id:string; name:string; image_path:string; price?:number|null }
export interface DonutVariantDraft extends DonutVariantRecord { file?:File }
export const DONUT_VARIANT_LIMIT=15;
export const donutImageExtensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
export function validateDonutVariants(variants:DonutVariantDraft[]){
  if(variants.length>DONUT_VARIANT_LIMIT)throw new Error("Կարող ես ավելացնել մինչև 15 դոնաթի տեսակ։");
  if(new Set(variants.map(item=>item.id)).size!==variants.length)throw new Error("Դոնաթների տեսակների համարները կրկնվում են։");
  for(const [index,variant] of variants.entries()){
    if(variant.price!==undefined&&variant.price!==null&&(!Number.isFinite(variant.price)||variant.price<0||variant.price>9999999999.99))throw new Error(`Մուտքագրիր ${index+1}-րդ դոնաթի ճիշտ գինը։`);
    if(!variant.name.trim()||variant.name.trim().length>100)throw new Error(`Լրացրու դոնաթի ${index+1}-րդ տեսակի անունը՝ մինչև 100 նիշ։`);
    if(!variant.file&&!variant.image_path.startsWith("catalog/"))throw new Error(`Ընտրիր դոնաթի ${index+1}-րդ տեսակի նկարը։`);
    if(variant.file&&(!donutImageExtensions[variant.file.type]||!variant.file.size||variant.file.size>5*1024*1024))throw new Error("Նկարները պետք է լինեն JPG/PNG/WebP և մինչև 5 MB։");
  }
}
export async function uploadDonutVariants(variants:DonutVariantDraft[],uploadedPaths:string[]):Promise<DonutVariantRecord[]>{
  validateDonutVariants(variants);
  const result:DonutVariantRecord[]=[];
  for(const variant of variants){
    let path=variant.image_path;
    if(variant.file){
      path=`catalog/${randomId()}.${donutImageExtensions[variant.file.type]}`;
      const {error}=await supabase.storage.from("catalog-images").upload(path,variant.file,{contentType:variant.file.type,upsert:false});
      if(error)throw error;
      uploadedPaths.push(path);
    }
    result.push({id:variant.id,name:variant.name.trim(),image_path:path,...(variant.price!==undefined&&variant.price!==null?{price:Math.round(variant.price*100)/100}:{})});
  }
  return result;
}
