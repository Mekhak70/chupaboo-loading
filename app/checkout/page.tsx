"use client"

import Link from "next/link"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CheckoutForm } from "@/components/checkout-form"
import { useCart } from "@/components/cart-provider"
import { useLanguage } from "@/components/language-provider"
import { formatPrice } from "@/lib/products"

export default function CheckoutPage() {
  const { items, totalPrice } = useCart()
  const { t } = useLanguage()

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <ShoppingCart className="h-20 w-20 text-muted-foreground/50" />
        <div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">{t("cartEmpty")}</h1>
          <p className="text-muted-foreground">{t("cartEmptyDesc")}</p>
        </div>
        <Button asChild>
          <Link href="/shop">{t("browseCakes")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="border-b border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToShop")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{t("checkout")}</h1>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-xl bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-card-foreground">{t("orderSummary")}</h2>
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.name} x {item.quantity}
                      </span>
                      <span className="font-medium text-foreground">
                        {formatPrice(item.product.priceInCents * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("total")}</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stripe Checkout */}
            <div className="lg:col-span-2">
              <CheckoutForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
