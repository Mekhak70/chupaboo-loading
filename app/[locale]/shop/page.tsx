"use client"

import { useState } from "react"
import Link from "next/link"
import { Dog, Cat, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { useLanguage } from "@/components/language-provider"
import { PRODUCTS } from "@/lib/products"
import Image from "next/image"
import Arrow from "@/public/arrow.png"
import Cake from "@/public/cake.png"
import { useParams } from "next/navigation"


type Filter = "all" | "small" | "standart" 

export default function ShopPage() {
    const { locale } = useParams()
  
  const { t } = useLanguage()
  const [filter, setFilter] = useState<Filter>("all")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [type, setType] = useState<string>("")
  const [creamType, setCreamType] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const filteredProducts =
    filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter)



  const handleSelectImage = (image: any) => {
    setSelectedImage(image.src)  
    setPendingImage(image.src)   
    setIsModalOpen(true)
  }
  const SITE_URL = "https://www.chupaboo.com"


  const whatsappMessage = selectedImage
    ? `Բարև, ուզում եմ պատվիրել այս տորթը լինի ${type} և ${creamType}։ Նկարը՝ ${SITE_URL}${selectedImage}`
    : "Բարև, ուզում եմ պատվիրել տորթ"

  const whatsappLink = `https://wa.me/37433775750?text=${encodeURIComponent(
    whatsappMessage
  )}`

  return (
    <>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/10 py-16 md:py-24" style={{ background: '#69429a' }}>
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl" style={{ color: '#fff' }}>
                {t("shopTitle")}
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl" style={{ color: '#fff' }}>{t("shopDesc")}</p>
            </div>
          </div>
        </section>

        {/* Filter & Products */}
        <section >
          <div className="container mx-auto px-4">
            {/* Filter Buttons */}
            {/* <div className="mb-8 flex flex-wrap justify-center gap-3">
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                onClick={() => setFilter(f.value)}
                className={filter === f.value ? "bg-primary text-primary-foreground" : ""}
              >
                <f.icon className="mr-2 h-4 w-4" />
                {f.label}
              </Button>
            ))}
          </div> */}


            {/* Products Grid */}
            
            <section className="bg-white py-10">
          <div className="container mx-auto px-4">
            {/* FILTER BUTTONS */}
            <div className="flex gap-4 justify-center mb-6 text-sm font-medium flex-wrap" style={{ paddingBottom: '20px' }}>
              <button 
                onClick={() => setFilter('all')} 
                style={{ 
                  padding: '10px 15px', 
                  background: filter === 'all' ? '#aed137' : '#69429a', 
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
                {t("all")}
              </button>
              <button 
                onClick={() => setFilter('small')} 
                style={{ 
                  padding: '10px 15px', 
                  background: filter === 'small' ? '#aed137' : '#69429a', 
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
                {t("mini")}
              </button>
              <button 
                onClick={() => setFilter('standart')} 
                style={{ 
                  padding: '10px 15px', 
                  background: filter === 'standart' ? '#aed137' : '#69429a', 
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
                {t("standard")}
              </button>
            </div>

            {/* PRODUCTS GRID */}
            <div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              style={{ paddingTop: "10px" }}
            >
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

            {/* ORDER BUTTON */}
            {/* <div className="container mx-auto py-10 text-center bg-white">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-lg transition"
                style={{ backgroundColor: "#69429a" }}
              >
                {t("orderNow")}
              </a>
            </div> */}
          </div>
        </section>

        {/* Info Section */}
        <section className="border-t border-border bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Image src={Cake} alt="cake" width={40} height={40} className="mb-4 mx-auto" priority/>
              <h2 className="mb-4 text-2xl font-bold text-foreground" style={{ color: '#69429a' }}>{t("customOrdersWelcome")}</h2>
              <p className="mb-6 text-muted-foreground" style={{ color: '#69429a' }}>{t("customOrdersDesc")}</p>
              <Button
                asChild
                variant="outline"
                style={{ backgroundColor: '#69429a', color: '#fff' }}
              >
                <a
                  href="https://wa.me/37433775750"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("contactUs")}
                </a>
              </Button>

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
