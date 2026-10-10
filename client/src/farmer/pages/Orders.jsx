import React, { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Eye, Search, ClipboardList } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { io } from 'socket.io-client';

export default function Orders() {
  const { user } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [activeTab, setActiveTab] = useState('all'); // all | pending | processing | completed | cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const socketRef = useRef(null);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        headers: {
          'x-user-id': user.id || user._id
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  useEffect(() => {
    socketRef.current = io(API_BASE);

    socketRef.current.on('orderUpdated', (data) => {
      if (data && data.orderId) {
        console.log('[Socket] Farmer Orders list real-time update received:', data);
        fetchOrders();
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  const getStatusColor = (status) => {
    const s = status ? status.toLowerCase() : 'pending';
    if (s === 'completed' || s === 'delivered') return 'text-green-600 bg-green-50 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
    if (s === 'processing' || s === 'quality checking' || s === 'accepted') return 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
    if (s === 'in transit' || s === 'shipped' || s === 'ready for dispatch') return 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50';
    if (s === 'cancelled' || s === 'rejected') return 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
    return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'; // pending
  };

  const filteredOrders = orders.filter(order => {
    const buyerName = order.buyer?.name || order.buyer || '';
    const cropName = order.product?.name || order.crop || '';
    const statusVal = order.status || '';

    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cropName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || statusVal.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Order Invoices</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Track shipping statuses, payment checkpoints, and dispatch logs.</p>
      </div>

      {/* Tabs & Search controls */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-5 space-y-4">
        
        {/* Row 1: Search & Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tab lists */}
          <div className="flex flex-wrap bg-gray-50 dark:bg-[#0F172A] p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 self-start shrink-0">
            {['All', 'Pending', 'Processing', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.toLowerCase() 
                    ? 'bg-white dark:bg-[#1E293B] text-primary shadow-sm border border-gray-100 dark:border-gray-800' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-md w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, buyer, crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
            />
          </div>
        </div>

        {/* Row 2: List Table */}
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto no-scrollbar pt-2">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-charcoal/5 dark:border-white/5 text-xs font-bold text-gray-400 uppercase">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Buyer Company</th>
                  <th className="pb-3">Crop Type</th>
                  <th className="pb-3">Volume</th>
                  <th className="pb-3">Total Value</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 text-sm font-mono font-bold text-gray-400">{order.id}</td>
                    <td className="py-4 text-sm font-bold text-charcoal dark:text-gray-100">
                      <span>{order.buyer?.name || order.buyer}</span>
                      <span className="text-xs text-gray-400 font-medium block mt-0.5">{order.date}</span>
                    </td>
                    <td className="py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">{order.product?.name || order.crop}</td>
                    <td className="py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">{order.product?.qty || order.qty}</td>
                    <td className="py-4 font-display font-extrabold text-sm text-charcoal dark:text-gray-100">{order.product?.total || order.price}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <Link
                        to={`${order.id}`}
                        className="p-2 rounded-xl border border-gray-150 text-gray-400 hover:text-primary hover:border-primary/20 inline-block transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Invoices Found"
            description="No orders match your active filter tab or search details."
            onReset={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
          />
        )}

      </div>

    </div>
  );
}



