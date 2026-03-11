// components/home/HomeNav.jsx
import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';

const HomeNav = ({ 
  filters, 
  setFilters, 
  selectedCategory, 
  onSelectCategory, 
  onClearFilters,
  isSidebarOpen,
  onToggleSidebar
}) => {
  // Button text based on sidebar state
  const buttonText = isSidebarOpen ? 'Hide' : 'Show';

  return (
    <>
      {/* Main Nav Bar - same for all devices */}
      <div className="bg-white rounded-xl border border-gray-100 p-2 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3 shadow-md">
        {/* Filter Icon Button - same for all devices */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition text-stone-600 flex items-center gap-1 cursor-pointer"
          aria-label="Toggle filters"
        >
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-medium">
            {buttonText}
          </span>
        </button>

        {/* Search Input */}
        <div className="relative flex-1">
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a8a29e"
            strokeWidth={2}
            strokeLinecap="round"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4"
          >
            <circle cx={11} cy={11} r={8} />
            <line x1={21} y1={21} x2={16.65} y2={16.65} />
          </svg>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search products…"
            className="w-full py-1.5 sm:py-2 px-2 sm:px-3 pl-7 sm:pl-9 rounded-lg border border-gray-200 text-xs sm:text-sm outline-none bg-white focus:border-amber-600 transition"
          />
        </div>

        {/* Sort Dropdown */}
        <select
          value={filters.sort || "default"}
          onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
          className="w-auto py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg border border-gray-200 text-xs sm:text-sm outline-none bg-white cursor-pointer focus:border-amber-600 transition"
        >
          <option value="default">Sort</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="rating">Rating</option>
          <option value="name">Name</option>
        </select>
      </div>
    </>
  );
};

export default HomeNav;