// // app/components/ChupabooCakeBuilder.tsx
// 'use client';

// import React, { useState } from 'react';

// // Types
// interface PriceMap {
//   [key: string]: number;
// }

// interface IconMap {
//   [key: string]: string;
// }

// interface Combo {
//   id: string;
//   emoji: string;
//   title: string;
//   protein: string;
//   extras: string[];
//   price: number;
// }

// // Constants
// const PRICE = {
//   shapes: { Round: 0, Heart: 1500, Square: 1000 },
//   protein: { "Chicken breast": 9000, "Beef": 10000, "Turkey": 12000, "Fish": 11000 },
//   extras: {
//     "Potato": 500, "Carrot": 500, "Broccoli": 700, "Green pepper": 600,
//     "Pumpkin": 700, "Zucchini": 700, "Sweet potato": 900,
//     "Buckwheat": 800, "Oats": 700,
//     "Apple": 600, "Pear": 600, "Banana": 600, "Strawberry": 900
//   }
// };

// const EXTRA_CATS = {
//   Veggies: ["Potato", "Carrot", "Broccoli", "Green pepper", "Pumpkin", "Zucchini", "Sweet potato"],
//   Fruits: ["Apple", "Pear", "Banana", "Strawberry"],
//   Grains: ["Buckwheat", "Oats"]
// };

// const FIXED_COMBOS: Combo[] = [
//   { id: "c1", emoji: "🍗", title: "Chicken + Potato + Carrot", protein: "Chicken breast", extras: ["Potato", "Carrot"], price: 11000 },
//   { id: "c2", emoji: "🍏", title: "Chicken + Broccoli + Green pepper", protein: "Chicken breast", extras: ["Broccoli", "Green pepper"], price: 12000 },
//   { id: "c3", emoji: "🥦", title: "Beef + Potato + Broccoli", protein: "Beef", extras: ["Potato", "Broccoli"], price: 12000 },
//   { id: "c4", emoji: "🍖", title: "Beef + Potato + Carrot", protein: "Beef", extras: ["Potato", "Carrot"], price: 12000 },
//   { id: "c5", emoji: "🥕", title: "Beef + Carrot + Pumpkin", protein: "Beef", extras: ["Carrot", "Pumpkin"], price: 13000 },
//   { id: "c6", emoji: "🍖", title: "Beef + Pumpkin + Buckwheat / Oats", protein: "Beef", extras: ["Pumpkin", "Buckwheat"], price: 14000 },
//   { id: "c7", emoji: "🥩", title: "Beef + Sweet potato + Carrot", protein: "Beef", extras: ["Sweet potato", "Carrot"], price: 17000 },
//   { id: "c8", emoji: "🍗", title: "Turkey + Carrot + Pumpkin", protein: "Turkey", extras: ["Carrot", "Pumpkin"], price: 19000 },
//   { id: "c9", emoji: "🐟", title: "Fish + Zucchini + Pumpkin", protein: "Fish", extras: ["Zucchini", "Pumpkin"], price: 15000 },
//   { id: "c10", emoji: "🐟", title: "Fish + Pumpkin + Broccoli + Sweet potato", protein: "Fish", extras: ["Pumpkin", "Broccoli", "Sweet potato"], price: 17000 },
// ];

// const ICON: IconMap = {
//   "Round": "⭕", "Heart": "💜", "Square": "⬜",
//   "Chicken breast": "🍗", "Beef": "🥩", "Turkey": "🦃", "Fish": "🐟",
//   "Potato": "🥔", "Carrot": "🥕", "Broccoli": "🥦", "Green pepper": "🫑",
//   "Pumpkin": "🎃", "Zucchini": "🥒", "Sweet potato": "🍠",
//   "Buckwheat": "🌾", "Oats": "🥣",
//   "Apple": "🍏", "Pear": "🍐", "Banana": "🍌", "Strawberry": "🍓"
// };

// const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "37400000000";

// // Utility functions
// const formatAMD = (n: number) => n.toLocaleString("en-US") + " AMD";

// type TabType = 'builder' | 'combos';
// type ExtraCategory = 'Veggies' | 'Fruits' | 'Grains';

