import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../redux/slices/productSlice";
import { addToCart, fetchCart } from "../redux/slices/cartSlice";
import { openLoginModal } from "@/redux/slices/uiSlice";

import Loader from "@/components/common/Loader";
import ProductCard from "@/components/features/ProductCard";
import { toast } from "react-toastify";
import { categoryStaticData } from "../constants/categoryStaticData";
import AccordionSection from "@/components/common/AccordionSection";

/* ---------- MAIN ---------- */
const CategoryPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const { items, loading, error } = useSelector((s) => s.product);
  const { isLoggedIn } = useSelector((s) => s.userAuth);

  useEffect(() => {
    if (!items.length) dispatch(fetchAllProducts());
  }, [dispatch, items.length]);

  const products = useMemo(() => {
    if (!items.length) return [];
    if (slug === "all") return items;
    return items.filter((p) => p.category?.slug === slug);
  }, [items, slug]);

  const data = categoryStaticData[slug] || categoryStaticData.default;

  const handleAddToCart = async ({ product_id, quantity, name }) => {
    if (!isLoggedIn) {
      toast.warning("Login required");
      dispatch(openLoginModal());
      return;
    }
    try {
      await dispatch(addToCart({ product_id, quantity })).unwrap();
      toast.success(`${name} added`);
      dispatch(fetchCart());
    } catch {
      toast.error("Failed to add");
    }
  };

  if (loading) return <Loader data="Loading..." />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------- HEADER ---------- */}
      <div className="border-b border-gray-300 flex items-center justify-center">
        <div className="max-w-full mx-auto px-4 pb-6">
          <h1 className="text-5xl font-medium text-gray-900 capitalize">
            {slug === "all" ? "All Products" : slug}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Discover authentic & high-quality items
          </p>
        </div>
      </div>

      {/* ---------- PRODUCTS & INFO SECTIONS (full width) ---------- */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* Info Sections (About, Benefits, Quality & Price) */}
        <div className="mt-12 space-y-8">
          <div>
            <h2 className="text-2xl font-medium mb-2">About</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{data.about}</p>
          </div>
          <div>
            <h2 className="text-2xl font-medium mb-2">Benefits</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{data.benefits}</p>
          </div>
          <div>
            <h2 className="text-2xl font-medium mb-2">Quality & Price</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{data.qualityPrice}</p>
          </div>
        </div>
      </div>

      {/* ---------- FAQ SECTION (centered & narrow) ---------- */}
      <div className="bg-white">
      {data.faqs?.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-medium mb-10 text-center">FAQs</h2>
          <div className="space-y-3">
            {data.faqs.map((faq, i) => (
              <AccordionSection key={i} title={faq.q}>
                <p className="text-gray-700 leading-relaxed">{faq.a}</p>
              </AccordionSection>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CategoryPage;