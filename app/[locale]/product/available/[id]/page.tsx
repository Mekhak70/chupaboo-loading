"use client";

import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Upload,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { useLanguage } from "@/components/language-provider";
import { CartDrawer } from "@/components/CartDrawer";

// ======================================================
// TYPES
// ======================================================

type CreamType =
  | "DAIRY"
  | "PLANTBASEDMILK"
  | "PLANTBASED"
  | "";

type DesignType =
  | "STANDARD"
  | "CUSTOM_PHOTO"
  | "CUSTOM_TEXT"
  | "NAME_TEXT"
  | "";

type PaymentMethod = "cash" | "CARD" | "bankTransfer" | "";

type DeliveryOption = "delivery" | "pickup";

interface Product {
  size?: string;
  id: string;
  name: string;
  price: number;
  image: string;
  ingredients: string;
  stock: number;
  cream: boolean;
  photo: boolean;
}

interface ProductOptions {
  creamType?: CreamType;
  designType?: DesignType;
  customImage?: string | null;
  customText?: string;
  petName?: string;
  ingredient?: string;
}

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

// ======================================================
// PLACEHOLDER
// ======================================================

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%23f3f4f6'/%3E%3Ctext x='300' y='300' font-family='Arial' font-size='22' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

// ======================================================
// COMPONENT
// ======================================================

