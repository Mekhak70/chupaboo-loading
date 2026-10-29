"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CakeSlice,
  Gift,
  PackageCheck,
  Plus,
  ImagePlus,
  ArrowLeft,
  LogOut,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const ADMIN_UID = "5d86c4c6-a328-47ae-8f8e-4fa97339de14";

type Section = "cake" | "party" | "available";

const sections = [
  {
    id: "cake" as const,
    title: "Տորթեր",
    description: "Ավելացրու նոր տորթ և դրա նկարագրությունը։",
    button: "Ավելացնել տորթ",
    icon: CakeSlice,
    color: "text-[#69429a]",
    background: "bg-[#f0e9f8]",
  },
  {
    id: "party" as const,
    title: "PartyShop",
    description: "Ավելացրու տոնական պարագաներ և աքսեսուարներ։",
    button: "Ավելացնել ապրանք",
    icon: Gift,
    color: "text-[#be5275]",
    background: "bg-[#fff0f5]",
  },
  {
    id: "available" as const,
    title: "Առկա տեսականի",
    description: "Ավելացրու պատրաստի և առկա ապրանքներ։",
    button: "Ավելացնել առկա ապրանք",
    icon: PackageCheck,
    color: "text-[#23856b]",
    background: "bg-[#eaf8f2]",
  },
];

const inputClass =
  "w-full rounded-xl border border-[#69429a]/15 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#69429a] focus:ring-2 focus:ring-[#69429a]/10";

