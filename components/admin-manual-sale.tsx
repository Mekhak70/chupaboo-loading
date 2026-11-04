"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { money, today, errorText, type SaleSection } from "@/lib/finance";

type ManualItem = {
  key: string; productId: string; section: SaleSection; name: string;
  quantity: string; price: string; cost: string; notes: string;
};
type CatalogItem = { id: string; name: string; section: SaleSection; price: number; cost: number | null };
const sourceLabels = { instagram: "Instagram", phone: "Հեռախոս", whatsapp: "WhatsApp", telegram: "Telegram", in_person: "Տեղում", other: "Այլ" };
const sectionLabels: Record<SaleSection,string> = { cake:"Տորթ", party:"PartyShop", available:"Առկա տեսականի" };
const input = "mt-2 block w-full min-w-0 rounded-xl border border-purple-200 bg-white p-3 text-sm";
function newItem(section: SaleSection = "cake"): ManualItem {
  return { key: crypto.randomUUID(), productId:"", section, name:"", quantity:"1", price:"", cost:"", notes:"" };
}
function normalizedMoney(text: string) { return Math.round(Number(text)*100)/100; }
export function AdminManualSale({ onSaved, onCancel, onBusyChange }: {
  onSaved: (date: string) => void; onCancel: () => void; onBusyChange: (busy:boolean) => void;
}) {
  const [saleDate,setSaleDate]=useState(today);
  const [orderMonth,setOrderMonth]=useState(()=>today().slice(0,7));
  const [address,setAddress]=useState("");const [nationality,setNationality]=useState("");
  const [source,setSource]=useState<keyof typeof sourceLabels>("instagram");
  const [phone,setPhone]=useState("");const [notes,setNotes]=useState("");const [deliveryFee,setDeliveryFee]=useState("0");
  // Create UUIDs on user actions or on submit, not while server-rendering.
  const [items,setItems]=useState<ManualItem[]>([{key:"initial",productId:"",section:"cake",name:"",quantity:"1",price:"",cost:"",notes:""}]);
  const [catalog,setCatalog]=useState<CatalogItem[]>([]);const [catalogLoading,setCatalogLoading]=useState(true);
  const [catalogError,setCatalogError]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  const lock=useRef(false);const attempt=useRef<{payload:string;id:string}|null>(null);
  useEffect(()=>{
    let active=true;
    async function load(){
      try{
        const products: CatalogItem[]=[];const costs=new Map<string,number>();
        for(let offset=0;;offset+=500){
          const {data,error}=await supabase.from("catalog_products").select("id,name,section,price")
            .order("name").order("id").range(offset,offset+499);
          if(error)throw error;
          products.push(...(data??[]).map(row=>({id:String(row.id),name:String(row.name),section:row.section as SaleSection,price:Number(row.price),cost:null})));
          if(!data||data.length<500)break;
        }
        for(let offset=0;;offset+=500){
          const {data,error}=await supabase.from("finance_product_costs").select("product_id,unit_cost")
            .order("product_id").range(offset,offset+499);
          if(error)throw error;for(const row of data??[])costs.set(String(row.product_id),Number(row.unit_cost));
          if(!data||data.length<500)break;
        }
        if(active)setCatalog(products.map(row=>({...row,cost:costs.get(row.id)??null})));
      }catch(error){if(active)setCatalogError(`Կատալոգի բեռնումը չհաջողվեց․ ${errorText(error)} Անունն ու գինը կարող ես լրացնել ձեռքով։`);}
      finally{if(active)setCatalogLoading(false);}
    }
    void load();return()=>{active=false;};
  },[]);
  const patch=(key:string,values:Partial<ManualItem>)=>setItems(old=>old.map(item=>item.key===key?{...item,...values}:item));
  const productTotal=items.reduce((sum,item)=>sum+(Number.isFinite(Number(item.price))&&Number.isFinite(Number(item.quantity))?Math.round(Number(item.price)*100)*Number(item.quantity):0),0)/100;
  const fee=Number.isFinite(Number(deliveryFee))?normalizedMoney(deliveryFee):0;
  async function save(event:FormEvent){
    event.preventDefault();if(lock.current)return;setError("");
    const parsedDate=new Date(`${saleDate}T00:00:00Z`);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(saleDate)||!Number.isFinite(parsedDate.getTime())||parsedDate.toISOString().slice(0,10)!==saleDate){setError("Ընտրիր ճիշտ ամսաթիվ։");return;}
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(orderMonth)){setError("Ընտրիր ճիշտ ամիս։");return;}
    if(!deliveryFee.trim()||!Number.isFinite(Number(deliveryFee))||Number(deliveryFee)<0||Number(deliveryFee)>9999999999.99){setError("Մուտքագրիր ճիշտ առաքման գումար։");return;}
    if(items.length===0&&fee<=0){setError("Ավելացրու առնվազն մեկ ապրանք կամ առաքման գումար։");return;}
    for(const item of items){
      if(!item.name.trim()||!item.price.trim()||!Number.isFinite(Number(item.price))||Number(item.price)<0||Number(item.price)>9999999999.99||!item.quantity.trim()||!Number.isSafeInteger(Number(item.quantity))||Number(item.quantity)<1||Number(item.quantity)>10000){setError("Յուրաքանչյուր ապրանքի համար լրացրու անունը, ճիշտ գինը և ամբողջ քանակը։");return;}
      if(item.section==="party"&&item.cost.trim()&&(!Number.isFinite(Number(item.cost))||Number(item.cost)<0||Number(item.cost)>9999999999.99)){setError("Մուտքագրիր ճիշտ ինքնարժեք։");return;}
    }
    if(!Number.isFinite(productTotal)||productTotal>999999999999.99){setError("Վաճառքի ընդհանուր գումարը չափազանց մեծ է։");return;}
    const payload={saleDate,month:orderMonth,address:address.trim(),nationality:nationality.trim(),source,phone:phone.trim(),notes:notes.trim(),deliveryFee:fee,
      items:items.map(item=>({product_id:item.productId||null,section:item.section,name:item.name.trim(),quantity:Number(item.quantity),unit_price:normalizedMoney(item.price),unit_cost:item.section==="party"&&item.cost.trim()?normalizedMoney(item.cost):null,notes:item.notes.trim()}))};
    const serialized=JSON.stringify(payload);
    if(attempt.current?.payload!==serialized)attempt.current={id:crypto.randomUUID(),payload:serialized};
    lock.current=true;setBusy(true);onBusyChange(true);
    try{
      const {data,error}=await supabase.rpc("record_manual_finance_sale",{p_id:attempt.current.id,p_payload:payload});
      if(error)throw error;
      if(!data)throw new Error("Վաճառքը չի պահպանվել։");
      attempt.current=null;onSaved(saleDate);
    }catch(error){setError(errorText(error));}
    finally{lock.current=false;setBusy(false);onBusyChange(false);}
  }
  return <form onSubmit={save} className="mb-6 rounded-3xl border border-purple-100 bg-white p-4 sm:p-6">
    <h2 className="text-xl font-bold text-[#69429a]">Ձեռքով ավելացնել վաճառք</h2>
    <p className="mt-2 text-sm text-gray-500">Գրանցիր իրական վաճառքը՝ վերջնական, զեղչից հետո գներով։ Պահպանելուց անմիջապես հետո այն կհաշվվի իտոգների մեջ։</p>
    {catalogError&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{catalogError}</p>}
    {error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <fieldset disabled={busy} className="mt-5 space-y-5 disabled:opacity-60">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Վաճառքի ամսաթիվ *<input required type="date" value={saleDate} onChange={e=>{setSaleDate(e.target.value);if(e.target.value)setOrderMonth(e.target.value.slice(0,7));}} className={input}/></label>
        <label className="text-sm">Պատվերի աղբյուր<select value={source} onChange={e=>setSource(e.target.value as typeof source)} className={input}>
          {Object.entries(sourceLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
        <label className="text-sm">Ամիս *<input required type="month" value={orderMonth} onChange={e=>setOrderMonth(e.target.value)} className={input}/></label>
        <label className="text-sm">Հասցե<input maxLength={500} value={address} onChange={e=>setAddress(e.target.value)} className={input}/></label>
        <label className="text-sm">Ազգություն<input maxLength={100} value={nationality} onChange={e=>setNationality(e.target.value)} className={input} placeholder="Օրինակ՝ հայ"/></label>
        <label className="text-sm">Հեռախոս · ոչ պարտադիր<input type="tel" maxLength={50} value={phone} onChange={e=>setPhone(e.target.value)} className={input}/></label>
        <label className="text-sm">Առաքման համար ստացված գումար · ֏<input required type="number" min="0" max="9999999999.99" step="0.01" value={deliveryFee} onChange={e=>setDeliveryFee(e.target.value)} className={input}/></label>
      </div>
      <div className="flex flex-wrap gap-2">{(Object.keys(sectionLabels) as SaleSection[]).map(section=><button key={section} type="button" disabled={items.length>=100} onClick={()=>setItems(old=>[...old,newItem(section)])} className="rounded-xl border border-purple-200 px-4 py-2 text-sm font-semibold text-[#69429a] disabled:opacity-40">+ {sectionLabels[section]}</button>)}</div>
      {items.map((item,index)=><section key={item.key} className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4">
        <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-semibold">{index+1}. {sectionLabels[item.section]}</h3>
          <button type="button" onClick={()=>setItems(old=>old.filter(row=>row.key!==item.key))} className="text-sm text-red-600">Հեռացնել</button></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Բաժին<select value={item.section} onChange={e=>patch(item.key,{section:e.target.value as SaleSection,productId:"",cost:""})} className={input}>{Object.entries(sectionLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
          <label className="text-sm">Կատալոգից ընտրել · ոչ պարտադիր<select value={item.productId} disabled={catalogLoading} className={input} onChange={e=>{
            const product=catalog.find(row=>row.id===e.target.value);
            patch(item.key,product?{productId:product.id,name:product.name,price:String(product.price),cost:product.cost===null?"":String(product.cost)}:{productId:"",cost:""});
          }}><option value="">{catalogLoading?"Բեռնվում է…":"Լրացնել ձեռքով"}</option>{catalog.filter(product=>product.section===item.section).map(product=><option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
          <label className="text-sm">Ապրանքի անուն *<input required maxLength={200} value={item.name} onChange={e=>patch(item.key,{name:e.target.value})} className={input}/></label>
          <label className="text-sm">Վաճառքի գին · ֏ / մեկ հատ *<input required type="number" min="0" max="9999999999.99" step="0.01" value={item.price} onChange={e=>patch(item.key,{price:e.target.value})} className={input}/></label>
          <label className="text-sm">Քանակ *<input required type="number" min="1" max="10000" step="1" value={item.quantity} onChange={e=>patch(item.key,{quantity:e.target.value})} className={input}/></label>
          {item.section==="party"&&<><label className="text-sm">Ինքնարժեք · ֏ / մեկ հատ<input type="number" min="0" max="9999999999.99" step="0.01" value={item.cost} onChange={e=>patch(item.key,{cost:e.target.value})} className={input}/></label><span className="text-xs text-gray-500 sm:col-span-2">Դատարկ ինքնարժեքի դեպքում օգտագործվում է կատալոգում եղած արժեքը, եթե ապրանքը ընտրված է։ Առանց կատալոգի ինքնարժեքը կմնա չնշված։</span></>}
          <label className="text-sm sm:col-span-2">Ապրանքի մանրամասներ · ոչ պարտադիր<input maxLength={1000} value={item.notes} onChange={e=>patch(item.key,{notes:e.target.value})} className={input} placeholder="Տորթի բաղադրություն, չափս, դիզայն կամ այլ տվյալներ"/></label>
        </div>
        <p className="mt-3 font-semibold text-[#69429a]">Ապրանքի ընդհանուր՝ {money((Number(item.price)||0)*(Number(item.quantity)||0))}</p>
      </section>)}
      {items.length===0&&<p className="text-sm text-gray-500">Կարող ես գրանցել միայն առաքում՝ լրացնելով վերևի առաքման գումարը։</p>}
      <label className="block text-sm">Պատվերի նշումներ<textarea rows={2} maxLength={2000} value={notes} onChange={e=>setNotes(e.target.value)} className={input}/></label>
      <div className="rounded-xl bg-purple-50 p-4 text-sm"><p>Ապրանքներ՝ {money(productTotal)}</p><p className="mt-1">Առաքում՝ {money(fee)}</p><p className="mt-2 text-lg font-bold text-[#69429a]">Ընդհանուր՝ {money(productTotal+fee)}</p></div>
      <div className="flex flex-wrap gap-3"><button type="submit" className="rounded-xl bg-[#69429a] px-5 py-3 font-semibold text-white">{busy?"Պահպանվում է…":"Պահպանել վաճառքը"}</button>
        <button type="button" onClick={onCancel} className="rounded-xl border px-5 py-3">Չեղարկել</button></div>
    </fieldset>
  </form>;
}
