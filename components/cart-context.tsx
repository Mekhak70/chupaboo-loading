"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
export type CartItem = {
  id: string; name: string; image: string; price: number; quantity: number;
  options: any | null; ingredient?: string | null;
};
export interface OrderInfo {
  deliveryOption: "delivery" | "pickup"; deliveryAddress: string; deliveryDate: string;
  deliveryTime: string; paymentMethod: string; phoneNumber: string; deliveryFee: number;
  distance?: number | null | undefined; isYerevanAddress?: boolean | null;
}
interface CartContextType {
  cart: CartItem[]; addToCart: (item:CartItem)=>void;
  removeFromCart:(id:string,options?:any)=>void;
  updateQuantity:(id:string,quantity:number,options?:any)=>void;
  clearCart:()=>void;getCartTotal:()=>number;getItemCount:()=>number;
  orderInfo:OrderInfo;updateOrderInfo:(updates:Partial<OrderInfo>)=>void;
  clearOrderInfo:()=>void;resetAll:()=>void;
}
const CartContext=createContext<CartContextType|undefined>(undefined);
function getTomorrowDate(){const date=new Date();date.setDate(date.getDate()+1);return date.toISOString().split("T")[0];}
const DEFAULT_ORDER_INFO:OrderInfo={deliveryOption:"delivery",deliveryAddress:"",deliveryDate:getTomorrowDate(),
  deliveryTime:"",paymentMethod:"cash",phoneNumber:"",deliveryFee:0,distance:null,isYerevanAddress:null};
export function CartProvider({children}:{children:ReactNode}){
  const [cart,setCart]=useState<CartItem[]>([]);
  const [orderInfo,setOrderInfo]=useState<OrderInfo>(DEFAULT_ORDER_INFO);
  const addToCart=(newItem:CartItem)=>{
    setCart(previous=>{
      const index=previous.findIndex(item=>item.id===newItem.id&&JSON.stringify(item.options)===JSON.stringify(newItem.options));
      // Copy the line too: React can re-run state updaters in development.
      // Mutating previous[index].quantity would add the same quantity twice.
      return index===-1 ? [...previous,newItem] : previous.map((item,i)=>i===index?{...item,quantity:item.quantity+newItem.quantity}:item);
    });
  };
  const removeFromCart=(id:string,options?:any)=>setCart(previous=>previous.filter(item=>!(item.id===id&&JSON.stringify(item.options)===JSON.stringify(options))));
  const updateQuantity=(id:string,quantity:number,options?:any)=>{
    if(quantity<=0){removeFromCart(id,options);return;}
    setCart(previous=>previous.map(item=>item.id===id&&JSON.stringify(item.options)===JSON.stringify(options)?{...item,quantity}:item));
  };
  const clearCart=()=>setCart([]);
  const getCartTotal=()=>cart.reduce((sum,item)=>sum+item.price*item.quantity,0);
  const getItemCount=()=>cart.reduce((sum,item)=>sum+item.quantity,0);
  const updateOrderInfo=(updates:Partial<OrderInfo>)=>setOrderInfo(previous=>({...previous,...updates}));
  const clearOrderInfo=()=>setOrderInfo(DEFAULT_ORDER_INFO);
  const resetAll=()=>{setCart([]);setOrderInfo(DEFAULT_ORDER_INFO);};
  return <CartContext.Provider value={{cart,addToCart,removeFromCart,updateQuantity,clearCart,getCartTotal,getItemCount,
    orderInfo,updateOrderInfo,clearOrderInfo,resetAll}}>{children}</CartContext.Provider>;
}
export function useCart(){const context=useContext(CartContext);if(!context)throw new Error("useCart must be used within a CartProvider");return context;}
