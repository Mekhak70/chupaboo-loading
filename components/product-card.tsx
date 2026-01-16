"use client"

import Image from "next/image"
import { useState } from "react"
import { type Product } from "@/lib/products"
import { log } from "console"

export function ProductCard({ product }: { product: Product }) {
  const [clickedImages, setClickedImages] = useState<string>('')

  const handleClick = () => {
    setClickedImages(product.image.id)
  }


  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-card shadow-sm">
      <div 
        className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
        onClick={handleClick}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />

        {product.image.id === clickedImages && <div
          className="absolute inset-0 transition-colors"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)'  }}
        ></div>}
      </div>
    </div>
  )
}
