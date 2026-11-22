"use client";
import "./donut-box-preview.css";
import { useDonutText } from "@/components/use-donut-text";
import type { CSSProperties } from "react";
import { CATALOG_CAKE_PLACEHOLDER, type CakeConfiguration, type DonutVariant } from "@/lib/cake-config";

export function DonutBoxPreview({pieces,activePiece,selectedPieces,onSelect,disabled,variants=[],compact=false}:{
  pieces:CakeConfiguration[];activePiece:number;selectedPieces:number[];onSelect:(index:number)=>void;disabled:boolean;variants?:DonutVariant[];compact?:boolean;
}){
  const dt = useDonutText();
  return <div className={`donut-preview ${compact?"donut-preview-compact":""}`} style={{"--donut-count":pieces.length} as CSSProperties}>
    <div className="donut-preview-heading"><span className="font-bold">{dt("yourBox")}</span><span aria-live="polite">{dt("count",{n:pieces.length})}</span></div>
    <div className={`donut-box-tray ${pieces.length===2||pieces.length===4?"donut-box-tray-two":"donut-box-tray-three"}`} aria-label={dt("preview",{n:pieces.length})}>
      {pieces.map((piece,index)=>{const variant=variants.find(item=>item.id===piece.donutVariantId);return <button key={index} type="button" disabled={disabled} onClick={()=>onSelect(index)} aria-label={dt("edit",{n:index+1})} aria-pressed={selectedPieces.includes(index)} className={`donut-box-slot ${selectedPieces.includes(index)?"donut-box-slot-active":""}`}>
        <span key={variant?.id??`empty-${index}`} className={`donut-box-piece ${variant?"donut-box-piece-filled":""}`}>
        {variant?<img src={variant.image} alt={variant.name} className="donut-box-photo" onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src=CATALOG_CAKE_PLACEHOLDER;}}/>:variants.length?<span className="donut-box-empty">{dt("empty")}</span>:<svg viewBox="0 0 140 140" className="w-full drop-shadow-lg" aria-hidden="true">
          <defs><radialGradient id={`dough-${index}`}><stop stopColor="#f4ca84"/><stop offset="1" stopColor="#b97533"/></radialGradient></defs>
          <path fill={`url(#dough-${index})`} fillRule="evenodd" d="M70 6a64 64 0 1 1 0 128A64 64 0 0 1 70 6Zm0 43a21 21 0 1 0 0 42 21 21 0 0 0 0-42Z"/>
          <path fill={piece.cakeType==="FRUIT"?"#edafc2":piece.cakeType==="VEGETABLES"?"#a6bf71":"#ccaa7c"} fillRule="evenodd" d="M70 14c32-3 57 24 55 56s-24 57-55 55S13 102 15 70 38 12 70 14Zm0 34a22 22 0 1 0 0 44 22 22 0 0 0 0-44Z"/>
          {[25,85,145,205,265,325].map(angle=><rect key={angle} x="66" y="24" width="9" height="3" rx="1.5" fill="#fff0cd" transform={`rotate(${angle} 70 70)`}/>)}
        </svg>}
        </span>
        <span className="donut-box-number">{index+1}{selectedPieces.includes(index)?"✓":""}</span>
      </button>})}
    </div>
    <p className="donut-preview-hint">{dt("hint")}</p>
  </div>;
}
