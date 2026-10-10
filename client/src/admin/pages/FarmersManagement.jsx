import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Search, ShieldCheck, Ban, ArrowRight, UserMinus, AlertTriangle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FarmersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Get logged-in admin user details
  const { user: adminUser } = useOutletContext();

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/auth/farmers`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to retrieve grower records.');
      }
      setFarmers(data.farmers || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleBlockClick = (user) => {
    setSelectedUser(user);
    if (user.isBlocked) {
      setShowUnblockModal(true);
    } else {
      setBlockReason('');
      setShowBlockModal(true);
    }
  };

  const handleBlockConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/users/${selectedUser._id}/block`, {
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
        throw new Error(data.message || 'Failed to suspend user.');
      }
      
      // Update local state
      setFarmers(prev => prev.map(f => f._id === selectedUser._id ? { ...f, isBlocked: true, blockedReason: blockReason } : f));
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedUser(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/users/${selectedUser._id}/block`, {
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
        throw new Error(data.message || 'Failed to reactivate user.');
      }
      
      // Update local state
      setFarmers(prev => prev.map(f => f._id === selectedUser._id ? { ...f, isBlocked: false, blockedReason: '' } : f));
      setShowUnblockModal(false);
      setSelectedUser(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(f => {
    const fullName = `${f.firstName || ''} ${f.lastName || ''}`.toLowerCase();
    const farmName = (f.farmName || '').toLowerCase();
    const farmLocation = (f.farmLocation || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || farmName.includes(query) || farmLocation.includes(query);
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Farmers Management</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Audit verified agricultural grower registries, land acreage configurations, and active crop catalog listings.</p>
      </div>

      {/* Control panel */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 sm:p-6 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search grower, farm name, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-55/40 border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
          />
        </div>
      </div>

      {/* Farmers List */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-gray-450 font-bold">Retrieving grower registries...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-red-650 dark:text-red-400">
            <AlertTriangle className="w-10 h-10" />
            <p className="text-sm font-bold">Failed to load growers: {error}</p>
            <button onClick={fetchFarmers} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">Retry</button>
          </div>
        ) : filteredFarmers.length === 0 ? (
          <div className="text-center py-20 text-gray-450 font-semibold">
            No growers found matching your parameters.
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 dark:bg-[#0F172A]/50 border-b border-gray-100 dark:border-gray-800">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap pl-6">Grower Name</th>
                  <th className="p-4 whitespace-nowrap">Farm Details</th>
                  <th className="p-4 whitespace-nowrap">Primary Crops</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 text-right whitespace-nowrap pr-6">Actions Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5 font-semibold text-gray-600 dark:text-gray-300">
                {filteredFarmers.map((f) => (
                  <tr key={f._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-bold text-charcoal dark:text-gray-100 pl-6">
                      <div>
                        <span>{f.firstName} {f.lastName}</span>
                        {f.isBlocked && (
                          <span className="block text-[10px] text-red-500 font-bold mt-0.5 truncate max-w-[180px]" title={f.blockedReason}>
                            Reason: {f.blockedReason || 'None'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-primary font-bold block">{f.farmName || 'Unregistered Farm'}</span>
                      <span className="text-xs text-gray-400 font-semibold">{f.farmLocation || 'Location unspecified'} &bull; {f.phone}</span>
                    </td>
                    <td className="p-4 text-xs font-medium text-gray-550">
                      {f.primaryCrops || 'None declared'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        !f.isBlocked ? 'bg-green-50 dark:bg-green-900/30 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50 dark:border-green-500/30' : 'bg-red-50 dark:bg-red-900/30 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-155 dark:border-red-800/50 dark:border-red-500/30'
                      }`}>
                        {!f.isBlocked ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 shrink-0 pr-6">
                      <button
                        onClick={() => handleBlockClick(f)}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          !f.isBlocked
                            ? 'border-red-100 dark:border-red-800/50 text-red-500 hover:bg-red-55/10 dark:hover:bg-red-900/30 dark:border-red-900/50'
                            : 'border-green-100 dark:border-green-800/50 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30/70 dark:border-green-900/50'
                        }`}
                        title={!f.isBlocked ? 'Suspend Grower' : 'Activate Grower'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <Link
                        to={`${f._id}`}
                        className="p-2 rounded-lg border border-gray-150 hover:border-primary/20 text-gray-550 hover:text-primary dark:border-white/10 dark:text-gray-400 dark:hover:text-primary dark:hover:border-primary/30 transition-all inline-flex items-center justify-center focus:outline-none"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                  <h3 className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100">Suspend grower account</h3>
                  <p className="text-xs text-gray-400 font-semibold leading-normal">
                    You are suspending the account for <strong className="text-charcoal dark:text-gray-100">{selectedUser?.firstName} {selectedUser?.lastName}</strong>. They will be logged out and cannot sign in.
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
                  <h3 className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100">Reactivate grower account</h3>
                  <p className="text-xs text-gray-400 font-semibold leading-normal">
                    Are you sure you want to restore access for <strong className="text-charcoal dark:text-gray-100">{selectedUser?.firstName} {selectedUser?.lastName}</strong>? This will enable them to log in again immediately.
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