// const CakeBuilder: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<TabType>('combos');
//   const [shape, setShape] = useState('Round');
//   const [protein, setProtein] = useState('');
//   const [extras, setExtras] = useState<Set<string>>(new Set());
//   const [note, setNote] = useState('');
//   const [extrasOpen, setExtrasOpen] = useState(false);
//   const [extrasTab, setExtrasTab] = useState<ExtraCategory>('Veggies');
//   const [extrasSearch, setExtrasSearch] = useState('');

//   const calcTotal = () => {
//     const shapePrice = PRICE.shapes[shape as keyof typeof PRICE.shapes] || 0;
//     const proteinPrice = protein ? (PRICE.protein[protein as keyof typeof PRICE.protein] || 0) : 0;
//     let extrasSum = 0;
//     extras.forEach(x => extrasSum += (PRICE.extras[x as keyof typeof PRICE.extras] || 0));
//     return { shapePrice, proteinPrice, extrasSum, total: shapePrice + proteinPrice + extrasSum };
//   };

//   const getVisibleExtras = () => {
//     const base = EXTRA_CATS[extrasTab] || [];
//     const q = extrasSearch.trim().toLowerCase();
//     if (!q) return base;
//     return base.filter(x => x.toLowerCase().includes(q));
//   };

//   const toggleExtra = (name: string) => {
//     const newExtras = new Set(extras);
//     if (newExtras.has(name)) {
//       newExtras.delete(name);
//     } else {
//       newExtras.add(name);
//     }
//     setExtras(newExtras);
//   };

//   const buildWhatsAppMessage = () => {
//     const { shapePrice, proteinPrice, extrasSum, total } = calcTotal();
//     const extrasList = [...extras];
//     const noteTrimmed = note.trim();

//     return [
//       "Hi CHUPABOO! I'd like to order a custom pet cake:",
//       `• Shape: ${shape} (${formatAMD(shapePrice)})`,
//       `• Base: ${protein} (${formatAMD(proteinPrice)})`,
//       `• Extras: ${extrasList.length ? extrasList.join(", ") : "None"} (${formatAMD(extrasSum)})`,
//       noteTrimmed ? `• Notes: ${noteTrimmed}` : null,
//       `• Total: ${formatAMD(total)}`
//     ].filter(Boolean).join("\n");
//   };

//   const buildComboMessage = (combo: Combo) => {
//     const shapeSurcharge = PRICE.shapes[shape as keyof typeof PRICE.shapes] || 0;
//     const final = combo.price + shapeSurcharge;
//     const noteTrimmed = note.trim();

//     return [
//       "Hi CHUPABOO! I'd like to order a fixed combo:",
//       `• Combo: ${combo.title}`,
//       `• Shape: ${shape} (${formatAMD(shapeSurcharge)})`,
//       `• Price: ${formatAMD(final)}`,
//       noteTrimmed ? `• Notes: ${noteTrimmed}` : null
//     ].filter(Boolean).join("\n");
//   };

//   const goOrderNow = (text: string) => {
//     if (activeTab === 'builder' && !protein) {
//       alert("Please select a base to calculate total.");
//       return;
//     }
//     const encoded = encodeURIComponent(text);
//     window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
//   };

//   const resetBuilder = () => {
//     setShape('Round');
//     setProtein('');
//     setExtras(new Set());
//     setNote('');
//     setExtrasOpen(false);
//     setExtrasTab('Veggies');
//     setExtrasSearch('');
//   };

//   const applyCombo = (combo: Combo) => {
//     setProtein(combo.protein);
//     setExtras(new Set(combo.extras));
//     setExtrasOpen(true);
//     setActiveTab('builder');
//   };

//   const { total, shapePrice, proteinPrice, extrasSum } = calcTotal();

//   return (
//     <div className="max-w-7xl mx-auto px-4 pb-24 sm:pb-28">
//       {/* Sticky Header */}
//       {/* <div className="sticky top-2 z-30 flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-full bg-white/80 backdrop-blur-md">
//         <div className="font-black tracking-wide text-purple-700">CHUPABOO</div>
//         <div className="text-xs text-gray-500">Small & comfy builder</div>
//       </div> */}

//       <h1 className="mt-4 mb-1 text-3xl font-bold tracking-tight">Build a Cake</h1>
//       <p className="mb-4 text-gray-500 max-w-3xl">
//         Pick a shape and ingredients — total updates instantly. Want something quick? Choose a combo.
//       </p>

