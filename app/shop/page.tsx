"use client"

import { useState } from "react"
import Link from "next/link"
import { Dog, Cat, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { useLanguage } from "@/components/language-provider"
import { PRODUCTS } from "@/lib/products"

type Filter = "all" | "dog" | "cat"

export default function ShopPage() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<Filter>("all")

  const filteredProducts =
    filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter || p.category === "all")

  const filters: { value: Filter; label: string; icon: typeof Dog }[] = [
    { value: "all", label: t("allPets"), icon: Sparkles },
    { value: "dog", label: t("forDogs"), icon: Dog },
    { value: "cat", label: t("forCats"), icon: Cat },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              {t("shopTitle")}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">{t("shopDesc")}</p>
          </div>
        </div>
      </section>

      {/* Filter & Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Filter Buttons */}
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                onClick={() => setFilter(f.value)}
                className={filter === f.value ? "bg-primary text-primary-foreground" : ""}
              >
                <f.icon className="mr-2 h-4 w-4" />
                {f.label}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">{t("customOrdersWelcome")}</h2>
            <p className="mb-6 text-muted-foreground">{t("customOrdersDesc")}</p>
            <Button asChild variant="outline">
              <Link href="/contact">{t("contactUs")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
