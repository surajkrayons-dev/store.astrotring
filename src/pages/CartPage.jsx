import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, Plus, Minus, Tag, Truck, Shield,
  CreditCard, ArrowLeft, Package, Sparkles, AlertCircle,
  CheckCircle2, X, Image
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart,increaseQuantity,decreaseQuantity,clearCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';

const COUPONS = {
  SAVE10: { discount: 10, type: 'percent', label: '10% off' },
  FLAT500: { discount: 500, type: 'flat', label: '₹500 off' },
  WELCOME20: { discount: 20, type: 'percent', label: '20% off' },
};

const CartPage = () => {
  const navigate = useNavigate?.() || null;
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponStatus, setCouponStatus] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleRemoveItem = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      dispatch(removeFromCart(id));
      toast.info('Item removed');
    }, 300);
  };

  const handleIncreaseQuantity = (id) => {
    dispatch(increaseQuantity(id));
  };

  const handleDecreaseQuantity = (id) => {
    dispatch(decreaseQuantity(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const originalTotal = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.qty, 0);
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

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => setIsCheckingOut(false), 2000);
  };

  return (
    <div className="cart-page bg-gray-100 min-h-screen p-4 pb-10">

      {/* Header */}
      <div className="cart-header max-w-[1100px] mx-auto mb-7 flex items-center gap-4">
        <button
          className="back-btn w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-black hover:text-white hover:border-black transition"
          onClick={() => navigate?.(-1)}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div className="header-title flex items-center gap-2">
          <ShoppingCart size={22} strokeWidth={2} />
          <h1 className="text-xl font-bold">My Cart</h1>
          <div className="cart-badge bg-black text-white text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center">
            {cartItems.length}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="cart-layout max-w-[1100px] mx-auto grid md:grid-cols-[1.5fr_1fr] gap-6">

        {/* Left: Cart Items */}
        <div className="cart-items-card bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="card-header flex justify-between items-center p-4 border-b border-gray-200">
            <span className="text-sm font-semibold uppercase text-gray-500">Items</span>
            {cartItems.length > 0 && (
              <button
                className="clear-all text-red-600 text-sm font-medium hover:opacity-60"
                onClick={handleClearCart}
              >
                Clear All
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart text-center py-16">
              <div className="empty-icon w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                <ShoppingCart size={36} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold mb-1">Your cart is empty</h3>
              <p className="text-sm text-gray-500">Add some items to get started!</p>
            </div>
          ) : (
            cartItems.map(item => {
              const discountPercent = item.originalPrice
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                : 0;
              return (
                <div
                  key={item.id}
                  className={`cart-item flex gap-4 p-4 border-b border-gray-200 transition-all ${removingId === item.id ? 'opacity-0 translate-x-10 scale-95 h-0 p-0 overflow-hidden' : ''}`}
                >
                  <div className="item-img-wrap w-22 h-22 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="item-img-placeholder w-full h-full flex items-center justify-center text-gray-400">
                        <Image size={28} />
                      </div>
                    )}
                    {discountPercent > 0 && (
                      <div className="item-discount-tag absolute top-1 left-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{discountPercent}%
                      </div>
                    )}
                  </div>

                  <div className="item-info flex-1 min-w-0">
                    <div className="item-name text-sm font-semibold truncate mb-1">{item.name}</div>
                    <div className="item-meta text-xs text-gray-500 mb-2">
                      <span className="mr-3">Color: {item.color || 'Default'}</span>
                      <span>Size: {item.size || 'Standard'}</span>
                    </div>
                    <div className="item-price-row flex items-center gap-2">
                      <span className="item-price text-base font-bold">₹{(item.price * item.qty).toLocaleString()}</span>
                      {item.originalPrice && item.originalPrice !== item.price && (
                        <span className="item-original-price text-xs text-gray-400 line-through">
                          ₹{(item.originalPrice * item.qty).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="item-bottom flex justify-between items-center mt-2">
                      <div className="qty-controls flex items-center gap-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <button className="qty-btn w-8 h-8 flex items-center justify-center hover:bg-gray-200" onClick={() => handleDecreaseQuantity(item.id)}>
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <div className="qty-value w-9 text-center text-sm font-semibold">{item.qty}</div>
                        <button className="qty-btn w-8 h-8 flex items-center justify-center hover:bg-gray-200" onClick={() => handleIncreaseQuantity(item.id)}>
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                      <button className="remove-btn w-8 h-8 flex items-center justify-center bg-red-100 border border-red-200 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="sidebar flex flex-col gap-4">

          {cartItems.length > 0 && (
            <div className="sidebar-card bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="card-header p-4 border-b border-gray-200 flex items-center gap-1.5">
                <Truck size={16} /> Delivery
              </div>
              <div className="shipping-bar-wrap p-4">
                {shippingFee === 0 ? (
                  <div className="shipping-achieved flex items-center text-green-600 text-sm font-semibold gap-1.5">
                    <CheckCircle2 size={16} /> You qualify for Free Shipping!
                  </div>
                ) : (
                  <>
                    <div className="shipping-bar-text text-xs text-gray-600 mb-2">
                      Add <strong>₹{freeShippingRemaining.toLocaleString()}</strong> more for free shipping
                    </div>
                    <div className="shipping-bar-bg w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="shipping-bar-fill h-full bg-gradient-to-r from-green-600 to-green-500 transition-all" style={{ width: `${Math.min(100, (subtotal / 10000) * 100)}%` }} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Coupon */}
          {cartItems.length > 0 && (
            <div className="sidebar-card bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="card-header p-4 border-b border-gray-200 flex items-center gap-1.5">
                <Tag size={16} /> Promo Code
              </div>
              <div className="coupon-wrap p-4">
                {!appliedCoupon ? (
                  <>
                    <div className="coupon-input-row flex gap-2">
                      <input
                        type="text"
                        className="coupon-input flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium uppercase focus:outline-none focus:border-black focus:bg-white"
                        placeholder="e.g. SAVE10"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      />
                      <button className="apply-btn px-4 py-2 bg-black text-white rounded-lg text-xs font-semibold hover:bg-gray-800" onClick={applyCoupon}>
                        Apply
                      </button>
                    </div>
                    {couponStatus === 'success' && (
                      <div className="coupon-status success flex items-center gap-1.5 text-green-600 text-xs mt-2">
                        <CheckCircle2 size={14} /> Coupon applied!
                      </div>
                    )}
                    {couponStatus === 'error' && (
                      <div className="coupon-status error flex items-center gap-1.5 text-red-600 text-xs mt-2">
                        <AlertCircle size={14} /> Invalid coupon code
                      </div>
                    )}
                  </>
                ) : (
                  <div className="applied-coupon-tag flex justify-between items-center bg-green-50 border border-green-500 border-dashed rounded-lg p-2 mt-2">
                    <div className="applied-coupon-left flex items-center gap-2">
                      <Tag size={15} color="#27ae60" />
                      <div>
                        <span className="text-green-600 font-semibold text-xs">{appliedCoupon.code}</span>
                        <div className="coupon-label text-green-600 text-[10px]">{appliedCoupon.label} applied</div>
                      </div>
                    </div>
                    <button className="remove-coupon-btn text-gray-500 hover:text-red-600" onClick={removeCoupon}>
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="sidebar-card bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="card-header p-4 border-b border-gray-200 flex items-center gap-1.5">
                <Package size={16} /> Order Summary
              </div>
              <div className="summary-wrap p-4">
                <div className="summary-row flex justify-between text-sm text-gray-600 py-1">
                  <span className="label">Subtotal ({cartItems.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span className="value font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
                {productSavings > 0 && (
                  <div className="summary-row savings flex justify-between text-sm text-green-600 font-semibold py-1">
                    <span className="label">Product Discount</span>
                    <span className="value">-₹{productSavings.toLocaleString()}</span>
                  </div>
                )}
                <div className={`summary-row flex justify-between text-sm py-1 ${shippingFee === 0 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                  <span className="label">Shipping</span>
                  <span className="value">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                </div>
                {appliedCoupon && (
                  <div className="summary-row coupon-row flex justify-between text-green-600 font-semibold text-sm py-1">
                    <span className="label">Coupon ({appliedCoupon.code})</span>
                    <span className="value">-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="summary-divider h-[1.5px] bg-gray-200 my-2" />
                <div className="summary-total flex justify-between items-center mt-2">
                  <span className="label text-base font-bold">Total</span>
                  <span className="value text-xl font-bold">₹{grandTotal.toLocaleString()}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="total-savings-badge flex items-center gap-1.5 bg-green-50 text-green-600 font-semibold rounded px-3 py-1 mt-2 text-xs">
                    <Sparkles size={15} /> You're saving ₹{totalSavings.toLocaleString()} on this order!
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  className={`checkout-btn w-full mt-4 py-4 bg-black text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 relative overflow-hidden ${isCheckingOut ? 'pointer-events-none bg-gray-700' : 'hover:bg-gray-800'}`}
                  onClick={handleCheckout}
                >
                  {isCheckingOut ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...
                    </div>
                  ) : (
                    <>
                      <CreditCard size={18} /> Proceed to Checkout — ₹{grandTotal.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;