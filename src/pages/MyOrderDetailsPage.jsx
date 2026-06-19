import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrderDetails,
  clearOrderError,
  clearCurrentOrder,
  cancelOrder,
  cancelCodOrder,
} from "../redux/slices/orderSlice";
import { toast } from "react-toastify";
import Loader from "@/components/common/Loader";
import {
  ArrowLeft,
  Calendar,
  Package,
  MapPin,
  CreditCard,
  XCircle,
  CheckCircle,
  BookOpen,
  Printer,
  Download,
} from "lucide-react";
// MyOrderDetailsPage.jsx
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

import OrderInvoice from "./OrderInvoice";

const MyOrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder, loading, error } = useSelector((state) => state.order);
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const [cancelling, setCancelling] = useState(false);
  const invoiceRef = useRef(null);
  const [downloadInvoiceLoading, setDownloadInvoiceLoading] = useState(false);

  const handleDownloadInvoice = async () => {
    if (!order || !invoiceRef.current) {
      toast.error("Invoice data not ready.");
      return;
    }

    const element = invoiceRef.current;
    setDownloadInvoiceLoading(true);

    try {
      // Step 1: Generate PDF using html2canvas + jsPDF
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
      );

      // Step 2: Convert PDF to Data URL (Base64) – No blob involved
      const pdfDataUrl = pdf.output("dataurlstring");

      // Step 3: Create a temporary anchor and trigger download
      const link = document.createElement("a");
      link.href = pdfDataUrl;
      link.download = `Invoice_${order.order_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // toast.success("Invoice downloaded successfully!");
    } catch (err) {
      console.error("PDF Generation Error:", err);
      toast.error(`Download failed: ${err.message || "Download failed"}`);
    } finally {
      setDownloadInvoiceLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && id) {
      dispatch(fetchOrderDetails(id));
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id, isLoggedIn]);

  // Avoid showing error toast during cancellation to prevent double toast
  useEffect(() => {
    if (error && !cancelling) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch, cancelling]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view order details.</p>
      </div>
    );
  }
  // const handleInvoiceOpen = () => {
  //   navigate("/invoice", { state: { orderData: currentOrder } })
  // };
  if (loading) return <Loader data="Loading order details..." />;

  if (!currentOrder) {
    return <p className="text-center py-10">Order not found.</p>;
  }

  const order = currentOrder;

  // console.log(order);

  const subtotal =
    order.subtotal ||
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;
  const shipping = order?.pricing?.delivery_charge || 0;
  const discount = order?.pricing?.discount || 0;
  const total = order?.pricing?.total_amount || subtotal + shipping - discount;
  const isCancelled = order.status === "cancelled";
  const canCancel = !isCancelled && order.status !== "delivered";
  const isCod = order.payment.mode === "cod";
  const COD_SURCHARGE = order?.pricing?.cod_charge;
  const advancePaid = order?.pricing?.advance_paid_amount
  const remainingCod = order?.pricing?.remaining_cod_amount
  

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
     if (isCod) {
       const res =await dispatch(cancelCodOrder(id)).unwrap();
      //  console.log(res)
      toast.success("Order cancelled successfully");
      await dispatch(fetchOrderDetails(id)).unwrap();
      } else {
        // Online/prepaid cancellation (existing thunk)
        await dispatch(cancelOrder(id)).unwrap();
        toast.success("Order cancelled successfully");
        await dispatch(fetchOrderDetails(id)).unwrap();
      }
    } catch (err) {
         console.error("Cancellation error:", err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center gap-2 text-amber-600 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Orders
            </button>
            {!isCancelled && <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium cursor-pointer"
            >
              <Download className="w-4 h-4" />{" "}
              {downloadInvoiceLoading ? "Downloading..." : "Download Invoice"}
            </button>}
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  Order Number : #{order.order_number}
                </p>
                {!isCod && (
                  <p className="text-sm text-gray-500">
                    Transaction ID : #{order?.payment?.transaction_id}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Order On :{" "}
                  {order?.timestamps?.created_at
                    ? new Date(order.timestamps.created_at).toLocaleString(
                        "en-IN",
                      )
                    : "N/A"}
                </p>

                {order.timestamps?.delivered_at && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" /> Delivered
                    On :{" "}
                    {new Date(order.timestamps.delivered_at).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                )}
                {order.timestamps?.cancelled_at && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-500" /> Cancelled On :{" "}
                    {new Date(order.timestamps.cancelled_at).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : order.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.status?.toUpperCase() || "PENDING"}
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
                    <div
                      key={idx}
                      className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-sm md:rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                        {item.ratti && (
                          <p className="text-sm text-gray-500">
                            Ratti: {item.ratti}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          ₹{item.price} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{item.price * item.quantity}
                        </p>
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
                      className="group flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">
                            Cancel Order
                          </span>
                        </>
                      )}
                    </button>
                  ) : isCancelled ? (
                    <div className="flex items-center gap-2 text-red-600  px-4 py-2 rounded-lg">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        This order has been cancelled
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Order cannot be cancelled at this stage
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {/* <p className="text-sm text-gray-500">
                    Subtotal: ₹{subtotal.toLocaleString()}
                  </p> */}
                  {shipping > 0 && (
                    <p className="text-sm text-gray-500">
                      Shipping Charge: ₹{shipping.toLocaleString()}
                    </p>
                  )}
                  {isCod && (
                    <p className="text-sm text-gray-500">
                      COD Charge: ₹{COD_SURCHARGE.toLocaleString()}
                    </p>
                  )}

                  {discount > 0 && (
                    <p className="text-sm text-green-600">
                      Discount: -₹{discount.toLocaleString()}
                    </p>
                  )}
                  {advancePaid > 0 && (
                    <p className="text-sm text-green-600">
                      Advance Paid: -₹{advancePaid.toLocaleString()}
                    </p>
                  )}
                  
                  {remainingCod >0 && <p className="text-lg font-bold text-gray-900 mt-1">
                    Total: ₹{remainingCod.toLocaleString()}
                  </p>}
                  {!isCod  && <p className="text-lg font-bold text-gray-900 mt-1">
                    Total: ₹{total.toLocaleString()}
                  </p>}
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
                  <div className="flex gap-2 items-center">
                    <p className="text-gray-800 font-medium text-sm">
                      {order?.address?.snapshot.name},
                    </p>
                    {/* <p className="text-gray-500 text-sm">Email: {order?.address?.snapshot.email}</p> */}
                    <p className="text-gray-600 text-sm">
                      Mobile: {order?.address?.snapshot.mobile},{" "}
                      {order?.address?.snapshot.alternative_mobile}
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Address: {order?.address?.snapshot.address}
                  </p>
                  <div className="flex gap-2 items-center">
                    <p className="text-gray-500 text-sm">
                      City: {order?.address?.snapshot.city},
                    </p>
                    <p className="text-gray-500 text-sm">
                      State: {order?.address?.snapshot.state},
                    </p>
                    <p className="text-gray-500 text-sm">
                      Country: {order?.address?.snapshot.country},
                    </p>
                    <p className="text-gray-500 text-sm">
                      Pin Code: {order?.address?.snapshot.pincode}
                    </p>
                  </div>
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
              <p className="text-gray-600">
                Mode: {order?.payment?.mode.toUpperCase() || "Online"}
              </p>
              {!isCod && (
                <p className="text-gray-600">
                  Payment Status : {order?.payment?.status}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden invoice template */}
      <div
        ref={invoiceRef}
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "794px",
          background: "white",
          zIndex: -1,
        }}
      >
        <OrderInvoice order={currentOrder} />
      </div>
    </>
  );
};

export default MyOrderDetailsPage;