export default function ProductPage() {
  const { locale, id } = useParams<{
    locale: string;
    id: string;
  }>();

  const { addToCart, getItemCount } = useCart();
  const { t, language } = useLanguage();

  // ======================================================
  // STATES
  // ======================================================

  const [product, setProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [added, setAdded] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [quantity, setQuantity] = useState(1);

  // Cream
  const [creamType, setCreamType] = useState<CreamType>("DAIRY");

  // Design
  const [designType, setDesignType] =
    useState<DesignType>("STANDARD");

  // Custom design
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageFile, setCustomImageFile] =
    useState<File | null>(null);

  const [customText, setCustomText] = useState("");

  const [petName, setPetName] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Order info
  const [orderInfo] = useState<OrderInfo>({
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

  // ======================================================
  // LOAD PRODUCT
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setLoadError("");
      setProduct(null);
      setAdded(false);
      setQuantity(1);
      setCustomImage(null);
      setCustomImageFile(null);
      setCustomText("");
      setPetName("");
      setDesignType("STANDARD");
      try {
        const { data: item, error } = await supabase
          .from("catalog_products")
          .select("*")
          .eq("id", id)
          .eq("section", "available")
          .eq("is_active", true)
          .gt("stock_quantity", 0)
          .maybeSingle();

        if (error) throw error;
        if (cancelled || !item) return;

        const path = String(item.image_path ?? "");
        const image = /^https?:\/\//i.test(path)
          ? path
          : path
            ? supabase.storage.from("catalog-images").getPublicUrl(path).data.publicUrl
            : PLACEHOLDER_IMAGE;
        const size = String(item.cake_size ?? "").trim().toLowerCase();
        const formattedProduct: Product = {
          id: String(item.id),
          name: item.name || "Ապրանք",
          price: Number(item.price ?? 0),
          image,
          ingredients: item.ingredients || "Բաղադրությունը նշված չէ",
          stock: Math.max(0, Number(item.stock_quantity ?? 0)),
          cream: Boolean(item.has_cream),
          photo: Array.isArray(item.design_types) && item.design_types.includes("CUSTOM_PHOTO"),
          size: size === "mini" ? "small" : size,
        };
        setProduct(formattedProduct);
        setCreamType(formattedProduct.cream ? "DAIRY" : "");
      } catch (error) {
        console.error("Load catalog product error:", error);
        if (!cancelled) {
          setProduct(null);
          setLoadError("Ապրանքը չհաջողվեց բեռնել։ Խնդրում ենք թարմացնել էջը։");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProduct();
    return () => { cancelled = true; };
  }, [id]);

  // ======================================================
  // PRICE
  // ======================================================
  console.log(product, "product --- 999");  

  const getFinalPrice = () => {
    if (!product) return 0;

    let finalPrice = product.price;

    // Custom photo
    if (
      designType === "CUSTOM_PHOTO"
    ) {
      finalPrice += 5000;
    }
if(creamType === "PLANTBASEDMILK") {
  finalPrice += product.size  === 'small' ? 1000 : 2000;

}
    

    return finalPrice;
  };

  const finalPrice = getFinalPrice();

  const totalPrice =
    finalPrice * quantity;

  // ======================================================
  // FILE UPLOAD
  // ======================================================

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Max 10MB
    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        t("fileTooLarge") ||
          "Ֆայլը շատ մեծ է։ Առավելագույնը 10MB։"
      );

      return;
    }

    // Only images
    if (!file.type.startsWith("image/")) {
      alert(
        t("invalidFileType") ||
          "Խնդրում ենք ընտրել նկար։"
      );

      return;
    }

    setCustomImageFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setCustomImage(
        reader.result as string
      );
    };

    reader.readAsDataURL(file);
  };

  // ======================================================
  // REMOVE IMAGE
  // ======================================================

  const removeCustomImage = () => {
    setCustomImage(null);
    setCustomImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ======================================================
  // CHANGE DESIGN
  // ======================================================

  const handleDesignChange = (
    type: DesignType
  ) => {
    setDesignType(type);

    // Reset data when switching
    if (type !== "CUSTOM_PHOTO") {
      setCustomImage(null);
      setCustomImageFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    if (type !== "CUSTOM_TEXT") {
      setCustomText("");
    }

    if (type !== "NAME_TEXT") {
      setPetName("");
    }
  };

  // ======================================================
  // ADD TO CART
  // ======================================================

  const handleAddToCart = () => {
    if (!product) return;

    // Custom photo requires image
  
    // Custom text requires text
    if (
      designType === "CUSTOM_TEXT" &&
      !customText.trim()
    ) {
      alert(
        t("enterCustomText") ||
          "Խնդրում ենք մուտքագրել տեքստ։"
      );

      return;
    }

    // Name requires name
    if (
      designType === "NAME_TEXT" &&
      !petName.trim()
    ) {
      alert(
        t("petNameLabel") ||
          "Խնդրում ենք մուտքագրել անունը։"
      );

      return;
    }

    const productOptions: ProductOptions = {
      creamType:
        product.cream
          ? creamType
          : "",

      designType:
        product.photo
          ? designType
          : "STANDARD",

      customImage:
        designType === "CUSTOM_PHOTO"
          ? customImage
          : null,

      customText:
        designType === "CUSTOM_TEXT"
          ? customText
          : "",

      petName:
        designType === "NAME_TEXT"
          ? petName
          : "",

      ingredient:
        product.ingredients,
    };

    addToCart({
      id: String(product.id),

      name: product.name,

      price: finalPrice,

      image: product.image,

      quantity,

      options: productOptions,

      ingredient:
        product.ingredients,
    });

    setAdded(true);

    setIsCartOpen(true);
  };

  // ======================================================
  // TODAY
  // ======================================================

  function getTodayDate() {
    const today = new Date();

    today.setDate(
      today.getDate() + 2
    );

    return today
      .toISOString()
      .split("T")[0];
  }

  // ======================================================
  // LANGUAGE
  // ======================================================

  const quantityLabel =
    language === "en"
      ? "Quantity"
      : language === "ru"
      ? "Количество"
      : language === "pl"
      ? "Ilość"
      : "Քանակ";

  // ======================================================
  // LOADING
  // ======================================================

  if (loadError) {
    return (
      <div role="alert" className="container mx-auto px-4 py-12 text-center text-red-600">
        {loadError}
      </div>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#69429a]/20 border-t-[#69429a] rounded-full animate-spin" />

          <p className="text-[#69429a] font-semibold">
            {t("loading") || "Բեռնում..."}
          </p>
        </div>
      </main>
    );
  }

  // ======================================================
  // NOT FOUND
  // ======================================================

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-6">
            📦
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {t("productNotFound") ||
              "Ապրանքը չի գտնվել"}
          </h1>

          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#69429a] px-6 py-3 text-white font-semibold hover:bg-[#7c4fb3] transition"
          >
            <ArrowLeft className="w-5 h-5" />

            {t("backToHome") ||
              "Վերադառնալ"}
          </Link>
        </div>
      </main>
    );
  }

  // ======================================================
  // JSX
  // ======================================================

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ================================================ */}
      {/* TOP */}
      {/* ================================================ */}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() =>
            window.history.back()
          }
          className="inline-flex items-center gap-2 text-[#69429a] font-semibold mb-6 hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />

          {t("backToShop") ||
            "Վերադառնալ խանութ"}
        </button>

        {/* ============================================== */}
        {/* PRODUCT */}
        {/* ============================================== */}

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ============================================ */}
          {/* LEFT - IMAGE */}
          {/* ============================================ */}

          <div className="lg:sticky lg:top-6 h-fit">
            <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden shadow-xl border border-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Stock */}
              <div className="absolute top-5 left-5">
                <span className="inline-flex items-center gap-1.5 bg-[#aed137] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  <Check className="w-4 h-4" />

                  {t("inStock") ||
                    "Առկա է"}
                </span>
              </div>
            </div>

            {/* Product ingredients */}
            
          </div>

          {/* ============================================ */}
          {/* RIGHT */}
          {/* ============================================ */}

          <div className="flex flex-col gap-7">
            {/* Product title */}
            <div>
              <p className="text-sm font-bold text-[#aed137] uppercase tracking-wider mb-2">
                {t("available") ||
                  "Առկա է"}
              </p>

              <h1 className="text-3xl md:text-4xl font-black text-[#69429a]">
                {product.name}
              </h1>
            </div>

            <div className="mt-5 rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <h2 className="text-lg font-bold text-[#69429a] mb-3">
                {t("ingredient") ||
                  "Բաղադրություն"}
              </h2>

              <p className="text-gray-600 leading-7">
                {product.ingredients
                  .split(",")
                  .map(
                    (
                      ingredient: string
                    ) =>
                      t(
                        ingredient.trim()
                      )
                  )
                  .join(", ")}
              </p>

              
            </div>

            {/* ========================================== */}
            {/* CREAM */}
            {/* ========================================== */}

            {product.cream && (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                <p className="text-lg font-bold text-[#69429a] mb-4">
                  {t("choosecream") ||
                    "Ընտրեք կրեմի տեսակը"}
                </p>

                <div className="flex flex-wrap gap-3">
                  {/* Dairy */}
                  <button
                    type="button"
                    onClick={() =>
                      setCreamType(
                        "DAIRY"
                      )
                    }
                    className={`
                      px-4 py-3
                      rounded-full
                      text-sm
                      font-semibold
                      flex
                      items-center
                      gap-2
                      border
                      transition-all
                      ${
                        creamType ===
                        "DAIRY"
                          ? "bg-[#1e439b] text-white border-[#1e439b] shadow-md scale-105"
                          : "bg-white text-[#1e439b] border-[#1e439b] hover:bg-[#e0e7ff]"
                      }
                    `}
                  >
                    🐄

                    {t("DAIRY") ||
                      "Կաթնային"}
                  </button>

                  {/* Plant based milk */}
                  <button
                    type="button"
                    onClick={() =>
                      setCreamType(
                        "PLANTBASEDMILK"
                      )
                    }
                    className={`
                      px-4 py-3
                      rounded-full
                      text-sm
                      font-semibold
                      flex
                      items-center
                      gap-2
                      border
                      transition-all
                      ${
                        creamType ===
                        "PLANTBASEDMILK"
                          ? "bg-[#72bfe9] text-white border-[#72bfe9] shadow-md scale-105"
                          : "bg-white text-[#72bfe9] border-[#72bfe9] hover:bg-[#e1f5fe]"
                      }
                    `}
                  >
                    🥥

                    {t(
                      "PLANTBASEDMILK"
                    ) ||
                      "Բուսական կաթով"}
                  </button>

                  {/* Plant based */}
                  <button
                    type="button"
                    onClick={() =>
                      setCreamType(
                        "PLANTBASED"
                      )
                    }
                    className={`
                      px-4 py-3
                      rounded-full
                      text-sm
                      font-semibold
                      flex
                      items-center
                      gap-2
                      border
                      transition-all
                      ${
                        creamType ===
                        "PLANTBASED"
                          ? "bg-[#008042] text-white border-[#008042] shadow-md scale-105"
                          : "bg-white text-[#008042] border-[#008042] hover:bg-[#e8f5e9]"
                      }
                    `}
                  >
                    🥕
                    {t("PLANTBASED") ||
                      "Բուսական"}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* DESIGN */}
            {/* ========================================== */}

            { (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                <p className="text-lg font-bold text-[#69429a] mb-4">
                  {t("chooseDesign") ||
                    "Ընտրեք դիզայնի տեսակը"}
                </p>

                <div className="flex flex-wrap gap-3">
                  {/* Standard */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDesignChange(
                        "STANDARD"
                      )
                    }
                    className={`
                      px-4 py-3
                      rounded-full
                      text-sm
                      font-semibold
                      flex
                      items-center
                      gap-2
                      border
                      transition-all
                      ${
                        designType ===
                        "STANDARD"
                          ? "bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-md scale-105"
                          : "bg-white text-[#8b5cf6] border-[#8b5cf6] hover:bg-[#f3e8ff]"
                      }
                    `}
                  >
                    🎂

                    {t(
                      "standardDesign"
                    ) ||
                      "Ստանդարտ"}
                  </button>

                  {/* Custom photo */}
                 {product.photo && <button
                    type="button"
                    onClick={() =>
                      handleDesignChange(
                        "CUSTOM_PHOTO"
                      )
                    }
                    className={`
                      px-4 py-3
                      rounded-full
                      text-sm
                      font-semibold
                      flex
                      items-center
                      gap-2
                      border
                      transition-all
                      ${
                        designType ===
                        "CUSTOM_PHOTO"
                          ? "bg-[#fb7185] text-white border-[#fb7185] shadow-md scale-105"
                          : "bg-white text-[#fb7185] border-[#fb7185] hover:bg-[#ffe4e6]"
                      }
                    `}
                  >
                    📸

                    {t(
                      "customMyDogPhotoDesign"
                    ) ||
                      "Իմ նկարը"}
                  </button>}

                  {/* Pet name */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDesignChange(
                        "NAME_TEXT"
                      )
                    }
                    className={`
                      px-4 py-3
                      rounded-full
                      text-sm
                      font-semibold
                      flex
                      items-center
                      gap-2
                      border
                      transition-all
                      ${
                        designType ===
                        "NAME_TEXT"
                          ? "bg-[#4ade80] text-white border-[#4ade80] shadow-md scale-105"
                          : "bg-white text-[#4ade80] border-[#4ade80] hover:bg-[#ecfdf5]"
                      }
                    `}
                  >
                    ✏️

                    {t("petName") ||
                      "Անուն"}
                  </button>

                  {/* Custom text */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDesignChange(
                        "CUSTOM_TEXT"
                      )
                    }
                    className={`
                      px-4 py-3
                      rounded-full
                      text-sm
                      font-semibold
                      flex
                      items-center
                      gap-2
                      border
                      transition-all
                      ${
                        designType ===
                        "CUSTOM_TEXT"
                          ? "bg-[#facc15] text-white border-[#facc15] shadow-md scale-105"
                          : "bg-white text-[#facc15] border-[#facc15] hover:bg-[#fff9db]"
                      }
                    `}
                  >
                    ✏️

                    {t(
                      "customDesign"
                    ) ||
                      "Իմ տեքստը"}
                  </button>
                </div>

                {/* ====================================== */}
                {/* CUSTOM PHOTO */}
                {/* ====================================== */}

                

                {/* ====================================== */}
                {/* CUSTOM TEXT */}
                {/* ====================================== */}

                {designType ===
                  "CUSTOM_TEXT" && (
                  <div className="mt-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t(
                        "enterCustomText"
                      ) ||
                        "Գրեք ձեր տեքստը"}
                    </label>

                    <textarea
                      value={
                        customText
                      }
                      onChange={(e) =>
                        setCustomText(
                          e.target.value
                        )
                      }
                      placeholder={
                        t(
                          "enterCustomText"
                        ) ||
                        "Օր․ Happy Birthday!"
                      }
                      rows={4}
                      maxLength={100}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:border-[#69429a] focus:ring-2 focus:ring-[#69429a]/20"
                    />

                   

                 
                  </div>
                )}

                {/* ====================================== */}
                {/* PET NAME */}
                {/* ====================================== */}

                {designType ===
                  "NAME_TEXT" && (
                  <div className="mt-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t(
                        "petNameLabel"
                      ) ||
                        "Կենդանու անունը"}
                    </label>

                    <input
                      type="text"
                      value={
                        petName
                      }
                      onChange={(e) =>
                        setPetName(
                          e.target.value
                        )
                      }
                      placeholder={
                        t(
                          "petNameLabel"
                        ) ||
                        "Մուտքագրեք անունը"
                      }
                      maxLength={30}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#69429a] focus:ring-2 focus:ring-[#69429a]/20"
                    />

                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl bg-white border border-[#69429a]/10 shadow-lg p-5">
              {/* Base price */}
              <div className="flex items-center justify-between text-gray-500">
                <span>
                  {t("price") ||
                    "Գին"}
                </span>

                <span>
                  {product.price.toLocaleString()}{" "}
                  AMD
                </span>
              </div>

              {/* Cream */}
              {product.cream &&
                creamType && (
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <span>
                      {t(
                        "choosecream"
                      ) ||
                        "Կրեմ"}
                    </span>

                    <span>
                      {t(
                        creamType
                      ) ||
                        creamType}
                    </span>
                  </div>
                )}

              {/* Design */}
              {product.photo &&
                designType &&
                designType !==
                  "STANDARD" && (
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <span>
                      {t(
                        "chooseDesign"
                      ) ||
                        "Դիզայն"}
                    </span>

                    <span>
                      {designType ===
                      "CUSTOM_PHOTO"
                        ? "+5,000 AMD"
                        : designType ===
                          "CUSTOM_TEXT"
                        ? "+2,000 AMD"
                        : "+1,000 AMD"}
                    </span>
                  </div>
                )}

              <div className="border-t border-gray-100 my-4" />

              {/* Unit price */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {t(
                    "unitPrice"
                  ) ||
                    "Մեկ հատի գին"}
                </span>

                <span className="text-xl font-bold text-[#69429a]">
                  {finalPrice.toLocaleString()}{" "}
                  AMD
                </span>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-gray-800">
                  {t("total") ||
                    "Ընդհանուր"}
                </span>

                <span className="text-3xl font-black text-[#69429a]">
                  {totalPrice.toLocaleString()}{" "}
                  AMD
                </span>
              </div>
            </div>

            {/* ========================================== */}
            {/* ADD TO CART */}
            {/* ========================================== */}

            <button
              type="button"
              onClick={
                handleAddToCart
              }
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#69429a] hover:bg-[#7c4fb3] text-white px-6 py-4 text-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all"
            >
              {added ? (
                <>
                  <Check className="w-6 h-6" />

                  {t(
                    "addedToCart"
                  ) ||
                    "Ավելացված է զամբյուղում"}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6" />

                  {t("addToCart") ||
                    "Ավելացնել զամբյուղ"}
                </>
              )}
            </button>

            {/* ========================================== */}
            {/* PRODUCT INFO */}
            {/* ========================================== */}

            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-[#69429a] text-lg mb-4">
                {t(
                  "productInfo"
                ) ||
                  "Ապրանքի մասին"}
              </h3>

              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#aed137]/15 text-[#aed137] flex items-center justify-center font-bold">
                    ✓
                  </span>

                  {t(
                    "safeIngredients"
                  ) ||
                    "Անվտանգ բաղադրիչներ"}
                </li>

                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#aed137]/15 text-[#aed137] flex items-center justify-center font-bold">
                    ✓
                  </span>

                  {t(
                    "freshDaily2"
                  ) ||
                    "Թարմ պատրաստված"}
                </li>

                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#aed137]/15 text-[#aed137] flex items-center justify-center font-bold">
                    ✓
                  </span>

                  {t(
                    "madeWithLove"
                  ) ||
                    "Պատրաստված սիրով"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================ */}
      {/* FLOATING CART */}
      {/* ================================================ */}

      <button
        type="button"
        onClick={() =>
          setIsCartOpen(true)
        }
        className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center p-4 rounded-full text-white shadow-xl transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor:
            "#69429a",
        }}
      >
        <ShoppingCart className="w-6 h-6" />

        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md">
            {cartCount}
          </span>
        )}
      </button>

      {/* ================================================ */}
      {/* CART DRAWER */}
      {/* ================================================ */}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() =>
          setIsCartOpen(false)
        }
        orderInfo={orderInfo}
      />
    </main>
  );
}