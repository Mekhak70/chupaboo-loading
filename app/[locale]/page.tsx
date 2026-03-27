"use client"

import Image from "next/image"
import { Heart, Shield, Sparkles } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useState } from "react"
import { PRODUCTS } from "@/lib/products"
import MainImgAm from "@/public/home-arm.png"
import MainImgRu from "@/public/home-rus.png"
import MainImgEn from "@/public/home-eng.png"
import MainImgPl from "@/public/home-pl.png"
import PetSlider from "@/components/PetSlider"
import Arrow from "@/public/arrow.png"
import Link from "next/link"
import { log } from "console"


type Filter = "all" | "meat" | "vegetable" | "fruit"
interface Combo {
  id: string;
  emoji: string;
  title: string;
  protein: string;
  extras: string[];
  price: number;
}

type TabType = 'builder' | 'combos';
type ExtraCategory = 'Veggies' | 'Fruits' | 'Grains';
export default function HomePage() {
  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "37400000000";


  const meatOptions = [
    { id: 1, label: "🍗 Հավի կրծքամիս + կարտոֆիլ + գազար", price: 11000 },
    { id: 2, label: "🍏 Հավի կրծքամիս + բրոկոլի + կանաչ բիբար", price: 12000 },
    { id: 3, label: "🥦 Տավարի միս + կարտոֆիլ + բրոկոլի", price: 12000 },
    { id: 4, label: "🍖 Տավարի միս + կարտոֆիլ + գազար", price: 12000 },
    { id: 5, label: "🥕 Տավարի միս + գազար + դդում", price: 13000 },
    { id: 6, label: "🍖 Տավարի միս + դդում + հնդկացորեն / վարսակ", price: 14000 },
    { id: 7, label: "🥩 Տավարի միս + բատատ + գազար", price: 17000 },
    { id: 8, label: "🍗 Հնդկահավ + գազար + դդում", price: 19000 },
    { id: 9, label: "🐟 Ձուկ + դդմիկ + դդում", price: 15000 },
    { id: 10, label: "🐟 Ձուկ + դդում + բրոկոլի + բատատ", price: 17000 },
  ]
  const FRUIT_OPTIONS = [
    { id: 1, label: "🍌 Բանան + Խնձոր + Թթվասեր", price: 10000 },
    { id: 2, label: "🍏 Խնձոր + Բանան + Բրնձի ալյուր + Կաթնաշոռ", price: 10000 },
    { id: 3, label: "🍎 Խնձոր + Գազար + Սերուցք", price: 11000 },
    { id: 4, label: "🍏 Խնձոր + Դդում + Բանան + Վարսակ + Սերուցք", price: 12000 },
    { id: 5, label: "🍯 Բանան + Վարսակ + Գետնանուշի կարագ", price: 13000 },
  ]

  const VEGAN_OPTIONS = [
    { id: 1, label: "🥔 Կարտոֆիլ + Գազար + Բիբար + Հնդկաձավար / Բրինձ / Վարսակ", price: 10000 },
    { id: 2, label: "🥕 Բրոկոլի + Գազար + Հնդկաձավար / Վարսակ + Կրեմ", price: 11000 },
    { id: 3, label: "🥦 Բրոկոլի + Ծաղկակաղամբ + Խնձոր + Կաթնաշոռային կրեմ", price: 13000 },
    { id: 4, label: "🍠 Գազար + Դդում + Քաղցր կարտոֆիլ + Վարսակ / Հնդկաձավար", price: 14000 },
  ]

const formatAMD = (n: number) => n.toLocaleString("en-US") + " AMD";
  const [note, setNote] = useState('');
    const [extras, setExtras] = useState<Set<string>>(new Set());
   const [extrasOpen, setExtrasOpen] = useState(false);


const buildComboMessage = (combo: Combo) => {
  const shapeSurcharge = PRICE.shapes[shape as keyof typeof PRICE.shapes] || 0;
  const final = combo.price + shapeSurcharge;
  const noteTrimmed = note.trim();

  return [
    "Hi CHUPABOO! I'd like to order a fixed combo:",
    `• Combo: ${combo.title}`,
    `• Shape: ${shape} (${formatAMD(shapeSurcharge)})`,
    `• Price: ${formatAMD(final)}`,
    noteTrimmed ? `• Notes: ${noteTrimmed}` : null
  ].filter(Boolean).join("\n");
};

const applyCombo = (combo: Combo) => {
  setProtein(combo.protein);
  setExtras(new Set(combo.extras));
  setExtrasOpen(true);
  setActiveTab('builder');
};

  const FIXED_COMBOS: Combo[] = [
    { id: "c1", emoji: "🍗", title: "Chicken + Potato + Carrot", protein: "Chicken breast", extras: ["Potato", "Carrot"], price: 11000 },
    { id: "c2", emoji: "🍏", title: "Chicken + Broccoli + Green pepper", protein: "Chicken breast", extras: ["Broccoli", "Green pepper"], price: 12000 },
    { id: "c3", emoji: "🥦", title: "Beef + Potato + Broccoli", protein: "Beef", extras: ["Potato", "Broccoli"], price: 12000 },
    { id: "c4", emoji: "🍖", title: "Beef + Potato + Carrot", protein: "Beef", extras: ["Potato", "Carrot"], price: 12000 },
    { id: "c5", emoji: "🥕", title: "Beef + Carrot + Pumpkin", protein: "Beef", extras: ["Carrot", "Pumpkin"], price: 13000 },
    { id: "c6", emoji: "🍖", title: "Beef + Pumpkin + Buckwheat / Oats", protein: "Beef", extras: ["Pumpkin", "Buckwheat"], price: 14000 },
    { id: "c7", emoji: "🥩", title: "Beef + Sweet potato + Carrot", protein: "Beef", extras: ["Sweet potato", "Carrot"], price: 17000 },
    { id: "c8", emoji: "🍗", title: "Turkey + Carrot + Pumpkin", protein: "Turkey", extras: ["Carrot", "Pumpkin"], price: 19000 },
    { id: "c9", emoji: "🐟", title: "Fish + Zucchini + Pumpkin", protein: "Fish", extras: ["Zucchini", "Pumpkin"], price: 15000 },
    { id: "c10", emoji: "🐟", title: "Fish + Pumpkin + Broccoli + Sweet potato", protein: "Fish", extras: ["Pumpkin", "Broccoli", "Sweet potato"], price: 17000 },
  ];
  const goOrderNow = (text: string) => {
    if (activeTab === 'builder' && !protein) {
      alert("Please select a base to calculate total.");
      return;
    }
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  const PRICE = {
    shapes: { Round: 0, Heart: 1500, Square: 1000 },
    protein: { "Chicken breast": 9000, "Beef": 10000, "Turkey": 12000, "Fish": 11000 },
    extras: {
      "Potato": 500, "Carrot": 500, "Broccoli": 700, "Green pepper": 600,
      "Pumpkin": 700, "Zucchini": 700, "Sweet potato": 900,
      "Buckwheat": 800, "Oats": 700,
      "Apple": 600, "Pear": 600, "Banana": 600, "Strawberry": 900
    }
  };
    const [activeTab, setActiveTab] = useState<TabType>('builder');
    const [protein, setProtein] = useState('');
  const { t, language } = useLanguage()
  const [filter, setFilter] = useState<Filter>("all")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [type, setType] = useState<string>("")
  const [creamType, setCreamType] = useState<string>("")
  const [shape, setShape] = useState<string>("")
  // 🔥 MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const [selectedMeatOption, setSelectedMeatOption] = useState<any>(null)


  const features = [
    { icon: Heart, title: t("handmade"), description: t("handmadeDesc") },
    { icon: Shield, title: t("petSafe"), description: t("petSafeDesc") },
    { icon: Sparkles, title: t("freshDaily"), description: t("freshDailyDesc") },
  ]

  const filteredProducts =
    filter === "all"
      ? PRODUCTS
      : PRODUCTS.filter(p => p.category === filter || p.category === "all")

  const SITE_URL = "https://www.chupaboo.com"

  const handleSelectImage = (image: any) => {
    setSelectedImage(image.src)
    setPendingImage(image.src)
    setIsModalOpen(true)
  }
//${selectedMeatOption?.label}  ${selectedMeatOption?.price}
  const whatsappMessage = pendingImage
    ? `${t('whatsappMessageTextOne')}  
    
   ${type} ${creamType}։ ${t('imageLabel')} ${SITE_URL}${pendingImage}`
    : t('whatsappMessageText')
console.log(whatsappMessage, 'whatsappMessage' )
  const whatsappLink = `https://wa.me/37433775750?text=${encodeURIComponent(
    whatsappMessage
  )}`

  return (
    <>
      <div className="flex flex-col" style={isModalOpen ? { position: 'fixed' } : {}}>
        {/* HERO */}
        <section
          className="relative overflow-hidden"
          style={{ background: "#69429a" }}
        >
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="grid items-center gap-8 md:grid-cols-2 pl-[100px] max-lg:pl-0">
              <Image
                src={
                  language === "ru"
                    ? MainImgRu
                    : language === "en"
                      ? MainImgEn
                      : language === "pl"
                        ? MainImgPl
                        : MainImgAm
                }
                alt="Pet cake hero"
                width={1100}
                height={830}
                className="rounded-2xl object-cover mx-auto scale-130 max-md:scale-110 max-sm:scale-100"
                priority
              />

              <div className="relative mx-auto w-full max-w-md">
                <PetSlider />
              </div>
            </div>
          </div>
        </section>

        {/* WAVE */}
        <div
          className="mt-0 [@media(max-width:648px)]:mt-[-1px]"
          style={{ backgroundColor: "#fff", height: "120px" }}
        >
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="block w-full h-[120px]"
          >
            <path
              d="M0 120 C 300 40, 400 20, 600 40 S 1000 120, 1200 0 V 0 H 0 Z"
              fill="#69429a"
            />
          </svg>
        </div>

        {/* PRODUCTS */}
        <section className="bg-white py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <h2 className="text-3xl font-bold mb-8 text-[#69429a]">
                {t('CREATEYOURPETSCAKE')}
              </h2>
              <Image src={Arrow} alt="aroww" width={30} height={40} style={{ padding: '0 0 2px 0' }} priority />
              <p className="text-lg text-[#69429a]">
                {t('choosemaincake')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center', alignItems: 'center', paddingTop: '4px' }}>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }} className="responsive-text">
                  <div className="responsive-text" style={{ background: '#ef4f27', fontSize: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }} onClick={() => setType(t('MEAT'))}><div style={{ width: '100%', height: '100%', backgroundColor: type === t('MEAT') ? 'rgba(0,0,0,0.75)' : '', padding: type === t('MEAT') ? '8px 12px' : '10px 15px', borderRadius: '16px', cursor: 'pointer' }}>{t('MEAT')}</div></div>
                  <div className="responsive-text" style={{ background: '#f4a2c6', fontSize: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }} onClick={() => setType(t('FRUIT'))}><div style={{ width: '100%', height: '100%', backgroundColor: type === t('FRUIT') ? 'rgba(0,0,0,0.75)' : '', padding: type === t('FRUIT') ? '8px 12px' : '10px 15px', borderRadius: '16px', cursor: 'pointer' }}>{t('FRUIT')}</div></div>
                  <div className="responsive-text" style={{ background: '#aed137', fontSize: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }} onClick={() => setType(t('VEGETABLES'))}><div style={{ width: '100%', height: '100%', backgroundColor: type === t('VEGETABLES') ? 'rgba(0,0,0,0.75)' : '', padding: type === t('VEGETABLES') ? '8px 12px' : '10px 15px', borderRadius: '16px', cursor: 'pointer' }}>{t('VEGETABLES')}</div></div>
                </div>

                <Image src={Arrow} alt="aroww" width={30} height={40} style={{ padding: '15px 0 2px 0' }} priority />

                <p className="text-lg text-[#69429a]">{t('choosecream')}</p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }} className="responsive-text">
                  <div className="responsive-text" style={{ background: '#1e439b', borderRadius: '16px', fontSize: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCreamType(t('DAIRY'))}><div style={{ width: '100%', height: '100%', backgroundColor: creamType === t('DAIRY') ? 'rgba(0,0,0,0.75)' : '', padding: creamType === t('DAIRY') ? '8px 12px' : '10px 15px', borderRadius: '16px', cursor: 'pointer' }}>{t('DAIRY')}</div></div>
                  <div className="responsive-text" style={{ background: '#72bfe9', borderRadius: '16px', fontSize: '20px', color: '#fff', whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCreamType(t('PLANTBASEDMILK'))}><div style={{ width: '100%', height: '100%', backgroundColor: creamType === t('PLANTBASEDMILK') ? 'rgba(0,0,0,0.75)' : '', padding: creamType === t('PLANTBASEDMILK') ? '8px 12px' : '10px 15px', borderRadius: '16px', cursor: 'pointer' }}>{t('PLANTBASEDMILK')}</div></div>
                  <div className="responsive-text" style={{ background: '#008042', borderRadius: '16px', fontSize: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCreamType(t('PLANTBASED'))}><div style={{ width: '100%', height: '100%', backgroundColor: creamType === t('PLANTBASED') ? 'rgba(0,0,0,0.75)' : '', padding: creamType === t('PLANTBASED') ? '8px 12px' : '10px 15px', borderRadius: '16px', cursor: 'pointer' }}>{t('PLANTBASED')}</div></div>
                </div>
                <Image src={Arrow} alt="aroww" width={30} height={40} style={{ padding: '15px 0 2px 0' }} priority />

                <p className="text-lg text-[#69429a]">{t('chooseshape')}</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ paddingTop: '10px' }}>
              {filteredProducts.map((product, index) => (
                <div key={index} className="rounded-xl overflow-hidden shadow-sm">
                  <div className="relative aspect-square cursor-pointer" onClick={() => handleSelectImage(product.image)}>
                    <Image src={product.image} alt={product.name} fill     className="w-full h-full object-cover" priority />
                    {selectedImage === product.image.src && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-yellow-400 font-semibold">
                        {t("selected")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ORDER BUTTON */}
        <div className="container mx-auto py-10 text-center bg-white">
          <a
            href={`https://wa.me/37433775750?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-lg transition"
            style={{ backgroundColor: "#69429a" }}
          >
            {t("orderNow")}
          </a>
        </div>

        {/* FEATURES */}
        <section className="bg-white py-16 border-t">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center gap-4 rounded-xl bg-card p-6 text-center shadow-sm hover:shadow-md">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "#69429a" }}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 🔥 MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-xl p-6  w-auto text-center">
            <h3 className="text-lg font-semibold mb-3 text-[#69429a]">{t('orderModalTitle')}</h3>
            {pendingImage && (
              <Image src={pendingImage} alt="Selected cake" width={150} height={150} className="mx-auto rounded-lg mb-4" priority />
            )}
            <div className="text-sm text-gray-700 mb-4 space-y-1" style={{ paddingTop: '16px' }}>
              {<>
                <p className=" text-[#69429a]" style={{ fontSize: '16px' }}>
                  {t('choosemaincake')}
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center', paddingBottom: '16px' }} className="responsive-text">
                  <div className="responsive-text" style={{ background: '#ef4f27', fontSize: '10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }} onClick={() => setType(t('MEAT'))}><div style={{ width: '100%', height: '100%', backgroundColor: type === t('MEAT') ? 'rgba(0,0,0,0.75)' : '', padding: type === t('MEAT') ? '8px 12px' : '10px 15px', borderRadius: '16px', cursor: 'pointer' }}>{t('MEAT')}</div></div>
                  <div className="responsive-text" style={{ background: '#f4a2c6', fontSize: '10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }} onClick={() => setType(t('FRUIT'))}><div style={{ width: '100%', height: '100%', backgroundColor: type === t('FRUIT') ? 'rgba(0,0,0,0.75)' : '', padding: type === t('FRUIT') ? '8px 12px' : '10px 15px', borderRadius: '16px', cursor: 'pointer' }}>{t('FRUIT')}</div></div>
                  <div className="responsive-text" style={{ background: '#aed137', fontSize: '10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }} onClick={() => setType(t('VEGETABLES'))}><div style={{ width: '100%', height: '100%', backgroundColor: type === t('VEGETABLES') ? 'rgba(0,0,0,0.75)' : '', padding: type === t('VEGETABLES') ? '8px 12px' : '10px 15px', borderRadius: '16px', cursor: 'pointer' }}>{t('VEGETABLES')}</div></div>
                </div> 
                </>}
              {/* <div className="space-y-2 max-h-[170px] overflow-y-auto">
                {type === t("MEAT") && meatOptions.map(option => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedMeatOption(option)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${selectedMeatOption?.id === option.id
                      ? "border-[#69429a] bg-[#69429a]/10"
                      : "border-gray-200"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{option.label}</span>
                      <span className="font-semibold text-[#69429a]">
                        {option.price} ֏
                      </span>
                    </div>
                  </div>
                ))}
                {type === t("FRUIT") && FRUIT_OPTIONS.map(option => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedMeatOption(option)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${selectedMeatOption?.id === option.id
                      ? "border-[#69429a] bg-[#69429a]/10"
                      : "border-gray-200"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{option.label}</span>
                      <span className="font-semibold text-[#69429a]">
                        {option.price} ֏
                      </span>
                    </div>
                  </div>
                ))}
                {type === t("VEGETABLES") && VEGAN_OPTIONS.map(option => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedMeatOption(option)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${selectedMeatOption?.id === option.id
                      ? "border-[#69429a] bg-[#69429a]/10"
                      : "border-gray-200"
                      }`}

                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{option.label}</span>
                      <span className="font-semibold text-[#69429a]">
                        {option.price} ֏
                      </span>
                    </div>
                  </div>
                ))}
              </div> */}

{/* <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-2">
  {FIXED_COMBOS.map((combo) => {
    const shapeSurcharge =
      PRICE.shapes[shape as keyof typeof PRICE.shapes] || 0;
    const final = combo.price + shapeSurcharge;

    return (
      <div
        key={combo.id}
        className=" border border-gray-200 rounded-2xl bg-white p-3.5 flex justify-between gap-3 items-start flex-shrink-0"
      >
        <div>
          <div className="font-black mb-1.5">
            {combo.emoji} {combo.title}
          </div>

          <div className="text-xs text-gray-500 leading-relaxed">
            Includes: {combo.protein} + {combo.extras.join(" + ")}
          </div>

          <div className="text-xs text-gray-500 leading-relaxed">
            Shape: {shape}
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className="font-black whitespace-nowrap">
            {formatAMD(final)}
          </div>

          <button
            className="px-3 py-2.5 rounded-xl border-none bg-purple-700 text-white cursor-pointer font-black text-xs hover:bg-purple-800"
            onClick={() => goOrderNow(buildComboMessage(combo))}
          >
            Order now
          </button>

          <button
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white cursor-pointer font-black text-xs hover:bg-gray-50"
            onClick={() => applyCombo(combo)}
          >
           <Link
  href="hy/CakeBuilder"
  className=" "
>
  Use in builder
</Link>
          </button>
        </div>
      </div>
    );
  })}
</div> */}

               {creamType ? <p style={{ paddingTop: '16px' }}><strong>{t('creamType')}:</strong> <span style={{ color: '#69429A' }}>{creamType.toLowerCase() || "-"}</span></p> : <> <p className="text-lg text-[#69429a]" style={{ paddingTop: '16px' }}>{t('choosecream')}</p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center', }} className="responsive-text">
                  <div className="responsive-text" style={{ background: '#1e439b', borderRadius: '16px', fontSize: '10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCreamType(t('DAIRY'))}><div style={{ width: '100%', height: '100%', backgroundColor: creamType === t('DAIRY') ? 'rgba(0,0,0,0.75)' : '', padding: creamType === t('DAIRY') ? '8px 12px' : '10px 15px', borderRadius: '16px', cursor: 'pointer' }}>{t('DAIRY')}</div></div>
                  <div className="responsive-text" style={{ background: '#72bfe9', borderRadius: '16px', fontSize: '10px', color: '#fff', whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCreamType(t('PLANTBASEDMILK'))}><div style={{ width: '100%', height: '100%', backgroundColor: creamType === t('PLANTBASEDMILK') ? 'rgba(0,0,0,0.75)' : '', padding: creamType === t('PLANTBASEDMILK') ? '8px 12px' : '10px 15px', borderRadius: '16px', cursor: 'pointer' }}>{t('PLANTBASEDMILK')}</div></div>
                  <div className="responsive-text" style={{ background: '#008042', borderRadius: '16px', fontSize: '10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCreamType(t('PLANTBASED'))}><div style={{ width: '100%', height: '100%', backgroundColor: creamType === t('PLANTBASED') ? 'rgba(0,0,0,0.75)' : '', padding: creamType === t('PLANTBASED') ? '8px 12px' : '10px 15px', borderRadius: '16px', cursor: 'pointer' }}>{t('PLANTBASED')}</div></div>
                </div>
              </>
              }            
              
               </div>
               {/* ${creamType ? "opacity-100" : "opacity-50 pointer-events-none"} */}
            <div className="flex justify-center gap-4">
              <a
                href={creamType ? whatsappLink : "#"}
                // href="hy/CakeBuilder"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-5 py-2 rounded-lg text-white transition
    
  `}
                style={{ backgroundColor: "#69429a" }}
                onClick={() => {
                  if (creamType) {
                    setIsModalOpen(false)
                  }
                }}
              >
                {t("yes")}
              </a>
              <button className="px-5 py-2 rounded-lg bg-gray-300 " onClick={() => { setIsModalOpen(false), setSelectedImage(null), setPendingImage(null), setSelectedMeatOption(null) }} style={{ cursor: 'pointer' }}
              >
                {t('no')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 450px) {
          .responsive-text {
            font-size: 10.5px !important;
            line-height: 1.2;
            gap: 6px !important;
          }
        }
      `}</style>
    </>
  )
}
