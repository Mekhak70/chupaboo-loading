import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Chupaboo",
  description: "Coming soon.",
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
