"use client"

import Image from "next/image"
import { Filter, Heart, Shield, Sparkles } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useMemo, useState } from "react"
import { PRODUCTS } from "@/lib/products"
import MainImgAm from "@/public/home-arm.png"
import MainImgRu from "@/public/home-rus.png"
import MainImgEn from "@/public/home-eng.png"
import MainImgPl from "@/public/home-pl.png"
import PetSlider from "@/components/PetSlider"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { StaticImport } from "next/dist/shared/lib/get-img-props"

type Filter = "all" | "meat" | "vegetable" | "fruit" | "small" | "standart"

interface Product {
  id: string | number
  name: string
  image: string | StaticImport
  category: Filter
}

export default function HomePage() {
  const { t, language } = useLanguage()
  const [filter, setFilter] = useState<Filter>("all")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [type, setType] = useState<string>("")
  const [creamType, setCreamType] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const router = useRouter()

  const { locale } = useParams()
  const SITE_URL = "https://www.chupaboo.com"

  const features = [
    { icon: Heart, title: t("handmade"), description: t("handmadeDesc") },
    { icon: Shield, title: t("petSafe"), description: t("petSafeDesc") },
    { icon: Sparkles, title: t("freshDaily"), description: t("freshDailyDesc") },
  ]

  // useMemo-ով ֆիլտրացիան օպտիմիզացնելու համար
  const filteredProducts = useMemo(() => {
    if (filter === "all") return PRODUCTS
    return PRODUCTS.filter((product) => product.category === filter)
  }, [filter])

  const handleSelectImage = (image: any) => {
    setSelectedImage(image.src)
    setPendingImage(image.src)
    setIsModalOpen(true)
  }

  const whatsappMessage = pendingImage
    ? `${t('whatsappMessageTextOne')}  

${type} ${creamType}։ ${t('imageLabel')} ${SITE_URL}${pendingImage}`
    : t('whatsappMessageText')

  const whatsappLink = `https://wa.me/37433775750?text=${encodeURIComponent(whatsappMessage)}`

  // =======================
  // Telegram send (same file)
  // =======================
  

  return (
    <>
      <div className="flex flex-col" style={isModalOpen ? { position: 'fixed' } : {}}>
        {/* HERO */}
        <section className="relative overflow-hidden" style={{ background: "#69429a" }}>
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="grid items-center gap-8 md:grid-cols-2 pl-[100px] max-lg:pl-0">
              <Image
                src={
                  language === "ru" ? MainImgRu
                    : language === "en" ? MainImgEn
                      : language === "pl" ? MainImgPl
                        : MainImgAm
                }
                alt="Pet cake hero"
                width={1100}
                height={830}
                className="rounded-2xl object-cover mx-auto scale-130 max-md:scale-110 max-sm:scale-100"
                priority
              />
              <div className="relative mx-auto w-full max-w-md">
                <PetSlider />
              </div>
            </div>
          </div>
        </section>

        {/* WAVE */}
        <div className="mt-0 [@media(max-width:648px)]:mt-[-1px]" style={{ backgroundColor: "#fff", height: "120px" }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-full h-[120px]">
            <path d="M0 120 C 300 40, 400 20, 600 40 S 1000 120, 1200 0 V 0 H 0 Z" fill="#69429a"/>
          </svg>
        </div>

        {/* PRODUCTS */}
        <section className="bg-white py-10">
          <div className="container mx-auto px-4">
            <div className="flex gap-4 justify-center mb-6 text-sm font-medium flex-wrap" style={{ paddingBottom: '20px' }}>
              {["all", "small", "standart"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f as Filter)
                  }}
                  style={{
                    padding: '10px 15px',
                    background: filter === f ? '#aed137' : '#69429a',
                    color: '#fff',
                    borderRadius: '20px',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  {t(f === "all" ? "all" : f === "small" ? "mini" : "standard")}
                </button>
              ))}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ paddingTop: "10px" }}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/${locale}/product/${product.id}`}
                   
                    className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group block"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500 text-lg">Ապրանքներ չկան</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="bg-white py-16 border-t">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center gap-4 rounded-xl bg-card p-6 text-center shadow-sm hover:shadow-md">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "#69429a" }}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 450px) {
          .responsive-text {
            font-size: 10.5px !important;
            line-height: 1.2;
            gap: 6px !important;
          }
        }
      `}</style>
    </>
  )
}