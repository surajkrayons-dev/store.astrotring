import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails, clearOrderError, clearCurrentOrder } from '../redux/slices/orderSlice';
import { toast } from 'react-toastify';
import Loader from '@/components/common/Loader';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

const statusSteps = [
  { key: 'confirmed', label: 'Order Confirmed', icon: Package, description: 'Your order has been confirmed.' },
  { key: 'processed', label: 'Processed', icon: Clock, description: 'We are preparing your order.' },
  { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Your order has been dispatched.' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Your order has been delivered.' },
];

const TrackMyOrderPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder, loading, error } = useSelector((state) => state.order);
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(-1);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, orderId, isLoggedIn, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  // Determine which status step is active based on order status and timestamps
  useEffect(() => {
    if (currentOrder && currentOrder.status) {
      const status = currentOrder.status.toLowerCase();
      let stepIndex = -1;
      if (status === 'cancelled') {
        stepIndex = -2; // special: cancelled
      } else if (status === 'delivered') {
        stepIndex = 3;
      } else if (status === 'shipped') {
        stepIndex = 2;
      } else if (status === 'paid' || status === 'confirmed') {
        stepIndex = 0;
      } else {
        // fallback – check timestamps
        if (currentOrder.timestamps?.delivered_at) stepIndex = 3;
        else if (currentOrder.timestamps?.shipped_at) stepIndex = 2;
        else if (currentOrder.timestamps?.confirmed_at) stepIndex = 0;
        else stepIndex = -1;
      }
      setCurrentStatusIndex(stepIndex);
    }
  }, [currentOrder]);

  if (!isLoggedIn) return null; // will redirect
  if (loading) return <Loader data="Loading tracking information..." />;
  if (!currentOrder) return <p className="text-center py-10">Order not found.</p>;

  const order = currentOrder;
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-amber-600 hover:underline mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5" /> Track Order
            </h1>
            <p className="text-amber-100 text-sm">Order #{order.order_number}</p>
          </div>

          <div className="p-6">
            {/* Cancelled message */}
            {isCancelled ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">This order has been cancelled</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  Cancelled on: {order.timestamps?.cancelled_at ? new Date(order.timestamps.cancelled_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            ) : (
              /* Timeline */
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-gray-200 -z-0"></div>

                {statusSteps.map((step, index) => {
                  const isCompleted = currentStatusIndex >= index;
                  const isCurrent = currentStatusIndex === index;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="relative flex gap-4 mb-8 last:mb-0">
                      {/* Icon circle */}
                      <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <h3 className={`font-semibold text-lg ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.label}
                        </h3>
                        <p className="text-sm text-gray-500">{step.description}</p>
                        {isCurrent && !isCompleted && (
                          <p className="text-xs text-amber-600 mt-1">In progress...</p>
                        )}
                        {isCompleted && (
                          <p className="text-xs text-gray-400 mt-1">
                            {step.key === 'confirmed' && order.timestamps?.confirmed_at && `Completed: ${new Date(order.timestamps.confirmed_at).toLocaleString()}`}
                            {step.key === 'shipped' && order.timestamps?.shipped_at && `Completed: ${new Date(order.timestamps.shipped_at).toLocaleString()}`}
                            {step.key === 'delivered' && order.timestamps?.delivered_at && `Completed: ${new Date(order.timestamps.delivered_at).toLocaleString()}`}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Additional Info */}
            <div className="border-t border-gray-100 mt-6 pt-6">
              <h3 className="font-semibold text-gray-800 mb-2">Order Summary</h3>
              <p className="text-sm text-gray-600">Total Amount: ₹{order.total}</p>
              <p className="text-sm text-gray-600">Payment Method: {order.payment?.method || 'Online'}</p>
              {order.tracking_number && (
                <p className="text-sm text-gray-600">Tracking Number: {order.tracking_number}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackMyOrderPage;