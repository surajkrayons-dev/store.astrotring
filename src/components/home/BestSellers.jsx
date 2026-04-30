import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Slider from "../common/Slider";

// ✅ Price extraction logic - handles both gemstones and regular products
const getProductPrices = (product) => {
  let afterPrice = 0;
  let beforePrice = 0;
  
  // Check if product has ratti_options (gemstone)
  if (product?.ratti_options && product.ratti_options.length > 0) {
    // For gemstones: take the first ratti option's price
    const defaultRattiOption = product.ratti_options[0];
    afterPrice = parseFloat(defaultRattiOption?.ratti_afterPrice) || 0;
    beforePrice = parseFloat(defaultRattiOption?.ratti_beforePrice) || 0;
  } else {
    // For regular products: use direct after_price/before_price
    afterPrice = parseFloat(product?.after_price) || 0;
    beforePrice = parseFloat(product?.before_price) || 0;
  }
  
  return { afterPrice, beforePrice };
};

const getDiscountPercent = (before, after) => {
  if (before > after && after > 0) {
    return Math.round(((before - after) / before) * 100);
  }
  return null;
};

const BestSellers = () => {
  const navigate = useNavigate();
  const { items: products } = useSelector((state) => state.product);

  if (!products.length) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-stone-900 mb-4">
        Best Sellers
      </h2>

      <Slider slideCount={4}>
        {products.map((product) => {
          const { afterPrice, beforePrice } = getProductPrices(product);
          const discount = getDiscountPercent(beforePrice, afterPrice);
          const imageUrl = product.image || product.images?.[0]?.image || "";

          const handleClick = () => {
            navigate(`/product/${product.id}`);
          };

          return (
            <div
              key={product.id}
              onClick={handleClick}
              className="bg-white rounded-xl border border-gray-100 shadow-md p-2 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-[120px] object-cover rounded-lg mb-2"
              />
              <div className="text-xs font-bold truncate">{product.name}</div>

              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-xs font-semibold text-black">
                  ₹{afterPrice.toLocaleString()}
                </span>
                {beforePrice > afterPrice && (
                  <span className="text-[10px] text-gray-400 line-through">
                    ₹{beforePrice.toLocaleString()}
                  </span>
                )}
                {discount && (
                  <span className="text-[10px] text-amber-600 font-semibold">
                    {discount}% OFF
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default BestSellers;