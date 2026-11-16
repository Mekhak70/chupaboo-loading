import "./globals.css"

import type { ReactNode } from "react"
import localFont from "next/font/local"
import { LanguageProvider } from "@/components/language-provider"

import {
  CartProvider as StoreCartProvider,
} from "@/components/cart-context"

import {
  CartProvider as CheckoutCartProvider,
} from "@/components/cart-provider"

const nunito = localFont({
  src: "../public/fonts/nunito/Nunito-Variable.ttf",
  weight: "200 1000",
  style: "normal",
  display: "swap",
  variable: "--font-nunito",
})

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="hy" className={nunito.variable}>
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