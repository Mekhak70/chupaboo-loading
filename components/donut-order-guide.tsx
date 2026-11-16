"use client";
import { PlayCircle } from "lucide-react";
import { Dialog,DialogContent,DialogDescription,DialogTitle,DialogTrigger } from "@/components/ui/dialog";

export function DonutOrderGuide(){
  return <Dialog>
    <DialogTrigger asChild><button type="button" className="mt-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-[#69429a] transition hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69429a]"><PlayCircle className="h-5 w-5" aria-hidden="true"/>Ինչպե՞ս հավաքել բոքսը</button></DialogTrigger>
    <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-4xl">
      <DialogTitle>Հավաքիր քո բոքսը՝ քայլ առ քայլ</DialogTitle>
      <DialogDescription>24 վայրկյան · հայերեն հուշումներով · առանց ձայնի</DialogDescription>
      <video controls playsInline preload="none" poster="/guides/donut-box-guide-poster.jpg" className="w-full rounded-xl bg-[#f8f5fb]" aria-label="Դոնաթների բոքսը հավաքելու ուղեցույց">
        <source src="/guides/donut-box-guide.mp4" type="video/mp4"/>
        Քո դիտարկիչը չի ցուցադրում վիդեոն։ <a href="/guides/donut-box-guide.mp4">Բացել ուղեցույցը</a>
      </video>
      <p className="text-xs leading-5 text-gray-500">Ընտրիր 2, 4 կամ 6 հատ, հետո՝ տեսքերը։ Ցանկության դեպքում փոխիր զույգերի բաղադրությունը և ավելացրու զամբյուղ։ Գները ցուցադրված են որպես օրինակ․ քո բոքսի ընթացիկ արժեքը երևում է պատվերի էջում։</p>
    </DialogContent>
  </Dialog>;
}
