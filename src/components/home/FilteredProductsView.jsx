// // components/home/FilteredProductsView.jsx
// import React from 'react';
// import ProductCard from '../features/ProductCard';

// const FilteredProductsView = ({ products, onAddToCart, onClearFilters }) => {
//   if (products.length === 0) {
//     return (
//       <div className="text-center py-15 text-stone-400 text-sm">
//         No products match your filters.{" "}
//         <button
//           onClick={onClearFilters}
//           className="text-amber-600 bg-transparent border-none cursor-pointer font-bold hover:underline"
//         >
//           Clear filters
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4.5">
//       {products.map(p => (
//         <ProductCard key={p.id} product={p} addToCart={onAddToCart} />
//       ))}
//     </div>
//   );
// };

// export default FilteredProductsView;