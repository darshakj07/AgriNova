import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, ArrowRight } from 'lucide-react';

export default function RecentOrders() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [orders, setOrders] = useState([]);

  const getStatusColor = (status) => {
    const s = status ? status.toLowerCase() : 'pending';
    if (s === 'completed' || s === 'delivered') return 'text-green-600 bg-green-50 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
    if (s === 'processing' || s === 'quality checking' || s === 'accepted') return 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
    if (s === 'in transit' || s === 'shipped' || s === 'ready for dispatch') return 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50';
    if (s === 'cancelled' || s === 'rejected') return 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
    return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'; // pending
  };

  useEffect(() => {
    const fetchRecentOrders = async () => {
      const userString = localStorage.getItem('agrinova_user');
      const user = userString ? JSON.parse(userString) : null;
      if (!user) return;

      try {
        const response = await fetch(`${API_BASE}/api/orders?limit=4`, {
          headers: {
            'x-user-id': user.id || user._id
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          const mapped = data.orders.map(o => ({
            id: o.id,
            buyer: o.buyer.name,
            crop: o.product.name,
            qty: o.product.qty,
            price: o.product.total,
            date: o.date,
            status: o.status,
            color: getStatusColor(o.status)
          }));
          setOrders(mapped);
        }
      } catch (err) {
        console.error('Error fetching recent orders for farmer:', err);
      }
    };

    fetchRecentOrders();
  }, []);

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Recent Orders</h3>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Summary of your latest transaction queues.</p>
        </div>
        <Link 
          to="/farmer/orders" 
          className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1 group transition-colors"
        >
          <span>View All Queue</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto no-scrollbar">
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
            {orders.map((order) => (
              <tr key={order.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-4 text-sm font-mono font-bold text-gray-400">{order.id}</td>
                <td className="py-4 text-sm font-bold text-charcoal dark:text-gray-100">
                  <span className="block">{order.buyer}</span>
                  <span className="text-xs text-gray-400 font-medium block mt-0.5">{order.date}</span>
                </td>
                <td className="py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">{order.crop}</td>
                <td className="py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">{order.qty}</td>
                <td className="py-4 font-display font-extrabold text-sm text-charcoal dark:text-gray-100">{order.price}</td>
                <td className="py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${order.color}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 text-center">
                  <Link 
                    to={`/farmer/orders/${order.id}`} 
                    className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-primary hover:border-primary/20 inline-block transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}



