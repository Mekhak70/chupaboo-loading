'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

const videos = [
  { src: '/betik.mov', delay: 18000 },
  { src: '/copy_8823C844-0841-4036-8E6E-9CBC9F0CE4E5.mov', delay: 22000 },
  { src: '/Mona.mov', delay: 22000 },
];

export default function PetSlider() {
  return (
    <div
      className="relative mx-auto w-full max-w-md"
      style={{ width: '367px', cursor: 'pointer' }}
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        className="rounded-2xl overflow-hidden"
      >
        {videos.map((video, i) => (
          <SwiperSlide key={i} data-swiper-autoplay={video.delay}>
            
            {/* MAIN CONTAINER — հենց սա է կլորություն պահողը */}
            <div className="w-full h-full rounded-2xl overflow-hidden">

              <video
                src={video.src}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="
                  w-full
                  h-full
                  object-cover
                  lg:scale-110
                "
              />

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
