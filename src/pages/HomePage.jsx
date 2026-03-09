import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import FilterSidebar from "../components/features/FilterSidebar";
import ProductCard from "../components/features/ProductCard";
import { CATEGORIES } from "../constants/categories";
import { addToCart } from "../redux/slices/cartSlice";
import { fetchAllProducts } from '../redux/slices/productSlice';

const groupedCategories = CATEGORIES.filter(c => c.id !== "all");

// Helper to extract numeric price from possible object
const getDisplayPrice = (price) => {
  if (typeof price === 'number') return price;
  if (price && typeof price === 'object') {
    return parseFloat(price.after) || parseFloat(price.before) || 0;
  }
  return 0;
};

// Helper to extract numeric rating from possible object
const getRatingValue = (rating) => {
  if (typeof rating === 'number') return rating;
  if (rating && typeof rating === 'object') {
    return parseFloat(rating.avg) || 0;
  }
  return 0;
};

const HomePage = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.product);
  const cartItems = useSelector(state => state.cart.items);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filters, setFilters] = useState({ search: "", minPrice: "", maxPrice: "", minRating: "", sort: "default" });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const sectionRefs = useRef({});

  // Debug logs
  useEffect(() => {
    console.log('🔥 All products from API:', products);
    if (products.length > 0) {
      console.log('🔍 First product category:', products[0]?.category);
    }
  }, [products]);

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Intersection observer
  useEffect(() => {
    const observers = [];
    groupedCategories.forEach(cat => {
      const el = sectionRefs.current[cat.id];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setSelectedCategory(cat.id); }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let list = selectedCategory === "all"
      ? [...products]
      : products.filter(p => p.category?.slug === selectedCategory);
    
    if (filters.search) {
      list = list.filter(p => p.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.minPrice) {
      list = list.filter(p => getDisplayPrice(p.price) >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      list = list.filter(p => getDisplayPrice(p.price) <= Number(filters.maxPrice));
    }
    if (filters.minRating) {
      list = list.filter(p => getRatingValue(p.rating) >= Number(filters.minRating));
    }
    
    // Sorting
    if (filters.sort === "price-asc") {
      list.sort((a, b) => getDisplayPrice(a.price) - getDisplayPrice(b.price));
    } else if (filters.sort === "price-desc") {
      list.sort((a, b) => getDisplayPrice(b.price) - getDisplayPrice(a.price));
    } else if (filters.sort === "rating") {
      list.sort((a, b) => getRatingValue(b.rating) - getRatingValue(a.rating));
    } else if (filters.sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return list;
  }, [selectedCategory, filters, products]);

  if (loading) return <div className="text-center py-10">Loading products...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  if (!products.length) return <div className="text-center py-10">No products found</div>;

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart!`);
  };

  const scrollToCategory = (catId) => {
    setSelectedCategory(catId);
    if (catId !== "all" && sectionRefs.current[catId]) {
      sectionRefs.current[catId].scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (catId === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters({ search: "", minPrice: "", maxPrice: "", minRating: "", sort: "default" });
    setSelectedCategory("all");
  };

  return (
    <div className="min-h-screen bg-stone-50 font-['Segoe_UI',system-ui,sans-serif]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-7">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-semibold text-stone-700 shadow-sm hover:bg-gray-50 transition"
          >
            ✦ Filters
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:sticky lg:top-20 w-[260px] flex-shrink-0 max-h-[calc(100vh-5rem)] overflow-y-auto hide-scrollbar">
            <FilterSidebar
              selected={selectedCategory}
              onSelect={scrollToCategory}
              filters={filters}
              setFilters={setFilters}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Mobile Filter Drawer - Improved with multiple close options */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setMobileFiltersOpen(false)}
              />
              {/* Drawer */}
              <div className="absolute inset-y-0 left-0 w-[50%] max-w-sm bg-white shadow-xl overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <FilterSidebar
                    selected={selectedCategory}
                    onSelect={scrollToCategory}
                    filters={filters}
                    setFilters={setFilters}
                    onClearFilters={clearFilters}
                    className="border-0 shadow-none p-0"
                  />
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full bg-amber-600 text-white py-2 rounded-lg font-semibold hover:bg-amber-700 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Area */}
          <div className="flex-1 w-full min-w-0">
            {/* Search & Sort Bar */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 shadow-md mb-5">
              <div className="relative flex-1">
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a8a29e"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  <circle cx={11} cy={11} r={8} />
                  <line x1={21} y1={21} x2={16.65} y2={16.65} />
                </svg>
                <input
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  placeholder="Search products…"
                  className="w-full py-2 px-3 pl-9 rounded-lg border border-gray-200 text-sm outline-none bg-white focus:border-amber-600"
                />
              </div>
              <select
                value={filters.sort || "default"}
                onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                className="w-full sm:w-auto py-2 px-3 rounded-lg border border-gray-200 text-sm outline-none bg-white cursor-pointer focus:border-amber-600"
              >
                <option value="default">Sort by</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Rating</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>

            {/* Best Sellers Carousel */}
            <div className="overflow-hidden mb-7">
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mb-3 capitalize">Best Sellers</h2>
              <div className="flex gap-4 w-max animate-[scrollX_200s_linear_infinite]">
                {products.map((p) => (
                  <div key={p.id} className="min-w-[200px] sm:min-w-[220px] bg-white rounded-xl border border-gray-100 shadow-md p-2.5">
                    <img src={p.image} alt={p.name} className="w-full h-[120px] sm:h-[140px] object-cover rounded-lg mb-2" />
                    <div className="text-sm font-bold text-stone-900 mb-1 truncate">{p.name}</div>
                    <div className="text-xs sm:text-[13px] font-bold text-amber-600">
                      ₹{getDisplayPrice(p.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <style>{`
              @keyframes scrollX {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs sm:text-sm text-stone-500 font-semibold">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
              </span>
            </div>

            {/* Products Grid */}
            {filters.search || filters.minPrice || filters.maxPrice || filters.minRating || filters.sort !== "default" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4.5">
                  {filteredProducts.map(p => <ProductCard key={p.id} product={p} addToCart={handleAddToCart} />)}
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-15 text-stone-400 text-sm">
                    No products match your filters.{" "}
                    <button onClick={clearFilters} className="text-amber-600 bg-transparent border-none cursor-pointer font-bold hover:underline">
                      Clear filters
                    </button>
                  </div>
                )}
              </>
            ) : (
              groupedCategories.map(cat => {
                const catProducts = products.filter(p => p.category?.slug === cat.id);
                return (
                  <div key={cat.id} ref={el => (sectionRefs.current[cat.id] = el)} className="mt-8 scroll-mt-[110px]">
                    <div className="flex items-center gap-2.5 mb-3.5">
                      <span className="text-xl">{cat.icon}</span>
                      <h3 className="text-base sm:text-lg font-extrabold text-stone-900">{cat.label}</h3>
                      <span className="text-xs text-stone-400 font-semibold">({catProducts.length})</span>
                      <div className="flex-1 h-px bg-stone-200 ml-2" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4.5">
                      {catProducts.map(p => <ProductCard key={p.id} product={p} addToCart={handleAddToCart} />)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;