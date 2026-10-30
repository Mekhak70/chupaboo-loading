"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  ImagePlus, HelpCircle, Heart, Truck, Shield, CakeSlice,
  PawPrint, CreditCard, Clock, ArrowUp, ArrowDown, Plus, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const BUCKET = "homepage-images";
const ADMIN_UID = "5d86c4c6-a328-47ae-8f8e-4fa97339de14";
const icons = { HelpCircle, Heart, Truck, Shield, CakeSlice, PawPrint, CreditCard, Clock };
type IconName = keyof typeof icons;
type Kind = "slide" | "faq";
type Language = "hy" | "ru" | "en" | "pl";
type Item = {
  id: string; kind: Kind; language: Language; title: string; answer: string;
  icon: IconName; desktop_path: string | null; mobile_path: string | null;
  is_active: boolean; sort_order: number;
};
type Draft = { title: string; answer: string; icon: IconName; isActive: boolean };
const blank = (): Draft => ({ title: "", answer: "", icon: "HelpCircle", isActive: true });
const iconNames: Record<IconName, string> = {
  HelpCircle: "Հարց", Heart: "Սրտիկ", Truck: "Առաքում", Shield: "Անվտանգություն",
  CakeSlice: "Տորթ", PawPrint: "Թաթիկ", CreditCard: "Վճարում", Clock: "Ժամանակ",
};
const field = "mt-2 w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#69429a] focus:ring-2 focus:ring-purple-100";
const button = "rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-[#69429a] hover:bg-purple-50 disabled:opacity-50";
function messageOf(cause: unknown) {
  return cause && typeof cause === "object" && "message" in cause ? String(cause.message) : "Գործողությունը չհաջողվեց։";
}
function imageUrl(path: string | null) {
  return path ? supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl : "";
}

function ImagePicker({ label, value, onChange, disabled }: {
  label: string; value: string; onChange: (file: File) => void; disabled: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <button type="button" disabled={disabled} onClick={() => input.current?.click()}
        className="mt-2 flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50 text-[#69429a] hover:border-[#69429a] disabled:opacity-50"
        aria-label={label}>
        {value ? <img src={value} alt={label} className="h-full w-full object-contain" /> : (
          <span className="flex flex-col items-center gap-2"><ImagePlus className="h-8 w-8" />Սեղմիր՝ նկար ընտրելու համար</span>
        )}
      </button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} className="hidden"
        onChange={(event) => { const file = event.target.files?.[0]; if (file) onChange(file); event.target.value = ""; }} />
    </div>
  );
}

