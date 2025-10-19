import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chupaboo",
  description: "Coming soon.",
  icons: {
    icon: [
      { url: "/logo-1.png" }, 
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" }, // ✅ Apple devices
    ],
    shortcut: ["/logo-1.png"], 
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
        alt: "Chupaboo Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chupaboo",
    description: "Coming soon.",
    images: ["/logo-1.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hy">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
          <meta name="theme-color" content="#2436c1" />

      </head>
      <body>
        <main className="container main">{children}</main>
      </body>
    </html>
  );
}
