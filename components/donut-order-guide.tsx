"use client";
import { useDonutText } from "@/components/use-donut-text";
import { PlayCircle } from "lucide-react";
import { Dialog,DialogContent,DialogDescription,DialogTitle,DialogTrigger } from "@/components/ui/dialog";

export function DonutOrderGuide(){
  const dt = useDonutText();
  return <Dialog>
    <DialogTrigger asChild><button type="button" className="mt-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-[#69429a] transition hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69429a]"><PlayCircle className="h-5 w-5" aria-hidden="true"/>{dt("guideButton")}</button></DialogTrigger>
    <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-4xl">
      <DialogTitle>{dt("guideTitle")}</DialogTitle>
      <DialogDescription>{dt("guideMeta")}</DialogDescription>
      <video controls playsInline preload="none" poster="/guides/donut-box-guide-poster.jpg" className="w-full rounded-xl bg-[#f8f5fb]" aria-label={dt("guideLabel")}>
        <source src="/guides/donut-box-guide.mp4" type="video/mp4"/>
        {dt("videoFallback")} <a href="/guides/donut-box-guide.mp4">{dt("openGuide")}</a>
      </video>
      <p className="text-xs leading-5 text-gray-500">{dt("guideNote")}</p>
    </DialogContent>
  </Dialog>;
}
