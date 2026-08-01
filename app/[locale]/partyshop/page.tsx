"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ShoppingCart, CheckCircle, Minus, Plus, X, Percent, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { CartDrawer } from "@/components/CartDrawer";
import partyShop from "@/public/party-shop-main.jpg";
import { useCart } from "@/components/cart-context";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { text } from "stream/consumers";

// ========== DISCOUNT CONSTANTS ==========
const DISCOUNT_THRESHOLD_1 = 5000;
const DISCOUNT_THRESHOLD_2 = 10000;
const DISCOUNT_PERCENT_1 = 10;
const DISCOUNT_PERCENT_2 = 20;

// ========== GET DISCOUNT PERCENT ==========
const getDiscountPercent = (cakePrice: number): number => {
  if (cakePrice >= DISCOUNT_THRESHOLD_2) return DISCOUNT_PERCENT_2;
  if (cakePrice >= DISCOUNT_THRESHOLD_1) return DISCOUNT_PERCENT_1;
  return 0;
};

// ========== PARTY SHOP DISCOUNT POPUP ==========
const PartyShopDiscountPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    if (!hasBeenShown) {
      popupTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        setHasBeenShown(true);
      }, 2000);
    }

    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, [hasBeenShown]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 400);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#69429a] to-[#8b5cf6] p-6 text-center">
                <div className="text-5xl mb-3 animate-bounce">🎉</div>

                <h2 className="text-2xl font-black text-white leading-tight">
                  Party Shop-ի զեղչ
                  <br />
                  <span className="text-white">տորթի հետ</span>
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Տորթի գինը</p>
                      <p className="text-xl font-bold text-gray-800">5,000 - 9,999 AMD</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Զեղչ</p>
                      <p className="text-2xl font-black text-green-600">10%</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">🎯 5,000 դրամը գերազանցող տորթ գնելիս</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Տորթի գինը</p>
                      <p className="text-xl font-bold text-gray-800">10,000+ AMD</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Զեղչ</p>
                      <p className="text-2xl font-black text-green-600">20%</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">🎯 10,000 դրամը գերազանցող տորթ գնելիս</p>
                </div>

                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <p className="text-xs text-blue-700 text-center">💡 Զեղչը կիրառվում է <strong>միայն Party Shop-ի</strong> ապրանքների վրա</p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-[#69429a] text-white font-semibold hover:bg-[#7c4fb3] transition-all shadow-md hover:shadow-lg"
                >
                  Հասկացա՛
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ========== SKELETON COMPONENT ==========
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

// ========== PLACEHOLDER IMAGE ==========
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='200' y='200' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

// ========== TELEGRAM BOT CONFIG ==========
const TELEGRAM_BOT_TOKEN = "8774226645:AAHnDf9dmeQg_XZkBYEAfL41xsfhsTpiBDk";
const TELEGRAM_CHAT_ID = "8072053329";
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://your-site.com';

// ========== IMAGE MODAL ==========
const ImageModal = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onPrev,
  onNext,
  productName
}: {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  productName: string;
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  }, [onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && images.length > 1) onNext();
    if (isRightSwipe && images.length > 1) onPrev();
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onPrev, onNext]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'rgba(0, 0, 0, 0.92)' }}
      onClick={handleClose}
    >
      <div 
        className="relative w-full h-full flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ====== TOP BAR ====== */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 z-30">
          {/* Left: Counter */}
          {images.length > 1 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 md:px-5 py-1.5 md:py-2">
              <span className="text-white/70 text-xs md:text-sm font-mono">
                {String(currentIndex + 1).padStart(2, '0')} <span className="text-white/30">/</span> {String(images.length).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Center: Product Name */}
          {productName && (
            <div className="flex-1 flex items-center justify-center">
            <div className=" text mx-4 md:mx-6" style={{textAlign: 'center'}}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 md:px-6 py-1.5 md:py-2">
                <p className="text-white/90 text-xs md:text-sm lg:text-base font-light text-center truncate">
                  {productName}
                </p>
              </div>
            </div>
            </div>
          )}

          {/* Right: Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-white/80 hover:text-white transition-all duration-300 bg-white/5 hover:bg-white/20 border border-white/10 rounded-full p-2 md:p-3 backdrop-blur-xl hover:scale-105 active:scale-95"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        {/* ====== IMAGE AREA ====== */}
        <div className="flex-1 flex items-center justify-center min-h-0 px-4 md:px-8 py-2 md:py-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={images[currentIndex] || PLACEHOLDER_IMAGE}
              alt={productName || "Product image"}
              className="w-auto h-auto max-w-full max-h-full object-contain select-none"
              style={{
                maxWidth: 'min(90vw, 1000px)',
                maxHeight: '100%',
                filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.6))'
              }}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          </div>
        </div>

        {/* ====== BOTTOM BAR ====== */}
        {images.length > 1 && (
          <div className="flex-shrink-0 flex items-center justify-center gap-4 md:gap-6 px-4 md:px-8 py-3 md:py-4 z-30">
            {/* Prev Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="group bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-full p-2 md:p-3 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-white/70 group-hover:text-white transition-colors" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5 md:gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-3 md:px-4 py-1.5 md:py-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    const diff = index - currentIndex;
                    if (diff > 0) {
                      for (let i = 0; i < diff; i++) onNext();
                    } else if (diff < 0) {
                      for (let i = 0; i < Math.abs(diff); i++) onPrev();
                    }
                  }}
                  className={`transition-all duration-300 ${
                    currentIndex === index
                      ? 'w-6 md:w-8 h-1.5 bg-white rounded-full shadow-lg shadow-white/20'
                      : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50 rounded-full'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="group bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-full p-2 md:p-3 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-white/70 group-hover:text-white transition-colors" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ========== MAIN COMPONENT ==========
export default function ShopPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { addToCart, getItemCount, cart, orderInfo } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [currentImage, setCurrentImage] = useState<Record<string, number>>({});

  // 🔥 State for discount simulation
  const [simulatedCakePrice, setSimulatedCakePrice] = useState<number | null>(null);
  const [showDiscountSimulator, setShowDiscountSimulator] = useState(false);

  const hasSentTelegram = useRef<Record<string, boolean>>({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProductId, setModalProductId] = useState<string | null>(null);
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);

  const isProductInCart = (productId: string) => {
    return cart.some((item: { id: string }) => item.id === productId);
  };

  const getProductQuantity = (productId: string) => {
    const item = cart.find((item: { id: string }) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  const addToCartHandler = (product: any) => {
    const quantity = quantities[String(product.id)] || 1;

    let imageUrl = '';
    if (product.image) {
      if (Array.isArray(product.image)) {
        imageUrl = product.image[0] || '';
      } else if (typeof product.image === 'string') {
        imageUrl = product.image;
      }
    }

    addToCart({
      id: String(product.id),
      name: product.name,
      image: imageUrl,
      price: product.price,
      quantity: quantity,
      options: null,
    });
    setQuantities(prev => ({
      ...prev,
      [String(product.id)]: 1
    }));
  };

  const cartCount = getItemCount();

  const getWorkingImageUrl = (url: string) => {
    if (!url) return PLACEHOLDER_IMAGE;

    if (url.includes('drive.google.com') ||
      url.includes('drive.usercontent.google.com') ||
      url.includes('googleusercontent.com')) {
      return `/api/image?url=${encodeURIComponent(url)}`;
    }

    return url;
  };

  const sendToTelegramProductView = async (productName: string, imageSrc: string) => {
    try {
      console.log("📤 Sending to Telegram:", productName);

      const caption = `🛒 New User View:\n📦 ${productName}\n🕒 ${new Date().toLocaleString()}`;

      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          photo: imageSrc,
          caption
        }),
      });

      const data = await response.json();
      console.log("📨 Telegram response:", data);

      if (data.ok) {
        console.log("✅ Successfully sent to Telegram!");
      } else {
        console.error("❌ Telegram error:", data.description);
      }
    } catch (err) {
      console.error("❌ Telegram send error:", err);
    }
  };

  useEffect(() => {
    if (modalProductId && modalProduct) {
      const productId = modalProductId;

      if (!hasSentTelegram.current[productId]) {
        hasSentTelegram.current[productId] = true;

        const imageSrc = Array.isArray(modalProduct.image)
          ? modalProduct.image[0]
          : modalProduct.image || PLACEHOLDER_IMAGE;

        const fullImageUrl = imageSrc.startsWith("http")
          ? imageSrc
          : `${SITE_URL}${imageSrc}`;

        sendToTelegramProductView(modalProduct.name, fullImageUrl);
      }
    }
  }, [modalProductId]);

  const openModal = (productId: string) => {
    setModalProductId(productId);
    setModalCurrentIndex(currentImage[productId] || 0);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setModalProductId(null);
    }, 100);
  };

  const handlePrevImage = () => {
    if (!modalProductId) return;
    const product = products.find(p => String(p.id) === modalProductId);
    if (!product) return;
    const images = Array.isArray(product.image) ? product.image : [product.image || PLACEHOLDER_IMAGE];
    setModalCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    if (!modalProductId) return;
    const product = products.find(p => String(p.id) === modalProductId);
    if (!product) return;
    const images = Array.isArray(product.image) ? product.image : [product.image || PLACEHOLDER_IMAGE];
    setModalCurrentIndex(prev => (prev + 1) % images.length);
  };

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const res = await fetch(
          "https://opensheet.elk.sh/1F6YoFIrbrIbKgItyWZZnF60wWKImkq_g-fUFJ7vJ9a8/Sheet1"
        );

        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`);
        }

        const data = await res.json();

        console.log("Raw sheet data:", data);

        const formatted = data.map((item: any, index: number) => {
          const imageUrl = item["նկար"] || item["Image"] || "";

          return {
            id: index + 1,
            name: item["Անուն"] || item["Name"] || "Unnamed Product",
            price: Number(item["վաճառքի արժեք"] || item["Price"] || 0),
            stock: Number(item["քանակ"] || item["Stock"] || 0),
            notes: item["notes"] || item["Notes"] || "",
            image: [getWorkingImageUrl(imageUrl)],
            set: false,
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

  const modalProduct = modalProductId
    ? products.find(p => String(p.id) === modalProductId)
    : null;

  const modalImages = modalProduct
    ? (Array.isArray(modalProduct.image) ? modalProduct.image : [modalProduct.image || PLACEHOLDER_IMAGE])
    : [];

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
        {/* ========== PARTY SHOP HEADER IMAGE ========== */}
        <section>
          <img
            src={partyShop.src}
            alt="Party Shop"
            className="w-full h-[auto] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />
        </section>

        {/* ========== DISCOUNT BANNER (VISIBLE ON PAGE) ========== */}
        <section className="bg-gradient-to-r from-purple-50 to-pink-50 py-4 border-b border-purple-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-[#69429a] rounded-full p-2 text-white">
                  <Percent className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm sm:text-base">
                    🎉 Party Shop Հատուկ Զեղչեր
                  </p>
                  <p className="text-xs text-gray-600">
                    Տորթի գնից կախված՝ <span className="font-bold text-green-600">10%</span> կամ <span className="font-bold text-green-600">20%</span> զեղչ
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="bg-white rounded-lg px-3 py-1.5 text-center shadow-sm border border-green-200">
                  <p className="text-[10px] text-gray-500">5,000-9,999 AMD</p>
                  <p className="text-lg font-black text-green-600">10%</p>
                </div>
                <div className="bg-white rounded-lg px-3 py-1.5 text-center shadow-sm border border-green-200">
                  <p className="text-[10px] text-gray-500">10,000+ AMD</p>
                  <p className="text-lg font-black text-green-600">20%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== DISCOUNT SIMULATOR ========== */}
       

        {/* ========== PRODUCTS GRID ========== */}
        <section className="bg-white py-10">
          <div className="container mx-auto px-4">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{t('noProductsAvailable')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                  const productId = String(product.id);
                  const inCart = isProductInCart(productId);
                  const cartQuantity = getProductQuantity(productId);
                  const selectedQuantity = quantities[productId] || 1;
                  const productImages = Array.isArray(product.image)
                    ? product.image
                    : [product.image || PLACEHOLDER_IMAGE];

                  const currentImageIndex = currentImage[productId] || 0;
                  const hasError = imageErrors[productId];

                  // 🏷️ Calculate discount for this product (if simulator is active)
                  const discountPercent = simulatedCakePrice !== null
                    ? getDiscountPercent(simulatedCakePrice)
                    : 0;

                  const discountedPrice = discountPercent > 0
                    ? product.price * (1 - discountPercent / 100)
                    : product.price;

                  const hasDiscount = discountPercent > 0;

                  return (
                    !!product.stock && <div
                      key={productId}
                      className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 relative"
                    >
                      {/* 🏷️ DISCOUNT BADGE */}
                      {hasDiscount && (
                        <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                          -{discountPercent}% 🎉
                        </div>
                      )}

                      <div className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer">
                        <img
                          src={productImages[currentImageIndex]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onClick={() => openModal(productId)}
                          onError={(e) => {
                            console.log(`Image error for product ${productId}:`, productImages[currentImageIndex]);
                            setImageErrors(prev => ({
                              ...prev,
                              [productId]: true
                            }));
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                          }}
                          onLoad={() => {
                            console.log(`Image loaded for product ${productId}`);
                            setImageErrors(prev => ({
                              ...prev,
                              [productId]: false
                            }));
                          }}
                        />

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 backdrop-blur-sm">
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6" />
                            </svg>
                          </div>
                        </div>

                        {productImages.length > 1 && !hasError && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newIndex = ((currentImageIndex - 1) + productImages.length) % productImages.length;
                                setCurrentImage(prev => ({
                                  ...prev,
                                  [productId]: newIndex
                                }));
                                setImageErrors(prev => ({
                                  ...prev,
                                  [productId]: false
                                }));
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors z-10 backdrop-blur-sm"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newIndex = (currentImageIndex + 1) % productImages.length;
                                setCurrentImage(prev => ({
                                  ...prev,
                                  [productId]: newIndex
                                }));
                                setImageErrors(prev => ({
                                  ...prev,
                                  [productId]: false
                                }));
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors z-10 backdrop-blur-sm"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>

                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                              {productImages.map((_: any, index: number) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full transition-colors ${currentImageIndex === index
                                      ? "bg-white"
                                      : "bg-white/50"
                                    }`}
                                />
                              ))}
                            </div>
                          </>
                        )}

                        {product.stock <= 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
                            {t('outOfStock')}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-800 tracking-tight line-clamp-2">
                          {product.name}
                        </h3>

                        {/* 💰 Price with discount */}
                        <div className="mt-1">
                          {hasDiscount ? (
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-green-600">
                                {Math.round(discountedPrice)} {t('currency') || 'AMD'}
                              </p>
                              <p className="text-xs text-gray-400 line-through">
                                {product.price} {t('currency') || 'AMD'}
                              </p>
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                -{discountPercent}%
                              </span>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm font-medium">
                              {product.price} {t('currency') || 'AMD'}
                            </p>
                          )}
                        </div>

                        {product.notes && (
                          <p className="text-xs text-gray-400 mt-0.5 italic">
                            {product.notes}
                          </p>
                        )}

                        {!inCart && product.stock > 0 && (
                          <div className="flex items-center justify-between mt-3 border border-gray-200 rounded-full p-1 bg-gray-50">
                            <button
                              onClick={() => updateQuantity(productId, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={selectedQuantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-medium text-gray-700 min-w-[30px] text-center">
                              {selectedQuantity}
                            </span>
                            <button
                              onClick={() => {
                                if (selectedQuantity < product.stock) {
                                  updateQuantity(productId, 1);
                                }
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={selectedQuantity >= product.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {inCart && (
                          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>
                              {cartQuantity} {t('pieces') || "հատ"} {t('inCart') || "զամբյուղում"}
                            </span>
                          </div>
                        )}

                        <Button
                          onClick={() => {
                            if (!inCart && product.stock > 0) {
                              addToCartHandler(product);
                            }
                          }}
                          disabled={inCart || product.stock <= 0}
                          className={`mt-3 w-full min-h-[44px] rounded-full px-3 py-2 text-xs sm:text-sm font-medium tracking-tight transition-all duration-200 ease-in-out shadow-sm focus:ring-2 focus:ring-purple-300 focus:outline-none flex items-center justify-center gap-2 text-center whitespace-normal break-words leading-tight ${inCart || product.stock <= 0
                              ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed opacity-90 shadow-none"
                              : "bg-indigo-500 hover:bg-indigo-600 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                            }`}
                          style={{
                            color: "#fff",
                            backgroundColor: inCart
                              ? "#10b981"
                              : product.stock <= 0
                                ? "#9ca3af"
                                : "#69429a"
                          }}
                        >
                          {inCart ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {t("alreadyInCart") || "Ավելացված է զամբյուղում"}
                            </>
                          ) : product.stock <= 0 ? (
                            "Չկա պահեստում"
                          ) : (
                            <>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              {t("addToCart") || "Ավելացնել զամբյուղ"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ========== FLOATING CART BUTTON ========== */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg transition z-50 flex items-center justify-center hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#69429a" }}
        >
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

        {/* ========== CART DRAWER ========== */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          orderInfo={orderInfo}
        />

        {/* ========== IMAGE MODAL ========== */}
        <ImageModal
          isOpen={modalOpen}
          onClose={closeModal}
          images={modalImages}
          currentIndex={modalCurrentIndex}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
          productName={modalProduct?.name || ""}
        />

        {/* ========== 🎉 PARTY SHOP DISCOUNT POPUP ========== */}
        <PartyShopDiscountPopup />
      </div>
    </>
  );
}