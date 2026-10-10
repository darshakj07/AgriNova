import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, CreditCard, User, Truck } from 'lucide-react';

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const userString = localStorage.getItem('agrinova_user');
  const user = userString ? JSON.parse(userString) : null;
  const adminId = user ? (user.id || user._id) : '';

  const [order, setOrder] = useState(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`, {
        headers: { 'x-user-id': adminId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  useEffect(() => {
    if (adminId && id) {
      fetchOrder();
    }
  }, [adminId, id]);

  const handleForceReleaseEscrow = async () => {
    if (!order) return;
    try {
      const res = await fetch(`${API_BASE}/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId
        },
        body: JSON.stringify({ status: 'Completed', paymentStatus: 'Released to Farmer' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Emergency Escrow Release triggered: Funds dispatched to Farmer account.");
        fetchOrder();
      } else {
        alert(data.message || 'Failed to force release escrow.');
      }
    } catch (err) {
      console.error('Error force releasing escrow:', err);
      alert('Error communicating with server.');
    }
  };

  const handleForceRefundEscrow = async () => {
    if (!order) return;
    try {
      const res = await fetch(`${API_BASE}/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId
        },
        body: JSON.stringify({ status: 'Cancelled', paymentStatus: 'Refunded to Buyer' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Emergency Escrow Refund triggered: Funds returned back to Buyer deposit wallet.");
        fetchOrder();
      } else {
        alert(data.message || 'Failed to force refund escrow.');
      }
    } catch (err) {
      console.error('Error force refunding escrow:', err);
      alert('Error communicating with server.');
    }
  };

  if (!order) return <div className="text-center py-12 text-gray-550 font-semibold">Loading transaction details...</div>;

  const getProductDisplay = () => {
    if (!order.product) return 'Crop Produce';
    return order.product.name || 'Crop Produce';
  };

  const getBuyerDisplay = () => {
    if (!order.buyer) return 'Corporate Buyer';
    return order.buyer.name || order.buyer.manager || 'Corporate Buyer';
  };

  const getAmountDisplay = () => {
    if (order.product && order.product.total) return order.product.total;
    if (order.amount) return order.amount;
    return '₹0';
  };

  const getEscrowDisplay = () => {
    if (order.payment && order.payment.status) {
      if (order.payment.status.includes('Released')) return 'Released';
      if (order.payment.status.includes('Refunded')) return 'Refunded';
      return 'Locked';
    }
    return 'Locked';
  };

  const escrowState = getEscrowDisplay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('../orders')}
            className="p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-charcoal dark:text-gray-100/60 hover:text-primary transition-all focus:outline-none bg-white dark:bg-[#1E293B]"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Order & Escrow Audit</h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Audit transaction hashes, logistics logs, and override escrow releases.</p>
          </div>
        </div>

        {/* Override controls */}
        {escrowState === 'Locked' && (
          <div className="flex gap-2">
            <button
              onClick={handleForceRefundEscrow}
              className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800/50 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 text-xs font-bold transition-all focus:outline-none uppercase tracking-wide bg-white dark:bg-[#1E293B]"
            >
              Force Refund (Cancel)
            </button>
            <button
              onClick={handleForceReleaseEscrow}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-all focus:outline-none uppercase tracking-wide"
            >
              Force Release (Deliver)
            </button>
          </div>
        )}
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Transaction parties & payment details */}
        <div className="space-y-6">
          {/* Parties involved */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-55/10 pb-3">
              <User className="w-4.5 h-4.5 text-primary" />
              <span>Parties Involved</span>
            </h3>
            <div className="space-y-3 font-semibold text-gray-650 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">FARMER (SELLER)</span>
                <span className="text-charcoal dark:text-gray-100 font-bold block mt-0.5">{order.farmer || 'AgriNova Supplier'}</span>
                <span className="text-gray-400 text-[10px]">seller@agrinova.com</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">BUYER (PURCHASER)</span>
                <span className="text-charcoal dark:text-gray-100 font-bold block mt-0.5">{getBuyerDisplay()}</span>
                <span className="text-gray-400 text-[10px]">{order.buyer?.phone || ''}</span>
              </div>
            </div>
          </div>

          {/* Payment Escrow Specs */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-55/10 pb-3">
              <CreditCard className="w-4.5 h-4.5 text-primary" />
              <span>Escrow Financials</span>
            </h3>
            <div className="space-y-3 font-semibold text-gray-650 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">TOTAL AMOUNT</span>
                <span className="text-charcoal dark:text-gray-100 font-extrabold text-sm block mt-0.5">{getAmountDisplay()}</span>
              </div>
              <div className="flex justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">PLATFORM COMM.</span>
                  <span className="text-charcoal dark:text-gray-100 font-semibold block mt-0.5">2% commission</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">ESCROW STATE</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold block mt-0.5 border ${
                    escrowState === 'Released'
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50'
                      : escrowState === 'Refunded'
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50'
                      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                  }`}>
                    {escrowState}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase font-bold">ESCROW LEDGER NODE</span>
                <span className="font-mono text-[10px] text-primary block mt-0.5">{order.payment?.transactionId || 'TXN-902341'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order status timeline and Logistics tracker */}
        <div className="lg:col-span-2 space-y-6">
          {/* Produce detail & Logistics */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-[#0F172A] rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">PRODUCE DETAILS</span>
              <span className="text-sm font-bold text-charcoal dark:text-gray-100 block">{getProductDisplay()}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold block">{order.product?.qty} @ {order.product?.rate}</span>
            </div>
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-[#0F172A] rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase block flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-primary" />
                <span>LOGISTICS TRACKING</span>
              </span>
              <span className="text-sm font-bold text-charcoal dark:text-gray-100 block">AgriExpress Logistics</span>
              <span className="font-mono text-xs text-primary font-bold block">TRK-902341-N</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2">
                <ClipboardList className="w-4.5 h-4.5 text-primary" />
                <span>Tracking Timeline & Audit Log</span>
              </h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Realtime events registered in the platform database.</p>
            </div>

            <div className="relative pl-6 border-l border-gray-100 dark:border-gray-800 space-y-6 ml-2 text-xs font-semibold text-gray-655">
              <div className="relative">
                <div className="absolute -left-8.5 top-1 w-4.5 h-4.5 rounded-full border-4 border-white bg-primary shadow-sm" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal dark:text-gray-100 font-bold">Order Registered & Escrow Created</span>
                    <span className="text-[10px] text-gray-400">{order.date || new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed">Secure escrow node generated, buyer funds held.</p>
                </div>
              </div>

              {order.status === 'Completed' && (
                <div className="relative">
                  <div className="absolute -left-8.5 top-1 w-4.5 h-4.5 rounded-full border-4 border-white bg-green-600 shadow-sm" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 dark:text-green-400 font-extrabold">Delivery Completed & Escrow Released</span>
                      <span className="text-[10px] text-gray-400">Just Now</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">System force-delivered or verified via courier webhooks.</p>
                  </div>
                </div>
              )}

              {order.status === 'Cancelled' && (
                <div className="relative">
                  <div className="absolute -left-8.5 top-1 w-4.5 h-4.5 rounded-full border-4 border-white bg-red-600 shadow-sm" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-red-700 dark:text-red-400 font-extrabold">Order Cancelled & Escrow Refunded</span>
                      <span className="text-[10px] text-gray-400">Just Now</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">System override triggers return of escrow vault contents.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

