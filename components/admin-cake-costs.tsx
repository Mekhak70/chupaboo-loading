"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { COST_INGREDIENT_GROUPS,costIngredientGrams,filterCostIngredients,type CostIngredientGroup,type CostIngredientStatus } from "@/lib/cost-ingredient-search";
import { money, errorText } from "@/lib/finance";
import { randomId } from "@/lib/random-id";
import { COST_SIZES,FIXED_COSTS,defaultCakeCosts,validateCakeCosts,calculateCakeCost,type CakeCostSettings,type CostSize,type FixedCost,type CostProfile } from "@/lib/cake-cost";
const input="mt-1 block w-full min-w-0 rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm";
function NumberField({value,onChange,label,grams=false}:{value:number|null;onChange:(value:number|null)=>void;label:string;grams?:boolean}) {
  return <input aria-label={label} type="number" min="0" max={grams?1000000:100000000} step={grams?"0.001":"0.01"} placeholder="Չի լրացվել" value={value??""} onChange={event=>onChange(event.target.value===""?null:event.target.valueAsNumber)} className={input}/>;
}
export function AdminCakeCosts() {
  const [data,setData]=useState<CakeCostSettings>(defaultCakeCosts);
  const [saved,setSaved]=useState("");const [version,setVersion]=useState<number|null>(null);
  const [size,setSize]=useState<CostSize>("MINI");const [photo,setPhoto]=useState(false);const [count,setCount]=useState(2);
  const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);const lock=useRef(false);
  const [error,setError]=useState("");const [message,setMessage]=useState("");
  const [search,setSearch]=useState("");const [group,setGroup]=useState<CostIngredientGroup>("all");
  const [status,setStatus]=useState<CostIngredientStatus>("all");const [editingIngredient,setEditingIngredient]=useState<string|null>(null);
  const [newName,setNewName]=useState("");const [newCategory,setNewCategory]=useState<"meat"|"other">("other");
  useEffect(()=>{let active=true;void(async()=>{
    try{const {data:row,error}=await supabase.from("finance_cake_cost_settings").select("settings,version").eq("id",true).single();if(error)throw error;validateCakeCosts(row.settings);if(active){setData(row.settings);setSaved(JSON.stringify(row.settings));setVersion(row.version);}}
    catch(error){if(active)setError(errorText(error));}finally{if(active)setLoading(false);}
  })();return()=>{active=false;};},[]);
  const profile=data.profiles[size];
  const result=calculateCakeCost(data,size,size!=="DONUT"&&photo);
  const dirty=JSON.stringify(data)!==saved;
  const shownIngredients=filterCostIngredients(data.ingredients,profile,search,group,status,editingIngredient);
  const clearFilters=()=>{setSearch("");setGroup("all");setStatus("all");};
  const patchProfile=(values:Partial<CostProfile>)=>{setMessage("");setData(old=>({...old,profiles:{...old.profiles,[size]:{...old.profiles[size],...values}}}));};
  const patchPrice=(id:string,value:number|null)=>{setMessage("");setData(old=>({...old,ingredients:old.ingredients.map(item=>item.id===id?{...item,pricePerKg:value}:item)}));};
  async function save(event:FormEvent){event.preventDefault();if(lock.current||version===null)return;setError("");setMessage("");
    try{validateCakeCosts(data);}catch(error){setError(errorText(error));return;}
    lock.current=true;setSaving(true);
    try{const {data:row,error}=await supabase.from("finance_cake_cost_settings").update({settings:data}).eq("id",true).eq("version",version).select("version").maybeSingle();if(error)throw error;if(!row)throw Error("Կարգավորումները փոխվել են մեկ այլ պատուհանում։ Վերաբացիր էջը՝ թարմ տարբերակը բեռնելու համար։");setVersion(row.version);setSaved(JSON.stringify(data));setMessage("Մթերքների գներն ու բոլոր չափերի ծախսերը պահպանվեցին։");}
    catch(error){setError(errorText(error));}finally{lock.current=false;setSaving(false);}
  }
  function addIngredient(){const name=newName.trim();if(!name||data.ingredients.length>=100)return;setData(old=>({...old,ingredients:[...old.ingredients,{id:`custom-${randomId()}`,name,category:newCategory,pricePerKg:null}]}));setNewName("");setMessage("");clearFilters();setSearch(name);}
  if(loading)return <p role="status">Բեռնվում են ինքնարժեքի կարգավորումները…</p>;
  return <form onSubmit={save}>
    <div className="mb-5 rounded-2xl bg-white p-5 text-sm leading-6 text-gray-600">
      <p>Մթերքի ծախսը = կիլոգրամի գին × օգտագործված գրամներ ÷ 1000։ Կիլոգրամի գները ընդհանուր են, իսկ գրամներն ու մյուս ծախսերը՝ առանձին յուրաքանչյուր չափի համար։</p>
      <p className="mt-2">Լուսանկարով դիզայնի պատրաստման ծախսը փոխարինում է սովորական թխելու արժեքին։ Դոնաթի ծախսերը լրացրու մեկ հատի համար։ Չլրացված գինը չի համարվում զրո։</p>
    </div>
    {error&&<p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {message&&<p role="status" className="mb-4 rounded-xl bg-green-50 p-4 text-green-800">{message}</p>}
    <fieldset disabled={saving||version===null} className="space-y-6 disabled:opacity-60">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2" aria-label="Տորթի չափը">{(Object.keys(COST_SIZES) as CostSize[]).map(key=><button key={key} type="button" aria-pressed={size===key} onClick={()=>{setSize(key);setPhoto(false);}} className={`rounded-xl border px-5 py-3 font-semibold ${size===key?"border-[#69429a] bg-[#69429a] text-white":"border-purple-100 bg-white text-[#69429a]"}`}>{COST_SIZES[key]}</button>)}</div>
        <div className="flex flex-wrap items-center gap-3"><span className="text-xs text-gray-500">{dirty?"Կան չպահպանված փոփոխություններ":"Պահպանված է"}</span><button type="submit" className="rounded-xl bg-[#69429a] px-5 py-3 font-semibold text-white">{saving?"Պահպանվում է…":"Պահպանել բոլոր կարգավորումները"}</button></div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-3xl bg-white p-5">
            <h2 className="mb-4 text-xl font-bold text-[#69429a]">{COST_SIZES[size]} · փաթեթավորում և պատրաստում {size==="DONUT"?"/ 1 հատ":""}</h2>
            <div className="grid gap-4 sm:grid-cols-2">{(Object.keys(FIXED_COSTS) as FixedCost[]).map(key=><label key={key} className="text-sm">{FIXED_COSTS[key]} · ֏<NumberField value={profile.fixed[key]} label={FIXED_COSTS[key]} onChange={value=>patchProfile({fixed:{...profile.fixed,[key]:value}})}/></label>)}
              {size!=="DONUT"&&<label className="text-sm">Լուսանկարով պատրաստում · ֏<NumberField value={profile.photoPreparation} label="Լուսանկարով պատրաստում" onChange={value=>patchProfile({photoPreparation:value})}/></label>}
            </div>
            <p className="mt-3 text-xs leading-5 text-gray-500">Միջինի ու ստանդարտի տոպրակի ծախսը դրված է 0, քանի որ այն նշված չէր։ Եթե կրեմն այստեղ ֆիքսված արժեքով ես հաշվում, ներքևում կրեմի գրամները թող 0՝ կրկնակի չգումարելու համար։</p>
          </section>
          <section className="rounded-3xl bg-white p-5">
            <h2 className="mb-4 text-xl font-bold text-[#69429a]">Մթերքներ · {COST_SIZES[size]}</h2>
            <div className="mb-5 grid gap-4 rounded-xl bg-purple-50 p-4 sm:grid-cols-3">
              <label className="text-sm">Մսի տեսակը<select value={profile.meatId} onChange={event=>patchProfile({meatId:event.target.value})} className={input}>{data.ingredients.filter(item=>item.category==="meat").map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="text-sm">Միս · գրամ<NumberField grams value={profile.meatGrams} label="Մսի գրամները" onChange={value=>patchProfile({meatGrams:value})}/></label>
              <label className="text-sm">Մսի կգ-ի գին · ֏<NumberField value={data.ingredients.find(item=>item.id===profile.meatId)?.pricePerKg??null} label="Մսի կիլոգրամի գինը" onChange={value=>patchPrice(profile.meatId,value)}/></label>
            </div>
            <p className="mb-4 text-sm text-gray-500">Չօգտագործվող մթերքի գրամները թող 0։ Օրինակ՝ 1000 դրամ/կգ կարտոֆիլ × 50 գ = 50 դրամ։</p>
            <div className="sticky top-20 z-20 mb-3 rounded-2xl border border-purple-100 bg-white/95 p-3 shadow-sm backdrop-blur-md">
              <div className="flex gap-2"><label className="min-w-0 flex-1 text-sm font-semibold text-[#69429a]">Գտնել մթերքը<input type="search" onKeyDown={event=>{if(event.key==="Enter")event.preventDefault();}} value={search} onChange={event=>setSearch(event.target.value)} placeholder="Գրիր անունը, օրինակ՝ կարտոֆիլ, հավ…" className={input}/></label>{(search||group!=="all"||status!=="all")&&<button type="button" onClick={clearFilters} className="self-end rounded-xl border border-purple-200 px-3 py-2 text-xs text-[#69429a]">Մաքրել</button>}</div>
              <div className="mt-3 flex flex-wrap gap-2" aria-label="Մթերքների խմբեր">{(Object.entries(COST_INGREDIENT_GROUPS) as [CostIngredientGroup,string][]).map(([key,label])=><button key={key} type="button" aria-pressed={group===key} onClick={()=>setGroup(key)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${group===key?"border-[#69429a] bg-[#69429a] text-white":"border-purple-100 bg-white text-[#69429a]"}`}>{label}</button>)}</div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-purple-50 pt-3" aria-label="Մթերքների ֆիլտրեր">{([["all","Բոլոր մթերքները"],["unpriced","Գինը չլրացված"],["used","Օգտագործվող"]] as [CostIngredientStatus,string][]).map(([key,label])=><button key={key} type="button" aria-pressed={status===key} onClick={()=>setStatus(key)} className={`rounded-lg px-3 py-1.5 text-xs ${status===key?"bg-purple-100 font-bold text-[#69429a]":"bg-gray-50 text-gray-500"}`}>{label}</button>)}<span className="text-xs text-gray-400" aria-live="polite">{shownIngredients.length} / {data.ingredients.length} մթերք</span></div>
            </div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-2">Մթերք</th><th className="min-w-28 p-2">֏ / կգ</th><th className="min-w-28 p-2">Գրամ</th><th className="p-2">Ծախս · ֏</th></tr></thead><tbody>
              {shownIngredients.map(item=>{const grams=costIngredientGrams(item,profile);const activeMeat=item.category==="meat"&&profile.meatId===item.id;return <tr key={item.id} onFocusCapture={()=>setEditingIngredient(item.id)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setEditingIngredient(null);}} className={`border-b border-purple-50 ${(grams??0)>0?"bg-purple-50/40":""}`}><td className="p-2 font-medium">{item.name}{activeMeat&&<span className="mt-1 block text-[10px] text-[#69429a]">Ընտրված միս</span>}</td><td className="p-2"><NumberField label={`${item.name} · կգ-ի գին`} value={item.pricePerKg} onChange={value=>patchPrice(item.id,value)}/></td><td className="p-2">{item.category==="meat"&&!activeMeat?<button type="button" onClick={()=>patchProfile({meatId:item.id})} className="rounded-xl border border-purple-200 px-3 py-2 text-xs font-semibold text-[#69429a]">Օգտագործել այս միսը</button>:<NumberField grams label={`${item.name} · գրամներ`} value={grams} onChange={value=>item.category==="meat"?patchProfile({meatGrams:value}):patchProfile({grams:{...profile.grams,[item.id]:value}})}/>}</td><td className="whitespace-nowrap p-2">{(grams??0)>0?item.pricePerKg===null?"Գինը բացակայում է":money(Math.round(item.pricePerKg*(grams??0)/1000*100)/100):"—"}</td></tr>;})}
              {shownIngredients.length===0&&<tr><td colSpan={4} className="px-3 py-8 text-center text-gray-500"><p>Այս որոնմամբ մթերք չգտնվեց։</p><button type="button" onClick={clearFilters} className="mt-3 font-semibold text-[#69429a]">Ցույց տալ բոլորը</button></td></tr>}
            </tbody></table></div>
          </section>
          <details className="rounded-3xl bg-white p-5"><summary className="cursor-pointer text-lg font-bold text-[#69429a]">Ավելացնել նոր մթերք</summary>

            <div className="mt-5 grid gap-3 rounded-xl bg-purple-50 p-4 sm:grid-cols-3"><label className="text-sm">Նոր մթերքի անուն<input maxLength={100} value={newName} onChange={e=>setNewName(e.target.value)} className={input} placeholder="Օրինակ՝ ձու"/></label><label className="text-sm">Խումբ<select value={newCategory} onChange={e=>setNewCategory(e.target.value as "meat"|"other")} className={input}><option value="other">Այլ մթերք</option><option value="meat">Միս</option></select></label><button disabled={!newName.trim()||data.ingredients.length>=100} type="button" onClick={addIngredient} className="self-end rounded-xl bg-[#69429a] px-4 py-2 text-white disabled:opacity-40">+ Ավելացնել մթերք</button></div>
          </details>
        </div>
        <aside className="rounded-3xl border border-purple-100 bg-white p-5 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-[#69429a]">Ինքնարժեքի հաշվարկ</h2>
          {size!=="DONUT"&&<div className="my-4 flex flex-wrap gap-2">{[false,true].map(value=><button key={String(value)} type="button" aria-pressed={photo===value} onClick={()=>setPhoto(value)} className={`rounded-xl border px-3 py-2 text-sm ${photo===value?"border-[#69429a] bg-[#69429a] text-white":"border-purple-200 text-[#69429a]"}`}>{value?"Կենդանու լուսանկարով":"Ստանդարտ / գրվածքով"}</button>)}</div>}
          <dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt>Փաթեթավորում և պատրաստում</dt><dd>{money(result.fixed)}</dd></div><div className="flex justify-between gap-3"><dt>Մթերքներ</dt><dd>{money(result.ingredients)}</dd></div></dl>
          <p className="mt-5 border-t pt-4 text-sm text-gray-500">{result.complete?"Ինքնարժեք":"Հայտնի ծախսերի գումար"}{size==="DONUT"?" · 1 դոնաթ":" · 1 տորթ"}</p><p className="mt-2 text-3xl font-bold text-[#69429a]" aria-live="polite">{money(result.total)}</p>
          {!result.complete&&<div role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-800"><strong>Հաշվարկը դեռ ամբողջական չէ։ Լրացրու՝</strong><ul className="mt-1 list-inside list-disc">{result.missing.map(name=><li key={name}>{name}</li>)}</ul></div>}
          {size==="DONUT"&&<div className="mt-5 rounded-xl bg-purple-50 p-4"><label className="text-sm">Բոքսի դոնաթների քանակ<select value={count} onChange={event=>setCount(Number(event.target.value))} className={input}>{[2,4,6].map(n=><option key={n} value={n}>{n} հատ</option>)}</select></label><p className="mt-3 font-bold text-[#69429a]">{count} հատի {result.complete?"ինքնարժեքը":"հայտնի ծախսերը"}՝ {money(Math.round(result.total*count*100)/100)}</p><p className="mt-2 text-xs leading-5 text-gray-500">Մեկ դոնաթի ամբողջ ծախսը բազմապատկվում է քանակով։</p></div>}
          <details className="mt-5 text-sm"><summary className="cursor-pointer text-[#69429a]">Հաշվարկի մանրամասները</summary><dl className="mt-3 space-y-2">{result.lines.map((line,index)=><div key={index} className="flex justify-between gap-3 border-b pb-2"><dt>{line.name}{line.grams!==undefined&&<span className="block text-xs text-gray-400">{line.pricePerKg} ֏/կգ × {line.grams} գ ÷ 1000</span>}</dt><dd className="whitespace-nowrap">{money(line.amount)}</dd></div>)}</dl></details>
        </aside>
      </div>
    </fieldset>
    <div className="sticky bottom-3 z-30 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-white/95 p-3 shadow-lg backdrop-blur-md"><span className="text-sm text-gray-500">{dirty?"Կան չպահպանված փոփոխություններ":"Բոլոր փոփոխությունները պահպանված են"}</span><button disabled={saving||version===null} type="submit" className="rounded-xl bg-[#69429a] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving?"Պահպանվում է…":"Պահպանել փոփոխությունները"}</button></div>
  </form>;
}
