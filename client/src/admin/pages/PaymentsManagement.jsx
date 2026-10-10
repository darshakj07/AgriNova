import React, { useState, useEffect } from 'react';
import { ShieldAlert, Settings } from 'lucide-react';
import { io } from 'socket.io-client';

export default function PaymentsManagement() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const userString = localStorage.getItem('agrinova_user');
  const user = userString ? JSON.parse(userString) : null;
  const adminId = user ? (user.id || user._id) : '';

  const [commissionRate, setCommissionRate] = useState(2.0);
  const [escrows, setEscrows] = useState([]);
  const [totalLocked, setTotalLocked] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [releasedTurnover, setReleasedTurnover] = useState(0);
  const [lockedContractsCount, setLockedContractsCount] = useState(0);

  const fetchEscrows = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        headers: { 'x-user-id': adminId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const orders = data.orders;

        let mapped = [];
        let lockedVal = 0;
        let revVal = 0;
        let releasedVal = 0;
        let lockedCount = 0;

        orders.forEach(o => {
          const numericTotal = parseFloat((o.product?.total || o.amount || '').replace(/[^0-9.]/g, '')) || 0;
          const orderCommissionRate = o.commissionRate !== undefined ? o.commissionRate : 2.0;
          const fee = numericTotal * (orderCommissionRate / 100);

          let status = 'Locked';
          if (o.status === 'Completed' || o.status === 'Delivered') {
            status = 'Released';
            releasedVal += numericTotal;
            revVal += fee;
          } else if (o.status === 'Cancelled' || o.status === 'Rejected') {
            status = 'Refunded';
          } else {
            status = 'Locked';
            lockedVal += numericTotal;
            lockedCount++;
          }

          mapped.push({
            id: `ESC-${o.id.slice(-4).toUpperCase()}`,
            orderId: o.id,
            amount: o.product?.total || `₹${numericTotal.toLocaleString()}`,
            buyer: o.buyer?.name || 'Corporate Buyer',
            farmer: o.farmer || 'AgriNova Supplier',
            platformFee: `₹${fee.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            status,
            address: `0x${o.payment?.transactionId?.slice(-6) || '53Ac82'}29`
          });
        });

        setEscrows(mapped);
        setTotalLocked(lockedVal);
        setRevenue(revVal);
        setReleasedTurnover(releasedVal);
        setLockedContractsCount(lockedCount);
      }
    } catch (err) {
      console.error('Error fetching escrow list:', err);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/settings`, {
          headers: { 'x-user-id': adminId }
        });
        const data = await res.json();
        if (res.ok && data.success && data.settings) {
          setCommissionRate(data.settings.commissionRate);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    if (adminId) {
      fetchSettings();
    }
  }, [adminId]);

  useEffect(() => {
    if (adminId) {
      fetchEscrows();
    }
  }, [adminId, commissionRate]);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(API_BASE);
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  const handleUpdateCommission = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId
        },
        body: JSON.stringify({ commissionRate })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Failed to update commission rate on server');
        return;
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('Error updating commission rate on server');
      return;
    }

    // Create Notification
    const created = {
      id: Date.now(),
      title: 'Platform Commission Updated',
      message: `The platform transaction commission rate has been updated to ${commissionRate}% for all escrow dispatches.`,
      target: 'All Users',
      type: 'Info',
      date: new Date().toISOString().split('T')[0]
    };

    // Save to localStorage
    const stored = JSON.parse(localStorage.getItem('agrinova_announcements') || '[]');
    const updated = [created, ...stored];
    localStorage.setItem('agrinova_announcements', JSON.stringify(updated));

    // Emit socket broadcast
    if (socket) {
      socket.emit('sendAnnouncement', created);
    }

    alert(`Platform transaction commission updated to ${commissionRate}% and notification broadcasted.`);
    fetchEscrows();
  };

  const handleReleaseEscrowOverride = async (orderId) => {
    if (confirm("Are you sure you want to trigger a manual release override? This dispatches funds to the farmer wallet immediately.")) {
      try {
        const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': adminId
          },
          body: JSON.stringify({ status: 'Completed', paymentStatus: 'Released to Farmer' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          alert("Funds released to Supplier wallet successfully.");
          fetchEscrows();
        } else {
          alert(data.message || 'Failed to force release escrow.');
        }
      } catch (err) {
        console.error('Error force releasing escrow:', err);
        alert('Error communicating with server.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Payments Management (Escrows)</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Audit active escrow nodes, monitor platform commissions, and configure transaction parameters.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold block uppercase">TOTAL LOCKED ESCROWS</span>
          <span className="text-xl font-extrabold text-charcoal dark:text-gray-100 block mt-1">₹{totalLocked.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[10px] text-primary font-bold block mt-0.5">&bull; {lockedContractsCount} active contracts</span>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold block uppercase">ACCUMULATED REVENUE</span>
          <span className="text-xl font-extrabold text-primary block mt-1">₹{revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">&bull; Form fees + commissions</span>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold block uppercase">RELEASED TURNOVER</span>
          <span className="text-xl font-extrabold text-charcoal dark:text-gray-100 block mt-1">₹{releasedTurnover.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[10px] text-green-700 dark:text-green-400 font-bold block mt-0.5">&bull; Completed orders</span>
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold block uppercase">ESCROW COMMISSION</span>
          <span className="text-xl font-extrabold text-secondary block mt-1">{commissionRate}%</span>
          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">&bull; Customizable rate</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Commission Rate Settings */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-55/10 pb-3">
            <Settings className="w-4.5 h-4.5 text-primary" />
            <span>Platform Tax Parameters</span>
          </h3>
          <form onSubmit={handleUpdateCommission} className="space-y-4 text-xs font-semibold text-gray-655">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block uppercase">COMMISSION RATE (%)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-55/10 border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-bold text-charcoal dark:text-gray-100"
              />
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-1">
                This percentage is deducted from the seller's escrow payout upon successful delivery confirmation.
              </p>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold uppercase tracking-wide rounded-xl shadow-md transition-all cursor-pointer focus:outline-none"
            >
              Update Tax Rate
            </button>
          </form>
        </div>

        {/* Locked Escrows Audit */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 space-y-4">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-primary" />
            <span>Escrow Ledger Auditing</span>
          </h3>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 dark:bg-[#0F172A]/50 border-b border-gray-100 dark:border-gray-800">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap pl-6">Escrow ID</th>
                  <th className="p-4 whitespace-nowrap">Ledger Node</th>
                  <th className="p-4 whitespace-nowrap">Parties</th>
                  <th className="p-4 whitespace-nowrap">Funds Value</th>
                  <th className="p-4 whitespace-nowrap">Comm. Fee</th>
                  <th className="p-4 whitespace-nowrap">State</th>
                  <th className="p-4 text-right  whitespace-nowrap pr-6">Intervene</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5 font-semibold text-gray-600 dark:text-gray-300">
                {escrows.map((esc) => (
                  <tr key={esc.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-primary font-mono font-bold text-xs pl-6">{esc.id}</td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-charcoal dark:text-gray-100 font-bold block">{esc.address}</span>
                      <span className="text-[10px] text-gray-400 font-semibold block">Order: {esc.orderId}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-charcoal dark:text-gray-100 font-bold block">B: {esc.buyer}</span>
                      <span className="text-xs text-gray-400 font-semibold block">S: {esc.farmer}</span>
                    </td>
                    <td className="p-4 font-extrabold text-charcoal dark:text-gray-100">{esc.amount}</td>
                    <td className="p-4 font-bold text-primary">{esc.platformFee}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        esc.status === 'Released'
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50'
                          : esc.status === 'Refunded'
                          ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-150 dark:border-red-800/50'
                          : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-150 dark:border-blue-800/50 animate-pulse'
                      }`}>
                        {esc.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      {esc.status === 'Locked' ? (
                        <button
                          onClick={() => handleReleaseEscrowOverride(esc.orderId)}
                          className="px-2 py-1 bg-primary text-white hover:bg-primary/90 rounded text-[10px] font-bold transition-all focus:outline-none cursor-pointer"
                          title="Force release escrow funds"
                        >
                          Force Release
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Dispatched</span>
                      )}
                    </td>
                  </tr>
                ))}
                {escrows.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400 font-semibold">
                      No escrow ledgers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

