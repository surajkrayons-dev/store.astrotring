import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet, addMoneyToWallet, clearWalletError } from '../redux/slices/walletSlice';
import Loader from '@/components/common/Loader';
import { toast } from 'react-toastify';
import { Wallet, PlusCircle } from 'lucide-react';

const WalletPage = () => {
  const dispatch = useDispatch();
  const { balance, loading, error } = useSelector((state) => state.wallet);
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchWallet());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearWalletError());
    }
  }, [error, dispatch]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setAdding(true);
    try {
      await dispatch(addMoneyToWallet(numAmount)).unwrap();
      toast.success(`₹${numAmount} added to wallet`);
      setAmount('');
    } catch (err) {
      toast.error(err);
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

  if (loading && balance === 0) return <Loader data="Loading wallet..." />;

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
              <p className="text-4xl font-bold text-amber-600">₹{balance.toLocaleString()}</p>
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
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {adding ? 'Adding...' : <><PlusCircle className="w-4 h-4" /> Add Money</>}
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