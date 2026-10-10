import React, { useState, useEffect } from 'react';
import { Gavel, Search } from 'lucide-react';

export default function BidsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bids, setBids] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const userString = localStorage.getItem('agrinova_user');
  const user = userString ? JSON.parse(userString) : null;
  const adminId = user ? (user.id || user._id) : '';

  const fetchBids = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        headers: { 'x-user-id': adminId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const mapped = data.orders.map(o => ({
          id: `BID-${o.id.slice(-4).toUpperCase()}`,
          cropName: o.product?.name || 'Unknown Crop',
          farmer: o.farmer || 'Unknown Farmer',
          buyer: o.buyer?.name || 'Unknown Buyer',
          cropPrice: `₹${(parseFloat(o.product?.rate?.replace(/[^0-9.]/g, '') || 0)).toLocaleString()}/qtl`,
          bidPrice: `₹${(parseFloat(o.product?.total?.replace(/[^0-9.]/g, '') || 0)).toLocaleString()}`,
          quantity: o.product?.qty || 'N/A',
          status: o.status,
          date: o.date || o.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
        }));
        setBids(mapped);
      }
    } catch (err) {
      console.error('Error fetching bids:', err);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchBids();
    }
  }, [adminId]);

  const filteredBids = bids.filter(b => 
    b.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.buyer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Bids Management</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Monitor price negotiations, trade bidding rooms, and override transaction disputes.</p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 sm:p-6 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by crop, farmer or buyer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-55/10 border border-gray-155 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 dark:bg-[#0F172A]/50 border-b border-gray-100 dark:border-gray-800">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 whitespace-nowrap pl-6">Bid ID</th>
                <th className="p-4 whitespace-nowrap">Crop Name</th>
                <th className="p-4 whitespace-nowrap">Grower & Buyer</th>
                <th className="p-4 text-center  whitespace-nowrap">Listed Price</th>
                <th className="p-4 text-center  whitespace-nowrap">Bid Offered</th>
                <th className="p-4 text-center  whitespace-nowrap">Volume</th>
                <th className="p-4 whitespace-nowrap pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5 font-semibold text-gray-600 dark:text-gray-300">
              {filteredBids.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-primary font-mono font-bold text-xs pl-6">{b.id}</td>
                  <td className="p-4 font-bold text-charcoal dark:text-gray-100 flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-primary shrink-0" />
                    <span>{b.cropName}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-charcoal dark:text-gray-100 font-bold block">F: {b.farmer}</span>
                    <span className="text-xs text-gray-400 font-semibold block">B: {b.buyer}</span>
                  </td>
                  <td className="p-4 text-center font-bold text-gray-400">{b.cropPrice}</td>
                  <td className="p-4 text-center font-extrabold text-charcoal dark:text-gray-100">{b.bidPrice}</td>
                  <td className="p-4 text-center text-xs">{b.quantity}</td>
                  <td className="p-4 pr-6">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      b.status === 'Accepted'
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50'
                        : b.status === 'Rejected'
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-155 dark:border-red-800/50'
                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-155 dark:border-amber-800/50 animate-pulse'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredBids.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400 font-semibold">
                    No active trade bids found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

