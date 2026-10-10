import React, { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Search, ClipboardList, ShieldCheck, ArrowRight } from 'lucide-react';
import { io } from 'socket.io-client';

export default function MyOrders() {
  const { user } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
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
        console.log('[Socket] Buyer MyOrders real-time update received:', data);
        fetchOrders();
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  const tabs = ['All', 'Quality Checking', 'In Transit', 'Completed'];

  const filteredOrders = orders.filter(ord => {
    const matchesTab = selectedTab === 'All' || ord.status === selectedTab;
    const matchesSearch = ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ord.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ord.product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">My Purchase Orders</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Track shipping logs and quality reports for secure transactions.</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search order ID, crop, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
          />
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap focus:outline-none border ${
                selectedTab === tab
                  ? 'bg-primary border-primary text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-[#0F172A] border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-charcoal dark:hover:text-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* Order rows list */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((ord) => (
            <div key={ord.id} className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-primary/10 transition-colors relative">
              
              {/* Order Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-gray-400">{ord.id}</span>
                  <span className="text-xs text-gray-400 font-semibold">{ord.date}</span>
                </div>
                <h3 className="font-display font-extrabold text-base text-charcoal dark:text-gray-100">
                  {ord.product.name} ({ord.product.qty})
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold block">Supplier: {ord.farmer}</span>
              </div>

              {/* Escrow Details */}
              <div className="space-y-1 text-sm font-semibold text-gray-600 dark:text-gray-300">
                <span className="text-xs text-gray-400 block uppercase">Escrow Status</span>
                <span className="text-primary font-bold flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-4 h-4 fill-current text-primary" />
                  {ord.payment.status}
                </span>
              </div>

              {/* Total Value */}
              <div className="space-y-1">
                <span className="text-xs text-gray-400 block uppercase">Amount</span>
                <span className="font-display font-extrabold text-xl text-charcoal dark:text-gray-100 block mt-0.5">{ord.product.total}</span>
              </div>

              {/* Status and Action */}
              <div className="flex sm:items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-50">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">FULFILLMENT</span>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold block mt-1 w-fit ${
                    ord.status === 'Completed' || ord.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-150 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                    ord.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border border-blue-150 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                    ord.status === 'Rejected' || ord.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-150 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                    'bg-amber-50 text-amber-700 border border-amber-150 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                  }`}>
                    {ord.status}
                  </span>
                </div>
                
                <Link
                  to={ord.id}
                  className="py-3 px-4 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-gray-500 dark:text-gray-400 hover:text-primary transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1 focus:outline-none"
                >
                  <span>Track / Invoice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center mx-auto border border-gray-100 dark:border-gray-800 text-gray-300 mb-4">
            <ClipboardList className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100">No Orders Found</h3>
          <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mt-1">
            You don't have any purchase orders matching the selected filter tab or search details.
          </p>
        </div>
      )}

    </div>
  );
}

