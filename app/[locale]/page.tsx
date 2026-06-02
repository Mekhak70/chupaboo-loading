"use client";

import Image from "next/image";
import { Heart, Shield, Sparkles, PawPrint, Truck, Palette, X, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { PRODUCTS, PARTYSHOPDATA } from "@/lib/products";
import MainImgAm from "@/public/home-arm.png";
import MainImgRu from "@/public/home-rus.png";
import MainImgEn from "@/public/home-eng.png";
import MainImgPl from "@/public/home-pl.png";
import PetSlider from "@/components/PetSlider";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { useCart } from "@/components/cart-context";
import { CartDrawer } from "@/components/CartDrawer";
import { motion, useInView, useAnimation } from "framer-motion";

type Filter = "all" | "meat" | "vegetable" | "fruit" | "small" | "standart";

interface Product {
  id: string | number;
  name: string;
  image: string | StaticImport;
  category: Filter;
}

interface Ad {
  id: number;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  icon: string;
  bgColor: string;
}

// Սլայդերի տվյալներ
const heroSlides = [
  {
    id: 1,
    image: MainImgAm,
    title: "Բնական տորթեր ընտանի կենդանիների համար",
    subtitle: "Միայն թարմ, մարդու համար պիտանի բաղադրիչներ",
    ctaText: "Պատվիրել",
    ctaLink: "/shop",
    bgColor: "from-[#69429a] to-[#8b5fcf]",
  },
  {
    id: 2,
    image: MainImgRu,
    title: "Անհատական դիզայն",
    subtitle: "Ստեղծեք ձեր կենդանու երազանքի տորթը",
    ctaText: "Իմանալ ավելին",
    ctaLink: "/about",
    bgColor: "from-[#4a90e2] to-[#2c5aa0]",
  },
  {
    id: 3,
    image: MainImgEn,
    title: "Արագ առաքում Երևանում",
    subtitle: "Անվճար առաքում 6000 դրամից",
    ctaText: "Տես տեսականին",
    ctaLink: "/shop",
    bgColor: "from-[#e67e22] to-[#f39c12]",
  },
];

// Scroll-triggered animation wrapper component
const ScrollReveal = ({ children, delay = 0, direction = "up", className = "" }: { children: React.ReactNode; delay?: number; direction?: "up" | "down" | "left" | "right"; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: "-50px" });
  const controls = useAnimation();

  const directions = {
    up: { y: 80, x: 0 },
    down: { y: -80, x: 0 },
    left: { x: 80, y: 0 },
    right: { x: -80, y: 0 },
  };

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, ...directions[direction] },
        visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.8, ease: "easeOut", delay } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered children wrapper
