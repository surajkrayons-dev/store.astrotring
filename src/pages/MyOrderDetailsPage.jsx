import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails, clearOrderError, clearCurrentOrder, cancelOrder } from '../redux/slices/orderSlice';
import { toast } from 'react-toastify';
import Loader from '@/components/common/Loader';
import { ArrowLeft, Calendar, Package, MapPin, CreditCard, XCircle } from 'lucide-react';

const MyOrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder, loading, error } = useSelector((state) => state.order);
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (isLoggedIn && id) {
      dispatch(fetchOrderDetails(id));
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id, isLoggedIn]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await dispatch(cancelOrder(id)).unwrap();
      toast.success('Order cancelled successfully');
      // Refresh order details
      dispatch(fetchOrderDetails(id));
    } catch (err) {
      toast.error(err || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view order details.</p>
      </div>
    );
  }

  if (loading) return <Loader data="Loading order details..." />;

  if (!currentOrder) {
    return <p className="text-center py-10">Order not found.</p>;
  }

  const order = currentOrder;
  const subtotal = order.subtotal || order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shipping = order.shipping_cost || 0;
  const discount = order.discount || 0;
  const total = order.total || subtotal + shipping - discount;
  const isCancelled = order.status === 'cancelled';
  const canCancel = !isCancelled && order.status !== 'delivered';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-amber-600 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
            <div>
              <p className="text-sm text-gray-500">Order Number: #{order.order_number}</p>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'paid' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
              }`}>
              {order.status?.toUpperCase() || 'PENDING'}
            </span>
          </div>

          {/* Items */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" /> Items
            </h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      {item.ratti && <p className="text-sm text-gray-500">Ratti: {item.ratti}</p>}
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No items found</p>
              )}
            </div>

            {/* Order Summary with Cancel Button on Left */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                {canCancel ? (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="group flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Cancel Order</span>
                      </>
                    )}
                  </button>
                ) : isCancelled ? (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">This order has been cancelled</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Order cannot be cancelled at this stage</div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Subtotal: ₹{subtotal.toLocaleString()}</p>
                {shipping > 0 && <p className="text-sm text-gray-500">Shipping: ₹{shipping.toLocaleString()}</p>}
                {discount > 0 && <p className="text-sm text-green-600">Discount: -₹{discount.toLocaleString()}</p>}
                <p className="text-lg font-bold text-gray-900 mt-1">Total: ₹{total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Delivery Address
            </h2>
            {order?.address?.snapshot ? (
              <>
                <p className="text-gray-800 font-medium">{order?.address?.snapshot.name}</p>
                <p className="text-gray-600">Mobile: {order?.address?.snapshot.mobile}, {order?.address?.snapshot.alternative_mobile}</p>
                <p className="text-gray-600">Address: {order?.address?.snapshot.address}</p>
                <p className="text-gray-500 text-sm">Pin Code: {order?.address?.snapshot.pincode}</p>
              </>
            ) : (
              <p className="text-gray-500">Address not available</p>
            )}
          </div>

          {/* Payment */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Payment
            </h2>
            <p className="text-gray-600">Method: {order.payment_method || 'Online'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrderDetailsPage;