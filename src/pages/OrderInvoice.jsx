// src/pages/OrderInvoice.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails, clearCurrentOrder } from '../redux/slices/orderSlice';
import Loader from '@/components/common/Loader';
import logo from '../assets/logo.png';
import { ArrowLeft, Printer } from 'lucide-react';

// ---------- Helper: Convert number to English words (Indian system) ----------
function numberToWords(num) {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convertChunk = (n) => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convertChunk(n % 100) : "");
  };

  let result = "";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  if (crore > 0) result += convertChunk(crore) + " Crore ";
  if (lakh > 0) result += convertChunk(lakh) + " Lakh ";
  if (thousand > 0) result += convertChunk(thousand) + " Thousand ";
  if (hundred > 0) result += convertChunk(hundred);
  return result.trim();
}

const OrderInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orderId = location.state?.orderData;
  const { currentOrder: order, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, orderId]);

  // Auto-print when order loads
  const [hasAutoPrinted, setHasAutoPrinted] = useState(false);
  useEffect(() => {
    if (order && !loading && !hasAutoPrinted) {
      setHasAutoPrinted(true);
      setTimeout(() => window.print(), 500);
    }
  }, [order, loading, hasAutoPrinted]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">No order information found.</p>
      </div>
    );
  }

  if (loading) return <Loader data="Loading invoice..." />;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!order) return <p className="text-center py-10">Order not found.</p>;

  // ---------- Extract data directly from API ----------
  const orderNumber = order.order_number || '-';
  const orderDate = order.timestamps?.created_at
    ? new Date(order.timestamps.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '-';

  const invoiceNo = order.invoice_number || '-';
  const invoiceDetails = order.payment?.transaction_id || '-';
  const invoiceDate = order.timestamps?.created_at
    ? new Date(order.timestamps.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '-';

  // Address
  const addr = order.address?.snapshot || {};
  const billingAddress = `${addr.name || ''}, ${addr.address || ''}, ${addr.city || ''}, ${addr.state || ''}, ${addr.country || ''} - ${addr.pincode || ''}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '');
  const shippingAddress = billingAddress;
  const stateCode = addr.state_code || null;
  const placeOfSupply = addr.state || '-';
  const placeOfDelivery = placeOfSupply;

  // Items
  const items = order.items || [];

  // Pricing and tax info from API
  const pricing = order.pricing || {};
  const subtotal = parseFloat(pricing.subtotal) || 0;
  const taxableAmount = parseFloat(pricing.taxable_amount) || 0;
  const igstAmount = parseFloat(pricing.igst_amount) || 0;
  const cgstAmount = parseFloat(pricing.cgst_amount) || 0;
  const sgstAmount = parseFloat(pricing.sgst_amount) || 0;
  const gstRate = parseFloat(pricing.gst_rate) || 0;
  const rawTaxType = pricing.tax_type; // 'igst' or 'cgst_sgst'
  const isCgstSgst = rawTaxType === 'cgst_sgst';
  const taxTypeDisplay = isCgstSgst ? 'CGST+SGST' : 'IGST';
  const deliveryCharge = parseFloat(pricing.delivery_charge) || 0;
  const grandTotal = parseFloat(pricing.total_amount) || 0;

  // Payment
  const transactionId = order.payment?.transaction_id || '-';
  const paidAt = order.payment?.paid_at
    ? new Date(order.payment.paid_at).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : '-';
  const paymentMode = order.payment?.mode || order.payment?.gateway || 'Online';
  const invoiceValue = grandTotal;

  // Convert amount to words (e.g., 699 -> "Six Hundred Ninety Nine Rupees Only")
  const amountInWords = `${numberToWords(Math.floor(invoiceValue))} Rupees Only`;

  // Helper to calculate tax per item (based on gstRate) and split if needed
  const getItemTaxSplit = (netAmount) => {
    const totalTax = (netAmount * gstRate) / 100;
    if (isCgstSgst) {
      return { cgst: totalTax / 2, sgst: totalTax / 2 };
    } else {
      return { igst: totalTax };
    }
  };

  // Build item rows with all 9 columns (stacked for CGST+SGST)
  const itemRows = items.map((item, idx) => {
    const price = parseFloat(item.price) || 0;
    const qty = item.quantity || 1;
    const net = price * qty;
    const taxSplit = getItemTaxSplit(net);
    const taxAmountTotal = isCgstSgst ? taxSplit.cgst + taxSplit.sgst : taxSplit.igst;
    const total = net;
    const hsnCode = order.hsn_code;

    // For CGST+SGST, we show two lines in Tax Rate, Tax Type, Tax Amount cells
    const halfRate = isCgstSgst ? (gstRate / 2).toFixed(2) : null;

    return (
      <tr key={idx} className="border-b border-black text-xs">
        <td className="border-r border-black p-1 align-top text-center">{idx + 1}</td>
        <td className="border-r border-black p-2 align-top">
          <p>{item.name}</p>
          <p className="mt-1">HSN: {hsnCode || 'N/A'}</p>
        </td>
        <td className="border-r border-black p-1 align-middle text-right">₹{price.toFixed(2)}</td>
        <td className="border-r border-black p-1 align-middle text-center">{qty}</td>
        <td className="border-r border-black p-1 align-middle text-right">₹{net.toFixed(2)}</td>

        {/* Tax Rate column - stacked for CGST/SGST */}
        <td className="border-r border-black p-1 align-middle text-center">
          {isCgstSgst ? (
            <>
              <div>{halfRate}%</div>
              <div>{halfRate}%</div>
            </>
          ) : (
            <div>{gstRate}%</div>
          )}
        </td>

        {/* Tax Type column - stacked for CGST/SGST */}
        <td className="border-r border-black p-1 align-middle text-center">
          {isCgstSgst ? (
            <>
              <div>CGST</div>
              <div>SGST</div>
            </>
          ) : (
            <div>IGST</div>
          )}
        </td>

        {/* Tax Amount column - stacked for CGST/SGST */}
        <td className="border-r border-black p-1 align-middle text-right">
          {isCgstSgst ? (
            <>
              <div>₹{taxSplit.cgst.toFixed(2)}</div>
              <div>₹{taxSplit.sgst.toFixed(2)}</div>
            </>
          ) : (
            <div>₹{taxSplit.igst.toFixed(2)}</div>
          )}
        </td>

        <td className="p-1 align-middle text-right">₹{total.toFixed(2)}</td>
      </tr>
    );
  });

  // Shipping row (if delivery charge > 0)
  let shippingRow = null;
  if (deliveryCharge > 0) {
    const shippingNet = deliveryCharge;
    const taxSplit = getItemTaxSplit(shippingNet);
    const taxAmountTotal = isCgstSgst ? taxSplit.cgst + taxSplit.sgst : taxSplit.igst;
    const shippingTotal = shippingNet;
    const halfRate = isCgstSgst ? (gstRate / 2).toFixed(2) : null;

    shippingRow = (
      <tr className="border-b border-black text-xs">
        <td className="border-r border-black p-1 align-top text-center"> </td>
        <td className="border-r border-black p-2 align-top">
          <p>Shipping Charges</p>
        </td>
        <td className="border-r border-black p-1 align-middle text-right">₹{deliveryCharge.toFixed(2)}</td>
        <td className="border-r border-black p-1 align-middle text-center">1</td>
        <td className="border-r border-black p-1 align-middle text-right">₹{shippingNet.toFixed(2)}</td>

        {/* Tax Rate column - stacked for CGST/SGST */}
        <td className="border-r border-black p-1 align-middle text-center">
          {isCgstSgst ? (
            <>
              <div>{halfRate}%</div>
              <div>{halfRate}%</div>
            </>
          ) : (
            <div>{gstRate}%</div>
          )}
        </td>

        {/* Tax Type column - stacked for CGST/SGST */}
        <td className="border-r border-black p-1 align-middle text-center">
          {isCgstSgst ? (
            <>
              <div>CGST</div>
              <div>SGST</div>
            </>
          ) : (
            <div>IGST</div>
          )}
        </td>

        {/* Tax Amount column - stacked for CGST/SGST */}
        <td className="border-r border-black p-1 align-middle text-right">
          {isCgstSgst ? (
            <>
              <div>₹{taxSplit.cgst.toFixed(2)}</div>
              <div>₹{taxSplit.sgst.toFixed(2)}</div>
            </>
          ) : (
            <div>₹{taxSplit.igst.toFixed(2)}</div>
          )}
        </td>

        <td className="p-1 align-middle text-right">₹{shippingTotal.toFixed(2)}</td>
      </tr>
    );
  }



  return (
    <div className="w-full bg-amber-200 py-10">
      {/* A4 PAGE */}
      <div className="w-[794px] min-h-[1123px] flex flex-col bg-white mx-auto text-black font-sans border border-gray-400">
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 pt-6">
          <div>
            <img src={logo} alt="Logo" className="h-14" />
          </div>
          <div className="text-right leading-tight">
            <h2 className="font-bold text-md">Tax Invoice/Bill of Supply</h2>
            <p className="text-md">(Original for Recipient)</p>
          </div>
        </div>

        {/* ADDRESS SECTION */}
        <div className="flex justify-between px-10 mt-14">
          <div className="w-[45%] text-md leading-[1.15]">
            <p className="font-bold text-sm">Sold By :</p>
            <p>Veltex Services Private Limited, </p>
            <div className="">
              <p>711, Plot A09, ITL Tower, Netaji Subhash Place, Pitampura, Delhi 110034</p>
            </div>
            <div className="mt-14">
              <p className="text-sm">
                <span className="font-bold">PAN No:</span> AAGCK6574Q
              </p>
              <p className="text-sm">
                <span className="font-bold">GST Registration No:</span> 07AAGCK6574Q1ZO
              </p>
            </div>
          </div>
          <div className="w-[40%] text-[18px] leading-[1.1] text-right">
            <div>
              <p className="font-bold text-sm">Billing Address :</p>
              <p className="text-sm">{billingAddress}</p>
              {stateCode && (
                <p className="mt-2 text-sm">
                  <span className="font-bold text-sm">State/UT Code:</span> {stateCode}
                </p>
              )}
            </div>
            <div className="mt-8 text-sm">
              <p className="font-bold">Shipping Address :</p>
              <p className="text-sm">{shippingAddress}</p>
              {stateCode && (
                <p className="mt-2 text-sm">
                  <span className="font-bold text-sm">State/UT Code:</span> {stateCode}
                </p>
              )}
              <p>
                <span className="font-bold">Place of supply:</span> {placeOfSupply}
              </p>
              <p>
                <span className="font-bold">Place of delivery:</span> {placeOfDelivery}
              </p>
            </div>
          </div>
        </div>

        {/* ORDER DETAILS */}
        <div className="flex justify-between px-10 mt-14 text-sm">
          <div>
            <p>
              <span className="font-bold">Order Number:</span> {orderNumber}
            </p>
            <p>
              <span className="font-bold">Order Date:</span> {orderDate}
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-bold">Invoice Number :</span> {invoiceNo}
            </p>
            <p>
              <span className="font-bold">Invoice Date :</span> {invoiceDate}
            </p>
          </div>
        </div>

        {/* FULL TABLE WITH ALL COLUMNS (original layout) */}
        <div className="mx-8 mt-6 border border-black">
          <table className="w-full border-collapse text-sm ">
            <thead>
              <tr className="bg-white font-bold border-b">
                <th className="border-r border-black p-1 w-[40px] align-middle">Sl.<br />No</th>
                <th className="border-r border-black p-1 text-left align-middle">Description</th>
                <th className="border-r border-black p-1 w-[70px] text-center align-middle">Unit<br />Price</th>
                <th className="border-r border-black p-1 w-[40px] text-center align-middle">Qty</th>
                <th className="border-r border-black p-1 w-[80px] text-right align-middle">Net<br />Amount</th>
                <th className="border-r border-black p-1 w-[55px] text-center align-middle">Tax<br />Rate</th>
                <th className="border-r border-black p-1 w-[60px] text-center align-middle">Tax<br />Type</th>
                <th className="border-r border-black p-1 w-[70px] text-right align-middle">Tax<br />Amount</th>
                <th className="p-1 w-[80px] text-right align-middle">Total<br />Amount</th>
              </tr>
            </thead>
            <tbody>
              {itemRows}
              {shippingRow}
            </tbody>
            <tfoot>
              <tr className="border-b border-black font-bold">
                <td colSpan="8" className="border-r border-black p-1 text-left">TOTAL:</td>
                <td className="p-1 text-right">₹{grandTotal.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-black">
                <td colSpan="9" className="p-2">
                  <div className="flex justify-between items-start">
                    <div className="w-3/5 border-r border-gray-300 pr-2">
                      <p className="font-bold text-sm">Amount in Words:</p>
                      <p className="font-bold text-sm">{amountInWords}</p>
                    </div>
                    <div className="w-2/5 pl-2 text-right">
                      <p className="font-bold text-sm">For Veltex Services Private Limited:</p>
                      <div className="flex justify-end pr-10">
                        <img src="/signature.png" alt="signature" className="w-[90px]" />
                      </div>
                      <p className="font-bold text-sm">Authorized Signatory</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td colSpan="9" className="p-2 text-sm">Whether tax is payable under reverse charge - No</td>
              </tr>
              <tr>
                <td colSpan="2" className="border-r border-black p-2 align-top">
                  <p className="font-bold">Payment Transaction ID:</p>
                  <p>{transactionId}</p>
                </td>
                <td colSpan="4" className="border-r border-black p-2 align-top">
                  <p className="font-bold">Date & Time:</p>
                  <p className='text-nowrap'>{paidAt}</p>
                </td>
                <td colSpan="2" className="p-2 align-top">
                  <p className="font-bold text-nowrap">Mode of Payment:</p>
                  <p>{paymentMode}</p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* 👇 DISCLAIMER / FOOTER - stays at bottom of every page */}
        <div className="mt-auto text-[8px] font-semibold text-gray-600 bg-gray-50 border-t border-gray-200 p-4 rounded-b-md flex flex-col justify-center items-center flex-wrap ">
          <p className="mb-1">Please note that this invoice is not a demand for payment.</p>
          <p className="mb-1 ">
            <p className="font-semibold flex justify-center">Regd Office: VELTEX SERVICES PRIVATE LIMITED</p> 
            <p className="font-semibold flex flex-col items-center">711, Plot A09, ITL Towers, Netaji Subhash Place,<p> Pitampura, Delhi 110034, Bharat</p></p>
          </p>
          <p className="mb-1">
            Email: care@astrotring.shop | Tel: +91 11 41103510
          </p>
          <p className="text-[8px] font-bold">
            Customers desirous of availing input GST credit are requested to write an email at care@astrotring.com
            and get a Business account on Business eligible offers.
          </p>
        </div>
      </div>

    </div>
  );
};

export default OrderInvoice;