"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { people, money, today, firstDay, errorText, minor, type Expense, type Person } from "@/lib/finance";
import { FinancePeriod } from "@/components/finance-period";
type DaySummary = { count: number; amount: number };
const weekdays = ["Երկ", "Երք", "Չրք", "Հնգ", "Ուրբ", "Շբթ", "Կիր"];
function monthBounds(month: string) {
  const [year, index] = month.split("-").map(Number);
  const last = new Date(Date.UTC(year, index, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, "0")}` };
}
function moveMonth(month: string, delta: number) {
  const [year, index] = month.split("-").map(Number);
  const d = new Date(Date.UTC(year, index - 1 + delta, 1));
  return `${String(d.getUTCFullYear()).padStart(4, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function monthCells(month: string): (string | null)[] {
  const [year, index] = month.split("-").map(Number);
  const start = (new Date(Date.UTC(year, index - 1, 1)).getUTCDay() + 6) % 7;
  const count = Number(monthBounds(month).to.slice(-2));
  const cells: (string | null)[] = Array(start).fill(null);
  for (let day = 1; day <= count; day++) cells.push(`${month}-${String(day).padStart(2,"0")}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}
function daySummaries(rows: Expense[]) {
  const result = new Map<string, DaySummary>();
  for (const row of rows) {
    const old = result.get(row.expense_date) ?? { count: 0, amount: 0 };
    result.set(row.expense_date, { count: old.count + 1, amount: old.amount + minor(row.amount) });
  }
  return result;
}
function ExpenseCalendar({ month, from, to, rows, selected, disabled, onMonth, onSelect }: {
  month: string; from: string; to: string; rows: Expense[]; selected: string | null; disabled: boolean;
  onMonth: (month: string) => void; onSelect: (date: string | null) => void;
}) {
  const [year,index] = month.split("-").map(Number);
  const title = new Intl.DateTimeFormat("hy-AM", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year,index-1,1)));
  const days = daySummaries(rows);
  const monthTotal = rows.filter(row => row.expense_date.startsWith(`${month}-`))
    .reduce((sum,row) => sum + minor(row.amount), 0) / 100;
  const now = today();
  return <section className="mb-6 rounded-3xl border border-purple-100 bg-white p-3 sm:p-6" aria-label="Ծախսերի օրացույց">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-bold text-[#69429a]">Ծախսերի օրացույց</h2><p className="mt-1 text-sm text-gray-500">{title}</p></div>
      <div className="flex items-center gap-2">
        <button type="button" disabled={disabled || month <= "0100-01"} aria-label="Նախորդ ամիս" onClick={() => onMonth(moveMonth(month,-1))} className="rounded-lg border p-2 disabled:opacity-40">←</button>
        <input aria-label="Օրացույցի ամիս" type="month" min="0100-01" max="9999-12" value={month} disabled={disabled}
          onChange={e => { if (/^\d{4}-(0[1-9]|1[0-2])$/.test(e.target.value)) onMonth(e.target.value); }} className="min-w-0 rounded-lg border p-2 text-sm" />
        <button type="button" disabled={disabled || month >= "9999-12"} aria-label="Հաջորդ ամիս" onClick={() => onMonth(moveMonth(month,1))} className="rounded-lg border p-2 disabled:opacity-40">→</button>
      </div>
    </div>
    <div className="mb-3 flex flex-wrap gap-3 text-sm">
      <button type="button" disabled={disabled} onClick={() => onMonth(now.slice(0,7))} className="text-[#69429a] underline">Այս ամիս</button>
      <button type="button" disabled={disabled} onClick={() => onSelect(null)} className="text-[#69429a] underline">Բոլոր օրերի գրառումները</button>
    </div>
    <div className="grid grid-cols-7 gap-1 sm:gap-2">
      {weekdays.map(day => <div key={day} className="py-2 text-center text-[10px] font-semibold text-gray-500 sm:text-sm">{day}</div>)}
      {monthCells(month).map((key,index) => {
        if (!key) return <div key={`blank-${index}`} aria-hidden="true" />;
        const sum = days.get(key); const outside = key < from || key > to;
        const active = key === selected;
        return <button key={key} type="button" disabled={disabled || outside} aria-pressed={active}
          aria-current={key === now ? "date" : undefined}
          aria-label={`${key} · ${sum?.count ?? 0} ծախս · ${money((sum?.amount ?? 0)/100)}`}
          onClick={() => onSelect(active ? null : key)}
          className={`flex min-h-20 min-w-0 flex-col items-center rounded-xl border px-0.5 py-2 text-center transition disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-24 sm:px-2 ${active ? "border-[#69429a] bg-[#69429a] text-white" : sum ? "border-purple-200 bg-purple-50 text-[#69429a] hover:bg-purple-100" : "border-gray-100 bg-gray-50 text-gray-600 hover:border-purple-200"}`}>
          <span className={`text-sm font-bold ${key === now && !active ? "rounded-full bg-purple-200 px-2" : ""}`}>{Number(key.slice(-2))}</span>
          {sum && <><span className="mt-1 w-full break-words text-[9px] font-semibold sm:text-xs">{money(sum.amount/100)}</span><span className="mt-1 text-[9px] sm:text-xs">{sum.count} ծախս</span></>}
        </button>;
      })}
    </div>
    <p className="mt-4 text-sm font-semibold text-[#69429a]">Ամսվա ծախսերը՝ {money(monthTotal)}</p>
    <p className="mt-1 text-xs text-gray-500">Գումարները՝ վերևում ընտրված ժամանակահատվածի համար։ Օրվան սեղմելով բացվում են դրա գրառումները։</p>
  </section>;
}
const input = "mt-2 block w-full rounded-xl border border-purple-200 bg-white p-3";
export function AdminExpenses({ person }: { person?: Person }) {
  const params = useParams(); const locale = typeof params.locale === "string" ? params.locale : "hy";
  const [from, setFrom] = useState(firstDay); const [to, setTo] = useState(() => monthBounds(today().slice(0,7)).to);
  const [calendarMonth, setCalendarMonth] = useState(() => today().slice(0,7));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  function chooseMonth(month: string) {
    const bounds = monthBounds(month);
    setCalendarMonth(month); setFrom(bounds.from); setTo(bounds.to); setSelectedDay(null);
  }
  function changeFrom(value: string) {
    setFrom(value); setSelectedDay(null);
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) setCalendarMonth(value.slice(0,7));
  }
  function changeTo(value: string) { setTo(value); setSelectedDay(null); }
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
          .order("expense_date",{ascending:true}).order("created_at",{ascending:true}).order("id").range(offset,offset+499);
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
      const savedDate = date;
      reset();
      if (savedDate < from || savedDate > to) {
        const bounds = monthBounds(savedDate.slice(0,7));
        setFrom(bounds.from); setTo(bounds.to);
      } else await load();
      setCalendarMonth(savedDate.slice(0,7)); setSelectedDay(savedDate);
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
  const visibleRows = selectedDay ? rows.filter(row => row.expense_date === selectedDay) : rows;
  return <>
    <FinancePeriod disabled={busy} from={from} to={to} onFrom={changeFrom} onTo={changeTo}/>
    {!person && <div className="mb-6 grid gap-4 md:grid-cols-2">
      {(Object.keys(people) as Person[]).map(key => <Link key={key} href={`/${locale}/admin/expenses/${key}`}
        className="rounded-3xl border border-purple-100 bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-bold text-[#69429a]">{people[key]}</h2>
        <p className="mt-3">{loading ? "Բեռնվում է…" : money(total(rows.filter(row=>row.person===key)))}</p>
        <p className="mt-2 text-sm text-gray-500">Բացել ծախսերի առանձին էջը →</p></Link>)}
    </div>}
    {person && <form ref={formRef} onSubmit={save} className="mb-6 rounded-3xl bg-white p-6">
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
      <ExpenseCalendar month={calendarMonth} from={from} to={to} rows={rows} selected={selectedDay}
        disabled={busy} onMonth={chooseMonth} onSelect={(day) => { setSelectedDay(day); if (day && !editingId) setDate(day); }} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{selectedDay ? `${selectedDay} · Ծախսեր` : "Ծախսեր՝ ըստ ամսաթվի"}</h2>
        <p className="text-sm text-gray-500">Հնից դեպի նորը</p>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white"><table className="w-full text-left text-sm"><thead><tr className="border-b">
        {["Ամսաթիվ","Ով","Նկարագրություն","Տեսակ","Գումար",...(person?["Գործողություն"]:[])].map(label=><th key={label} className="p-4">{label}</th>)}</tr></thead>
        <tbody>{visibleRows.map(row=><tr key={row.id} className="border-b"><td className="p-4">{row.expense_date}</td><td className="p-4">{people[row.person]}</td>
          <td className="p-4">{row.description}</td><td className="p-4">{row.expense_type==="inventory"?"PartyShop-ի գնում":"Գործառնական"}</td><td className="whitespace-nowrap p-4">{money(Number(row.amount))}</td>
          {person && <td className="p-4"><div className="flex gap-3"><button disabled={busy} className="text-[#69429a]" onClick={()=>{
            setEditingId(row.id);setDescription(row.description);setAmount(String(row.amount));setDate(row.expense_date);setKind(row.expense_type); formRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
          }}>Խմբագրել</button><button disabled={busy} className="text-red-600" onClick={()=>void remove(row)}>Ջնջել</button></div></td>}</tr>)}</tbody></table>
        {visibleRows.length===0 && <p className="p-6 text-gray-500">Ընտրված օրվա կամ ժամանակահատվածի համար ծախսեր չկան։</p>}
      </div>
      {selectedDay && <p className="mt-4 rounded-xl bg-purple-50 p-4 font-semibold text-[#69429a]">{selectedDay} · Օրվա ընդհանուր՝ {money(total(visibleRows))}</p>}
      <p className="mt-5 rounded-2xl bg-[#69429a] p-5 text-xl font-bold text-white">Ընդհանուր ծախսեր՝ {money(total(rows))}</p>
    </>}
  </>;
}
