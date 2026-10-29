"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_UID = "5d86c4c6-a328-47ae-8f8e-4fa97339de14";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const params = useParams();

const language = params.locale ?? params.lang;
const adminPath =
  typeof language === "string" ? `/${language}/admin` : "/admin";

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError("Մուտքը չհաջողվեց։ Ստուգիր էլ․ փոստն ու գաղտնաբառը։");
        return;
      }

      if (data.user?.id !== ADMIN_UID) {
        await supabase.auth.signOut();
        setError("Այս հաշիվը ադմինի իրավունք չունի։");
        return;
      }

      router.replace(adminPath);
    } catch {
      setError("Միացման սխալ։ Փորձիր կրկին։");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f5f0fa] via-white to-[#ede5f7] p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#69429a]/15 bg-white p-6 shadow-xl shadow-[#69429a]/10 sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-3xl font-bold text-[#69429a]">
            Chupaboo
          </p>

          <h1 className="mt-3 text-xl font-semibold text-gray-800">
            Մուտք ադմին բաժին
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#69429a]"
            >
              Էլ․ փոստ
            </label>

            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-[#69429a]/20 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-[#69429a] focus:ring-2 focus:ring-[#69429a]/15 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#69429a]"
            >
              Գաղտնաբառ
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-[#69429a]/20 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-[#69429a] focus:ring-2 focus:ring-[#69429a]/15 disabled:opacity-60"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-xl bg-[#69429a] px-4 py-3 font-semibold text-white shadow-md shadow-[#69429a]/20 transition hover:bg-[#7c4fb3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69429a] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Մուտք ենք գործում..." : "Մուտք գործել"}
          </button>
        </form>
      </div>
    </main>
  );
}