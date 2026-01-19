'use client'

import { useState, useEffect, ReactNode } from "react"
import { Header } from "./header"
import { Footer } from "./footer"
import LoadingVideo from "./LoadingVideo"
import { CartProvider } from "./cart-provider"
import { LanguageProvider } from "./language-provider"
import { usePathname } from "next/navigation"

// TypeScript safe gtag declaration
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

// GA SPA tracking component
function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-9PTJYM3JSR', { page_path: pathname })
    }
  }, [pathname])

  return null
}

export function RootLayoutContent({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const [showVideo, setShowVideo] = useState(true)

  return (
    <LanguageProvider>
      <CartProvider>
        <AnalyticsTracker /> {/* SPA GA tracking */}

        {showVideo ? (
          <LoadingVideo onFinish={() => setShowVideo(false)} />
        ) : (
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        )}
      </CartProvider>
    </LanguageProvider>
  )
}
