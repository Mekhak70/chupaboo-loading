"use client";
import { use, useEffect, useRef, useState, type SetStateAction } from "react";
import { CakeImageSlider } from "@/components/cake-image-slider";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useDonutText } from "@/components/use-donut-text";
import { useLanguage } from "@/components/language-provider";
import { useCart } from "@/components/cart-context";
import { DonutOrderGuide } from "@/components/donut-order-guide";
import { DonutBoxPreview } from "@/components/donut-box-preview";
import { CartDrawer } from "@/components/CartDrawer";
import { getCatalogCake, type CatalogCake } from "@/lib/catalog-cakes";
import { INGREDIENT_ITEMS,ingredientPriceLines,type IngredientKey } from "@/lib/ingredient-pricing";
import { CATALOG_CAKE_PLACEHOLDER, calculateCatalogCakePrice, calculateCatalogDonutBoxPrice, donutPairIndices, toggleCakeIngredient,
  type CakeConfiguration, type CakeDesign } from "@/lib/cake-config";

const newPiece = (cream = true): CakeConfiguration => ({cakeType:"MEAT", creamType:cream?"DAIRY":"", selectedAnimal:"CHICKEN", selectedVegetables:["POTATO","CARROT"], designType:"STANDARD"});
const newBox = (cream = true) => Array.from({length:6},()=>newPiece(cream));
type CakeType = CakeConfiguration["cakeType"];
type CreamType = CakeConfiguration["creamType"];
type ValidationErrors = Partial<Record<"cakeType"|"creamType"|"selectedVegetables"|"selectedAnimal"|"designType"|"petName"|"customText",string>>;
const formatMoney = (amount:number) => new Intl.NumberFormat("hy-AM",{style:"currency",currency:"AMD",maximumFractionDigits:2}).format(amount);

