"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ADMIN_UID = "5d86c4c6-a328-47ae-8f8e-4fa97339de14";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const params = useParams();

  const language = params.locale ?? params.lang;
  const loginPath =
    typeof language === "string"
      ? `/${language}/admin/login`
      : "/admin/login";

  const [allowed, setAllowed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let version = 0;

    async function checkAccess() {
      const requestVersion = ++version;

      try {
        const { data, error } = await supabase.auth.getUser();

        if (!active || requestVersion !== version) return;

        if (error || data.user?.id !== ADMIN_UID) {
          setAllowed(false);
          router.replace(loginPath);
          return;
        }

        setAllowed(true);
      } catch {
        if (!active || requestVersion !== version) return;

        setAllowed(false);
        setError("Մուտքի ստուգումը չհաջողվեց։ Թարմացրու էջը։");
      }
    }

    const { data } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;

        if (session?.user.id !== ADMIN_UID) {
          version += 1;
          setAllowed(false);
          router.replace(loginPath);
        }
      }
    );

    void checkAccess();

    return () => {
      active = false;
      version += 1;
      data.subscription.unsubscribe();
    };
  }, [router, loginPath]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) throw error;

      setAllowed(false);
      router.replace(loginPath);
    } catch {
      setError("Դուրս գալը չհաջողվեց։ Փորձիր կրկին։");
    } finally {
      setLoggingOut(false);
    }
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6fb] p-6 text-center text-[#69429a]">
        <p role="status">
          {error || "Ստուգում ենք մուտքը..."}
        </p>
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-[#69429a]/10 bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="font-bold text-[#69429a]">
            Chupaboo · Ադմին
          </p>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#69429a]/20 px-4 py-2 text-sm font-semibold text-[#69429a] transition hover:bg-[#f0e9f8] disabled:cursor-wait disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Դուրս ենք գալիս..." : "Դուրս գալ"}
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mx-auto mt-3 max-w-6xl text-sm text-red-600"
          >
            {error}
          </p>
        )}
      </header>

      {children}
    </>
  );
}