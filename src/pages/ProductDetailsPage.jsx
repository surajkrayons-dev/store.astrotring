import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
    FileText,Sparkles ,BookOpen ,RefreshCcw ,AlertTriangle, 
    Percent,
    MapPin,
    Gift
} from "lucide-react";
import { toast } from "react-toastify";
import { addToCart } from "../redux/slices/cartSlice";
import {
    fetchProductById,
    clearSelectedProduct,
} from "../redux/slices/productSlice";
import Loader from "@/components/common/Loader";
import StarRating from "@/components/common/StarRating";

// ---------- Helper Functions ----------
const getRatingValue = (rating) => {
    if (!rating) return 0;
    if (typeof rating === "number") return rating;
    if (typeof rating === "object") {
        return parseFloat(rating.avg) || 0;
    }
    return 0;
};

const getAfterPrice = (price) => {
    if (!price) return 0;
    if (typeof price === "number") return price;
    if (typeof price === "object") {
        return parseFloat(price.after) || 0;
    }
    return 0;
};

const getBeforePrice = (price) => {
    if (!price) return 0;
    if (typeof price === "number") return price;
    if (typeof price === "object") {
        return parseFloat(price.before) || 0;
    }
    return 0;
};

const getStockStatus = (stock) => {
    if (!stock) return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
    if (stock.status === "few_left") return { text: "Only Few Left!", color: "text-orange-600", bg: "bg-orange-50" };
    if (stock.qty > 0) return { text: "In Stock", color: "text-green-600", bg: "bg-green-50" };
    return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
};

// Fallback image
const fallbackImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50' y='115' font-family='Arial' font-size='16' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E";

// ---------- Accordion Component ----------

const AccordionSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      
      {/* HEADER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50"
      >
        <div className="flex items-center gap-2">
          
          {/* ICON */}
          {Icon && (
            <Icon
              className={`w-5 h-5 ${
                isOpen ? "text-amber-500" : "text-gray-400"
              }`}
            />
          )}

          {/* TITLE */}
          <span
            className={`font-semibold text-sm ${
              isOpen ? "text-amber-600" : "text-gray-600"
            }`}
          >
            {title}
          </span>
        </div>

        {/* DROPDOWN ICON */}
        <ChevronDown
          className={`w-5 h-5 transition-all duration-300 ${
            isOpen
              ? "rotate-180 text-amber-500"
              : "text-gray-400"
          }`}
        />
      </button>

      {/* BODY */}
      {isOpen && (
        <div className="px-5 py-4">
          {children}
        </div>
      )}
    </div>
  );
};



// ---------- Mini Product Card for You May Also Like ----------
const YouMayAlsoLikeCard = ({ product }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer group">
        <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
            <Gem className="w-12 h-12 text-gray-400 group-hover:text-amber-600 transition-colors" />
        </div>
        <div className="p-3">
            <h3 className="font-medium text-gray-800 text-sm truncate">{product.name}</h3>
            <div className="flex items-center gap-1 mt-1">
                <StarRating value={product.rating} size={12} />
                <span className="text-xs text-gray-500">{product.rating}</span>
            </div>
            <p className="text-amber-600 font-bold text-sm mt-1">{product.price}</p>
        </div>
    </div>
);

