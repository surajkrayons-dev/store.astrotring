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
  clearCartError,
  setAppliedCoupon,       // 👈 new import
  clearAppliedCoupon,     // 👈 new import
} from '../redux/slices/cartSlice';
import { validateCoupon } from '../redux/slices/couponSlice';
import { toast } from 'react-toastify';
import { openLoginModal } from '../redux/slices/uiSlice';

const CartPage = () => {
  const navigate = useNavigate();
  const { items: cartItems, loading, error, appliedCoupon, couponDiscount } = useSelector((state) => state.cart);
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const dispatch = useDispatch();

  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState(null);
  const [couponValidating, setCouponValidating] = useState(false);
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
      item_id: item.item_id,
      quantity: item.quantity + 1
    })).then(() => {
      dispatch(fetchCart());
    });
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      dispatch(updateCartItem({
        item_id: item.item_id,
        quantity: item.quantity - 1
      })).then(() => {
        dispatch(fetchCart());
      });
    }
  };

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponValidating(true);
    try {
      const coupon = await dispatch(validateCoupon(code)).unwrap();

      // Check minimum order amount
      const minAmount = parseFloat(coupon.min_amount);
      if (subtotal < minAmount) {
        toast.error(`Minimum order amount ₹${minAmount.toLocaleString()} required`);
        setCouponStatus('error');
        setCouponValidating(false);
        return;
      }

      // Check expiry
      if (new Date(coupon.expiry_date) < new Date()) {
        toast.error('Coupon has expired');
        setCouponStatus('error');
        setCouponValidating(false);
        return;
      }

      // Compute discount
      let discount = 0;
      if (coupon.discount_type === 'flat') {
        discount = Math.min(parseFloat(coupon.discount_value), subtotal);
      } else {
        discount = (subtotal * parseFloat(coupon.discount_value)) / 100;
        if (coupon.max_discount) {
          discount = Math.min(discount, parseFloat(coupon.max_discount));
        }
      }

      // Store coupon in Redux
      dispatch(setAppliedCoupon({
        coupon: {
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: parseFloat(coupon.discount_value),
          max_discount: coupon.max_discount ? parseFloat(coupon.max_discount) : null,
          min_amount: minAmount,
          label: coupon.label,
        },
        discount: discount,
      }));

      setCouponStatus('success');
      setTimeout(() => setCouponStatus(null), 3000);
    } catch (err) {
      dispatch(clearAppliedCoupon());
      setCouponStatus('error');
      toast.error(err || 'Invalid coupon');
      setTimeout(() => setCouponStatus(null), 3000);
    } finally {
      setCouponValidating(false);
    }
  };

  const removeCoupon = () => {
    dispatch(clearAppliedCoupon());
    setCouponCode('');
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const originalTotal = subtotal;
  const productSavings = originalTotal - subtotal;
  const shippingFee = subtotal > 599 ? 0 : 199;
  const freeShippingRemaining = Math.max(0, 599 - subtotal);

  // couponDiscount is already in Redux, but we recalc if needed? Actually we already have it from state.
  // But we need to ensure it's consistent with the coupon logic. The discount is stored when applied.
  // The couponDiscount variable from Redux is used.

  const totalSavings = productSavings + couponDiscount + (shippingFee === 0 && subtotal > 599 ? 199 : 0);
  const grandTotal = subtotal + shippingFee - couponDiscount;

  const proceedToCheckout = () => {
    setIsCheckingOut(true);
    navigate("/checkout");
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
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center gap-3">
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
        {/* Cart Items */}
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

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {cartItems.length > 0 && (
            <>
              {/* Delivery info */}
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
                          style={{ width: `${Math.min(100, (subtotal / 599) * 100)}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Coupon */}
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
                          placeholder="e.g. WELCOME10"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        />
                        <button
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer disabled:opacity-50"
                          onClick={applyCoupon}
                          disabled={couponValidating}
                        >
                          {couponValidating ? 'Applying...' : 'Apply'}
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

              {/* Order Summary */}
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