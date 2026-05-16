// src/components/checkout/PaymentStep.jsx
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../redux/baseApi';
import { clearCart } from '../../redux/slices/cartSlice';
import { fetchWallet } from '../../redux/slices/walletSlice';
import {FastForward,Wallet,CreditCard,Landmark,} from "lucide-react";

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const PaymentStep = forwardRef(({ selectedAddressId, onOrderComplete }, ref) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, appliedCoupon, couponDiscount } = useSelector((state) => state.cart);
  const { balance: walletBalance, loading: walletLoading } = useSelector((state) => state.wallet);
  const [loading, setLoading] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);

  useImperativeHandle(ref, () => ({ placeOrder: handlePlaceOrder }));

  useEffect(() => {
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
    dispatch(fetchWallet());
  }, [dispatch]);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 800 ? 0 : 149;
  const grandTotal = subtotal + shipping - couponDiscount;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return toast.error('Select delivery address');
    if (useWallet && walletAmount > walletBalance) return toast.error('Insufficient wallet balance');
    setLoading(true);
    try {
      const { data } = await api.post('/store/create-order', {
        amount: grandTotal,
        coupon_code: appliedCoupon?.code || null,
        delivery_charge: shipping,
        wallet_amount: useWallet ? walletAmount : 0,
        address_id: selectedAddressId,
      });
      if (!data.status) throw new Error(data.message);
      const { order_id, amount: onlineAmount, payment_mode } = data;

      if (onlineAmount <= 0 || payment_mode === 'wallet_only') {
        const verify = await api.post('/store/verify-payment', {
          razorpay_order_id: order_id,
          razorpay_payment_id: 'wallet_payment',
          razorpay_signature: 'wallet_paid',
          coupon_code: appliedCoupon?.code || null,
          delivery_charge: shipping,
          address_id: selectedAddressId,
          wallet_amount: useWallet ? walletAmount : 0,
          amount: grandTotal,
        });
        if (verify.data.status) {
          toast.success('Order placed!');
          navigate('/order-success', { state: { orderData: verify.data.order.order_id } });
          dispatch(clearCart());
          onOrderComplete();
        } else toast.error('Verification failed');
        setLoading(false);
        return;
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(onlineAmount * 100),
        currency: 'INR',
        name: 'Astrotring Store',
        order_id,
        handler: async (response) => {
          try {
            const verify = await api.post('/store/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              coupon_code: appliedCoupon?.code || null,
              delivery_charge: shipping,
              address_id: selectedAddressId,
              wallet_amount: useWallet ? walletAmount : 0,
              amount: grandTotal,
            });

            if (verify.data.status) {
              toast.success('Payment successful!');

              navigate('/order-success', { state: { orderData: verify.data.order.order_id } });
              dispatch(clearCart());
              onOrderComplete();
            } else toast.error('Verification failed');
          } catch (err) { toast.error('Verification error'); }
          finally { setLoading(false); }
        },
        modal: { ondismiss: () => setLoading(false) },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error(err.message || 'Order creation failed');
      setLoading(false);
    }
  };

  if (walletLoading) return <div className="text-center py-8">Loading wallet...</div>;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-gray-800">Payment Options</h2>
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">


        {/* 

        // pay through wallet option

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={useWallet} onChange={(e) => {
            setUseWallet(e.target.checked);
            setWalletAmount(e.target.checked ? Math.min(walletBalance, grandTotal) : 0);
          }} className="w-4 h-4 text-amber-600" />
          <span className="font-medium">Use Wallet (balance: ₹{walletBalance.toLocaleString()})</span>
        </label>
        {useWallet && (
          <div className="mt-3 ml-6">
            <input
              type="number"
              value={walletAmount}
              onChange={(e) => setWalletAmount(Math.min(walletBalance, grandTotal, Math.max(0, parseFloat(e.target.value) || 0)))}
              min="0"
              max={Math.min(walletBalance, grandTotal)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">Max: ₹{Math.min(walletBalance, grandTotal).toLocaleString()}</p>
          </div>
        )}
 */}


<label className="flex items-start gap-3 cursor-pointer">
  <input
    type="radio"
    checked
    className="mt-1 w-4 h-4 text-amber-600 accent-amber-600"
  />

  <div className="flex flex-col gap-2">
    <span className="font-medium text-sm text-gray-800">
      Pay Using UPI / Wallet / Cards / Netbanking
    </span>

    {/* Payment Icons */}
    <div className="flex items-center gap-3 flex-wrap">
      {/* UPI */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
        <FastForward size={14} className="text-amber-600" />
        <span className="text-xs text-gray-600">UPI</span>
      </div>

      {/* Wallet */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
        <Wallet size={14} className="text-amber-600" />
        <span className="text-xs text-gray-600">Wallet</span>
      </div>

      {/* Cards */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
        <CreditCard size={14} className="text-amber-600" />
        <span className="text-xs text-gray-600">Cards</span>
      </div>

      {/* Netbanking */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
        <Landmark size={14} className="text-amber-600" />
        <span className="text-xs text-gray-600">Netbanking</span>
      </div>
    </div>
  </div>
</label>


        <label className="flex items-center gap-2 cursor-pointer">
          <div className="w-4 h-4  rounded-full border-1 border-gray-500" />
          <span className="font-medium text-gray-400 text-sm">COD (Coming soon)</span>
        </label>
      </div>
      {/* <p className="text-sm text-gray-500 text-center">You will be redirected to Razorpay for secure payment.</p> */}
    </div>
  );
});

export default PaymentStep;