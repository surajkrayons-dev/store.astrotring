// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   ShoppingCart, Trash2, Plus, Minus, Tag, Truck, 
//   CreditCard, ArrowLeft, Package, Sparkles, AlertCircle,
//   CheckCircle2, X, Image
// } from 'lucide-react';
// import { useSelector, useDispatch } from 'react-redux';
// import { removeFromCart, increaseQuantity, decreaseQuantity, clearCart } from '../redux/slices/cartSlice';
// import { toast } from 'react-toastify';
// import { openLoginModal } from '@/redux/slices/uiSlice';

// const COUPONS = {
//   SAVE10: { discount: 10, type: 'percent', label: '10% off' },
//   FLAT500: { discount: 500, type: 'flat', label: '₹500 off' },
//   WELCOME20: { discount: 20, type: 'percent', label: '20% off' },
// };

// const CartPage = () => {
//   const navigate = useNavigate();
//   const cartItems = useSelector(state => state.cart.items);
//   const { isLoggedIn } = useSelector((state) => state.userAuth);
//   const dispatch = useDispatch();

//   const [couponCode, setCouponCode] = useState('');
//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [couponStatus, setCouponStatus] = useState(null);
//   const [removingId, setRemovingId] = useState(null);
//   const [isCheckingOut, setIsCheckingOut] = useState(false);

//   const handleRemoveItem = (id) => {
//     setRemovingId(id);
//     setTimeout(() => {
//       dispatch(removeFromCart(id));
//       toast.info('Item removed');
//     }, 300);
//   };

//   const handleIncreaseQuantity = (id) => {
//     dispatch(increaseQuantity(id));
//   };

//   const handleDecreaseQuantity = (id) => {
//     dispatch(decreaseQuantity(id));
//   };

//   const handleClearCart = () => {
//     dispatch(clearCart());
//     toast.info('Cart cleared');
//   };

//   const applyCoupon = () => {
//     const code = couponCode.trim().toUpperCase();
//     if (COUPONS[code]) {
//       setAppliedCoupon({ code, ...COUPONS[code] });
//       setCouponStatus('success');
//       setTimeout(() => setCouponStatus(null), 3000);
//     } else {
//       setAppliedCoupon(null);
//       setCouponStatus('error');
//       setTimeout(() => setCouponStatus(null), 3000);
//     }
//   };

//   const removeCoupon = () => {
//     setAppliedCoupon(null);
//     setCouponCode('');
//   };

//   const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
//   const originalTotal = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.qty, 0);
//   const productSavings = originalTotal - subtotal;
//   const shippingFee = subtotal > 10000 ? 0 : 199;
//   const freeShippingRemaining = Math.max(0, 10000 - subtotal);

//   let couponDiscount = 0;
//   if (appliedCoupon) {
//     couponDiscount = appliedCoupon.type === 'flat'
//       ? Math.min(appliedCoupon.discount, subtotal)
//       : Math.round((subtotal * appliedCoupon.discount) / 100);
//   }

//   const totalSavings = productSavings + couponDiscount + (shippingFee === 0 && subtotal > 10000 ? 199 : 0);
//   const grandTotal = subtotal + shippingFee - couponDiscount;

//   const proceedToCheckout = () => {
//     setIsCheckingOut(true);
//     // Simulate checkout process (replace with actual checkout logic)
//     setTimeout(() => {
//       setIsCheckingOut(false);
//       toast.success('Order placed successfully!');
//       // Optionally clear cart or navigate
//     }, 2000);
//   };

//  const handleCheckout = () => {
//   if (!isLoggedIn) {
//     dispatch(openLoginModal()); // 👈 toast की जगह modal open
//     return;
//   }
//   proceedToCheckout();
// };

//   return (
//     <div className="min-h-screen bg-stone-50 p-4 pb-10">
//       {/* Header */}
//       <div className="max-w-6xl mx-auto mb-6 flex items-center gap-3">
//         <button
//           className="w-10 h-10 rounded-lg bg-white border border-stone-200 flex items-center justify-center shadow-sm hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-colors cursor-pointer"
//           onClick={() => navigate(-1)}
//           aria-label="Go back"
//         >
//           <ArrowLeft size={18} strokeWidth={2.5} />
//         </button>
//         <div className="flex items-center gap-2">
//           <ShoppingCart size={22} strokeWidth={2} className="text-amber-600" />
//           <h1 className="text-xl font-bold text-stone-900">My Cart</h1>
//           <span className="bg-amber-600 text-white text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center">
//             {cartItems.length}
//           </span>
//         </div>
//       </div>

