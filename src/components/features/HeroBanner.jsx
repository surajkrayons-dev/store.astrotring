import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBanners } from '../../redux/slices/bannerSlice';

const HeroBanner = () => {
  const dispatch = useDispatch();
  const { banners, loading, error } = useSelector((state) => state.banner);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch banners on mount
  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  // Auto-slide only for images (exactly like Banner component)
  useEffect(() => {
    if (banners.length === 0) return;
    const currentItem = banners[currentIndex];
    if (currentItem?.media_type === 'image') {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, banners]);

  // Sort banners by sort_order
  const sortedBanners = [...banners].sort((a, b) => a.sort_order - b.sort_order);

  // Loading and error states with fixed heights (as per original HeroBanner)
  if (loading) return <div className="w-full h-[180px] md:h-[220px] lg:h-[260px] bg-gray-200 animate-pulse rounded-[18px]" />;
  if (error) return <div className="w-full h-[180px] md:h-[220px] lg:h-[260px] bg-red-100 rounded-[18px] flex items-center justify-center text-red-600">Banner load failed</div>;
  if (!banners.length) return null;

  return (
    <div className="w-full h-full mx-auto overflow-hidden border border-white rounded-[18px]">
      {sortedBanners.length > 0 && (
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {sortedBanners.map((item) => (
            <div key={item.id} className="w-full h-full flex-shrink-0">
              {item.media_type === 'video' ? (
                <video
                  src={item.media_url}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onEnded={() =>
                    setCurrentIndex((prev) => (prev + 1) % sortedBanners.length)
                  }
                />
              ) : (
                <img
                  src={item.media_url}
                  alt={`Banner ${item.id}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;