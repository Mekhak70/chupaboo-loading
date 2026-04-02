"use client"

import { use, useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MessageCircle, Upload, X, Calendar, Clock, MapPin, Phone, CreditCard } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { PRODUCTS, type Product } from "@/lib/products"
import { notFound } from "next/navigation"

type CakeType = "MEAT" | "FRUIT" | "VEGETABLES" | ""
type CreamType = "DAIRY" | "PLANTBASEDMILK" | "PLANTBASED" | ""
type DesignType = "STANDARD" | "CUSTOM_PHOTO" | "CUSTOM_TEXT" | 'NAME_TEXT' | ""
type PaymentMethod = "cash" | "CARD" | "bankTransfer" | ""

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

    // Additional fields
    const [phoneNumber, setPhoneNumber] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

    // Validation errors state
    const [errors, setErrors] = useState<ValidationErrors>({});
console.log(paymentMethod,'paymentMethod')
    const fileInputRef = useRef<HTMLInputElement>(null);
    const product = getProductById(id)
    const [price, setPrice] = useState<number>(product ? product.priceInCents : 0)

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

    const getSelectedVegetablesForMessage = () => {
        if (selectedVegetables.length === 0) return t("notSelected")
        return selectedVegetables.map(v => t(v.toLowerCase())).join(", ")
    }

    const getSelectedAnimalForMessage = () => {
        if (!selectedAnimal) return t("notSelected")
        return t(selectedAnimal.toLowerCase())
    }

    const getMinDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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

        // if (designType === "CUSTOM_PHOTO" && !customImageFile) {
        //     newErrors.customImage = t("photoRequired") || "Please upload a photo";
        //     isValid = false;
        // }

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

        if (!deliveryAddress.trim()) {
            newErrors.deliveryAddress = t("deliveryAddressRequired") || "Please enter delivery address";
            isValid = false;
        } else if (deliveryAddress.trim().length < 5) {
            newErrors.deliveryAddress = t("deliveryAddressTooShort") || "Please enter a valid delivery address";
            isValid = false;
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

    const whatsappMessage = `${t("whatsappMessageTextOne")}

🎂 ${productName}
📦 ${t("quantity")}: ${quantity}
💰 ${t("price")}: ${quantity * price} ${t("currency")}
🍖 ${t("mainCakeType")}: ${cakeType ? t(cakeType) : t("notSelected")}
🍦 ${t("creamType")}: ${creamType ? t(creamType) : t("notSelected")}
🥩 ${t("meatType")}: ${cakeType === "MEAT" ? getSelectedAnimalForMessage() : t("notSelected")}
🥬 ${t("ingredients")}: ${getSelectedVegetablesForMessage()}
🎨 ${t("designType")}: ${designType !== "CUSTOM_PHOTO" ? t(designType.toLowerCase()) : t("customMyDogPhotoDesign")}
${designType === "CUSTOM_TEXT" ? `✏️ ${t("customText")}: ${customText || t("notProvided")}` : ""}
${designType === "NAME_TEXT" ? `✏️ ${t("petName")}: ${petName || t("notProvided")}` : ""}
${petName && designType !== "NAME_TEXT" ? `🐾 ${t("petName")}: ${petName}` : ""}

📞 ${t("phoneNumber")}: ${phoneNumber || t("notProvided")}
📅 ${t("deliveryDate")}: ${deliveryDate || t("notProvided")}
📍 ${t("deliveryAddress")}: ${deliveryAddress || t("notProvided")}
⏰ ${t("preferredDeliveryTime")}: ${deliveryTime || t("notProvided")}
💳 ${t("paymentMethod")}: ${t(paymentMethod)}

${SITE_URL}/${language}/product/${product.id}`

    // Send to WhatsApp with photo
    const handleWhatsAppOrder = async () => {
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

        setIsSending(true);

        const textMessage = encodeURIComponent(whatsappMessage);

        // If there's a photo for CUSTOM_PHOTO

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${textMessage}`;
        window.open(whatsappUrl, '_blank');
        setIsSending(false);

    };

    // Helper function to convert file to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    // Helper function to copy image to clipboard
    const copyImageToClipboard = async (file: File): Promise<void> => {
        try {
            const blob = new Blob([await file.arrayBuffer()], { type: file.type });
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);
        } catch (error) {
            console.error("Clipboard API error:", error);
            throw error;
        }
    };

    // Download image and show notification
    const downloadImageAndNotify = (imageSrc: string | null) => {
        if (imageSrc) {
            const link = document.createElement('a');
            link.href = imageSrc;
            link.download = `pet-photo-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast(t("photoDownloaded") || "📸 Photo downloaded! Please attach it in WhatsApp");
        }
    };

    // Simple toast notification
    const showToast = (message: string) => {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: #25D366;
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideUp 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
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
            reader.onloadend = () => {
                setCustomImage(reader.result as string);
            };
            reader.readAsDataURL(file);

            clearFieldError('customImage');
        }
    };

    const removeImage = () => {
        setCustomImage(null);
        setCustomImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleVegetableToggle = (vegKey: string) => {
        const grainGroup = ["RICE", "WHEAT", "OATS"];
        const isSelected = selectedVegetables.includes(vegKey);

        if (isSelected) {
            if (selectedVegetables.length === 1) {
                return;
            }
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
            if (selectedAnimal === "CHICKEN") {
                basePrice = id === 'cookieboo' ? 15000 : 12000;
            } else if (selectedAnimal === "BEEF") {
                basePrice = id === 'cookieboo' ? 16000 : 13000;
            } else if (selectedAnimal === "LAMB") {
                basePrice = id === 'cookieboo' ? 18000 : 15000;
            } else if (selectedAnimal === "TURKEY") {
                basePrice = id === 'cookieboo' ? 22000 : 19000;
            }
        } else if (cakeType === "FRUIT") {
            basePrice = id === 'cookieboo' ? 13000 : 10000;
        } else if (cakeType === "VEGETABLES") {
            basePrice = id === 'cookieboo' ? 14000 : 11000;
        }

        if (selectedVegetables.includes('SWEET_POTATO')) {
            basePrice += 2000;
        }

        let extra = 0;
        if (selectedVegetables.length === 3) {
            extra = creamType === 'PLANTBASEDMILK' ? 1000 + 3000 : 1000;
        } else if (creamType === 'PLANTBASEDMILK') {
            extra = 3000;
        }
        if (id === 'pawy-1') {
            basePrice += 2000;
        }
        let finalPrice = basePrice + extra;

        if (product.category === 'small') {
            finalPrice = Math.round(finalPrice / 3);
        }

        if (product.category !== 'small' && designType === "CUSTOM_PHOTO") {
            finalPrice += 3000;
        }

        const roundingStep = 500;
        finalPrice = Math.round(finalPrice / roundingStep) * roundingStep;

        setPrice(finalPrice);
    }, [cakeType, selectedAnimal, selectedVegetables, creamType, id, product.category, designType]);

    // Add animation styles
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            @keyframes slideDown {
                from {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
            }
        `;
        document.head.appendChild(style);
        return () => style.remove();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-[#69429a] text-white py-4">
                <div className="container mx-auto px-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>{t("mainPage")}</span>
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
                        <Image
                            src={product.image.src}
                            alt={productName}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-[#69429a] mb-2">
                                {productName}
                            </h1>
                            <p className="text-gray-600 text-xs">{t('cakeDescription')}</p>
                        </div>

                        <div id="error-cakeType">
                            <p className="text-lg font-semibold text-[#69429a] mb-3">
                                {t("choosemaincake")}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        setCakeType("MEAT");
                                        clearFieldError('cakeType');
                                        setSelectedVegetables(['POTATO', 'CARROT']);

                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${cakeType === "MEAT"
                                        ? "bg-[#ef4f27] text-white border-[#ef4f27] shadow-md scale-105"
                                        : "bg-white text-[#ef4f27] border-[#ef4f27] hover:bg-[#ffece7]"
                                        }`}
                                >
                                    🍖 {t("MEAT")}
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedVegetables(['BANANA', 'APPLE']);
                                        setCakeType("FRUIT");
                                        clearFieldError('cakeType');
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${cakeType === "FRUIT"
                                        ? "bg-[#f4a2c6] text-white border-[#f4a2c6] shadow-md scale-105"
                                        : "bg-white text-[#f4a2c6] border-[#f4a2c6] hover:bg-[#fff0f6]"
                                        }`}
                                >
                                    🍓 {t("FRUIT")}
                                </button>

                                <button
                                    onClick={() => {
                                        setCakeType("VEGETABLES");
                                        clearFieldError('cakeType');
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${cakeType === "VEGETABLES"
                                        ? "bg-[#aed137] text-white border-[#aed137] shadow-md scale-105"
                                        : "bg-white text-[#aed137] border-[#aed137] hover:bg-[#f0f8d0]"
                                        }`}
                                >
                                    🥬 {t("VEGETABLES")}
                                </button>
                            </div>
                            {errors.cakeType && (
                                <p className="text-red-500 text-sm mt-2">{errors.cakeType}</p>
                            )}
                        </div>

                        {cakeType === 'MEAT' && (
                            <div id="error-selectedAnimal">
                                <p className="text-lg font-semibold text-[#69429a] mb-3">
                                    {t('chooseMeatType')}
                                </p>
                                <div>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { key: "CHICKEN", label: t("chicken"), emoji: "🐔", color: "#F44336" },
                                            { key: "BEEF", label: t("beef"), emoji: "🐄", color: "#8B4513" },
                                            { key: "LAMB", label: t("lamb"), emoji: "🐑", color: "#FF8C00" },
                                            { key: "TURKEY", label: t("turkey"), emoji: "🦃", color: "#DAA520" },
                                        ].map((veg) => {
                                            const isSelected = selectedAnimal === veg.key
                                            return (
                                                <button
                                                    key={veg.key}
                                                    onClick={() => {
                                                        setSelectedAnimal(veg.key);
                                                        clearFieldError('selectedAnimal');
                                                    }}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all`}
                                                    style={{
                                                        backgroundColor: isSelected ? veg.color : "white",
                                                        color: isSelected ? "white" : veg.color,
                                                        borderColor: veg.color,
                                                    }}
                                                >
                                                    {veg.emoji} {veg.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.selectedAnimal && (
                                        <p className="text-red-500 text-sm mt-2">{errors.selectedAnimal}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div id="error-selectedVegetables">
                            <p className="text-lg font-semibold text-[#69429a] mb-3">
                                {t("chooseIngredients")}
                            </p>
                            <div>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { key: "POTATO", label: t('potato'), emoji: "🥔", color: "#D9A066" },
                                        { key: "CARROT", label: t('carrot'), emoji: "🥕", color: "#FF8C42" },
                                        { key: "BROCCOLI", label: t('broccoli'), emoji: "🥦", color: "#4CAF50" },
                                        { key: "PUMPKIN", label: t('pumpkin'), emoji: "🎃", color: "#FFA500" },
                                        { key: "PEPPER", label: t('greenPepper'), emoji: "🫑", color: "#00C853" },
                                        { key: "ZUCCHINI", label: t('zucchini'), emoji: "🥒", color: "#76C043" },
                                        { key: "CAULIFLOWER", label: t('cauliflower'), emoji: "🥬", color: "#B0BEC5" },
                                        { key: "SWEET_POTATO", label: t('sweetPotato'), emoji: "🍠", color: "#FF5722" },
                                        { key: "SPINACH", label: t('spinach'), emoji: "🥬", color: "#2E7D32" },
                                        { key: "RICE", label: t('rice'), emoji: "🍚", color: "#B0BEC5" },
                                        { key: "WHEAT", label: t('wheat'), emoji: "🌾", color: "#D9A066" },
                                        { key: "OATS", label: t('oats'), emoji: "🥣", color: "#FFB74D" },
                                        { key: "APPLE", label: t('apple'), emoji: "🍎", color: "#FF4D4D", type: 'FRUIT' },
                                        { key: "BANANA", label: t('banana'), emoji: "🍌", color: "#FFE135", type: 'FRUIT' },
                                        { key: "PEAR", label: t('pear'), emoji: "🍐", color: "#A2D149", type: 'FRUIT' },
                                        { key: "ELDERBERRY", label: t('elderberry'), emoji: "🫐", color: "#6A0DAD", type: 'FRUIT' },
                                        { key: "STRAWBERRY", label: t('strawberry'), emoji: "🍓", color: "#FF1654", type: 'FRUIT' },
                                        { key: "MANGO", label: t('mango'), emoji: "🥭", color: "#FFB347", type: 'FRUIT' },
                                    ].map((veg) => {
                                        const isSelected = selectedVegetables.includes(veg.key);
                                        const showIngredient = (cakeType === 'FRUIT' && veg.type === 'FRUIT') ||
                                            (cakeType !== 'FRUIT' && veg.type !== 'FRUIT');

                                        if (!showIngredient) return null;

                                        return (
                                            <button
                                                key={veg.key}
                                                onClick={() => handleVegetableToggle(veg.key)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all`}
                                                style={{
                                                    backgroundColor: isSelected ? veg.color : "white",
                                                    color: isSelected ? "white" : veg.color,
                                                    borderColor: veg.color,
                                                }}
                                            >
                                                {veg.emoji} {veg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.selectedVegetables && (
                                    <p className="text-red-500 text-sm mt-2">{errors.selectedVegetables}</p>
                                )}
                            </div>
                        </div>

                        <div id="error-creamType">
                            <p className="text-lg font-semibold text-[#69429a] mb-3">
                                {t("choosecream")}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        setCreamType("DAIRY");
                                        clearFieldError('creamType');
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${creamType === "DAIRY"
                                        ? "bg-[#1e439b] text-white border-[#1e439b] shadow-md scale-105"
                                        : "bg-white text-[#1e439b] border-[#1e439b] hover:bg-[#e0e7ff]"
                                        }`}
                                >
                                    🐄 {t("DAIRY")}
                                </button>

                                <button
                                    onClick={() => {
                                        setCreamType("PLANTBASEDMILK");
                                        clearFieldError('creamType');
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${creamType === "PLANTBASEDMILK"
                                        ? "bg-[#72bfe9] text-white border-[#72bfe9] shadow-md scale-105"
                                        : "bg-white text-[#72bfe9] border-[#72bfe9] hover:bg-[#e1f5fe]"
                                        }`}
                                >
                                    🥥 {t("PLANTBASEDMILK")}
                                </button>

                                <button
                                    onClick={() => {
                                        setCreamType("PLANTBASED");
                                        clearFieldError('creamType');
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${creamType === "PLANTBASED"
                                        ? "bg-[#008042] text-white border-[#008042] shadow-md scale-105"
                                        : "bg-white text-[#008042] border-[#008042] hover:bg-[#e8f5e9]"
                                        }`}
                                >
                                    🥕 {t("PLANTBASED")}
                                </button>
                            </div>
                            {errors.creamType && (
                                <p className="text-red-500 text-sm mt-2">{errors.creamType}</p>
                            )}
                        </div>

                        {product.category !== 'small' && (
                            <>
                                <div id="error-designType">
                                    <p className="text-lg font-semibold text-[#69429a] mb-3">
                                        {t("chooseDesign")}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => {
                                                setDesignType("STANDARD");
                                                clearFieldError('designType');
                                            }}
                                            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${designType === "STANDARD"
                                                ? "bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-md scale-105"
                                                : "bg-white text-[#8b5cf6] border-[#8b5cf6] hover:bg-[#f3e8ff]"
                                                }`}
                                        >
                                            🎂 {t("standardDesign")}
                                        </button>

                                        <button
                                            onClick={() => {
                                                setDesignType("CUSTOM_PHOTO");
                                                clearFieldError('designType');
                                            }}
                                            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${designType === "CUSTOM_PHOTO"
                                                ? "bg-[#fb7185] text-white border-[#fb7185] shadow-md scale-105"
                                                : "bg-white text-[#fb7185] border-[#fb7185] hover:bg-[#ffe4e6]"
                                                }`}
                                        >
                                            📸 {t("customMyDogPhotoDesign")}
                                        </button>

                                        <button
                                            onClick={() => {
                                                setDesignType("NAME_TEXT");
                                                clearFieldError('designType');
                                            }}
                                            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${designType === "NAME_TEXT"
                                                ? "bg-[#4ade80] text-white border-[#4ade80] shadow-md scale-105"
                                                : "bg-white text-[#4ade80] border-[#4ade80] hover:bg-[#ecfdf5]"
                                                }`}
                                        >
                                            ✏️ {t('petName')}
                                        </button>

                                        <button
                                            onClick={() => {
                                                setDesignType("CUSTOM_TEXT");
                                                clearFieldError('designType');
                                            }}
                                            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${designType === "CUSTOM_TEXT"
                                                ? "bg-[#facc15] text-white border-[#facc15] shadow-md scale-105"
                                                : "bg-white text-[#facc15] border-[#facc15] hover:bg-[#fff9db]"
                                                }`}
                                        >
                                            ✏️ {t("customDesign")}
                                        </button>
                                    </div>
                                    {errors.designType && (
                                        <p className="text-red-500 text-sm mt-2">{errors.designType}</p>
                                    )}
                                </div>

                                {designType === "NAME_TEXT" && (
                                    <div id="error-petName">
                                        <p className="text-lg font-semibold text-[#69429a] mb-3">
                                            {t("petNameLabel")}
                                        </p>
                                        <input
                                            type="text"
                                            value={petName}
                                            onChange={(e) => {
                                                setPetName(e.target.value);
                                                if (e.target.value.trim()) {
                                                    clearFieldError('petName');
                                                }
                                            }}
                                            placeholder={t("petNameLabel")}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] ${errors.petName ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.petName && (
                                            <p className="text-red-500 text-sm mt-2">{errors.petName}</p>
                                        )}
                                    </div>
                                )}

                                {/* {designType === "CUSTOM_PHOTO" && (
                                    <div id="error-customImage">
                                        <p className="text-lg font-semibold text-[#69429a] mb-3">
                                            {t("uploadPetPhoto")}
                                        </p>
                                        {!customImage ? (
                                            <label className={`flex flex-col items-center justify-center w-[40%] aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${errors.customImage ? 'border-red-500' : 'border-gray-300'}`}>
                                                <div className="flex flex-col items-center justify-center">
                                                    <Upload className="w-4 h-4 text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-500">
                                                        {t("clickToUpload")}
                                                    </p>
                                                </div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                />
                                            </label>
                                        ) : (
                                            <div className="relative w-[40%] aspect-square rounded-lg overflow-hidden border-2 border-[#69429a] bg-gray-50">
                                                <Image
                                                    src={customImage}
                                                    alt="Uploaded pet photo"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <button
                                                    onClick={removeImage}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors z-10"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                        {errors.customImage && (
                                            <p className="text-red-500 text-sm mt-2">{errors.customImage}</p>
                                        )}
                                    </div>
                                )} */}

                                {designType === "CUSTOM_TEXT" && (
                                    <div id="error-customText">
                                        <p className="text-lg font-semibold text-[#69429a] mb-3">
                                            {t("enterCustomText")}
                                        </p>
                                        <textarea
                                            value={customText}
                                            onChange={(e) => {
                                                setCustomText(e.target.value);
                                                if (e.target.value.trim()) {
                                                    clearFieldError('customText');
                                                }
                                            }}
                                            placeholder={t("enterCustomText")}
                                            rows={3}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] resize-none ${errors.customText ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.customText && (
                                            <p className="text-red-500 text-sm mt-2">{errors.customText}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t("maxCharacters")} {customText.length}/50
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        <div id="error-phoneNumber">
                            <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                                <Phone className="w-5 h-5" />
                                {t("phoneNumber")}
                            </p>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => {
                                    setPhoneNumber(e.target.value);
                                    if (e.target.value.trim()) {
                                        clearFieldError('phoneNumber');
                                    }
                                }}
                                placeholder={t("enterPhoneNumber")}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            />
                            {errors.phoneNumber && (
                                <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>
                            )}
                        </div>

                        <div id="error-deliveryDate">
                            <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                {t("deliveryDate")}
                            </p>

                            <div className="relative">
                                <input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={(e) => {
                                        setDeliveryDate(e.target.value);
                                        if (e.target.value) {
                                            clearFieldError('deliveryDate');
                                        }
                                    }}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    className={`w-full h-10 px-3 pr-3 text-sm appearance-none bg-white border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] ${errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    required
                                />
                            </div>

                            {errors.deliveryDate && (
                                <p className="text-red-500 text-sm mt-2">{errors.deliveryDate}</p>
                            )}
                        </div>

                        <div id="error-deliveryAddress">
                            <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                {t("deliveryAddress")}
                            </p>
                            <textarea
                                value={deliveryAddress}
                                onChange={(e) => {
                                    setDeliveryAddress(e.target.value);
                                    if (e.target.value.trim().length >= 5) {
                                        clearFieldError('deliveryAddress');
                                    }
                                }}
                                placeholder={t("enterDeliveryAddress")}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] resize-none ${errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            />
                            {errors.deliveryAddress && (
                                <p className="text-red-500 text-sm mt-2">{errors.deliveryAddress}</p>
                            )}
                        </div>

                        <div id="error-deliveryTime">
                            <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                {t("preferredDeliveryTime")}
                            </p>
                            <select
                                value={deliveryTime}
                                onChange={(e) => {
                                    setDeliveryTime(e.target.value);
                                    if (e.target.value) {
                                        clearFieldError('deliveryTime');
                                    }
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#69429a] focus:ring-1 focus:ring-[#69429a] ${errors.deliveryTime ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">{t("selectDeliveryTime")}</option>
                                <option value="09:00-12:00">09:00 - 12:00</option>
                                <option value="12:00-15:00">12:00 - 15:00</option>
                                <option value="15:00-18:00">15:00 - 18:00</option>
                                <option value="18:00-21:00">18:00 - 21:00</option>
                                <option value="21:00-24:00">21:00 - 24:00</option>
                            </select>
                            {errors.deliveryTime && (
                                <p className="text-red-500 text-sm mt-2">{errors.deliveryTime}</p>
                            )}
                        </div>

                        <div id="error-paymentMethod">
                            <p className="text-lg font-semibold text-[#69429a] mb-3 flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                {t("paymentMethod")}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        setPaymentMethod("cash");
                                        clearFieldError('paymentMethod');
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${paymentMethod === "cash"
                                        ? "bg-[#10b981] text-white border-[#10b981] shadow-md scale-105"
                                        : "bg-white text-[#10b981] border-[#10b981] hover:bg-[#d1fae5]"
                                        }`}
                                >
                                    💵 {t("cash")}
                                </button>

                                <button
                                    onClick={() => {
                                        setPaymentMethod("bankTransfer");
                                        clearFieldError('paymentMethod');
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${paymentMethod === "bankTransfer"
                                        ? "bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-md scale-105"
                                        : "bg-white text-[#8b5cf6] border-[#8b5cf6] hover:bg-[#ede9fe]"
                                        }`}
                                >
                                    🏦 {t("bankTransfer")}
                                </button>
                            </div>
                            {errors.paymentMethod && (
                                <p className="text-red-500 text-sm mt-2">{errors.paymentMethod}</p>
                            )}
                        </div>

                        <div>
                            <p className="text-lg font-semibold text-[#69429a] mb-3">
                                {language === "en" ? "Quantity" : language === "ru" ? "Количество" : language === "pl" ? "Ilość" : "Քանակ"}
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-full bg-[#69429a] text-white font-bold text-xl flex items-center justify-center cursor-pointer hover:bg-[#5a3a85] transition-colors"
                                >
                                    -
                                </button>
                                <span className="text-2xl font-bold text-[#69429a] w-12 text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-full bg-[#69429a] text-white font-bold text-xl flex items-center justify-center cursor-pointer hover:bg-[#5a3a85] transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div style={{
                            position: 'sticky',
                            bottom: '20px',
                            zIndex: 50,
                            marginTop: 'auto',
                            backgroundColor: 'white',
                            borderRadius: '1rem',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            padding: '1rem',
                            border: '1px solid rgba(105, 66, 154, 0.1)'
                        }}>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-3xl font-bold text-[#69429a]">
                                        {price * quantity} {t("currency")}
                                        <sup className="text-sm font-normal text-gray-400 ml-1">*</sup>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-dashed border-gray-200 flex items-start gap-1">
                                <span className="text-[#69429a] text-sm font-bold">*</span>
                                <span className="text-xs text-gray-400">
                                    {t("priceDependsOnComponentsAndDesign")}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleWhatsAppOrder}
                            disabled={isSending}
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#69429a] text-white font-semibold rounded-xl hover:bg-[#aed137] transition-colors text-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {t("sending") || "Sending..."}
                                </>
                            ) : (
                                <>
                                    {/* <MessageCircle className="w-6 h-6" /> */}
                                    {t("orderNow")}
                                </>
                            )}
                        </button>

                        <p className="mt-2 text-gray-700 italic text-sm">
                            🏠 {t('freeDeliveryHint')}
                        </p>

                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold text-[#69429a] mb-3">
                                {t('productInfo')}
                            </h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className="text-[#aed137]">✓</span>
                                    {t('safeIngredients')}
                                </li>

                                <li className="flex items-center gap-2">
                                    <span className="text-[#aed137]">✓</span>
                                    {t('freshDaily2')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#aed137]">✓</span>
                                    {t('madeWithLove')}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getProductById(id: string): Product | undefined {
    return PRODUCTS.find((product) => product.id === id)
}