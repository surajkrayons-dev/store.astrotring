import React from 'react';

const Loader = ({data}) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin"></div>
        <p className="text-stone-600 text-sm font-medium">{data}</p>
      </div>
    </div>
  );
};

export default Loader;