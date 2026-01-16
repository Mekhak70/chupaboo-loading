"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/components/cart-provider"
import { useLanguage } from "@/components/language-provider"
import { formatPrice } from "@/lib/products"

export function CartSheet() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart()
  const { t } = useLanguage()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative bg-transparent">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
              {totalItems}
            </span>
          )}
          <span className="sr-only">{t("cart")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t("cart")} ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t("cartEmpty")}</p>
            <SheetTrigger asChild>
              <Button asChild>
                <Link href="/shop">{t("browseCakes")}</Link>
              </Button>
            </SheetTrigger>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 rounded-lg border border-border p-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <h4 className="font-semibold text-foreground">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.product.priceInCents)}</p>
                      <div className="mt-auto flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-transparent"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-transparent"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border p-4">
              <div className="mb-4 flex items-center justify-between text-lg font-bold">
                <span>{t("total")}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <SheetTrigger asChild>
                <Button asChild className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Link href="/checkout">{t("checkout")}</Link>
                </Button>
              </SheetTrigger>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
