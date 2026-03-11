import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "../common/StarRating";

// Helper to extract rating
const getRatingValue = (rating) => {
  if (typeof rating === 'number') return rating;
  if (rating && typeof rating === 'object') {
    return parseFloat(rating.avg) || 0;
  }
  return 0;
};

// Helper to get after price (current price)
const getAfterPrice = (price) => {
  if (!price) return 0;
  if (typeof price === 'number') return price;
  if (typeof price === 'object') {
    return parseFloat(price.after) || 0;
  }
  return 0;
};

// Helper to get before price (original price)
const getBeforePrice = (price) => {
  if (!price) return 0;
  if (typeof price === 'number') return price; // fallback
  if (typeof price === 'object') {
    return parseFloat(price.before) || 0;
  }
  return 0;
};

const ProductCard = ({ product, addToCart }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  
  // Extract prices correctly
  const afterPrice = getAfterPrice(product.price);
  const beforePrice = getBeforePrice(product.price);
  const ratingValue = getRatingValue(product.rating);
  
  // Calculate discount percentage if before > after
  const savings = beforePrice > afterPrice && afterPrice > 0
    ? Math.round(((beforePrice - afterPrice) / beforePrice) * 100)
    : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-250 flex flex-col cursor-pointer hover:shadow-xl hover:-translate-y-0.5 shadow-md w-full"
    >
      {/* Image container with aspect ratio */}
      <div className="relative bg-stone-50 overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-350 ${
            hovered ? 'scale-105' : 'scale-100'
          }`}
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isBestseller && (
            <span className="bg-gradient-to-br from-amber-600 to-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase">
              ⚡ Best Seller
            </span>
          )}
        </div>
        
        {/* Discount badge - project colors (amber gradient) */}
        {savings > 0 && (
          <div className="absolute top-2 right-2">
            <span className="bg-gradient-to-br from-amber-600 to-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
              {savings}% OFF
            </span>
          </div>
        )}

        {/* Quick action overlay – visible on hover (desktop) */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-900/70 to-transparent px-2 py-2 pt-6 transition-opacity duration-250 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product.id}`);
              }}
              className="flex-1 py-1.5 bg-white text-amber-900 border border-amber-300 rounded-lg text-xs font-bold cursor-pointer hover:bg-amber-50 transition-colors"
            >
              View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="flex-1 py-1.5 bg-amber-600 text-white border-none rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-1 hover:bg-amber-700 transition-colors"
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx={9} cy={21} r={1} />
                <circle cx={20} cy={21} r={1} />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="hidden xs:inline">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content – responsive text sizes */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col">
        <h3 className="text-xs sm:text-sm font-bold text-stone-800 leading-snug line-clamp-2 mb-1.5">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1 mb-2">
          <StarRating value={ratingValue} size={12} />
          <span className="text-[10px] sm:text-xs text-stone-500 font-semibold">
            {ratingValue.toFixed(1)}
          </span>
        </div>
        
        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="text-base sm:text-lg font-extrabold text-stone-900">
              ₹{afterPrice.toLocaleString()}
            </div>
            {beforePrice > afterPrice && (
              <div className="text-[10px] sm:text-xs text-stone-400 line-through">
                ₹{beforePrice.toLocaleString()}
              </div>
            )}
          </div>
          
          {/* Quick add button – always visible on mobile */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="bg-amber-100 border border-amber-300 text-amber-900 w-7 h-7 sm:w-9 sm:h-9 rounded-lg cursor-pointer flex items-center justify-center transition-colors hover:bg-amber-200"
            aria-label="Add to cart"
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#92400e"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:w-4 sm:h-4"
            >
              <line x1={12} y1={5} x2={12} y2={19} />
              <line x1={5} y1={12} x2={19} y2={12} />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;