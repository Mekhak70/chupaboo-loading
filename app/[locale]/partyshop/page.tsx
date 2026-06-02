"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { PARTYSHOPDATA } from "@/lib/products";
import { CartDrawer } from "@/components/CartDrawer";
import partyShop from "@/public/party-shop-main.jpg";
import { useCart } from "@/components/cart-context";

export default function ShopPage() {
  const { t } = useLanguage();
  const { addToCart, getItemCount, cart, orderInfo } = useCart(); // No need for orderInfo here
  const [isCartOpen, setIsCartOpen] = useState(false);

  const isProductInCart = (productId: string) => {
    return cart.some((item: { id: string }) => item.id === productId);
  };

  const addToCartHandler = (product: (typeof PARTYSHOPDATA)[0]) => {
    addToCart({
      id: String(product.id),
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
      options: null,
    });
  };

  const cartCount = getItemCount();

  return (
    <>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section>
          <Image
            src={partyShop}
            alt="Party Shop"
            height={320}
            className="w-full object-cover"
          />
        </section>

        {/* Products Grid */}
        <section className="bg-white py-10">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PARTYSHOPDATA.map((product) => {
                const productId = String(product.id);
                const inCart = isProductInCart(productId);
                return (
                  <div
                    key={productId}
                    className="group rounded-2xl overflow-hidden bg-white border border-gray-100/80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800 tracking-tight">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 mt-1 text-sm font-medium">
                        {product.price} դրամ
                      </p>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!inCart) addToCartHandler(product);
                        }}
                        disabled={inCart}
                        className={`mt-3 w-full rounded-full py-2.5 text-sm font-medium tracking-wide transition-all duration-200 ease-in-out shadow-sm focus:ring-2 focus:ring-purple-300 focus:outline-none ${
                          inCart
                            ? "bg-emerald-500 hover:bg-emerald-600 cursor-not-allowed opacity-90 shadow-none"
                            : "bg-indigo-500 hover:bg-indigo-600 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                        style={{ color: "#fff", backgroundColor: inCart ? "#10b981" : "#69429a" }}
                      >
                        {inCart ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {t("alreadyInCart") || "Ավելացված է զամբյուղում"}
                          </>
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
          </div>
        </section>

        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg transition z-50 flex items-center justify-center"
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