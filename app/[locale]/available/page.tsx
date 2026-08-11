"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import Image from "next/image"
import Cake from "@/public/cake.png"
import { useParams } from "next/navigation"
import partyShop from "@/public/banner-our-cakes.png";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
type Filter = "all" | "small" | 'midi' | "standart"

export default function Available() {
    const { locale } = useParams()
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { t } = useLanguage()
    const [filter, setFilter] = useState<Filter>("all")
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [type, setType] = useState<string>("")
    const [creamType, setCreamType] = useState<string>("")
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // State for mobile scroll effect
    const [visibleProductId, setVisibleProductId] = useState<string | null>(null);
    const cardRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const filteredProducts = products.filter((p) => {
        return filter === "all" || p.category === filter;
    });
    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter as Filter);

        const params = new URLSearchParams(searchParams.toString());
        params.set("filter", newFilter);

        router.push(`${pathname}?${params.toString()}`, {
            scroll: false,
        });
    };



    useEffect(() => {
        const currentFilter = searchParams.get("filter");

        if (currentFilter) {
            if (["all", "small", "midi", "standart"].includes(currentFilter)) {
                setFilter(currentFilter as Filter);
            }
        }
    }, [searchParams]);
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

    // Scroll effect for mobile
    useEffect(() => {
        const handleScroll = () => {
            // Check only on mobile (screen width < 640px)
            if (window.innerWidth >= 640) {
                setVisibleProductId(null);
                return;
            }

            let closestId: string | null = null;
            let closestDistance = Infinity;
            const windowCenter = window.innerHeight / 2;

            // Find which product card is closest to center
            Object.keys(cardRefs.current).forEach((id) => {
                const element = cardRefs.current[id];
                if (!element) return;

                const rect = element.getBoundingClientRect();
                const cardCenter = rect.top + rect.height / 2;
                const distance = Math.abs(cardCenter - windowCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestId = id;
                }
            });

            // If a card is within 100px of center, show its button
            if (closestId && closestDistance < 100) {
                setVisibleProductId(closestId);

                // Clear previous timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                // Hide after 2.5 seconds
                timeoutRef.current = setTimeout(() => {
                    setVisibleProductId(null);
                }, 2500);
            } else {
                // If no card is near center, hide all buttons
                setVisibleProductId(null);
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            }
        };

        // Throttle scroll events for better performance
        let ticking = false;
        const throttledScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", throttledScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });

        // Initial check
        setTimeout(handleScroll, 100);

        return () => {
            window.removeEventListener("scroll", throttledScroll);
            window.removeEventListener("resize", handleScroll);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [filteredProducts]); 

    useEffect(() => {
        async function loadProducts() {
            try {
                setLoading(true);
                const res = await fetch(
                    "https://opensheet.elk.sh/1f-tS40p_iKXLckAwjua5HMX-fIcN97fj54V9BNzOetE/1"
                );

                if (!res.ok) {
                    throw new Error(`HTTP Error: ${res.status}`);
                }

                const data = await res.json();

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
                        available:item.available === "1" ? true : false,
                        ingredients: item.ingredients
                    };
                });

                setProducts(formatted);
            } catch (err) {
                console.error("Load products error:", err);
            } finally {
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
                <section>
                    <img
                        src={partyShop.src}
                        alt="Party Shop"
                        className="w-full h-[auto] object-contain"

                    />
                </section>

                {/* Filter & Products */}
                <section>
                    <div className="container mx-auto px-4">
                        <section className="bg-white py-10">
                            <div className="container mx-auto px-4">
                                {/* FILTER BUTTONS */}
                                <div className="flex gap-4 justify-center mb-6 text-sm font-medium flex-wrap" style={{ paddingBottom: '20px' }}>
                                    <button
                                        onClick={() => handleFilterChange("all")}
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
                                        onClick={() => handleFilterChange("small")}
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
                                        onClick={() => handleFilterChange("midi")}
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
                                        onClick={() => handleFilterChange("standart")}
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
                                        filteredProducts.map((product) => {
                                            const isVisible = visibleProductId === product.id;

                                            return (
                                                product.available && <Link
                                                    key={product.id}
                                                    href={`/${locale}/product/available/${product.id}`}
                                                    className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group block"
                                                    ref={(el) => {
                                                        cardRefs.current[product.id] = el;
                                                    }}
                                                >
                                                    <div className="relative aspect-square">
                                                        <Image
                                                            src={product.image}
                                                            alt={"Շան ծննդյան տորթ"}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            height={300}
                                                            width={300}
                                                        />

                                                        {/* Desktop-ի համար - hover */}
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 hidden sm:flex items-center justify-center">
                                                            <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 px-4 py-2 rounded-lg text-sm">
                                                                {locale === "hy" ? "Տեսնել ավելին" : "View details"}
                                                            </span>
                                                        </div>

                                                        {/* Mobile-ի համար - ցույց է տալիս, երբ կարտը կենտրոնում է */}
                                                        <div
                                                            className={`
                                absolute inset-0 bg-black/40 flex items-center justify-center sm:hidden
                                transition-all duration-500 ease-out
                                ${isVisible
                                                                    ? 'opacity-100 scale-100'
                                                                    : 'opacity-0 scale-90 pointer-events-none'
                                                                }
                              `}
                                                        >
                                                            <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-xl">
                                                                <span className="text-white font-medium text-base">
                                                                    {locale === "hy" ? " Տեսնել ավելին" : " View details"}
                                                                </span>
                                                            </div>
                                                        </div>


                                                    </div>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-full text-center py-10">
                                            <p className="text-gray-500 text-lg">{t('noProductsAvailable')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </section>

                {/* Info Section */}
                <section className="border-t border-border bg-muted/30 py-16">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-3xl text-center">
                            <Image src={Cake} alt="cake" width={40} height={40} className="mb-4 mx-auto" priority />
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