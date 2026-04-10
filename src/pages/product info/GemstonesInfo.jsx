// src/pages/Gemstonesinfo.jsx
import React from "react";

import GemstoneInfoCard from "@/components/product info card/GemstoneInfoCard";
import { gemstonesCardInfoData } from "@/constants/product info data/gemstoneCardInfoData";

const Gemstonesinfo = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-600 mb-2">
            Gemstones Info
          </h1>
          <div className="w-24 h-1 bg-orange-200 mx-auto rounded-full my-3"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore wide range of natural and treated gemstones.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {gemstonesCardInfoData.map((gemstone) => (
            <GemstoneInfoCard key={gemstone.id} gemstone={gemstone} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gemstonesinfo;