"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { money, firstDay, today, people, saleSections, summarize, errorText,
  type FinanceOrder, type Expense, type SaleSection } from "@/lib/finance";
import { AdminManualSale } from "@/components/admin-manual-sale";
import { FinancePeriod } from "@/components/finance-period";
// Reports use the date explicitly chosen in the order; older orders fall back to business_date.
function orderDate(order: FinanceOrder): string {
  const value = order.delivery_info?.deliveryDate;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(`${value}T00:00:00Z`);
    if (Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === value) return value;
  }
  return order.business_date;
}
function compareOrders(a: FinanceOrder, b: FinanceOrder) {
  return orderDate(a).localeCompare(orderDate(b)) || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id);
}
function currentMonthEnd() {
  const [year, month] = today().slice(0,7).split("-").map(Number);
  return `${today().slice(0,7)}-${String(new Date(Date.UTC(year,month,0)).getUTCDate()).padStart(2,"0")}`;
}
function CakeDetails({ options }: { options: Record<string,unknown> | null }) {
  if (!options) return null;
  const labels: Record<string,string> = { notes:"Մանրամասներ", cakeType:"Տեսակ",creamType:"Կրեմ",selectedAnimal:"Միս",selectedVegetables:"Բաղադրիչներ",designType:"Դիզայն",petName:"Կենդանու անուն",customText:"Գրվածք" };
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
const sourceNames: Record<string,string> = { instagram:"Instagram",phone:"Հեռախոս",whatsapp:"WhatsApp",telegram:"Telegram",in_person:"Տեղում",other:"Այլ" };
function sourceName(order:FinanceOrder) {
  const source=order.delivery_info?.source;
  return typeof source==="string" ? sourceNames[source] || source : "Կայք";
}
function CustomerDetails({order}:{order:FinanceOrder}) {
  const info=order.delivery_info ?? {};
  return <dl className="mt-3 space-y-2 text-sm text-gray-600">
    <div><dt className="inline font-medium">Հեռախոս՝ </dt><dd className="inline">{order.phone || "Չի նշվել"}</dd></div>
    <div><dt className="inline font-medium">Ամիս՝ </dt><dd className="inline">{String(info.month || orderDate(order).slice(0,7))}</dd></div>
    <div><dt className="inline font-medium">Հասցե՝ </dt><dd className="inline">{String(info.deliveryAddress || "Չի նշվել")}</dd></div>
    <div><dt className="inline font-medium">Ազգություն՝ </dt><dd className="inline">{String(info.nationality || "Չի նշվել")}</dd></div>
    <div><dt className="inline font-medium">Աղբյուր՝ </dt><dd className="inline">{sourceName(order)}</dd></div>
    <div><dt className="inline font-medium">Ապրանքների գին՝ </dt><dd className="inline">{money(Number(order.product_total))}</dd></div>
    <div><dt className="inline font-medium">Առաքում՝ </dt><dd className="inline">{money(Number(order.delivery_fee))}</dd></div>
    <div><dt className="inline font-medium">Ընդհանուր գին՝ </dt><dd className="inline font-bold text-[#69429a]">{money(Number(order.product_total)+Number(order.delivery_fee))}</dd></div>
    {info.notes ? <div><dt className="inline font-medium">Նշումներ՝ </dt><dd className="inline">{String(info.notes)}</dd></div> : null}
  </dl>;
}
export function AdminSales() {
  const [manualOpen,setManualOpen]=useState(false);
  const [notice,setNotice]=useState("");
  const [from,setFrom]=useState(firstDay); const [to,setTo]=useState(currentMonthEnd);
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
          .order("created_at",{ascending:true}).order("id").range(offset,offset+499);
        if(error)throw error;allOrders.push(...(data??[]) as FinanceOrder[]);if(!data||data.length<500)break;
      }
      for(let offset=0;;offset+=500){
        const {data,error}=await supabase.from("finance_expenses").select("*").gte("expense_date",from).lte("expense_date",to).order("id").range(offset,offset+499);
        if(error)throw error;allExpenses.push(...(data??[]) as Expense[]);if(!data||data.length<500)break;
      }
      if(version===generation.current){setOrders(allOrders.filter(order => orderDate(order) >= from && orderDate(order) <= to).sort(compareOrders));setExpenses(allExpenses);}
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
  function manualSaved(date:string) {
    setManualOpen(false);
    setNotice(`Վաճառքը պահպանվեց՝ ${date}։`);
    if(date<from||date>to){
      setFrom(`${date.slice(0,7)}-01`);
      const [year,month]=date.slice(0,7).split("-").map(Number);
      setTo(`${date.slice(0,7)}-${String(new Date(Date.UTC(year,month,0)).getUTCDate()).padStart(2,"0")}`);
    }else void load();
  }
  const summary=summarize(orders,expenses);
  const sold=orders.filter(order=>order.status==="sold");
  const pending=orders.filter(order=>order.status==="pending");
  const personTotal=(person:string)=>expenses.filter(x=>x.person===person).reduce((sum,x)=>sum+Math.round(Number(x.amount)*100),0)/100;
  return <>
    <button type="button" disabled={busy} onClick={()=>{setManualOpen(value=>!value);setNotice("");}}
      className="mb-5 rounded-xl bg-[#69429a] px-5 py-3 font-semibold text-white disabled:opacity-50">
      {manualOpen?"Փակել ավելացման ձևը":"+ Ձեռքով ավելացնել վաճառք"}
    </button>
    {manualOpen&&<AdminManualSale onSaved={manualSaved} onCancel={()=>setManualOpen(false)} onBusyChange={setBusy}/>}
    {notice&&<p role="status" className="mb-4 rounded-xl bg-green-50 p-4 text-green-800">{notice}</p>}
    <FinancePeriod disabled={busy} from={from} to={to} onFrom={setFrom} onTo={setTo}/>
    <p className="mb-4 text-sm text-gray-500">Վաճառքներն ու պատվերները դասավորված են նշված ստացման/առաքման ամսաթվով՝ հնից դեպի նորը։ Ժամանակահատվածի ֆիլտրը և իտոգները նույնպես այդ ամսաթվով են։ Եթե ամսաթիվը բացակայում է՝ օգտագործվում է հաշվառման օրը։</p>
    <button disabled={loading||busy} onClick={()=>void load()} className="mb-4 rounded-xl bg-white px-5 py-3 text-[#69429a] disabled:opacity-50">Թարմացնել</button>
    {error&&<p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {loading?<p role="status">Բեռնվում է…</p>:!error&&<>
      <section className="mb-8 rounded-3xl bg-white p-5"><h2 className="text-xl font-bold">Սպասող պատվերներ · {pending.length}</h2>
        <p className="mt-2 text-sm text-gray-500">Մեսսենջերի բացումը դեռ վաճառք չէ։ Հաստատիր միայն իրական վաճառքը։ Սպասող և չեղարկված պատվերները չեն մտնում իտոգի մեջ։</p>
        {pending.length===0&&<p className="mt-4 text-gray-500">Այս ժամանակահատվածում սպասող պատվերներ չկան։</p>}
        {pending.map(order=><details key={order.id} className="mt-4 rounded-xl border p-4"><summary className="cursor-pointer font-semibold">
          {orderDate(order)} · {order.phone} · {money(Number(order.product_total)+Number(order.delivery_fee))}</summary>
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
            {["Ստացման/առաքման ամսաթիվ","Ապրանք","Քանակ","Միավորի գին","Ընդամենը",...(section==="party"?["Ինքնարժեք / հատ"]:[])].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>
            {lines.map(({item,index,order})=><tr key={`${order.id}-${index}`} className="border-b"><td className="whitespace-nowrap p-3">{orderDate(order)}</td>
              <td className="min-w-48 p-3"><p className="font-semibold">{item.name}</p>{section==="cake"&&<CakeDetails options={item.options}/>}</td>
              <td className="p-3">{item.quantity}</td><td className="whitespace-nowrap p-3">{money(Number(item.unit_price))}</td>
              <td className="whitespace-nowrap p-3">{money(Math.round(Number(item.unit_price)*100)*item.quantity/100)}</td>
              {section==="party"&&<td className="whitespace-nowrap p-3">{item.unit_cost===null?"Նշված չէ":money(Number(item.unit_cost))}</td>}</tr>)}
          </tbody></table></div>
          {lines.length===0&&<p className="p-4 text-gray-500">Վաճառք չկա։</p>}
          <p className="mt-4 rounded-xl bg-purple-50 p-4 text-lg font-bold">Բաժնի ընդհանուր՝ {money(summary.totals[section])}</p>
        </section>;
      })}
      <section className="mb-6 overflow-hidden rounded-3xl bg-white p-5">
        <h2 className="mb-4 text-xl font-bold text-[#69429a]">Առաքումներ</h2>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b">
          {["Ամսաթիվ","Հեռախոս","Աղբյուր","Հասցե","Առաքման գումար"].map(label=><th key={label} className="p-3">{label}</th>)}
        </tr></thead><tbody>{sold.filter(order=>Number(order.delivery_fee)>0).map(order=><tr key={order.id} className="border-b">
          <td className="whitespace-nowrap p-3">{orderDate(order)}</td><td className="p-3">{order.phone||"Չի նշվել"}</td>
          <td className="p-3">{sourceName(order)}</td><td className="p-3">{String(order.delivery_info?.deliveryAddress||"Չի նշվել")}</td>
          <td className="whitespace-nowrap p-3">{money(Number(order.delivery_fee))}</td></tr>)}</tbody></table></div>
        {!sold.some(order=>Number(order.delivery_fee)>0)&&<p className="p-4 text-gray-500">Առաքման գումարներ չկան։</p>}
        <p className="mt-4 rounded-xl bg-purple-50 p-4 text-lg font-bold">Առաքումների ընդհանուր՝ {money(summary.delivery)}</p>
      </section>
      <section className="rounded-3xl bg-white p-6"><h2 className="mb-5 text-2xl font-bold">Ընդհանուր արդյունք</h2>
        <dl className="space-y-3">{[
          ["Ապրանքների ընդհանուր հասույթ",summary.revenue], ["Առաքման համար գանձված",summary.delivery],
          ["Ընդհանուր մուտք՝ ապրանքներ և առաքում",summary.revenue+summary.delivery],
          [`${people.mkho} · բոլոր ծախսերը`,personTotal("mkho")],[`${people.diana} · բոլոր ծախսերը`,personTotal("diana")],
          ["Ընդհանուր վճարված ծախսեր",summary.allExpenses], ["Դրանցից՝ գործառնական",summary.operating],
          ["Վաճառված PartyShop-ի հայտնի ինքնարժեք",summary.partyCost],
          ["Հաշվարկային արդյունք՝ հասույթ − ինքնարժեք − գործառնական ծախսեր",summary.result],
          ["Դրամական տարբերություն՝ հասույթ + առաքում − բոլոր ծախսերը",summary.cashResult],
        ].map(([label,value])=><div key={String(label)} className="flex flex-wrap justify-between gap-3 border-b py-3"><dt>{label}</dt><dd className="font-bold text-[#69429a]">{money(Number(value))}</dd></div>)}</dl>
        <p className="mt-5 text-sm text-gray-600">Հաշվարկները դրամով են։ Առաքման գումարը առանձնացված է ապրանքի հասույթից։ Տորթերի և առկա տեսականու ծախսերը մուտքագրիր «Գործառնական ծախս» տեսակով։ Հաշվարկային արդյունքը վերջնական զուտ շահույթ չէ, եթե բոլոր ծախսերը գրանցված չեն։</p>
        {summary.missingCost>0&&<p role="status" className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-800">{summary.missingCost} վաճառված PartyShop ապրանքի ինքնարժեքը նշված չէ․ արդյունքը նախնական է։</p>}
      </section>
      {sold.length>0&&<section className="mt-6 rounded-3xl bg-white p-5">
        <h2 className="mb-4 text-xl font-bold">Վաճառված պատվերների տվյալներ</h2>
        <div className="mb-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b">
          {["Ամսաթիվ","Հեռ․","Ամիս","Գին՝ առաքումով","Հասցե","Ազգություն","Աղբյուր"].map(label=><th key={label} className="whitespace-nowrap p-3">{label}</th>)}
        </tr></thead><tbody>{sold.map(order=><tr key={order.id} className="border-b">
          <td className="whitespace-nowrap p-3">{orderDate(order)}</td><td className="whitespace-nowrap p-3">{order.phone||"Չի նշվել"}</td>
          <td className="whitespace-nowrap p-3">{String(order.delivery_info?.month||orderDate(order).slice(0,7))}</td>
          <td className="whitespace-nowrap p-3">{money(Number(order.product_total)+Number(order.delivery_fee))}</td>
          <td className="min-w-40 p-3">{String(order.delivery_info?.deliveryAddress||"Չի նշվել")}</td>
          <td className="p-3">{String(order.delivery_info?.nationality||"Չի նշվել")}</td><td className="p-3">{sourceName(order)}</td>
        </tr>)}</tbody></table></div>
        {sold.map(order=><details key={order.id} className="mt-3 rounded-xl border p-4">
          <summary className="cursor-pointer font-semibold">{orderDate(order)} · {sourceName(order)} · {order.phone||"Հեռախոսը նշված չէ"} · {money(Number(order.product_total)+Number(order.delivery_fee))}</summary>
          <CustomerDetails order={order}/>
          <p className="mt-3 break-all text-xs text-gray-400">Պատվեր՝ {order.id}</p>
          {order.items.map((item,index)=><div key={index} className="mt-3 border-t pt-3 text-sm"><p>{item.name} × {item.quantity} · {money(Number(item.unit_price)*item.quantity)}</p><CakeDetails options={item.options}/></div>)}
          <button disabled={busy} onClick={()=>void changeStatus(order,"cancelled")} className="mt-4 text-sm text-red-600 disabled:opacity-50">Չեղարկել վաճառքը</button>
        </details>)}
      </section>}
      <p className="mt-5 text-sm text-gray-500">Չեղարկված պատվերներ՝ {orders.filter(x=>x.status==="cancelled").length}։ Ցուցակի ամսաթիվը պատվերում նշված ստացման/առաքման օրն է։</p>
    </>}
  </>;
}
