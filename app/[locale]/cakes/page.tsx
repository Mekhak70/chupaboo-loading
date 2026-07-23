"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import Image from "next/image"
import Cake from "@/public/cake.png"
import { useParams } from "next/navigation"


type Filter = "all" | "small" | 'midi' | "standart" 

export default function ShopPage() {
    const { locale } = useParams()
  
  const { t } = useLanguage()
  const [filter, setFilter] = useState<Filter>("all")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [type, setType] = useState<string>("")
  const [creamType, setCreamType] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const filteredProducts = products.filter((p) => {
    console.log(p.category, filter);
    return filter === "all" || p.category === filter;
  });
  
  const ProductSkeleton = () => (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="mt-3">
          <div className="h-10 bg-gray-200 rounded-full w-full"></div>
        </div>
      </div>
    </div>
  );



  const SITE_URL = "https://www.chupaboo.com"


  const whatsappMessage = selectedImage
    ? `Բարև, ուզում եմ պատվիրել այս տորթը լինի ${type} և ${creamType}։ Նկարը՝ ${SITE_URL}${selectedImage}`
    : "Բարև, ուզում եմ պատվիրել տորթ"

  const whatsappLink = `https://wa.me/37433775750?text=${encodeURIComponent(
    whatsappMessage
  )}`
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch(
          "https://opensheet.elk.sh/1JuaojKVSs8Fe6_4e2nPdHg0WgFJxNkL-uQbbcyPP1b0/Sheet1"
        );
  
        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`);
        }
  
        const data = await res.json();
  
        console.log("Products:", data);
  
        const formatted = data.map((item: any) => {
          let image = item["նկար"] || "";
  
          // Google Drive link → direct image
          const match = image.match(/\/d\/([^/]+)/);
          if (match) {
            image = `https://drive.google.com/uc?export=view&id=${match[1]}`;
          }
  
          return {
            id: item.id,
            name: item.name,
            price: Number(item.price),
            category: item.size, // small | standart
            image,
            cream: item.cream === "true",
            stock: 999,
          };
        });
  
        setProducts(formatted);
      } catch (err) {
        console.error("Load products error:", err);
      }finally {
        setLoading(false);
      }
    }
  
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col">
        <section>
          <div className="w-full h-[320px] bg-gray-200 animate-pulse"></div>
        </section>
        <section className="bg-white py-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }
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
                onClick={() => setFilter('midi')} 
                style={{ 
                  padding: '10px 15px', 
                  background: filter === 'midi' ? '#aed137' : '#69429a', 
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
                {t("midi")}
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

                  console.log(product.image, 'product'),
                  <Link
                    key={product.id}
                    href={`/${locale}/product/${product.id}`}
                    className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group block"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={product.image}
                        alt={"Շան ծննդյան տորթ"}
                        className="w-full h-full object-cover"
                        height={300}
                        width={300}
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
