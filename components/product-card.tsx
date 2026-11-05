"use client";
import Image from "next/image";
import { useState } from "react";
import { type Product } from "@/lib/products";
import { CATALOG_CAKE_PLACEHOLDER } from "@/lib/cake-config";
export function ProductCard({ product }: { product: Product }) {
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [failedSource,setFailedSource]=useState<string|null>(null);
  const source=typeof product.image==="string" ? product.image : product.image?.src;
  const image=source&&source!==failedSource ? source : CATALOG_CAKE_PLACEHOLDER;
  const selected=selectedId===product.id;
  return <div className="flex flex-col overflow-hidden rounded-xl bg-card shadow-sm">
    <button type="button" aria-label={product.name} aria-pressed={selected}
      className="relative aspect-square cursor-pointer overflow-hidden bg-muted"
      onClick={()=>setSelectedId(selected?null:product.id)}>
      <Image src={image} alt={product.name} fill sizes="(max-width:640px) 100vw, 33vw" unoptimized
        onError={()=>setFailedSource(source||null)} className="object-cover"/>
      {selected&&<div className="absolute inset-0 bg-black/75 transition-colors"/>}
    </button>
  </div>;
}