//       {/* Main Grid */}
//       <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Cart Items - takes 2/3 on large screens */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden">
//             {/* Header */}
//             <div className="flex justify-between items-center p-4 border-b border-stone-200">
//               <span className="text-sm font-semibold uppercase text-stone-500">Items</span>
//               {cartItems.length > 0 && (
//                 <button
//                   className="text-red-600 text-sm font-medium hover:opacity-60 transition-opacity cursor-pointer"
//                   onClick={handleClearCart}
//                 >
//                   Clear All
//                 </button>
//               )}
//             </div>

//             {/* Items List */}
//             {cartItems.length === 0 ? (
//               <div className="text-center py-16 px-4">
//                 <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-stone-400">
//                   <ShoppingCart size={36} strokeWidth={1.5} />
//                 </div>
//                 <h3 className="text-lg font-semibold text-stone-900 mb-1">Your cart is empty</h3>
//                 <p className="text-sm text-stone-500">Add some items to get started!</p>
//               </div>
//             ) : (
//               cartItems.map(item => {
//                 const discountPercent = item.originalPrice && item.originalPrice > item.price
//                   ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
//                   : 0;

//                 return (
//                   <div
//                     key={item.id}
//                     className={`flex gap-4 p-4 border-b border-stone-200 transition-all duration-300 ${
//                       removingId === item.id ? 'opacity-0 translate-x-10 h-0 p-0 overflow-hidden' : ''
//                     }`}
//                   >
//                     {/* Image */}
//                     <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-100 rounded-lg flex-shrink-0 overflow-hidden relative">
//                       {item.image ? (
//                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center text-stone-400">
//                           <Image size={28} />
//                         </div>
//                       )}
//                       {discountPercent > 0 && (
//                         <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
//                           -{discountPercent}%
//                         </span>
//                       )}
//                     </div>

//                     {/* Details */}
//                     <div className="flex-1 min-w-0">
//                       <h4 className="text-sm font-semibold text-stone-900 truncate mb-1">{item.name}</h4>
//                       <div className="text-xs text-stone-500 mb-2">
//                         {item.color && <span className="mr-3">Color: {item.color}</span>}
//                         {item.size && <span>Size: {item.size}</span>}
//                       </div>

//                       {/* Price row */}
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-base font-bold text-stone-900">₹{(item.price * item.qty).toLocaleString()}</span>
//                         {item.originalPrice && item.originalPrice !== item.price && (
//                           <span className="text-xs text-stone-400 line-through">
//                             ₹{(item.originalPrice * item.qty).toLocaleString()}
//                           </span>
//                         )}
//                       </div>

//                       {/* Quantity controls + remove */}
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-0 bg-stone-100 rounded-lg border border-stone-200">
//                           <button
//                             className="w-8 h-8 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer text-stone-700"
//                             onClick={() => handleDecreaseQuantity(item.id)}
//                             disabled={item.qty <= 1}
//                           >
//                             <Minus size={14} strokeWidth={2.5} />
//                           </button>
//                           <span className="w-9 text-center text-sm font-semibold text-stone-900">{item.qty}</span>
//                           <button
//                             className="w-8 h-8 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer text-stone-700"
//                             onClick={() => handleIncreaseQuantity(item.id)}
//                           >
//                             <Plus size={14} strokeWidth={2.5} />
//                           </button>
//                         </div>
//                         <button
//                           className="w-8 h-8 flex items-center justify-center bg-red-100 border border-red-200 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
//                           onClick={() => handleRemoveItem(item.id)}
//                           aria-label="Remove item"
//                         >
//                           <Trash2 size={15} strokeWidth={2} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </div>

