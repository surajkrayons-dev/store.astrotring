import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// स्लाइड्स का डेटा - इसे आप बाद में API से भी ला सकते हैं
const promoSlides = [
  {
    id: 1,
    text: "🚚 फ्री शिपिंग सभी ऑर्डर पर ₹999 से ऊपर",
    bgColor: "bg-amber-600",
  },
  {
    id: 2,
    text: "🎉 नए ग्राहकों के लिए 10% अतिरिक्त छूट",
    bgColor: "bg-stone-700",
  },
  {
    id: 3,
    text: "✨ प्रीमियम रत्नों पर 20% तक की छूट",
    bgColor: "bg-amber-700",
  },
];

const TopPromoSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // स्लाइडर को बंद करने के लिए
  const intervalRef = useRef(null);

  // ऑटो-स्लाइड के लिए इंटरवल
  useEffect(() => {
    if (!isPaused && isVisible) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % promoSlides.length);
      }, 4000); // हर 4 सेकंड में बदलें
    }
    return () => clearInterval(intervalRef.current);
  }, [isPaused, isVisible]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % promoSlides.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + promoSlides.length) % promoSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const closeSlider = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const currentSlide = promoSlides[currentIndex];

  return (
    <div className={`w-full ${currentSlide.bgColor} text-white transition-all duration-500`}>
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* बायाँ तीर */}
        <button
          onClick={goToPrev}
          className="p-1 hover:bg-white/20 rounded-full transition"
          aria-label="पिछला प्रोमो"
        >
          <ChevronLeft size={18} />
        </button>

        {/* स्लाइड कंटेंट - यहाँ होवर करने पर ऑटो-स्लाइड रुक जाएगा */}
        <div
          className="flex-1 text-center font-medium text-sm md:text-base px-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {currentSlide.text}
        </div>

        {/* दायाँ तीर और बंद करने का बटन */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToNext}
            className="p-1 hover:bg-white/20 rounded-full transition"
            aria-label="अगला प्रोमो"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={closeSlider}
            className="p-1 hover:bg-white/20 rounded-full transition"
            aria-label="प्रोमो बार बंद करें"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* डॉट्स नेविगेशन (वैकल्पिक) */}
      <div className="flex justify-center gap-1 pb-1">
        {promoSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
            }`}
            aria-label={`स्लाइड ${index + 1} पर जाएँ`}
          />
        ))}
      </div>
    </div>
  );
};

export default TopPromoSlider;