export default function AdminPage() {
  const router = useRouter();
  const params = useParams();

  const language = params.locale ?? params.lang;

  const loginPath =
    typeof language === "string"
      ? `/${language}/admin/login`
      : "/admin/login";

  const [authStatus, setAuthStatus] = useState<
    "checking" | "allowed" | "denied" | "error"
  >("checking");

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const [activeSection, setActiveSection] = useState<Section | null>(
    null
  );

  const selected = sections.find(
    (section) => section.id === activeSection
  );

  // Էջը ցուցադրում ենք միայն ադմին հաշիվը ստուգելուց հետո։
  useEffect(() => {
    let active = true;
    let revision = 0;

    async function checkAccess() {
      const requestRevision = ++revision;

      try {
        const { data, error } = await supabase.auth.getUser();

        if (!active || requestRevision !== revision) return;

        if (error || data.user?.id !== ADMIN_UID) {
          setAuthStatus("denied");
          router.replace(loginPath);
          return;
        }

        setAuthStatus("allowed");
      } catch {
        if (!active || requestRevision !== revision) return;

        setAuthStatus("error");
      }
    }

    // Դուրս գալը կամ հաշվի փոփոխությունը անմիջապես փակում է էջը։
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;

        if (session?.user.id !== ADMIN_UID) {
          revision += 1;
          setAuthStatus("denied");
          router.replace(loginPath);
        }
      }
    );

    void checkAccess();

    return () => {
      active = false;
      revision += 1;
      listener.subscription.unsubscribe();
    };
  }, [router, loginPath]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) throw error;

      setAuthStatus("denied");
      router.replace(loginPath);
    } catch {
      setLogoutError("Դուրս գալը չհաջողվեց։ Փորձիր կրկին։");
    } finally {
      setLoggingOut(false);
    }
  }

  // Ստուգման ընթացքում ադմինի բովանդակությունը չի ցուցադրվում։
  if (authStatus !== "allowed") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6fb] p-6">
        <div className="text-center" role="status">
          {authStatus === "error" ? (
            <>
              <p className="text-sm text-red-600">
                Մուտքի ստուգումը չհաջողվեց։
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 cursor-pointer rounded-xl bg-[#69429a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7c4fb3]"
              >
                Կրկին փորձել
              </button>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#69429a]" />

              <p className="mt-4 text-sm font-medium text-[#69429a]">
                {authStatus === "checking"
                  ? "Ստուգում ենք մուտքը..."
                  : "Տեղափոխում ենք մուտքի էջ..."}
              </p>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6fb] px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex rounded-full border border-[#69429a]/10 bg-white px-3 py-1 text-xs font-semibold text-[#69429a]">
              CHUPABOO · ԿԱՌԱՎԱՐՈՒՄ
            </span>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#69429a]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#69429a] transition hover:bg-[#f0e9f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69429a] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}

              {loggingOut ? "Դուրս ենք գալիս..." : "Դուրս գալ"}
            </button>
          </div>

          {logoutError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
            >
              {logoutError}
            </p>
          )}

          <h1 className="mt-6 text-2xl font-bold text-gray-900 md:text-3xl">
            {selected ? selected.button : "Կառավարման վահանակ"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {selected
              ? "Լրացրու ապրանքի տվյալները։ Պահպանումը կավելացնենք հաջորդ փուլում։"
              : "Ընտրիր բաժինը՝ կայքում նոր ապրանք ավելացնելու համար։"}
          </p>
        </header>

        {!selected ? (
          <>
            {/* Welcome */}
            <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#69429a] to-[#8b5fcf] p-6 text-white md:p-8">
              <div
                aria-hidden="true"
                className="absolute -right-12 -top-16 h-56 w-56 rounded-full border-[32px] border-white/10"
              />

              <div className="relative max-w-xl">
                <p className="text-sm font-medium text-white/75">
                  Քո խանութը՝ մեկ վայրում
                </p>

                <h2 className="mt-3 text-xl font-bold md:text-2xl">
                  Ավելացրու նոր համեր և տոնական ապրանքներ
                </h2>

                <p className="mt-3 text-sm leading-7 text-white/80">
                  Տորթեր, PartyShop և առկա տեսականի․ յուրաքանչյուր
                  բաժնի համար նախատեսված է առանձին ձև։
                </p>
              </div>
            </section>

            {/* Sections */}
            <div className="grid gap-5 md:grid-cols-3">
              {sections.map((section) => {
                const Icon = section.icon;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className="group flex cursor-pointer flex-col items-start rounded-3xl border border-[#69429a]/10 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#69429a]/30 hover:shadow-lg hover:shadow-[#69429a]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69429a] focus-visible:ring-offset-2"
                  >
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${section.background} ${section.color}`}
                    >
                      <Icon className="h-7 w-7" />
                    </span>

                    <h2 className="mt-6 text-xl font-bold text-gray-900">
                      {section.title}
                    </h2>

                    <p className="mb-8 mt-2 text-sm leading-6 text-gray-500">
                      {section.description}
                    </p>

                    <span className="mt-auto flex items-center gap-2 text-sm font-semibold text-[#69429a]">
                      <Plus className="h-4 w-4" />
                      {section.button}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveSection(null)}
              className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-lg py-2 text-sm font-medium text-[#69429a] hover:text-[#8b5fcf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69429a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Բոլոր բաժինները
            </button>

            <form
              key={activeSection}
              onSubmit={(event) => event.preventDefault()}
              className="grid items-start gap-6 lg:grid-cols-[1fr_320px]"
            >
              {/* Product details */}
              <section className="rounded-3xl border border-[#69429a]/10 bg-white p-5 shadow-sm md:p-7">
                <h2 className="mb-6 text-lg font-bold text-gray-900">
                  Հիմնական տվյալներ
                </h2>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="product-name"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Ապրանքի անվանումը
                    </label>

                    <input
                      id="product-name"
                      type="text"
                      placeholder={
                        activeSection === "cake"
                          ? "Օրինակ՝ Հավով տոնական տորթ"
                          : activeSection === "party"
                            ? "Օրինակ՝ Տոնական գլխարկ"
                            : "Օրինակ՝ Թխվածքաբլիթների հավաքածու"
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="product-description"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Նկարագրություն
                    </label>

                    <textarea
                      id="product-description"
                      rows={5}
                      placeholder="Գրիր ապրանքի մասին..."
                      className={`${inputClass} resize-y`}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="product-price"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Գին · ֏
                      </label>

                      <input
                        id="product-price"
                        type="number"
                        min="0"
                        placeholder="0"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="product-detail"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {activeSection === "cake"
                          ? "Քաշ · գրամ"
                          : "Առկա քանակ · հատ"}
                      </label>

                      <input
                        id="product-detail"
                        type="number"
                        min="0"
                        placeholder={
                          activeSection === "cake" ? "500" : "10"
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {activeSection === "cake" && (
                    <div>
                      <label
                        htmlFor="cake-type"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Տորթի տեսակը
                      </label>

                      <select
                        id="cake-type"
                        defaultValue=""
                        className={inputClass}
                      >
                        <option value="" disabled>
                          Ընտրիր տեսակը
                        </option>
                        <option value="MEAT">Մսային</option>
                        <option value="FRUIT">Մրգային</option>
                        <option value="VEGETABLES">
                          Բանջարեղենային
                        </option>
                      </select>
                    </div>
                  )}

                  {activeSection === "available" && (
                    <div>
                      <label
                        htmlFor="ingredients"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Բաղադրություն
                      </label>

                      <textarea
                        id="ingredients"
                        rows={3}
                        placeholder="Նշիր ապրանքի բաղադրիչները..."
                        className={`${inputClass} resize-y`}
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Image and publishing */}
              <aside className="space-y-6">
                <section className="rounded-3xl border border-[#69429a]/10 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900">
                    Ապրանքի նկար
                  </h2>

                  <div className="mt-4 flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#69429a]/20 bg-[#faf8fd] p-6 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0e9f8] text-[#69429a]">
                      <ImagePlus className="h-7 w-7" />
                    </span>

                    <p className="mt-4 text-sm font-semibold text-[#69429a]">
                      Նկարի տեղը
                    </p>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Նկարների ներբեռնումը կավելացնենք հաջորդ փուլում։
                    </p>
                  </div>
                </section>

                <section className="rounded-3xl border border-[#69429a]/10 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900">
                    Հրապարակում
                  </h2>

                  <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 accent-[#69429a]"
                    />
                    Ցուցադրել կայքում
                  </label>

                  <button
                    type="submit"
                    disabled
                    className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-[#69429a] px-4 py-3 text-sm font-semibold text-white opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Պահպանել ապրանքը
                  </button>

                  <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                    Ձևի նախադիտում․ տվյալները չեն պահպանվում։
                  </p>
                </section>
              </aside>
            </form>
          </>
        )}
      </div>
    </main>
  );
}