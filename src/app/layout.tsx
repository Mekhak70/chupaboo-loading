import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Chupaboo",
  description: "A minimal responsive Next.js starter with header, footer, and 3 pages.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy">
      <body>
        {/* <Header /> */}
        <main className="container main">{children}</main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
