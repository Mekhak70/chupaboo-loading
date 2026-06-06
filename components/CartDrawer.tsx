"use client";

import { X, Minus, Plus, Trash2, ChevronDown, ChevronUp, Info, Truck, MapPin, Phone, Calendar, Clock, CreditCard, Home, Edit2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/components/cart-context";
import { useLanguage } from "@/components/language-provider";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { navigate } from "next/dist/client/components/segment-cache/navigation";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderInfo?: {
    deliveryOption: "delivery" | "pickup";
    deliveryAddress: string;
    deliveryDate: string;
    deliveryTime: string;
    paymentMethod: string;
    phoneNumber: string;
    deliveryFee: number;
  };
}

// Maps for displaying values
const cakeTypeDisplayMap: Record<string, string> = {
  MEAT: "Մսային",
  FRUIT: "Մրգային",
  VEGETABLES: "Բուսական",
};

const creamTypeDisplayMap: Record<string, string> = {
  DAIRY: "Կաթնամթերք",
  PLANTBASEDMILK: "Բուսական կաթ",
  PLANTBASED: "Բուսական",
};

const designTypeDisplayMap: Record<string, string> = {
  STANDARD: "Ստանդարտ",
  CUSTOM_PHOTO: "Լուսանկարով",
  NAME_TEXT: "Կենդանու անուն",
  CUSTOM_TEXT: "Հատուկ տեքստ",
};

const animalTypeDisplayMap: Record<string, string> = {
  CHICKEN: "Հավ",
  BEEF: "Տավար",
  LAMB: "Գառ",
  TURKEY: "Հնդկահավ",
};

const vegetableDisplayMap: Record<string, string> = {
  POTATO: "Կարտոֆիլ",
  CARROT: "Գազար",
  BROCCOLI: "Բրոկկոլի",
  PUMPKIN: "Դդում",
  PEPPER: "Կանաչ պղպեղ",
  ZUCCHINI: "Ցուկկինի",
  CAULIFLOWER: "Ծաղկակաղամբ",
  SWEET_POTATO: "Քաղցր կարտոֆիլ",
  SPINACH: "Սպանախ",
  RICE: "Բրինձ",
  WHEAT: "Ցորեն",
  OATS: "Վարսակ",
  APPLE: "Խնձոր",
  BANANA: "Բանան",
  PEAR: "Տանձ",
  ELDERBERRY: "Երախտածաղիկ",
  STRAWBERRY: "Ելակ",
  MANGO: "Մանգո",
};

const paymentMethodDisplayMap: Record<string, string> = {
  cash: "💵 Կանխիկ",
  bankTransfer: "🏦 Բանկային փոխանցում",
  CARD: "💳 Կարտով",
};

const deliveryOptionDisplayMap: Record<string, string> = {
  delivery: "🚚 Առաքում",
  pickup: "🏠 Ինքնակառավարում",
};

// ========== DELIVERY CONSTANTS ==========
const PICKUP_ADDRESS = "Երևան, Կիևյան 15";
const PICKUP_LAT = 40.195059;
const PICKUP_LON = 44.488427;
const FREE_DELIVERY_THRESHOLD = 6000;
const FREE_DELIVERY_MAX_DISTANCE = 10;
const BASE_DELIVERY_FEE = 1000;
const EXTRA_DISTANCE_FEE = 500;
const EXTRA_DISTANCE_THRESHOLD = 7;

interface TempOrderInfo {
  phoneNumber: string;
  deliveryOption: "delivery" | "pickup";
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: string;
  deliveryFee: number;
  distance: number | null;
  isCalculating: boolean;
}

interface EditCakeData {
  id: string;
  name: string;
  image: string;
  quantity: number;
  options: any;
}

function getTodayDate() {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  return today.toISOString().split("T")[0];
}

function getMinDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function getMaxDate() {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  return maxDate.toISOString().split("T")[0];
}

// ========== DELIVERY FEE HELPERS ==========
const calculateDeliveryFeeByDistance = (distanceInKm: number): number => {
  if (distanceInKm <= 0) return BASE_DELIVERY_FEE;
  let fee = BASE_DELIVERY_FEE;
  if (distanceInKm > EXTRA_DISTANCE_THRESHOLD) {
    const extraDistance = distanceInKm - EXTRA_DISTANCE_THRESHOLD;
    const extraSegments = Math.ceil(extraDistance / EXTRA_DISTANCE_THRESHOLD);
    fee += extraSegments * EXTRA_DISTANCE_FEE;
  }
  return fee;
};

const calculateStraightDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const isAddressInYerevanByText = (address: string): boolean => {
  const yerevanKeywords = ["yerevan", "erevan", "երևան", "երեւան", "Երևան", "Երեւան", "Yerevan", "Erevan"];
  return yerevanKeywords.some((keyword) => address.toLowerCase().includes(keyword));
};

export function CartDrawer({ isOpen, onClose, orderInfo: propOrderInfo }: CartDrawerProps) {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, orderInfo: contextOrderInfo, addToCart } = useCart();
  const { t,language } = useLanguage();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(false);
  const navigate= useRouter();
  // States for flow
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showMessengerSelector, setShowMessengerSelector] = useState(false);
  const [tempOrderInfo, setTempOrderInfo] = useState<TempOrderInfo>({
    phoneNumber: "",
    deliveryOption: "delivery",
    deliveryAddress: "",
    deliveryDate: getTodayDate(),
    deliveryTime: "",
    paymentMethod: "cash",
    deliveryFee: 0,
    distance: null,
    isCalculating: false,
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasCake = cart.some((item) => item.options?.cakeType);
  const hasOnlyAccessories = cart.length > 0 && !hasCake;
  
  // Priority: use context orderInfo if available, otherwise use prop
  const existingOrderInfo = contextOrderInfo || propOrderInfo;
  
  // Calculate products total (without delivery fee)
  const DISCOUNT_AMOUNT = 500;
  const hasCakeInCart = cart.some((item) => item.options?.cakeType);
  
  const productsTotal = cart.reduce((total, item) => {
    const isCake = !!item.options?.cakeType;
    let unitPrice = item.price;
    if (hasCakeInCart && !isCake) {
      unitPrice = Math.max(0, unitPrice - DISCOUNT_AMOUNT);
    }
    return total + unitPrice * (typeof item.quantity === "number" ? item.quantity : 0);
  }, 0);
  
  const effectiveTotal = productsTotal + (tempOrderInfo.deliveryOption === "delivery" ? tempOrderInfo.deliveryFee : 0);

  // ========== GEOCODING & DISTANCE ==========
  const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lon: number } | null> => {
    if (!address || address.trim().length < 5) return null;
    try {
      const encodedAddress = encodeURIComponent(address + ", Armenia");
      const response = await fetch(`/api/geocode?q=${encodedAddress}`);
      if (!response.ok) return null;
      const data = await response.json();
      if (data.error) return null;
      if (data && Array.isArray(data) && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
      return null;
    } catch {
      return null;
    }
  };

  const calculateDrivingDistance = async (address: string): Promise<number | null> => {
    if (!address || address.trim().length < 5) return null;
    try {
      const deliveryCoords = await getCoordinatesFromAddress(address);
      if (!deliveryCoords) return null;
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${PICKUP_LON},${PICKUP_LAT};${deliveryCoords.lon},${deliveryCoords.lat}?overview=false`;
      const response = await fetch(osrmUrl);
      if (!response.ok) {
        return calculateStraightDistance(PICKUP_LAT, PICKUP_LON, deliveryCoords.lat, deliveryCoords.lon);
      }
      const data = await response.json();
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        return data.routes[0].distance / 1000;
      }
      return calculateStraightDistance(PICKUP_LAT, PICKUP_LON, deliveryCoords.lat, deliveryCoords.lon);
    } catch {
      return null;
    }
  };

  // Update delivery fee based on address and products total
  const updateDeliveryFee = useCallback(async (address: string, productsTotalValue: number) => {
    if (!address || address.trim().length < 5) {
      setTempOrderInfo(prev => ({ ...prev, deliveryFee: 0, distance: null, isCalculating: false }));
      return;
    }
    
    setTempOrderInfo(prev => ({ ...prev, isCalculating: true }));
    
    try {
      const dist = await calculateDrivingDistance(address);
      
      if (dist !== null) {
        let fee = 0;
        
        if (productsTotalValue >= FREE_DELIVERY_THRESHOLD) {
          if (dist <= FREE_DELIVERY_MAX_DISTANCE) {
            fee = 0;
          } else {
            const extraDistance = dist - FREE_DELIVERY_MAX_DISTANCE;
            const extraSegments = Math.ceil(extraDistance / EXTRA_DISTANCE_THRESHOLD);
            fee = extraSegments * EXTRA_DISTANCE_FEE;
          }
        } else {
          fee = calculateDeliveryFeeByDistance(dist);
        }
        
        setTempOrderInfo(prev => ({ ...prev, deliveryFee: fee, distance: dist, isCalculating: false }));
      } else {
        const fallbackFee = productsTotalValue >= FREE_DELIVERY_THRESHOLD ? 0 : BASE_DELIVERY_FEE;
        setTempOrderInfo(prev => ({ ...prev, deliveryFee: fallbackFee, distance: null, isCalculating: false }));
      }
    } catch {
      setTempOrderInfo(prev => ({ ...prev, deliveryFee: productsTotalValue >= FREE_DELIVERY_THRESHOLD ? 0 : BASE_DELIVERY_FEE, distance: null, isCalculating: false }));
    }
  }, []);

  // Debounced delivery fee calculation
  useEffect(() => {
    if (tempOrderInfo.deliveryOption === "delivery" && tempOrderInfo.deliveryAddress && tempOrderInfo.deliveryAddress.trim().length > 5) {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        updateDeliveryFee(tempOrderInfo.deliveryAddress, productsTotal);
      }, 1500);
    } else if (tempOrderInfo.deliveryOption === "pickup") {
      setTempOrderInfo(prev => ({ ...prev, deliveryFee: 0, distance: null }));
    }
    return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
  }, [tempOrderInfo.deliveryAddress, tempOrderInfo.deliveryOption, productsTotal, updateDeliveryFee]);

  // For cake orders, use existingOrderInfo; for accessories, use tempOrderInfo
  const orderInfo = hasCake ? existingOrderInfo : (showDeliveryForm ? null : tempOrderInfo);

  // ========== EDIT CAKE FUNCTION ==========
  const handleEditCake = (item: any) => {
    const editData = {
      id: item.id,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      options: item.options,
    };
    sessionStorage.setItem('editingCake', JSON.stringify(editData));
    onClose();
    const productId = item.id.split('/').pop(); // gets "miniboo-1" from "hy/product/miniboo-1"
  
    // OR if item.id is already just "miniboo-1"
    const cleanId = item.id.includes('/') ? item.id.split('/').pop() : item.id;
    
    // ✅ Correct URL
    router.push(`/${language}/product/${cleanId}?edit=true`);
    };

  const toggleItemExpand = (itemId: string) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const getVegetableDisplay = (vegKey: string): string => {
    return vegetableDisplayMap[vegKey] || vegKey;
  };

  const formatCakeOptions = (options: any) => {
    if (!options) return null;
    
    const details: { emoji: string; label: string; value: string }[] = [];
    
    if (options.cakeType && cakeTypeDisplayMap[options.cakeType]) {
      details.push({ emoji: "🍰", label: "Տորթի տեսակ", value: cakeTypeDisplayMap[options.cakeType] });
    }
    if (options.creamType && creamTypeDisplayMap[options.creamType]) {
      details.push({ emoji: "🍦", label: "Կրեմի տեսակ", value: creamTypeDisplayMap[options.creamType] });
    }
    if (options.selectedVegetables && options.selectedVegetables.length > 0) {
      const vegNames = options.selectedVegetables.map((v: string) => getVegetableDisplay(v));
      details.push({ emoji: "🥗", label: "Բաղադրիչներ", value: vegNames.join(", ") });
    }
    if (options.selectedAnimal && animalTypeDisplayMap[options.selectedAnimal]) {
      details.push({ emoji: "🍗", label: "Մսի տեսակ", value: animalTypeDisplayMap[options.selectedAnimal] });
    }
    if (options.designType && designTypeDisplayMap[options.designType]) {
      details.push({ emoji: "🎨", label: "Դիզայն", value: designTypeDisplayMap[options.designType] });
    }
    if (options.petName && options.petName.trim()) {
      details.push({ emoji: "🐾", label: "Ընտանի կենդանու անուն", value: options.petName });
    }
    if (options.customText && options.customText.trim()) {
      details.push({ emoji: "📝", label: "Հատուկ տեքստ", value: `"${options.customText}"` });
    }
    if (options.customImage && options.designType === "CUSTOM_PHOTO") {
      details.push({ emoji: "🖼️", label: "Կցված նկար", value: "Նկարը կցված է" });
    }
    
    return details;
  };

  const formatDeliveryInfo = () => {
    const info = hasCake ? existingOrderInfo : tempOrderInfo;
    if (!info) return null;
    
    const details: { emoji: string; label: string; value: string }[] = [];
    
    if (info.phoneNumber && info.phoneNumber.trim()) {
      details.push({ emoji: "📞", label: "Հեռախոս", value: info.phoneNumber });
    } else {
      details.push({ emoji: "📞", label: "Հեռախոս", value: "նշված չէ" });
    }
    
    details.push({ 
      emoji: "🚚", 
      label: "Առաքման տարբերակ", 
      value: deliveryOptionDisplayMap[info.deliveryOption] || info.deliveryOption 
    });
    
    if (info.deliveryOption === "delivery") {
      if (info.deliveryAddress && info.deliveryAddress.trim()) {
        details.push({ emoji: "📍", label: "Առաքման հասցե", value: info.deliveryAddress });
      } else {
        details.push({ emoji: "📍", label: "Առաքման հասցե", value: "նշված չէ" });
      }
    } else {
      details.push({ emoji: "🏠", label: "Վերցման կետ", value: PICKUP_ADDRESS });
    }
    
    if (info.deliveryDate) {
      const formattedDate = info.deliveryDate.split("-").reverse().join(".");
      details.push({ emoji: "📅", label: "Առաքման ամսաթիվ", value: formattedDate });
    } else {
      details.push({ emoji: "📅", label: "Առաքման ամսաթիվ", value: "նշված չէ" });
    }
    
    if (info.deliveryTime && info.deliveryTime.trim()) {
      details.push({ emoji: "⏰", label: "Նախընտրելի ժամ", value: info.deliveryTime });
    } else {
      details.push({ emoji: "⏰", label: "Նախընտրելի ժամ", value: "նշված չէ" });
    }
    
    if (info.paymentMethod) {
      details.push({ 
        emoji: "💳", 
        label: "Վճարման եղանակ", 
        value: paymentMethodDisplayMap[info.paymentMethod] || info.paymentMethod 
      });
    } else {
      details.push({ emoji: "💳", label: "Վճարման եղանակ", value: "նշված չէ" });
    }
    
    if (info.deliveryOption === "delivery" && 'deliveryFee' in info && info.deliveryFee > 0) {
      details.push({ emoji: "💰", label: "Առաքման վճար", value: `${info.deliveryFee} ${t('currency')}` });
    } else if (info.deliveryOption === "delivery" && 'deliveryFee' in info && info.deliveryFee === 0 && productsTotal >= FREE_DELIVERY_THRESHOLD) {
      details.push({ emoji: "🎉", label: "Առաքման վճար", value: "Անվճար (6000+ դրամի դեպքում)" });
    }
    
    return details;
  };

  // Build product images links string
  const buildProductImagesLinks = (): string => {
    const imageLinks = cart.map(item => {
      const fullUrl = item.image.startsWith('http') 
        ? item.image 
        : `${window.location.origin}${item.image}`;
      return `• ${item.name}: ${fullUrl}`;
    }).join('\n');
    return imageLinks;
  };

  // Build order message
  const buildOrderMessage = (platform: 'whatsapp' | 'telegram') => {
    const deliveryInfoToUse = hasCake ? existingOrderInfo : tempOrderInfo;
    
    let message = "Բարև Ձեզ, ես ուզում եմ պատվիրել՝\n\n";
    
    message += "📦 *ԱՊՐԱՆՔՆԵՐ*\n";
    cart.forEach((item) => {
      const isCake = !!item.options?.cakeType;
      let finalPrice = item.price;
      if (hasCakeInCart && !isCake) {
        finalPrice = Math.max(0, finalPrice - DISCOUNT_AMOUNT);
      }
      message += `▸ ${item.name} — ${item.quantity} հատ — ${finalPrice * item.quantity} դրամ\n`;
      if (isCake && item.options) {
        if (item.options.cakeType) message += `   🍰 ${cakeTypeDisplayMap[item.options.cakeType]}\n`;
        if (item.options.creamType) message += `   🍦 ${creamTypeDisplayMap[item.options.creamType]}\n`;
        if (item.options.selectedVegetables?.length) {
          message += `   🥗 ${item.options.selectedVegetables.map((v: string) => getVegetableDisplay(v)).join(", ")}\n`;
        }
        if (item.options.selectedAnimal) message += `   🍗 ${animalTypeDisplayMap[item.options.selectedAnimal]}\n`;
        if (item.options.designType) message += `   🎨 ${designTypeDisplayMap[item.options.designType]}\n`;
        if (item.options.petName) message += `   🐾 ${item.options.petName}\n`;
        if (item.options.customText) message += `   📝 "${item.options.customText}"\n`;
      }
    });
    
    message += "\n🖼️ *ԱՊՐԱՆՔԻ ՆԿԱՐՆԵՐԸ*\n";
    message += buildProductImagesLinks();
    
    if (deliveryInfoToUse && deliveryInfoToUse.phoneNumber) {
      message += "\n🚚 *ԱՌԱՔՄԱՆ ՏՎՅԱԼՆԵՐ*\n";
      message += `▸ 📞 Հեռախոս: ${deliveryInfoToUse.phoneNumber || "նշված չէ"}\n`;
      message += `▸ 🚚 Առաքման տարբերակ: ${deliveryOptionDisplayMap[deliveryInfoToUse.deliveryOption] || deliveryInfoToUse.deliveryOption}\n`;
      
      if (deliveryInfoToUse.deliveryOption === "delivery") {
        message += `▸ 📍 Հասցե: ${deliveryInfoToUse.deliveryAddress || "նշված չէ"}\n`;
        if ('deliveryFee' in deliveryInfoToUse && deliveryInfoToUse.deliveryFee > 0) {
          message += `▸ 💰 Առաքման վճար: ${deliveryInfoToUse.deliveryFee} դրամ\n`;
        } else if ('deliveryFee' in deliveryInfoToUse && deliveryInfoToUse.deliveryFee === 0 && productsTotal >= FREE_DELIVERY_THRESHOLD) {
          message += `▸ 💰 Առաքման վճար: Անվճար (6000+ դրամի դեպքում)\n`;
        }
      } else {
        message += `▸ 🏠 Վերցման կետ: ${PICKUP_ADDRESS}\n`;
      }
      
      message += `▸ 📅 Ամսաթիվ: ${deliveryInfoToUse.deliveryDate || "նշված չէ"}\n`;
      message += `▸ ⏰ Ժամ: ${deliveryInfoToUse.deliveryTime || "նշված չէ"}\n`;
      message += `▸ 💳 Վճարման եղանակ: ${paymentMethodDisplayMap[deliveryInfoToUse.paymentMethod] || deliveryInfoToUse.paymentMethod}\n`;
    }
    
    message += "\n━━━━━━━━━━━━━━━━━━━━━\n";
    message += `💰 ԸՆԴՀԱՆՈՒՐ: ${effectiveTotal} դրամ\n`;
    
    if (hasCakeInCart) {
      message += `\n✨ Տորթի հետ միասին partshop ապրանքներից\n   յուրաքանչյուրից զեղչվում է ${DISCOUNT_AMOUNT} դրամ\n`;
    }
    
    if (platform === 'telegram') {
      message += `\n📱 Պատվերը ուղարկված է Telegram-ից`;
    } else {
      message += `\n📱 Պատվերը ուղարկված է WhatsApp-ից`;
    }
    
    return message;
  };

  // Handle "Confirm Order" button click
  const handleOrderClick = () => {
    if (hasCake) {
      if (existingOrderInfo && existingOrderInfo.phoneNumber && existingOrderInfo.deliveryDate) {
        setShowMessengerSelector(true);
      }
    } else {
      setShowDeliveryForm(true);
    }
  };

  // Handle delivery form submission
  const handleDeliveryFormSubmit = () => {
    const isValid = tempOrderInfo.phoneNumber.trim() !== "" && tempOrderInfo.deliveryDate !== "";
    if (isValid) {
      setShowDeliveryForm(false);
      setShowMessengerSelector(true);
    }
  };

  const handleTempOrderChange = (field: keyof TempOrderInfo, value: string) => {
    setTempOrderInfo(prev => ({ ...prev, [field]: value }));
  };

  const isTempOrderValid = () => {
    const info = tempOrderInfo;
    if (!info.phoneNumber.trim()) return false;
    if (!info.deliveryDate) return false;
    if (info.deliveryOption === "delivery" && !info.deliveryAddress.trim()) return false;
    return true;
  };

  const redirectToMessenger = (platform: 'whatsapp' | 'telegram') => {
    const message = buildOrderMessage(platform);
    const encodedMessage = encodeURIComponent(message);
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/37433775750?text=${encodedMessage}`, '_blank');
    } else {
      window.open(`https://t.me/37433775750?text=${encodedMessage}`, '_blank');
    }
    
    setShowMessengerSelector(false);
    onClose();
  };

  const deliveryInfo = formatDeliveryInfo();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-[#69429a] to-[#8b5cf6]">
              <h2 className="text-xl font-bold text-white">
                🛒 {t('cart')} ({cart.length} {t('product')})
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-500">{t('cartEmpty')}</p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-[#69429a] text-white rounded-full text-sm hover:bg-[#7c4fb3] transition"
                  >
                    {t('continueShopping')}
                  </button>
                </div>
              ) : (
                <>
                  {/* Products List */}
                  {cart.map((item, idx) => {
                    const isCake = !!item.options?.cakeType;
                    const originalPrice = item.price;
                    let effectivePrice = originalPrice;
                    if (hasCakeInCart && !isCake) {
                      effectivePrice = Math.max(0, originalPrice - DISCOUNT_AMOUNT);
                    }
                    const itemCakeDetails = isCake ? formatCakeOptions(item.options) : null;
                    const isExpanded = expandedItems[`${item.id}-${idx}`] || false;

                    return (
                      <motion.div
                        key={`${item.id}-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border rounded-lg p-3 bg-white shadow-sm"
                      >
                        <div className="flex gap-3">
                          <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <Image src={item.image} alt={String(item.name)} fill className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                                {isCake && (
                                  <span className="text-xs bg-gradient-to-r from-[#69429a] to-[#8b5cf6] text-white px-2 py-0.5 rounded-full">🎂 {t("cake")}</span>
                                )}
                                {hasCakeInCart && !isCake && effectivePrice !== originalPrice && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">🔥 {t('discounted')}</span>
                                )}
                              </div>
                              {/* Edit button for cakes only */}
                              {isCake && (
                                <button
                                  onClick={() => handleEditCake(item)}
                                  className="text-[#69429a] hover:text-[#8b5cf6] p-1 transition"
                                  title={t('edit') || "Խմբագրել"}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              {hasCakeInCart && !isCake && effectivePrice !== originalPrice ? (
                                <>
                                  <span className="text-md font-bold text-green-600">{effectivePrice} {t("currency")}</span>
                                  <span className="text-xs text-gray-400 line-through">{originalPrice} {t("currency")}</span>
                                </>
                              ) : (
                                <span className="text-md font-bold text-[#69429a]">{effectivePrice} {t("currency")}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <button onClick={() => updateQuantity(item.id, (item.quantity || 0) - 1, item.options)} className="border rounded-lg p-1 hover:bg-gray-100 transition">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, (item.quantity || 0) + 1, item.options)} className="border rounded-lg p-1 hover:bg-gray-100 transition">
                                <Plus className="h-3 w-3" />
                              </button>
                              <button onClick={() => removeFromCart(item.id, item.options)} className="ml-auto text-red-500 hover:text-red-700 p-1 transition">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Cake Details */}
                        {isCake && itemCakeDetails && itemCakeDetails.length > 0 && (
                          <>
                            <button
                              onClick={() => toggleItemExpand(`${item.id}-${idx}`)}
                              className="mt-2 text-xs text-[#69429a] hover:text-[#8b5cf6] flex items-center gap-1 transition"
                            >
                              <Info className="h-3 w-3" />
                              {isExpanded ? t('closeDetails') : t('seeCakeComposition')}
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                                    <div className="text-xs font-semibold text-[#69429a] uppercase tracking-wide mb-2">📋 {t('cakeComposition')}</div>
                                    <div className="space-y-1.5">
                                      {itemCakeDetails.map((detail, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs">
                                          <span className="text-sm">{detail.emoji}</span>
                                          <div>
                                            <span className="font-medium text-gray-700">{detail.label}:</span>
                                            <span className="text-gray-600 ml-1">{detail.value}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                      </motion.div>
                    );
                  })}

                  {/* Show delivery info if available */}
                  {deliveryInfo && deliveryInfo.length > 0 && !showDeliveryForm && (
                    <div className="border rounded-lg p-3 bg-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-[#69429a]" />
                          <h3 className="font-semibold text-gray-800 text-sm">{t('deliveryDetails')}</h3>
                        </div>
                        <button
                          onClick={() => setIsDeliveryExpanded(!isDeliveryExpanded)}
                          className="text-xs text-[#69429a] hover:text-[#8b5cf6] flex items-center gap-1 transition"
                        >
                          {isDeliveryExpanded ? (
                            <>{t('close')} <ChevronUp className="h-3 w-3" /></>
                          ) : (
                            <>{t('seeMore')} <ChevronDown className="h-3 w-3" /></>
                          )}
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {isDeliveryExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">🚚 {t('deliveryDetail')}</div>
                              <div className="space-y-1.5">
                                {deliveryInfo.map((detail, i) => (
                                  <div key={i} className="flex items-start gap-2 text-xs">
                                    <span className="text-sm">{detail.emoji}</span>
                                    <div>
                                      <span className="font-medium text-gray-700">{detail.label}:</span>
                                      <span className="text-gray-600 ml-1">{detail.value}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {!isDeliveryExpanded && deliveryInfo[0] && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                          <span>{deliveryInfo[0].emoji}</span>
                          <span>{deliveryInfo[0].value}</span>
                          {deliveryInfo[1] && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span>{deliveryInfo[1].emoji}</span>
                              <span>{deliveryInfo[1].value}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivery Form */}
                  <AnimatePresence>
                    {showDeliveryForm && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="space-y-5"
                      >
                        {/* Delivery Option */}
                        <div>
                          <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            {t("deliveryOption")}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleTempOrderChange("deliveryOption", "delivery")}
                              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${
                                tempOrderInfo.deliveryOption === "delivery"
                                  ? "bg-[#69429a] text-white border-[#69429a] shadow-md scale-105"
                                  : "bg-white text-[#69429a] border-[#69429a] hover:bg-[#f3e8ff]"
                              }`}
                            >
                              🚚 {t("delivery")}
                            </button>
                            <button
                              onClick={() => handleTempOrderChange("deliveryOption", "pickup")}
                              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${
                                tempOrderInfo.deliveryOption === "pickup"
                                  ? "bg-[#10b981] text-white border-[#10b981] shadow-md scale-105"
                                  : "bg-white text-[#10b981] border-[#10b981] hover:bg-[#d1fae5]"
                              }`}
                            >
                              🏠 {t("pickup")}
                            </button>
                          </div>
                        </div>

                        {/* Delivery Address */}
                        {tempOrderInfo.deliveryOption === "delivery" && (
                          <div>
                            <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                              <MapPin className="w-5 h-5" />
                              {t("deliveryAddress")}
                            </p>
                            <textarea
                              value={tempOrderInfo.deliveryAddress}
                              onChange={(e) => handleTempOrderChange("deliveryAddress", e.target.value)}
                              placeholder={t("placeholder") || "քաղաք, փողոց, տուն"}
                              rows={3}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] resize-none border-gray-300"
                              required
                            />
                            {tempOrderInfo.deliveryAddress && tempOrderInfo.deliveryAddress.trim().length > 5 && (
                              <div className="mt-2">
                                {tempOrderInfo.isCalculating ? (
                                  <div className="p-2 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">⏳ {t("calculatingDistance") || "Հաշվարկում ենք հեռավորությունը..."}</p>
                                  </div>
                                ) : tempOrderInfo.distance !== null && (
                                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs text-blue-700">
                                      🚚 {t("deliveryFee")}: {tempOrderInfo.deliveryFee} {t("currency")}
                                      {tempOrderInfo.distance && (
                                        <span className="text-gray-500 ml-1">(~{Math.round(tempOrderInfo.distance)} կմ)</span>
                                      )}
                                    </p>
                                    {productsTotal >= FREE_DELIVERY_THRESHOLD && tempOrderInfo.distance <= FREE_DELIVERY_MAX_DISTANCE && (
                                      <p className="text-xs text-green-600 mt-1">✅ {t("freeDeliveryForOrdersAbove")} {FREE_DELIVERY_THRESHOLD} {t("currency")}</p>
                                    )}
                                    {productsTotal >= FREE_DELIVERY_THRESHOLD && tempOrderInfo.distance > FREE_DELIVERY_MAX_DISTANCE && (
                                      <p className="text-xs text-orange-600 mt-1">⚠️ {FREE_DELIVERY_MAX_DISTANCE} կմ-ից ավելի, մասնակի վճար</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Pickup Address */}
                        {tempOrderInfo.deliveryOption === "pickup" && (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 flex items-center gap-2">
                              <Home className="w-4 h-4" />
                              <span className="font-semibold">{t("pickupAddress")}:</span> {PICKUP_ADDRESS}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              ℹ️ {t("pickupInstructions") || "Դուք կարող եք ինքնակառավարել ձեր պատվերը նշված հասցեից"}
                            </p>
                          </div>
                        )}

                        {/* Phone Number */}
                        <div>
                          <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            {t("phoneNumber")}
                          </p>
                          <input
                            type="tel"
                            value={tempOrderInfo.phoneNumber}
                            onChange={(e) => handleTempOrderChange("phoneNumber", e.target.value)}
                            placeholder={t("enterPhoneNumber") || "+374 XX XX XX XX"}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] border-gray-300"
                            required
                          />
                        </div>

                        {/* Delivery Date */}
                        <div>
                          <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            {t("deliveryDate")}
                          </p>
                          <input
                            type="date"
                            value={tempOrderInfo.deliveryDate}
                            onChange={(e) => handleTempOrderChange("deliveryDate", e.target.value)}
                            min={getMinDate()}
                            max={getMaxDate()}
                            className="w-full h-10 px-3 text-sm appearance-none bg-white border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] border-gray-300"
                            required
                          />
                        </div>

                        {/* Delivery Time */}
                        <div>
                          <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            {t("preferredDeliveryTime")}
                          </p>
                          <select
                            value={tempOrderInfo.deliveryTime}
                            onChange={(e) => handleTempOrderChange("deliveryTime", e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] border-gray-300"
                          >
                            <option value="">{t("selectDeliveryTime")}</option>
                            <option value="12:00-15:00">12:00 - 15:00</option>
                            <option value="15:00-18:00">15:00 - 18:00</option>
                            <option value="18:00-21:00">18:00 - 21:00</option>
                            <option value="21:00-24:00">21:00 - 24:00</option>
                          </select>
                        </div>

                        {/* Payment Method */}
                        <div>
                          <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            {t("paymentMethod")}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleTempOrderChange("paymentMethod", "cash")}
                              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${
                                tempOrderInfo.paymentMethod === "cash"
                                  ? "bg-[#10b981] text-white border-[#10b981] shadow-md scale-105"
                                  : "bg-white text-[#10b981] border-[#10b981] hover:bg-[#d1fae5]"
                              }`}
                            >
                              💵 {t("cash")}
                            </button>
                            <button
                              onClick={() => handleTempOrderChange("paymentMethod", "bankTransfer")}
                              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${
                                tempOrderInfo.paymentMethod === "bankTransfer"
                                  ? "bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-md scale-105"
                                  : "bg-white text-[#8b5cf6] border-[#8b5cf6] hover:bg-[#ede9fe]"
                              }`}
                            >
                              🏦 {t("bankTransfer")}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handleDeliveryFormSubmit}
                          disabled={!isTempOrderValid()}
                          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                            isTempOrderValid()
                              ? "bg-[#69429a] hover:bg-[#7c4fb3]"
                              : "bg-gray-300 cursor-not-allowed"
                          }`}
                        >
                          ✅ {t("confirmAndContinue") || "Հաստատել և շարունակել"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="border-t p-4 space-y-3 bg-gray-50"
              >
                {hasCakeInCart && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-green-700">✨ {t('cakeDiscountCondition')} {DISCOUNT_AMOUNT} {t('currency')}</p>
                  </div>
                )}
                
                {/* Price Breakdown */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{t('subtotal') || "Ենթագումար"}</span>
                    <span className="font-medium">{productsTotal} {t('currency')}</span>
                  </div>
                  {tempOrderInfo.deliveryOption === "delivery" && tempOrderInfo.deliveryFee > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{t('deliveryFee') || "Առաքման վճար"}</span>
                      <span className="font-medium">{tempOrderInfo.deliveryFee} {t('currency')}</span>
                    </div>
                  )}
                  {tempOrderInfo.deliveryOption === "delivery" && tempOrderInfo.deliveryFee === 0 && productsTotal >= FREE_DELIVERY_THRESHOLD && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{t('deliveryFee') || "Առաքման վճար"}</span>
                      <span className="font-medium text-green-600">Անվճար</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">{t('total')}</span>
                      <span className="text-2xl font-bold text-[#69429a]">{effectiveTotal} {t('currency')}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOrderClick}
                  className="w-full text-center py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2 bg-[#69429a] hover:bg-[#7c4fb3] text-white"
                >
                  <span>📱</span> {t("confirmOrder") || "Հաստատել պատվերը"}
                </motion.button>
              </motion.div>
            )}

            {/* Messenger Selector Modal */}
            <AnimatePresence>
              {showMessengerSelector && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
                  onClick={() => setShowMessengerSelector(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">📱</div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("chooseMessenger") || "Ընտրեք մեսենջեր"}</h3>
                      <div className="flex gap-3">
                        <button
                          onClick={() => redirectToMessenger('whatsapp')}
                          className="flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                          style={{ backgroundColor: "#25D366", color: "#fff" }}
                        >
                          <span>📱</span> WhatsApp
                        </button>
                        <button
                          onClick={() => redirectToMessenger('telegram')}
                          className="flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                          style={{ backgroundColor: "#0088cc", color: "#fff" }}
                        >
                          <span>✈️</span> Telegram
                        </button>
                      </div>
                      <button
                        onClick={() => setShowMessengerSelector(false)}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                      >
                        {t("cancel") || "Չեղարկել"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}