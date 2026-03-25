// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchMyOrders } from "../redux/slices/orderSlice";
// import Loader from "@/components/common/Loader";
// import { Package, Clock, CheckCircle, XCircle } from "lucide-react";

// const statusColors = {
//   pending: "bg-yellow-100 text-yellow-800",
//   processing: "bg-blue-100 text-blue-800",
//   shipped: "bg-purple-100 text-purple-800",
//   delivered: "bg-green-100 text-green-800",
//   cancelled: "bg-red-100 text-red-800",
// };

// const OrdersPage = () => {
//   const dispatch = useDispatch();
//   const { orders, loading, error } = useSelector((state) => state.order);


//   useEffect(() => {
//     dispatch(fetchMyOrders());
//   }, [dispatch]);

//   console.log("orders",orders)

//   if (loading) return <Loader data="Loading orders..." />;
//   if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
//   if (!orders.length) return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="text-center">
//         <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//         <h2 className="text-xl font-semibold text-gray-800">No orders yet</h2>
//         <p className="text-gray-500 mt-2">Your order history will appear here.</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4">
//         <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

//         <div className="space-y-4">
//           {orders.map((order) => (
//             <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
//               {/* Order Header */}
//               <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center">
//                 <div>
//                   <p className="text-sm text-gray-500">Order #{order.id}</p>
//                   <p className="text-sm text-gray-500">
//                     {new Date(order.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
//                     {order.status?.toUpperCase()}
//                   </span>
//                   <span className="font-semibold text-gray-900">₹{order?.total?.toLocaleString()}</span>
//                 </div>
//               </div>

//               {/* Order Items */}
//               <div className="p-6 space-y-4">
//                 {order?.items?.map((item) => (
//                   <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
//                     {item.image && (
//                       <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
//                     )}
//                     <div className="flex-1">
//                       <h3 className="font-medium text-gray-800">{item.name}</h3>
//                       <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
//                       <p className="text-sm text-gray-600">₹{item.price} each</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-semibold text-gray-900">₹{item.total}</p>
//                     </div>
//                   </div>
//                 ))}

//                 {/* Order Summary */}
//                 <div className="mt-4 pt-4 border-t border-gray-200 text-right">
//                   <p className="text-sm text-gray-500">Subtotal: ₹{order.subtotal}</p>
//                   {order.shipping_cost > 0 && <p className="text-sm text-gray-500">Shipping: ₹{order.shipping_cost}</p>}
//                   {order.discount > 0 && <p className="text-sm text-green-600">Discount: -₹{order.discount}</p>}
//                   <p className="text-lg font-bold text-gray-900 mt-1">Total: ₹{order.total}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrdersPage;









import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyOrders, clearOrderError } from "../redux/slices/orderSlice";
import Loader from "@/components/common/Loader";
import { toast } from "react-toastify";
import { Package, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state) => state.order);
  const { isLoggedIn } = useSelector((state) => state.userAuth);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your orders.</p>
      </div>
    );
  }

  if (loading) return <Loader data="Loading orders..." />;

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">No orders yet</h2>
          <p className="text-gray-500 mt-2">Your order history will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(`/my-orders/${order.id}`)}
            >
              {/* Order Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
                    {order.status?.toUpperCase()}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₹{parseFloat(order.total).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
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

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                  {order.subtotal && <p className="text-sm text-gray-500">Subtotal: ₹{order.subtotal}</p>}
                  {order.shipping_cost > 0 && <p className="text-sm text-gray-500">Shipping: ₹{order.shipping_cost}</p>}
                  {order.discount > 0 && <p className="text-sm text-green-600">Discount: -₹{order.discount}</p>}
                  <p className="text-lg font-bold text-gray-900 mt-1">Total: ₹{order.total}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;