// ---------- Main Component ----------
const ProductDetailsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    // Local state
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [selectedRatti, setSelectedRatti] = useState("5");
    const [openFaq, setOpenFaq] = useState(null);
    const [pincode, setPincode] = useState("");

    // Redux state
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

    if (loading)
        return (
            <div className="text-center py-10">
                <Loader data="Loading product..." />
            </div>
        );
    if (error)
        return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!product)
        return <div className="text-center py-10">Product not found</div>;

    // Data extraction
    const afterPrice = getAfterPrice(product.price);
    const beforePrice = getBeforePrice(product.price);
    const ratingValue = getRatingValue(product.rating);
    const reviewsCount = product.rating?.count || 0;
    const discountPercent =
        beforePrice > afterPrice && afterPrice > 0
            ? Math.round(((beforePrice - afterPrice) / beforePrice) * 100)
            : 0;
    const discountText = discountPercent > 0 ? `${discountPercent}% OFF` : null;

    let images = [];
    if (product.images && product.images.length > 0) {
        images = product.images.map((img) => img.url);
    } else if (product.image) {
        images = [product.image];
    }

    const stockStatus = getStockStatus(product.stock);

    // Static data (to be replaced with API data later)
    const productSpecs = [
        { label: "Origin", value: "Bangkok, Thailand" },
        { label: "Planet", value: "Saturn (Shani)" },
        { label: "Colour", value: "Deep Blue" },
        { label: "Shape Available", value: "Oval, Octagonal, Cushion" },
        { label: "Cut", value: "Facetted" },
        { label: "Composition", value: "Natural" },
        { label: "Treatment", value: "Heated and Non-Treated" },
        { label: "Refractive Index", value: "1.760 – 1.770" },
        { label: "Hardness", value: "9 on Mohs Scale" },
    ];

    // ✅ FIX 1: howToUseSteps added here
    const howToUseSteps = [
        "Wear in a silver ring on the middle finger of the right hand.",
        "Best worn on Saturday morning during Shukla Paksha (waxing moon).",
        "Before wearing, dip the gemgray in unboiled milk or Ganga water for 10 minutes.",
        "Recite the Shani Beej mantra 'Om Sham Shanaishcharaya Namah' 108 times.",
        "Ensure the gemgray touches the skin directly for maximum benefits.",
        "Clean regularly with a soft cloth and avoid harsh chemicals.",
    ];

    const offers = [
        { icon: Tag, text: "Extra 5% Off on Prepaid Orders", code: "PREPAID5" },
        { icon: Zap, text: "Flat ₹500 Cashback on Orders above ₹5000", code: "CASHBACK500" },
        { icon: CreditCard, text: "No Cost EMI available", code: "NOCOSTEMI" },
        { icon: Truck, text: "Free Shipping on orders above ₹999", code: "FREESHIP" },
    ];

    const faqs = [
        {
            question: "Is this Neelam original?",
            answer:
                "Yes, we provide 100% authentic, certified gemgrays. You get a lab certificate with every purchase. Our gemgrays are sourced directly from Bangkok and verified by expert gemologists.",
        },
        {
            question: "Will I get the exact same gray shown in the photo?",
            answer:
                "Yes, the image shown is of the actual product you will receive. We believe in complete transparency. The gray you see in the photos is the one that will be shipped to you.",
        },
        {
            question: "How long does delivery take?",
            answer:
                "Most orders are delivered within 7-10 business days. Prepaid orders are processed faster (usually within 24 hours). International shipping may take 10-15 business days.",
        },
        {
            question: "What is the return policy?",
            answer:
                "We offer a 7-day return policy from the date of delivery. If you are not satisfied, you can return the product in its original condition for a full refund. Return shipping is free for domestic orders.",
        },
        {
            question: "How do I know which Ratti to buy?",
            answer:
                "The ideal Ratti weight depends on your body weight and planetary position. Generally, 5-6 Ratti is recommended for most people. For personalized advice, book a gemgray consultation with our experts.",
        },
        {
            question: "Can I wear Neelam with other gemgrays?",
            answer:
                "Neelam (Saturn) can be combined with certain gemgrays like Emerald (Mercury) or Pearl (Moon), but should be avoided with Red Coral (Mars) or Yellow Sapphire (Jupiter). Consult an astrologer for compatibility.",
        },
    ];

    const youMayAlsoLike = [
        { id: 1, name: "Yellow Sapphire (Pukhraj)", price: "₹8,499", rating: 4.5 },
        { id: 2, name: "Ruby (Manik)", price: "₹6,999", rating: 4.3 },
        { id: 3, name: "Emerald (Panna)", price: "₹12,499", rating: 4.7 },
        { id: 4, name: "Red Coral (Moonga)", price: "₹3,999", rating: 4.2 },
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
            price: afterPrice
        }));
        toast.success(`${product.name} (${selectedRatti} Ratti) added to cart!`);
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
                        <li><a href="/" className="hover:text-amber-600 transition">Home</a></li>
                        <li className="mx-1">/</li>
                        <li><a href="/products" className="hover:text-amber-600 transition">Products</a></li>
                        <li className="mx-1">/</li>
                        <li><a href="/category/gemgrays" className="hover:text-amber-600 transition">Gemgrays</a></li>
                        <li className="mx-1">/</li>
                        <li className="text-amber-700 font-medium truncate max-w-[200px]">
                            {product.name}
                        </li>
                    </ol>
                </nav>

                {/* Main Grid with sticky left column */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* LEFT COLUMN: IMAGES - sticky */}
                    <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
                        {/* Main Image */}
                        <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg group">
                            <img
                                src={images[selectedImage] || fallbackImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
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

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition-all ${selectedImage === idx
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
                        )}
                    </div>

                    {/* RIGHT COLUMN: PRODUCT INFO - scrollable */}
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <StarRating value={ratingValue} size={16} />
                                <span className="text-sm text-gray-600">
                                    {ratingValue.toFixed(1)} ({reviewsCount} reviews)
                                </span>
                                <span className="text-sm text-gray-400">|</span>
                                <span className={`text-sm font-medium ${stockStatus.color}`}>
                                    {stockStatus.text}
                                </span>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-3 flex-wrap">
                            <span className="text-3xl md:text-4xl font-bold text-gray-900">
                                ₹{afterPrice.toLocaleString()}
                            </span>
                            {beforePrice > afterPrice && (
                                <span className="text-xl text-gray-400 line-through">
                                    ₹{beforePrice.toLocaleString()}
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
  
  {/* HEADING */}
  <h3 className="text-lg font-semibold text-gray-900 mb-3">
    Payment Options
  </h3>

  <p className="text-sm text-gray-500 mb-4">
    We accept secure payments via multiple methods
  </p>

  {/* PAYMENT ICONS */}
 <div className="flex flex-wrap gap-3">

  {[
    "/payments/upi.svg",
    "/payments/gpay.svg",
    "/payments/phonepe.svg",
    "/payments/paytm.svg",
    "/payments/visa.svg",
    "/payments/mastercard.svg",
    "/payments/rupay.svg",
  ].map((icon, i) => (
    
    <div
      key={i}
      className="w-14 h-10 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-md"
    >
      <img
        src={icon}
        alt="payment"
        className="max-h-6 max-w-[80%] object-contain"
      />
    </div>

  ))}

</div>

</section>

                        {/* Ratti Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Select Ratti (Weight):
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {["5", "6", "7", "8", "9", "10", "11", "12"].map((ratti) => (
                                    <button
                                        key={ratti}
                                        onClick={() => setSelectedRatti(ratti)}
                                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${selectedRatti === ratti
                                                ? "border-amber-600 bg-amber-50 text-amber-700"
                                                : "border-gray-300 hover:border-gray-400 text-gray-700"
                                            }`}
                                    >
                                        {ratti}
                                    </button>
                                ))}
                            </div>

                        </div>

                        {/* ✅ FIX 2: OFFERS SECTION - EXACT SCREENSHOT MATCH */}
                        <div>
  <h3 className="flex items-center gap-2 font-bold text-stone-900 text-lg mb-5">
    <Tag className="w-5 h-5 text-amber-500" />
    Best Offers
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

    {/* CARD 1 */}
    <div className="group border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-5">
        

        <h4 className="font-bold text-green-700 text-base mb-1">
          Flat 5% Off
        </h4>

        <p className="text-xs text-stone-500">
          On your entire order value
        </p>
      </div>

      <div className="border-t border-dashed bg-rose-50 px-5 py-3 flex justify-between items-center">
        <span className="font-semibold text-stone-800 text-sm">
          Get it for{" "}
          <span className="text-rose-600 font-bold text-base">₹7251</span>
        </span>

        <button className="text-rose-600 font-semibold text-sm flex items-center gap-1 hover:underline">
          SAVE5 ⧉
        </button>
      </div>
    </div>

    {/* CARD 2 */}
    <div className="group border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-5">
        <h4 className="font-bold text-green-700 text-base mb-1">
          Flat ₹30 Off
        </h4>

        <p className="text-xs text-stone-500">
          Valid on all products
        </p>
      </div>

      <div className="border-t border-dashed bg-rose-50 px-5 py-3 flex justify-between items-center">
        <span className="font-semibold text-stone-800 text-sm">
          Get it for{" "}
          <span className="text-rose-600 font-bold text-base">₹7602</span>
        </span>

        <button className="text-rose-600 font-semibold text-sm flex items-center gap-1 hover:underline">
          SHOP30 ⧉
        </button>
      </div>
    </div>

    {/* CARD 3 */}
    <div className="group border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-5">
        <h4 className="font-bold text-teal-700 text-base mb-1">
          Free Shipping
        </h4>

        <p className="text-xs text-stone-500">
          On orders above ₹999
        </p>
      </div>

      <div className="border-t border-dashed bg-rose-50 px-5 py-3 flex items-center justify-between">
        <span className="text-rose-600 font-semibold text-sm flex items-center gap-1">
          AUTO-APPLIED ✔
        </span>
      </div>
    </div>

    {/* CARD 4 */}
    <div className="group border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-5">
        <h4 className="font-bold text-teal-700 text-base mb-1">
          Extra 5% Off
        </h4>

        <p className="text-xs text-stone-500">
          Pay via UPI for instant savings
        </p>
      </div>

      <div className="border-t border-dashed bg-rose-50 px-5 py-3 flex items-center justify-between">
        <span className="text-rose-600 font-semibold text-sm flex items-center gap-1">
          AUTO-APPLIED ✔
        </span>
      </div>
    </div>

  </div>
</div>

                        

                        {/* Quantity & Add to Cart */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                                >
                                    -
                                </button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                            >
                                <ShoppingCart className="w-5 h-5" /> Add to Cart
                            </button>
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className="px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
                            >
                                <Heart
                                    className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Shipping Info Summary */}
                        
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-gray-200 pt-4">
                            <div className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-gray-500" />
                                <div className="text-xs">
                                    <p className="font-semibold">Free Shipping</p>
                                    <p className="text-gray-500">on ₹999+</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-gray-500" />
                                <div className="text-xs">
                                    <p className="font-semibold">7-Day Returns</p>
                                    <p className="text-gray-500">easy policy</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-gray-500" />
                                <div className="text-xs">
                                    <p className="font-semibold">Secure</p>
                                    <p className="text-gray-500">payments</p>
                                </div>
                            </div>
                        </div>


                        {/* Product Specifications */}
                        

<AccordionSection
  title="Product Specifications"
  icon={Settings}
  defaultOpen={true}
>
  <div className="divide-y text-gray-200">
    {productSpecs.map((spec, idx) => (
      <div
        key={idx}
        className="grid grid-cols-[160px_10px_1fr] py-2 text-sm items-center"
      >
        <span className="text-gray-700 font-semibold">
          {spec.label}
        </span>

        <span className="text-center">:</span>

        <span className="text-gray-900 text-xs font-medium">
          {spec.value}
        </span>
      </div>
    ))}
  </div>
</AccordionSection>

                        {/* Shipping Details */}
                        <section className="bg-[#efe3d3] rounded-xl p-4 sm:p-5">

  {/* TOP TEXT */}
  <p className="text-sm text-gray-600">
    Prepaid orders are delivered on priority.
  </p>

  <p className="text-sm font-semibold text-gray-900 mb-3">
    Most orders are delivered in 7 - 10 days.
  </p>

  {/* PINCODE INPUT */}
  <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
    
    <div className="flex items-center gap-2 px-3 text-gray-500 flex-1">
      <MapPin className="w-4 h-4" />
      <input
        type="text"
        placeholder="Enter your pincode"
        className="w-full py-2 text-sm outline-none"
      />
    </div>

    <button className="bg-gray-800 text-white text-sm font-semibold px-4 py-2 hover:bg-black transition">
      Check
    </button>
  </div>

  {/* BOTTOM FEATURES */}
  <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
    
    {/* LEFT */}
    <div className="flex items-center gap-3">
      <Gift className="w-6 h-6 text-black" />
      <div>
        <p className="font-semibold text-sm text-gray-900">
          100% Cashback
        </p>
        <p className="text-xs text-gray-600">
          on all prepaid orders (TnC)
        </p>
      </div>
    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-3">
      <Truck className="w-6 h-6 text-black" />
      <div>
        <p className="font-semibold text-sm text-gray-900">
          FREE Shipping
        </p>
        <p className="text-xs text-gray-600">
          on all orders
        </p>
      </div>
    </div>

  </div>

</section>

                        {/* Accordion Sections */}
                        <div className="space-y-3">
                            <AccordionSection title="Description" icon={FileText}>
                                <p className="text-gray-700 leading-relaxed">
                                    {product.description}
                                </p>
                            </AccordionSection>

                            <AccordionSection title="Benefits" icon={Sparkles}>
                                <p className="text-gray-700 leading-relaxed">
                                    Boosts focus, discipline, and confidence in personal and professional life.
                                    Attracts name, fame, wealth, prosperity, and long-term stability.
                                    Protects from negativity, stress, and emotional blockages.
                                    Enhances intuition, clarity, and spiritual growth.
                                    Radiates positive vibrations.
                                </p>
                            </AccordionSection>

                            <AccordionSection title="How to Use ?" icon={BookOpen}>
                                <ol className="space-y-3">
                                    {howToUseSteps.map((step, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex-shrink-0 mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <span className="text-gray-700 text-sm sm:text-base">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </AccordionSection>

                            <AccordionSection title="Return and Exchange" icon={RefreshCcw}>
                                <p className="text-gray-700 leading-relaxed">
                                    Returns are applicable within 7 days and only apply to defective, damaged, or incorrect products in unused condition with original packaging. Note: Natural variations in Rudraksha or gemgrays are not defects. Non-returnable items include any used, altered, or personalized items.
                                    Refunds incur ₹100 fee but also available through store credit.
                                    Please get in touch with the "Customer Support" for any query/assistance.
                                </p>
                            </AccordionSection>

                            <AccordionSection title="Disclaimer" icon={AlertTriangle}>
                                <p className="text-gray-700 leading-relaxed">
                                    Images are for reference only. There's no guarantee of the effectiveness of the product.
                                </p>
                            </AccordionSection>
                        </div>
                    </div>
                </div>

                {/* ---------- FULL WIDTH SECTIONS ---------- */}
                <div className="mt-12 space-y-10">
                    {/* Certificates Section */}
  <section className="bg-white py-6 rounded-xl border border-gray-100 ">
  
  {/* HEADING */}
  <h1 className="text-3xl text-center font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
    <Award className="w-6 h-6 text-amber-500" />
    Our Certificates
  </h1>

  {/* SUBTEXT */}
  <p className="text-sm text-gray-500 text-center mb-8 max-w-2xl mx-auto">
    Every gemstone comes with authentic lab certificates to guarantee purity and origin.
  </p>

  {/* CERTIFICATES GRID */}
  <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 px-4">
    
   

    {/* Certificate 2 */}
    <div className="group">
      <div className="w-full aspect-[4/3] flex items-center justify-center  rounded-xl p-4 ">
        <img
          src="/gemistoneCertificate2.png"
          alt="GTL Certificate"
          className="w-full h-full object-contain "
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
      </div>
    </div>
     {/* Certificate 1 */}
    <div className="group">
      <div className="w-full aspect-[4/3] flex items-center justify-center  rounded-xl p-4 ">
        <img
          src="/gemistoneCertificate1.png"
          alt="IGL Certificate"
          className="w-full h-full object-contain "
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
      </div>
    </div>

  </div>
</section>

                    {/* FAQ's */}
                    <section className="bg-white py-6 rounded-xl border border-gray-100 ">
    
    <h1 className="text-3xl text-center font-semibold text-gray-800 mb-6">
        FAQs
    </h1>

    {/* CENTER CONTAINER */}
    <div className="max-w-3xl mx-auto px-4 space-y-3">
        {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                
                <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition"
                >
                    <span
                        className={`text-sm ${
                            openFaq === idx ? "text-amber-500 font-medium" : "text-gray-700"
                        }`}
                    >
                        {faq.question}
                    </span>

                    <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                            openFaq === idx
                                ? "rotate-180 text-amber-500"
                                : "text-gray-400"
                        }`}
                    />
                </button>

                {openFaq === idx && (
                    <div className="p-4 bg-white border-t border-gray-200">
                        <p className="text-sm text-gray-900">
                            {faq.answer}
                        </p>
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
                            {youMayAlsoLike.map((item) => (
                                <YouMayAlsoLikeCard key={item.id} product={item} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;change productdetails page