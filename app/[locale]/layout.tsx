import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Analytics } from "@vercel/analytics/next"
import { RootLayoutContent } from "@/components/RootLayoutContent"

const SITE_URL = "https://www.chupaboo.com"

const seo = {
  en: {
    title: "Natural Ingredient Pet Cakes",
    description:
      "Order safe and delicious pet cakes made with natural ingredients for your beloved pets.",
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
    title: "Բնական բաղադրիչներով տորթեր կենդանիների համար",
    description:
      "Պատվիրեք բնական բաղադրիչներով պատրաստված անվտանգ և համեղ տորթեր ձեր կենդանիների համար։",
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
    title: "Торты для животных из натуральных ингредиентов",
    description:
      "Закажите безопасные и вкусные торты для ваших питомцев, приготовленные из натуральных ингредиентов.",
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
    title: "Torty dla zwierząt z naturalnych składników",
    description:
      "Zamów bezpieczne i smaczne torty dla swoich pupili, przygotowane z naturalnych składników.",
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

type Locale = keyof typeof seo

const openGraphLocales: Record<Locale, string> = {
  en: "en_US",
  hy: "hy_AM",
  ru: "ru_RU",
  pl: "pl_PL",
}

function getLocale(value: string): Locale {
  return Object.prototype.hasOwnProperty.call(seo, value)
    ? (value as Locale)
    : "en"
}

interface LayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: requestedLocale } = await params
  const locale = getLocale(requestedLocale)
  const lang = seo[locale]

  return {
    metadataBase: new URL(SITE_URL),
    title: lang.title,
    description: lang.description,
    keywords: lang.keywords,
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
    openGraph: {
      title: lang.title,
      description: lang.description,
      url: `${SITE_URL}/${locale}`,
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
      locale: openGraphLocales[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: lang.title,
      description: lang.description,
      images: ["/logo-1.png"],
    },
    alternates: {
      languages: {
        en: `${SITE_URL}/en`,
        hy: `${SITE_URL}/hy`,
        ru: `${SITE_URL}/ru`,
        pl: `${SITE_URL}/pl`,
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params

  return (
    <RootLayoutContent params={{ locale }}>
      {children}
      <Analytics />
    </RootLayoutContent>
  )
}