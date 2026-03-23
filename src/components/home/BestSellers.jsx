import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // 👈 import useNavigate
import Slider from "../common/Slider";

const getAfterPrice = (product) => parseFloat(product?.after_price) || 0;
const getBeforePrice = (product) => parseFloat(product?.before_price) || 0;

const getDiscountPercent = (before, after) => {
  if (before > after && after > 0) {
    return Math.round(((before - after) / before) * 100);
  }
  return null;
};

const BestSellers = () => {
  const navigate = useNavigate(); // 👈 initialize navigate
  const { items: products } = useSelector((state) => state.product);

  if (!products.length) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-stone-900 mb-4">
        Best Sellers
      </h2>

      <Slider slideCount={4}>
        {products.map((product) => {
          const afterPrice = getAfterPrice(product);
          const beforePrice = getBeforePrice(product);
          const discount = getDiscountPercent(beforePrice, afterPrice);
          const imageUrl = product.image || product.images?.[0]?.image || "";

          // 👇 click handler to navigate to product page
          const handleClick = () => {
            navigate(`/product/${product.id}`);
          };

          return (
            <div
              key={product}
              onClick={handleClick}
              className="bg-white rounded-xl border border-gray-100 shadow-md p-2 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-[120px] object-cover rounded-lg mb-2"
              />
              <div className="text-sm font-bold truncate">{product.name}</div>

              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-sm font-bold text-amber-600">
                  ₹{afterPrice.toLocaleString()}
                </span>
                {beforePrice > afterPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{beforePrice.toLocaleString()}
                  </span>
                )}
                {discount && (
                  <span className="text-xs text-red-600 font-semibold">
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