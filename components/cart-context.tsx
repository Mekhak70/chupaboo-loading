// components/cart-context.tsx
"use client";

import { log } from "console";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  options: any | null;
};

export interface OrderInfo {
  deliveryOption: "delivery" | "pickup";
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: string;
  phoneNumber: string;
  deliveryFee: number;
  distance?: number | null | undefined;
  isYerevanAddress?: boolean | null;
}

interface CartContextType {
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, options?: any) => void;
  updateQuantity: (id: string, quantity: number, options?: any) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  
  // Order Info
  orderInfo: OrderInfo;
  updateOrderInfo: (updates: Partial<OrderInfo>) => void;
  clearOrderInfo: () => void;
  resetAll: () => void;
  
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

const DEFAULT_ORDER_INFO: OrderInfo = {
  deliveryOption: "delivery",
  deliveryAddress: "",
  deliveryDate: getTomorrowDate(),
  deliveryTime: "",
  paymentMethod: "cash",
  phoneNumber: "",
  deliveryFee: 0,
  distance: null,
  isYerevanAddress: null,
};

export function CartProvider({ children }: { children: ReactNode }) {
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Order info state
  const [orderInfo, setOrderInfo] = useState<OrderInfo>(DEFAULT_ORDER_INFO);



  // ========== CART ACTIONS ==========
  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === newItem.id &&
          JSON.stringify(item.options) === JSON.stringify(newItem.options)
      );
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      } else {
        return [...prev, newItem];
      }
    });
  };

  

  const removeFromCart = (id: string, options?: any) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id && JSON.stringify(item.options) === JSON.stringify(options))
      )
    );
  };

  const updateQuantity = (id: string, quantity: number, options?: any) => {
    if (quantity <= 0) {
      removeFromCart(id, options);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && JSON.stringify(item.options) === JSON.stringify(options)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getItemCount = () =>
    cart.reduce((sum, item) => sum + item.quantity, 0);

  // ========== ORDER INFO ACTIONS ==========
  const updateOrderInfo = (updates: Partial<OrderInfo>) => {
    console.log("📝 Updating order info:", updates);
    setOrderInfo((prev) => {
      const newOrderInfo = { ...prev, ...updates };
      console.log("✨ New order info:", newOrderInfo);
      return newOrderInfo;
    });
  };

  const clearOrderInfo = () => {
    setOrderInfo(DEFAULT_ORDER_INFO);
  };

  const resetAll = () => {
    setCart([]);
    setOrderInfo(DEFAULT_ORDER_INFO);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
        orderInfo,
        updateOrderInfo,
        clearOrderInfo,
        resetAll,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  console.log("🔍 useCart context value:", context);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}