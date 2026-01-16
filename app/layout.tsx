// 'use client'

// import type React from "react"
// import type { Metadata } from "next"
// import { Nunito } from "next/font/google"
// import { Analytics } from "@vercel/analytics/next"
// import "./globals.css"
// import { LanguageProvider } from "@/components/language-provider"
// import { Header } from "@/components/header"
// import { Footer } from "@/components/footer"
// import { CartProvider } from "@/components/cart-provider"
// import LoadingVideo from "@/components/LoadingVideo"
// import { useState } from "react"

// const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"] })

// export const metadata: Metadata = {
//   title: "Chupaboo",
//   description: "Chupaboo makes pet-safe cakes and treats for birthdays and special occasions.",
//   icons: {
//     icon: [
//       { url: "/logo-1.png" },
//       { url: "/logo.png", sizes: "32x32", type: "image/png" },
//       { url: "/logo.png", sizes: "16x16", type: "image/png" },
//     ],
//     apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
//     shortcut: ["/logo-1.png"],
//   },
//   openGraph: {
//     title: "Chupaboo",
//     description: "Chupaboo makes pet-safe cakes and treats for birthdays and special occasions.",
//     url: "https://www.chupaboo.com/",
//     siteName: "Chupaboo",
//     images: [
//       {
//         url: "/logo-1.png",
//         width: 1200,
//         height: 630,
//         alt: "Chupaboo Preview",
//       },
//     ],
//     locale: "en_US",
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Chupaboo",
//     description: "Chupaboo makes pet-safe cakes and treats for birthdays and special occasions.",
//     images: ["/logo-1.png"],
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   const [showVideo, setShowVideo] = useState(true)

//   return (
//     <html lang="en">
//       <body className={`font-sans antialiased`}>
//         <LanguageProvider>
//           <CartProvider>
//           {showVideo && <LoadingVideo onFinish={() => setShowVideo(false)} />}
       
//             <div className="flex min-h-screen flex-col">
//               <Header />
//               <main className="flex-1">{children}</main>
//               <Footer />
//             </div>
//           </CartProvider>
//         </LanguageProvider>
//         <Analytics />
//       </body>
//     </html>
//   )
// }















import type { Metadata } from "next"
import { RootLayoutContent } from "@/components/RootLayoutContent"
import { Nunito } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"] })

export const metadata: Metadata = {
  title: "Chupaboo",
  description: "Chupaboo makes pet-safe cakes and treats for birthdays and special occasions.",
  icons: {
    icon: [
      { url: "/logo-1.png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/logo-1.png"],
  },
  openGraph: {
    title: "Chupaboo",
    description: "Chupaboo makes pet-safe cakes and treats for birthdays and special occasions.",
    url: "https://www.chupaboo.com/",
    siteName: "Chupaboo",
    images: [
      {
        url: "/logo-1.png",
        width: 1200,
        height: 630,
        alt: "Chupaboo Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chupaboo",
    description: "Chupaboo makes pet-safe cakes and treats for birthdays and special occasions.",
    images: ["/logo-1.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.className}>
      <body className="font-sans antialiased">
        <RootLayoutContent>{children}</RootLayoutContent>
        <Analytics />
      </body>
    </html>
  )
}
