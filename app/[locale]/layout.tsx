import type { Metadata } from "next"
import { RootLayoutContent } from "@/components/RootLayoutContent"
import { Nunito } from "next/font/google"
import "@/app/globals.css"
import Script from "next/script" 
import { Analytics } from "@vercel/analytics/next"
import type { ReactNode, JSX } from "react";


const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"] })

// TypeScript check

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
  const { locale } = await params
  const seo = {
    en: {
      title: "Pet Cakes & Dog Birthday Cakes | Chupaboo",
      description:
        "Pet-safe cakes and treats for dogs and pets. Dog birthday cakes, custom pet cakes for birthdays and special occasions by Chupaboo.",
      keywords: [
        "cake",
        "pet cakes",
        "dog cakes",
        "dog birthday cake",
        "cakes for dogs",
        "pet birthday cake",
        "custom pet cakes",
        "animal cakes",
        "puppy cakes",
        "healthy dog treats",
        "special occasion pet cakes",
        "dog party treats",
        "dog celebration cake",
        "homemade dog cake",
        "birthday cake for pets",
        "pet-friendly desserts",
        "pet cake delivery",
        "organic dog cake",
        "birthday treats for dogs",
        "custom dog cakes",
        "dog cake online",
      ],
    },
    hy: {
      title: "Կենդանիների տորթեր և շների ծննդյան տորթեր | Chupaboo",
      description:
        "Անվտանգ և համեղ տորթեր շների և կենդանիների համար։ Շան ծննդյան տորթեր հատուկ առիթների համար։",
      keywords: [
        "տորթ",
        "կենդանիների տորթեր",
        "շների տորթեր",
        "շան ծնունդ",
        "շան ծննդյան տորթ",
        "տորթեր կենդանիների համար",
        "հատուկ պատվերի տորթեր",
        "տորթ շների համար",
        "տորթ տարիքի առիթներով",
        "ընտանի կենդանու տորթ",
        "տորթեր կենդանիների համար Երևան",
        "տորթ շունկանի համար",
        "տորթ պատվերով շների",
        "շների համար տորթ առաքում",
        "համեղ տորթեր շների",
        "տորթեր ընտանի կենդանիների համար",
        "տորթ շների ծննդյան",
        "հատուկ տորթեր կենդանիների համար",
      ],
    },
    ru: {
      title: "Торты для собак и животных | Chupaboo",
      description:
        "Безопасные торты и лакомства для собак. Торты на день рождения для собак и особых случаев.",
      keywords: [
        "торт",
        "торты для собак",
        "торт для животных",
        "день рождения собаки",
        "торт на заказ для собак",
        "праздничные торты для животных",
        "торт для щенка",
        "здоровые лакомства для собак",
        "торты на особые случаи",
        "торты для питомцев",
        "собачий торт на день рождения",
        "торт для домашних животных",
        "торт для собаки доставка",
        "домашние торты для собак",
        "торт для любимца",
        "подарочные торты для собак",
        "органические торты для собак",
        "собачьи сладости",
        "вкусы тортов",
      ],
    },
    pl: {
      title: "Torty dla psów i zwierząt | Chupaboo",
      description:
        "Bezpieczne torty dla psów i zwierząt. Torty urodzinowe dla psów na specjalne okazje.",
      keywords: [
        "tort",
        "torty dla psów",
        "tort urodzinowy dla psa",
        "torty dla zwierząt",
        "bezpieczne torty dla psów",
        "tort dla szczeniaka",
        "tort dla pupila",
        "torty na specjalne okazje",
        "urodzinowy tort dla psa",
        "tort dla zwierząt domowych",
        "domowe torty dla psów",
        "zdrowe smakołyki dla psów",
        "torty na zamówienie dla psa",
        "torty na przyjęcie psa",
        "słodkości dla psa",
        "tort dla zwierząt na prezent",
        "tort organiczny dla psa",
        "torty dla psów online",
        "smaki tortów",
      ],
    },
  }

  const lang = seo[locale as keyof typeof seo] ?? seo.en

  return {
    title: lang.title,
    description: lang.description,
    keywords: lang.keywords,
    openGraph: {
      title: lang.title,
      description: lang.description,
      url: `https://www.chupaboo.com/${locale}`,
      siteName: "Chupaboo",
      type: "website",
      images: [
        {
          url: "/logo-1.png",
          width: 1200,
          height: 630,
          alt: lang.title,
        },
      ],
      locale:
        locale === "en"
          ? "en_US"
          : locale === "hy"
          ? "hy_AM"
          : locale === "ru"
          ? "ru_RU"
          : "pl_PL",
    },
    twitter: {
      card: "summary_large_image",
      title: lang.title,
      description: lang.description,
      images: ["/logo-1.png"],
    },
    alternates: {
      languages: {
        en: "https://www.chupaboo.com/en",
        hy: "https://www.chupaboo.com/hy",
        ru: "https://www.chupaboo.com/ru",
        pl: "https://www.chupaboo.com/pl",
      },
    },
  }
}

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}
export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  return (
    <html lang={locale} className={nunito.className}>
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-9PTJYM3JSR"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9PTJYM3JSR', { page_path: window.location.pathname });
          `}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <RootLayoutContent params={{ locale }}>{children}</RootLayoutContent>
        <Analytics />
      </body>
    </html>
  );
}

function fetchSomeData(locale: string) {
  throw new Error("Function not implemented.")
}

