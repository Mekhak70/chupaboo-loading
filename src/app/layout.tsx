import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Chupaboo",
  description: "Coming soon.",
  icons: {
    icon: [
      { url: "/logo.png" }, // ✅ հիմնական favicon
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180" },
    ],
    shortcut: ["/logo.png"],
  },
  openGraph: {
    title: "Chupaboo",
    description: "Coming soon.",
    url: "https://www.chupaboo.com/",
    siteName: "Chupaboo",
    images: [
      {
        url: "/logo-1.png",
        width: 1200,
        height: 630,
        alt: "Preview image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chupaboo",
    description: "Coming soon.",
    images: ["/logo.png"],
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy">
      <head>
      <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap"
          rel="stylesheet"
        />

      </head>
      <body>
        {/* <Header /> */}
        <main className="container main">{children}</main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