export default function ProductPage({ params }: { params: Promise<{ id:string }> }) {
  const {id} = use(params);
  const route = useParams();
  const locale = typeof route.locale === "string" ? route.locale : "hy";
  const { t, language } = useLanguage();
  const dt = useDonutText();
  const { addToCart, getItemCount } = useCart();
  const [product,setProduct] = useState<CatalogCake|null>(null);
  const [loadedId,setLoadedId] = useState<string|null>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  const [isCartOpen,setIsCartOpen] = useState(false);
  const [pieces,setPieces] = useState<CakeConfiguration[]>(()=>newBox());
  const [boxCount,setBoxCount] = useState(2);
  const visiblePieces=pieces.slice(0,boxCount);
  const [activePiece,setActivePiece] = useState(0);
  const [editingComposition,setEditingComposition]=useState(false);
  const selectedPieces=[activePiece];
  const highlightedPieces=editingComposition?donutPairIndices(activePiece):selectedPieces;
  const {cakeType,creamType,selectedVegetables,selectedAnimal} = pieces[activePiece];
  function patchPiece<K extends keyof CakeConfiguration>(key:K, value:SetStateAction<CakeConfiguration[K]>){
    setEditingComposition(key!=="donutVariantId");
    setPieces(previous=>{
      const nextValue=typeof value === "function" ? (value as (old:CakeConfiguration[K])=>CakeConfiguration[K])(previous[activePiece][key]) : value;
      const targets=product?.productKind === "DONUT_BOX" && key!=="donutVariantId" ? donutPairIndices(activePiece) : [activePiece];
      return previous.map((piece,index)=>targets.includes(index)?{...piece,[key]:Array.isArray(nextValue)?[...nextValue]:nextValue}:piece);
    });
  }
  const setCakeType = (value:SetStateAction<CakeType>)=>patchPiece("cakeType",value);
  const setCreamType = (value:SetStateAction<CreamType>)=>patchPiece("creamType",value);
  const setSelectedVegetables = (value:SetStateAction<string[]>)=>patchPiece("selectedVegetables",value);
  const setSelectedAnimal = (value:SetStateAction<string>)=>patchPiece("selectedAnimal",value);
  const [quantity,setQuantity] = useState(1);
  const [designType,setDesignType] = useState<CakeDesign|"">("");
  const [customText,setCustomText] = useState("");
  const [petName,setPetName] = useState("");
  const [errors,setErrors] = useState<ValidationErrors>({});
  const [adding,setAdding] = useState(false);
  const ingredientsDetailsRef=useRef<HTMLDetailsElement>(null);
  const extrasDetailsRef=useRef<HTMLDetailsElement>(null);
  const initializedId = useRef<string|null>(null);
  const lastTrackedId = useRef<string|null>(null);
  const addLock = useRef(false);

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
            initializedId.current=id;
            setPieces(newBox(found.cream));setEditingComposition(false);setActivePiece(0);setBoxCount(2);
            setQuantity(1);setCustomText("");setPetName("");setErrors({});
            // Admin stores the default design first in the enabled design list.
            setDesignType(found.designs[0]);
          }else{
            setDesignType(previous=>found.designs.includes(previous as CakeDesign)?previous:found.designs[0]);
            setPieces(previous=>previous.map(piece=>({...piece,creamType:found.cream?(piece.creamType||"DAIRY"):""})));
          }
        }
      }catch(error){if(!current.signal.aborted){setProduct(null);setError(error instanceof Error?error.message:dt("loadError"));setLoadedId(id);}}
      finally{if(!current.signal.aborted)setLoading(false);}
    }
    const refresh=()=>{void loadProduct();};refresh();window.addEventListener("focus",refresh);
    return()=>{controller?.abort();window.removeEventListener("focus",refresh);};
  },[id]);

  useEffect(()=>{
    if(!product||lastTrackedId.current===product.id)return;
    lastTrackedId.current=product.id;
    void fetch("/api/catalog-cake-view",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({productName:product.name,imageSrc:product.image})}).catch(()=>{});
  },[product]);

  const isDonutBox = product?.productKind === "DONUT_BOX";
  const effectiveDesign=isDonutBox?"":designType;
  const price=product?(isDonutBox?calculateCatalogDonutBoxPrice(product,visiblePieces,""):calculateCatalogCakePrice(product,{cakeType,creamType,selectedVegetables,selectedAnimal,designType})):0;
  const filledCount=visiblePieces.filter(piece=>product?.donutVariants?.some(variant=>variant.id===piece.donutVariantId)).length;
  const needsAppearances=isDonutBox&&!!product?.donutVariants?.length&&filledCount<boxCount;
  const productName=product?.name||"";
  const clearFieldError=(field:keyof ValidationErrors)=>setErrors(previous=>({...previous,[field]:undefined}));
  function ingredientPriceTag(key:string){
    const prices=product?.ingredientPrices;
    return prices&&key in prices?<span className="ml-1 text-xs font-semibold">{formatMoney(prices[key as IngredientKey])}</span>:null;
  }
  function recipeSummary(piece:CakeConfiguration){
    const keys:Record<string,string>={PEPPER:"greenPepper",SWEET_POTATO:"sweetPotato",CAULIFLOWER:"cauliflower"};
    return [t(piece.cakeType),...(piece.cakeType==="MEAT"?[t(piece.selectedAnimal.toLowerCase())]:[]),...piece.selectedVegetables.map(key=>t(keys[key]??key.toLowerCase())),...(product?.cream?[t(piece.creamType)]:[])].join(" · ");
  }
  function changeCakeType(type:CakeType){
    setCakeType(type);setSelectedVegetables(type==="FRUIT"?["BANANA","APPLE"]:["POTATO","CARROT"]);
    clearFieldError("cakeType");clearFieldError("selectedVegetables");
  }
  function handleVegetableToggle(key:string){
    setSelectedVegetables(previous=>toggleCakeIngredient(previous,key));clearFieldError("selectedVegetables");
  }
  function validateForm(){
    const next:ValidationErrors={};
    if(!cakeType)next.cakeType=t("cakeTypeRequired");
    if(product?.cream&&!creamType)next.creamType=t("creamTypeRequired");
    if(!selectedVegetables.length)next.selectedVegetables=t("ingredientsRequired");
    if(cakeType==="MEAT"&&!selectedAnimal)next.selectedAnimal=t("meatTypeRequired");
    if(!isDonutBox&&!product?.designs.includes(designType as CakeDesign))next.designType=t("designTypeRequired");
    if(!isDonutBox&&designType==="NAME_TEXT"&&!petName.trim())next.petName=t("petNameLabel");
    if(!isDonutBox&&designType==="CUSTOM_TEXT"&&!customText.trim())next.customText=t("customTextRequired");
    if(isDonutBox){
      const missingVariant=(product?.donutVariants?.length??0)>0?visiblePieces.findIndex(piece=>!product!.donutVariants!.some(variant=>variant.id===piece.donutVariantId)):-1;
      if(missingVariant!==-1){setActivePiece(missingVariant);next.selectedVegetables=dt("missingLook",{n:missingVariant+1});document.getElementById("donut-variants")?.scrollIntoView({behavior:"smooth",block:"center"});}
      const invalid=visiblePieces.findIndex(piece=>!piece.cakeType||!piece.selectedVegetables.length||(piece.cakeType==="MEAT"&&!piece.selectedAnimal)||(product?.cream&&!piece.creamType));
      if(invalid!==-1){setActivePiece(invalid);next.selectedVegetables=dt("missingRecipe",{n:invalid+1});}
    }
    setErrors(next);
    const first=Object.keys(next)[0];
    if(first){
      if(isDonutBox){
        const missingAppearance=!!product?.donutVariants?.length&&visiblePieces.some(piece=>!product.donutVariants!.some(variant=>variant.id===piece.donutVariantId));
        if(!missingAppearance&&["cakeType","creamType","selectedVegetables","selectedAnimal"].includes(first)&&ingredientsDetailsRef.current)ingredientsDetailsRef.current.open=true;
        if(["designType","petName","customText"].includes(first)&&extrasDetailsRef.current)extrasDetailsRef.current.open=true;
      }
      document.getElementById(`error-${first}`)?.scrollIntoView({behavior:"smooth",block:"center"});return false;}
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
        alert(dt("updated"));return;
      }
      const composition=isDonutBox?pieces[0]:{cakeType,creamType,selectedVegetables,selectedAnimal};
      addToCart({id:product.id,name:product.name,image:product.image,price,quantity,options:{
        ...(isDonutBox?{productKind:"DONUT_BOX",boxSize:boxCount,donuts:visiblePieces.map(piece=>({...((product.donutVariants?.length??0)>0?{donutVariantId:piece.donutVariantId,donutVariantPrice:product.donutVariants?.find(variant=>variant.id===piece.donutVariantId)?.price??product.price,donutVariantName:product.donutVariants?.find(variant=>variant.id===piece.donutVariantId)?.name,donutVariantImage:product.donutVariants?.find(variant=>variant.id===piece.donutVariantId)?.image}:{}),cakeType:piece.cakeType,creamType:product.cream?piece.creamType:"",selectedVegetables:[...piece.selectedVegetables],selectedAnimal:piece.cakeType==="MEAT"?piece.selectedAnimal:""}))}:{}),
        ...(product.ingredientPrices?{ingredientPriceBreakdown:ingredientPriceLines(product.ingredientPrices,composition,product.cream)}:{}),
        cakeType:composition.cakeType,creamType:product.cream?composition.creamType:"",selectedVegetables:[...composition.selectedVegetables],
        selectedAnimal:composition.cakeType==="MEAT"?composition.selectedAnimal:undefined,designType:effectiveDesign,
        customImage:null,
        customText:effectiveDesign==="CUSTOM_TEXT"?customText.trim():effectiveDesign==="STANDARD"?product.standardText:"",
        petName:effectiveDesign==="NAME_TEXT"?petName.trim():"",cakeSize:product.category,basePrice:product.price,
      }});
      setIsCartOpen(true);
    }catch(error){alert(error instanceof Error?error.message:dt("addError"));}
    finally{addLock.current=false;setAdding(false);}
  }
  if(loading||loadedId!==id)return <div role="status" className="flex min-h-screen items-center justify-center text-[#69429a]">{t("loading")||"Բեռնվում է…"}</div>;
  if(error)return <div role="alert" className="p-10 text-center"><p className="text-red-600">{error}</p><button onClick={()=>location.reload()} className="mt-4 rounded-xl bg-[#69429a] px-5 py-3 text-white">{dt("retry")}</button></div>;
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

      {isDonutBox&&<div className="donut-mobile-preview md:hidden">
        <DonutBoxPreview compact pieces={visiblePieces} activePiece={activePiece} selectedPieces={highlightedPieces} disabled={adding} variants={product.donutVariants??[]} onSelect={index=>{setActivePiece(index);setErrors({});}}/>
      </div>}

      <div className={`container mx-auto px-4 py-8 ${isDonutBox?"donut-mobile-content":""}`}>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left column: Product image */}
          <div className={isDonutBox?"relative hidden md:block self-start rounded-2xl bg-white shadow-lg md:sticky md:top-24":"relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg"}>
            {isDonutBox ? <DonutBoxPreview pieces={visiblePieces} activePiece={activePiece} selectedPieces={highlightedPieces} disabled={adding} variants={product.donutVariants??[]} onSelect={index=>{setActivePiece(index);setErrors({});}}/> : <CakeImageSlider key={[product.id,...(product.images??[])].join("|")} images={product.images?.length?product.images:[product.image]} name={productName}/> }
          </div>

          {/* Right column: Full customization form */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#69429a] mb-2">{productName}</h1>
              <p className="text-gray-600 text-xs">{isDonutBox?dt("intro"):product.description || t("cakeDescription")}</p>
              <p className="mt-3 text-sm font-medium text-[#69429a]">{isDonutBox ? `🍩 ${dt("yourBox")} · ${dt("count",{n:boxCount})}` : product.category === "small" ? t("mini") : product.category === "midi" ? t("midi") : t("standard")}</p>
              {isDonutBox&&<DonutOrderGuide/>}
            </div>

            {isDonutBox && <section className="rounded-2xl border border-purple-100 bg-white p-4">
              <h2 className="font-semibold text-[#69429a]">{dt("chooseQuantity")}</h2>
              <div className="mt-3 flex flex-wrap gap-2" aria-label={dt("quantityLabel")}>
                {[2,4,6].map(count=><button key={count} type="button" disabled={adding} aria-pressed={boxCount===count} onClick={()=>{setBoxCount(count);const next=pieces.slice(0,count).findIndex(piece=>!product.donutVariants?.some(variant=>variant.id===piece.donutVariantId));setActivePiece(next===-1?0:next);setErrors({});}} className={`rounded-xl border px-5 py-3 font-semibold ${boxCount===count?"border-[#69429a] bg-[#69429a] text-white":"border-purple-200 text-[#69429a] hover:bg-purple-50"}`}>{dt("pieces",{n:count})}</button>)}
              </div>

            </section>}

            {isDonutBox && !!product.donutVariants?.length && <section id="donut-variants" className="rounded-2xl border border-purple-100 bg-white p-4">
              <div className="flex items-center justify-between gap-2"><h2 className="font-semibold text-[#69429a]">{dt("chooseLooks")}</h2><span className="text-sm text-gray-500" aria-live="polite">{filledCount}/{boxCount}</span></div>
              <div className="mt-3 flex gap-2" aria-label={dt("slots")}>
                {visiblePieces.map((piece,index)=>{const variant=product.donutVariants?.find(item=>item.id===piece.donutVariantId);return <button key={index} type="button" disabled={adding} aria-label={`${dt("donut",{n:index+1})}: ${variant?variant.name:dt("selectLook")}`} aria-pressed={activePiece===index} onClick={()=>{setEditingComposition(false);setActivePiece(index);}} className={`flex h-12 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl border text-sm ${activePiece===index?"border-[#69429a] bg-purple-50 ring-1 ring-[#69429a]":"border-purple-100"}`}>
                  {variant?<img src={variant.image} alt="" className="h-8 w-8 object-contain"/>:<span>🍩</span>}<span>{index+1}</span>
                </button>})}
              </div>
              <p className="mt-3 text-sm text-[#69429a]" aria-live="polite">{needsAppearances?dt("clickLook",{n:activePiece+1}):dt("allSelected",{n:boxCount})}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {product.donutVariants.map(variant=><button key={variant.id} type="button" disabled={adding} aria-pressed={selectedPieces.every(index=>pieces[index].donutVariantId===variant.id)} onClick={()=>{
                  patchPiece("donutVariantId",variant.id);clearFieldError("selectedVegetables");
                  const next=visiblePieces.findIndex((piece,index)=>index!==activePiece&&!product.donutVariants!.some(item=>item.id===piece.donutVariantId));
                  if(next!==-1)setActivePiece(next);
                }} className={`overflow-hidden rounded-xl border-2 p-2 text-sm ${selectedPieces.every(index=>pieces[index].donutVariantId===variant.id)?"border-[#69429a] bg-purple-50":"border-purple-100 hover:border-purple-300"}`}>
                  <img src={variant.image} alt={variant.name} className="aspect-square w-full rounded-lg object-contain" onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src=CATALOG_CAKE_PLACEHOLDER;}}/>
                  <span className="mt-2 block break-words text-xs font-medium text-[#69429a]">{variant.name}</span>
                  <span className="mt-1 block text-xs font-semibold text-[#69429a]">{formatMoney(variant.price??product.price)}</span>
                </button>)}
              </div>
              <button type="button" disabled={adding||!pieces[0].donutVariantId} onClick={()=>{const id=pieces[0].donutVariantId;setPieces(previous=>previous.map((piece,index)=>index<boxCount?{...piece,donutVariantId:id}:piece));clearFieldError("selectedVegetables");}} className="mt-3 w-full rounded-xl border border-purple-200 py-3 text-sm font-medium text-[#69429a] disabled:opacity-40">{dt("sameLook")}</button>
              {errors.selectedVegetables&&<p role="alert" className="mt-2 text-sm text-red-500">{errors.selectedVegetables}</p>}
            </section>}

            <details ref={ingredientsDetailsRef} onToggle={event=>setEditingComposition(event.currentTarget.open)} open={!isDonutBox||undefined} className={isDonutBox?"rounded-2xl border border-purple-100 bg-white p-4":""}>
              {isDonutBox&&<summary className="cursor-pointer font-semibold text-[#69429a]">{dt("composition")} <span className="ml-2 text-xs font-normal text-gray-500">{dt("change")}</span>
                <span className="mt-2 grid gap-1 text-xs font-normal leading-5 text-gray-600">{Array.from({length:boxCount/2},(_,pair)=><span key={pair}>{dt("pair",{a:pair*2+1,b:pair*2+2})}: {recipeSummary(pieces[pair*2])}</span>)}</span>
              </summary>}
              <div className="grid gap-6 pt-4">
              {isDonutBox&&<div>
                <p className="mb-3 text-sm text-gray-600">{dt("pairNote")}</p>
                <div className="flex flex-wrap gap-2" aria-label={dt("pairs")}>
                  {Array.from({length:boxCount/2},(_,pair)=><button key={pair} type="button" disabled={adding} aria-pressed={Math.floor(activePiece/2)===pair} onClick={()=>{setEditingComposition(true);setActivePiece(pair*2);}} className={`rounded-xl border px-4 py-2 text-sm ${Math.floor(activePiece/2)===pair?"border-[#69429a] bg-[#69429a] text-white":"border-purple-200 text-[#69429a]"}`}>{dt("pair",{a:pair*2+1,b:pair*2+2})}</button>)}
                </div>
              </div>}
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
                    <button disabled={adding} key={veg.key} onClick={() => { setSelectedAnimal(veg.key); clearFieldError("selectedAnimal"); }} className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all" style={{ backgroundColor: selectedAnimal === veg.key ? veg.color : "white", color: selectedAnimal === veg.key ? "white" : veg.color, borderColor: veg.color }}>{veg.emoji} {veg.label}{ingredientPriceTag(veg.key)}</button>
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
                    <button disabled={adding} key={veg.key} onClick={() => handleVegetableToggle(veg.key)} className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all" style={{ backgroundColor: isSelected ? veg.color : "white", color: isSelected ? "white" : veg.color, borderColor: veg.color }}>{veg.emoji} {veg.label}{ingredientPriceTag(veg.key)}</button>
                  );
                })}
              </div>
              {errors.selectedVegetables && <p className="text-red-500 text-sm mt-2">{errors.selectedVegetables}</p>}
            </div>

            {/* Cream Type */}
            {product.cream && <div id="error-creamType">
              <p className="text-lg font-semibold text-[#69429a] mb-3">{t("choosecream")}</p>
              <div className="flex flex-wrap gap-3">
                <button disabled={adding} onClick={() => { setCreamType("DAIRY"); clearFieldError("creamType"); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${creamType === "DAIRY" ? "bg-[#1e439b] text-white border-[#1e439b] shadow-md scale-105" : "bg-white text-[#1e439b] border-[#1e439b] hover:bg-[#e0e7ff]"}`}>🐄 {t("DAIRY")}{ingredientPriceTag("DAIRY")}</button>
                <button disabled={adding} onClick={() => { setCreamType("PLANTBASEDMILK"); clearFieldError("creamType"); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${creamType === "PLANTBASEDMILK" ? "bg-[#72bfe9] text-white border-[#72bfe9] shadow-md scale-105" : "bg-white text-[#72bfe9] border-[#72bfe9] hover:bg-[#e1f5fe]"}`}>🥥 {t("PLANTBASEDMILK")}{ingredientPriceTag("PLANTBASEDMILK")}</button>
                <button disabled={adding} onClick={() => { setCreamType("PLANTBASED"); clearFieldError("creamType"); }} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border cursor-pointer transition-all ${creamType === "PLANTBASED" ? "bg-[#008042] text-white border-[#008042] shadow-md scale-105" : "bg-white text-[#008042] border-[#008042] hover:bg-[#e8f5e9]"}`}>🥕 {t("PLANTBASED")}{ingredientPriceTag("PLANTBASED")}</button>
              </div>
              {errors.creamType && <p className="text-red-500 text-sm mt-2">{errors.creamType}</p>}
            </div>}

              </div>
            </details>

            {!isDonutBox&&product.ingredientPrices&&<section className="rounded-2xl border border-purple-100 bg-white p-4">
              <h2 className="mb-3 font-semibold text-[#69429a]">Գնի հաշվարկը</h2>
              <dl className="space-y-2 text-sm">{ingredientPriceLines(product.ingredientPrices,{cakeType,creamType,selectedAnimal,selectedVegetables},product.cream).map(line=><div key={line.key} className="flex items-center justify-between gap-3"><dt>{t(INGREDIENT_ITEMS.find(item=>item[0]===line.key)?.[2]??line.key)}</dt><dd className="font-semibold text-[#69429a]">{formatMoney(line.price)}</dd></div>)}</dl>
              <p className="mt-3 text-xs text-gray-500">Տորթի արժեքը կազմվում է այս բաղադրիչներից։ Դիզայնի վճարը՝ առանձին, եթե ընտրված է։</p>
            </section>}

            <details ref={extrasDetailsRef} open={!isDonutBox||undefined} className={isDonutBox?"rounded-2xl border border-purple-100 bg-white p-4":""}>
              {isDonutBox&&<summary className="cursor-pointer text-sm font-medium text-[#69429a]">{dt("extraBoxes")}</summary>}
              <div className="grid gap-6 pt-4">
            {!isDonutBox&&<>
            {/* Only the designs enabled in the administrator are offered. */}
            <div id="error-designType">
              <p className="mb-3 text-lg font-semibold text-[#69429a]">{t("chooseDesign")}</p>
              <div className="flex flex-wrap gap-3">
                {product.designs.map(key => {
                  const labels: Record<CakeDesign,string> = {STANDARD:t("standardDesign"), CUSTOM_PHOTO:t("customMyDogPhotoDesign"),NAME_TEXT:t("petName"),CUSTOM_TEXT:t("customDesign")};
                  const emoji: Record<CakeDesign,string> = {STANDARD:"🎂",CUSTOM_PHOTO:"📸",NAME_TEXT:"✏️",CUSTOM_TEXT:"✏️"};
                  const selected = designType === key;
                  return <button disabled={adding} key={key} type="button" aria-describedby={key==="CUSTOM_TEXT"&&selected?"custom-design-price-notice":undefined} aria-pressed={selected} onClick={()=>{setDesignType(key);clearFieldError("designType");}}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border border-[#69429a] px-4 py-2 text-sm font-medium transition ${selected?"bg-[#69429a] text-white shadow-md":"bg-white text-[#69429a] hover:bg-purple-50"}`}>
                    {emoji[key]} {labels[key]}
                  </button>;
                })}
              </div>
              {designType==="CUSTOM_TEXT"&&<p id="custom-design-price-notice" className="mt-3 rounded-xl bg-purple-50 px-4 py-3 text-sm leading-6 text-[#69429a]">{t("customDesignPriceNotice")}</p>}
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


            </>}

            {/* Quantity */}
            <div>
              <p className="text-lg font-semibold text-[#69429a] mb-3">{isDonutBox ? dt("boxQuantity") : language === "en" ? "Quantity" : language === "ru" ? "Количество" : language === "pl" ? "Ilość" : "Քանակ"}</p>
              <div className="flex items-center gap-4">
                <button disabled={adding} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-[#69429a] text-white font-bold text-xl flex items-center justify-center cursor-pointer hover:bg-[#5a3a85] transition-colors">-</button>
                <span className="text-2xl font-bold text-[#69429a] w-12 text-center">{quantity}</span>
                <button disabled={adding} onClick={() => setQuantity(previous => Math.min(10000, previous + 1))} className="w-10 h-10 rounded-full bg-[#69429a] text-white font-bold text-xl flex items-center justify-center cursor-pointer hover:bg-[#5a3a85] transition-colors">+</button>
              </div>
            </div>

              </div>
            </details>

            {isDonutBox?<div className="sticky bottom-3 z-30 rounded-2xl border border-purple-100 bg-white p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between gap-3"><span className="text-sm text-gray-600">{dt("count",{n:boxCount})}{quantity>1?` × ${dt("boxes",{n:quantity})}`:""}</span><strong className="text-xl text-[#69429a]" aria-live="polite">{formatMoney(price*quantity)}</strong></div>
              <button disabled={adding||needsAppearances} onClick={()=>void addToCartHandler()} className="w-full rounded-xl bg-[#69429a] px-5 py-3 font-semibold text-white transition hover:bg-[#573481] disabled:opacity-50">{adding?t("loading"):needsAppearances?dt("remaining",{n:boxCount-filledCount}):dt("add")}</button>
            </div>:<>
            {/* Price is based on the administrator's saved price for this size. */}
            <div className="sticky bottom-5 z-30 mt-auto rounded-2xl border border-[#69429a]/10 bg-white p-4 shadow-lg">
              <div className="text-2xl font-bold text-[#69429a]">{t("subtotal")}: {formatMoney(price * quantity)}</div>

            </div>
            <button disabled={adding} onClick={()=>void addToCartHandler()} className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#69429a] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#aed137] disabled:cursor-wait disabled:opacity-60">
              {adding ? t("loading") : `🛒 ${t("addToCart") || "Add to Cart"}`}
            </button>

            </>}

            {/* Product Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#69429a] mb-3">{t("productInfo")}</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2"><span className="text-[#aed137]">✓</span>{t("productNoSugar")}</li>
                <li className="flex items-center gap-2"><span className="text-[#aed137]">✓</span>{t("productNoArtificialAdditives")}</li>
                <li className="flex items-center gap-2"><span className="text-[#aed137]">✓</span>{t("productNaturalFreshIngredients")}</li>
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