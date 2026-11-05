"use client";
import { use, useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useCart } from "@/components/cart-context";
import { CartDrawer } from "@/components/CartDrawer";
import { getCatalogCake, type CatalogCake } from "@/lib/catalog-cakes";
import { CATALOG_CAKE_PLACEHOLDER, calculateCatalogCakePrice, toggleCakeIngredient,
  type CakeConfiguration, type CakeDesign } from "@/lib/cake-config";

type CakeType = CakeConfiguration["cakeType"];
type CreamType = CakeConfiguration["creamType"];
type ValidationErrors = Partial<Record<"cakeType"|"creamType"|"selectedVegetables"|"selectedAnimal"|"designType"|"petName"|"customImage"|"customText",string>>;
const formatMoney = (amount:number) => new Intl.NumberFormat("hy-AM",{style:"currency",currency:"AMD",maximumFractionDigits:2}).format(amount);

export default function ProductPage({ params }: { params: Promise<{ id:string }> }) {
  const {id} = use(params);
  const route = useParams();
  const locale = typeof route.locale === "string" ? route.locale : "hy";
  const { t, language } = useLanguage();
  const { addToCart, getItemCount } = useCart();
  const [product,setProduct] = useState<CatalogCake|null>(null);
  const [loadedId,setLoadedId] = useState<string|null>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  const [isCartOpen,setIsCartOpen] = useState(false);
  const [cakeType,setCakeType] = useState<CakeType>("MEAT");
  const [creamType,setCreamType] = useState<CreamType>("DAIRY");
  const [quantity,setQuantity] = useState(1);
  const [selectedVegetables,setSelectedVegetables] = useState<string[]>(["POTATO","CARROT"]);
  const [selectedAnimal,setSelectedAnimal] = useState("CHICKEN");
  const [designType,setDesignType] = useState<CakeDesign|"">("");
  const [customImage,setCustomImage] = useState<string|null>(null);
  const [customText,setCustomText] = useState("");
  const [petName,setPetName] = useState("");
  const [errors,setErrors] = useState<ValidationErrors>({});
  const [adding,setAdding] = useState(false);
  const [failedImage,setFailedImage] = useState<string|null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedId = useRef<string|null>(null);
  const lastTrackedId = useRef<string|null>(null);
  const addLock = useRef(false);
  const fileVersion = useRef(0);

  useEffect(()=>{
    let controller:AbortController|null=null;
    async function loadProduct(){
      controller?.abort(); const current = new AbortController();controller=current;
      setLoading(true);setError(null);
      try {
        const found=await getCatalogCake(id,current.signal);
        if(current.signal.aborted)return;
        setProduct(found);setLoadedId(id);
        if(found){
          if(initializedId.current!==id){
            initializedId.current=id; fileVersion.current+=1;
            setCakeType("MEAT");setSelectedAnimal("CHICKEN");setSelectedVegetables(["POTATO","CARROT"]);
            setQuantity(1);setCustomText("");setPetName("");setCustomImage(null);setErrors({});
            setDesignType(found.designs[0]);setCreamType(found.cream?"DAIRY":"");setFailedImage(null);
          }else{
            setDesignType(previous=>found.designs.includes(previous as CakeDesign)?previous:found.designs[0]);
            setCreamType(previous=>found.cream?(previous||"DAIRY"):"");
          }
        }
      }catch(error){if(!current.signal.aborted){setProduct(null);setError(error instanceof Error?error.message:"Տորթը չհաջողվեց բեռնել։");setLoadedId(id);}}
      finally{if(!current.signal.aborted)setLoading(false);}
    }
    const refresh=()=>{void loadProduct();};refresh();window.addEventListener("focus",refresh);
    return()=>{controller?.abort();fileVersion.current+=1;window.removeEventListener("focus",refresh);};
  },[id]);

  useEffect(()=>{
    if(!product||lastTrackedId.current===product.id)return;
    lastTrackedId.current=product.id;
    void fetch("/api/catalog-cake-view",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({productName:product.name,imageSrc:product.image})}).catch(()=>{});
  },[product]);

  const price=product?calculateCatalogCakePrice(product,{cakeType,creamType,selectedVegetables,selectedAnimal,designType}):0;
  const productName=product?.name||"";
  const clearFieldError=(field:keyof ValidationErrors)=>setErrors(previous=>({...previous,[field]:undefined}));
  function changeCakeType(type:CakeType){
    setCakeType(type);setSelectedVegetables(type==="FRUIT"?["BANANA","APPLE"]:["POTATO","CARROT"]);
    clearFieldError("cakeType");clearFieldError("selectedVegetables");
  }
  function handleVegetableToggle(key:string){
    setSelectedVegetables(previous=>toggleCakeIngredient(previous,key));clearFieldError("selectedVegetables");
  }
  function handleImageUpload(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size===0||file.size>10*1024*1024){
      setErrors(previous=>({...previous,customImage:t("invalidFileType")||"Ընտրիր JPG, PNG կամ WebP նկար՝ մինչև 10 MB։"}));event.target.value="";return;
    }
    const version=++fileVersion.current;const reader=new FileReader();
    reader.onload=()=>{if(version===fileVersion.current){setCustomImage(String(reader.result));clearFieldError("customImage");}};
    reader.onerror=()=>{if(version===fileVersion.current)setErrors(previous=>({...previous,customImage:"Նկարը չհաջողվեց կարդալ։"}));};
    reader.readAsDataURL(file);
  }
  function validateForm(){
    const next:ValidationErrors={};
    if(!cakeType)next.cakeType=t("cakeTypeRequired");
    if(product?.cream&&!creamType)next.creamType=t("creamTypeRequired");
    if(!selectedVegetables.length)next.selectedVegetables=t("ingredientsRequired");
    if(cakeType==="MEAT"&&!selectedAnimal)next.selectedAnimal=t("meatTypeRequired");
    if(!product?.designs.includes(designType as CakeDesign))next.designType=t("designTypeRequired");
    if(designType==="NAME_TEXT"&&!petName.trim())next.petName=t("petNameLabel");
    if(designType==="CUSTOM_TEXT"&&!customText.trim())next.customText=t("customTextRequired");
    if(designType==="CUSTOM_PHOTO"&&!customImage)next.customImage=t("uploadPetPhoto");
    setErrors(next);
    const first=Object.keys(next)[0];
    if(first){document.getElementById(`error-${first}`)?.scrollIntoView({behavior:"smooth",block:"center"});return false;}
    return true;
  }
  async function addToCartHandler(){
    if(!product||addLock.current||!validateForm())return;
    if(!Number.isSafeInteger(quantity)||quantity<1||quantity>10000)return;
    addLock.current=true;setAdding(true);
    try{
      const latest=await getCatalogCake(product.id);
      if(!latest){setProduct(null);return;}
      if(JSON.stringify(latest)!==JSON.stringify(product)){
        setProduct(latest);setDesignType(previous=>latest.designs.includes(previous as CakeDesign)?previous:latest.designs[0]);
        setCreamType(previous=>latest.cream?(previous||"DAIRY"):"");
        alert("Տորթի տվյալները թարմացվել են։ Ստուգիր նոր գինն ու ընտրանքները և կրկին ավելացրու զամբյուղ։");return;
      }
      addToCart({id:product.id,name:product.name,image:product.image,price,quantity,options:{
        cakeType,creamType:product.cream?creamType:"",selectedVegetables:[...selectedVegetables],
        selectedAnimal:cakeType==="MEAT"?selectedAnimal:undefined,designType,
        customImage:designType==="CUSTOM_PHOTO"?customImage:null,
        customText:designType==="CUSTOM_TEXT"?customText.trim():designType==="STANDARD"?product.standardText:"",
        petName:designType==="NAME_TEXT"?petName.trim():"",cakeSize:product.category,basePrice:product.price,
      }});
      setIsCartOpen(true);
    }catch(error){alert(error instanceof Error?error.message:"Ապրանքը չհաջողվեց ավելացնել։");}
    finally{addLock.current=false;setAdding(false);}
  }
  if(loading||loadedId!==id)return <div role="status" className="flex min-h-screen items-center justify-center text-[#69429a]">{t("loading")||"Բեռնվում է…"}</div>;
  if(error)return <div role="alert" className="p-10 text-center"><p className="text-red-600">{error}</p><button onClick={()=>location.reload()} className="mt-4 rounded-xl bg-[#69429a] px-5 py-3 text-white">Կրկին փորձել</button></div>;
  if(!product)return notFound();

  // ========== JSX ==========
  return (
    <div className="min-h-screen bg-gray-50">
      <Link href={`/${locale}`} className="block w-full bg-[#69429a]">
        <div className="bg-[#69429a] text-white py-4">
          <div className="container mx-auto px-4 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span>{t("mainPage")}</span>
          </div>
        </div>
      </Link>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left column: Product image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
            <Image
              src={failedImage === product.image ? CATALOG_CAKE_PLACEHOLDER : product.image}
              unoptimized
              sizes="(max-width:768px) 100vw, 50vw"
              onError={()=>setFailedImage(product.image)}
              alt={productName}
              fill
              className="object-cover"
            />
          </div>

          {/* Right column: Full customization form */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#69429a] mb-2">{productName}</h1>
              <p className="text-gray-600 text-xs">{product.description || t("cakeDescription")}</p>
              <p className="mt-3 text-sm font-medium text-[#69429a]">{product.category === "small" ? t("mini") : product.category === "midi" ? t("midi") : t("standard")}</p>
            </div>

            {/* Cake Type */}
            <div id="error-cakeType">
              <p className="text-lg font-semibold text-[#69429a] mb-3">{t("choosemaincake")}</p>
              <div className="flex flex-wrap gap-3">
                <button disabled={adding} onClick={() => { changeCakeType("MEAT"); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${cakeType === "MEAT" ? "bg-[#ef4f27] text-white border-[#ef4f27] shadow-md scale-105" : "bg-white text-[#ef4f27] border-[#ef4f27] hover:bg-[#ffece7]"}`}>🍖 {t("MEAT")}</button>
                <button disabled={adding} onClick={() => { changeCakeType("FRUIT"); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${cakeType === "FRUIT" ? "bg-[#f4a2c6] text-white border-[#f4a2c6] shadow-md scale-105" : "bg-white text-[#f4a2c6] border-[#f4a2c6] hover:bg-[#fff0f6]"}`}>🍓 {t("FRUIT")}</button>
                <button disabled={adding} onClick={() => { changeCakeType("VEGETABLES"); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${cakeType === "VEGETABLES" ? "bg-[#aed137] text-white border-[#aed137] shadow-md scale-105" : "bg-white text-[#aed137] border-[#aed137] hover:bg-[#f0f8d0]"}`}>🥬 {t("VEGETABLES")}</button>
              </div>
              {errors.cakeType && <p className="text-red-500 text-sm mt-2">{errors.cakeType}</p>}
            </div>

            {/* Meat Type */}
            {cakeType === "MEAT" && (
              <div id="error-selectedAnimal">
                <p className="text-lg font-semibold text-[#69429a] mb-3">{t("chooseMeatType")}</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: "CHICKEN", label: t("chicken"), emoji: "🐔", color: "#F44336" },
                    { key: "BEEF", label: t("beef"), emoji: "🐄", color: "#8B4513" },
                    { key: "LAMB", label: t("lamb"), emoji: "🐑", color: "#FF8C00" },
                    { key: "TURKEY", label: t("turkey"), emoji: "🦃", color: "#DAA520" },
                    { key: "SALMON", label: t("salmon"), emoji: "🐟", color: "#FF6F61" },
                  ].map((veg) => (
                    <button disabled={adding} key={veg.key} onClick={() => { setSelectedAnimal(veg.key); clearFieldError("selectedAnimal"); }} className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all" style={{ backgroundColor: selectedAnimal === veg.key ? veg.color : "white", color: selectedAnimal === veg.key ? "white" : veg.color, borderColor: veg.color }}>{veg.emoji} {veg.label}</button>
                  ))}
                </div>
                {errors.selectedAnimal && <p className="text-red-500 text-sm mt-2">{errors.selectedAnimal}</p>}
              </div>
            )}

            {/* Ingredients */}
            <div id="error-selectedVegetables">
              <p className="text-lg font-semibold text-[#69429a] mb-3">{t("chooseIngredients")}</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: "POTATO", label: t("potato"), emoji: "🥔", color: "#D9A066" },
                  { key: "CARROT", label: t("carrot"), emoji: "🥕", color: "#FF8C42" },
                  { key: "BROCCOLI", label: t("broccoli"), emoji: "🥦", color: "#4CAF50" },
                  { key: "PUMPKIN", label: t("pumpkin"), emoji: "🎃", color: "#FFA500" },
                  { key: "PEPPER", label: t("greenPepper"), emoji: "🫑", color: "#00C853" },
                  { key: "ZUCCHINI", label: t("zucchini"), emoji: "🥒", color: "#76C043" },
                  { key: "CAULIFLOWER", label: t("cauliflower"), emoji: "🥬", color: "#B0BEC5" },
                  { key: "SWEET_POTATO", label: t("sweetPotato"), emoji: "🍠", color: "#FF5722" },
                  { key: "SPINACH", label: t("spinach"), emoji: "🥬", color: "#2E7D32" },
                  { key: "RICE", label: t("rice"), emoji: "🍚", color: "#B0BEC5" },
                  { key: "WHEAT", label: t("wheat"), emoji: "🌾", color: "#D9A066" },
                  { key: "OATS", label: t("oats"), emoji: "🥣", color: "#FFB74D" },
                  { key: "APPLE", label: t("apple"), emoji: "🍎", color: "#FF4D4D", type: "FRUIT" },
                  { key: "BANANA", label: t("banana"), emoji: "🍌", color: "#FFE135", type: "FRUIT" },
                  { key: "PEAR", label: t("pear"), emoji: "🍐", color: "#A2D149", type: "FRUIT" },
                  { key: "ELDERBERRY", label: t("elderberry"), emoji: "🫐", color: "#6A0DAD", type: "FRUIT" },
                  { key: "STRAWBERRY", label: t("strawberry"), emoji: "🍓", color: "#FF1654", type: "FRUIT" },
                  { key: "MANGO", label: t("mango"), emoji: "🥭", color: "#FFB347", type: "FRUIT" },
                ].map((veg) => {
                  const isSelected = selectedVegetables.includes(veg.key);
                  const showIngredient = (cakeType === "FRUIT" && veg.type === "FRUIT") || (cakeType !== "FRUIT" && veg.type !== "FRUIT");
                  if (!showIngredient) return null;
                  return (
                    <button disabled={adding} key={veg.key} onClick={() => handleVegetableToggle(veg.key)} className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all" style={{ backgroundColor: isSelected ? veg.color : "white", color: isSelected ? "white" : veg.color, borderColor: veg.color }}>{veg.emoji} {veg.label}</button>
                  );
                })}
              </div>
              {errors.selectedVegetables && <p className="text-red-500 text-sm mt-2">{errors.selectedVegetables}</p>}
            </div>

            {/* Cream Type */}
            {product.cream && <div id="error-creamType">
              <p className="text-lg font-semibold text-[#69429a] mb-3">{t("choosecream")}</p>
              <div className="flex flex-wrap gap-3">
                <button disabled={adding} onClick={() => { setCreamType("DAIRY"); clearFieldError("creamType"); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${creamType === "DAIRY" ? "bg-[#1e439b] text-white border-[#1e439b] shadow-md scale-105" : "bg-white text-[#1e439b] border-[#1e439b] hover:bg-[#e0e7ff]"}`}>🐄 {t("DAIRY")}</button>
                <button disabled={adding} onClick={() => { setCreamType("PLANTBASEDMILK"); clearFieldError("creamType"); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${creamType === "PLANTBASEDMILK" ? "bg-[#72bfe9] text-white border-[#72bfe9] shadow-md scale-105" : "bg-white text-[#72bfe9] border-[#72bfe9] hover:bg-[#e1f5fe]"}`}>🥥 {t("PLANTBASEDMILK")}</button>
                <button disabled={adding} onClick={() => { setCreamType("PLANTBASED"); clearFieldError("creamType"); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${creamType === "PLANTBASED" ? "bg-[#008042] text-white border-[#008042] shadow-md scale-105" : "bg-white text-[#008042] border-[#008042] hover:bg-[#e8f5e9]"}`}>🥕 {t("PLANTBASED")}</button>
              </div>
              {errors.creamType && <p className="text-red-500 text-sm mt-2">{errors.creamType}</p>}
            </div>}

            {/* Only the designs enabled in the administrator are offered. */}
            <div id="error-designType">
              <p className="mb-3 text-lg font-semibold text-[#69429a]">{t("chooseDesign")}</p>
              <div className="flex flex-wrap gap-3">
                {product.designs.map(key => {
                  const labels: Record<CakeDesign,string> = {STANDARD:t("standardDesign"), CUSTOM_PHOTO:t("customMyDogPhotoDesign"),NAME_TEXT:t("petName"),CUSTOM_TEXT:t("customDesign")};
                  const emoji: Record<CakeDesign,string> = {STANDARD:"🎂",CUSTOM_PHOTO:"📸",NAME_TEXT:"✏️",CUSTOM_TEXT:"✏️"};
                  const selected = designType === key;
                  return <button disabled={adding} key={key} type="button" aria-pressed={selected} onClick={()=>{setDesignType(key);clearFieldError("designType");}}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border border-[#69429a] px-4 py-2 text-sm font-medium transition ${selected?"bg-[#69429a] text-white shadow-md":"bg-white text-[#69429a] hover:bg-purple-50"}`}>
                    {emoji[key]} {labels[key]}
                  </button>;
                })}
              </div>
              {errors.designType && <p className="mt-2 text-sm text-red-500">{errors.designType}</p>}
            </div>
            {designType === "STANDARD" && product.standardText && <p className="rounded-xl bg-purple-50 p-4 text-sm text-[#69429a]">{product.standardText}</p>}
            {designType === "NAME_TEXT" && <div id="error-petName">
              <label htmlFor="pet-name" className="mb-3 block text-lg font-semibold text-[#69429a]">{t("petNameLabel")}</label>
              <input disabled={adding} id="pet-name" type="text" maxLength={100} value={petName} onChange={e=>{setPetName(e.target.value);clearFieldError("petName");}}
                placeholder={t("petNameLabel")} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#69429a] focus:outline-none"/>
              {errors.petName && <p className="mt-2 text-sm text-red-500">{errors.petName}</p>}
            </div>}
            {designType === "CUSTOM_TEXT" && <div id="error-customText">
              <label htmlFor="custom-text" className="mb-3 block text-lg font-semibold text-[#69429a]">{t("enterCustomText")}</label>
              <textarea disabled={adding} id="custom-text" maxLength={2000} rows={3} value={customText} onChange={e=>{setCustomText(e.target.value);clearFieldError("customText");}}
                placeholder={t("enterCustomText")} className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-[#69429a] focus:outline-none"/>
              {errors.customText && <p className="mt-2 text-sm text-red-500">{errors.customText}</p>}
            </div>}
            {designType === "CUSTOM_PHOTO" && <div id="error-customImage">
              <label htmlFor="pet-photo" className="mb-3 block text-lg font-semibold text-[#69429a]">{t("uploadPetPhoto")}</label>
              <input disabled={adding} id="pet-photo" ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="block w-full text-sm"/>
              {customImage && <img src={customImage} alt={t("uploadPetPhoto")} className="mt-3 h-32 w-32 rounded-xl object-cover"/>}
              {errors.customImage && <p className="mt-2 text-sm text-red-500">{errors.customImage}</p>}
            </div>}

            {/* Quantity */}
            <div>
              <p className="text-lg font-semibold text-[#69429a] mb-3">{language === "en" ? "Quantity" : language === "ru" ? "Количество" : language === "pl" ? "Ilość" : "Քանակ"}</p>
              <div className="flex items-center gap-4">
                <button disabled={adding} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-[#69429a] text-white font-bold text-xl flex items-center justify-center cursor-pointer hover:bg-[#5a3a85] transition-colors">-</button>
                <span className="text-2xl font-bold text-[#69429a] w-12 text-center">{quantity}</span>
                <button disabled={adding} onClick={() => setQuantity(previous => Math.min(10000, previous + 1))} className="w-10 h-10 rounded-full bg-[#69429a] text-white font-bold text-xl flex items-center justify-center cursor-pointer hover:bg-[#5a3a85] transition-colors">+</button>
              </div>
            </div>

            {/* Price is based on the administrator's saved price for this size. */}
            <div className="sticky bottom-5 z-30 mt-auto rounded-2xl border border-[#69429a]/10 bg-white p-4 shadow-lg">
              <div className="text-2xl font-bold text-[#69429a]">{t("subtotal")}: {formatMoney(price * quantity)}</div>
              <div className="mt-2 text-3xl font-bold text-[#69429a]">{t("total")}: {formatMoney(price * quantity)}<sup className="ml-1 text-sm font-normal text-gray-400">*</sup></div>
              <div className="mt-3 border-t border-dashed border-gray-200 pt-2 text-xs text-gray-400">* {t("priceDependsOnComponentsAndDesign")}</div>
            </div>
            <button disabled={adding} onClick={()=>void addToCartHandler()} className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#69429a] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#aed137] disabled:cursor-wait disabled:opacity-60">
              {adding ? t("loading") : `🛒 ${t("addToCart") || "Add to Cart"}`}
            </button>

            {/* Product Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#69429a] mb-3">{t("productInfo")}</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2"><span className="text-[#aed137]">✓</span>{t("safeIngredients")}</li>
                <li className="flex items-center gap-2"><span className="text-[#aed137]">✓</span>{t("freshDaily2")}</li>
                <li className="flex items-center gap-2"><span className="text-[#aed137]">✓</span>{t("madeWithLove")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      <button disabled={adding} onClick={() => setIsCartOpen(true)} className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg transition z-50 flex items-center justify-center" style={{ backgroundColor: "#69429a" }}>
        <ShoppingCart className="h-6 w-6" />
        {getItemCount() > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{getItemCount()}</span>}
      </button>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}