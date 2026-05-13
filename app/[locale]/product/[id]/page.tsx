"use client"

import { use, useEffect, useState, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, MapPin, Phone, CreditCard, Truck, Home, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { PRODUCTS, type Product } from "@/lib/products"
import { notFound } from "next/navigation"

type CakeType = "MEAT" | "FRUIT" | "VEGETABLES" | ""
type CreamType = "DAIRY" | "PLANTBASEDMILK" | "PLANTBASED" | ""
type DesignType = "STANDARD" | "CUSTOM_PHOTO" | "CUSTOM_TEXT" | 'NAME_TEXT' | ""
type PaymentMethod = "cash" | "CARD" | "bankTransfer" | ""
type DeliveryOption = "delivery" | "pickup"

interface ValidationErrors {
    cakeType?: string;
    creamType?: string;
    selectedVegetables?: string;
    selectedAnimal?: string;
    designType?: string;
    phoneNumber?: string;
    deliveryDate?: string;
    deliveryAddress?: string;
    deliveryTime?: string;
    paymentMethod?: string;
    petName?: string;
    customImage?: string;
    customText?: string;
}

// Constants
const PICKUP_ADDRESS = "Երևան, Կիևյան 15"
const FREE_DELIVERY_THRESHOLD = 6000
const FREE_DELIVERY_MAX_DISTANCE = 10
const BASE_DELIVERY_FEE = 1000
const EXTRA_DISTANCE_FEE = 500
const EXTRA_DISTANCE_THRESHOLD = 7

const PICKUP_LAT = 40.195059
const PICKUP_LON = 44.488427

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = "8774226645:AAHnDf9dmeQg_XZkBYEAfL41xsfhsTpiBDk"
const TELEGRAM_CHAT_ID = "8072053329"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { t, language } = useLanguage()
    const [cakeType, setCakeType] = useState<CakeType>("MEAT")
    const [creamType, setCreamType] = useState<CreamType>("DAIRY")
    const [quantity, setQuantity] = useState(1)
    const [selectedVegetables, setSelectedVegetables] = useState<string[]>(['POTATO', 'CARROT']);
    const [selectedAnimal, setSelectedAnimal] = useState<string>("CHICKEN");
    const [designType, setDesignType] = useState<DesignType>("STANDARD");
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [customImageFile, setCustomImageFile] = useState<File | null>(null);
    const [customText, setCustomText] = useState("");
    const [petName, setPetName] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("delivery");
    const [distance, setDistance] = useState<number | null>(null);
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
    const [deliveryFee, setDeliveryFee] = useState<number>(0);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isYerevanAddress, setIsYerevanAddress] = useState<boolean | null>(null);
    
    // Modal state
    const [showMethodModal, setShowMethodModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<"whatsapp" | "telegram" | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const product = getProductById(id)
    const [price, setPrice] = useState<number>(product ? product.priceInCents : 0)
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getTodayDate = () => {
        const today = new Date()
      
        today.setDate(today.getDate() + 1)
      
        return today.toISOString().split("T")[0]
      }

    const [deliveryDate, setDeliveryDate] = useState(getTodayDate());

    if (!product) {
        notFound()
    }

    const WHATSAPP_NUMBER = "37433775750"
    const SITE_URL = "https://www.chupaboo.com"

    const productName =
        language === "hy"
            ? product.name
            : language === "ru"
                ? product.name
                : language === "pl"
                    ? product.name
                    : product.name

    const calculateDeliveryFee = (distanceInKm: number): number => {
        if (distanceInKm <= 0) return BASE_DELIVERY_FEE;
        let fee = BASE_DELIVERY_FEE;
        if (distanceInKm > EXTRA_DISTANCE_THRESHOLD) {
            const extraDistance = distanceInKm - EXTRA_DISTANCE_THRESHOLD;
            const extraSegments = Math.ceil(extraDistance / EXTRA_DISTANCE_THRESHOLD);
            fee += extraSegments * EXTRA_DISTANCE_FEE;
        }
        return fee;
    };

    const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lon: number } | null> => {
        if (!address || address.trim().length < 5) return null;
        try {
            const encodedAddress = encodeURIComponent(address + ", Armenia");
            const response = await fetch(`/api/geocode?q=${encodedAddress}`);
            if (!response.ok) return null;
            const data = await response.json();
            if (data.error) return null;
            if (data && Array.isArray(data) && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
            }
            return null;
        } catch (error) {
            console.error("Geocoding error:", error);
            return null;
        }
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

    const calculateDrivingDistance = async (address: string): Promise<number | null> => {
        if (!address || address.trim().length < 5) return null;
        setIsCalculatingDistance(true);
        try {
            const deliveryCoords = await getCoordinatesFromAddress(address);
            if (!deliveryCoords) return null;
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${PICKUP_LON},${PICKUP_LAT};${deliveryCoords.lon},${deliveryCoords.lat}?overview=false`;
            const response = await fetch(osrmUrl);
            if (!response.ok) {
                const dist = calculateStraightDistance(PICKUP_LAT, PICKUP_LON, deliveryCoords.lat, deliveryCoords.lon);
                return dist;
            }
            const data = await response.json();
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                return data.routes[0].distance / 1000;
            }
            const dist = calculateStraightDistance(PICKUP_LAT, PICKUP_LON, deliveryCoords.lat, deliveryCoords.lon);
            return dist;
        } catch (error) {
            console.error("Driving distance calculation error:", error);
            return null;
        } finally {
            setIsCalculatingDistance(false);
        }
    };

    const isAddressInYerevanByText = (address: string): boolean => {
        const yerevanKeywords = ['yerevan', 'erevan', 'երևան', 'երեւան', 'Երևան', 'Երեւան', 'Yerevan', 'Erevan'];
        const lowerAddress = address.toLowerCase();
        return yerevanKeywords.some(keyword => lowerAddress.includes(keyword));
    };

    const updateDeliveryFee = useCallback(async (address: string, productTotal: number, option: DeliveryOption) => {
        if (option === "pickup") {
            setDeliveryFee(0);
            setDistance(null);
            setIsYerevanAddress(null);
            return;
        }
        if (!address || address.trim().length < 5) {
            setDeliveryFee(0);
            setDistance(null);
            setIsYerevanAddress(null);
            return;
        }
        const inYerevan = isAddressInYerevanByText(address);
        setIsYerevanAddress(inYerevan);
        const dist = await calculateDrivingDistance(address);
        if (dist !== null) {
            setDistance(dist);
            if (productTotal >= FREE_DELIVERY_THRESHOLD) {
                if (dist <= FREE_DELIVERY_MAX_DISTANCE) {
                    setDeliveryFee(0);
                    return;
                } else {
                    const extraDistance = dist - FREE_DELIVERY_MAX_DISTANCE;
                    const extraSegments = Math.ceil(extraDistance / EXTRA_DISTANCE_THRESHOLD);
                    const fee = extraSegments * EXTRA_DISTANCE_FEE;
                    setDeliveryFee(fee);
                    return;
                }
            }
            const fee = calculateDeliveryFee(dist);
            setDeliveryFee(fee);
        } else {
            if (productTotal >= FREE_DELIVERY_THRESHOLD) {
                setDeliveryFee(0);
            } else {
                setDeliveryFee(BASE_DELIVERY_FEE);
            }
            setDistance(null);
        }
    }, []);

    useEffect(() => {
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        if (deliveryOption === "delivery" && deliveryAddress && deliveryAddress.trim().length > 5) {
            debounceTimeoutRef.current = setTimeout(() => {
                const productTotal = price * quantity;
                updateDeliveryFee(deliveryAddress, productTotal, deliveryOption);
            }, 1500);
        } else if (deliveryOption === "pickup") {
            setDeliveryFee(0);
            setDistance(null);
            setIsYerevanAddress(null);
        } else {
            setDeliveryFee(0);
            setDistance(null);
            setIsYerevanAddress(null);
        }
        return () => {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        };
    }, [deliveryAddress, deliveryOption, price, quantity, updateDeliveryFee]);

    useEffect(() => {
        if (deliveryOption === "delivery" && deliveryAddress && deliveryAddress.trim().length > 5) {
            const productTotal = price * quantity;
            updateDeliveryFee(deliveryAddress, productTotal, deliveryOption);
        }
    }, [price, quantity, deliveryOption, deliveryAddress, updateDeliveryFee]);

    const getSelectedVegetablesForMessage = () => {
        if (selectedVegetables.length === 0) return t("notSelected")
        return selectedVegetables.map(v => t(v.toLowerCase())).join(", ")
    }

    const getSelectedAnimalForMessage = () => {
        if (!selectedAnimal) return t("notSelected")
        return t(selectedAnimal.toLowerCase())
    }

    const getMinDate = () => {
        const tomorrow = new Date()
      
        // +1 օր
        tomorrow.setDate(tomorrow.getDate() + 1)
      
        const year = tomorrow.getFullYear()
        const month = String(tomorrow.getMonth() + 1).padStart(2, "0")
        const day = String(tomorrow.getDate()).padStart(2, "0")
      
        return `${year}-${month}-${day}`
      };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        const year = maxDate.getFullYear();
        const month = String(maxDate.getMonth() + 1).padStart(2, '0');
        const day = String(maxDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        if (!cakeType) {
            newErrors.cakeType = t("cakeTypeRequired") || "Please select cake type";
            isValid = false;
        }
        if (!creamType) {
            newErrors.creamType = t("creamTypeRequired") || "Please select cream type";
            isValid = false;
        }
        if (selectedVegetables.length === 0) {
            newErrors.selectedVegetables = t("ingredientsRequired") || "Please select at least one ingredient";
            isValid = false;
        }
        if (cakeType === "MEAT" && !selectedAnimal) {
            newErrors.selectedAnimal = t("meatTypeRequired") || "Please select meat type";
            isValid = false;
        }
        if (product.category !== 'small' && !designType) {
            newErrors.designType = t("designTypeRequired") || "Please select design type";
            isValid = false;
        }
        if (designType === "CUSTOM_TEXT" && !customText.trim()) {
            newErrors.customText = t("customTextRequired") || "Please enter custom text";
            isValid = false;
        }
        const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = t("phoneNumberRequired") || "Please enter phone number";
            isValid = false;
        } else if (!phoneRegex.test(phoneNumber)) {
            newErrors.phoneNumber = t("phoneNumberInvalid") || "Please enter a valid phone number";
            isValid = false;
        }
        if (!deliveryDate) {
            newErrors.deliveryDate = t("deliveryDateRequired") || "Please select delivery date";
            isValid = false;
        } else {
            const selectedDate = new Date(deliveryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 30);
            if (selectedDate < today) {
                newErrors.deliveryDate = t("deliveryDatePast") || "Delivery date cannot be in the past";
                isValid = false;
            } else if (selectedDate > maxDate) {
                newErrors.deliveryDate = t("deliveryDateTooFar") || "Delivery date cannot be more than 30 days from now";
                isValid = false;
            }
        }
        if (deliveryOption === "delivery") {
            if (!deliveryAddress.trim()) {
                newErrors.deliveryAddress = t("deliveryAddressRequired") || "Please enter delivery address";
                isValid = false;
            } else if (deliveryAddress.trim().length < 5) {
                newErrors.deliveryAddress = t("deliveryAddressTooShort") || "Please enter a valid delivery address";
                isValid = false;
            }
        }
        if (!deliveryTime) {
            newErrors.deliveryTime = t("deliveryTimeRequired") || "Please select delivery time";
            isValid = false;
        }
        if (!paymentMethod) {
            newErrors.paymentMethod = t("paymentMethodRequired") || "Please select payment method";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const clearFieldError = (field: keyof ValidationErrors) => {
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const totalPrice = (price * quantity) + deliveryFee;

    const whatsappMessage = `${t("whatsappMessageTextOne")}

🎂 ${productName}
📦 ${t("quantity")}: ${quantity}
💰 ${t("price")}: ${price * quantity} ${t("currency")}
${deliveryFee > 0 ? `🚚 ${t("deliveryFee")}: ${deliveryFee} ${t("currency")}` : deliveryOption === "delivery" && deliveryFee === 0 && (price * quantity) >= FREE_DELIVERY_THRESHOLD ? `🚚 ${t("freeDelivery")}` : ""}
💵 ${t("totalAmount")}: ${totalPrice} ${t("currency")}
🍖 ${t("mainCakeType")}: ${cakeType ? t(cakeType) : t("notSelected")}
🍦 ${t("creamType")}: ${creamType ? t(creamType) : t("notSelected")}
🥩 ${t("meatType")}: ${cakeType === "MEAT" ? getSelectedAnimalForMessage() : t("notSelected")}
🥬 ${t("ingredients")}: ${getSelectedVegetablesForMessage()}
🎨 ${t("designType")}: ${designType !== "CUSTOM_PHOTO" && designType !== "NAME_TEXT" ? t(designType.toLowerCase()) : designType == "CUSTOM_PHOTO" ? t("customMyDogPhotoDesign") : designType == "NAME_TEXT" ? t('petName') : ''}
${designType === "CUSTOM_TEXT" ? `✏️ ${t("customDesign")}: ${customText || t("notProvided")}` : ""}
${designType === "NAME_TEXT" ? `✏️ ${t("petName")}: ${petName || t("notProvided")}` : ""}
${petName && designType !== "NAME_TEXT" ? `🐾 ${t("petName")}: ${petName}` : ""}
${deliveryOption === "delivery" ? `🚚 ${t("deliveryOption")}: ${t("delivery")}
📍 ${t("deliveryAddress")}: ${deliveryAddress || t("notProvided")}
${distance ? `📏 ${t("distance")}: ${distance.toFixed(1)} km` : ""}
` : `🏠 ${t("deliveryOption")}: ${t("pickup")}
📍 ${t("pickupAddress")}: ${PICKUP_ADDRESS}`}
📞 ${t("phoneNumber")}: ${phoneNumber || t("notProvided")}
📅 ${t("deliveryDate")}: ${deliveryDate || t("notProvided")}
⏰ ${t("preferredDeliveryTime")}: ${deliveryTime || t("notProvided")}
💳 ${t("paymentMethod")}: ${t(paymentMethod)}

${SITE_URL}/${language}/product/${product.id}`

    // Send to Telegram function
    const sendToTelegram = async (message: string): Promise<boolean> => {
        try {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: "HTML",
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Telegram API error:", errorData);
                throw new Error(`Telegram API error: ${response.status}`);
            }
            return true;
        } catch (error) {
            console.error("Failed to send message to Telegram:", error);
            return false;
        }
    };

    // Send via WhatsApp
    const sendViaWhatsApp = () => {
        const textMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${textMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    // Send via Telegram
    const sendViaTelegram = async () => {
        setIsSending(true);
        const success = await sendToTelegram(whatsappMessage);
        if (success) {
            alert(t("orderSentTelegram") || "✅ Your order has been sent successfully via Telegram!");
        } else {
            alert(t("telegramError") || "❌ Failed to send via Telegram. Please try again or use WhatsApp.");
        }
        setIsSending(false);
    };

    // Handle order button click - opens modal
    const handleOrderClick = () => {
        if (!validateForm()) {
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const element = document.getElementById(`error-${firstErrorField}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return;
        }
        setShowMethodModal(true);
    };

    // Handle method selection from modal
    const handleMethodSelect = async (method: "whatsapp" | "telegram") => {
        setShowMethodModal(false);
        setSelectedMethod(method);
        
        if (method === "whatsapp") {
            sendViaWhatsApp();
        } else {
            await sendViaTelegram();
        }
        
        setSelectedMethod(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert(t("fileTooLarge") || "File is too large. Maximum size is 10MB");
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert(t("invalidFileType") || "Please upload an image file");
                return;
            }
            setCustomImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setCustomImage(reader.result as string);
            reader.readAsDataURL(file);
            clearFieldError('customImage');
        }
    };

    const removeImage = () => {
        setCustomImage(null);
        setCustomImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleVegetableToggle = (vegKey: string) => {
        const grainGroup = ["RICE", "WHEAT", "OATS"];
        const isSelected = selectedVegetables.includes(vegKey);
        if (isSelected) {
            if (selectedVegetables.length === 1) return;
            setSelectedVegetables(selectedVegetables.filter((v) => v !== vegKey));
        } else {
            let updated = selectedVegetables;
            if (grainGroup.includes(vegKey)) {
                updated = updated.filter((v) => !grainGroup.includes(v));
            }
            if (updated.length >= 3) {
                updated = [...updated.slice(1), vegKey];
            } else {
                updated = [...updated, vegKey];
            }
            setSelectedVegetables(updated);
        }
        clearFieldError('selectedVegetables');
    };

    useEffect(() => {
        let basePrice = 0;
        if (cakeType === "MEAT") {
            if (selectedAnimal === "CHICKEN") basePrice = id === 'cookieboo' ? 15000 : 12000;
            else if (selectedAnimal === "BEEF") basePrice = id === 'cookieboo' ? 16000 : 13000;
            else if (selectedAnimal === "LAMB") basePrice = id === 'cookieboo' ? 18000 : 15000;
            else if (selectedAnimal === "TURKEY") basePrice = id === 'cookieboo' ? 22000 : 19000;
        } else if (cakeType === "FRUIT") {
            basePrice = id === 'cookieboo' ? 13000 : 10000;
        } else if (cakeType === "VEGETABLES") {
            basePrice = id === 'cookieboo' ? 14000 : 11000;
        }
        if (selectedVegetables.includes('SWEET_POTATO')) basePrice += 2000;
        if (
            selectedVegetables.includes('MANGO') 
        ) {
            basePrice += 2000;
        }
        if (
           
            selectedVegetables.includes('ELDERBERRY')
        ) {
            basePrice += 2000;
        }
        let extra = 0;
        if (selectedVegetables.length === 3) {
            extra = creamType === 'PLANTBASEDMILK' ? 1000 + 3000 : 1000;
        } else if (creamType === 'PLANTBASEDMILK') {
            extra = 3000;
        }
        if (id === 'pawy-1') basePrice += 2000;
        let finalPrice = basePrice + extra;
        if (product.category === 'small') {
            if (product.id === 'midi') finalPrice = Math.round(finalPrice / 2);
            else finalPrice = Math.round(finalPrice / 3);
        }
        if (product.category !== 'small' && designType === "CUSTOM_PHOTO") finalPrice += 3000;
        const roundingStep = 500;
        finalPrice = Math.round(finalPrice / roundingStep) * roundingStep;
        setPrice(finalPrice);
    }, [cakeType, selectedAnimal, selectedVegetables, creamType, id, product.category, designType]);

    const sendToTelegramProductView = async (productName: string, imageSrc: string) => {
        try {
            const caption = `🛒 New User View:\n📦 ${productName}\n🕒 ${new Date().toLocaleString()}`
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, photo: imageSrc, caption }),
            })
        } catch (err) {
            console.error("Telegram error:", err)
        }
    }

    const hasSent = useRef(false);
    useEffect(() => {
        if (product && !hasSent.current) {
            hasSent.current = true;
            const fullImageUrl = product.image.src.startsWith("http") ? product.image.src : `${SITE_URL}${product.image.src}`;
            sendToTelegramProductView(productName, fullImageUrl);
        }
    }, [product, productName]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Link href="/" className="block w-full bg-[#69429a]">
                <div className="bg-[#69429a] text-white py-4">
                    <div className="container mx-auto px-4 flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" />
                        <span>{t("mainPage")}</span>
                    </div>
                </div>
            </Link>

            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
                        <Image src={product.image.src} alt={productName} fill className="object-cover" />
                    </div>

                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-[#69429a] mb-2">{productName}</h1>
                            <p className="text-gray-600 text-xs">{t('cakeDescription')}</p>
                        </div>

                        {/* Cake Type Selection */}
                        <div id="error-cakeType">
                            <p className="text-lg font-semibold text-[#69429a] mb-3">{t("choosemaincake")}</p>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => { setCakeType("MEAT"); clearFieldError('cakeType'); setSelectedVegetables(['POTATO', 'CARROT']); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${cakeType === "MEAT" ? "bg-[#ef4f27] text-white border-[#ef4f27] shadow-md scale-105" : "bg-white text-[#ef4f27] border-[#ef4f27] hover:bg-[#ffece7]"}`}>🍖 {t("MEAT")}</button>
                                <button onClick={() => { setSelectedVegetables(['BANANA', 'APPLE']); setCakeType("FRUIT"); clearFieldError('cakeType'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${cakeType === "FRUIT" ? "bg-[#f4a2c6] text-white border-[#f4a2c6] shadow-md scale-105" : "bg-white text-[#f4a2c6] border-[#f4a2c6] hover:bg-[#fff0f6]"}`}>🍓 {t("FRUIT")}</button>
                                <button onClick={() => { setCakeType("VEGETABLES"); clearFieldError('cakeType'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${cakeType === "VEGETABLES" ? "bg-[#aed137] text-white border-[#aed137] shadow-md scale-105" : "bg-white text-[#aed137] border-[#aed137] hover:bg-[#f0f8d0]"}`}>🥬 {t("VEGETABLES")}</button>
                            </div>
                            {errors.cakeType && <p className="text-red-500 text-sm mt-2">{errors.cakeType}</p>}
                        </div>

                        {/* Meat Type Selection */}
                        {cakeType === 'MEAT' && (
                            <div id="error-selectedAnimal">
                                <p className="text-lg font-semibold text-[#69429a] mb-3">{t('chooseMeatType')}</p>
                                <div className="flex flex-wrap gap-3">
                                    {[{ key: "CHICKEN", label: t("chicken"), emoji: "🐔", color: "#F44336" }, { key: "BEEF", label: t("beef"), emoji: "🐄", color: "#8B4513" }, { key: "LAMB", label: t("lamb"), emoji: "🐑", color: "#FF8C00" }, { key: "TURKEY", label: t("turkey"), emoji: "🦃", color: "#DAA520" }].map((veg) => {
                                        const isSelected = selectedAnimal === veg.key
                                        return (<button key={veg.key} onClick={() => { setSelectedAnimal(veg.key); clearFieldError('selectedAnimal'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all`} style={{ backgroundColor: isSelected ? veg.color : "white", color: isSelected ? "white" : veg.color, borderColor: veg.color }}>{veg.emoji} {veg.label}</button>);
                                    })}
                                </div>
                                {errors.selectedAnimal && <p className="text-red-500 text-sm mt-2">{errors.selectedAnimal}</p>}
                            </div>
                        )}

                        {/* Ingredients Selection */}
                        <div id="error-selectedVegetables">
                            <p className="text-lg font-semibold text-[#69429a] mb-3">{t("chooseIngredients")}</p>
                            <div className="flex flex-wrap gap-3">
                                {[{ key: "POTATO", label: t('potato'), emoji: "🥔", color: "#D9A066" }, { key: "CARROT", label: t('carrot'), emoji: "🥕", color: "#FF8C42" }, { key: "BROCCOLI", label: t('broccoli'), emoji: "🥦", color: "#4CAF50" }, { key: "PUMPKIN", label: t('pumpkin'), emoji: "🎃", color: "#FFA500" }, { key: "PEPPER", label: t('greenPepper'), emoji: "🫑", color: "#00C853" }, { key: "ZUCCHINI", label: t('zucchini'), emoji: "🥒", color: "#76C043" }, { key: "CAULIFLOWER", label: t('cauliflower'), emoji: "🥬", color: "#B0BEC5" }, { key: "SWEET_POTATO", label: t('sweetPotato'), emoji: "🍠", color: "#FF5722" }, { key: "SPINACH", label: t('spinach'), emoji: "🥬", color: "#2E7D32" }, { key: "RICE", label: t('rice'), emoji: "🍚", color: "#B0BEC5" }, { key: "WHEAT", label: t('wheat'), emoji: "🌾", color: "#D9A066" }, { key: "OATS", label: t('oats'), emoji: "🥣", color: "#FFB74D" }, { key: "APPLE", label: t('apple'), emoji: "🍎", color: "#FF4D4D", type: 'FRUIT' }, { key: "BANANA", label: t('banana'), emoji: "🍌", color: "#FFE135", type: 'FRUIT' }, { key: "PEAR", label: t('pear'), emoji: "🍐", color: "#A2D149", type: 'FRUIT' }, { key: "ELDERBERRY", label: t('elderberry'), emoji: "🫐", color: "#6A0DAD", type: 'FRUIT' }, { key: "STRAWBERRY", label: t('strawberry'), emoji: "🍓", color: "#FF1654", type: 'FRUIT' }, { key: "MANGO", label: t('mango'), emoji: "🥭", color: "#FFB347", type: 'FRUIT' }].map((veg) => {
                                    const isSelected = selectedVegetables.includes(veg.key);
                                    const showIngredient = (cakeType === 'FRUIT' && veg.type === 'FRUIT') || (cakeType !== 'FRUIT' && veg.type !== 'FRUIT');
                                    if (!showIngredient) return null;
                                    return (<button key={veg.key} onClick={() => handleVegetableToggle(veg.key)} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all`} style={{ backgroundColor: isSelected ? veg.color : "white", color: isSelected ? "white" : veg.color, borderColor: veg.color }}>{veg.emoji} {veg.label}</button>);
                                })}
                            </div>
                            {errors.selectedVegetables && <p className="text-red-500 text-sm mt-2">{errors.selectedVegetables}</p>}
                        </div>

                        {/* Cream Type Selection */}
                        <div id="error-creamType">
                            <p className="text-lg font-semibold text-[#69429a] mb-3">{t("choosecream")}</p>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => { setCreamType("DAIRY"); clearFieldError('creamType'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${creamType === "DAIRY" ? "bg-[#1e439b] text-white border-[#1e439b] shadow-md scale-105" : "bg-white text-[#1e439b] border-[#1e439b] hover:bg-[#e0e7ff]"}`}>🐄 {t("DAIRY")}</button>
                                <button onClick={() => { setCreamType("PLANTBASEDMILK"); clearFieldError('creamType'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${creamType === "PLANTBASEDMILK" ? "bg-[#72bfe9] text-white border-[#72bfe9] shadow-md scale-105" : "bg-white text-[#72bfe9] border-[#72bfe9] hover:bg-[#e1f5fe]"}`}>🥥 {t("PLANTBASEDMILK")}</button>
                                <button onClick={() => { setCreamType("PLANTBASED"); clearFieldError('creamType'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${creamType === "PLANTBASED" ? "bg-[#008042] text-white border-[#008042] shadow-md scale-105" : "bg-white text-[#008042] border-[#008042] hover:bg-[#e8f5e9]"}`}>🥕 {t("PLANTBASED")}</button>
                            </div>
                            {errors.creamType && <p className="text-red-500 text-sm mt-2">{errors.creamType}</p>}
                        </div>

                        {/* Design Type Selection */}
                        {product.category !== 'small' && (
                            <>
                                <div id="error-designType">
                                    <p className="text-lg font-semibold text-[#69429a] mb-3">{t("chooseDesign")}</p>
                                    <div className="flex flex-wrap gap-3">
                                        <button onClick={() => { setDesignType("STANDARD"); clearFieldError('designType'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${designType === "STANDARD" ? "bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-md scale-105" : "bg-white text-[#8b5cf6] border-[#8b5cf6] hover:bg-[#f3e8ff]"}`}>🎂 {t("standardDesign")}</button>
                                        <button onClick={() => { setDesignType("CUSTOM_PHOTO"); clearFieldError('designType'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${designType === "CUSTOM_PHOTO" ? "bg-[#fb7185] text-white border-[#fb7185] shadow-md scale-105" : "bg-white text-[#fb7185] border-[#fb7185] hover:bg-[#ffe4e6]"}`}>📸 {t("customMyDogPhotoDesign")}</button>
                                        <button onClick={() => { setDesignType("NAME_TEXT"); clearFieldError('designType'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${designType === "NAME_TEXT" ? "bg-[#4ade80] text-white border-[#4ade80] shadow-md scale-105" : "bg-white text-[#4ade80] border-[#4ade80] hover:bg-[#ecfdf5]"}`}>✏️ {t('petName')}</button>
                                        <button onClick={() => { setDesignType("CUSTOM_TEXT"); clearFieldError('designType'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${designType === "CUSTOM_TEXT" ? "bg-[#facc15] text-white border-[#facc15] shadow-md scale-105" : "bg-white text-[#facc15] border-[#facc15] hover:bg-[#fff9db]"}`}>✏️ {t("customDesign")}</button>
                                    </div>
                                    {errors.designType && <p className="text-red-500 text-sm mt-2">{errors.designType}</p>}
                                </div>
                                {designType === "NAME_TEXT" && (
                                    <div id="error-petName">
                                        <p className="text-lg font-semibold text-[#69429a] mb-3">{t("petNameLabel")}</p>
                                        <input type="text" value={petName} onChange={(e) => { setPetName(e.target.value); if (e.target.value.trim()) clearFieldError('petName'); }} placeholder={t("petNameLabel")} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] ${errors.petName ? 'border-red-500' : 'border-gray-300'}`} />
                                        {errors.petName && <p className="text-red-500 text-sm mt-2">{errors.petName}</p>}
                                    </div>
                                )}
                                {designType === "CUSTOM_TEXT" && (
                                    <div id="error-customText">
                                        <p className="text-lg font-semibold text-[#69429a] mb-3">{t("enterCustomText")}</p>
                                        <textarea value={customText} onChange={(e) => { setCustomText(e.target.value); if (e.target.value.trim()) clearFieldError('customText'); }} placeholder={t("enterCustomText")} rows={3} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] resize-none ${errors.customText ? 'border-red-500' : 'border-gray-300'}`} />
                                        {errors.customText && <p className="text-red-500 text-sm mt-2">{errors.customText}</p>}
                                        <p className="text-xs text-gray-500 mt-1">{t("maxCharacters")} {customText.length}/50</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Delivery Option Selection */}
                        <div>
                            <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2"><Truck className="w-5 h-5" />{t("deliveryOption")}</p>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => { setDeliveryOption("delivery"); clearFieldError('deliveryAddress'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${deliveryOption === "delivery" ? "bg-[#69429a] text-white border-[#69429a] shadow-md scale-105" : "bg-white text-[#69429a] border-[#69429a] hover:bg-[#f3e8ff]"}`}>🚚 {t("delivery")}</button>
                                <button onClick={() => { setDeliveryOption("pickup"); setDeliveryAddress(""); clearFieldError('deliveryAddress'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${deliveryOption === "pickup" ? "bg-[#10b981] text-white border-[#10b981] shadow-md scale-105" : "bg-white text-[#10b981] border-[#10b981] hover:bg-[#d1fae5]"}`}>🏠 {t("pickup")}</button>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        {deliveryOption === "delivery" && (
                            <div id="error-deliveryAddress">
                                <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2"><MapPin className="w-5 h-5" />{t("deliveryAddress")}</p>
                                <textarea value={deliveryAddress} onChange={(e) => { setDeliveryAddress(e.target.value); if (e.target.value.trim().length >= 5) clearFieldError('deliveryAddress'); }} placeholder={t("placeholder")} rows={3} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] resize-none ${errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'}`} required />
                                {errors.deliveryAddress && <p className="text-red-500 text-sm mt-2">{errors.deliveryAddress}</p>}
                                {deliveryAddress && deliveryAddress.trim().length > 5 && !isCalculatingDistance && distance !== null && deliveryOption === "delivery" && (
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-800 font-semibold">🚚 {t("deliveryFee")}: {deliveryFee} {t("currency")}</p>
                                    </div>
                                )}
                                {isCalculatingDistance && (<div className="mt-2 p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600">⏳ {t("calculatingDistance")}...</p></div>)}
                            </div>
                        )}

                        {/* Pickup Address */}
                        {deliveryOption === "pickup" && (
                            <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-800 flex items-center gap-2"><Home className="w-4 h-4" /><span className="font-semibold">{t("pickupAddress")}:</span>{PICKUP_ADDRESS}</p>
                                <p className="text-xs text-green-600 mt-1">ℹ️ {t("pickupInstructions")}</p>
                            </div>
                        )}

                        {/* Phone Number */}
                        <div id="error-phoneNumber">
                            <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2"><Phone className="w-5 h-5" />{t("phoneNumber")}</p>
                            <input type="tel" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); if (e.target.value.trim()) clearFieldError('phoneNumber'); }} placeholder={t("enterPhoneNumber")} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`} required />
                            {errors.phoneNumber && <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>}
                        </div>

                        {/* Delivery Date */}
                        <div id="error-deliveryDate">
                            <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2"><Calendar className="w-5 h-5" />{t("deliveryDate")}</p>
                            <input type="date" value={deliveryDate} onChange={(e) => { setDeliveryDate(e.target.value); if (e.target.value) clearFieldError('deliveryDate'); }} min={getMinDate()} max={getMaxDate()} className={`w-full h-10 px-3 pr-3 text-sm appearance-none bg-white border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] ${errors.deliveryDate ? 'border-red-500' : 'border-gray-300'}`} required />
                            {errors.deliveryDate && <p className="text-red-500 text-sm mt-2">{errors.deliveryDate}</p>}
                        </div>

                        {/* Delivery Time */}
                        <div id="error-deliveryTime">
                            <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2"><Clock className="w-5 h-5" />{t("preferredDeliveryTime")}</p>
                            <select value={deliveryTime} onChange={(e) => { setDeliveryTime(e.target.value); if (e.target.value) clearFieldError('deliveryTime'); }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] ${errors.deliveryTime ? 'border-red-500' : 'border-gray-300'}`}>
                                <option value="">{t("selectDeliveryTime")}</option>
                                <option value="12:00-15:00">12:00 - 15:00</option>
                                <option value="15:00-18:00">15:00 - 18:00</option>
                                <option value="18:00-21:00">18:00 - 21:00</option>
                                <option value="21:00-24:00">21:00 - 24:00</option>
                            </select>
                            {errors.deliveryTime && <p className="text-red-500 text-sm mt-2">{errors.deliveryTime}</p>}
                        </div>

                        {/* Payment Method */}
                        <div id="error-paymentMethod">
                            <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2"><CreditCard className="w-5 h-5" />{t("paymentMethod")}</p>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => { setPaymentMethod("cash"); clearFieldError('paymentMethod'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${paymentMethod === "cash" ? "bg-[#10b981] text-white border-[#10b981] shadow-md scale-105" : "bg-white text-[#10b981] border-[#10b981] hover:bg-[#d1fae5]"}`}>💵 {t("cash")}</button>
                                <button onClick={() => { setPaymentMethod("bankTransfer"); clearFieldError('paymentMethod'); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${paymentMethod === "bankTransfer" ? "bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-md scale-105" : "bg-white text-[#8b5cf6] border-[#8b5cf6] hover:bg-[#ede9fe]"}`}>🏦 {t("bankTransfer")}</button>
                            </div>
                            {errors.paymentMethod && <p className="text-red-500 text-sm mt-2">{errors.paymentMethod}</p>}
                        </div>

                        {/* Quantity */}
                        <div>
                            <p className="text-lg font-semibold text-[#69429a] mb-3">{language === "en" ? "Quantity" : language === "ru" ? "Количество" : language === "pl" ? "Ilość" : "Քանակ"}</p>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-[#69429a] text-white font-bold text-xl flex items-center justify-center cursor-pointer hover:bg-[#5a3a85] transition-colors">-</button>
                                <span className="text-2xl font-bold text-[#69429a] w-12 text-center">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-[#69429a] text-white font-bold text-xl flex items-center justify-center cursor-pointer hover:bg-[#5a3a85] transition-colors">+</button>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div style={{ position: 'sticky', bottom: '20px', zIndex: 50, marginTop: 'auto', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '1rem', border: '1px solid rgba(105, 66, 154, 0.1)' }}>
                            <div>
                                <div className="text-2xl font-bold text-[#69429a]">{t("subtotal")}: {price * quantity} {t("currency")}</div>
                                {deliveryFee > 0 && (<div className="text-sm text-gray-600 mt-1">{t("deliveryFee")}: {deliveryFee} {t("currency")}</div>)}
                                {deliveryOption === "delivery" && deliveryFee === 0 && (price * quantity) >= FREE_DELIVERY_THRESHOLD && distance !== null && distance <= FREE_DELIVERY_MAX_DISTANCE && (<div className="text-sm text-green-600 mt-1">✅ {t("freeDeliveryForOrdersAbove")}</div>)}
                                {deliveryOption === "delivery" && deliveryFee === 0 && (price * quantity) >= FREE_DELIVERY_THRESHOLD && distance === null && (<div className="text-sm text-green-600 mt-1">✅ {t("freeDeliveryApplied")}</div>)}
                                <div className="text-3xl font-bold text-[#69429a] mt-2">{t("total")}: {totalPrice} {t("currency")}<sup className="text-sm font-normal text-gray-400 ml-1">*</sup></div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-dashed border-gray-200 flex items-start gap-1">
                                <span className="text-[#69429a] text-sm font-bold">*</span>
                                <span className="text-xs text-gray-400">{t("priceDependsOnComponentsAndDesign")}</span>
                            </div>
                        </div>

                        {/* Order Button */}
                        <button onClick={handleOrderClick} disabled={isSending} className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#69429a] text-white font-semibold rounded-xl hover:bg-[#aed137] transition-colors text-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSending ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{t("sending") || "Sending..."}</>) : (<>{t("orderNow")}</>)}
                        </button>

                        <p className="mt-2 text-gray-700 italic text-sm">
                            {deliveryOption === "delivery" ? (
                                isYerevanAddress === false ? (``) : (price * quantity) >= FREE_DELIVERY_THRESHOLD ? (
                                    distance !== null && distance > FREE_DELIVERY_MAX_DISTANCE ? `🚚 ${FREE_DELIVERY_MAX_DISTANCE} km ${t('freeDelivery')}, ${t('extraDistanceCharged')}` : `🚚 ${t('freeDeliveryForOrdersAbove')}`
                                ) : (`🚚 ${t('deliveryFeeInfo')}`)
                            ) : (`🏠 ${t('pickupHint')}`)}
                        </p>

                        {/* Product Info */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold text-[#69429a] mb-3">{t('productInfo')}</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center gap-2"><span className="text-[#aed137]">✓</span>{t('safeIngredients')}</li>
                                <li className="flex items-center gap-2"><span className="text-[#aed137]">✓</span>{t('freshDaily2')}</li>
                                <li className="flex items-center gap-2"><span className="text-[#aed137]">✓</span>{t('madeWithLove')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Method Selection Modal */}
            {showMethodModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setShowMethodModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-3">📱</div>
                            <h2 className="text-2xl font-bold text-[#69429a] mb-2">
                                {t("chooseSendMethod") || "Choose send method"}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {t("chooseSendMethodDesc") || "How would you like to send your order?"}
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => handleMethodSelect("whatsapp")}
                                className="w-full flex items-center justify-between px-6 py-4 bg-[#25D366] bg-opacity-10 hover:bg-opacity-20 rounded-xl transition-all border-2 border-[#25D366] border-opacity-30 hover:border-opacity-100"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">💚</span>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800">WhatsApp</p>
                                        <p className="text-xs text-gray-500">{t("sendViaWhatsApp") || "Send via WhatsApp"}</p>
                                    </div>
                                </div>
                                <span className="text-[#25D366]">→</span>
                            </button>
                            
                            <button
                                onClick={() => handleMethodSelect("telegram")}
                                className="w-full flex items-center justify-between px-6 py-4 bg-[#26A5E4] bg-opacity-10 hover:bg-opacity-20 rounded-xl transition-all border-2 border-[#26A5E4] border-opacity-30 hover:border-opacity-100"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">✈️</span>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800">Telegram</p>
                                        <p className="text-xs text-gray-500">{t("sendViaTelegram") || "Send via Telegram"}</p>
                                    </div>
                                </div>
                                <span className="text-[#26A5E4]">→</span>
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowMethodModal(false)}
                            className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 transition-colors text-sm"
                        >
                            {t("cancel") || "Cancel"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function getProductById(id: string): Product | undefined {
    return PRODUCTS.find((product) => product.id === id)
}