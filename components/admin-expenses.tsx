"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { people, money, today, firstDay, errorText, minor, type Expense, type Person } from "@/lib/finance";
import { FinancePeriod } from "@/components/finance-period";
const input = "mt-2 block w-full rounded-xl border border-purple-200 bg-white p-3";
export function AdminExpenses({ person }: { person?: Person }) {
  const params = useParams(); const locale = typeof params.locale === "string" ? params.locale : "hy";
  const [from, setFrom] = useState(firstDay); const [to, setTo] = useState(today);
  const [rows, setRows] = useState<Expense[]>([]); const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [description, setDescription] = useState(""); const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today); const [kind, setKind] = useState<"operating"|"inventory">("operating");
  const [editingId, setEditingId] = useState<string | null>(null); const lock = useRef(false);
  const generation = useRef(0);
  const load = useCallback(async () => {
    const version = ++generation.current; setLoading(true); setError("");
    try {
      if (!from || !to || from > to) throw new Error("Ընտրիր ճիշտ ժամանակահատված։");
      const collected: Expense[] = [];
      for (let offset=0;;offset+=500) {
        let query = supabase.from("finance_expenses").select("*").gte("expense_date",from).lte("expense_date",to)
          .order("expense_date",{ascending:false}).order("id").range(offset,offset+499);
        if (person) query = query.eq("person",person);
        const { data, error } = await query; if (error) throw error;
        collected.push(...(data ?? []) as Expense[]); if (!data || data.length < 500) break;
      }
      if (version === generation.current) setRows(collected);
    } catch(error) { if (version === generation.current) { setError(errorText(error)); setRows([]); } }
    finally { if (version === generation.current) setLoading(false); }
  }, [from,to,person]);
  useEffect(() => { void load(); return () => { generation.current += 1; }; }, [load]);
  const reset = () => { setEditingId(null); setDescription(""); setAmount(""); setDate(today()); setKind("operating"); };
  async function save(event: FormEvent) {
    event.preventDefault(); if (!person || lock.current) return;
    const value = Number(amount);
    if (!description.trim() || !date || !amount.trim() || !Number.isFinite(value) || value <= 0 || value > 9999999999.99) {
      setError("Լրացրու նկարագրությունը, ամսաթիվը և դրական գումարը։"); return;
    }
    lock.current=true; setBusy(true); setError("");
    try {
      const payload = { person, expense_date: date, description: description.trim(), amount: value, expense_type: kind };
      const result = editingId
        ? await supabase.from("finance_expenses").update(payload).eq("id",editingId).eq("person",person).select("id").single()
        : await supabase.from("finance_expenses").insert(payload).select("id").single();
      if (result.error) throw result.error;
      reset(); await load();
    } catch(error) { setError(errorText(error)); }
    finally { lock.current=false; setBusy(false); }
  }
  async function remove(row: Expense) {
    if (lock.current || !confirm(`Ջնջե՞լ «${row.description}» ծախսը։`)) return;
    lock.current=true; setBusy(true); setError("");
    try {
      const { error } = await supabase.from("finance_expenses").delete().eq("id",row.id).select("id").single();
      if (error) throw error; if (editingId===row.id) reset(); await load();
    } catch(error) { setError(errorText(error)); } finally { lock.current=false; setBusy(false); }
  }
  const total = (list: Expense[]) => list.reduce((sum,row) => sum+minor(row.amount),0)/100;
  return <>
    <FinancePeriod disabled={busy} from={from} to={to} onFrom={setFrom} onTo={setTo}/>
    {!person && <div className="mb-6 grid gap-4 md:grid-cols-2">
      {(Object.keys(people) as Person[]).map(key => <Link key={key} href={`/${locale}/admin/expenses/${key}`}
        className="rounded-3xl border border-purple-100 bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-bold text-[#69429a]">{people[key]}</h2>
        <p className="mt-3">{loading ? "Բեռնվում է…" : money(total(rows.filter(row=>row.person===key)))}</p>
        <p className="mt-2 text-sm text-gray-500">Բացել ծախսերի առանձին էջը →</p></Link>)}
    </div>}
    {person && <form onSubmit={save} className="mb-6 rounded-3xl bg-white p-6">
      <h2 className="mb-4 text-xl font-bold">{editingId ? "Խմբագրել ծախսը" : `${people[person]} · Ավելացնել ծախս`}</h2>
      <fieldset disabled={busy} className="grid gap-4 md:grid-cols-2">
        <label>Նկարագրություն *<input required maxLength={500} value={description} onChange={e=>setDescription(e.target.value)} className={input}/></label>
        <label>Գումար · ֏ *<input required type="number" min="0.01" max="9999999999.99" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} className={input}/></label>
        <label>Ամսաթիվ *<input required type="date" value={date} onChange={e=>setDate(e.target.value)} className={input}/></label>
        <label>Տեսակ<select value={kind} onChange={e=>setKind(e.target.value as typeof kind)} className={input}>
          <option value="operating">Գործառնական ծախս</option><option value="inventory">PartyShop-ի ապրանքների գնում</option></select></label>
        <p className="text-sm text-gray-500 md:col-span-2">PartyShop-ի ապրանքների գնումը ներառվում է ընդհանուր վճարված ծախսերում։ Արդյունքում դրա փոխարեն հանվում է միայն վաճառված ապրանքի ինքնարժեքը։</p>
        <div className="flex gap-3"><button className="rounded-xl bg-[#69429a] px-5 py-3 font-semibold text-white">{busy?"Պահպանվում է…":"Պահպանել"}</button>
          {editingId && <button type="button" onClick={reset} className="rounded-xl border px-5 py-3">Չեղարկել</button>}</div>
      </fieldset>
    </form>}
    {error && <p role="alert" className="my-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    {loading ? <p role="status">Բեռնվում է…</p> : !error && <>
      <div className="overflow-x-auto rounded-2xl bg-white"><table className="w-full text-left text-sm"><thead><tr className="border-b">
        {["Ամսաթիվ","Ով","Նկարագրություն","Տեսակ","Գումար",...(person?["Գործողություն"]:[])].map(label=><th key={label} className="p-4">{label}</th>)}</tr></thead>
        <tbody>{rows.map(row=><tr key={row.id} className="border-b"><td className="p-4">{row.expense_date}</td><td className="p-4">{people[row.person]}</td>
          <td className="p-4">{row.description}</td><td className="p-4">{row.expense_type==="inventory"?"PartyShop-ի գնում":"Գործառնական"}</td><td className="whitespace-nowrap p-4">{money(Number(row.amount))}</td>
          {person && <td className="p-4"><div className="flex gap-3"><button disabled={busy} className="text-[#69429a]" onClick={()=>{
            setEditingId(row.id);setDescription(row.description);setAmount(String(row.amount));setDate(row.expense_date);setKind(row.expense_type);
          }}>Խմբագրել</button><button disabled={busy} className="text-red-600" onClick={()=>void remove(row)}>Ջնջել</button></div></td>}</tr>)}</tbody></table>
        {rows.length===0 && <p className="p-6 text-gray-500">Ընտրված ժամանակահատվածում ծախսեր չկան։</p>}
      </div><p className="mt-5 rounded-2xl bg-[#69429a] p-5 text-xl font-bold text-white">Ընդհանուր ծախսեր՝ {money(total(rows))}</p>
    </>}
  </>;
}
