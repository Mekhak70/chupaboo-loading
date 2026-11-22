"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { CATALOG_CAKE_PLACEHOLDER } from "@/lib/cake-config";

const labels = {
  hy: { gallery:"Տորթի նկարներ", previous:"Նախորդ նկար", next:"Հաջորդ նկար", image:"Նկար", pause:"Դադարեցնել սլայդերը", play:"Միացնել սլայդերը" },
  en: { gallery:"Cake photos", previous:"Previous photo", next:"Next photo", image:"Photo", pause:"Pause slideshow", play:"Play slideshow" },
  ru: { gallery:"Фотографии торта", previous:"Предыдущее фото", next:"Следующее фото", image:"Фото", pause:"Остановить слайд-шоу", play:"Включить слайд-шоу" },
  pl: { gallery:"Zdjęcia tortu", previous:"Poprzednie zdjęcie", next:"Następne zdjęcie", image:"Zdjęcie", pause:"Zatrzymaj pokaz", play:"Włącz pokaz" },
};

export function CakeImageSlider({ images, name }: { images:string[]; name:string }) {
  const { language } = useLanguage();
  const text = labels[language];
  const [index,setIndex] = useState(0);
  const [playing,setPlaying] = useState(true);
  const [hovered,setHovered] = useState(false);
  const [focused,setFocused] = useState(false);
  const [visible,setVisible] = useState(true);
  const [reduced,setReduced] = useState(false);
  const [failed,setFailed] = useState<string[]>([]);
  const touchStart = useRef<number|null>(null);
  const photos = images.length ? images : [CATALOG_CAKE_PLACEHOLDER];
  const active = index % photos.length;
  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion=()=>setReduced(media.matches);
    const updateVisibility=()=>setVisible(!document.hidden);
    updateMotion();updateVisibility();
    media.addEventListener("change",updateMotion);
    document.addEventListener("visibilitychange",updateVisibility);
    return()=>{media.removeEventListener("change",updateMotion);document.removeEventListener("visibilitychange",updateVisibility);};
  },[]);
  useEffect(()=>{
    if(photos.length<2||!playing||hovered||focused||!visible||reduced)return;
    const timer=window.setInterval(()=>setIndex(value=>(value+1)%photos.length),4000);
    return()=>window.clearInterval(timer);
  },[photos.length,playing,hovered,focused,visible,reduced]);
  const move=(step:number)=>{setPlaying(false);setIndex(value=>(value+step+photos.length)%photos.length);};
  const control="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[#69429a] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69429a]";
  return <div className="absolute inset-0" role="region" aria-label={text.gallery}
    onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
    onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);}}
    onTouchStart={event=>{touchStart.current=event.touches[0]?.clientX??null;}}
    onTouchEnd={event=>{const start=touchStart.current;touchStart.current=null;const end=event.changedTouches[0]?.clientX;if(start!==null&&end!==undefined&&Math.abs(end-start)>40)move(end<start?1:-1);}}>
    <Image src={failed.includes(photos[active])?CATALOG_CAKE_PLACEHOLDER:photos[active]} alt={`${name}${photos.length>1?` · ${text.image} ${active+1}`:""}`} fill unoptimized sizes="(max-width:768px) 100vw, 50vw" className="object-cover" onError={()=>setFailed(previous=>previous.includes(photos[active])?previous:[...previous,photos[active]])}/>
    {photos.length>1&&<>
      <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
        <button type="button" className={control} aria-label={text.previous} onClick={()=>move(-1)}><ChevronLeft size={22}/></button>
        <button type="button" className={control} aria-label={text.next} onClick={()=>move(1)}><ChevronRight size={22}/></button>
      </div>
      {/* <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-2xl bg-white/90 p-2 backdrop-blur-md">
        <div className="flex min-w-0 flex-wrap gap-1" aria-label={text.gallery}>
          {photos.map((src,i)=><button key={`${src}-${i}`} type="button" aria-label={`${text.image} ${i+1}`} aria-current={active===i?"true":undefined} onClick={()=>{setPlaying(false);setIndex(i);}} className={`h-8 w-8 overflow-hidden rounded-lg border-2 sm:h-10 sm:w-10 ${active===i?"border-[#69429a]":"border-transparent"}`}><img src={failed.includes(src)?CATALOG_CAKE_PLACEHOLDER:src} alt="" className="h-full w-full object-cover" onError={()=>setFailed(previous=>previous.includes(src)?previous:[...previous,src])}/></button>)}
        </div>
        <div className="flex shrink-0 items-center gap-1"><span className="text-xs text-[#69429a]">{active+1}/{photos.length}</span>{!reduced&&<button type="button" className="flex h-9 w-9 items-center justify-center rounded-full text-[#69429a] focus-visible:ring-2 focus-visible:ring-[#69429a]" aria-label={playing?text.pause:text.play} onClick={()=>setPlaying(value=>!value)}>{playing?<Pause size={17}/>:<Play size={17}/>}</button>}</div>
      </div> */}
    </>}
  </div>;
}
