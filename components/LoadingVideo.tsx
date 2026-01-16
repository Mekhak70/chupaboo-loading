"use client"

import { useEffect } from "react"

export default function LoadingVideo({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onFinish])

  return (
  
    <div className="w-screen h-screen relative overflow-hidden">
    <video
      src="/loading.mov"
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    />
  </div>
  

  )
}
