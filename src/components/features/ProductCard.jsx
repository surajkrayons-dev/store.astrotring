

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "../common/StarRating";

const ProductCard = ({ product, addToCart, compact = false }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  // ✅ Direct extraction from API fields (with fallbacks)
  const afterPrice = parseFloat(product?.after_price) || 0;
  const beforePrice = parseFloat(product?.before_price) || 0;
  const ratingValue = parseFloat(product?.rating_avg) || 0;


  // default ratti
  const defaultRatti = product?.ratti_options?.length ? product.ratti_options[0].ratti : null;
  // Discount percentage
  const savings =
    beforePrice > afterPrice && afterPrice > 0
      ? Math.round(((beforePrice - afterPrice) / beforePrice) * 100)
      : 0;

  // Image fallback: product.image or first from images array
  const imageUrl = product?.image || product?.images?.[0]?.image || "";

  // Conditional classes (unchanged)
  const cardClass = compact
    ? "bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-250 flex flex-col  w-full"
    : "bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-250 flex flex-col  hover:shadow-xl hover:-translate-y-0.5 shadow-md w-full cursor-pointer";

  const badgeSize = compact ? "text-[8px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5";
  const overlayButtonClass = compact
    ? "flex-1 py-1 bg-white text-amber-900 border border-amber-300 rounded-lg text-[9px] font-bold hover:bg-amber-50 transition-colors cursor-pointer"
    : "flex-1 py-1.5 bg-white text-amber-900 border border-amber-300 rounded-lg text-xs font-bold hover:bg-amber-50 transition-colors cursor-pointer";

  const overlayCartClass = compact
    ? "flex-1 py-1 bg-amber-600 text-white border-none rounded-lg text-[9px] font-bold flex items-center justify-center gap-0.5 hover:bg-amber-700 transition-colors cursor-pointer"
    : "flex-1 py-1.5 bg-amber-600 text-white border-none rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-amber-700 transition-colors cursor-pointer";

  const nameClass = compact
    ? "text-[11px] font-bold text-stone-800 truncate"
    : "text-xs sm:text-sm font-bold text-stone-800 leading-snug line-clamp-2 mb-1.5";

  const priceClass = compact
    ? "text-xs font-extrabold text-stone-900"
    : "text-base sm:text-lg font-extrabold text-stone-900";

  const oldPriceClass = compact
    ? "text-[8px] text-stone-400 line-through"
    : "text-[10px] sm:text-xs text-stone-400 line-through";

  const ratingSize = compact ? 10 : 12;
  const ratingTextClass = compact ? "text-[8px]" : "text-[10px] sm:text-xs";
  const quickAddSize = compact ? "w-6 h-6" : "w-7 h-7 sm:w-9 sm:h-9";
  const quickAddIconSize = compact ? 10 : 14;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cardClass}
    >
      {/* Image container */}
      <div
        className="relative bg-stone-50 overflow-hidden aspect-square cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/product/${product?.id}`);
        }}
      >
        <img
          src={imageUrl}
          alt={product?.name}
          className={`w-full h-full object-cover transition-transform duration-350 ${hovered ? "scale-105" : "scale-100"
            }`}
          loading="lazy"
          onError={(e) => {
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50' y='115' font-family='Arial' font-size='16' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E";
          }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product?.isBestseller && (
            <span
              className={`bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold rounded-md tracking-wider uppercase shadow-md ${badgeSize}`}
            >
              ⚡ Best Seller
            </span>
          )}
        </div>

        {savings > 0 && (
          <div className="absolute top-2 right-2">
            <span
              className={`bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold rounded-md shadow-md ${badgeSize}`}
            >
              {savings}% OFF
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-900/70 to-transparent px-2 py-2 pt-6 transition-opacity duration-250 ${hovered ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product?.id}`);
              }}
              className={overlayButtonClass}
            >
              View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart({
                  product_id: product?.id,
                  quantity: 1,
                  name: product?.name,
                  ratti: defaultRatti
                });
              }}
              className={overlayCartClass}
            >
              <svg
                width={compact ? 10 : 12}
                height={compact ? 10 : 12}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx={9} cy={21} r={1} />
                <circle cx={20} cy={21} r={1} />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="hidden xs:inline">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product info */}
      <div className={`${compact ? "p-1.5" : "p-2.5 sm:p-3.5"} flex-1 flex flex-col`}>
        <h3 className={nameClass}>{product?.name}</h3>

        <div className="flex items-center gap-1 mb-1">
          <StarRating value={ratingValue} size={ratingSize} />
          <span className={`text-stone-500 font-semibold ${ratingTextClass}`}>
            {ratingValue.toFixed(1)}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className={priceClass}>₹{afterPrice.toLocaleString()}</div>
            {beforePrice > afterPrice && (
              <div className={oldPriceClass}>₹{beforePrice.toLocaleString()}</div>
            )}
          </div>

          {/* Quick add button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                product_id: product?.id,
                quantity: 1,
                name: product?.name,
                ratti: defaultRatti
              });
            }}
            className={`bg-amber-100 border border-amber-300 text-amber-900 rounded-lg cursor-pointer flex items-center justify-center transition-colors hover:bg-amber-200 ${quickAddSize}`}
            aria-label="Add to cart"
          >
            <svg
              width={quickAddIconSize}
              height={quickAddIconSize}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#92400e"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
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