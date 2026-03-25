import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchAddresses } from '../redux/slices/addressSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { openLoginModal } from '../redux/slices/uiSlice';
import Loader from '@/components/common/Loader';
import { placeOrder } from '../redux/slices/orderSlice';
import { initiatePayment, verifyPayment } from '../redux/slices/paymentSlice'; // 👈 new

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const { items: cartItems, loading: cartLoading } = useSelector((state) => state.cart);
  const { addresses, loading: addressesLoading } = useSelector((state) => state.address);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch addresses if logged in
  useEffect(() => {
    if (isLoggedIn && addresses.length === 0) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, isLoggedIn, addresses.length]);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(openLoginModal());
      navigate('/cart');
    }
  }, [isLoggedIn, dispatch, navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 10000 ? 0 : 199;
  const grandTotal = subtotal + shipping;

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

    setLoading(true);
    try {
      // 1. Place order
      const order = await dispatch(placeOrder({
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
        total: grandTotal,
        payment_method: 'online',
        address_id: selectedAddressId,
      })).unwrap();

      // 2. Initiate payment
      const paymentData = await dispatch(initiatePayment({
        order_id: order.id,
        payment_method: 'online',
      })).unwrap();

      // 3. Open Razorpay checkout
      const options = {
        key: paymentData.key_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'AstroStore',
        description: `Order #${order.id}`,
        order_id: paymentData.razorpay_order_id,
        handler: async (response) => {
          // 4. Verify payment
          await dispatch(verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })).unwrap();

          toast.success('Payment successful! Order placed.');
          dispatch(clearCart());
          navigate('/order-success', { state: { orderId: order.id } });
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
          },
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;
  if (cartLoading || addressesLoading) return <Loader data="Loading..." />;
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
              <button
                onClick={() => navigate('/addresses')}
                className="mt-2 text-amber-600 hover:underline"
              >
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
                    <p className="text-sm text-gray-600">{addr.address}</p>
                    <p className="text-sm text-gray-600">Mobile: {addr.mobile}</p>
                    {addr.is_default && <span className="text-xs text-green-600">Default</span>}
                  </div>
                </label>
              ))}
              <button
                onClick={() => navigate('/addresses')}
                className="text-amber-600 text-sm hover:underline"
              >
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
                <span>{item.name} x {item.quantity}</span>
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
            <div className="flex justify-between py-2 text-lg font-bold">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !selectedAddressId}
            className="w-full mt-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;