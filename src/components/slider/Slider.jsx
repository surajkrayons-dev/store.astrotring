"use client"

import { useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper";

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

import { FaArrowLeft, FaArrowRight } from "react-icons/fa"

const Slider = ({ children, slideCount }) => {

  const prevRef = useRef(null)
  const nextRef = useRef(null)

  return (
    <div className="relative ">

      <button
        ref={prevRef}
        className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-bold shadow-[inset_0_0_0_1.5px_#fcd34d]  rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
      >
        <FaArrowLeft />
      </button>

      <button
        ref={nextRef}
        className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-bold shadow-[inset_0_0_0_1.5px_#fcd34d]  rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
      >
        <FaArrowRight />
      </button>

      <Swiper
  modules={[Navigation, Pagination, Autoplay]}
  spaceBetween={20}
 
  // pagination={{
  //   clickable: true
  // }}

  onBeforeInit={(swiper) => {
    swiper.params.navigation.prevEl = prevRef.current
    swiper.params.navigation.nextEl = nextRef.current
  }}

  navigation={{
    prevEl: prevRef.current,
    nextEl: nextRef.current,
  }}

  breakpoints={{
    0: { slidesPerView: 1 },
    640: { slidesPerView: 2 },
    1024: { slidesPerView: slideCount || 4 },
  }}
  autoplay={{
  delay: 2500,
  disableOnInteraction: false,
  pauseOnMouseEnter: true
}}
>
        {children?.map((child, index) => (
          <SwiperSlide key={index}>{child}</SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default Slider