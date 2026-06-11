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

// Desktop images
import homepageDesktop from "@/public/fon.png";
import main1Desktop from "@/public/main1.png";
import main2Desktop from "@/public/main2.png";
import main3Desktop from "@/public/main3.png";

// Mobile images
import homepageMobile from "@/public/fon-mobile.png";
import main1Mobile from "@/public/main-mobile1.png";
import main2Mobile from "@/public/main-mobile2.png";
import main3Mobile from "@/public/main-mobile3.png";

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

// Check if device is mobile
const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
};

// Hero slides with responsive images
const getHeroSlides = () => [
  {
    id: 1,
    imageDesktop: homepageDesktop,
    imageMobile: homepageMobile,
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
    bgColor: "",
  },
];

// Get responsive floating images
const getFloatingImages = () => ({
  centerDesktop: main2Desktop,
  centerMobile: main2Mobile,
  leftDesktop: main1Desktop,
  leftMobile: main1Mobile,
  rightDesktop: main3Desktop,
  rightMobile: main3Mobile,
});

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
  const [isMobile, setIsMobile] = useState(false);

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

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get responsive hero slides
  const heroSlides = useMemo(() => getHeroSlides(), []);
  const floatingImages = useMemo(() => getFloatingImages(), []);

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
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

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

  // Get current slide's image (desktop or mobile)
  const currentSlideData = heroSlides[currentSlide];
  const currentBgImage = isMobile ? currentSlideData?.imageMobile : currentSlideData?.imageDesktop;

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
            <div className="relative w-full h-[280px] sm:h-[380px] md:h-[420px] lg:h-[480px]">
              {heroSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                >
                  {/* Background Image - responsive */}
                  <Image
                    src={idx === currentSlide ? currentBgImage! : (isMobile ? slide.imageMobile : slide.imageDesktop)}
                    alt={slide.title || "Hero background"}
                    fill
                    className="w-full h-full  object-center"
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 100vw"
                    quality={90}
                  />

                  {/* Floating Images - with CSS animations */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Կենտրոնական նկար */}
                    <div
                      className="absolute animate-float-center"
                      style={{
                        top: isMobile ? "35%" : "50%",
                        left: isMobile ? "60%" : "50%",
                        transform: "translate(-50%, -50%)",
                        width: isMobile ? "min(150px, 35vw)" : "min(260px, 24vw)",
                        height: isMobile ? "min(150px, 35vw)" : "min(268px, 25vw)",
                      }}
                    >
                      <Image
                        src={isMobile ? floatingImages.centerMobile : floatingImages.centerDesktop}
                        alt="floating center image"
                        width={367}
                        height={379}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        priority
                      />
                    </div>

                    {/* Ձախ կողմի նկար - hidden on mobile */}
                    <div
                      className={`absolute animate-float-left `}
                      style={{
                        top: isMobile ? "57%" : "50%",
                        left: isMobile ? "65%" : "67%",
                        width: isMobile ? "min(150px, 35vw)" : "min(300px, 30vw)",
                        height: isMobile ? "min(150px, 35vw)" : "min(300px, 30vw)",
                      }}
                    >
                      <Image
                        src={isMobile ? floatingImages.leftMobile : floatingImages.leftDesktop}
                        alt="floating left image"
                        width={401}
                        height={402}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        priority
                      />
                    </div>

                    {/* Աջ կողմի նկար - hidden on mobile */}
                    <div
                      className={`absolute animate-float-right `}
                      style={{
                        top: isMobile ? "78%" : "55%",
                        left: isMobile ? "39%" : "33%",
                        width: isMobile ? "min(110px, 35vw)" : "min(290px, 29vw)",
                        height: isMobile ? "min(110px, 35vw)" : "min(285px, 28vw)",
                      }}
                    >
                      <Image
                        src={isMobile ? floatingImages.rightMobile : floatingImages.rightDesktop}
                        alt="floating right image"
                        width={407}
                        height={399}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        priority
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            {/* <button
              onClick={prevSlide}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-40 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-1.5 md:p-2 transition-all hover:scale-110"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-40 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-1.5 md:p-2 transition-all hover:scale-110"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button> */}

            {/* Dots Navigation */}
            {/* <div className="absolute bottom-3 md:bottom-6 left-0 right-0 z-40 flex flex-col items-center gap-1 md:gap-2">
              <div className="flex gap-1.5 md:gap-2">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSlide(idx);
                      setIsAutoPlaying(false);
                      setTimeout(() => setIsAutoPlaying(true), 5000);
                    }}
                    className={`h-1.5 md:h-2 rounded-full transition-all ${idx === currentSlide ? "w-6 md:w-8 bg-[#aed137]" : "w-1.5 md:w-2 bg-white/50 hover:bg-white/80"
                      }`}
                  />
                ))}
              </div>
              {isAutoPlaying && (
                <div className="w-12 md:w-16 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#aed137] rounded-full"
                    style={{ animation: `progress 5s linear infinite` }}
                  />
                </div>
              )}
            </div> */}
          </section>
        </ScrollReveal>

        {/* PRODUCTS SECTION */}
        <section className="bg-white py-8 md:py-12 overflow-hidden">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#69429a] mb-2 md:mb-3">{t('ourCakesLabel')}</h2>
                <div className="w-20 md:w-24 h-0.5 md:h-1 bg-[#aed137] mx-auto rounded-full" />
              </div>
            </ScrollReveal>

            <div
              className="relative overflow-hidden w-full"
              onMouseEnter={() => setIsProductsAutoPlaying(false)}
              onMouseLeave={() => setIsProductsAutoPlaying(true)}
            >
              <motion.div
                className="flex gap-4 md:gap-6"
                animate={productsControls}
                style={{
                  width: "max-content",
                }}
              >
                {[...filteredProducts.slice(0, 6), ...filteredProducts.slice(0, 6)].map((product, idx) => (
                  <Link
                    key={`${product.id}-${idx}`}
                    href={`/${locale}/product/${product.id}`}
                    className="min-w-[240px] md:min-w-[280px] lg:min-w-[320px] group block flex-shrink-0"
                  >
                    <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 bg-white">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 240px, (max-width: 1024px) 280px, 320px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-3 md:p-4 text-center bg-white">
                        <h3 className="font-semibold text-gray-800 text-base md:text-lg group-hover:text-[#69429a] transition-colors">
                          {product.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            </div>

            <ScrollReveal direction="up" delay={0.2}>
              <div className="flex justify-center mt-8 md:mt-12">
                <Link href={`/${locale}/shop`}>
                  <button className="px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-[#69429a] text-white font-semibold text-base md:text-lg transition-all hover:bg-[#7c4fb3] hover:scale-105 shadow-lg hover:shadow-xl">
                    {t('seeMoreLabel')} →
                  </button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* PARTY SHOP SECTION */}
        <section className="bg-white py-12 md:py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#69429a] mb-2 md:mb-3">{t("partyshop")}</h2>
                <div className="w-20 md:w-24 h-0.5 md:h-1 bg-[#aed137] mx-auto rounded-full" />
              </div>
            </ScrollReveal>

            <div
              className="relative overflow-hidden w-full"
              onMouseEnter={() => setIsPartyShopAutoPlaying(false)}
              onMouseLeave={() => setIsPartyShopAutoPlaying(true)}
            >
              <motion.div
                className="flex gap-4 md:gap-6"
                animate={partyShopControls}
                style={{
                  width: "max-content",
                }}
              >
                {[...PARTYSHOPDATA.slice(0, 6), ...PARTYSHOPDATA.slice(0, 6)].map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="min-w-[240px] md:min-w-[280px] lg:min-w-[320px] group flex-shrink-0"
                  >
                    <Link
                      href={`/${locale}/partyshop`}
                      className="group block rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 bg-white"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 240px, (max-width: 1024px) 280px, 320px"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" />
                      </div>
                      {item.name && (
                        <div className="p-3 md:p-4 text-center bg-white">
                          <h3 className="font-semibold text-gray-800 text-base md:text-lg group-hover:text-[#69429a] transition-colors">
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
              <div className="flex justify-center mt-8 md:mt-12">
                <Link href={`/${locale}/partyshop`}>
                  <button className="px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-[#69429a] text-white font-semibold text-base md:text-lg transition-all hover:bg-[#7c4fb3] hover:scale-105 shadow-lg">
                    {t('viewAllProductsLabel')} →
                  </button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#69429a]">{t('faqLabel')}</h2>
                <div className="w-20 md:w-24 h-0.5 md:h-1 bg-[#aed137] mx-auto mt-3 md:mt-4 rounded-full" />
              </div>
            </ScrollReveal>

            <StaggerContainer className="flex flex-col gap-5 md:gap-8 max-w-5xl mx-auto">
              {/* Վերևի շարքը - 2 հատ */}
              <div className="grid md:grid-cols-2 gap-5 md:gap-8">
                <StaggerItem>
                  <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#69429a]/30 group">
                    <div className="flex items-start gap-3 md:gap-5">
                      <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#69429a]/10 flex items-center justify-center text-xl md:text-2xl group-hover:bg-[#69429a] group-hover:text-white transition-all duration-300">
                        🚚
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 md:mb-2">{t('freeDeliveryYerevanLabel')}</h3>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                          Այո՝ <span className="font-semibold text-[#69429a]">6000 դրամը</span> գերազանցող պատվերների դեպքում՝
                          Երևանում և հարակից տարածքներում:
                        </p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#69429a]/30 group">
                    <div className="flex items-start gap-3 md:gap-5">
                      <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#69429a]/10 flex items-center justify-center text-xl md:text-2xl group-hover:bg-[#69429a] group-hover:text-white transition-all duration-300">
                        📅
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 md:mb-2">{t('cakeOrderAdvanceLabel')}</h3>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                          Նվազագույնը <span className="font-semibold text-[#69429a]">մեկ օր առաջ</span>: Մեծ քանակի կամ բարդ դիզայնի
                          դեպքում՝ 2–3 օր նախապես:
                        </p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              </div>

              {/* Մեջտեղի շարքը - 1 հատ (կենտրոնում) */}
              <div className="flex justify-center">
                <StaggerItem className="w-full max-w-2xl">
                  <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#69429a]/30 group">
                    <div className="flex items-start gap-3 md:gap-5">
                      <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#69429a]/10 flex items-center justify-center text-xl md:text-2xl group-hover:bg-[#69429a] group-hover:text-white transition-all duration-300">
                        🤝
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 md:mb-2">{t('collaborationLabel')}</h3>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                          {t('collaborationDescLabel')}
                        </p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              </div>

              {/* Ներքևի շարքը - 2 հատ */}
              <div className="grid md:grid-cols-2 gap-5 md:gap-8">
                <StaggerItem>
                  <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#69429a]/30 group">
                    <div className="flex items-start gap-3 md:gap-5">
                      <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#69429a]/10 flex items-center justify-center text-xl md:text-2xl group-hover:bg-[#69429a] group-hover:text-white transition-all duration-300">
                        🎨
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 md:mb-2">{t('ownDesignLabel')}</h3>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                          {t('customDesignResponseLabel')}
                        </p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#69429a]/30 group">
                    <div className="flex items-start gap-3 md:gap-5">
                      <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#69429a]/10 flex items-center justify-center text-xl md:text-2xl group-hover:bg-[#69429a] group-hover:text-white transition-all duration-300">
                        🐾
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 md:mb-2">{t('onlyDogsCatsLabel')}</h3>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                          Ոչ, <span className="font-semibold text-[#69429a]">բոլոր կենդանիների</span> համար: Պարզապես նշեք՝ ինչ
                          կենդանի է, և մենք կառաջարկենք հատուկ բաղադրատոմս:
                        </p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              </div>
            </StaggerContainer>

            <ScrollReveal direction="up" delay={0.4}>
              <div className="text-center mt-8 md:mt-12">
                <p className="text-sm md:text-base text-gray-500">
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
        <section className="bg-white py-12 md:py-20">
          <div className="container mx-auto px-4">
            <StaggerContainer className="grid gap-5 md:gap-8 grid-cols-1 md:grid-cols-3">
              {features.map((feature, index) => (
                <StaggerItem key={index}>
                  <div className="group flex flex-col items-center gap-3 md:gap-5 rounded-xl md:rounded-2xl bg-gray-50 p-6 md:p-8 text-center shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                    <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#69429a] to-[#8b5fcf] shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">{feature.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">{feature.description}</p>
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
                className="absolute top-1 right-1 md:top-2 md:right-2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-1 md:p-1.5 transition-all hover:scale-110"
              >
                <X className="h-3 w-3 md:h-4 md:w-4 text-white" />
              </button>
              <div className="flex flex-col sm:flex-row items-center gap-2 p-3 pr-5 md:p-4 md:pr-6">
                <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl md:text-3xl">{currentAd.icon}</span>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-white text-xs md:text-sm lg:text-base font-semibold">{currentAd.title}</p>
                  <p className="text-white/70 text-xs md:text-sm hidden sm:block">{currentAd.description}</p>
                </div>
                <button
                  onClick={() => window.open(currentAd.ctaLink, "_blank")}
                  className="bg-white text-[#69429a] px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap hover:bg-gray-100 transition-all hover:scale-105 shadow-md"
                >
                  {currentAd.ctaText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
  /* Կրճատված շարժումներ ծանրաբեռնվածության զգայունության դեպքում */
  @media (prefers-reduced-motion: reduce) {
    .animate-float-center,
    .animate-float-left,
    .animate-float-right {
      animation: none !important;
      transform: translate(-50%, -50%) !important;
      transition: none !important;
    }
  }

  /* Desktop (մեծ էկրաններ) - լիարժեք անիմացիա */
  @media (min-width: 768px) {
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
  }

  /* Հեռախոսի համար (768px-ից փոքր) - ՔԻՉ շարժում */
  @media (max-width: 767px) {
    
    @keyframes floatCenterMobile {
      0%, 100% {
        transform: translate(-50%, -50%) translateY(10px) scale(1);
      }
      50% {
        transform: translate(-50%, -50%) translateY(-10px) scale(1.03);
      }
    }

    @keyframes floatLeftMobile {
      0%, 100% {
        transform: translate(calc(-50% - min(400px, 40vw)), -50%) translateX(10px) translateY(10px);
      }
      50% {
        transform: translate(calc(-50% - min(400px, 40vw)), -50%) translateX(-10px) translateY(-6px);
      }
    }

    @keyframes floatRightMobile {
      0%, 100% {
        transform: translate(calc(-50% + min(400px, 40vw)), -50%) translateX(17px) translateY(5px);
      }
      50% {
        transform: translate(calc(-50% + min(400px, 40vw)), -50%) translateX(5px) translateY(-3px);
      }
    }

    .animate-float-center {
      animation: floatCenterMobile 6s ease-in-out infinite;
    }

    .animate-float-left {
      animation: floatLeftMobile 7s ease-in-out infinite;
    }

    .animate-float-right {
      animation: floatRightMobile 7s ease-in-out infinite;
    }
  }
`}</style>
    </>
  );
}