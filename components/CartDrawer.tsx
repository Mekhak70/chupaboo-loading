"use client";

import { X, Minus, Plus, Trash2, ChevronDown, ChevronUp, Info, Truck } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/components/cart-context";
import { useLanguage } from "@/components/language-provider";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

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

export function CartDrawer({ isOpen, onClose, orderInfo: propOrderInfo }: CartDrawerProps) {
  // Get cart and orderInfo from context
  const { cart, updateQuantity, removeFromCart, orderInfo: contextOrderInfo } = useCart();
  const { t } = useLanguage();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(false);

  // ✅ Priority: use context orderInfo if available, otherwise use prop
  const orderInfo = contextOrderInfo || propOrderInfo;

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
    if (!orderInfo) return null;
    
    const details: { emoji: string; label: string; value: string }[] = [];
    
    // Phone number
    if (orderInfo.phoneNumber && orderInfo.phoneNumber.trim()) {
      details.push({ emoji: "📞", label: "Հեռախոս", value: orderInfo.phoneNumber });
    } else {
      details.push({ emoji: "📞", label: "Հեռախոս", value: "նշված չէ" });
    }
    
    // Delivery option
    details.push({ 
      emoji: "🚚", 
      label: "Առաքման տարբերակ", 
      value: deliveryOptionDisplayMap[orderInfo.deliveryOption] || orderInfo.deliveryOption 
    });
    
    // Address
    if (orderInfo.deliveryOption === "delivery") {
      if (orderInfo.deliveryAddress && orderInfo.deliveryAddress.trim()) {
        details.push({ emoji: "📍", label: "Առաքման հասցե", value: orderInfo.deliveryAddress });
      } else {
        details.push({ emoji: "📍", label: "Առաքման հասցե", value: "նշված չէ" });
      }
    } else {
      details.push({ emoji: "🏠", label: "Վերցման կետ", value: "Երևան, Կիևյան 15" });
    }
    
    // Delivery date
    if (orderInfo.deliveryDate) {
      const formattedDate = orderInfo.deliveryDate.split("-").reverse().join(".");
      details.push({ emoji: "📅", label: "Առաքման ամսաթիվ", value: formattedDate });
    } else {
      details.push({ emoji: "📅", label: "Առաքման ամսաթիվ", value: "նշված չէ" });
    }
    
    // Delivery time
    if (orderInfo.deliveryTime && orderInfo.deliveryTime.trim()) {
      details.push({ emoji: "⏰", label: "Նախընտրելի ժամ", value: orderInfo.deliveryTime });
    } else {
      details.push({ emoji: "⏰", label: "Նախընտրելի ժամ", value: "նշված չէ" });
    }
    
    // Payment method
    if (orderInfo.paymentMethod) {
      details.push({ 
        emoji: "💳", 
        label: "Վճարման եղանակ", 
        value: paymentMethodDisplayMap[orderInfo.paymentMethod] || orderInfo.paymentMethod 
      });
    } else {
      details.push({ emoji: "💳", label: "Վճարման եղանակ", value: "նշված չէ" });
    }
    
    // Delivery fee
    if (orderInfo.deliveryFee > 0) {
      details.push({ emoji: "💰", label: "Առաքման վճար", value: `${orderInfo.deliveryFee} դրամ` });
    }
    
    return details;
  };

  const hasCake = cart.some((item) => item.options?.cakeType);
  const DISCOUNT_AMOUNT = 500;

  const effectiveTotal = cart.reduce((total, item) => {
    const isCake = !!item.options?.cakeType;
    let unitPrice = item.price;
    if (hasCake && !isCake) {
      unitPrice = Math.max(0, unitPrice - DISCOUNT_AMOUNT);
    }
    return total + unitPrice * (typeof item.quantity === "number" ? item.quantity : 0);
  }, 0);

  const buildWhatsAppMessage = () => {
    let message = "🛒 *ՆՈՐ ՊԱՏՎԵՐ*\n";
    message += "━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    message += "📦 *ԱՊՐԱՆՔՆԵՐ*\n";
    cart.forEach((item) => {
      const isCake = !!item.options?.cakeType;
      let finalPrice = item.price;
      if (hasCake && !isCake) {
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
    
    if (orderInfo) {
      message += "\n🚚 *ԱՌԱՔՄԱՆ ՏՎՅԱԼՆԵՐ*\n";
      message += `▸ 📞 Հեռախոս: ${orderInfo.phoneNumber || "նշված չէ"}\n`;
      message += `▸ 🚚 Առաքման տարբերակ: ${deliveryOptionDisplayMap[orderInfo.deliveryOption] || orderInfo.deliveryOption}\n`;
      
      if (orderInfo.deliveryOption === "delivery") {
        message += `▸ 📍 Հասցե: ${orderInfo.deliveryAddress || "նշված չէ"}\n`;
      } else {
        message += `▸ 🏠 Վերցման կետ: Երևան, Կիևյան 15\n`;
      }
      
      message += `▸ 📅 Ամսաթիվ: ${orderInfo.deliveryDate || "նշված չէ"}\n`;
      message += `▸ ⏰ Ժամ: ${orderInfo.deliveryTime || "նշված չէ"}\n`;
      message += `▸ 💳 Վճարման եղանակ: ${paymentMethodDisplayMap[orderInfo.paymentMethod] || orderInfo.paymentMethod}\n`;
      
      if (orderInfo.deliveryFee > 0) {
        message += `▸ 💰 Առաքման վճար: ${orderInfo.deliveryFee} դրամ\n`;
      }
    }
    
    message += "\n━━━━━━━━━━━━━━━━━━━━━\n";
    message += `💰 ԸՆԴՀԱՆՈՒՐ: ${effectiveTotal} դրամ\n`;
    
    if (hasCake) {
      message += `\n✨ Տորթի հետ միասին partshop ապրանքներից\n   յուրաքանչյուրից զեղչվում է ${DISCOUNT_AMOUNT} դրամ\n`;
    }
    
    return message;
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
                🛒 Զամբյուղ ({cart.length} ապրանք)
              </h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-500">Զամբյուղը դատարկ է</p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-[#69429a] text-white rounded-full text-sm hover:bg-[#7c4fb3] transition"
                  >
                    Շարունակել գնումները
                  </button>
                </div>
              ) : (
                <>
                  {/* Products List */}
                  {cart.map((item, idx) => {
                    const isCake = !!item.options?.cakeType;
                    const originalPrice = item.price;
                    let effectivePrice = originalPrice;
                    if (hasCake && !isCake) {
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
                              <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                              {isCake && (
                                <span className="text-xs bg-gradient-to-r from-[#69429a] to-[#8b5cf6] text-white px-2 py-0.5 rounded-full">🎂 Տորթ</span>
                              )}
                              {hasCake && !isCake && effectivePrice !== originalPrice && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">🔥 Զեղչված</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              {hasCake && !isCake && effectivePrice !== originalPrice ? (
                                <>
                                  <span className="text-md font-bold text-green-600">{effectivePrice} դրամ</span>
                                  <span className="text-xs text-gray-400 line-through">{originalPrice} դրամ</span>
                                </>
                              ) : (
                                <span className="text-md font-bold text-[#69429a]">{effectivePrice} դրամ</span>
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
                              {isExpanded ? "Փակել մանրամասները" : "Տեսնել տորթի կազմը"}
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
                                    <div className="text-xs font-semibold text-[#69429a] uppercase tracking-wide mb-2">📋 Տորթի կազմը</div>
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

                  {/* Delivery Information Section */}
                  {deliveryInfo && deliveryInfo.length > 0 && (
                    <div className="border rounded-lg p-3 bg-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-[#69429a]" />
                          <h3 className="font-semibold text-gray-800 text-sm">Առաքման տվյալներ</h3>
                        </div>
                        <button
                          onClick={() => setIsDeliveryExpanded(!isDeliveryExpanded)}
                          className="text-xs text-[#69429a] hover:text-[#8b5cf6] flex items-center gap-1 transition"
                        >
                          {isDeliveryExpanded ? (
                            <>Փակել <ChevronUp className="h-3 w-3" /></>
                          ) : (
                            <>Տեսնել ավելին <ChevronDown className="h-3 w-3" /></>
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
                              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">🚚 Առաքման մանրամասներ</div>
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
                      
                      {/* Show summary when collapsed */}
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
                {hasCake && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-green-700">✨ Տորթ պատվիրելու դեպքում յուրաքանչյուր partshop ապրանքի գնից զեղչվում է {DISCOUNT_AMOUNT} դրամ</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-gray-700">Ընդհանուր</span>
                  <span className="text-2xl font-bold text-[#69429a]">{effectiveTotal} դրամ</span>
                </div>
                
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://wa.me/37433775750?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 rounded-lg font-semibold shadow-md"
                  style={{ backgroundColor: "#69429a", color: "#fff" }}
                >
                  📱 Պատվիրել WhatsApp-ով
                </motion.a>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}