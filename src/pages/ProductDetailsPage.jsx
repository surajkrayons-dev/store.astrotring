import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingCart,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { toast } from "react-toastify"; // 👈 Import toast
import { addToCart } from "../redux/slices/cartSlice";
import {
  fetchProductById,
  clearSelectedProduct,
} from "../redux/slices/productSlice";

// Fallback image (inline SVG)
const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50' y='115' font-family='Arial' font-size='16' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E";

// Helper to get numeric rating from possible object
const getRatingValue = (rating) => {
  if (typeof rating === "number") return rating;
  if (rating && typeof rating === "object") {
    return parseFloat(rating.avg) || 0;
  }
  return 0;
};

// Helper to get after price (current price) from price object
const getAfterPrice = (price) => {
  if (!price) return 0;
  if (typeof price === "number") return price;
  if (typeof price === "object") {
    return parseFloat(price.after) || 0;
  }
  return 0;
};

// Helper to get before price (original price) from price object
const getBeforePrice = (price) => {
  if (!price) return 0;
  if (typeof price === "number") return price;
  if (typeof price === "object") {
    return parseFloat(price.before) || 0;
  }
  return 0;
};

const ProductDetailsPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { id } = useParams();
  const dispatch = useDispatch();
  const thumbnailContainerRef = useRef(null);

  const {
    selectedProduct: product,
    loading,
    error,
  } = useSelector((state) => state.product);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  console.log("product", product);

  // Scroll thumbnail into view when selected image changes
  useEffect(() => {
    if (thumbnailContainerRef.current && images.length > 0) {
      const thumb = thumbnailContainerRef.current.children[selectedImage];
      if (thumb) {
        thumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedImage]);

  if (loading)
    return <div className="text-center py-10"><Loader data="Loading products..."/></div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!product)
    return <div className="text-center py-10">Product not found</div>;

  // Extract prices correctly
  const afterPrice = getAfterPrice(product.price);
  const beforePrice = getBeforePrice(product.price);
  const ratingValue = getRatingValue(product.rating);
  
  // Calculate discount percentage
  const discountPercent = beforePrice > afterPrice && afterPrice > 0
    ? Math.round(((beforePrice - afterPrice) / beforePrice) * 100)
    : 0;
  const discountText = discountPercent > 0 ? `${discountPercent}% OFF` : null;

  // Images array: handle different formats
  const images =
    product.images?.map((img) => img.url) ||
    (product.image ? [product.image] : []);

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty: quantity, price: afterPrice }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleImageError = (e) => {
    console.error("Image failed to load:", e.target.src);
    e.target.src = fallbackImage;
  };

  const descriptionHtml = product?.description?.join("") || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden group">
              <img
                src={images[selectedImage] || fallbackImage}
                alt={`${product.name} - view ${selectedImage + 1}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-gradient-to-br from-amber-100 to-amber-200 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 text-amber-900" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-br from-amber-100 to-amber-200 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 text-amber-900" />
                  </button>
                </>
              )}
              {/* Discount Badge - top-right with project colors */}
              {discountText && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-br from-amber-600 to-amber-700 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                    {discountText}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails Preview */}
            {images.length > 1 && (
              <div className="relative">
                <div
                  ref={thumbnailContainerRef}
                  className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
                >
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImage === idx
                          ? "border-amber-600 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        i < Math.floor(ratingValue)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {ratingValue.toFixed(1)} ⭐
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                ₹{afterPrice.toLocaleString()}
              </span>
              {beforePrice > afterPrice && (
                <span className="text-xl sm:text-2xl text-gray-400 line-through">
                  ₹{beforePrice.toLocaleString()}
                </span>
              )}
              {discountText && (
                <span className="text-amber-600 font-semibold text-base sm:text-lg">
                  {discountText}
                </span>
              )}
            </div>

            {/* In Stock */}
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-medium">In Stock</span>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-gray-400 font-semibold cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-gray-400 font-semibold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart & Wishlist */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-amber-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`px-4 py-4 border-2 rounded-lg transition-all ${
                  isWishlisted
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Heart
                  className={`w-5 h-5 cursor-pointer ${
                    isWishlisted ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-6">
              <div className="flex items-start gap-3">
                <Truck className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-semibold text-sm">Free Shipping</p>
                  <p className="text-xs text-gray-500">On orders over ₹999</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-semibold text-sm">Easy Returns</p>
                  <p className="text-xs text-gray-500">7-day return policy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-semibold text-sm">Secure Payment</p>
                  <p className="text-xs text-gray-500">100% protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <Tabs>
            <TabList className="flex border-b border-gray-200 gap-4 sm:gap-6 overflow-x-auto scrollbar-hide">
              <Tab className="py-3 px-1 text-sm sm:text-base text-gray-600 font-semibold cursor-pointer border-b-2 border-transparent focus:outline-none">
                Description
              </Tab>
              <Tab className="py-3 px-1 text-sm sm:text-base text-gray-600 font-semibold cursor-pointer border-b-2 border-transparent focus:outline-none">
                Packaging
              </Tab>
            </TabList>

            <TabPanel className="pt-6">
              <div
                className="prose max-w-none text-gray-700 leading-relaxed text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </TabPanel>

            <TabPanel className="pt-6">
              <p className="text-gray-700 text-sm sm:text-base">
                Presented in a sturdy premium box with protective foam, designed
                for safe delivery and elegant gifting.
              </p>
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;