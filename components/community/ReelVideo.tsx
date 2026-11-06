"use client"
import { useEffect, useRef } from "react"

export default function ReelVideo({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = ref.current
    if (!video) return
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0]
      if (!entry.isIntersecting) video.pause()
      else if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) void video.play().catch(() => {})
    }, { threshold: 0.7 })
    observer.observe(video)
    const pause = () => { if (document.hidden) video.pause() }
    document.addEventListener("visibilitychange", pause)
    return () => { observer.disconnect(); video.pause(); document.removeEventListener("visibilitychange", pause) }
  }, [src])
  return <video ref={ref} className="ch-reel-video" src={src} controls muted playsInline loop preload="metadata" aria-label={label} />
}