const StaggerContainer = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const StaggerItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function HomePage() {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");
  const [type, setType] = useState<string>("");
  const [creamType, setCreamType] = useState<string>("");

  // AD STATES
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isAdClosedPermanently, setIsAdClosedPermanently] = useState(false);

  // HERO SLIDER STATE
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const adTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { locale } = useParams();
  const SITE_URL = "https://www.chupaboo.com";
  
  const { addToCart, getItemCount, cart, orderInfo } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ADS
  const ads: Ad[] = useMemo(
    () => [
      {
        id: 1,
        title: "📢 Այստեղ կարող է լինել ձեր գովազդը #1",
        description: "Հասեք 1000+ հաճախորդների ամեն օր",
        ctaText: "Մանրամասն →",
        ctaLink: "https://www.chupaboo.com/contact",
        bgColor: "from-[#69429a] to-[#8b5fcf]",
        icon: "📢",
      },
      {
        id: 2,
        title: "🚕 Pet Taxi - Հոգատար փոխադրում կենդանիների համար",
        description: "Անվտանգ, հարմարավետ և սիրով: Երևանով և Հայաստանով:",
        ctaText: "Պատվիրել →",
        ctaLink: "https://pettaxi.am",
        bgColor: "from-[#4a90e2] to-[#2c5aa0]",
        icon: "🚕",
      },
      {
        id: 3,
        title: "🎁 Հատուկ առաջարկ բիզնեսի համար",
        description: "Գովազդեք ձեր ապրանքը մեր կայքում",
        ctaText: "Իմանալ ավելին →",
        ctaLink: "https://www.chupaboo.com/promotion",
        bgColor: "from-[#e74c3c] to-[#c0392b]",
        icon: "🎁",
      },
      {
        id: 4,
        title: "⭐ Նոր հաճախորդներ ձեր բիզնեսի համար",
        description: "Օրական 5000+ այցելու տեսնի ձեր գովազդը",
        ctaText: "Պատվիրել →",
        ctaLink: "https://www.chupaboo.com/order-ad",
        bgColor: "from-[#2ecc71] to-[#27ae60]",
        icon: "⭐",
      },
      {
        id: 5,
        title: "🔥 Սահմանափակ առաջարկ",
        description: "Առաջին 3 ամիսը 20% զեղչ",
        ctaText: "Օգտվել →",
        ctaLink: "https://www.chupaboo.com/discount",
        bgColor: "from-[#f39c12] to-[#e67e22]",
        icon: "🔥",
      },
      {
        id: 6,
        title: "💎 Պրեմիում գովազդ",
        description: "Լավագույն դիրքը կայքում",
        ctaText: "Պատվիրել →",
        ctaLink: "https://www.chupaboo.com/premium",
        bgColor: "from-[#1abc9c] to-[#16a085]",
        icon: "💎",
      },
    ],
    []
  );

  const features = [
    { icon: Heart, title: t("handmade"), description: t("handmadeDesc") },
    { icon: Shield, title: t("petSafe"), description: t("petSafeDesc") },
    { icon: Sparkles, title: t("freshDaily"), description: t("freshDailyDesc") },
  ];

  const filteredProducts = useMemo(() => {
    if (filter === "all") return PRODUCTS;
    return PRODUCTS.filter((product) => product.category === filter);
  }, [filter]);

  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const handleSelectImage = (image: { src: string } | StaticImport) => {
    let src = "";
    if (typeof image === "object" && "src" in image) {
      src = (image as any).src || "";
    } else if (typeof image === "string") {
      src = image;
    }
    setPendingImage(src);
  };

  const whatsappMessage = pendingImage
    ? `${t("whatsappMessageTextOne")}

${type} ${creamType}։ ${t("imageLabel")} ${SITE_URL}${pendingImage.startsWith("/") ? pendingImage : "/" + pendingImage}`
    : t("whatsappMessageText");

  const whatsappLink = `https://wa.me/37433775750?text=${encodeURIComponent(whatsappMessage)}`;

  // AD LOGIC
  const showRandomAd = useCallback(() => {
    if (isAdClosedPermanently) return;
    if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);

    let randomIndex = Math.floor(Math.random() * ads.length);
    if (currentAd && ads[randomIndex].id === currentAd.id) {
      randomIndex = (randomIndex + 1) % ads.length;
    }
    const nextAd = ads[randomIndex];
    setCurrentAd(nextAd);
    if (!isAdVisible) {
      setIsClosing(false);
      setIsAdVisible(true);
    }
    adTimeoutRef.current = setTimeout(() => {
      handleCloseAd();
    }, 8000);
  }, [ads, currentAd, isAdVisible, isAdClosedPermanently]);

  const handleCloseAd = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    const timeoutId = setTimeout(() => {
      setIsAdVisible(false);
      setIsAdClosedPermanently(true);
      setIsClosing(false);
      if (adTimeoutRef.current) {
        clearTimeout(adTimeoutRef.current);
        adTimeoutRef.current = null;
      }
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [isClosing]);

  useEffect(() => {
    const adClosed = localStorage.getItem("chupaboo_ad_closed");
    if (adClosed === "true") setIsAdClosedPermanently(true);
  }, []);

  useEffect(() => {
    if (isAdClosedPermanently) localStorage.setItem("chupaboo_ad_closed", "true");
  }, [isAdClosedPermanently]);

  useEffect(() => {
    if (isAdClosedPermanently) return;
    const initialTimeout = setTimeout(() => showRandomAd(), 3000);
    intervalRef.current = setInterval(() => showRandomAd(), 10000);
    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
    };
  }, [isAdClosedPermanently, showRandomAd]);

  // HERO SLIDER LOGIC
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    autoPlayRef.current = setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > 50) nextSlide();
    if (touchStart - touchEnd < -50) prevSlide();
  };

  return (
    <>  
      <div className="flex flex-col">
        {/* Floating Cart Button - moved outside conditional to always show when cart has items */}
        {getItemCount() > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg transition z-50 flex items-center justify-center"
            style={{ backgroundColor: "#69429a" }}
          >
            <ShoppingCart className="h-6 w-6" />
            {getItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getItemCount()}
              </span>
            )}
          </button>
        )}
        
        {/* Cart Drawer - orderInfo comes from context, no need to pass as prop */}
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}  orderInfo={orderInfo} />

        {/* ========== HERO SLIDER ========== */}
        <ScrollReveal direction="up" delay={0}>
          <section 
            className="relative bg-gradient-to-br from-[#69429a] to-[#8b5fcf] overflow-hidden"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div className="relative h-[65vh] min-h-[500px] md:h-[75vh]">
              {heroSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20 z-10" />
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={idx === 0}
                  />
                  <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto">
                    <motion.h1 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-base md:text-lg text-white/90 mb-8 max-w-lg"
                    >
                      {slide.subtitle}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <Link href={`/${locale}${slide.ctaLink}`}>
                        <button className="px-7 py-3 bg-[#aed137] hover:bg-[#c5e55a] text-gray-900 font-semibold rounded-full transition-all hover:scale-105 shadow-lg">
                          {slide.ctaText} →
                        </button>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all hover:scale-110"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            <div className="absolute bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-2">
              <div className="flex gap-2">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSlide(idx);
                      setIsAutoPlaying(false);
                      setTimeout(() => setIsAutoPlaying(true), 5000);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlide ? "w-8 bg-[#aed137]" : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
              {isAutoPlaying && (
                <div className="w-16 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#aed137] rounded-full"
                    style={{ animation: `progress 5s linear infinite` }}
                  />
                </div>
              )}
            </div>
          </section>
        </ScrollReveal>

        {/* PRODUCTS SECTION */}
        <section className="bg-white py-12 overflow-hidden">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-[#69429a] mb-3">Մեր Տորթերը</h2>
                <div className="w-24 h-1 bg-[#aed137] mx-auto rounded-full" />
              </div>
            </ScrollReveal>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="overflow-hidden w-full"
            >
              <div className="slider-track flex gap-6 pb-4">
                {[...filteredProducts.slice(0, 6), ...filteredProducts.slice(0, 6)].map((product, idx) => (
                  <Link
                    key={`${product.id}-${idx}`}
                    href={`/${locale}/product/${product.id}`}
                    className="min-w-[280px] md:min-w-[320px] group block flex-shrink-0"
                  >
                    <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 bg-white">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-4 text-center bg-white">
                        <h3 className="font-semibold text-gray-800 text-lg group-hover:text-[#69429a] transition-colors">
                          {product.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            <ScrollReveal direction="up" delay={0.2}>
              <div className="flex justify-center mt-12">
                <Link href={`/${locale}/shop`}>
                  <button className="px-8 py-3 rounded-full bg-[#69429a] text-white font-semibold text-lg transition-all hover:bg-[#7c4fb3] hover:scale-105 shadow-lg hover:shadow-xl">
                    Տեսնել ավելին →
                  </button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* PARTY SHOP SECTION */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-[#69429a] mb-3">{t("partyshop")}</h2>
                <div className="w-24 h-1 bg-[#aed137] mx-auto rounded-full" />
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {PARTYSHOPDATA.slice(0, 3).map((item) => (
                <StaggerItem key={item.id}>
                  <Link
                    href={`/${locale}/partyshop`}
                    className="group block rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 bg-white"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" />
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <ScrollReveal direction="up" delay={0.3}>
              <div className="flex justify-center mt-12">
                <Link href={`/${locale}/partyshop`}>
                  <button className="px-8 py-3 rounded-full bg-[#69429a] text-white font-semibold text-lg transition-all hover:bg-[#7c4fb3] hover:scale-105 shadow-lg">
                    Դիտել բոլոր ապրանքները →
                  </button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-[#69429a]">Հաճախ տրվող հարցեր</h2>
                <div className="w-24 h-1 bg-[#aed137] mx-auto mt-4 rounded-full" />
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* 1 */}
              <StaggerItem>
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#69429a]/30 group">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#69429a]/10 flex items-center justify-center text-2xl group-hover:bg-[#69429a] group-hover:text-white transition-all duration-300">
                      🚚
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Երևանի ներսում առաքումն անվճա՞ր է</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Այո՝ <span className="font-semibold text-[#69429a]">6000 դրամը</span> գերազանցող պատվերների դեպքում՝
                        Երևանում և հարակից տարածքներում:
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>

              {/* 2 */}
              <StaggerItem>
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#69429a]/30 group">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#69429a]/10 flex items-center justify-center text-2xl group-hover:bg-[#69429a] group-hover:text-white transition-all duration-300">
                      📅
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Քանի՞ օր շուտ պետք է պատվիրեմ տորթը</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Նվազագույնը <span className="font-semibold text-[#69429a]">մեկ օր առաջ</span>: Մեծ քանակի կամ բարդ դիզայնի
                        դեպքում՝ 2–3 օր նախապես:
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>

              {/* 3 */}
              <StaggerItem>
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#69429a]/30 group">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#69429a]/10 flex items-center justify-center text-2xl group-hover:bg-[#69429a] group-hover:text-white transition-all duration-300">
                      🎨
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Կարո՞ղ ենք առաջարկել մեր դիզայնը</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Այո, կարող եք ուղարկել լուսանկարը կամ նկարագրությունը, և մենք կպատրաստենք ձեր ուզած տարբերակով:
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>

              {/* 4 */}
              <StaggerItem>
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#69429a]/30 group">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#69429a]/10 flex items-center justify-center text-2xl group-hover:bg-[#69429a] group-hover:text-white transition-all duration-300">
                      🐾
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Միայն շների և կատուների համա՞ր են տորթերը</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Ոչ, <span className="font-semibold text-[#69429a]">բոլոր կենդանիների</span> համար: Պարզապես նշեք՝ ինչ
                        կենդանի է, և մենք կառաջարկենք հատուկ բաղադրատոմս:
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>

              {/* 5 - full width */}
              <StaggerItem className="md:col-span-2 max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#69429a]/30 group">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#69429a]/10 flex items-center justify-center text-2xl group-hover:bg-[#69429a] group-hover:text-white transition-all duration-300">
                      🤝
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Ինչպե՞ս կարող ենք համագործակցել ձեզ հետ</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Կարող եք գրել մեր էջին կամ ուղարկել նամակ, և մեր թիմը կկապնվի ձեզ հետ՝ քննարկելու համագործակցության
                        մանրամասները:
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>

            <ScrollReveal direction="up" delay={0.4}>
              <div className="text-center mt-12">
                <p className="text-gray-500">
                  Դեռ հարցեր կան՞
                  <a href={`/${locale}/contact`} className="text-[#69429a] font-semibold hover:underline ml-1">
                    Կապվեք մեզ հետ
                  </a>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <StaggerContainer className="grid gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <StaggerItem key={index}>
                  <div className="group flex flex-col items-center gap-5 rounded-2xl bg-gray-50 p-8 text-center shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#69429a] to-[#8b5fcf] shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </div>

      {/* AD SLIDER */}
      {isAdVisible && currentAd && (
        <div
          key={currentAd.id}
          className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 will-change-transform ${
            isClosing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
          style={{
            transform: isClosing ? "translateY(100%)" : "translateY(0)",
            opacity: isClosing ? 0 : 1,
          }}
        >
          <div className="px-2 pb-2 sm:px-4 sm:pb-4">
            <div
              className={`relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-r ${currentAd.bgColor} animate-slide-up`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseAd();
                }}
                className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-all hover:scale-110"
              >
                <X className="h-4 w-4 text-white" />
              </button>
              <div className="flex flex-col sm:flex-row items-center gap-3 p-4 pr-6">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl sm:text-3xl">{currentAd.icon}</span>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-white text-sm sm:text-base font-semibold">{currentAd.title}</p>
                  <p className="text-white/70 text-xs sm:text-sm">{currentAd.description}</p>
                </div>
                <button
                  onClick={() => window.open(currentAd.ctaLink, "_blank")}
                  className="bg-white text-[#69429a] px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap hover:bg-gray-100 transition-all hover:scale-105 shadow-md"
                >
                  {currentAd.ctaText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .slider-track {
          width: max-content;
          animation: productsSlider 30s linear infinite;
          will-change: transform;
        }
        .slider-track:hover {
          animation-play-state: paused;
        }
        @keyframes productsSlider {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 12px));
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </>
  );
}