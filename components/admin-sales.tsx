"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { money, firstDay, today, people, saleSections, summarize, errorText,
  type FinanceOrder, type Expense, type SaleSection } from "@/lib/finance";
import { FinancePeriod } from "@/components/finance-period";
function CakeDetails({ options }: { options: Record<string,unknown> | null }) {
  if (!options) return null;
  const labels: Record<string,string> = { cakeType:"Տեսակ",creamType:"Կրեմ",selectedAnimal:"Միս",selectedVegetables:"Բաղադրիչներ",designType:"Դիզայն",petName:"Կենդանու անուն",customText:"Գրվածք" };
  const values: Record<string,string> = { MEAT:"Մսային", FRUIT:"Մրգային", VEGETABLES:"Բանջարեղենային", DAIRY:"Կաթնային", PLANTBASEDMILK:"Բուսական կաթով", PLANTBASED:"Բուսական", CHICKEN:"Հավ",BEEF:"Տավար",LAMB:"Գառ",TURKEY:"Հնդկահավ",SALMON:"Սաղմոն",STANDARD:"Ստանդարտ",CUSTOM_PHOTO:"Լուսանկարով",CUSTOM_TEXT:"Անհատական գրվածք",NAME_TEXT:"Անունով", POTATO:"Կարտոֆիլ",CARROT:"Գազար",BROCCOLI:"Բրոկոլի",PUMPKIN:"Դդում",PEPPER:"Պղպեղ",ZUCCHINI:"Դդմիկ",CAULIFLOWER:"Ծաղկակաղամբ",SWEET_POTATO:"Բատատ",SPINACH:"Սպանախ",RICE:"Բրինձ",WHEAT:"Ցորեն",OATS:"Վարսակ",APPLE:"Խնձոր",BANANA:"Բանան",PEAR:"Տանձ",ELDERBERRY:"Թանթրվենի",STRAWBERRY:"Ելակ",MANGO:"Մանգո" };
  return <dl className="mt-2 space-y-1 text-xs text-gray-500">{Object.entries(labels).map(([key,label])=>{
    const value=options[key]; if (value===undefined || value===null || value==="") return null;
    const text=Array.isArray(value)?value.map(x=>values[String(x)]||String(x)).join(", "):values[String(value)]||String(value);
    return <div key={key}><dt className="inline font-medium">{label}: </dt><dd className="inline">{text}</dd></div>;
  })}{options.customImageAttached === true && <div>Լուսանկարը կցված է պատվերում</div>}
    {typeof options.customImage === "string" && /^https?:\/\//.test(options.customImage) &&
      <div><a href={options.customImage} target="_blank" rel="noopener noreferrer" className="text-[#69429a] underline">Բացել կցված լուսանկարը</a></div>}
  </dl>;
}
export function AdminSales() {
  const [from,setFrom]=useState(firstDay); const [to,setTo]=useState(today);
  const [orders,setOrders]=useState<FinanceOrder[]>([]); const [expenses,setExpenses]=useState<Expense[]>([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const [busy,setBusy]=useState(false); const lock=useRef(false); const generation=useRef(0);
  const load=useCallback(async()=>{
    const version=++generation.current;setLoading(true);setError("");
    try {
      if (!from || !to || from>to) throw new Error("Ընտրիր ճիշտ ժամանակահատված։");
      const allOrders: FinanceOrder[]=[];const allExpenses: Expense[]=[];
      for (let offset=0;;offset+=500) {
        const {data,error}=await supabase.from("finance_orders").select("id,created_at,business_date,sold_at,status,phone,delivery_info,items,delivery_fee,product_total")
          .gte("business_date",from).lte("business_date",to).order("created_at",{ascending:false}).order("id").range(offset,offset+499);
        if(error)throw error;allOrders.push(...(data??[]) as FinanceOrder[]);if(!data||data.length<500)break;
      }
      for(let offset=0;;offset+=500){
        const {data,error}=await supabase.from("finance_expenses").select("*").gte("expense_date",from).lte("expense_date",to).order("id").range(offset,offset+499);
        if(error)throw error;allExpenses.push(...(data??[]) as Expense[]);if(!data||data.length<500)break;
      }
      if(version===generation.current){setOrders(allOrders);setExpenses(allExpenses);}
    }catch(error){if(version===generation.current){setError(errorText(error));setOrders([]);setExpenses([]);}}
    finally{if(version===generation.current)setLoading(false);}
  },[from,to]);
  useEffect(()=>{void load();return()=>{generation.current+=1;};},[load]);
  async function changeStatus(order:FinanceOrder,status:"sold"|"cancelled"){
    if(lock.current || !confirm(status==="sold"?"Հաստատե՞լ, որ պատվերն իրականում վաճառվել է։ Ստուգիր ապրանքներն ու գները։":"Չեղարկե՞լ պատվերը և հանել վաճառքի հաշվարկից։"))return;
    lock.current=true;setBusy(true);setError("");
    try{const {error}=await supabase.rpc("set_finance_order_status",{p_id:order.id,p_status:status});if(error)throw error;await load();}
    catch(error){setError(errorText(error));}finally{lock.current=false;setBusy(false);}
  }
  const summary=summarize(orders,expenses);
  const sold=orders.filter(order=>order.status==="sold");
  const pending=orders.filter(order=>order.status==="pending");
  const personTotal=(person:string)=>expenses.filter(x=>x.person===person).reduce((sum,x)=>sum+Math.round(Number(x.amount)*100),0)/100;
  return <>
    <FinancePeriod disabled={busy} from={from} to={to} onFrom={setFrom} onTo={setTo}/>
    <button disabled={loading||busy} onClick={()=>void load()} className="mb-4 rounded-xl bg-white px-5 py-3 text-[#69429a] disabled:opacity-50">Թարմացնել</button>
    {error&&<p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {loading?<p role="status">Բեռնվում է…</p>:!error&&<>
      <section className="mb-8 rounded-3xl bg-white p-5"><h2 className="text-xl font-bold">Սպասող պատվերներ · {pending.length}</h2>
        <p className="mt-2 text-sm text-gray-500">Մեսսենջերի բացումը դեռ վաճառք չէ։ Հաստատիր միայն իրական վաճառքը։ Սպասող և չեղարկված պատվերները չեն մտնում իտոգի մեջ։</p>
        {pending.length===0&&<p className="mt-4 text-gray-500">Այս ժամանակահատվածում սպասող պատվերներ չկան։</p>}
        {pending.map(order=><details key={order.id} className="mt-4 rounded-xl border p-4"><summary className="cursor-pointer font-semibold">
          {order.business_date} · {order.phone} · {money(Number(order.product_total)+Number(order.delivery_fee))}</summary>
          <p className="mt-3 break-all text-xs text-gray-500">Պատվեր՝ {order.id}</p>
          {order.items.map((item,index)=><div key={index} className="mt-3 border-b pb-3"><p>{item.name} × {item.quantity} · {money(Number(item.unit_price)*item.quantity)}</p>
            {item.section==="cake"&&<CakeDetails options={item.options}/>}</div>)}
          <p className="mt-3 text-sm">Առաքում՝ {money(Number(order.delivery_fee))}</p>
          <dl className="mt-3 text-sm text-gray-600">{Object.entries({deliveryDate:"Ամսաթիվ",deliveryTime:"Ժամ",deliveryAddress:"Հասցե",paymentMethod:"Վճարում",deliveryOption:"Ստացման եղանակ"}).map(([key,label])=>
            order.delivery_info[key]?<div key={key}><dt className="inline">{label}: </dt><dd className="inline">{String(order.delivery_info[key])}</dd></div>:null)}</dl>
          <div className="mt-4 flex flex-wrap gap-3"><button disabled={busy} onClick={()=>void changeStatus(order,"sold")} className="rounded-xl bg-green-600 px-4 py-3 text-white disabled:opacity-50">Հաստատել վաճառքը</button>
            <button disabled={busy} onClick={()=>void changeStatus(order,"cancelled")} className="rounded-xl border border-red-200 px-4 py-3 text-red-600 disabled:opacity-50">Չեղարկել</button></div>
        </details>)}
      </section>
      {(Object.keys(saleSections) as SaleSection[]).map(section=>{
        const lines=sold.flatMap(order=>order.items.map((item,index)=>({item,index,order}))).filter(row=>row.item.section===section);
        return <section key={section} className="mb-6 overflow-hidden rounded-3xl bg-white p-5">
          <h2 className="mb-4 text-xl font-bold text-[#69429a]">{saleSections[section]}</h2>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b">
            {["Ամսաթիվ","Ապրանք","Քանակ","Միավորի գին","Ընդամենը",...(section==="party"?["Ինքնարժեք / հատ"]:[])].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>
            {lines.map(({item,index,order})=><tr key={`${order.id}-${index}`} className="border-b"><td className="whitespace-nowrap p-3">{order.business_date}</td>
              <td className="min-w-48 p-3"><p className="font-semibold">{item.name}</p>{section==="cake"&&<CakeDetails options={item.options}/>}</td>
              <td className="p-3">{item.quantity}</td><td className="whitespace-nowrap p-3">{money(Number(item.unit_price))}</td>
              <td className="whitespace-nowrap p-3">{money(Math.round(Number(item.unit_price)*100)*item.quantity/100)}</td>
              {section==="party"&&<td className="whitespace-nowrap p-3">{item.unit_cost===null?"Նշված չէ":money(Number(item.unit_cost))}</td>}</tr>)}
          </tbody></table></div>
          {lines.length===0&&<p className="p-4 text-gray-500">Վաճառք չկա։</p>}
          <p className="mt-4 rounded-xl bg-purple-50 p-4 text-lg font-bold">Բաժնի ընդհանուր՝ {money(summary.totals[section])}</p>
        </section>;
      })}
      <section className="rounded-3xl bg-white p-6"><h2 className="mb-5 text-2xl font-bold">Ընդհանուր արդյունք</h2>
        <dl className="space-y-3">{[
          ["Ապրանքների ընդհանուր հասույթ",summary.revenue], ["Առաքման համար գանձված",summary.delivery],
          [`${people.mkho} · բոլոր ծախսերը`,personTotal("mkho")],[`${people.diana} · բոլոր ծախսերը`,personTotal("diana")],
          ["Ընդհանուր վճարված ծախսեր",summary.allExpenses], ["Դրանցից՝ գործառնական",summary.operating],
          ["Վաճառված PartyShop-ի հայտնի ինքնարժեք",summary.partyCost],
          ["Հաշվարկային արդյունք՝ հասույթ − ինքնարժեք − գործառնական ծախսեր",summary.result],
          ["Դրամական տարբերություն՝ հասույթ + առաքում − բոլոր ծախսերը",summary.cashResult],
        ].map(([label,value])=><div key={String(label)} className="flex flex-wrap justify-between gap-3 border-b py-3"><dt>{label}</dt><dd className="font-bold text-[#69429a]">{money(Number(value))}</dd></div>)}</dl>
        <p className="mt-5 text-sm text-gray-600">Հաշվարկները դրամով են։ Առաքման գումարը առանձնացված է ապրանքի հասույթից։ Տորթերի և առկա տեսականու ծախսերը մուտքագրիր «Գործառնական ծախս» տեսակով։ Հաշվարկային արդյունքը վերջնական զուտ շահույթ չէ, եթե բոլոր ծախսերը գրանցված չեն։</p>
        {summary.missingCost>0&&<p role="status" className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-800">{summary.missingCost} վաճառված PartyShop ապրանքի ինքնարժեքը նշված չէ․ արդյունքը նախնական է։</p>}
      </section>
      {sold.length>0&&<details className="mt-6 rounded-2xl bg-white p-5"><summary className="cursor-pointer font-bold">Հաստատված պատվերներ · չեղարկել վաճառքը</summary>
        {sold.map(order=><div key={order.id} className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3"><p>{order.business_date} · {order.phone} · {money(Number(order.product_total))}</p>
          <button disabled={busy} onClick={()=>void changeStatus(order,"cancelled")} className="text-red-600 disabled:opacity-50">Չեղարկել վաճառքը</button></div>)}</details>}
      <p className="mt-5 text-sm text-gray-500">Չեղարկված պատվերներ՝ {orders.filter(x=>x.status==="cancelled").length}։ Վաճառքի ամսաթիվը առաջին հաստատման օրն է։</p>
    </>}
  </>;
}