//         {/* Sidebar (Summary + Coupons) - 1/3 on large screens */}
//         <div className="lg:col-span-1 space-y-4">
//           {/* Delivery info */}
//           {cartItems.length > 0 && (
//             <div className="bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden">
//               <div className="p-4 border-b border-stone-200 flex items-center gap-2">
//                 <Truck size={16} className="text-amber-600" />
//                 <span className="text-sm font-semibold text-stone-900">Delivery</span>
//               </div>
//               <div className="p-4">
//                 {shippingFee === 0 ? (
//                   <div className="flex items-center text-green-600 text-sm font-semibold gap-2">
//                     <CheckCircle2 size={16} /> You qualify for Free Shipping!
//                   </div>
//                 ) : (
//                   <>
//                     <p className="text-xs text-stone-600 mb-2">
//                       Add <strong>₹{freeShippingRemaining.toLocaleString()}</strong> more for free shipping
//                     </p>
//                     <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
//                       <div
//                         className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all"
//                         style={{ width: `${Math.min(100, (subtotal / 10000) * 100)}%` }}
//                       />
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Coupon */}
//           {cartItems.length > 0 && (
//             <div className="bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden">
//               <div className="p-4 border-b border-stone-200 flex items-center gap-2">
//                 <Tag size={16} className="text-amber-600" />
//                 <span className="text-sm font-semibold text-stone-900">Promo Code</span>
//               </div>
//               <div className="p-4">
//                 {!appliedCoupon ? (
//                   <>
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-xs font-medium uppercase focus:outline-none focus:border-amber-600 focus:bg-stone-50"
//                         placeholder="e.g. SAVE10"
//                         value={couponCode}
//                         onChange={e => setCouponCode(e.target.value)}
//                         onKeyDown={e => e.key === 'Enter' && applyCoupon()}
//                       />
//                       <button
//                         className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer"
//                         onClick={applyCoupon}
//                       >
//                         Apply
//                       </button>
//                     </div>
//                     {couponStatus === 'success' && (
//                       <p className="flex items-center gap-1 text-green-600 text-xs mt-2">
//                         <CheckCircle2 size={14} /> Coupon applied!
//                       </p>
//                     )}
//                     {couponStatus === 'error' && (
//                       <p className="flex items-center gap-1 text-red-600 text-xs mt-2">
//                         <AlertCircle size={14} /> Invalid coupon code
//                       </p>
//                     )}
//                   </>
//                 ) : (
//                   <div className="flex justify-between items-center bg-amber-50 border border-amber-300 border-dashed rounded-lg p-2">
//                     <div className="flex items-center gap-2">
//                       <Tag size={15} className="text-amber-600" />
//                       <div>
//                         <span className="text-amber-700 font-semibold text-xs">{appliedCoupon.code}</span>
//                         <p className="text-amber-600 text-[10px]">{appliedCoupon.label} applied</p>
//                       </div>
//                     </div>
//                     <button className="text-stone-500 hover:text-red-600 transition-colors cursor-pointer" onClick={removeCoupon}>
//                       <X size={16} />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Order Summary */}
//           {cartItems.length > 0 && (
//             <div className="bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden sticky top-4">
//               <div className="p-4 border-b border-stone-200 flex items-center gap-2">
//                 <Package size={16} className="text-amber-600" />
//                 <span className="text-sm font-semibold text-stone-900">Order Summary</span>
//               </div>
//               <div className="p-4 space-y-3">
//                 {/* Subtotal */}
//                 <div className="flex justify-between text-sm text-stone-600">
//                   <span>Subtotal ({cartItems.reduce((s, i) => s + i.qty, 0)} items)</span>
//                   <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString()}</span>
//                 </div>

//                 {/* Product Discount */}
//                 {productSavings > 0 && (
//                   <div className="flex justify-between text-sm text-green-600 font-semibold">
//                     <span>Product Discount</span>
//                     <span>-₹{productSavings.toLocaleString()}</span>
//                   </div>
//                 )}

//                 {/* Shipping */}
//                 <div className={`flex justify-between text-sm ${shippingFee === 0 ? 'text-green-600 font-semibold' : 'text-stone-600'}`}>
//                   <span>Shipping</span>
//                   <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
//                 </div>

//                 {/* Coupon Discount */}
//                 {appliedCoupon && (
//                   <div className="flex justify-between text-sm text-green-600 font-semibold">
//                     <span>Coupon ({appliedCoupon.code})</span>
//                     <span>-₹{couponDiscount.toLocaleString()}</span>
//                   </div>
//                 )}

//                 <div className="h-px bg-stone-200 my-2" />

//                 {/* Total */}
//                 <div className="flex justify-between items-center">
//                   <span className="text-base font-bold text-stone-900">Total</span>
//                   <span className="text-xl font-bold text-stone-900">₹{grandTotal.toLocaleString()}</span>
//                 </div>

//                 {/* Total Savings Badge */}
//                 {totalSavings > 0 && (
//                   <div className="flex items-center gap-1 bg-amber-50 text-amber-700 font-semibold rounded px-3 py-2 text-xs">
//                     <Sparkles size={15} className="text-amber-600" /> You're saving ₹{totalSavings.toLocaleString()} on this order!
//                   </div>
//                 )}

