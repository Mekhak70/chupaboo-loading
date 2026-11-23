"use client";
import { useRef, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { errorText, money, type FinanceOrder } from "@/lib/finance";
const input="mt-1 block w-full rounded-xl border border-purple-200 p-3 text-sm";
const sectionNames={cake:"Տորթ",available:"Առկա տորթ",party:"Փարթի շոփ"};
export function AdminOrderEdit({order,onSaved,onCancel,onBusyChange}:{order:FinanceOrder;onSaved:(date:string)=>void;onCancel:()=>void;onBusyChange:(busy:boolean)=>void}) {
  const info=order.delivery_info??{};
  const [phone,setPhone]=useState(order.phone);
  const [date,setDate]=useState(String(info.deliveryDate||order.business_date));
  const [address,setAddress]=useState(String(info.deliveryAddress||""));
  const [nationality,setNationality]=useState(String(info.nationality||""));
  const [notes,setNotes]=useState(String(info.notes||""));
  const [delivery,setDelivery]=useState(String(order.delivery_fee));
  const [items,setItems]=useState(()=>order.items.map(item=>({...item,price:String(item.unit_price),count:String(item.quantity),cost:item.unit_cost===null?"":String(item.unit_cost)})));
  const [error,setError]=useState("");const [busy,setBusy]=useState(false);const lock=useRef(false);
  const total=(section:"cake"|"party")=>items.filter(item=>section==="cake"?item.section!=="party":item.section==="party").reduce((sum,item)=>sum+Math.round(Number(item.price||0)*100)*Number(item.count||0),0)/100;
  async function save(event:FormEvent){
    event.preventDefault();if(lock.current)return;setError("");
    if(!delivery.trim()||!Number.isFinite(Number(delivery))||Number(delivery)<0){setError("Մուտքագրիր ճիշտ առաքման գումար։");return;}
    for(const item of items){
      if(!item.name.trim()||!item.price.trim()||!Number.isFinite(Number(item.price))||Number(item.price)<0||!Number.isSafeInteger(Number(item.count))||Number(item.count)<1||Number(item.count)>10000||item.cost!==""&&(!Number.isFinite(Number(item.cost))||Number(item.cost)<0)){
        setError("Լրացրու ապրանքների անունները, գները և ճիշտ քանակները։");return;
      }
    }
    lock.current=true;setBusy(true);onBusyChange(true);
    try{
      const {error}=await supabase.rpc("edit_finance_order",{p_id:order.id,p_expected_updated_at:order.updated_at,p_payload:{
        phone,address,nationality,notes,deliveryDate:date,deliveryFee:Number(delivery),
        items:items.map(item=>({name:item.name,quantity:Number(item.count),unit_price:Number(item.price),unit_cost:item.section==="party"&&item.cost!==""?Number(item.cost):null})),
      }});
      if(error)throw error;onSaved(date);
    }catch(error){setError(errorText(error));}
    finally{lock.current=false;setBusy(false);onBusyChange(false);}
  }
  const patch=(index:number,values:Partial<typeof items[number]>)=>setItems(old=>old.map((item,i)=>i===index?{...item,...values}:item));
  return <form onSubmit={save} className="mb-6 rounded-3xl border-2 border-purple-200 bg-white p-5">
    <h2 className="text-xl font-bold text-[#69429a]">Խմբագրել պատվերը</h2>
    <p className="mt-2 break-all text-xs text-gray-400">{order.id}</p>
    <p className="mt-2 text-sm text-gray-500">Փոփոխվում են միայն վաճառքների բազայի տվյալները։ Արդեն ուղարկված մեսսենջերի հաղորդագրությունը չի փոխվում։</p>
    {error&&<p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <fieldset disabled={busy} className="mt-5 space-y-4 disabled:opacity-60">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Ստացման/առաքման ամսաթիվ<input required type="date" value={date} onChange={e=>setDate(e.target.value)} className={input}/></label>
        <label className="text-sm">Հեռախոս<input maxLength={50} value={phone} onChange={e=>setPhone(e.target.value)} className={input}/></label>
        <label className="text-sm">Հասցե<input maxLength={500} value={address} onChange={e=>setAddress(e.target.value)} className={input}/></label>
        <label className="text-sm">Ազգություն<input maxLength={100} value={nationality} onChange={e=>setNationality(e.target.value)} className={input}/></label>
      </div>
      {items.map((item,index)=><section key={index} className="rounded-xl border border-purple-100 p-4">
        <h3 className="mb-3 font-semibold text-[#69429a]">{index+1}. {sectionNames[item.section]}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">Ապրանքի անուն<input required maxLength={200} value={item.name} onChange={e=>patch(index,{name:e.target.value})} className={input}/></label>
          <label className="text-sm">Միավորի գին · ֏<input required type="number" min="0" max="9999999999.99" step="0.01" value={item.price} onChange={e=>patch(index,{price:e.target.value})} className={input}/></label>
          <label className="text-sm">Քանակ<input required type="number" min="1" max="10000" step="1" value={item.count} onChange={e=>patch(index,{count:e.target.value})} className={input}/></label>
          {item.section==="party"&&<label className="text-sm">Ինքնարժեք / հատ · ֏<input type="number" min="0" max="9999999999.99" step="0.01" value={item.cost} onChange={e=>patch(index,{cost:e.target.value})} className={input}/></label>}
        </div>
      </section>)}
      <label className="block text-sm">Առաքման արժեք · ֏<input required type="number" min="0" max="9999999999.99" step="0.01" value={delivery} onChange={e=>setDelivery(e.target.value)} className={input}/></label>
      <label className="block text-sm">Նշումներ<textarea maxLength={2000} value={notes} onChange={e=>setNotes(e.target.value)} className={input}/></label>
      <div className="grid gap-3 rounded-xl bg-purple-50 p-4 text-sm sm:grid-cols-3"><p>Տորթեր՝ {money(total("cake"))}</p><p>Փարթի շոփ՝ {money(total("party"))}</p><p>Առաքում՝ {money(Number(delivery)||0)}</p></div>
      <div className="flex flex-wrap gap-3"><button type="submit" className="rounded-xl bg-[#69429a] px-5 py-3 text-white">{busy?"Պահպանվում է…":"Պահպանել փոփոխությունները"}</button><button type="button" onClick={onCancel} className="rounded-xl border px-5 py-3">Չեղարկել</button></div>
    </fieldset>
  </form>;
}
