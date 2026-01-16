'use client'
import { useState } from "react"
import { Header } from "./header"
import { Footer } from "./footer"
import LoadingVideo from "./LoadingVideo"
import { CartProvider } from "./cart-provider"
import { LanguageProvider } from "./language-provider"

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const [showVideo, setShowVideo] = useState(true)

  return (
    <LanguageProvider>
      <CartProvider>
        {showVideo ? <LoadingVideo onFinish={() => setShowVideo(false)} />:
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>}
      </CartProvider>
    </LanguageProvider>
  )
}
