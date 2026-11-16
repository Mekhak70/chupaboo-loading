"use client";
import { useEffect,useRef,useState,type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { INGREDIENT_GROUPS,INGREDIENT_KEYS,parseIngredientPrices,type IngredientPrices } from "@/lib/ingredient-pricing";

type CakeRow={id:string;name:string;cake_size:string;has_cream:boolean;ingredient_prices:IngredientPrices|null};
const errorText=(value:unknown)=>value&&typeof value==='object'&&'message' in value?String(value.message):"Չհաջողվեց պահպանել գները։";
const draftFor=(cake:CakeRow):Record<string,string>=>Object.fromEntries(INGREDIENT_KEYS.map(key=>[key,cake.ingredient_prices?.[key]?.toString()??(!cake.has_cream&&['DAIRY','PLANTBASEDMILK','PLANTBASED'].includes(key)?'0':'')]));
const sizes:Record<string,string>={MINI:'Մինի',MIDI:'Միդի',STANDARD:'Ստանդարտ'};
export function AdminIngredientPrices({onBusyChange}:{onBusyChange?:(busy:boolean)=>void}){
  const [cakes,setCakes]=useState<CakeRow[]>([]);
  const [id,setId]=useState('');
  const [draft,setDraft]=useState<Record<string,string>>({});
  const [enabled,setEnabled]=useState(false);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const lock=useRef(false);
  const cake=cakes.find(item=>item.id===id);
  useEffect(()=>{
    let cancelled=false;
    async function load(){
      try{
        const rows:CakeRow[]=[];
        for(let offset=0;;offset+=500){
          const {data,error}=await supabase.from('catalog_products').select('id,name,cake_size,has_cream,ingredient_prices').eq('section','cake').eq('product_kind','CAKE').order('sort_order').order('id').range(offset,offset+499);
          if(error)throw error;
          rows.push(...(data??[]) as CakeRow[]);
          if(!data||data.length<500)break;
        }
        if(cancelled)return;
        setCakes(rows);
        if(rows[0]){setId(rows[0].id);setDraft(draftFor(rows[0]));setEnabled(rows[0].ingredient_prices!==null);}
      }catch(error){if(!cancelled)setError(errorText(error));}
      finally{if(!cancelled)setLoading(false);}
    }
    void load();return()=>{cancelled=true;};
  },[]);
  function select(next:string){
    const cake=cakes.find(item=>item.id===next);if(!cake)return;
    setId(next);setDraft(draftFor(cake));setEnabled(cake.ingredient_prices!==null);setError('');setMessage('');
  }
  async function save(event:FormEvent){
    event.preventDefault();if(!cake||lock.current)return;
    setError('');setMessage('');
    let prices:IngredientPrices|null=null;
    try{
      if(enabled){
        const raw=Object.fromEntries(INGREDIENT_KEYS.map(key=>[key,draft[key]?.trim()?Number(draft[key]):null]));
        prices=parseIngredientPrices(raw)??null;
      }
    }catch(error){setError(errorText(error));return;}
    lock.current=true;setSaving(true);onBusyChange?.(true);
    try{
      let query=supabase.from('catalog_products').update({ingredient_prices:prices}).eq('id',cake.id).eq('section','cake').eq('product_kind','CAKE');
      query=cake.ingredient_prices===null?query.is('ingredient_prices',null):query.eq('ingredient_prices',JSON.stringify(cake.ingredient_prices));
      const {data,error}=await query.select('id,ingredient_prices').single();
      if(error)throw new Error(error.code==='PGRST116'?'Գնացուցակը փոխվել է մեկ այլ պատուհանից։ Թարմացրու էջը և կրկին ստուգիր։':error.message);
      if(!data)throw new Error('Գները չեն պահպանվել։');
      setCakes(previous=>previous.map(row=>row.id===cake.id?{...row,ingredient_prices:data.ingredient_prices}:row));
      setMessage(enabled?'Գները պահպանվեցին․ այս տորթի արժեքն այժմ հաշվարկվում է ընտրված բաղադրիչների գումարից։':'Վերականգնվեց այս տորթի նախկին գնային հաշվարկը։');
    }catch(error){setError(errorText(error));}
    finally{lock.current=false;setSaving(false);onBusyChange?.(false);}
  }
  return <section className="rounded-2xl border border-purple-100 bg-white p-5 sm:p-8">
    <h2 className="text-xl font-bold text-[#69429a]">Բաղադրիչների գներ</h2>
    <p className="mt-2 text-sm leading-6 text-gray-600">Յուրաքանչյուր պատվերով տորթի համար լրացրու իր չափսին համապատասխան գները։ Վերջնական արժեքը կլինի ընտրված մսի, բաղադրիչների և կրեմի գումարը։ Տորթի բազային գինը չի ավելանա։</p>
    <p className="mt-2 text-xs leading-5 text-gray-500">Անունով դիզայնը՝ +500 ֏, լուսանկարով դիզայնը՝ +5000 ֏, եթե այդ ընտրանքները միացված են տորթի համար։ Դոնաթների առանձին գները կառավարվում են ապրանքի խմբագրման բաժնում։</p>
    {loading?<p role="status" className="mt-6">Բեռնվում է…</p>:<form onSubmit={save} className="mt-6 space-y-5">
      <fieldset disabled={saving} className="space-y-5 disabled:opacity-60">
        <label className="block text-sm font-medium text-gray-700">Ընտրիր տորթը
          <select value={id} onChange={event=>select(event.target.value)} className="mt-2 w-full rounded-xl border border-purple-200 p-3">
            {!cakes.length&&<option value="">Տորթեր չկան</option>}
            {cakes.map(cake=><option key={cake.id} value={cake.id}>{cake.name} · {sizes[cake.cake_size]??cake.cake_size} · {cake.id.slice(0,8)}{cake.ingredient_prices?' · գները լրացված են':''}</option>)}
          </select>
        </label>
        {cake&&<>
          <label className="flex items-center gap-3 rounded-xl bg-purple-50 p-4 text-sm font-semibold text-[#69429a]"><input type="checkbox" checked={enabled} onChange={event=>{setEnabled(event.target.checked);setMessage('');}} className="h-4 w-4 accent-[#69429a]"/>Այս տորթի գինը հաշվել բաղադրիչների գումարով</label>
          {enabled?<>
            <p className="text-sm text-gray-600">Լրացրու բոլոր գները։ Եթե որևէ բաղադրիչի գինը ներառված է մյուսներում՝ նշիր 0։ Դատարկ դաշտերով գնացուցակը չի պահպանվի։</p>
            {INGREDIENT_GROUPS.filter(group=>cake.has_cream||group.name!=='Կրեմ').map(group=><fieldset key={group.name} className="rounded-xl border border-purple-100 p-4">
              <legend className="px-2 font-semibold text-[#69429a]">{group.name}</legend>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{group.items.map(([key,label])=><label key={key} className="block text-sm text-gray-600">{label} · ֏<input required type="number" min="0" max="100000000" step="0.01" value={draft[key]??''} onChange={event=>setDraft(previous=>({...previous,[key]:event.target.value}))} className="mt-1 w-full rounded-lg border border-purple-200 px-3 py-2 text-gray-900"/></label>)}</div>
            </fieldset>)}
          </>:<p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">Այս տորթի համար դեռ գործում է նախկին բազային գնով հաշվարկը։ Նոր հաշվարկը կմիանա միայն գները լրացնելուց և պահպանելուց հետո։</p>}
          <button type="submit" className="rounded-xl bg-[#69429a] px-6 py-3 font-semibold text-white">{saving?'Պահպանվում է…':'Պահպանել այս տորթի գները'}</button>
        </>}
      </fieldset>
    </form>}
    {error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    {message&&<p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}
  </section>;
}
