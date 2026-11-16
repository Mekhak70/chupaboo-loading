"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DONUT_VARIANT_LIMIT,donutImageExtensions,type DonutVariantDraft } from "@/lib/donut-variant-admin";

export function DonutVariantsEditor({value,onChange}:{value:DonutVariantDraft[];onChange:(value:DonutVariantDraft[])=>void}){
  const [previews,setPreviews]=useState<Record<string,string>>({});
  const [error,setError]=useState("");
  useEffect(()=>{
    const urls=Object.fromEntries(value.filter(item=>item.file).map(item=>[item.id,URL.createObjectURL(item.file!)]));
    setPreviews(urls);return()=>Object.values(urls).forEach(url=>URL.revokeObjectURL(url));
  },[value]);
  const patch=(id:string,change:Partial<DonutVariantDraft>)=>onChange(value.map(item=>item.id===id?{...item,...change}:item));
  return <fieldset className="space-y-4 rounded-2xl border border-purple-200 p-4">
    <legend className="px-2 font-semibold text-[#69429a]">Բոքսի դոնաթների տեսակները · {value.length}/{DONUT_VARIANT_LIMIT}</legend>
    <p className="text-sm text-gray-600">Ավելացրու մեկ դոնաթի անունը, նկարը և գինը։ Գնորդը կկարողանա այս տեսակներից հավաքել 2, 4 կամ 6 հատանոց բոքս՝ նաև նույն տեսակը կրկնելով։</p>
    <label className="block text-sm font-medium text-[#69429a]">Ավելացնել մի քանի նկար միանգամից
      <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={event=>{
        const files=Array.from(event.target.files??[]);event.target.value="";
        if(files.length+value.length>DONUT_VARIANT_LIMIT){setError("Ընդամենը կարելի է ավելացնել մինչև 15 տեսակ։");return;}
        if(files.some(file=>!donutImageExtensions[file.type]||!file.size||file.size>5*1024*1024)){setError("Նկարները պետք է լինեն JPG/PNG/WebP և մինչև 5 MB։");return;}
        setError("");onChange([...value,...files.map(file=>({id:crypto.randomUUID(),name:file.name.replace(/\.[^.]+$/,""),image_path:"",file}))]);
      }}/>
    </label>
    {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {value.map((item,index)=><div key={item.id} className="space-y-2 rounded-xl border border-purple-100 bg-white p-3">
        {(previews[item.id]||item.image_path)?<img src={previews[item.id]||supabase.storage.from("catalog-images").getPublicUrl(item.image_path).data.publicUrl} alt={item.name||`Տեսակ ${index+1}`} className="aspect-square w-full rounded-lg bg-purple-50 object-contain"/>:<div className="flex aspect-square items-center justify-center rounded-lg bg-purple-50 text-sm text-gray-400">Ընտրիր նկարը</div>}
        <label className="block text-xs text-gray-600">Տեսակի անունը<input required maxLength={100} value={item.name} onChange={event=>patch(item.id,{name:event.target.value})} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/></label>
        <label className="block text-xs text-gray-600">Մեկ դոնաթի գին · ֏
          <input type="number" min="0" max="9999999999.99" step="0.01" value={item.price??""} placeholder="Ապրանքի ընդհանուր գինը" onChange={event=>patch(item.id,{price:event.target.value===""?null:event.target.valueAsNumber})} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/>
        </label>
        <input type="file" aria-label={`Փոխել ${index+1}-րդ տեսակի նկարը`} accept="image/jpeg,image/png,image/webp" className="block w-full text-xs" onChange={event=>{const file=event.target.files?.[0];if(!file)return;if(!donutImageExtensions[file.type]||!file.size||file.size>5*1024*1024){setError("Նկարը պետք է լինի JPG/PNG/WebP և մինչև 5 MB։");event.target.value="";return;}setError("");patch(item.id,{file});}}/>
        <button type="button" onClick={()=>onChange(value.filter(variant=>variant.id!==item.id))} className="text-xs text-red-600">Հեռացնել տեսակը</button>
      </div>)}
    </div>
    <button type="button" disabled={value.length>=DONUT_VARIANT_LIMIT} onClick={()=>onChange([...value,{id:crypto.randomUUID(),name:"",image_path:""}])} className="rounded-xl border border-purple-200 px-4 py-2 text-sm font-medium text-[#69429a] disabled:opacity-40">+ Ավելացնել տեսակ</button>
    <p className="text-xs text-gray-500">Դատարկ գնի դեպքում կիրառվում է ապրանքի մեկ դոնաթի գինը։ Եթե որևէ տեսակ ունի առանձին գին, բոքսի գինը գումարվում է հատիկների գներից․ 3 հատի փաթեթային գինը չի կիրառվում։</p>
    <p className="text-xs text-gray-500">Փոփոխությունները կպահպանվեն ապրանքի «Պահպանել» կոճակը սեղմելուց հետո։</p>
  </fieldset>;
}