//       {/* Tabs */}
//       <div className="inline-flex gap-1.5 p-1 border border-gray-200 rounded-full bg-white">
//         <button
//           className={`px-4 py-2.5 rounded-full font-extrabold text-sm transition-colors ${
//             activeTab === 'combos' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'
//           }`}
//           onClick={() => setActiveTab('combos')}
//         >
//           Combos
//         </button>
//         <button
//           className={`px-4 py-2.5 rounded-full font-extrabold text-sm transition-colors ${
//             activeTab === 'builder' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'
//           }`}
//           onClick={() => setActiveTab('builder')}
//         >
//           Custom
//         </button>
//       </div>

//       {/* Builder View */}
//       {activeTab === 'builder' && (
//         <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-3.5 mt-3.5">
//           {/* Left Column - Builder */}
//           <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
//             <div className="flex items-center justify-between gap-2.5 p-4 border-b border-gray-200 bg-gradient-to-b from-purple-100/20 to-white">
//               <div className="font-black">Builder</div>
//               <div className="px-3 py-1.5 text-xs border border-gray-200 rounded-full bg-white text-gray-500">
//                 Live pricing
//               </div>
//             </div>

//             <div className="p-4">
//               {/* Shape */}
//               <p className="font-black mb-2.5">Shape</p>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                 {['Round', 'Heart', 'Square'].map((name) => {
//                   const price = PRICE.shapes[name as keyof typeof PRICE.shapes] || 0;
//                   return (
//                     <div
//                       key={name}
//                       className={`flex items-center justify-between gap-2.5 p-3.5 border rounded-2xl bg-white cursor-pointer transition-all hover:-translate-y-0.5 ${
//                         shape === name ? 'border-purple-400/35 bg-purple-100' : 'border-gray-200'
//                       }`}
//                       onClick={() => setShape(name)}
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-lg">
//                           {ICON[name]}
//                         </div>
//                         <div>
//                           <div className="font-black">{name}</div>
//                           <div className="text-xs text-gray-500 mt-0.5">
//                             {price ? "Shape surcharge" : "Base shape"}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="font-black text-sm whitespace-nowrap">+ {formatAMD(price)}</div>
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="h-3.5" />

//               {/* Base */}
//               <p className="font-black mb-2.5">Base</p>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
//                 {Object.entries(PRICE.protein).map(([name, price]) => (
//                   <div
//                     key={name}
//                     className={`flex items-center justify-between gap-2.5 p-3 border rounded-xl bg-white cursor-pointer transition-all hover:-translate-y-0.5 ${
//                       protein === name ? 'border-purple-400/35 bg-purple-100' : 'border-gray-200'
//                     }`}
//                     onClick={() => setProtein(name)}
//                   >
//                     <div className="flex items-center gap-2.5">
//                       <div className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-base">
//                         {ICON[name] || "➕"}
//                       </div>
//                       <div>
//                         <div className="font-black text-sm">{name}</div>
//                         <div className="text-xs text-gray-500 mt-0.5">Base</div>
//                       </div>
//                     </div>
//                     <div className="font-black text-xs">{formatAMD(price)}</div>
//                   </div>
//                 ))}
//               </div>

//               <div className="h-3.5" />

//               {/* Extras */}
//               <p className="font-black mb-2.5">Extras</p>
//               <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
//                 <div
//                   className="flex items-center justify-between gap-2.5 p-3 cursor-pointer select-none"
//                   onClick={() => setExtrasOpen(!extrasOpen)}
//                 >
//                   <div className="flex flex-col gap-0.5">
//                     <div className="font-black">Add extras</div>
//                     <div className="text-xs text-gray-500">
//                       {extras.size ? `${extras.size} selected` : "Veggies, fruits or grains"}
//                     </div>
//                   </div>
//                   <div className="text-gray-500 font-black">{extrasOpen ? "▴" : "▾"}</div>
//                 </div>

//                 {extrasOpen && (
//                   <div className="p-3 border-t border-gray-200">
//                     <div className="inline-flex gap-1.5 p-1.5 border border-gray-200 rounded-full bg-white">
//                       {(['Veggies', 'Fruits', 'Grains'] as const).map((cat) => (
//                         <button
//                           key={cat}
//                           className={`px-3 py-2 rounded-full font-black text-xs transition-colors ${
//                             extrasTab === cat ? 'bg-purple-100 text-purple-700' : 'text-gray-500'
//                           }`}
//                           onClick={() => setExtrasTab(cat)}
//                         >
//                           {cat}
//                         </button>
//                       ))}
//                     </div>