//                 {/* Checkout Button */}
//                 <button
//                   className={`w-full mt-2 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:shadow-md cursor-pointer ${
//                     isCheckingOut ? 'opacity-70 pointer-events-none' : ''
//                   }`}
//                   onClick={handleCheckout}
//                 >
//                   {isCheckingOut ? (
//                     <>
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <CreditCard size={18} /> Proceed to Checkout
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartPage;



















import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, Plus, Minus, Tag, Truck,
  CreditCard, ArrowLeft, Package, Sparkles, AlertCircle,
  CheckCircle2, X, Image
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  addToCart,
  clearCartError
} from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import { openLoginModal } from '../redux/slices/uiSlice';

const COUPONS = {
  SAVE10: { discount: 10, type: 'percent', label: '10% off' },
  FLAT500: { discount: 500, type: 'flat', label: '₹500 off' },
  WELCOME20: { discount: 20, type: 'percent', label: '20% off' },
};

const CartPage = () => {
  const navigate = useNavigate();
  const { items: cartItems, loading, error } = useSelector((state) => state.cart);
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const dispatch = useDispatch();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponStatus, setCouponStatus] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchCart());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCartError());
    }
  }, [error, dispatch]);

  const handleRemoveItem = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      dispatch(removeFromCart(id)).then(() => {
        // Optionally refetch, but remove already updates local state
        // dispatch(fetchCart());
      });
      toast.error('Item removed');
    }, 300);
  };

