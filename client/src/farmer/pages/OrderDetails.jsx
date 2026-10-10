import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, ShoppingBag, CreditCard, ShieldCheck, MapPin, Truck, Calendar, Loader2, Check, X, Star } from 'lucide-react';
import { io } from 'socket.io-client';
import ReviewModal from '../../components/ReviewModal';

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [order, setOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(2); // 1: Confirmed, 1.5: Accepted, 2: Packed, 3: Dispatched, 4: Delivered, 0: Cancelled/Rejected
  const [review, setReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const socketRef = useRef(null);

  const updateCurrentStep = (status) => {
    const statusVal = status ? status.toLowerCase() : 'pending';
    if (statusVal === 'completed' || statusVal === 'delivered') {
      setCurrentStep(4);
    } else if (statusVal === 'shipped' || statusVal === 'in transit' || statusVal === 'ready for dispatch') {
      setCurrentStep(3);
    } else if (statusVal === 'processing' || statusVal === 'quality checking') {
      setCurrentStep(2);
    } else if (statusVal === 'accepted') {
      setCurrentStep(1.5);
    } else if (statusVal === 'pending') {
      setCurrentStep(1);
    } else {
      setCurrentStep(0); // Cancelled / Rejected
    }
  };

  const fetchOrder = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/api/orders/${id}`, {
        headers: {
          'x-user-id': user.id || user._id
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOrder(data.order);
        updateCurrentStep(data.order.status);
        fetchReview();
      } else {
        setOrder(false);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setOrder(false);
    }
  };

  const fetchReview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews/order/${id}`, {
        headers: { 'x-user-id': user.id || user._id }
      });
      const data = await res.json();
      if (res.ok && data.success && data.review) {
        setReview(data.review);
      }
    } catch (err) {
      console.error('Error fetching review:', err);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user._id
        },
        body: JSON.stringify(reviewData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReview(data.review);
        setIsReviewModalOpen(false);
        alert('Review submitted successfully!');
      } else {
        alert(data.message || 'Error submitting review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Error submitting review');
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id, user]);

  useEffect(() => {
    socketRef.current = io(API_BASE);

    socketRef.current.on('orderUpdated', (data) => {
      if (data && data.orderId === id) {
        console.log('[Socket] Order status updated in real-time:', data);
        fetchOrder();
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [id, user]);

  const handleStatusUpdate = async (nextStatus, customPaymentStatus = null) => {
    if (!order) return;

    let paymentStatus = customPaymentStatus || order.payment?.status || 'Held in Escrow';
    if (nextStatus === 'Delivered') paymentStatus = 'Released to Farmer';
    else if (nextStatus === 'Cancelled' || nextStatus === 'Rejected') paymentStatus = 'Refunded to Buyer';

    try {
      const response = await fetch(`${API_BASE}/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user._id
        },
        body: JSON.stringify({
          status: nextStatus,
          paymentStatus: paymentStatus
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOrder(data.order);
        updateCurrentStep(data.order.status);
      } else {
        alert(data.message || 'Failed to update order status.');
      }
    } catch (err) {
      console.error('Error changing status:', err);
      alert('Error: ' + err.message);
    }
  };

  if (order === null) {
    return (
      <div className="py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        <p className="text-sm text-gray-400 font-bold">Loading order particulars...</p>
      </div>
    );
  }

  if (order === false) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <div className="text-4xl">âš ï¸</div>
        <h3 className="font-display font-bold text-xl text-charcoal dark:text-gray-100">Order Invoice Not Found</h3>
        <p className="text-sm text-gray-400 font-medium">We couldn't locate this transaction invoice in local storage records.</p>
        <button onClick={() => navigate('/farmer/orders')} className="px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary-dark transition-all cursor-pointer">
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer/orders')}
            className="p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-charcoal dark:text-gray-100/60 hover:text-primary transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Invoice Details</h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Order ID: <strong className="font-mono text-gray-500 dark:text-gray-400 font-bold">{order.id}</strong> &bull; Date: {order.date}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {order.status === 'Pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate('Rejected')}
                className="px-5 py-2.5 rounded-xl border border-red-250 text-red-700 hover:bg-red-50 text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer focus:outline-none"
              >
                <X className="w-4 h-4" />
                <span>Reject Order</span>
              </button>
              <button
                onClick={() => handleStatusUpdate('Accepted')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer focus:outline-none uppercase tracking-wider"
              >
                <Check className="w-4.5 h-4.5 animate-pulse" />
                <span>Accept Order</span>
              </button>
            </>
          )}

          {order.status === 'Accepted' && (
            <button
              onClick={() => handleStatusUpdate('Processing')}
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Mark as Quality Checked</span>
            </button>
          )}

          {(order.status === 'Processing' || order.status === 'Quality Checking') && (
            <button
              onClick={() => handleStatusUpdate('Shipped')}
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Dispatch Shipment</span>
            </button>
          )}

          {(order.status === 'Shipped' || order.status === 'In Transit' || order.status === 'Ready For Dispatch') && (
            <button
              onClick={() => handleStatusUpdate('Delivered')}
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Mark as Delivered</span>
            </button>
          )}

          {(order.status === 'Delivered' || order.status === 'Completed') && !review && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider focus:outline-none"
            >
              <Star className="w-4.5 h-4.5" />
              <span>Leave Review</span>
            </button>
          )}
          
          {review && (
            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2.5 rounded-xl border border-yellow-100">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="text-xs font-bold text-yellow-700">You rated {review.rating} Stars</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Details Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Buyer Details */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <User className="w-4.5 h-4.5 text-primary" />
              <span>Buyer Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <div>
                <span className="text-xs text-gray-400 block">COMPANY NAME</span>
                <span className="text-charcoal dark:text-gray-100 font-bold text-sm block mt-0.5">{order.buyer.name}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">CONTACT PERSON</span>
                <span className="text-charcoal dark:text-gray-100 font-bold block mt-0.5">{order.buyer.manager}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-gray-400 block">SHIPPING ADDRESS</span>
                <span className="text-gray-500 dark:text-gray-400 font-medium flex items-start gap-1.5 mt-0.5 leading-normal">
                  <MapPin className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                  {order.buyer.address}
                </span>
              </div>
            </div>
          </div>

          {/* Product Sheet */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <ShoppingBag className="w-4.5 h-4.5 text-primary" />
              <span>Crop Details</span>
            </h3>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-charcoal/5 dark:border-white/5 text-xs font-bold text-gray-400 uppercase">
                    <th className="pb-3">Product Description</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Rate/qtl</th>
                    <th className="pb-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="font-semibold text-gray-600 dark:text-gray-300">
                  <tr>
                    <td className="py-3 font-bold text-charcoal dark:text-gray-100">{order.product.name}</td>
                    <td className="py-3">{order.product.qty}</td>
                    <td className="py-3">{order.product.rate}</td>
                    <td className="py-3 text-right font-display font-extrabold text-charcoal dark:text-gray-100">{order.product.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <CreditCard className="w-4.5 h-4.5 text-primary" />
              <span>Payment Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <div>
                <span className="text-xs text-gray-400 block">ESCROW PAYMENT STATUS</span>
                <span className="text-primary font-bold flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-4 h-4 fill-current text-primary" />
                  {order.payment.status}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">METHOD</span>
                <span className="text-gray-500 dark:text-gray-400 font-bold block mt-0.5">{order.payment.method}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-gray-400 block">TRANSACTION REFERENCE</span>
                <span className="text-gray-500 dark:text-gray-400 font-mono font-medium block mt-0.5">{order.payment.transactionId}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Shipping timeline stepper */}
        <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
            <Calendar className="w-4.5 h-4.5 text-primary" />
            <span>Fulfillment Progress</span>
          </h3>

          <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-150">
            {/* Step 1: Placed */}
            <div className="relative">
              <span className={`absolute -left-10.5 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                currentStep >= 1 
                  ? 'bg-primary border-primary text-white shadow-sm ring-4 ring-primary/15' 
                  : 'bg-white dark:bg-[#1E293B] border-gray-300 text-gray-300'
              }`}>
                {currentStep >= 1 ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
              </span>
              <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">Order Placed & Escrow Locked</h4>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                {order.statusTimestamps?.placedAt || order.date}
              </p>
            </div>

            {/* Step 1.5: Accepted */}
            <div className="relative">
              <span className={`absolute -left-10.5 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                currentStep >= 1.5 
                  ? 'bg-primary border-primary text-white shadow-sm ring-4 ring-primary/15' 
                  : order.status === 'Pending'
                    ? 'bg-amber-500 border-amber-500 text-white animate-pulse ring-4 ring-amber-500/15'
                    : 'bg-white dark:bg-[#1E293B] border-gray-300 text-gray-300'
              }`}>
                {currentStep >= 1.5 ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </span>
              <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">Contract Accepted</h4>
              <p className={`text-xs mt-1 font-medium ${order.status === 'Pending' ? 'text-amber-600' : 'text-gray-400'}`}>
                {order.statusTimestamps?.acceptedAt || (order.status === 'Pending' ? 'Awaiting your acceptance' : 'Awaiting confirmation')}
              </p>
            </div>

            {/* Step 2: Quality Checked */}
            <div className="relative">
              <span className={`absolute -left-10.5 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                currentStep >= 2 
                  ? 'bg-primary border-primary text-white shadow-sm ring-4 ring-primary/15' 
                  : order.status === 'Accepted'
                    ? 'bg-amber-500 border-amber-500 text-white animate-pulse ring-4 ring-amber-500/15'
                    : 'bg-white dark:bg-[#1E293B] border-gray-300 text-gray-300'
              }`}>
                {currentStep >= 2 ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </span>
              <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">QC Verified & Packed</h4>
              <p className={`text-xs mt-1 font-medium ${order.status === 'Accepted' ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                {order.statusTimestamps?.processingAt || (order.status === 'Accepted' ? 'Awaiting Quality Check' : 'Awaiting previous step')}
              </p>
            </div>

            {/* Step 3: Dispatch */}
            <div className="relative">
              <span className={`absolute -left-10.5 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                currentStep >= 3 
                  ? 'bg-primary border-primary text-white shadow-sm ring-4 ring-primary/15' 
                  : (order.status === 'Processing' || order.status === 'Quality Checking')
                    ? 'bg-amber-500 border-amber-500 text-white animate-pulse ring-4 ring-amber-500/15'
                    : 'bg-white dark:bg-[#1E293B] border-gray-300 text-gray-300'
              }`}>
                {currentStep >= 3 ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </span>
              <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">Dispatched & In Transit</h4>
              <p className={`text-xs mt-1 font-medium ${(order.status === 'Processing' || order.status === 'Quality Checking') ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                {order.statusTimestamps?.shippedAt || 'Awaiting logistics dispatch'}
              </p>
            </div>

            {/* Step 4: Delivered */}
            <div className="relative">
              <span className={`absolute -left-10.5 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                currentStep >= 4 
                  ? 'bg-primary border-primary text-white shadow-sm ring-4 ring-primary/15' 
                  : (order.status === 'Shipped' || order.status === 'In Transit' || order.status === 'Ready For Dispatch')
                    ? 'bg-amber-500 border-amber-500 text-white animate-pulse ring-4 ring-amber-500/15'
                    : 'bg-white dark:bg-[#1E293B] border-gray-300 text-gray-300'
              }`}>
                {currentStep >= 4 ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
              </span>
              <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">Delivered to Buyer</h4>
              <p className={`text-xs mt-1 font-medium ${(order.status === 'Shipped' || order.status === 'In Transit' || order.status === 'Ready For Dispatch') ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                {order.statusTimestamps?.deliveredAt || 'Awaiting buyer confirmation'}
              </p>
            </div>

            {/* Red step if Cancelled or Rejected */}
            {(order.status === 'Cancelled' || order.status === 'Rejected') && (
              <div className="relative border-l-2 border-red-500 pl-4 py-2 bg-red-50/50 rounded-xl mt-4">
                <span className="absolute -left-[31px] top-4 w-5 h-5 rounded-full bg-red-600 text-white border-2 border-red-650 flex items-center justify-center shadow-sm">
                  <X className="w-3 h-3 stroke-[3]" />
                </span>
                <h4 className="text-sm font-bold text-red-600">Order {order.status}</h4>
                <p className="text-xs text-red-700 mt-1 font-semibold">
                  {order.statusTimestamps?.cancelledAt || 'Order was rejected or cancelled.'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
      
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        role="Farmer"
        orderId={order.id}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}

