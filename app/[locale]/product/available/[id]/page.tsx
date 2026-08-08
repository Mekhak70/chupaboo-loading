"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ShoppingCart, Check } from "lucide-react";
import { useParams } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { useLanguage } from "@/components/language-provider";
import { CartDrawer } from "@/components/CartDrawer";



type PaymentMethod = "cash" | "CARD" | "bankTransfer" | "";
type DeliveryOption = "delivery" | "pickup"

interface OrderInfo {
  deliveryOption: DeliveryOption;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: PaymentMethod;
  phoneNumber: string;
  deliveryFee: number;
  distance: number | null;
  isYerevanAddress: boolean | null;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%23f3f4f6'/%3E%3Ctext x='300' y='300' font-family='Arial' font-size='22' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const { addToCart, getItemCount } = useCart();
  const { t, language } = useLanguage();
  function getTodayDate() {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    return today.toISOString().split("T")[0];
  }
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({
    deliveryOption: "delivery",
    deliveryAddress: "",
    deliveryDate: getTodayDate(),
    deliveryTime: "",
    paymentMethod: "cash",
    phoneNumber: "",
    deliveryFee: 0,
    distance: null,
    isYerevanAddress: null,
  });

  const cartCount = getItemCount();


  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(
          "https://opensheet.elk.sh/1JuaojKVSs8Fe6_4e2nPdHg0WgFJxNkL-uQbbcyPP1b0/Sheet1"
        );

        if (!res.ok) throw new Error(`Products HTTP Error: ${res.status}`);

        const data = await res.json();
        const item = data.find(
          (item: any, index: number) => String(item.id || index + 1) === String(id)
        );

        if (!item) {
          setProduct(null);
          return;
        }

        let image = item["նկար"] || item.image || "";
        const match = image.match(/\/d\/([^/]+)/);
        if (match) {
          image = `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }

        setProduct({
          id: item.id || id,
          name: item.name || item["Անուն"] || "Ապրանք",
          price: Number(item.price || item["վաճառքի արժեք"] || 0),
          image: image || PLACEHOLDER_IMAGE,
          ingredients:
            item["բաղադրություն"] ||
            item["Բաղադրություն"] ||
            item.ingredients ||
            item.ingredient ||
            item.notes ||
            "Բաղադրությունը նշված չէ",
          stock: Number(item.stock || 999),
        });
      } catch (error) {
        console.error("Load product error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      options: product.ingredient,
      ingredient: product.ingredients,
    });
    setIsCartOpen(true)
    setAdded(true);

  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
            <div className="grid md:grid-cols-2">
              <div className="aspect-square bg-gray-200" />
              <div className="p-8 md:p-12 space-y-5">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-20 bg-gray-200 rounded" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-14 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('productNotFound')}
          </h1>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#69429a] px-6 py-3 text-white font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToHome')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 md:py-14">
      <div className="container mx-auto px-4">

        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-[#69429a] font-semibold mb-6 hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('backToShop')}
        </Link>

        <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-square bg-gray-50">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 bg-[#aed137] text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                  <Check className="w-4 h-4" />
                  {t('inStock')}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center">
              <p className="text-sm font-semibold text-[#aed137] uppercase tracking-wider mb-3">
               {t('available')}
              </p>

              <h1 className="text-3xl md:text-4xl font-black text-[#69429a] mb-6">
                {product.name}
              </h1>

              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  {t('ingredient')}:
                </h2>
                <p className="text-gray-600 leading-7">
                  {product.ingredients
                    .split(',')
                    .map((ingredient: string) => t(ingredient.trim()))
                    .join(', ')}
                </p>
              </div>

              <div className="mb-7">
                <p className="text-sm text-gray-500 mb-1">{t('price')}</p>
                <p className="text-3xl font-black text-[#69429a]">
                  {Number(product.price).toLocaleString()} AMD
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-[#69429a] hover:bg-[#7c4fb3] text-white px-6 py-4 text-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {added ? (
                  <>
                    <Check className="w-6 h-6" />
                    {t('addedToCart')}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    {t('addToCart')}
                  </>
                )}
              </button>
              <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center p-4 rounded-full text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#69429a" }}
          >
            <ShoppingCart className="w-6 h-6" />
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
          </div>
        </div>
      </div>

    </main>
  );
}