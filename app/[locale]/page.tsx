"use client";

import Image from "next/image";
import { Heart, Shield, Sparkles, PawPrint, Truck, Palette, X, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { PRODUCTS, PARTYSHOPDATA } from "@/lib/products";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { useCart } from "@/components/cart-context";
import { CartDrawer } from "@/components/CartDrawer";
import { motion, useInView, useAnimation } from "framer-motion";
import homepage from "@/public/fon.png";
import main1 from "@/public/main1.png";
import main2 from "@/public/main2.png";
import main3 from "@/public/main3.png";

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
    image: homepage,
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
    bgColor: "",
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

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  // Products slider state
  const [isProductsAutoPlaying, setIsProductsAutoPlaying] = useState(true);
  const productsControls = useAnimation();

  // PartyShop slider state
  const [isPartyShopAutoPlaying, setIsPartyShopAutoPlaying] = useState(true);
  const partyShopControls = useAnimation();

  // Products slider animation
  useEffect(() => {
    if (isProductsAutoPlaying) {
      productsControls.start({
        x: [0, -((filteredProducts.slice(0, 6).length * (320 + 24)))],
        transition: {
          duration: 20,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop"
        }
      });
    } else {
      productsControls.stop();
    }
  }, [isProductsAutoPlaying, filteredProducts, productsControls]);

  // PartyShop slider animation
  useEffect(() => {
    if (isPartyShopAutoPlaying) {
      partyShopControls.start({
        x: [-(PARTYSHOPDATA.slice(0, 6).length * (320 + 24)), 0],
        transition: {
          duration: 20,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop"
        }
      });
    } else {
      partyShopControls.stop();
    }
  }, [isPartyShopAutoPlaying, partyShopControls]);

  return (
    <>
      <div className="flex flex-col">
        {/* Floating Cart Button */}
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

        {/* Cart Drawer */}
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} orderInfo={orderInfo} />

        {/* ========== HERO SLIDER ========== */}
        <ScrollReveal direction="up" delay={0}>
          <section
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="relative overflow-hidden"
          >
            <div className="relative w-full h-[100px] md:h-[380px] ">
              {heroSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                >
                  {/* Gradient overlay */}
                  <div className="relative w-full h-auto min-h-[380px]" />

                  {/* Background Image */}
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="w-full h-auto object-contain"
                                        priority={idx === 0}
                    sizes="100vw"
                    quality={100}
                  />

                  {/* Floating Images - with CSS animations */}
                  <div className="absolute inset-0 z-20">
                    {/* Կենտրոնական նկար */}
                    <div
                      className="absolute animate-float-center"
                      style={{
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "min(260px, 24vw)",
                        height: "min(268px, 25vw)",
                      }}
                    >
                      <Image
                        src={main2}
                        alt="floating image 1"
                        width={367}
                        height={379}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        priority
                      />
                    </div>

                    {/* Ձախ կողմի նկար */}
                    <div
                      className="absolute hidden md:block animate-float-left"
                      style={{
                        top: "50%",
                        left: "68%",
                        width: "min(300px, 30vw)",
                        height: "min(300px, 30vw)",
                      }}
                    >
                      <Image
                        src={main1}
                        alt="floating image 2"
                        width={401}
                        height={402}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        priority
                      />
                    </div>

                    {/* Աջ կողմի նկար */}
                    <div
                      className="absolute hidden md:block animate-float-right"
                      style={{
                        top: "55%",
                        left: "33%",
                        width: "min(290px, 29vw)",
                        height: "min(285px, 28vw)",
                      }}
                    >
                      <Image
                        src={main3}
                        alt="floating image 3"
                        width={407}
                        height={399}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        priority
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-30 h-full flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto">
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
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all hover:scale-110"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            <div className="absolute bottom-6 left-0 right-0 z-40 flex flex-col items-center gap-2">
              <div className="flex gap-2">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSlide(idx);
                      setIsAutoPlaying(false);
                      setTimeout(() => setIsAutoPlaying(true), 5000);
                    }}
                    className={`h-2 rounded-full transition-all ${idx === currentSlide ? "w-8 bg-[#aed137]" : "w-2 bg-white/50 hover:bg-white/80"
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

        {/* PRODUCTS SECTION - rotates LEFT to RIGHT */}
        <section className="bg-white py-12 overflow-hidden">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-[#69429a] mb-3">Մեր Տորթերը</h2>
                <div className="w-24 h-1 bg-[#aed137] mx-auto rounded-full" />
              </div>
            </ScrollReveal>

            <div
              className="relative overflow-hidden w-full"
              onMouseEnter={() => setIsProductsAutoPlaying(false)}
              onMouseLeave={() => setIsProductsAutoPlaying(true)}
            >
              <motion.div
                className="flex gap-6"
                animate={productsControls}
                style={{
                  width: "max-content",
                }}
              >
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
                          sizes="(max-width: 768px) 280px, 320px"
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
              </motion.div>
            </div>

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

        {/* PARTY SHOP SECTION - rotates RIGHT to LEFT (opposite direction) */}
        <section className="bg-white py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-[#69429a] mb-3">{t("partyshop")}</h2>
                <div className="w-24 h-1 bg-[#aed137] mx-auto rounded-full" />
              </div>
            </ScrollReveal>

            <div
              className="relative overflow-hidden w-full"
              onMouseEnter={() => setIsPartyShopAutoPlaying(false)}
              onMouseLeave={() => setIsPartyShopAutoPlaying(true)}
            >
              <motion.div
                className="flex gap-6"
                animate={partyShopControls}
                style={{
                  width: "max-content",
                }}
              >
                {[...PARTYSHOPDATA.slice(0, 6), ...PARTYSHOPDATA.slice(0, 6)].map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="min-w-[280px] md:min-w-[320px] group flex-shrink-0"
                  >
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
                          sizes="(max-width: 768px) 280px, 320px"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" />
                      </div>
                      {item.name && (
                        <div className="p-4 text-center bg-white">
                          <h3 className="font-semibold text-gray-800 text-lg group-hover:text-[#69429a] transition-colors">
                            {item.name}
                          </h3>
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
              </motion.div>
            </div>

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
          className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 will-change-transform ${isClosing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
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
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      @keyframes floatCenter {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0px) rotate(0deg) scale(1);
  }
  20% {
    transform: translate(-50%, -50%) translateY(-30px) rotate(6deg) scale(1.03);
  }
  40% {
    transform: translate(-50%, -50%) translateY(0px) rotate(0deg) scale(1);
  }
  60% {
    transform: translate(-50%, -50%) translateY(25px) rotate(-5deg) scale(0.97);
  }
  80% {
    transform: translate(-50%, -50%) translateY(-15px) rotate(3deg) scale(1.01);
  }
}

@keyframes floatLeft {
  0%, 100% {
    transform: translate(calc(-50% - min(600px, 45vw)), -50%) translateX(0px) translateY(0px) rotate(0deg) scale(1);
  }
  15% {
    transform: translate(calc(-50% - min(600px, 45vw)), -50%) translateX(-35px) translateY(-15px) rotate(-10deg) scale(0.96);
  }
  35% {
    transform: translate(calc(-50% - min(600px, 45vw)), -50%) translateX(0px) translateY(-25px) rotate(0deg) scale(1);
  }
  55% {
    transform: translate(calc(-50% - min(600px, 45vw)), -50%) translateX(30px) translateY(15px) rotate(8deg) scale(1.04);
  }
  75% {
    transform: translate(calc(-50% - min(600px, 45vw)), -50%) translateX(-20px) translateY(20px) rotate(-6deg) scale(0.98);
  }
}

@keyframes floatRight {
  0%, 100% {
    transform: translate(calc(-50% + min(600px, 45vw)), -50%) translateX(0px) translateY(0px) rotate(0deg) scale(1);
  }
  18% {
    transform: translate(calc(-50% + min(600px, 45vw)), -50%) translateX(30px) translateY(-20px) rotate(8deg) scale(1.03);
  }
  38% {
    transform: translate(calc(-50% + min(600px, 45vw)), -50%) translateX(-25px) translateY(15px) rotate(-7deg) scale(0.97);
  }
  58% {
    transform: translate(calc(-50% + min(600px, 45vw)), -50%) translateX(20px) translateY(-30px) rotate(6deg) scale(1.02);
  }
  78% {
    transform: translate(calc(-50% + min(600px, 45vw)), -50%) translateX(-30px) translateY(-10px) rotate(-8deg) scale(0.96);
  }
}

.animate-float-center {
  animation: floatCenter 10s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}

.animate-float-left {
  animation: floatLeft 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}

.animate-float-right {
  animation: floatRight 11s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}  
      
      `}</style>
    </>
  );
}