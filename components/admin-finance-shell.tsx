"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FINANCE_ADMIN_UID } from "@/lib/finance";
export function AdminFinanceShell({ title, children }: { title: string; children: ReactNode }) {
  const params = useParams(); const router = useRouter();
  const locale = typeof params.locale === "string" ? params.locale : "hy";
  const base = `/${locale}/admin`;
  const [state, setState] = useState<"loading"|"allowed"|"error">("loading");
  useEffect(() => {
    let active = true;
    async function verify() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!active) return;
        if (error || data.user?.id !== FINANCE_ADMIN_UID) { router.replace(`${base}/login`); return; }
        setState("allowed");
      } catch { if (active) setState("error"); }
    }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session?.user.id !== FINANCE_ADMIN_UID) {
        setState("loading"); router.replace(`${base}/login`);
      }
    });
    void verify();
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [base, router]);
  if (state !== "allowed") return <main className="min-h-screen bg-[#f8f6fb] p-10 text-center text-[#69429a]">
    {state === "error" ? <button onClick={() => location.reload()}>Մուտքի ստուգումը չհաջողվեց · Կրկին փորձել</button> : "Ստուգում ենք մուտքը…"}
  </main>;
  return <main className="min-h-screen bg-[#f8f6fb] px-4 py-8 text-gray-900 md:px-8">
    <div className="mx-auto max-w-7xl"><p className="text-sm font-bold text-[#69429a]">CHUPABOO · ԱԴՄԻՆ</p>
      <h1 className="my-5 text-3xl font-bold">{title}</h1>
      <nav className="mb-6 flex flex-wrap gap-3" aria-label="Ֆինանսների բաժիններ">
        {[[base,"Ապրանքներ"],[`${base}/expenses`,"Ծախսեր"],[`${base}/sales`,"Վաճառք և արդյունք"]].map(([href,label]) =>
          <Link key={href} href={href} className="rounded-xl border border-purple-100 bg-white px-5 py-3 font-semibold text-[#69429a]">{label}</Link>)}
      </nav>{children}
    </div>
  </main>;
}