//                     <div className="mt-2.5 flex items-center gap-2 border border-gray-200 rounded-xl p-2.5 bg-white">
//                       <span className="text-gray-500 text-sm">⌕</span>
//                       <input
//                         className="border-none outline-none w-full text-sm"
//                         placeholder="Search extras…"
//                         value={extrasSearch}
//                         onChange={(e) => setExtrasSearch(e.target.value)}
//                       />
//                     </div>

//                     <div className="h-2.5" />

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
//                       {getVisibleExtras().map((name) => {
//                         const price = PRICE.extras[name as keyof typeof PRICE.extras] || 0;
//                         const active = extras.has(name);
//                         return (
//                           <div
//                             key={name}
//                             className={`flex items-center justify-between gap-2.5 p-3 border rounded-xl bg-white cursor-pointer transition-all hover:-translate-y-0.5 ${
//                               active ? 'border-purple-400/35 bg-purple-100' : 'border-gray-200'
//                             }`}
//                             onClick={() => toggleExtra(name)}
//                           >
//                             <div className="flex items-center gap-2.5">
//                               <div className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-base">
//                                 {ICON[name] || "➕"}
//                               </div>
//                               <div>
//                                 <div className="font-black text-sm">{name}</div>
//                                 <div className="text-xs text-gray-500 mt-0.5">
//                                   {extrasTab.slice(0, -1)}
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="font-black text-xs">+ {formatAMD(price)}</div>
//                           </div>
//                         );
//                       })}
//                       {getVisibleExtras().length === 0 && (
//                         <div className="text-gray-500 text-sm p-1.5 col-span-2">
//                           No results. Try another search.
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Selected Extras Chips */}
//               {extras.size > 0 && (
//                 <div className="flex gap-2 flex-wrap mt-2.5">
//                   {[...extras].map((name) => (
//                     <div key={name} className="border border-gray-200 bg-white rounded-full px-2.5 py-1.5 text-xs flex gap-2 items-center">
//                       <span>{ICON[name] || ""} {name}</span>
//                       <button
//                         className="border-none bg-transparent cursor-pointer text-gray-500 text-sm leading-none"
//                         onClick={() => toggleExtra(name)}
//                       >
//                         ×
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="h-3.5" />

//               {/* Notes */}
//               <p className="font-black mb-2.5">Special requests (optional)</p>
//               <label className="text-xs text-gray-500 block mb-1.5">Notes</label>
//               <textarea
//                 className="w-full p-3 rounded-xl border border-gray-200 bg-white outline-none text-sm min-h-[92px] resize-y"
//                 placeholder='E.g., “No carrots”, “Extra pumpkin”, “Allergy notes”…'
//                 value={note}
//                 onChange={(e) => setNote(e.target.value)}
//               />
//               <div className="text-xs text-gray-500 mt-1.5 leading-relaxed">
//                 Your selection will be sent as a pre-filled message.
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Summary (Sticky) */}
//           <div className="lg:sticky lg:top-[92px]">
//             <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
//               <div className="flex items-center justify-between gap-2.5 p-4 border-b border-gray-200 bg-gradient-to-b from-purple-100/20 to-white">
//                 <div className="font-black">Summary</div>
//                 <div className="px-3 py-1.5 text-xs border border-gray-200 rounded-full bg-white text-gray-500">
//                   Instant
//                 </div>
//               </div>

//               <div className="lg:max-h-[calc(100vh-130px)] lg:overflow-auto p-4">
//                 <div className="flex items-start justify-between gap-3 p-3.5 border border-gray-200 rounded-2xl bg-white">
//                   <div>
//                     <div className="text-2xl font-black text-purple-700">
//                       {protein ? formatAMD(total) : "— AMD"}
//                     </div>
//                     <div className="mt-1 text-xs text-gray-500 leading-relaxed">
//                       {protein ? "Total updates instantly as you select." : "Select a base to calculate total."}
//                     </div>
//                   </div>
//                   <div className="px-3 py-1.5 text-xs border border-gray-200 rounded-full bg-white text-gray-500 whitespace-nowrap">
//                     Fixed
//                   </div>
//                 </div>

