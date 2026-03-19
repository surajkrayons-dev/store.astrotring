import React, { useState, useEffect, useMemo } from "react";
import {  useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Settings,
  ShoppingCart,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RefreshCw,
  CreditCard,
  Banknote,
  Tag,
  Zap,
  Gem,
  Award,
  MessageCircle,
  CheckCircle,
  Package,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  Leaf,
  ShieldCheck,
  RotateCcw,
  Eye,
  FileText, Sparkles, BookOpen, RefreshCcw, AlertTriangle,
  Percent,
  MapPin,
  Gift
} from "lucide-react";
import { toast } from "react-toastify";
import { addToCart } from "../redux/slices/cartSlice";
import {
  fetchProductById,
  clearSelectedProduct,
  fetchAllProducts,

} from "../redux/slices/productSlice";
import Loader from "@/components/common/Loader";
import StarRating from "@/components/common/StarRating";

// Import static fallbacks
import {
  fallbackProductSpecs,
  fallbackHowToUseSteps,
  fallbackOffers,
  fallbackFaqs,
  fallbackYouMayAlsoLike,
  fallbackCertificates
} from "../constants/productStaticData";

// ---------- Helper Functions ----------
const getStockStatus = (status, qty) => {
  if (!status && !qty) return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
  if (status === "few_left") return { text: "Only Few Left!", color: "text-orange-600", bg: "bg-orange-50" };
  if (qty > 0) return { text: "In Stock", color: "text-green-600", bg: "bg-green-50" };
  return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
};

// Fallback image
const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50' y='115' font-family='Arial' font-size='16' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E";

// ---------- Accordion Component ----------
const AccordionSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-5 h-5 ${isOpen ? "text-amber-500" : "text-gray-400"}`} />}
          <span className={`font-semibold text-sm ${isOpen ? "text-amber-600" : "text-gray-600"}`}>
            {title}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-all duration-300 ${isOpen ? "rotate-180 text-amber-500" : "text-gray-400"}`} />
      </button>
      {isOpen && <div className="px-5 py-4">{children}</div>}
    </div>
  );
};

// ---------- Mini Product Card for You May Also Like ----------
const YouMayAlsoLikeCard = ({ product }) => {
  const navigate = useNavigate();
  const afterPrice = Number(product?.after_price) || 0;
  const beforePrice = Number(product?.before_price) || 0;
  const ratingValue = Number(product?.rating_avg) || 0;
  const imageUrl = product?.image || product?.images?.[0]?.image || '';

  // Calculate discount percentage
  const discountPercent = beforePrice > afterPrice && afterPrice > 0
    ? Math.round(((beforePrice - afterPrice) / beforePrice) * 100)
    : 0;

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer group"
    >
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center p-4">
        {imageUrl ? (
          <img src={imageUrl} alt={product?.name} className="w-full h-full object-contain" />
        ) : (
          <Gem className="w-12 h-12 text-gray-400 group-hover:text-amber-600 transition-colors" />
        )}
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-5 right-6">
            <span className="bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold rounded-md shadow-md text-[10px] px-2 py-0.5">
              {discountPercent}% OFF
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800 text-sm truncate">{product?.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <StarRating value={ratingValue} size={12} />
          <span className="text-xs text-gray-500">{ratingValue.toFixed(1)}</span>
        </div>
        <div className="mt-1 flex items-center gap-1 flex-wrap">
          <span className="text-amber-600 font-bold text-sm">
            ₹{afterPrice.toLocaleString()}
          </span>
          {beforePrice > afterPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{beforePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};






// ---------- Main Component ----------
const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  // Local state
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedRatti, setSelectedRatti] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [pincode, setPincode] = useState("");

  // Redux state

  const { selectedProduct: product, items: allProducts, loading, error } = useSelector((state) => state.product);

  useEffect(() => {
    if (!allProducts.length) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, allProducts.length]);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
    return () => dispatch(clearSelectedProduct());
  }, [dispatch, id]);

  // Set default Ratti when product loads
  useEffect(() => {
    if (product?.ratti_options?.length > 0) {
      setSelectedRatti(product.ratti_options[0].ratti.toString());
    } else {
      setSelectedRatti("5"); // fallback
    }
  }, [product]);



  // Inside component, after data extraction
 // Move this BEFORE the early returns (after all hooks, before loading check)
const suggestedProducts = useMemo(() => {
  if (!allProducts.length || !product) return fallbackYouMayAlsoLike;

  const currentCategory = product?.category?.slug;
  const related = allProducts
    .filter(p => p.category?.slug === currentCategory && p.id !== product?.id)
    .slice(0, 4);

  return related.length > 0 ? related : fallbackYouMayAlsoLike;
}, [allProducts, product]);