const handleIncreaseQuantity = (item) => {
  dispatch(updateCartItem({
    item_id: item.item_id,   // 👈 changed from cart_id
    quantity: item.quantity + 1
  })).then(() => {
    dispatch(fetchCart());
  });
};

 const handleDecreaseQuantity = (item) => {
  if (item.quantity > 1) {
    dispatch(updateCartItem({
      item_id: item.item_id,   // 👈 changed from cart_id
      quantity: item.quantity - 1
    })).then(() => {
      dispatch(fetchCart());
    });
  }
};

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon({ code, ...COUPONS[code] });
      setCouponStatus('success');
      setTimeout(() => setCouponStatus(null), 3000);
    } else {
      setAppliedCoupon(null);
      setCouponStatus('error');
      setTimeout(() => setCouponStatus(null), 3000);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Calculate totals using cartItems from API (each item has price and quantity)
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const originalTotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0); // if no original price, use same
  const productSavings = originalTotal - subtotal;
  const shippingFee = subtotal > 10000 ? 0 : 199;
  const freeShippingRemaining = Math.max(0, 10000 - subtotal);

  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount = appliedCoupon.type === 'flat'
      ? Math.min(appliedCoupon.discount, subtotal)
      : Math.round((subtotal * appliedCoupon.discount) / 100);
  }

  const totalSavings = productSavings + couponDiscount + (shippingFee === 0 && subtotal > 10000 ? 199 : 0);
  const grandTotal = subtotal + shippingFee - couponDiscount;

  const proceedToCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      toast.success('Order placed successfully!');
    }, 2000);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      dispatch(openLoginModal());
      return;
    }
    proceedToCheckout();
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 p-4 flex items-center justify-center">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-4 pb-10">
      <div className="max-w-6xl mx-auto mb-6 flex items-center gap-3">
        {/* back button */}
        <button
          className="w-10 h-10 rounded-lg bg-white border border-stone-200 flex items-center justify-center shadow-sm hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-colors cursor-pointer"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>


        <div className="flex items-center gap-2">
          <ShoppingCart size={22} strokeWidth={2} className="text-amber-600" />
          <h1 className="text-xl font-bold text-stone-900">My Cart</h1>
          <span className="bg-amber-600 text-white text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center">
            {cartItems.length}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-stone-200">
              <span className="text-sm font-semibold uppercase text-stone-500">Items</span>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-stone-400">
                  <ShoppingCart size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-1">Your cart is empty</h3>
                <p className="text-sm text-stone-500">Add some items to get started!</p>
              </div>
            ) : (
              cartItems.map(item => {
                const price = parseFloat(item.price);
                const quantity = item.quantity;
                const total = price * quantity;

                return (
                  <div
                    key={item.item_id}
                    className={`flex gap-4 p-4 border-b border-stone-200 transition-all duration-300 ${
                      removingId === item.item_id ? 'opacity-0 translate-x-10 h-0 p-0 overflow-hidden' : ''
                    }`}
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <Image size={28} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-stone-900 truncate mb-1">{item.name}</h4>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-bold text-stone-900">
                          ₹{total.toLocaleString()}
                        </span>
                        {/* If you have original price, show here */}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0 bg-stone-100 rounded-lg border border-stone-200">
                          <button
                            className="w-8 h-8 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer text-stone-700"
                            onClick={() => handleDecreaseQuantity(item)}
                            disabled={quantity <= 1}
                          >
                            <Minus size={14} strokeWidth={2.5} />
                          </button>
                          <span className="w-9 text-center text-sm font-semibold text-stone-900">{quantity}</span>
                          <button
                            className="w-8 h-8 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer text-stone-700"
                            onClick={() => handleIncreaseQuantity(item)}
                          >
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                        <button
                          className="w-8 h-8 flex items-center justify-center bg-red-100 border border-red-200 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                          onClick={() => handleRemoveItem(item.item_id)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          {cartItems.length > 0 && (
            <>
              <div className="bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden">
                <div className="p-4 border-b border-stone-200 flex items-center gap-2">
                  <Truck size={16} className="text-amber-600" />
                  <span className="text-sm font-semibold text-stone-900">Delivery</span>
                </div>
                <div className="p-4">
                  {shippingFee === 0 ? (
                    <div className="flex items-center text-green-600 text-sm font-semibold gap-2">
                      <CheckCircle2 size={16} /> You qualify for Free Shipping!
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-stone-600 mb-2">
                        Add <strong>₹{freeShippingRemaining.toLocaleString()}</strong> more for free shipping
                      </p>
                      <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all"
                          style={{ width: `${Math.min(100, (subtotal / 10000) * 100)}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden">
                <div className="p-4 border-b border-stone-200 flex items-center gap-2">
                  <Tag size={16} className="text-amber-600" />
                  <span className="text-sm font-semibold text-stone-900">Promo Code</span>
                </div>
                <div className="p-4">
                  {!appliedCoupon ? (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-xs font-medium uppercase focus:outline-none focus:border-amber-600 focus:bg-stone-50"
                          placeholder="e.g. SAVE10"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        />
                        <button
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer"
                          onClick={applyCoupon}
                        >
                          Apply
                        </button>
                      </div>
                      {couponStatus === 'success' && (
                        <p className="flex items-center gap-1 text-green-600 text-xs mt-2">
                          <CheckCircle2 size={14} /> Coupon applied!
                        </p>
                      )}
                      {couponStatus === 'error' && (
                        <p className="flex items-center gap-1 text-red-600 text-xs mt-2">
                          <AlertCircle size={14} /> Invalid coupon code
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between items-center bg-amber-50 border border-amber-300 border-dashed rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <Tag size={15} className="text-amber-600" />
                        <div>
                          <span className="text-amber-700 font-semibold text-xs">{appliedCoupon.code}</span>
                          <p className="text-amber-600 text-[10px]">{appliedCoupon.label} applied</p>
                        </div>
                      </div>
                      <button className="text-stone-500 hover:text-red-600 transition-colors cursor-pointer" onClick={removeCoupon}>
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden sticky top-4">
                <div className="p-4 border-b border-stone-200 flex items-center gap-2">
                  <Package size={16} className="text-amber-600" />
                  <span className="text-sm font-semibold text-stone-900">Order Summary</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {productSavings > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Product Discount</span>
                      <span>-₹{productSavings.toLocaleString()}</span>
                    </div>
                  )}

                  <div className={`flex justify-between text-sm ${shippingFee === 0 ? 'text-green-600 font-semibold' : 'text-stone-600'}`}>
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>-₹{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="h-px bg-stone-200 my-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-stone-900">Total</span>
                    <span className="text-xl font-bold text-stone-900">₹{grandTotal.toLocaleString()}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 font-semibold rounded px-3 py-2 text-xs">
                      <Sparkles size={15} className="text-amber-600" /> You're saving ₹{totalSavings.toLocaleString()} on this order!
                    </div>
                  )}

                  <button
                    className={`w-full mt-2 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:shadow-md cursor-pointer ${
                      isCheckingOut ? 'opacity-70 pointer-events-none' : ''
                    }`}
                    onClick={handleCheckout}
                  >
                    {isCheckingOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} /> Proceed to Checkout
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;