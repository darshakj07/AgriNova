import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

export default function OrdersManagement() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const userString = localStorage.getItem('agrinova_user');
  const user = userString ? JSON.parse(userString) : null;
  const adminId = user ? (user.id || user._id) : '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        headers: { 'x-user-id': adminId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching admin orders list:', err);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchOrders();
    }
  }, [adminId]);

  const getProductDisplay = (o) => {
    if (!o.product) return 'Crop Produce';
    return o.product.name || 'Crop Produce';
  };

  const getBuyerDisplay = (o) => {
    if (!o.buyer) return 'Corporate Buyer';
    return o.buyer.name || o.buyer.manager || 'Corporate Buyer';
  };

  const getAmountDisplay = (o) => {
    if (o.product && o.product.total) return o.product.total;
    if (o.amount) return o.amount;
    return '₹0';
  };

  const getEscrowDisplay = (o) => {
    if (o.payment && o.payment.status) {
      if (o.payment.status.includes('Released')) return 'Released';
      if (o.payment.status.includes('Refunded')) return 'Refunded';
      if (o.payment.status.includes('Held') || o.payment.status.includes('Locked')) return 'Locked';
      return o.payment.status;
    }
    return 'Locked';
  };

  const handleUpdateStatus = async (id, newStatus, paymentStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId
        },
        body: JSON.stringify({ status: newStatus, paymentStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Order ${id} status overridden to: ${newStatus}`);
        fetchOrders();
      } else {
        alert(data.message || 'Failed to override order status.');
      }
    } catch (err) {
      console.error('Error overriding status:', err);
      alert('Error communicating with server.');
    }
  };

  const statuses = ['All', 'Pending', 'Quality Checking', 'Processing', 'In Transit', 'Delivered', 'Completed', 'Cancelled'];

  const filteredOrders = orders.filter(o => {
    const productStr = getProductDisplay(o).toLowerCase();
    const buyerStr = getBuyerDisplay(o).toLowerCase();
    const farmerStr = (o.farmer || '').toLowerCase();
    const idStr = (o.id || '').toLowerCase();

    const matchesSearch = idStr.includes(searchQuery.toLowerCase()) ||
      productStr.includes(searchQuery.toLowerCase()) ||
      farmerStr.includes(searchQuery.toLowerCase()) ||
      buyerStr.includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Orders Management</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Audit transaction flows, logistics dispatch status, and platform escrow controls.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order ID, product, farmer, buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-55/10 border border-gray-155 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {statuses.slice(0, 6).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none shrink-0 ${
                selectedStatus === st
                  ? 'bg-primary text-white'
                  : 'bg-gray-55/10 text-charcoal dark:text-gray-100/70 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 dark:bg-[#0F172A]/50 border-b border-gray-100 dark:border-gray-800">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 whitespace-nowrap pl-6">Order ID</th>
                <th className="p-4 whitespace-nowrap">Produce / Item</th>
                <th className="p-4 whitespace-nowrap">Parties Involved</th>
                <th className="p-4 whitespace-nowrap">Total Amount</th>
                <th className="p-4 whitespace-nowrap">Order Status</th>
                <th className="p-4 whitespace-nowrap">Escrow Status</th>
                <th className="p-4 text-right  whitespace-nowrap pr-6">Actions Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5 font-semibold text-gray-600 dark:text-gray-300">
              {filteredOrders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-primary font-mono font-bold text-xs pl-6">{o.id}</td>
                  <td className="p-4">
                    <span className="text-charcoal dark:text-gray-100 font-bold block">{getProductDisplay(o)}</span>
                    <span className="text-[10px] text-gray-400 font-medium">Logged: {o.date || new Date(o.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-charcoal dark:text-gray-100 font-bold block">F: {o.farmer || 'AgriNova Supplier'}</span>
                    <span className="text-xs text-gray-400 font-semibold block">B: {getBuyerDisplay(o)}</span>
                  </td>
                  <td className="p-4 font-extrabold text-charcoal dark:text-gray-100">{getAmountDisplay(o)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      o.status === 'Delivered' || o.status === 'Completed'
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50' 
                        : o.status === 'In Transit' || o.status === 'Processing'
                        ? 'bg-blue-55/10 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-150 dark:border-blue-800/50'
                        : o.status === 'Cancelled'
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-155 dark:border-red-800/50'
                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-155 dark:border-amber-800/50'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      getEscrowDisplay(o) === 'Released'
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50'
                        : getEscrowDisplay(o) === 'Refunded'
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50'
                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                    }`}>
                      {getEscrowDisplay(o)}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap pr-6">
                    {o.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'Processing', 'Held in Escrow')}
                        className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-150 dark:border-amber-800/50 hover:bg-amber-100/30 dark:hover:bg-amber-900/30 rounded text-[10px] font-bold transition-all focus:outline-none"
                      >
                        Accept
                      </button>
                    )}
                    {o.status === 'Processing' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'In Transit', 'Held in Escrow')}
                        className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-150 dark:border-blue-800/50 hover:bg-blue-100/30 dark:hover:bg-blue-900/30 rounded text-[10px] font-bold transition-all focus:outline-none"
                      >
                        Dispatch
                      </button>
                    )}
                    {o.status === 'In Transit' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'Completed', 'Released to Farmer')}
                        className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50 hover:bg-green-100/30 dark:hover:bg-green-900/30 rounded text-[10px] font-bold transition-all focus:outline-none"
                      >
                        Approve Delivery
                      </button>
                    )}
                    <Link
                      to={`${o.id}`}
                      className="p-1.5 rounded-lg border border-gray-150 hover:border-primary/20 text-gray-550 hover:text-primary transition-all inline-flex items-center justify-center focus:outline-none"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400 font-semibold">
                    No matching order logs found.
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

