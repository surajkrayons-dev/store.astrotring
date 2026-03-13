// pages/HomePage.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

// Import components
import HomeNav from "../components/home/HomeNav";
import BestSellers from "../components/home/BestSellers";
import CategorySection from "../components/home/CategorySection";
import FilteredProductsView from "../components/home/FilteredProductsView";
import FilterSidebar from "../components/features/FilterSidebar";

// Constants and helpers
import { CATEGORIES } from "../constants/categories";
import { addToCart } from "../redux/slices/cartSlice";
import { fetchAllProducts } from '../redux/slices/productSlice';
import HeroBanner from "../components/features/HeroBanner";
import Loader from "@/components/common/Loader";

// Helpers
const getDisplayPrice = (price) => {
  if (typeof price === 'number') return price;
  if (price && typeof price === 'object') {
    return parseFloat(price.after) || parseFloat(price.before) || 0;
  }
  return 0;
};

const getRatingValue = (rating) => {
  if (typeof rating === 'number') return rating;
  if (rating && typeof rating === 'object') {
    return parseFloat(rating.avg) || 0;
  }
  return 0;
};

const groupedCategories = CATEGORIES.filter(c => c.id !== "all");

const HomePage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { items: products, loading, error } = useSelector((state) => state.product);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filters, setFilters] = useState({ search: "", minPrice: "", maxPrice: "", minRating: "", sort: "default" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const sectionRefs = useRef({});

  const [navbarHeight, setNavbarHeight] = useState(64);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.startsWith('#category-')) {
      const catId = hash.replace('#category-', '');
      if (groupedCategories.some(cat => cat.id === catId)) {
        setTimeout(() => {
          scrollToCategory(catId);
        }, 100);
      }
    }
  }, [location]);

  useEffect(() => {
    const measureNavbar = () => {
      const navbar = document.querySelector('nav');
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight);
      }
    };
    measureNavbar();
    window.addEventListener('resize', measureNavbar);
    return () => window.removeEventListener('resize', measureNavbar);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const threshold = 10;

      if (currentScrollY < lastScrollY.current - threshold) {
        setIsNavbarVisible(true);
      } else if (currentScrollY > lastScrollY.current + threshold && currentScrollY > navbarHeight) {
        setIsNavbarVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navbarHeight]);

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

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
  }, [products]);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  if (loading) return <div className="text-center py-10"><Loader data="Loading products..."/></div>;
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
  };

  const clearFilters = () => {
    setFilters({ search: "", minPrice: "", maxPrice: "", minRating: "", sort: "default" });
    setSelectedCategory("all");
  };

  const isFilterActive = filters.search || filters.minPrice || filters.maxPrice || filters.minRating || filters.sort !== "default";

  const homeNavTop = isNavbarVisible ? navbarHeight : 0;
  const sidebarTop = homeNavTop + 60 + 8 + 10; // 60 = approx HomeNav height

  return (
    <div className="px-2 sm:px-4">
      <HeroBanner />
      {/* Gap between HeroBanner and HomeNav */}
      <div className="flex gap-3 sm:gap-4 md:gap-6 mt-4">
        <div className="flex-1 min-w-0">
          <div
            className="sticky z-30 bg-white/95 backdrop-blur-sm transition-all duration-300"
            style={{ top: homeNavTop }}
          >
            <HomeNav
              filters={filters}
              setFilters={setFilters}
              selectedCategory={selectedCategory}
              onSelectCategory={scrollToCategory}
              onClearFilters={clearFilters}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={toggleSidebar}
            />
          </div>

          <div className="flex gap-3 sm:gap-4 md:gap-6 mt-4">
            <aside
              className={`
                sticky transition-all duration-300 ease-in-out overflow-hidden self-start
                ${isSidebarOpen ? 'w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] opacity-100' : 'w-0 opacity-0'}
              `}
              style={{ top: sidebarTop }}
            >
              {/* 👇 Added min-h-0 to allow shrinking, and scrollbar-hide to hide scrollbar */}
              <div
                className="bg-white rounded-2xl border border-gray-200  w-full overflow-y-auto scrollbar-hide min-h-0"
                style={{ maxHeight: `calc(100vh - ${sidebarTop}px - 2rem)` }}
              >
                <FilterSidebar
                  selected={selectedCategory}
                  onSelect={scrollToCategory}
                  filters={filters}
                  setFilters={setFilters}
                  onClearFilters={clearFilters}
                />
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <BestSellers />

              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm text-stone-500 font-semibold">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
                </span>
              </div>

              {isFilterActive ? (
                <FilteredProductsView
                  products={filteredProducts}
                  onAddToCart={handleAddToCart}
                  onClearFilters={clearFilters}
                />
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {groupedCategories.map(cat => {
                    const catProducts = products.filter(p => p.category?.slug === cat.id);
                    return (
                      <CategorySection
                        key={cat.id}
                        category={cat}
                        products={catProducts}
                        onAddToCart={handleAddToCart}
                        ref={el => (sectionRefs.current[cat.id] = el)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;