//                 {protein && (
//                   <div className="mt-3">
//                     <div className="flex justify-between gap-2.5 py-2.5 border-b border-dashed border-gray-200 text-xs">
//                       <div className="text-gray-500">Shape ({shape})</div>
//                       <div>{formatAMD(shapePrice)}</div>
//                     </div>
//                     <div className="flex justify-between gap-2.5 py-2.5 border-b border-dashed border-gray-200 text-xs">
//                       <div className="text-gray-500">Base ({protein})</div>
//                       <div>{formatAMD(proteinPrice)}</div>
//                     </div>
//                     <div className="flex justify-between gap-2.5 py-2.5 border-b border-dashed border-gray-200 text-xs">
//                       <div className="text-gray-500">Extras</div>
//                       <div>{formatAMD(extrasSum)}</div>
//                     </div>
//                     <div className="flex justify-between gap-2.5 py-2.5 font-black text-xs">
//                       <div className="text-gray-500">Total</div>
//                       <div>{formatAMD(total)}</div>
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex gap-2.5 flex-wrap mt-3">
//                   <button
//                     className="px-4 py-3 rounded-xl border border-gray-200 bg-white cursor-pointer font-black text-sm hover:bg-gray-50"
//                     onClick={resetBuilder}
//                   >
//                     Reset
//                   </button>
//                   <button
//                     className="px-4 py-3 rounded-xl border-none bg-purple-700 text-white cursor-pointer font-black text-sm hover:bg-purple-800"
//                     onClick={() => goOrderNow(buildWhatsAppMessage())}
//                   >
//                     Order now
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Combos View */}
//       {activeTab === 'combos' && (
//         <div className="mt-3.5">
//           <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
//             <div className="flex items-center justify-between gap-2.5 p-4 border-b border-gray-200 bg-gradient-to-b from-purple-100/20 to-white">
//               <div className="font-black">Fixed combos</div>
//               <div className="px-3 py-1.5 text-xs border border-gray-200 rounded-full bg-white text-gray-500">
//                 Quick pick
//               </div>
//             </div>

//             <div className="p-4">
//               <div className="text-xs text-gray-500 leading-relaxed mt-0 mb-3">
//                 Pick a combo to order instantly, or apply it to the builder to tweak extras.
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
//                 {FIXED_COMBOS.map((combo) => {
//                   const shapeSurcharge = PRICE.shapes[shape as keyof typeof PRICE.shapes] || 0;
//                   const final = combo.price + shapeSurcharge;

//                   return (
//                     <div
//                       key={combo.id}
//                       className="border border-gray-200 rounded-2xl bg-white p-3.5 flex justify-between gap-3 items-start"
//                     >
//                       <div>
//                         <div className="font-black mb-1.5">{combo.emoji} {combo.title}</div>
//                         <div className="text-xs text-gray-500 leading-relaxed">
//                           Includes: {combo.protein} + {combo.extras.join(" + ")}
//                         </div>
//                         <div className="text-xs text-gray-500 leading-relaxed">
//                           Shape: {shape}
//                         </div>
//                       </div>
//                       <div className="flex flex-col gap-2 items-end">
//                         <div className="font-black whitespace-nowrap">{formatAMD(final)}</div>
//                         <button
//                           className="px-3 py-2.5 rounded-xl border-none bg-purple-700 text-white cursor-pointer font-black text-xs hover:bg-purple-800"
//                           onClick={() => goOrderNow(buildComboMessage(combo))}
//                         >
//                           Order now
//                         </button>
//                         <button
//                           className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white cursor-pointer font-black text-xs hover:bg-gray-50"
//                           onClick={() => applyCombo(combo)}
//                         >
//                           Use in builder
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Sticky Bottom Bar */}
//       <div className="fixed left-0 right-0 bottom-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 py-2.5">
//         <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
//           <div>
//             <div className="font-black text-purple-700">
//               {protein ? formatAMD(total) : "— AMD"}
//             </div>
//             <div className="text-xs text-gray-500 mt-0.5">
//               {protein ? "Ready to order." : "Select a base to calculate total."}
//             </div>
//           </div>
//           <button
//             className="px-4 py-3 rounded-xl border-none bg-purple-700 text-white font-black cursor-pointer min-w-[150px] hover:bg-purple-800"
//             onClick={() => goOrderNow(buildWhatsAppMessage())}
//           >
//             Order now
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CakeBuilder;