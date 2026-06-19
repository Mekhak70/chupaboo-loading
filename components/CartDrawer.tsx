"use client";

import { X, Minus, Plus, Trash2, ChevronDown, ChevronUp, Info, Truck, MapPin, Phone, Calendar, Clock, CreditCard, Home, Edit2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/components/cart-context";
import { useLanguage } from "@/components/language-provider";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

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

// ========== DELIVERY CONSTANTS ==========
const PICKUP_ADDRESS = "Yerevan, Kievan 15";
const PICKUP_LAT = 40.195059;
const PICKUP_LON = 44.488427;
const FREE_DELIVERY_THRESHOLD = 6000;
const FREE_DELIVERY_MAX_DISTANCE = 10;
const BASE_DELIVERY_FEE = 1000;
const EXTRA_DISTANCE_FEE = 500;
const EXTRA_DISTANCE_THRESHOLD = 7;

// ========== DISCOUNT CONSTANTS ==========
// PartyShop items get discount based on cake price
const DISCOUNT_THRESHOLD_1 = 5000;  // 5000 դրամից սկսած
const DISCOUNT_THRESHOLD_2 = 10000; // 10000 դրամից բարձր
const DISCOUNT_PERCENT_1 = 10;      // 10%
const DISCOUNT_PERCENT_2 = 20;      // 20%

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

// ========== DISCOUNT CALCULATION ==========
// Calculate discount percentage based on cake price
const getDiscountPercentForPartyShop = (cakePrice: number): number => {
  if (cakePrice >= DISCOUNT_THRESHOLD_2) {
    return DISCOUNT_PERCENT_2; // 20%
  } else if (cakePrice >= DISCOUNT_THRESHOLD_1) {
    return DISCOUNT_PERCENT_1; // 10%
  }
  return 0; // No discount
};

export function CartDrawer({ isOpen, onClose, orderInfo: propOrderInfo }: CartDrawerProps) {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, orderInfo: contextOrderInfo, clearCart } = useCart();
  const { t, language } = useLanguage();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(false);
  
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
  
  // Priority: use context orderInfo if available, otherwise use prop
  const existingOrderInfo = contextOrderInfo || propOrderInfo;
  console.log(existingOrderInfo, 'existingOrderInfo');
  
  // ========== CALCULATE TOTAL WITH PARTYSHOP DISCOUNT ==========
  const hasCakeInCart = cart.some((item) => item.options?.cakeType);
  
  // Find cake in cart to get its price
  const cakeItem = cart.find((item) => item.options?.cakeType);
  const cakePrice = cakeItem?.price || 0;
  const discountPercent = getDiscountPercentForPartyShop(cakePrice);
  
  // Calculate products total - ONLY PartyShop items get discount
  const productsTotal = cart.reduce((total, item) => {
    const isCake = !!item.options?.cakeType;
    let unitPrice = item.price;
    
    if (hasCakeInCart && !isCake && discountPercent > 0) {
      // PartyShop items get discount based on cake price
      const discountAmount = unitPrice * (discountPercent / 100);
      unitPrice = Math.max(0, unitPrice - discountAmount);
    }
    // Cake price stays unchanged
    
    return total + unitPrice * (typeof item.quantity === "number" ? item.quantity : 0);
  }, 0);
  
  // Get discount info for display
  const getDiscountInfo = () => {
    if (!hasCakeInCart || discountPercent === 0) return null;
    
    // Calculate total discount amount for all PartyShop items
    const totalDiscount = cart.reduce((total, item) => {
      const isCake = !!item.options?.cakeType;
      if (isCake) return total;
      const discountAmount = item.price * (discountPercent / 100);
      return total + discountAmount * (typeof item.quantity === "number" ? item.quantity : 1);
    }, 0);
    
    return {
      discountPercent,
      totalDiscount,
      cakePrice,
    };
  };
  
  const discountInfo = getDiscountInfo();
  const effectiveTotal = productsTotal + (tempOrderInfo.deliveryOption === "delivery" && tempOrderInfo.deliveryFee > 0 ? tempOrderInfo.deliveryFee : 0);
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


  const toggleItemExpand = (itemId: string) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const formatCakeOptions = (options: any) => {
    if (!options) return null;
    
    const details: { emoji: string; label: string; value: string }[] = [];
    
    // Cake type
    if (options.cakeType) {
      const cakeTypeKey = options.cakeType.toLowerCase();
      const typeMap: Record<string, string> = {
        meat: t('MEAT'),
        fruit: t('FRUIT'),
        vegetables: t('VEGETABLES'),
      };
      details.push({ 
        emoji: "🍰", 
        label: t('mainCake') || "Տորթի հիմնական տեսակը", 
        value: typeMap[options.cakeType.toLowerCase()] || options.cakeType 
      });
    }
    
    // Cream type
    if (options.creamType) {
      const creamMap: Record<string, string> = {
        dairy: t('DAIRY'),
        plantbasedmilk: t('PLANTBASEDMILK'),
        plantbased: t('PLANTBASED'),
      };
      details.push({ 
        emoji: "🍦", 
        label: t('creamType') || "Կրեմի տեսակը", 
        value: creamMap[options.creamType.toLowerCase()] || options.creamType 
      });
    }
    
    // Vegetables
    if (options.selectedVegetables && options.selectedVegetables.length > 0) {
      const vegNames = options.selectedVegetables.map((v: string) => {
        const vegKey = v.toLowerCase();
        const vegMap: Record<string, string> = {
          potato: t('potato'),
          carrot: t('carrot'),
          broccoli: t('broccoli'),
          pumpkin: t('pumpkin'),
          pepper: t('greenPepper'),
          zucchini: t('zucchini'),
          cauliflower: t('cauliflower'),
          sweet_potato: t('sweetPotato'),
          spinach: t('spinach'),
          rice: t('rice'),
          wheat: t('wheat'),
          oats: t('oats'),
          apple: t('apple'),
          banana: t('banana'),
          pear: t('pear'),
          elderberry: t('elderberry'),
          strawberry: t('strawberry'),
          mango: t('mango'),
        };
        return vegMap[vegKey] || v;
      });
      details.push({ 
        emoji: "🥗", 
        label: t('ingredients') || "Բաղադրիչներ", 
        value: vegNames.join(", ") 
      });
    }
    
    // Animal type (meat)
    if (options.selectedAnimal) {
      const animalMap: Record<string, string> = {
        chicken: t('chicken'),
        beef: t('beef'),
        lamb: t('lamb'),
        turkey: t('turkey'),
        fish: t('fish'),
      };
      details.push({ 
        emoji: "🍗", 
        label: t('meatType') || "Մսի տեսակը", 
        value: animalMap[options.selectedAnimal.toLowerCase()] || options.selectedAnimal 
      });
    }
    
    // Design type
    if (options.designType) {
      const designMap: Record<string, string> = {
        standard: t('standardDesign'),
        custom_photo: t('customMyDogPhotoDesign'),
        name_text: t('petNameLabel'),
        custom_text: t('enterCustomText'),
      };
      details.push({ 
        emoji: "🎨", 
        label: t('designType') || "Դիզայնի տեսակը", 
        value: designMap[options.designType.toLowerCase()] || options.designType 
      });
    }
    
    // Pet name
    if (options.petName && options.petName.trim()) {
      details.push({ 
        emoji: "🐾", 
        label: t('petNameLabel') || "Ընտանի կենդանու անունը", 
        value: options.petName 
      });
    }
    
    // Custom text
    if (options.customText && options.customText.trim()) {
      details.push({ 
        emoji: "📝", 
        label: t('enterCustomText') || "Հատուկ տեքստ", 
        value: `"${options.customText}"` 
      });
    }
    
    // Custom image
    if (options.customImage && options.designType === "CUSTOM_PHOTO") {
      details.push({ 
        emoji: "🖼️", 
        label: t('uploadPetPhoto') || "Կցված նկար", 
        value: t('uploadPetPhoto') || "Նկարը կցված է" 
      });
    }
    
    return details;
  };

  const formatDeliveryInfo = () => {
    const info = hasCake ? existingOrderInfo : tempOrderInfo;
    if (!info) return null;
    
    const details: { emoji: string; label: string; value: string }[] = [];
    
    // Phone
    if (info.phoneNumber && info.phoneNumber.trim()) {
      details.push({ emoji: "📞", label: t('phone') || "Հեռախոս", value: info.phoneNumber });
    } else {
      details.push({ emoji: "📞", label: t('phone') || "Հեռախոս", value: t('notSpecified') || "նշված չէ" });
    }
    
    // Delivery option
    const deliveryOptionMap: Record<string, string> = {
      delivery: t('delivery') || "Առաքում",
      pickup: t('pickup') || "Տեղում վերցնել",
    };
    details.push({ 
      emoji: "🚚", 
      label: t('deliveryOption') || "Առաքման տարբերակ", 
      value: deliveryOptionMap[info.deliveryOption] || info.deliveryOption 
    });
    
    // Address
    if (info.deliveryOption === "delivery") {
      if (info.deliveryAddress && info.deliveryAddress.trim()) {
        details.push({ emoji: "📍", label: t('deliveryAddress') || "Առաքման հասցե", value: info.deliveryAddress });
      } else {
        details.push({ emoji: "📍", label: t('deliveryAddress') || "Առաքման հասցե", value: t('notSpecified') || "նշված չէ" });
      }
    } else {
      details.push({ emoji: "🏠", label: t('pickupAddress') || "Վերցման կետ", value: PICKUP_ADDRESS });
    }
    
    // Date
    if (info.deliveryDate) {
      const formattedDate = info.deliveryDate.split("-").reverse().join(".");
      details.push({ emoji: "📅", label: t('deliveryDate') || "Առաքման ամսաթիվ", value: formattedDate });
    } else {
      details.push({ emoji: "📅", label: t('deliveryDate') || "Առաքման ամսաթիվ", value: t('notSpecified') || "նշված չէ" });
    }
    
    // Time
    if (info.deliveryTime && info.deliveryTime.trim()) {
      details.push({ emoji: "⏰", label: t('preferredDeliveryTime') || "Նախընտրելի ժամ", value: info.deliveryTime });
    } else {
      details.push({ emoji: "⏰", label: t('preferredDeliveryTime') || "Նախընտրելի ժամ", value: t('notSpecified') || "նշված չէ" });
    }
    
    // Payment method
    const paymentMap: Record<string, string> = {
      cash: t('cash') || "Կանխիկ",
      bankTransfer: t('bankTransfer') || "Բանկային փոխանցում",
      CARD: "💳 " + (t('bankTransfer') || "Կարտով"),
    };
    if (info.paymentMethod) {
      details.push({ 
        emoji: "💳", 
        label: t('paymentMethod') || "Վճարման եղանակ", 
        value: paymentMap[info.paymentMethod] || info.paymentMethod 
      });
    } else {
      details.push({ emoji: "💳", label: t('paymentMethod') || "Վճարման եղանակ", value: t('notSpecified') || "նշված չէ" });
    }
    
    // Delivery fee
    if (info.deliveryOption === "delivery" && 'deliveryFee' in info && info.deliveryFee > 0) {
      details.push({ 
        emoji: "💰", 
        label: t('deliveryFee') || "Առաքման վճար", 
        value: `${info.deliveryFee} ${t('currency')}` 
      });
    } else if (info.deliveryOption === "delivery" && 'deliveryFee' in info && info.deliveryFee === 0 && productsTotal >= FREE_DELIVERY_THRESHOLD) {
      details.push({ 
        emoji: "🎉", 
        label: t('deliveryFee') || "Առաքման վճար", 
        value: t('freeDelivery') || "Անվճար" 
      });
    }
    
    return details;
  };

  // Build product images links string
  const buildProductImagesLinks = (): string => {
    if (!cart || !Array.isArray(cart)) return '';
    
    try {
        const imageLinks = cart
            .map(item => {
                let imageUrl = '';
                
                if (item.image) {
                    if (typeof item.image === 'string') {
                        imageUrl = item.image;
                    } else if (typeof item.image === 'object') {

                      //@ts-ignore
                       imageUrl = item.image?.url || item.image?.src || '';
                    }
                }
                
                if (!imageUrl || typeof imageUrl !== 'string') {
                    return null;
                }
                
                let fullUrl = imageUrl;
                if (imageUrl.startsWith('http')) {
                    fullUrl = imageUrl;
                } else if (imageUrl.startsWith('/')) {
                    fullUrl = `${window.location.origin}${imageUrl}`;
                } else {
                    fullUrl = `${window.location.origin}/${imageUrl}`;
                }
                
                return `• ${item.name || t('product')}: ${fullUrl}`;
            })
            .filter(link => link !== null)
            .join('\n');
        
        return imageLinks || t('noImages') || 'Նկարներ չկան';
        
    } catch (error) {
        console.error('Error in buildProductImagesLinks:', error);
        return t('noImages') || 'Նկարներ չկան';
    }
  };


  // Build order message
  const buildOrderMessage = (platform: 'whatsapp' | 'telegram') => {
    const deliveryInfoToUse = hasCake ? existingOrderInfo : tempOrderInfo;
    
    let message = `${t('greeting')}\n\n`;
    
   
    cart.forEach((item) => {
      const isCake = !!item.options?.cakeType;
      let finalPrice = item.price;
      
      if (hasCakeInCart && !isCake && discountPercent > 0) {
        const discountAmount = finalPrice * (discountPercent / 100);
        finalPrice = Math.max(0, finalPrice - discountAmount);
      }
      
      message += `▸ ${item.name} — ${item.quantity} ${t('quantity') || "հատ"} — ${finalPrice * item.quantity} ${t('currency')}\n`;
      if (isCake && item.options) {
        if (item.options.cakeType) {
          const typeMap: Record<string, string> = {
            meat: t('MEAT'),
            fruit: t('FRUIT'),
            vegetables: t('VEGETABLES'),
          };
          message += `   🍰 ${typeMap[item.options.cakeType.toLowerCase()] || item.options.cakeType}\n`;
        }
        if (item.options.creamType) {
          const creamMap: Record<string, string> = {
            dairy: t('DAIRY'),
            plantbasedmilk: t('PLANTBASEDMILK'),
            plantbased: t('PLANTBASED'),
          };
          message += `   🍦 ${creamMap[item.options.creamType.toLowerCase()] || item.options.creamType}\n`;
        }
        if (item.options.selectedVegetables?.length) {
          const vegNames = item.options.selectedVegetables.map((v: string) => {
            const vegMap: Record<string, string> = {
              potato: t('potato'),
              carrot: t('carrot'),
              broccoli: t('broccoli'),
              pumpkin: t('pumpkin'),
              pepper: t('greenPepper'),
              zucchini: t('zucchini'),
              cauliflower: t('cauliflower'),
              sweet_potato: t('sweetPotato'),
              spinach: t('spinach'),
              rice: t('rice'),
              wheat: t('wheat'),
              oats: t('oats'),
              apple: t('apple'),
              banana: t('banana'),
              pear: t('pear'),
              elderberry: t('elderberry'),
              strawberry: t('strawberry'),
              mango: t('mango'),
            };
            return vegMap[v.toLowerCase()] || v;
          });
          message += `   🥗 ${vegNames.join(", ")}\n`;
        }
        if (item.options.selectedAnimal) {
          const animalMap: Record<string, string> = {
            chicken: t('chicken'),
            beef: t('beef'),
            lamb: t('lamb'),
            turkey: t('turkey'),
            fish: t('fish'),
          };
          message += `   🍗 ${animalMap[item.options.selectedAnimal.toLowerCase()] || item.options.selectedAnimal}\n`;
        }
        if (item.options.designType) {
          const designMap: Record<string, string> = {
            standard: t('standardDesign'),
            custom_photo: t('customMyDogPhotoDesign'),
            name_text: t('petNameLabel'),
            custom_text: t('enterCustomText'),
          };
          message += `   🎨 ${designMap[item.options.designType.toLowerCase()] || item.options.designType}\n`;
        }
        if (item.options.petName) message += `   🐾 ${item.options.petName}\n`;
        if (item.options.customText) message += `   📝 "${item.options.customText}"\n`;
      }
    });
    
        message += buildProductImagesLinks();
    
    if (deliveryInfoToUse && deliveryInfoToUse.phoneNumber) {
      message += `\n🚚 *${t('deliveryDetails') || "ԱՌԱՔՄԱՆ ՏՎՅԱԼՆԵՐ"}*\n`;
      message += `▸ 📞 ${t('phone') || "Հեռախոս"}: ${deliveryInfoToUse.phoneNumber || t('notSpecified') || "նշված չէ"}\n`;
      const deliveryOptMap: Record<string, string> = {
        delivery: t('delivery') || "Առաքում",
        pickup: t('pickup') || "Տեղում վերցնել",
      };
      message += `▸ 🚚 ${t('deliveryOption') || "Առաքման տարբերակ"}: ${deliveryOptMap[deliveryInfoToUse.deliveryOption] || deliveryInfoToUse.deliveryOption}\n`;
      
      if (deliveryInfoToUse.deliveryOption === "delivery") {
        message += `▸ 📍 ${t('deliveryAddress') || "Հասցե"}: ${deliveryInfoToUse.deliveryAddress || t('notSpecified') || "նշված չէ"}\n`;
        if ('deliveryFee' in deliveryInfoToUse && deliveryInfoToUse.deliveryFee > 0) {
          message += `▸ 💰 ${t('deliveryFee') || "Առաքման վճար"}: ${deliveryInfoToUse.deliveryFee} ${t('currency')}\n`;
        } else if ('deliveryFee' in deliveryInfoToUse && deliveryInfoToUse.deliveryFee === 0 && productsTotal >= FREE_DELIVERY_THRESHOLD) {
          message += `▸ 💰 ${t('deliveryFee') || "Առաքման վճար"}: ${t('free') || "Անվճար"}\n`;
        }
      } else {
        message += `▸ 🏠 ${t('pickupAddress') || "Վերցման կետ"}: ${PICKUP_ADDRESS}\n`;
      }
      
      message += `▸ 📅 ${t('deliveryDate') || "Ամսաթիվ"}: ${deliveryInfoToUse.deliveryDate || t('notSpecified') || "նշված չէ"}\n`;
      message += `▸ ⏰ ${t('preferredDeliveryTime') || "Ժամ"}: ${deliveryInfoToUse.deliveryTime || t('notSpecified') || "նշված չէ"}\n`;
      
      const paymentMap: Record<string, string> = {
        cash: t('cash') || "Կանխիկ",
        bankTransfer: t('bankTransfer') || "Բանկային փոխանցում",
        CARD: "💳 " + (t('bankTransfer') || "Կարտով"),
      };
      message += `▸ 💳 ${t('paymentMethod') || "Վճարման եղանակ"}: ${paymentMap[deliveryInfoToUse.paymentMethod] || deliveryInfoToUse.paymentMethod}\n`;
    }
    
    message += "\n━━━━━━━━━━━━━━━━━━━━━\n";
    message += `💰 ${t('total') || "ԸՆԴՀԱՆՈՒՐ"}: ${deliveryInfo ? Number(deliveryInfo[6]?.value.slice(0,4)) + effectiveTotal: effectiveTotal} ${t('currency')}\n`;
    
   
    
    return message;
  };

  // Handle "Confirm Order" button click
  const handleOrderClick = () => {
    if (hasCake || (tempOrderInfo.phoneNumber.trim() !== "" && tempOrderInfo.deliveryDate)) {
      if (existingOrderInfo && existingOrderInfo.phoneNumber && existingOrderInfo.deliveryDate) {
        setShowMessengerSelector(true);
      } else if (!hasCake && tempOrderInfo.phoneNumber.trim() !== "" && tempOrderInfo.deliveryDate) {
        setShowMessengerSelector(true);
      } else {
        setShowDeliveryForm(true);
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
    const phoneNumber = '37433775750';
  
    if (platform === 'whatsapp') {
      window.open(
        `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
        '_blank'
      );
    } else {
      window.open(
        `https://t.me/Chupaboo?text=${encodedMessage}`,
        '_blank'
      );
    }
  
    setShowMessengerSelector(false);
    clearCart();
    onClose();
  };

  const deliveryInfo = formatDeliveryInfo();
  console.log(deliveryInfo && deliveryInfo[6]?.value, 'deliveryInfo')

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
                    let discountPercentForItem = 0;
                    
                    if (hasCakeInCart && !isCake && discountPercent > 0) {
                      // PartyShop items get discount
                      discountPercentForItem = discountPercent;
                      const discountAmount = originalPrice * (discountPercent / 100);
                      effectivePrice = Math.max(0, originalPrice - discountAmount);
                    }
                    // Cake price stays unchanged
                    
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
                                  <span className="text-xs bg-gradient-to-r from-[#69429a] to-[#8b5cf6] text-white px-2 py-0.5 rounded-full">🎂 {t('cake')}</span>
                                )}
                                {!isCake && discountPercentForItem > 0 && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                    🎉 -{discountPercentForItem}% {t('partyShopDiscount') || 'PartyShop'}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              {!isCake && effectivePrice !== originalPrice && discountPercentForItem > 0 ? (
                                <>
                                  <span className="text-md font-bold text-green-600">{effectivePrice} {t('currency')}</span>
                                  <span className="text-xs text-gray-400 line-through">{originalPrice} {t('currency')}</span>
                                </>
                              ) : (
                                <span className="text-md font-bold text-[#69429a]">{effectivePrice} {t('currency')}</span>
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
   
                  { 
                  deliveryInfo && deliveryInfo[0].value!=='notSpecified' && deliveryInfo.length > 0 && !showDeliveryForm && (
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
                            {t('deliveryOption')}
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
                              🚚 {t('delivery')}
                            </button>
                            <button
                              onClick={() => handleTempOrderChange("deliveryOption", "pickup")}
                              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${
                                tempOrderInfo.deliveryOption === "pickup"
                                  ? "bg-[#10b981] text-white border-[#10b981] shadow-md scale-105"
                                  : "bg-white text-[#10b981] border-[#10b981] hover:bg-[#d1fae5]"
                              }`}
                            >
                              🏠 {t('pickup')}
                            </button>
                          </div>
                        </div>

                        {/* Delivery Address */}
                        {tempOrderInfo.deliveryOption === "delivery" && (
                          <div>
                            <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                              <MapPin className="w-5 h-5" />
                              {t('deliveryAddress')}
                            </p>
                            <textarea
                              value={tempOrderInfo.deliveryAddress}
                              onChange={(e) => handleTempOrderChange("deliveryAddress", e.target.value)}
                              placeholder={t('placeholder') || "քաղաք, փողոց, տուն"}
                              rows={3}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] resize-none border-gray-300"
                              required
                            />
                            {tempOrderInfo.deliveryAddress && tempOrderInfo.deliveryAddress.trim().length > 5 && (
                              <div className="mt-2">
                                {tempOrderInfo.isCalculating ? (
                                  <div className="p-2 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">⏳ {t('calculatingDistance') || "Հաշվարկում ենք հեռավորությունը..."}</p>
                                  </div>
                                ) : tempOrderInfo.distance !== null && (
                                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs text-blue-700">
                                      🚚 {t('deliveryFee')}: {tempOrderInfo.deliveryFee} {t('currency')}
                                      {tempOrderInfo.distance && (
                                        <span className="text-gray-500 ml-1">(~{Math.round(tempOrderInfo.distance)} կմ)</span>
                                      )}
                                    </p>
                                    {productsTotal >= FREE_DELIVERY_THRESHOLD && tempOrderInfo.distance <= FREE_DELIVERY_MAX_DISTANCE && (
                                      <p className="text-xs text-green-600 mt-1">✅ {t('freeDeliveryForOrdersAbove')}</p>
                                    )}
                                    {productsTotal >= FREE_DELIVERY_THRESHOLD && tempOrderInfo.distance > FREE_DELIVERY_MAX_DISTANCE && (
                                      <p className="text-xs text-orange-600 mt-1">⚠️ {t('freeDeliveryHint') || "10 կմ-ից ավելի, մասնակի վճար"}</p>
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
                              <span className="font-semibold">{t('pickupAddress')}:</span> {PICKUP_ADDRESS}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              ℹ️ {t('pickupInstructions')}
                            </p>
                          </div>
                        )}

                        {/* Phone Number */}
                        <div>
                          <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            {t('phoneNumber')}
                          </p>
                          <input
                            type="tel"
                            value={tempOrderInfo.phoneNumber}
                            onChange={(e) => handleTempOrderChange("phoneNumber", e.target.value)}
                            placeholder={t('enterPhoneNumber') || "+374 XX XX XX XX"}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] border-gray-300"
                            required
                          />
                        </div>

                        {/* Delivery Date */}
                        <div>
                          <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            {t('deliveryDate')}
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
                            {t('preferredDeliveryTime')}
                          </p>
                          <select
                            value={tempOrderInfo.deliveryTime}
                            onChange={(e) => handleTempOrderChange("deliveryTime", e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] border-gray-300"
                          >
                            <option value="">{t('selectDeliveryTime')}</option>
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
                            {t('paymentMethod')}
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
                              💵 {t('cash')}
                            </button>
                            <button
                              onClick={() => handleTempOrderChange("paymentMethod", "bankTransfer")}
                              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${
                                tempOrderInfo.paymentMethod === "bankTransfer"
                                  ? "bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-md scale-105"
                                  : "bg-white text-[#8b5cf6] border-[#8b5cf6] hover:bg-[#ede9fe]"
                              }`}
                            >
                              🏦 {t('bankTransfer')}
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
                          ✅ {t('confirmAndContinue')}
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
                {hasCakeInCart && discountInfo && discountInfo.discountPercent > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-green-700">
                      🎉 {discountInfo.discountPercent}% {t('discountOnPartyShop') || 'զեղչ PartyShop-ի համար'}
                      {discountInfo.discountPercent === 10 
                        ? ` (5000-10000 ${t('currency')})` 
                        : ` (10000+ ${t('currency')})`}
                    </p>
                  </div>
                )}
                
                {/* Price Breakdown */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{t('subtotal')}</span>
                    <span className="font-medium">{productsTotal} {t('currency')}</span>
                  </div>
                  {discountInfo && discountInfo.discountPercent > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>{t('discount') || "Զեղչ"}</span>
                      <span>-{discountInfo.totalDiscount.toFixed(0)} {t('currency')} ({discountInfo.discountPercent}%)</span>
                    </div>
                  )}
                  {tempOrderInfo.deliveryOption === "delivery" && tempOrderInfo.deliveryFee > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{t('deliveryFee')}</span>
                      <span className="font-medium">{tempOrderInfo.deliveryFee} {t('currency')}</span>
                    </div>
                  )}
                  {tempOrderInfo.deliveryOption === "delivery" && tempOrderInfo.deliveryFee === 0 && productsTotal >= FREE_DELIVERY_THRESHOLD && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{t('deliveryFee')}</span>
                      <span className="font-medium text-green-600">{t('free')}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">{t('total')}</span>
                      <span className="text-2xl font-bold text-[#69429a]">{ deliveryInfo ? Number(deliveryInfo[6]?.value.slice(0,4)) + effectiveTotal: effectiveTotal} {t('currency')}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOrderClick}
                  className="w-full text-center py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2 bg-[#69429a] hover:bg-[#7c4fb3] text-white"
                >
                  <span>📱</span> {t('confirmOrder')}
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
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowMessengerSelector(false)}
                >
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.85, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl w-full border border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center">
                      {/* Icon with gradient background */}
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#69429a] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-purple-200">
                        <span className="text-4xl">📱</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {t('chooseSendMethod') || "Ընտրեք ուղարկման եղանակը"}
                      </h3>
                      
                      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        {t('chooseSendMethodDesc') || "Պատվերը հաստատելու համար ընտրեք մեսսենջեր"}</p>
                      
                      <div className="flex flex-col gap-3">
                        {/* WhatsApp Button */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => redirectToMessenger('whatsapp')}
                          className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
                          style={{ 
                            background: "linear-gradient(135deg, #25D366, #128C7E)",
                            color: "#fff" 
                          }}
                        >
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <span>{t('sendViaWhatsApp') || "Ուղարկել WhatsApp-ով"}</span>
                        </motion.button>
                        
                        {/* Telegram Button */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => redirectToMessenger('telegram')}
                          className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
                          style={{ 
                            background: "linear-gradient(135deg, #0088cc, #006699)",
                            color: "#fff" 
                          }}
                        >
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                            <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                          <span>{t('sendViaTelegram') || "Ուղարկել Telegram-ով"}</span>
                        </motion.button>
                      </div>
                      
                      {/* Close button */}
                      <button
                        onClick={() => setShowMessengerSelector(false)}
                        className="mt-5 text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium"
                      >
                        {t('cancel') || "Չեղարկել"}
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