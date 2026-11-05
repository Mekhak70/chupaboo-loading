import "./globals.css"

import type { ReactNode } from "react"
import { Nunito } from "next/font/google"
import { LanguageProvider } from "@/components/language-provider"

import {
  CartProvider as StoreCartProvider,
} from "@/components/cart-context"

import {
  CartProvider as CheckoutCartProvider,
} from "@/components/cart-provider"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
})

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="hy" className={nunito.className}>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <StoreCartProvider>
            <CheckoutCartProvider>
              {children}
            </CheckoutCartProvider>
          </StoreCartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}