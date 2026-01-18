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


type Filter = "all" | "vegetable" | "fruit" | "meat" | "dog" | "cat"

export default function ShopPage() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<Filter>("all")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [type, setType] = useState<string>("")
  const [creamType, setCreamType] = useState<string>("")
  const filteredProducts =
    filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter || p.category === "all")

  const filters: { value: Filter; label: string; icon: typeof Dog }[] = [
    { value: "all", label: t("allPets"), icon: Sparkles },
    { value: "dog", label: t("forDogs"), icon: Dog },
    { value: "cat", label: t("forCats"), icon: Cat },
  ]

  const handleSelectImage = (image: any) => {
    console.log(image, "selected image");

    setSelectedImage(image.src)
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
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl" style={{ color: '#69429a' }}>
              {t("shopTitle")}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl" style={{color:'#69429a'}}>{t("shopDesc")}</p>
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
          <div className="max-w-4xl mx-auto text-center mb-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h2 className="text-3xl font-bold mb-8 text-[#69429a]">
             {t('CREATEYOURPETSCAKE')}
            </h2>
            <Image src={Arrow} alt="aroww" width={30} height={40} style={{ padding: '0 0 2px 0' }} />
            <p className="text-lg text-[#69429a]">
              {t('choosemaincake')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center', alignItems: 'center', paddingTop: '4px' }}>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }} className="responsive-text">
                <div className="responsive-text"  style={{ background: '#ef4f27', fontSize: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }} onClick={() => setType(t('MEAT'))}><div style={{width:'100%', height:'100%', backgroundColor:type === t('MEAT') ? 'rgba(0,0,0,0.75)':'',  padding: type === t('MEAT') ? '8px 12px' :'10px 15px',  borderRadius: '16px'}}>{t('MEAT')}</div></div>
                <div className="responsive-text"  style={{ background: '#f4a2c6', fontSize: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }} onClick={() => setType(t('FRUIT'))}><div style={{width:'100%', height:'100%', backgroundColor:type === t('FRUIT') ? 'rgba(0,0,0,0.75)':'',  padding: type === t('FRUIT') ? '8px 12px' :'10px 15px',  borderRadius: '16px'}}>{t('FRUIT')}</div></div>
                <div className="responsive-text"  style={{ background: '#aed137',  fontSize: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }} onClick={() => setType(t('VEGETABLES'))}><div style={{width:'100%', height:'100%', backgroundColor:type === t('VEGETABLES') ? 'rgba(0,0,0,0.75)':'', padding: type === t('VEGETABLES') ? '8px 12px' :'10px 15px',  borderRadius: '16px'}}>{t('VEGETABLES')}</div></div>
              </div>
              <Image src={Arrow} alt="aroww" width={30} height={40} style={{ padding: '15px 0 2px 0' }} />

              <p className="text-lg text-[#69429a]">

               {t('choosecream')}
              </p>
              <div style={{ display: 'flex', gap: '15px' , justifyContent: 'center', alignItems: 'center' }} className="responsive-text">
                <div className="responsive-text" style={{  background: '#1e439b', borderRadius: '16px', fontSize: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCreamType(t('DAIRY'))}><div style={{width:'100%', height:'100%', backgroundColor:creamType === t('DAIRY') ? 'rgba(0,0,0,0.75)':'', padding: creamType === t('DAIRY') ? '8px 12px' :'10px 15px',  borderRadius: '16px'}}>{t('DAIRY')}</div></div>
                <div className="responsive-text"  style={{  background: '#72bfe9', borderRadius: '16px', fontSize: '20px', color: '#fff', whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCreamType(t('PLANTBASEDMILK'))}><div style={{width:'100%', height:'100%', backgroundColor:creamType === t('PLANTBASEDMILK') ? 'rgba(0,0,0,0.75)':'', padding: creamType === t('PLANTBASEDMILK') ? '8px 12px' :'10px 15px',  borderRadius: '16px'}}>{t('PLANTBASEDMILK')}</div></div>
                <div className="responsive-text"  style={{ background: '#008042', borderRadius: '16px', fontSize: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCreamType(t('PLANTBASED'))}><div style={{width:'100%', height:'100%', backgroundColor:creamType === t('PLANTBASED') ? 'rgba(0,0,0,0.75)':'', padding: creamType === t('PLANTBASED') ? '8px 12px' :'10px 15px',  borderRadius: '16px'}}>{t('PLANTBASED')}</div></div>

              </div>
              <Image src={Arrow} alt="aroww" width={30} height={40} style={{ padding: '15px 0 2px 0' }} />

              <p className="text-lg text-[#69429a]">

                {t('chooseshape')}
              </p>

            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ paddingTop: '10px' }}>
            {filteredProducts.map((product, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden shadow-sm"
              >
                <div
                  className="relative aspect-square cursor-pointer"
                  onClick={() => handleSelectImage(product.image)}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />

                  {selectedImage === product.image.src && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-semibold" style={{ color: '#ffea00' }}>
                      {t("selected")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ORDER BUTTON */}
      <div className="container mx-auto py-10 text-center bg-white">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-lg transition"
          style={{ backgroundColor: "#69429a" }}
        >
          {t("orderNow")}
        </a>
      </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Image src={Cake} alt="cake" width={40} height={40} className="mb-4 mx-auto" />
            <h2 className="mb-4 text-2xl font-bold text-foreground" style={{color:'#69429a'}}>{t("customOrdersWelcome")}</h2>
            <p className="mb-6 text-muted-foreground" style={{color:'#69429a'}}>{t("customOrdersDesc")}</p>
            <Button asChild variant="outline" style={{ backgroundColor: '#69429a', color: '#fff' }}>
              <Link href="/contact">{t("contactUs")}</Link>
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
