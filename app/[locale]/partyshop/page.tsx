"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, CheckCircle, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { CartDrawer } from "@/components/CartDrawer";
import partyShop from "@/public/party-shop-main.jpg";
import { useCart } from "@/components/cart-context";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Skeleton Component
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

// Placeholder image
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='200' y='200' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ShopPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { addToCart, getItemCount, cart, orderInfo } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [currentImage, setCurrentImage] = useState<Record<string, number>>({});

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

// ShopPage-ում
const addToCartHandler = (product: any) => {
  const quantity = quantities[String(product.id)] || 1;
  
  // ✅ Ճիշտ վերցնել նկարի URL-ը
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
    image: imageUrl, // ✅ Փոխանցել որպես string
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

  // ⭐ ՆՈՐ ՖՈՒՆԿՑԻԱՆ՝ API ROUTE-ՈՎ
  const getWorkingImageUrl = (url: string) => {
    if (!url) return PLACEHOLDER_IMAGE;

    // Եթե դա Google Drive-ի հղում է, օգտագործել API route-ը
    if (url.includes('drive.google.com') ||
      url.includes('drive.usercontent.google.com') ||
      url.includes('googleusercontent.com')) {
      return `/api/image?url=${encodeURIComponent(url)}`;
    }

    return url;
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
        <section>
          <img
            src={partyShop.src}
            alt="Party Shop"
            className="w-full h-[320px] object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />
        </section>

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
                  return (
                    !!product.stock && <div
                      key={productId}
                      className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={productImages[currentImageIndex]}
                          alt={product.name}
                          className="w-full h-full object-cover"
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
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
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
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>

                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
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
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {t('outOfStock')}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-800 tracking-tight line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-500 mt-1 text-sm font-medium">
                          {product.price} {t('currency') || 'AMD'}
                        </p>
                        {product.notes && (
                          <p className="text-xs text-gray-400 mt-0.5 italic">
                            {product.notes}
                          </p>
                        )}
                        {/* <p className="text-xs text-gray-400 mt-0.5">
                          Stock: {product.stock} {t('pieces') || 'pcs'}
                        </p> */}

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
                          className={`mt-3 w-full rounded-full py-2.5 text-sm font-medium tracking-wide transition-all duration-200 ease-in-out shadow-sm focus:ring-2 focus:ring-purple-300 focus:outline-none ${inCart || product.stock <= 0
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

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          orderInfo={orderInfo}
        />
      </div>
    </>
  );
}