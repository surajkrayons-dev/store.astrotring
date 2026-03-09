import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBanners } from '../../redux/slices/bannerSlice';

const HeroBanner = () => {
  const dispatch = useDispatch();
  const { banners, loading, error } = useSelector((state) => state.banner);
  const [current, setCurrent] = useState(0);

  // Fetch banners on mount
  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners]);

  // Sort banners by sort_order
  const sortedBanners = [...banners].sort((a, b) => a.sort_order - b.sort_order);

  if (loading) return <div className="h-[180px] md:h-[220px] lg:h-[260px] bg-gray-200 animate-pulse rounded-[18px]" />;
  if (error) return <div className="h-[180px] md:h-[220px] lg:h-[260px] bg-red-100 rounded-[18px] flex items-center justify-center text-red-600">Banner load failed</div>;
  if (!banners.length) return null;

  const currentBanner = sortedBanners[current];

  return (
    <div className="relative w-full rounded-[18px] overflow-hidden min-h-[180px] md:min-h-[220px] lg:min-h-[260px] flex items-center transition-all duration-700 bg-gradient-to-r from-amber-800 to-stone-800">
      {/* Decorative circles – hidden on small screens */}
      <div className="absolute -top-[60px] -right-10 w-[260px] h-[260px] rounded-full bg-amber-600/12 hidden md:block" />
      <div className="absolute -bottom-20 right-20 w-[200px] h-[200px] rounded-full bg-amber-600/7 hidden md:block" />
      <div className="absolute top-[30px] left-[55%] w-[120px] h-[120px] rounded-full border-2 border-amber-600/15 hidden lg:block" />

      {/* Banner Media */}
      <div className="relative z-[2] w-full h-full flex items-center justify-center px-4">
        {currentBanner.media_type === 'image' ? (
          <img
            src={currentBanner.media_url}
            alt={`Banner ${current + 1}`}
            className="max-h-[140px] md:max-h-[180px] lg:max-h-[220px] w-auto object-contain"
          />
        ) : (
          <video
            src={currentBanner.media_url}
            autoPlay
            loop
            muted
            className="max-h-[140px] md:max-h-[180px] lg:max-h-[220px] w-auto object-contain"
          />
        )}
      </div>

      {/* Dots navigation */}
      <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {sortedBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 md:h-2 rounded-full cursor-pointer transition-all duration-300 ${
              i === current
                ? 'w-4 md:w-6 bg-amber-600'
                : 'w-1.5 md:w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;