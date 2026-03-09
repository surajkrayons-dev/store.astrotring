import { useState } from "react";
import { CATEGORIES } from "../../constants/categories";
import StarRating from "../common/StarRating";
import { products } from "../../data/Data";

const FilterSidebar = ({ selected, onSelect, filters, setFilters, onClearFilters, className = '' }) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
    discount: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const SectionHeader = ({ title, section }) => (
    <div
      onClick={() => toggleSection(section)}
      className={`flex items-center justify-between py-2.5 cursor-pointer select-none border-b border-gray-100 ${
        expandedSections[section] ? 'mb-3' : 'mb-0'
      }`}
    >
      <span className="text-[13px] font-bold text-stone-800 tracking-wide uppercase">{title}</span>
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#78716c"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-200 ${expandedSections[section] ? 'rotate-180' : 'rotate-0'}`}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-md p-5 px-4.5 overflow-y-auto ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100">
        <div className="text-[15px] font-extrabold text-stone-900 tracking-tight">Filters</div>
        <button onClick={onClearFilters} className="bg-transparent border-none text-amber-600 text-xs font-bold cursor-pointer underline hover:text-amber-700">
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div className="mb-5">
        <SectionHeader title="Categories" section="categories" />
        {expandedSections.categories && (
          <div>
            {CATEGORIES.map((cat) => {
              const active = selected === cat.id;
              const count = cat.id === "all" ? products.length : products.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id)}
                  className={`w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-[9px] border-none cursor-pointer mb-1 text-[13px] transition-all ${
                    active
                      ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-bold shadow-[inset_0_0_0_1.5px_#fcd34d]'
                      : 'bg-transparent text-stone-600 font-medium hover:bg-stone-50'
                  }`}
                >
                  <span className="text-[15px]">{cat.icon}</span>
                  <span className="flex-1">{cat.label}</span>
                  <span className="text-[11px] text-stone-400 font-semibold">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range – Stacked Vertically with "to" label */}
      <div className="mb-5">
        <SectionHeader title="Price Range" section="price" />
        {expandedSections.price && (
          <div className="flex flex-col gap-1">
            {/* Min Input */}
            <input
              type="number"
              value={filters.minPrice}
              onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
              placeholder="Min price"
              className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-amber-600"
            />
            {/* "to" label */}
            <span className="text-center text-stone-400 text-sm font-mono">to</span>
            {/* Max Input */}
            <input
              type="number"
              value={filters.maxPrice}
              onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
              placeholder="Max price"
              className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-amber-600"
            />

            {/* Quick price filters */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {[
                { label: "Under ₹1K", min: "", max: "1000" },
                { label: "₹1K - ₹3K", min: "1000", max: "3000" },
                { label: "₹3K - ₹5K", min: "3000", max: "5000" },
                { label: "Above ₹5K", min: "5000", max: "" },
              ].map((range, i) => (
                <button
                  key={i}
                  onClick={() => setFilters(f => ({ ...f, minPrice: range.min, maxPrice: range.max }))}
                  className={`px-2.5 py-1.5 rounded-md border text-[11px] font-semibold cursor-pointer transition-all ${
                    filters.minPrice === range.min && filters.maxPrice === range.max
                      ? 'border-amber-300 bg-amber-100 text-amber-900'
                      : 'border-gray-200 bg-white text-stone-500 hover:bg-gray-50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-5">
        <SectionHeader title="Customer Rating" section="rating" />
        {expandedSections.rating && (
          <div className="flex flex-col gap-2">
            {[4, 3, 2, 1].map(rating => (
              <label key={rating} className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg transition-colors hover:bg-stone-50">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === String(rating)}
                  onChange={() => setFilters(f => ({ ...f, minRating: String(rating) }))}
                  className="cursor-pointer"
                />
                <StarRating value={rating} size={13} />
                <span className="text-xs text-stone-500 font-semibold">& Up</span>
              </label>
            ))}
            <label className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg transition-colors hover:bg-stone-50">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === ""}
                onChange={() => setFilters(f => ({ ...f, minRating: "" }))}
                className="cursor-pointer"
              />
              <span className="text-xs text-stone-500 font-semibold">All Ratings</span>
            </label>
          </div>
        )}
      </div>

      {/* Discount */}
      <div className="mb-5">
        <SectionHeader title="Discount" section="discount" />
        {expandedSections.discount && (
          <div className="flex flex-col gap-2">
            {["50", "40", "30", "20", "10"].map(discount => (
              <label key={discount} className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg transition-colors hover:bg-stone-50">
                <input type="checkbox" className="cursor-pointer" />
                <span className="text-xs text-stone-500 font-semibold">{discount}% or more</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;