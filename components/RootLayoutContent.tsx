
"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Header } from "./header"
import { Footer } from "./footer"
import LoadingVideo from "./LoadingVideo"
import { CartProvider } from "./cart-provider"
import { LanguageProvider } from "./language-provider"
import { usePathname } from "next/navigation"

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("config", "G-9PTJYM3JSR", {
        page_path: pathname,
      })
    }
  }, [pathname])

  return null
}

export function RootLayoutContent({
  children,
  params,
}: {
  children: ReactNode
  params: { locale: string }
}) {
  const [showVideo, setShowVideo] = useState(true)

  return (
    <LanguageProvider>
      <CartProvider>
        <AnalyticsTracker />

        {/* Main website content */}
        <div className="flex min-h-screen flex-col">
          <Header />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </div>

        {/* Loading video overlay */}
        {showVideo && (
          <div className="fixed inset-0 z-[99999] overflow-hidden bg-white">
            <LoadingVideo
              onFinish={() => setShowVideo(false)}
            />
          </div>
        )}
      </CartProvider>
    </LanguageProvider>
  )
}
