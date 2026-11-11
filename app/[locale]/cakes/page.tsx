"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { getCatalogCakes, type CatalogCake } from "@/lib/catalog-cakes"
import Cake from "@/public/cake.png"
import cakesBanner from "@/public/banner-our-cakes.png"

type Filter = "all" | "small" | "midi" | "standart"
const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "all" },
  { value: "small", label: "mini" },
  { value: "midi", label: "midi" },
  { value: "standart", label: "standard" },
]

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.2 3.5a1 1 0 0 1 1.1.22l7 7.5a1.15 1.15 0 0 1 0 1.56l-7 7.5A1 1 0 0 1 12.5 19.6V15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h8.5V4.4a1 1 0 0 1 .7-.9Z" />
    </svg>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-[#69429a]" role="status">Բեռնվում է…</div>}>
      <ShopContent />
    </Suspense>
  )
}

function ShopContent() {
  const params = useParams()
  const locale = (Array.isArray(params.locale) ? params.locale[0] : params.locale) || "hy"
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [products, setProducts] = useState<CatalogCake[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const copy = locale === "ru"
    ? { details: "Подробнее", loading: "Загрузка…", retry: "Попробовать снова", error: "Не удалось загрузить торты", banner: "Наши торты" }
    : locale === "pl"
      ? { details: "Zobacz więcej", loading: "Ładowanie…", retry: "Spróbuj ponownie", error: "Nie udało się załadować tortów", banner: "Nasze torty" }
      : locale === "en"
        ? { details: "View details", loading: "Loading…", retry: "Try again", error: "Unable to load cakes", banner: "Our cakes" }
        : { details: "Տեսնել ավելին", loading: "Բեռնվում է…", retry: "Կրկին փորձել", error: "Չհաջողվեց բեռնել տորթերը", banner: "Մեր տորթերը" }

  const basePriceLabel = locale === "ru" ? "Базовая цена" : locale === "pl" ? "Cena bazowa" : locale === "en" ? "Base price" : "Բազային գին"
  const priceFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })

  const queryFilter = searchParams.get("filter")
  const filter: Filter = filters.find(item => item.value === queryFilter)?.value ?? "all"
  const filteredProducts = useMemo(
    () => products.filter(product => filter === "all" || product.category === filter),
    [products, filter],
  )

  function handleFilterChange(value: Filter) {
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set("filter", value)
    router.push(`${pathname}?${nextParams.toString()}`, { scroll: false })
  }

  useEffect(() => {
    const controller = new AbortController()
    async function loadProducts() {
      setLoading(true)
      setLoadError(null)
      try {
        const cakes = await getCatalogCakes(controller.signal)
        if (!controller.signal.aborted) setProducts(cakes)
      } catch {
        if (!controller.signal.aborted) setLoadError("catalog")
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void loadProducts()
    return () => controller.abort()
  }, [retryKey])

  return (
    <div className="flex flex-col bg-white">
      <section aria-label={copy.banner}>
        <Image src={cakesBanner} alt={copy.banner} priority sizes="100vw" className="h-auto w-full" />
      </section>

      <section className="px-3 py-7 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 flex flex-wrap justify-center gap-2 sm:mb-10 sm:gap-3" role="group" aria-label={locale === "hy" ? "Տորթի չափը" : locale === "ru" ? "Размер торта" : locale === "pl" ? "Rozmiar tortu" : "Cake size"}>
            {filters.map(item => (
              <button
                key={item.value}
                type="button"
                aria-pressed={filter === item.value}
                onClick={() => handleFilterChange(item.value)}
                className={`min-h-11 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69429a] focus-visible:ring-offset-4 sm:px-6 sm:text-base ${filter === item.value ? "border-[#69429a] bg-[#69429a] text-white shadow-md shadow-purple-900/10" : "border-[#e9e1f1] bg-[#f8f6fb] text-[#69429a] hover:border-[#69429a] hover:bg-[#f0eaf6]"}`}
              >
                {t(item.label)}
              </button>
            ))}
          </div>

          {loadError ? (
            <div className="flex min-h-[35vh] flex-col items-center justify-center gap-5 rounded-3xl bg-[#f8f6fb] px-4 text-center">
              <p role="alert" className="text-[#69429a]">{copy.error}</p>
              <Button onClick={() => setRetryKey(value => value + 1)} className="rounded-full bg-[#69429a] px-6 text-white hover:bg-[#573481]">{copy.retry}</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3" aria-busy={loading}>
              {loading ? (
                <>
                  <span role="status" className="sr-only">{copy.loading}</span>
                  {Array.from({ length: 6 }, (_, index) => (
                    <div key={index} aria-hidden="true" className="aspect-square animate-pulse rounded-2xl bg-[#f0eaf6] motion-reduce:animate-none sm:rounded-3xl" />
                  ))}
                </>
              ) : filteredProducts.length ? filteredProducts.map(product => {
                const price = product.price
                return (
                <Link
                  key={product.id}
                  href={`/${locale}/product/${encodeURIComponent(product.id)}`}
                  aria-label={`${product.name} — ${copy.details}`}
                  className="group relative block min-w-0 overflow-hidden rounded-2xl bg-[#f8f6fb] shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-purple-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69429a] focus-visible:ring-offset-4 sm:rounded-3xl"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      unoptimized
                      alt={product.name}
                      fill
                      sizes="(min-width: 1200px) 384px, (min-width: 1024px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                    />
                  </div>
                  <div className="flex items-end justify-between gap-2 border-t border-[#eee8f4] bg-white px-3 py-3 text-[#69429a] sm:px-5 sm:py-4">
                    <div className="min-w-0">
                    <span className="mb-1 block text-[10px] font-medium text-[#897597] sm:text-xs">{basePriceLabel}</span>
                    <span className="flex flex-wrap items-baseline gap-1.5 text-lg font-bold tracking-tight sm:text-2xl">
                      {priceFormatter.format(price)}
                      <span className="text-[10px] font-semibold text-[#897597] sm:text-xs">AMD</span>
                    </span>
                    </div>
                    <span className="cake-explore" aria-hidden="true" >
                      <span className="explore-arrow"><ArrowIcon /></span>
                    </span>
                  </div>
                </Link>
              )}) : (
                <div className="col-span-full rounded-3xl bg-[#f8f6fb] px-5 py-16 text-center text-[#69429a]">
                  {t("noProductsAvailable")}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[#eee8f4] bg-[#f8f6fb] px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Image src={Cake} alt="" width={40} height={40} />
          </div>
          <h2 className="mb-4 text-xl font-bold leading-snug text-[#69429a] sm:text-3xl">{t("customOrdersWelcome")}</h2>
          <p className="mx-auto mb-7 max-w-xl text-sm leading-relaxed text-[#78638d] sm:text-base">{t("customOrdersDesc")}</p>
          <Button asChild className="h-auto rounded-full bg-[#69429a] px-7 py-3 text-white shadow-sm hover:bg-[#573481]">
            <a href="https://wa.me/37433775750" target="_blank" rel="noopener noreferrer">{t("contactUs")}</a>
          </Button>
        </div>
      </section>
      <style jsx>{`
        .cake-explore {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f3edf8;
          color: #69429a;
          transition: background .2s ease, transform .2s ease;
        }
        .explore-arrow { display: flex; }
        :global(a:focus-visible) .cake-explore {
          background: #e8daf3;
        }
        @media (hover: hover) {
          :global(a:hover) .cake-explore {
            background: #e8daf3;
            transform: translateX(2px);
          }
        }
        @media (min-width: 640px) {
          .cake-explore { width: 36px; height: 36px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cake-explore { transition: none; }
          :global(a:hover) .cake-explore { transform: none; }
        }
      `}</style>
    </div>
  )
}
