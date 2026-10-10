import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, ShieldCheck, MapPin, Building2, ShoppingBag, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BuyerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBuyerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${API_BASE}/api/auth/buyers`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to retrieve buyer records.');
      }
      
      const currentBuyer = data.buyers?.find(b => b._id === id);
      if (!currentBuyer) {
        throw new Error('Buyer record not found in system.');
      }

      setBuyer({
        id: currentBuyer._id,
        name: `${currentBuyer.firstName} ${currentBuyer.lastName}`,
        companyName: currentBuyer.companyName,
        location: currentBuyer.city,
        email: currentBuyer.email,
        phone: currentBuyer.phone,
        gstin: '23AABCU1234F1Z5', // Mock GST for display
        businessType: currentBuyer.businessType || 'Retailer',
        escrowBalance: '₹4,50,000', // Mock escrow stats
        totalPurchases: '₹12,40,000',
        verified: true, // Mock verified
        status: currentBuyer.isBlocked ? 'Suspended' : 'Active',
        isBlocked: currentBuyer.isBlocked,
        blockedReason: currentBuyer.blockedReason,
        orders: [
          { id: 'ORD-89302', date: '2026-06-01', amount: '₹1,25,000', status: 'Delivered', product: 'Wheat (Sarbati)' },
          { id: 'ORD-89241', date: '2026-05-24', amount: '₹3,25,000', status: 'Transit', product: 'Basmati Rice' },
          { id: 'ORD-89110', date: '2026-05-10', amount: '₹80,000', status: 'Pending Escrow', product: 'Organic Potatoes' }
        ]
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerData();
  }, [id]);

  const handleToggleVerification = () => {
    if (!buyer) return;
    setBuyer(prev => ({ ...prev, verified: !prev.verified }));
    alert(`Buyer GST validation status updated successfully!`);
  };

  const handleToggleSuspend = () => {
    if (!buyer) return;
    if (buyer.isBlocked) {
      setShowUnblockModal(true);
    } else {
      setBlockReason('');
      setShowBlockModal(true);
    }
  };

  const handleBlockConfirm = async () => {
    if (!buyer) return;
    setActionLoading(true);
    try {
      const adminUser = JSON.parse(localStorage.getItem('agrinova_user') || '{}');
      const res = await fetch(`${API_BASE}/api/auth/users/${buyer.id}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser?.id || adminUser?._id || ''
        },
        body: JSON.stringify({
          isBlocked: true,
          reason: blockReason
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to suspend buyer.');
      }
      
      setBuyer(prev => ({
        ...prev,
        isBlocked: true,
        status: 'Suspended',
        blockedReason: blockReason
      }));
      setShowBlockModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockConfirm = async () => {
    if (!buyer) return;
    setActionLoading(true);
    try {
      const adminUser = JSON.parse(localStorage.getItem('agrinova_user') || '{}');
      const res = await fetch(`${API_BASE}/api/auth/users/${buyer.id}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminUser?.id || adminUser?._id || ''
        },
        body: JSON.stringify({
          isBlocked: false,
          reason: 'Your account access has been fully restored by the administrator.'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reactivate buyer.');
      }
      
      setBuyer(prev => ({
        ...prev,
        isBlocked: false,
        status: 'Active',
        blockedReason: ''
      }));
      setShowUnblockModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-gray-450 font-bold">Retrieving buyer profile details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3 text-red-650 dark:text-red-400">
        <AlertTriangle className="w-10 h-10" />
        <p className="text-sm font-bold">Failed to load buyer: {error}</p>
        <button onClick={() => navigate('../buyers')} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">Go Back</button>
      </div>
    );
  }

  if (!buyer) return <div className="text-center py-12 text-gray-550 font-semibold">Buyer not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('../buyers')}
            className="p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-charcoal dark:text-gray-100/60 hover:text-primary transition-all focus:outline-none"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Buyer Profile Audit</h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Audit corporate credentials, GSTIN registration, and escrow turnover logs.</p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleToggleSuspend}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all focus:outline-none ${
              buyer.status === 'Active'
                ? 'border-red-200 dark:border-red-800/50 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                : 'border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
            }`}
          >
            {buyer.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
          </button>
          <button
            onClick={handleToggleVerification}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 focus:outline-none text-white ${
              buyer.verified ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{buyer.verified ? 'Revoke GST Verification' : 'Approve GST Registration'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile details */}
        <div className="space-y-6">
          {/* Identity details */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <User className="w-4.5 h-4.5 text-primary" />
              <span>Identity & Contact Details</span>
            </h3>
            <div className="grid grid-cols-1 gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">REPRESENTATIVE NAME</span>
                <span className="text-charcoal dark:text-gray-100 font-bold text-sm block mt-0.5">{buyer.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">PHONE NUMBER</span>
                <span className="text-charcoal dark:text-gray-100 font-bold block mt-0.5">{buyer.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">EMAIL ADDRESS</span>
                <span className="text-charcoal dark:text-gray-100 font-bold block mt-0.5">{buyer.email}</span>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <Building2 className="w-4.5 h-4.5 text-primary" />
              <span>Business Registration</span>
            </h3>
            <div className="grid grid-cols-1 gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">COMPANY NAME</span>
                <span className="text-charcoal dark:text-gray-100 font-bold text-sm block mt-0.5">{buyer.companyName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">BUSINESS CLASSIFICATION</span>
                <span className="text-charcoal dark:text-gray-100 font-bold block mt-0.5">{buyer.businessType}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">GSTIN IDENTIFICATION</span>
                <span className="font-mono text-primary font-bold text-sm block mt-0.5">{buyer.gstin}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">OFFICE HEADQUARTERS</span>
                <span className="text-gray-500 dark:text-gray-400 font-medium block mt-0.5 flex items-start gap-1">
                  <MapPin className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                  {buyer.location}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">GST REGISTRY STATUS</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold block mt-1 w-fit ${
                  buyer.verified ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-155 dark:border-green-800/50' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-155 dark:border-amber-800/50 animate-pulse'
                }`}>
                  {buyer.verified ? 'GSTIN Validated & Verified' : 'GST Verification Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right columns: Escrow Stats and Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Escrow stats */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-[#0F172A] rounded-2xl">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">ESCROW DEPOSITS BALANCE</span>
              <span className="text-xl font-extrabold text-charcoal dark:text-gray-100 block mt-1">{buyer.escrowBalance}</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#0F172A] rounded-2xl">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">TOTAL PLATFORM SPEND</span>
              <span className="text-xl font-extrabold text-primary block mt-1">{buyer.totalPurchases}</span>
            </div>
          </div>

          {/* Orders History */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4.5 h-4.5 text-primary" />
                <span>Purchase History & Escrows</span>
              </h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Historical purchase logs with financial clearance flags.</p>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Crop / Item</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-right">Escrow Status</th>
                  </tr>
                </thead>
                <tbody className="font-semibold text-gray-600 dark:text-gray-300 divide-y divide-gray-50">
                  {buyer.orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-4 text-primary font-mono font-bold text-xs">{o.id}</td>
                      <td className="py-4 text-charcoal dark:text-gray-100 font-bold">{o.product}</td>
                      <td className="py-4 text-xs">{o.date}</td>
                      <td className="py-4 font-extrabold text-charcoal dark:text-gray-100">{o.amount}</td>
                      <td className="py-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.status === 'Delivered'
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50'
                            : o.status === 'Transit'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-150 dark:border-blue-800/50'
                            : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-150 dark:border-amber-800/50'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Suspend Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !actionLoading && setShowBlockModal(false)}
              className="absolute inset-0 bg-charcoal/40 backdrop-blur-xs"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#1E293B] rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-charcoal/5 dark:border-white/5 relative z-10 space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100">Suspend buyer account</h3>
                  <p className="text-xs text-gray-400 font-semibold leading-normal">
                    You are suspending the account for <strong className="text-charcoal dark:text-gray-100">{buyer?.name}</strong>. They will be logged out and cannot sign in.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal dark:text-gray-100-light uppercase tracking-wider block">Reason for suspension</label>
                <textarea
                  required
                  placeholder="Enter the exact reason here. This will be sent directly to their registered email address..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  disabled={actionLoading}
                  className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/30 text-sm font-semibold text-charcoal dark:text-gray-100 rounded-xl p-3 h-28 resize-none transition-all disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-xl border border-gray-150 text-charcoal dark:text-gray-100/60 hover:text-charcoal dark:text-gray-100 hover:bg-gray-50 dark:bg-[#0F172A] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBlockConfirm}
                  disabled={actionLoading || !blockReason.trim()}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-all shadow-md shadow-red-500/10 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  <span>Confirm Suspension</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unblock Confirmation Modal */}
      <AnimatePresence>
        {showUnblockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !actionLoading && setShowUnblockModal(false)}
              className="absolute inset-0 bg-charcoal/40 backdrop-blur-xs"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#1E293B] rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-charcoal/5 dark:border-white/5 relative z-10 space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100">Reactivate buyer account</h3>
                  <p className="text-xs text-gray-400 font-semibold leading-normal">
                    Are you sure you want to restore access for <strong className="text-charcoal dark:text-gray-100">{buyer?.name}</strong>? This will enable them to log in again immediately.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnblockModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-xl border border-gray-150 text-charcoal dark:text-gray-100/60 hover:text-charcoal dark:text-gray-100 hover:bg-gray-50 dark:bg-[#0F172A] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUnblockConfirm}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition-all shadow-md shadow-primary/10 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>Reactivate Account</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