// Early returns (loading, error, !product) remain here

  if (loading) return <Loader data="Loading product..." />;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  // ----- Data Extraction from API -----
  // Base prices (fallback if no ratti selected)
  const baseAfterPrice = Number(product?.after_price) || 0;
  const baseBeforePrice = Number(product?.before_price) || 0;

  // Ratti options
  const rattiOptions = product?.ratti_options || [];
  const selectedRattiObj = rattiOptions.find(opt => opt.ratti.toString() === selectedRatti);

  // Display prices based on selected ratti (if any)
  const displayAfterPrice = selectedRattiObj ? Number(selectedRattiObj.ratti_afterPrice) || 0 : baseAfterPrice;
  const displayBeforePrice = selectedRattiObj ? Number(selectedRattiObj.ratti_beforePrice) || 0 : baseBeforePrice;

  // Discount calculation using display prices
  const discountPercent = displayBeforePrice > displayAfterPrice && displayAfterPrice > 0
    ? Math.round(((displayBeforePrice - displayAfterPrice) / displayBeforePrice) * 100)
    : 0;
  const discountText = discountPercent > 0 ? `${discountPercent}% OFF` : null;

  // Rating
  const ratingValue = parseFloat(product?.rating_avg) || 0;
  const reviewsCount = product?.rating_count || 0;

  // Images
  let images = [];
  if (product?.images?.length) {
    images = product.images.map((img) => img.image);
  } else if (product?.image) {
    images = [product.image];
  }

  // Stock status
  const stockStatus = getStockStatus(product?.stock_status, product?.stock_qty);

  // Specifications: combine from API + extra fields
  const buildSpecs = () => {
    const specs = [];
    if (product?.specifications && Array.isArray(product.specifications)) {
      product.specifications.forEach(spec => {
        specs.push({ label: spec.title, value: spec.value });
      });
    }
    if (product?.origin) specs.push({ label: "Origin", value: product.origin });
    if (product?.planet) specs.push({ label: "Planet", value: product.planet });
    if (product?.purity) specs.push({ label: "Purity", value: product.purity });
    return specs.length > 0 ? specs : fallbackProductSpecs;
  };
  const productSpecs = buildSpecs();

  // How to use – split by newline
  const howToUseSteps = product?.how_to_use
    ? product.how_to_use.split('\n').filter(step => step.trim() !== '')
    : fallbackHowToUseSteps;

  // Benefits – split by newline
  const benefitsParagraphs = product?.benefits
    ? product.benefits.split('\n').filter(p => p.trim() !== '')
    : [];

  // FAQs
  const faqs = product?.faq && Array.isArray(product.faq) ? product.faq : fallbackFaqs;

  // Certificates
  const certificates = product?.lab_certificates && Array.isArray(product.lab_certificates)
    ? product.lab_certificates.map((cert, idx) => ({
      id: idx,
      image: cert.image || cert,
      name: cert.name || (idx === 0 ? "IGI Certified" : "GTL Certified")
    }))
    : fallbackCertificates;

  // Offers (static for now, can be from API later)
  const offers = fallbackOffers;



  // Payment methods (static)
  const paymentMethods = [
    { src: "/payments/upi.png", name: "UPI" },
    { src: "/payments/gpay.png", name: "Google Pay" },
    { src: "/payments/phonepe.png", name: "PhonePe" },
    { src: "/payments/paytm.png", name: "Paytm" },
    { src: "/payments/visa.png", name: "Visa" },
    { src: "/payments/mastercard.png", name: "Mastercard" },
    { src: "/payments/rupay.png", name: "RuPay" },
  ];

  // Handlers
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
    dispatch(addToCart({
      ...product,
      qty: quantity,
      selectedRatti,
      price: displayAfterPrice,
      selectedRattiPrice: selectedRattiObj?.ratti_afterPrice
    }));
    toast.success(`${product?.name} (${selectedRatti} Ratti) added to cart!`);
  };

  const handleImageError = (e) => {
    e.target.src = fallbackImage;
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const checkPincode = () => {
    if (pincode.length === 6) {
      toast.success("Delivery available in 5-7 days");
    } else {
      toast.error("Please enter a valid 6-digit pincode");
    }
  };





  

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Breadcrumb */}
        <nav className="flex mb-4 text-xs sm:text-sm text-gray-500">
          <ol className="flex items-center flex-wrap gap-1">
            <li><a href="/" className="hover:text-amber-600 transition cursor-pointer">Home</a></li>
            <li className="mx-1">/</li>
            {/* <li><a href="/products" className="hover:text-amber-600 transition cursor-pointer">Products</a></li>
            <li className="mx-1">/</li> */}
            {/* <li><a href={`/category/${product?.category?.slug}`} className="hover:text-amber-600 transition cursor-pointer">Gemstones</a></li>
            <li className="mx-1">/</li> */}
            <li className="text-amber-700 font-medium truncate max-w-[200px]">{product?.name}</li>
          </ol>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: IMAGES - sticky */}
          <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg group">
              <img src={images[selectedImage] || fallbackImage} alt={product?.name} className="w-full h-full object-cover" onError={handleImageError} />
              {images.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={handleNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              {discountText && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                  {discountText}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${selectedImage === idx ? "border-amber-600 shadow-md" : "border-gray-200 hover:border-gray-300"}`}>
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" onError={handleImageError} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PRODUCT INFO */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product?.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <StarRating value={ratingValue} size={16} />
                <span className="text-sm text-gray-600">{ratingValue.toFixed(1)} ({reviewsCount} reviews)</span>
                <span className="text-sm text-gray-400">|</span>
                <span className={`text-sm font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-bold text-gray-900">
                ₹{displayAfterPrice.toLocaleString()}
              </span>
              {displayBeforePrice > displayAfterPrice && (
                <span className="text-xl text-gray-400 line-through">
                  ₹{displayBeforePrice.toLocaleString()}
                </span>
              )}
              {discountText && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  {discountText}
                </span>
              )}
            </div>

            {/* Payment Options */}
            <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Options</h3>
              <p className="text-sm text-gray-500 mb-4">100% secure payments • All major methods accepted</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {paymentMethods.map((item, i) => (
                  <div key={i} className="flex items-center justify-center h-14 w-14 bg-gray-50 border border-gray-200 rounded-full p-2 hover:shadow-md transition">
                    <img src={item.src} alt={item.name} className="max-h-7 object-contain" onError={handleImageError} />
                  </div>
                ))}
              </div>
            </section>

            {/* Ratti Selector */}
            {rattiOptions.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Select Ratti</label>
                <div className="flex flex-wrap gap-2">
                  {rattiOptions.map((opt) => (
                    <button
                      key={opt.ratti}
                      onClick={() => setSelectedRatti(opt.ratti.toString())}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all cursor-pointer ${selectedRatti === opt.ratti.toString()
                          ? "border-amber-600 bg-amber-50 text-amber-700"
                          : "border-gray-300 hover:border-gray-400 text-gray-700"
                        }`}
                    >
                      {opt.ratti}
                    </button>
                  ))}
                </div>
                {selectedRattiObj && (
                  <p className="text-xs text-gray-500 mt-2">
                    Price: ₹{selectedRattiObj.ratti_afterPrice} (MRP: ₹{selectedRattiObj.ratti_beforePrice}) for {selectedRatti} Ratti
                  </p>
                )}
              </div>
            )}

            {/* Offers Section */}
            <div>
              <h3 className="flex items-center gap-2 font-bold text-stone-900 text-lg mb-5">
                <Tag className="w-5 h-5 text-amber-500" /> Best Offers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {offers.map((offer, idx) => {
                  if (offer.type === "discount" || (offer.price && offer.code)) {
                    return (
                      <div key={idx} className="group border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition">
                        <div className="p-5">
                          <h4 className="font-bold text-green-700 text-base mb-1">{offer.title}</h4>
                          <p className="text-xs text-stone-500">{offer.description}</p>
                        </div>
                        <div className="border-t border-dashed bg-rose-50 px-5 py-3 flex justify-between items-center">
                          <span className="font-semibold text-stone-800 text-sm">Get it for <span className="text-rose-600 font-bold text-base">{offer.price}</span></span>
                          <button className="text-rose-600 font-semibold text-sm flex items-center gap-1 hover:underline cursor-pointer">{offer.code} ⧉</button>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={idx} className="group border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition">
                        <div className="p-5">
                          <h4 className="font-bold text-teal-700 text-base mb-1">{offer.title}</h4>
                          <p className="text-xs text-stone-500">{offer.description}</p>
                        </div>
                        <div className="border-t border-dashed bg-rose-50 px-5 py-3 flex items-center justify-between">
                          <span className="text-rose-600 font-semibold text-sm flex items-center gap-1">AUTO-APPLIED ✔</span>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                <button onClick={() => handleQuantityChange(-1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg cursor-pointer">-</button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg cursor-pointer">+</button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition cursor-pointer">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button onClick={() => setIsWishlisted(!isWishlisted)} className="px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition cursor-pointer">
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
              </button>
            </div>

            {/* Shipping Info Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-gray-500" /><div className="text-xs"><p className="font-semibold">Free Shipping</p><p className="text-gray-500">on ₹999+</p></div></div>
              <div className="flex items-center gap-2"><RefreshCw className="w-5 h-5 text-gray-500" /><div className="text-xs"><p className="font-semibold">7-Day Returns</p><p className="text-gray-500">easy policy</p></div></div>
              <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-gray-500" /><div className="text-xs"><p className="font-semibold">Secure</p><p className="text-gray-500">payments</p></div></div>
            </div>

            {/* Product Specifications */}
            <AccordionSection title="Product Specifications" icon={Settings} defaultOpen={true}>
              <div className="divide-y text-gray-200">
                {productSpecs.map((spec, idx) => (
                  <div key={idx} className="grid grid-cols-[160px_10px_1fr] py-2 text-sm items-center">
                    <span className="text-gray-700 font-semibold">{spec.label}</span>
                    <span className="text-center">:</span>
                    <span className="text-gray-900 text-xs font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </AccordionSection>

            {/* Shipping Details */}
            <section className="bg-[#efe3d3] rounded-xl p-4 sm:p-5">
              <p className="text-sm text-gray-600">Prepaid orders are delivered on priority.</p>
              <p className="text-sm font-semibold text-gray-900 mb-3">{product?.shipping_info || "Most orders are delivered in 7 - 10 days."}</p>
              <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-3 text-gray-500 flex-1">
                  <MapPin className="w-4 h-4" />
                  <input type="text" placeholder="Enter your pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full py-2 text-sm outline-none" />
                </div>
                <button onClick={checkPincode} className="bg-gray-800 text-white text-sm font-semibold px-4 py-2 hover:bg-black transition cursor-pointer">Check</button>
              </div>
              <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
                <div className="flex items-center gap-3"><Gift className="w-6 h-6 text-black" /><div><p className="font-semibold text-sm text-gray-900">100% Cashback</p><p className="text-xs text-gray-600">on all prepaid orders (TnC)</p></div></div>
                <div className="flex items-center gap-3"><Truck className="w-6 h-6 text-black" /><div><p className="font-semibold text-sm text-gray-900">FREE Shipping</p><p className="text-xs text-gray-600">on all orders</p></div></div>
              </div>
            </section>

            {/* Accordion Sections */}
            <div className="space-y-3">
              <AccordionSection title="Description" icon={FileText}>
                <p className="text-gray-700 leading-relaxed">{product?.description}</p>
              </AccordionSection>

              <AccordionSection title="Benefits" icon={Sparkles}>
                {benefitsParagraphs.length > 0 ? (
                  benefitsParagraphs.map((para, idx) => <p key={idx} className="text-gray-700 leading-relaxed mb-2">{para}</p>)
                ) : (
                  <p className="text-gray-700 leading-relaxed">No benefits information available.</p>
                )}
              </AccordionSection>

              <AccordionSection title="How to Use ?" icon={BookOpen}>
                <ol className="space-y-3">
                  {howToUseSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">{idx + 1}</span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </AccordionSection>

              <AccordionSection title="Return and Exchange" icon={RefreshCcw}>
                <p className="text-gray-700 leading-relaxed">
                  Returns are applicable within 7 days and only apply to defective, damaged, or incorrect products in unused condition with original packaging. Note: Natural variations in Rudraksha or gemstones are not defects. Non-returnable items include any used, altered, or personalized items.
                  Refunds incur ₹100 fee but also available through store credit. Please get in touch with the "Customer Support" for any query/assistance.
                </p>
              </AccordionSection>

              <AccordionSection title="Disclaimer" icon={AlertTriangle}>
                <p className="text-gray-700 leading-relaxed">Images are for reference only. There's no guarantee of the effectiveness of the product.</p>
              </AccordionSection>
            </div>
          </div>
        </div>

        {/* ---------- FULL WIDTH SECTIONS ---------- */}
        <div className="mt-12 space-y-10">
          {/* Certificates Section */}
          <section className="bg-white py-6 rounded-xl border border-gray-100">
            <h1 className="text-3xl text-center font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
              <Award className="w-6 h-6 text-amber-500" /> Our Certificates
            </h1>
            <p className="text-sm text-gray-500 text-center mb-8 max-w-2xl mx-auto">
              Every gemstone comes with authentic lab certificates to guarantee purity and origin.
            </p>
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 px-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="group">
                  <div className="w-full aspect-[4/3] flex items-center justify-center rounded-xl p-4">
                    <img src={cert.image} alt={cert.name} className="w-full h-full object-contain" onError={handleImageError} />
                  </div>
                  <p className="text-center text-sm font-medium text-gray-700 mt-2">{cert.name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ's */}
          <section className="bg-white py-6 rounded-xl border border-gray-100">
            <h1 className="text-3xl text-center font-semibold text-gray-800 mb-6">FAQs</h1>
            <div className="max-w-3xl mx-auto px-4 space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => toggleFaq(idx)} className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                    <span className={`text-sm ${openFaq === idx ? "text-amber-500 font-medium" : "text-gray-700"}`}>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === idx ? "rotate-180 text-amber-500" : "text-gray-400"}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <p className="text-sm text-gray-900">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* You May Also Like */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {suggestedProducts.map((item) => (
                <YouMayAlsoLikeCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;