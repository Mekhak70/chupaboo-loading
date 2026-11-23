"use client";
import { useState } from "react";

export function AdminSaleImage({image,name}:{image?:string|null;name:string}) {
  const [failed,setFailed]=useState<string|null>(null);
  const source=image&&(/^(https?:\/\/|\/(?!\/)|data:image\/)/i.test(image))?image:null;
  if(!source||source===failed)return <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-purple-50 p-2 text-center text-xs text-gray-400">Նկար չկա</span>;
  const photo=<img src={source} alt={name} loading="lazy" className="h-20 w-20 shrink-0 rounded-xl border border-purple-100 bg-white object-contain" onError={()=>setFailed(source)}/>;
  return /^https?:\/\/|^\/(?!\/)/i.test(source)?<a href={source} target="_blank" rel="noopener noreferrer" aria-label={`Բացել ${name} ապրանքի նկարը`} className="block w-fit shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69429a]">{photo}</a>:photo;
}
