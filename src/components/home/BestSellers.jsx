// import React from "react"
// import { useSelector } from "react-redux"
// import Slider from "../slider/Slider"

// // Helper to safely get numeric price from various formats
// const getPriceValue = (price, type = 'after') => {
//   if (!price) return 0
//   if (typeof price === 'number') return price
//   if (typeof price === 'object') {
//     if (type === 'after') return parseFloat(price.after) || 0
//     if (type === 'before') return parseFloat(price.before) || 0
//   }
//   return 0
// }

// // Optional: calculate discount percentage
// const getDiscountPercent = (before, after) => {
//   if (before > after && after > 0) {
//     return Math.round(((before - after) / before) * 100)
//   }
//   return null
// }

// const BestSellers = () => {
//   const { items: products } = useSelector((state) => state.product)
//   console.log("best",products)

//   if (!products.length) return null

//   return (
//     <div className="mb-6">
//       <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-stone-900 mb-4">
//         Best Sellers
//       </h2>

//       <Slider slideCount={4}>
//         {products.map((p) => {
//           // Extract prices
//           const afterPrice = getPriceValue(p.price, 'after')
//           const beforePrice = getPriceValue(p.price, 'before') || afterPrice // fallback if before missing
//           const discount = getDiscountPercent(beforePrice, afterPrice)

//           return (
//             <div
//               key={p.id}
//               className="bg-white rounded-xl border border-gray-100 shadow-md p-2"
//             >
//               <img
//                 src={p.image}
//                 alt={p.name}
//                 className="w-full h-[120px] object-cover rounded-lg mb-2"
//               />
//               <div className="text-sm font-bold truncate">{p.name}</div>

//               {/* Price display */}
//               <div className="flex items-baseline gap-1 flex-wrap">
//                 <span className="text-sm font-bold text-amber-600">
//                   ₹{afterPrice.toLocaleString()}
//                 </span>
//                 {beforePrice > afterPrice && (
//                   <span className="text-xs text-gray-400 line-through">
//                     ₹{beforePrice.toLocaleString()}
//                   </span>
//                 )}
//                 {/* {discount && (
//                   <span className="text-xs text-red-600 font-semibold">
//                     {discount}% OFF
//                   </span>
//                 )} */}
//               </div>
//             </div>
//           )
//         })}
//       </Slider>
//     </div>
//   )
// }

// export default BestSellers



import React from "react"
import { useSelector } from "react-redux"
import Slider from "../slider/Slider"

// Direct price extractors for new API structure
const getAfterPrice = (product) => {
  return parseFloat(product?.after_price) || 0
}

const getBeforePrice = (product) => {
  return parseFloat(product?.before_price) || 0
}

const getDiscountPercent = (before, after) => {
  if (before > after && after > 0) {
    return Math.round(((before - after) / before) * 100)
  }
  return null
}

const BestSellers = () => {
  const { items: products } = useSelector((state) => state.product)
  console.log("best", products)

  if (!products.length) return null

  return (
    <div className="mb-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-stone-900 mb-4">
        Best Sellers
      </h2>

      <Slider slideCount={4}>
        {products.map((p) => {
          const afterPrice = getAfterPrice(p)
          const beforePrice = getBeforePrice(p)
          const discount = getDiscountPercent(beforePrice, afterPrice)

          // Fallback image: p.image or first from images array
          const imageUrl = p.image || (p.images && p.images[0]?.image) || ''

          return (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-100 shadow-md p-2"
            >
              <img
                src={imageUrl}
                alt={p.name}
                className="w-full h-[120px] object-cover rounded-lg mb-2"
              />
              <div className="text-sm font-bold truncate">{p.name}</div>

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
          )
        })}
      </Slider>
    </div>
  )
}

export default BestSellers






