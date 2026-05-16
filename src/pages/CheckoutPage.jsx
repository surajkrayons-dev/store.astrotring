import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../redux/baseApi';
import { fetchAddresses } from '../redux/slices/addressSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { openLoginModal } from '../redux/slices/uiSlice';
import { fetchWallet } from '../redux/slices/walletSlice';
import Loader from '@/components/common/Loader';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const { items: cartItems, loading: cartLoading } = useSelector((state) => state.cart);
  const { addresses, loading: addressesLoading } = useSelector((state) => state.address);
  const { appliedCoupon, couponDiscount } = useSelector((state) => state.cart);
  const { balance: walletBalance, loading: walletLoading } = useSelector((state) => state.wallet);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // ✅ Payment ke liye alag state
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);

  useEffect(() => {
    if (isLoggedIn && addresses.length === 0) dispatch(fetchAddresses());
    if (isLoggedIn) dispatch(fetchWallet());
  }, [dispatch, isLoggedIn, addresses.length]);

  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(openLoginModal());
      navigate('/cart');
    }
  }, [isLoggedIn, dispatch, navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 599 ? 0 : 199;
  const grandTotal = subtotal + shipping - couponDiscount;

  const handleUseWalletChange = (checked) => {
    setUseWallet(checked);
    if (!checked) setWalletAmount(0);
    else setWalletAmount(Math.min(walletBalance, grandTotal));
  };

  const handleWalletAmountChange = (e) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value)) value = 0;
    const maxAllowed = Math.min(walletBalance, grandTotal);
    if (value > maxAllowed) value = maxAllowed;
    if (value < 0) value = 0;
    setWalletAmount(value);
  };

  // Load Razorpay script once
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };
    loadRazorpayScript();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }
    if (useWallet && walletAmount > walletBalance) {
      toast.error('Wallet amount exceeds available balance');
      return;
    }
    if (useWallet && walletAmount > grandTotal) {
      toast.error('Wallet amount cannot exceed order total');
      return;
    }

    setLoading(true);
    try {
      const paymentResponse = await api.post('/store/create-order', {
        amount: grandTotal,
        coupon_code: appliedCoupon?.code || null,
        delivery_charge: shipping,
        wallet_amount: useWallet ? walletAmount : 0,
        address_id: selectedAddressId,
      });
      // console.log("createorder",paymentResponse)
      const paymentData = paymentResponse.data;
      if (!paymentData.status) throw new Error(paymentData.message || 'Failed to create order');

      const razorpayOrderId = paymentData.order_id;
      const amountToPayOnline = paymentData.amount;
      const paymentMode = paymentData.payment_mode;

      // Wallet-only payment (no online payment needed)
      if (amountToPayOnline <= 0 || paymentMode === 'wallet_only') {
        const verifyResponse = await api.post('/store/verify-payment', {
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: 'wallet_payment',
          razorpay_signature: 'wallet_paid',
          coupon_code: appliedCoupon?.code || null,
          delivery_charge: shipping,
          address_id: selectedAddressId,
          wallet_amount: useWallet ? walletAmount : 0,
          amount: grandTotal,
        });
        // console.log("verifyResponse",verifyResponse)
       if (verifyResponse.data.status) {
  toast.success('Order placed successfully using wallet!');
  // ✅ Send complete order data
  navigate('/order-success', { state: { orderData: verifyResponse.data.order } });
  dispatch(clearCart());
} else {
          toast.error('Failed to place order. Please contact support.');
        }
        setLoading(false);
        return;
      }

      // Online payment required
      const amountInPaise = Math.round(amountToPayOnline * 100);
      const options = {
        key: RAZORPAY_KEY,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Astrotring Store',
        description: `Order #${razorpayOrderId}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          setIsProcessingPayment(true); // Payment processing start
          
          try {
            const verifyResponse = await api.post('/store/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              coupon_code: appliedCoupon?.code || null,
              delivery_charge: shipping,
              address_id: selectedAddressId,
              wallet_amount: useWallet ? walletAmount : 0,
              amount: grandTotal,
            });
            
            if (verifyResponse.data.status) {
  toast.success('Payment successful! Order placed.');
  // ✅ Send complete order data instead of just orderId
  navigate('/order-success', { state: { orderData: verifyResponse.data.order } });
  dispatch(clearCart());
} else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsProcessingPayment(false); // ✅ Payment processing done
            setLoading(false);
          }
        },
        modal: { 
          ondismiss: () => {
            toast.info('Payment cancelled');
            setLoading(false);
          }
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error?.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;
  if (cartLoading || addressesLoading || walletLoading) return <Loader data="Loading..." />;
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <p>Your cart is empty. <a href="/" className="text-amber-600 hover:underline">Continue shopping</a></p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column – Address Selection */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
          {addresses.length === 0 ? (
            <div className="bg-white p-4 rounded shadow">
              <p className="text-gray-600">No saved addresses.</p>
              <button onClick={() => navigate('/addresses')} className="mt-2 text-amber-600 hover:underline">
                Add a new address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map(addr => (
                <label key={addr.id} className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">{addr.name}</p>
                    <p className="text-sm text-gray-600">{addr.mobile},{addr.alternative_mobile}</p>
                    <p className="text-sm text-gray-600">{addr.address}</p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.state}, {addr.country}-{addr.pincode}</p>
                    {addr.is_default && <span className="text-xs text-green-600">Default</span>}
                  </div>
                </label>
              ))}
              <button onClick={() => navigate('/addresses')} className="text-amber-600 text-sm hover:underline">
                + Add new address
              </button>
            </div>
          )}
        </div>

        {/* Right Column – Order Summary & Payment */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="bg-white p-4 rounded shadow">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between py-2 border-b">
                <span>{`${item.name} ${item.ratti ? `(${item.ratti} ratti)` : ""} x ${item.quantity}`}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 font-semibold">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between py-2 text-green-600 font-semibold">
                <span>Coupon ({appliedCoupon.code})</span>
                <span>-₹{couponDiscount.toLocaleString()}</span>
              </div>
            )}
            {/* Wallet Option */}
            <div className="py-2 border-t mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useWallet}
                  onChange={(e) => handleUseWalletChange(e.target.checked)}
                  className="w-4 h-4 text-amber-600"
                />
                <span className="text-sm font-medium">Pay via Wallet (Balance: ₹{walletBalance.toFixed(2)})</span>
              </label>
              {useWallet && (
                <div className="mt-2 ml-6">
                  <label className="block text-sm text-gray-600 mb-1">Amount to use from wallet:</label>
                  <input
                    type="number"
                    value={walletAmount}
                    onChange={handleWalletAmountChange}
                    min="0"
                    max={Math.min(walletBalance, grandTotal)}
                    step="10"
                    className="w-full px-3 py-1 border rounded focus:ring-amber-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max: ₹{Math.min(walletBalance, grandTotal).toFixed(2)}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between py-2 text-lg font-bold border-t mt-2">
              <span>Total to Pay</span>
              <span>₹{(grandTotal - (useWallet ? walletAmount : 0)).toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !selectedAddressId || isProcessingPayment}
            className="w-full mt-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessingPayment ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </>
            ) : loading ? (
              'Please Wait...'
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;