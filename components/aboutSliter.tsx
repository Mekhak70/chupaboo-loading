'use client';

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Image from 'next/image';
import Left from "@/public/left.png";
import Right from "@/public/right.png";
import clent1 from '@/public/clent1.png';
import clent2 from '@/public/clent2.png';
import clent3 from '@/public/clent3.png';
import clent4 from '@/public/clent4.png';
import clent5 from '@/public/clent5.png';
import clent6 from '@/public/clent6.png';
import clent7 from '@/public/clent7.png';
import clent8 from '@/public/clent8.png';
import clent9 from '@/public/clent9.png';
import clent10 from '@/public/clent10.png';
import clent11 from '@/public/clent11.png';
import clent12 from '@/public/clent12.png';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const images = [
  clent1, clent2, clent3, clent4, clent5, clent6,
  clent7, clent8, clent9, clent10, clent11, clent12
];

export default function Slider() {
  const swiperRef = useRef<any>(null);
  const [slidesPerView, setSlidesPerView] = useState<number>(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 500) setSlidesPerView(1);
      else if (window.innerWidth < 1024) setSlidesPerView(2);
      else setSlidesPerView(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full flex justify-center items-center">
      {/* Left Arrow */}
      <div 
        className="absolute left-[7%] top-1/2 -translate-y-1/2 z-20 cursor-pointer hidden sm:block"
        onClick={() => swiperRef.current?.slidePrev()}
      >
        <Image src={Left} width={23} height={23} alt="Left" />
      </div>

      {/* Swiper */}
      <div className="w-full max-w-[1200px] px-[10px] flex items-center">
        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          loop
          spaceBetween={16} // responsive spacing
          slidesPerView={slidesPerView}
        >
          {images.map((src, i) => (
            <SwiperSlide key={i}>
              {/* Parent div միշտ rounded + overflow-hidden */}
              <div className="w-full aspect-[262/312] rounded-[35px] overflow-hidden flex justify-center items-center">
                <Image
                  src={src}
                  alt={`Slide ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Right Arrow */}
      <div 
        className="absolute right-[7%] top-1/2 -translate-y-1/2 z-20 cursor-pointer hidden sm:block"
        onClick={() => swiperRef.current?.slideNext()}
      >
        <Image src={Right} width={23} height={23} alt="Right" />
      </div>
    </div>
  );
}