export function AdminHomepage({ initialLanguage = "hy", onBusyChange }: {
  initialLanguage?: string; onBusyChange?: (busy: boolean) => void;
}) {
  const [kind, setKind] = useState<Kind>("slide");
  const [language, setLanguage] = useState<Language>(
    ["hy", "ru", "en", "pl"].includes(initialLanguage) ? initialLanguage as Language : "hy"
  );
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<Item | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(blank);
  const [desktop, setDesktop] = useState<File | null>(null);
  const [mobile, setMobile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const lock = useRef(false);
  const revision = useRef(0);

  useEffect(() => {
    if (!desktop) { setDesktopPreview(""); return; }
    const url = URL.createObjectURL(desktop); setDesktopPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [desktop]);
  useEffect(() => {
    if (!mobile) { setMobilePreview(""); return; }
    const url = URL.createObjectURL(mobile); setMobilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [mobile]);

  const load = useCallback(async () => {
    const version = ++revision.current;
    setLoading(true);
    try {
      const all: Item[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase.from("homepage_content").select("*")
          .eq("kind", kind).eq("language", language)
          .order("sort_order").order("id").range(offset, offset + 499);
        if (error) throw error;
        if (version !== revision.current) return;
        all.push(...(data ?? []) as Item[]);
        if (!data || data.length < 500) break;
      }
      if (version === revision.current) setItems(all);
    } catch (cause) {
      if (version === revision.current) setError(messageOf(cause));
    } finally {
      if (version === revision.current) setLoading(false);
    }
  }, [kind, language]);
  useEffect(() => { void load(); return () => { revision.current += 1; }; }, [load]);

  function clearForm() {
    setFormOpen(false); setEditing(null); setDraft(blank()); setDesktop(null); setMobile(null);
  }
  function switchKind(next: Kind) {
    if (lock.current) return;
    clearForm(); setError(""); setSuccess(""); setKind(next);
  }
  function edit(item: Item) {
    setEditing(item); setDraft({ title: item.title, answer: item.answer, icon: item.icon, isActive: item.is_active });
    setDesktop(null); setMobile(null); setError(""); setSuccess(""); setFormOpen(true);
  }
  function choose(file: File, target: "desktop" | "mobile") {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError("Ընտրիր JPG/PNG/WebP նկար՝ մինչև 5 MB։"); return;
    }
    setError(""); if (target === "desktop") setDesktop(file); else setMobile(file);
  }
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); onBusyChange?.(true); setError(""); setSuccess("");
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || data.user?.id !== ADMIN_UID) throw new Error("Մուտք գործիր ադմին հաշվով։");
      await action();
    } catch (cause) { setError(messageOf(cause)); }
    finally { lock.current = false; setBusy(false); onBusyChange?.(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => {
      if (!draft.title.trim()) throw new Error(kind === "slide" ? "Լրացրու նկարի նկարագրությունը։" : "Լրացրու հարցը։");
      if (kind === "faq" && !draft.answer.trim()) throw new Error("Լրացրու պատասխանը։");
      if (kind === "slide" && !desktop && !editing?.desktop_path) throw new Error("Ընտրիր համակարգչի համար բանեռի նկարը։");
      const uploaded: string[] = [];
      let saved = false;
      try {
        async function upload(file: File | null, previous: string | null) {
          if (!file) return previous;
          const ext: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
          if (!ext[file.type] || !file.size || file.size > 5 * 1024 * 1024) throw new Error("Անվավեր նկար։");
          const path = `homepage/${crypto.randomUUID()}.${ext[file.type]}`;
          const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type });
          if (error) throw error;
          uploaded.push(path); return path;
        }
        const desktopPath = kind === "slide" ? await upload(desktop, editing?.desktop_path ?? null) : null;
        const mobilePath = kind === "slide" ? await upload(mobile, editing?.mobile_path ?? null) : null;
        const values = {
          title: draft.title.trim(), answer: kind === "faq" ? draft.answer.trim() : "",
          icon: kind === "faq" ? draft.icon : "HelpCircle",
          desktop_path: desktopPath, mobile_path: mobilePath, is_active: draft.isActive,
        };
        if (editing) {
          const { error } = await supabase.from("homepage_content").update(values).eq("id", editing.id).select("id").single();
          if (error) throw error;
        } else {
          const { error } = await supabase.from("homepage_content").insert({ ...values, kind, language });
          if (error) throw error;
        }
        saved = true; clearForm(); setSuccess("Պահպանվեց բազայում։"); await load();
      } finally {
        if (!saved && uploaded.length) {
          try { const { error } = await supabase.storage.from(BUCKET).remove(uploaded); if (error) console.error(error); }
          catch (cause) { console.error(cause); }
        }
      }
    });
  }
  async function toggle(item: Item) {
    await run(async () => {
      const { error } = await supabase.from("homepage_content").update({ is_active: !item.is_active }).eq("id", item.id).select("id").single();
      if (error) throw error;
      setSuccess(item.is_active ? "Թաքցվեց։" : "Նշվեց որպես ցուցադրվող։"); await load();
    });
  }
  async function remove(item: Item) {
    if (!window.confirm(`Ջնջե՞լ «${item.title}» գրառումը։`)) return;
    await run(async () => {
      const { error } = await supabase.from("homepage_content").delete().eq("id", item.id).select("id").single();
      if (error) throw error;
      // Նախ ջնջվում է գրառումը։ Նկարների մաքրման ձախողումը չի վերականգնում այն։
      setSuccess("Գրառումը ջնջվեց։");
      const paths = [item.desktop_path, item.mobile_path].filter((path): path is string => !!path);
      if (paths.length) {
        try {
          const { error } = await supabase.storage.from(BUCKET).remove([...new Set(paths)]);
          if (error) { console.error(error); setSuccess("Գրառումը ջնջվեց, բայց նկարի մաքրումը չհաջողվեց։"); }
        } catch (cause) { console.error(cause); setSuccess("Գրառումը ջնջվեց, բայց նկարի մաքրումը չհաջողվեց։"); }
      }
      await load();
    });
  }
  async function move(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    await run(async () => {
      const ordered = [...items];
      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
      const { error } = await supabase.rpc("reorder_homepage_content", {
        p_kind: kind, p_language: language, p_ids: ordered.map((item) => item.id),
      });
      if (error) { await load(); throw error; }
      setSuccess("Հերթականությունը պահպանվեց։"); await load();
    });
  }
  const PreviewIcon = icons[draft.icon] ?? HelpCircle;

  return (
    <section className="rounded-3xl border border-purple-100 bg-white p-5 md:p-7">
      <h2 className="text-xl font-bold text-gray-900">Գլխավոր էջի կառավարում</h2>
      <p className="mt-2 text-sm text-gray-500">Տվյալները պահվում են բազայում։ Կայքին միացումը՝ հաջորդ փուլում։</p>
      <fieldset disabled={busy} className="mt-5 flex flex-wrap items-center gap-3 disabled:opacity-60">
        <button type="button" onClick={() => switchKind("slide")} className={`${button} ${kind === "slide" ? "!bg-[#69429a] !text-white" : ""}`}>Բանեռի սլայդեր</button>
        <button type="button" onClick={() => switchKind("faq")} className={`${button} ${kind === "faq" ? "!bg-[#69429a] !text-white" : ""}`}>Հաճախ տրվող հարցեր</button>
        <label className="ml-auto flex items-center gap-2 text-sm text-gray-600">Լեզու
          <select value={language} onChange={(event) => { clearForm(); setError(""); setSuccess(""); setLanguage(event.target.value as Language); }} className="rounded-xl border border-purple-200 p-2">
            <option value="hy">Հայերեն</option><option value="ru">Русский</option><option value="en">English</option><option value="pl">Polski</option>
          </select>
        </label>
      </fieldset>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{success}</p>}
      {!formOpen ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" disabled={busy || loading} onClick={() => { clearForm(); setFormOpen(true); setError(""); setSuccess(""); }} className="flex items-center gap-2 rounded-xl bg-[#69429a] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" />{kind === "slide" ? "Ավելացնել սլայդ" : "Ավելացնել հարց"}</button>
          <button type="button" disabled={busy || loading} onClick={() => { setError(""); void load(); }} className={button}>Թարմացնել</button>
        </div>
      ) : (
        <form onSubmit={save} className="mt-6 rounded-2xl border border-purple-100 bg-[#faf8fd] p-5">
          <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
            <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-[#69429a]">{editing ? "Խմբագրել" : "Նոր գրառում"}</h3><button type="button" onClick={clearForm} aria-label="Փակել ձևը" className={button}><X className="h-4 w-4" /></button></div>
            <label className="block text-sm font-medium text-gray-700">{kind === "slide" ? "Նկարի նկարագրություն (alt) *" : "Հարց *"}
              <input required maxLength={300} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={field} />
            </label>
            {kind === "slide" ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <ImagePicker label="Համակարգչի նկար *" value={desktopPreview || imageUrl(editing?.desktop_path ?? null)} disabled={busy} onChange={(file) => choose(file, "desktop")} />
                  <div className="space-y-2">
                    <ImagePicker label="Հեռախոսի նկար · ոչ պարտադիր" value={mobilePreview || imageUrl(editing?.mobile_path ?? null)} disabled={busy} onChange={(file) => choose(file, "mobile")} />
                    {(mobile || editing?.mobile_path) && <button type="button" onClick={() => { setMobile(null); if (editing) setEditing({ ...editing, mobile_path: null }); }} className={button}>Հանել հեռախոսի նկարը</button>}
                  </div>
                </div>
                <p className="text-xs leading-6 text-gray-500">JPG, PNG կամ WebP · յուրաքանչյուր նկար՝ մինչև 5 MB։ Եթե հեռախոսի նկար չկա, կայքին միացնելիս կօգտագործենք համակարգչի նկարը։</p>
              </>
            ) : (
              <>
                <fieldset><legend className="text-sm font-medium text-gray-700">Ընտրիր մեկ այքոն</legend>
                  <div className="mt-3 flex flex-wrap gap-2">{(Object.keys(icons) as IconName[]).map((name) => { const Icon = icons[name]; return <button type="button" key={name} title={iconNames[name]} aria-label={iconNames[name]} aria-pressed={draft.icon === name} onClick={() => setDraft({ ...draft, icon: name })} className={`${button} ${draft.icon === name ? "!bg-[#69429a] !text-white" : ""}`}><Icon className="h-5 w-5" /></button>; })}</div>
                </fieldset>
                <label className="block text-sm font-medium text-gray-700">Պատասխան *
                  <textarea required rows={5} maxLength={10000} value={draft.answer} onChange={(event) => setDraft({ ...draft, answer: event.target.value })} className={field} />
                </label>
                <div className="rounded-xl border border-purple-100 bg-white p-4"><div className="flex items-center gap-3 font-semibold text-[#69429a]"><PreviewIcon className="h-5 w-5 shrink-0" />{draft.title || "Հարցի նախադիտում"}</div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">{draft.answer || "Պատասխանը կերևա այստեղ։"}</p></div>
              </>
            )}
            <label className="flex items-center gap-3 text-sm text-gray-700"><input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} className="accent-[#69429a]" />Ցուցադրել կայքում</label>
            <div className="flex gap-3"><button type="submit" className="rounded-xl bg-[#69429a] px-5 py-3 text-sm font-semibold text-white">{busy ? "Պահպանվում է..." : "Պահպանել"}</button><button type="button" onClick={clearForm} className={button}>Չեղարկել</button></div>
          </fieldset>
        </form>
      )}
      {loading ? <p role="status" className="py-8 text-center text-gray-500">Բեռնվում է...</p> : !items.length ? <p className="py-8 text-center text-gray-500">Այս լեզվով գրառումներ դեռ չկան։</p> : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((item, index) => { const Icon = icons[item.icon] ?? HelpCircle; return (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-purple-100 bg-white">
              {kind === "slide" && <img src={imageUrl(item.desktop_path)} alt={item.title} className="aspect-[16/9] w-full bg-gray-50 object-contain" />}
              <div className="p-5">
                <div className="flex items-start gap-3">{kind === "faq" && <Icon className="h-5 w-5 shrink-0 text-[#69429a]" />}<h3 className="break-words font-bold text-gray-900">{item.title}</h3></div>
                {kind === "faq" && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">{item.answer}</p>}
                <p className={`mt-3 text-xs ${item.is_active ? "text-green-700" : "text-gray-500"}`}>{item.is_active ? "Ցուցադրվող" : "Թաքցված"}{kind === "slide" && item.mobile_path ? " · հեռախոսի նկար կա" : ""}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" disabled={busy || formOpen} onClick={() => edit(item)} className={button}>Խմբագրել</button>
                  <button type="button" disabled={busy || formOpen} onClick={() => void toggle(item)} className={button}>{item.is_active ? "Թաքցնել" : "Ցուցադրել"}</button>
                  <button type="button" disabled={busy || formOpen || index === 0} onClick={() => void move(index, -1)} aria-label="Տեղափոխել վերև" className={button}><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" disabled={busy || formOpen || index === items.length - 1} onClick={() => void move(index, 1)} aria-label="Տեղափոխել ներքև" className={button}><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" disabled={busy || formOpen} onClick={() => void remove(item)} className="rounded-xl border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">Ջնջել</button>
                </div>
              </div>
            </article>
          ); })}
        </div>
      )}
    </section>
  );
}
