import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet, createOrder, verifyPayment, clearWalletError } from '@/redux/slices/walletSlice';
import Loader from '@/components/common/Loader';
import { toast } from 'react-toastify';
import { Wallet, PlusCircle } from 'lucide-react';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const WalletPage = () => {
  const dispatch = useDispatch();
  const { balance, loading: walletLoading, error: walletError } = useSelector((state) => state.wallet);
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);

  // Fetch wallet on mount and when logged in
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchWallet());
    }
  }, [dispatch, isLoggedIn]);

  // Show wallet errors
  useEffect(() => {
    if (walletError) {
      toast.error(walletError);
      dispatch(clearWalletError());
    }
  }, [walletError, dispatch]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setAdding(true);
    try {
      // 1. Create order
      const orderData = await dispatch(createOrder(numAmount)).unwrap();
      const { order_id, amount: orderAmountInRupees, currency = 'INR' } = orderData;

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Payment gateway failed to load');
        setAdding(false);
        return;
      }

      // 3. Get Razorpay key from .env
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error('Razorpay key missing');
        setAdding(false);
        return;
      }

      // 4. Convert amount to paise
      const amountInPaise = Math.round(orderAmountInRupees * 100);

      // 5. Open Razorpay
      const options = {
        key: razorpayKey,
        amount: amountInPaise,
        currency: currency,
        name: 'AstroTring',
        description: `Add ₹${numAmount} to wallet`,
        order_id: order_id,
        handler: async (response) => {
          try {
            await dispatch(verifyPayment({
              paymentData: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              amount: numAmount,
            })).unwrap();
            toast.success(`₹${numAmount} added to wallet successfully!`);
            setAmount('');
          } catch (err) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#ea580c',
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error(err || 'Something went wrong');
    } finally {
      setAdding(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your wallet.</p>
      </div>
    );
  }

  if (walletLoading && !balance && !adding) return <Loader data="Loading wallet..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-amber-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wallet className="w-6 h-6" /> My Wallet
            </h1>
          </div>

          <div className="p-6">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-4xl font-bold text-amber-600">
                ₹{balance || '0.00'}
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Add Money</h2>
              <form onSubmit={handleAddMoney} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  min="1"
                  step="1"
                  required
                />
                <button
                  type="submit"
                  disabled={adding || walletLoading}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {adding ? 'Processing...' : <><PlusCircle className="w-4 h-4" /> Add Money</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;