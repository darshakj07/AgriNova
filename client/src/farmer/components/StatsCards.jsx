import React, { useState, useEffect } from 'react';
import { IndianRupee, Sprout, ClipboardList, Users, TrendingUp } from 'lucide-react';

export default function StatsCards() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [listingCount, setListingCount] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeBuyersCount, setActiveBuyersCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const userString = localStorage.getItem('agrinova_user');
    const user = userString ? JSON.parse(userString) : null;
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Fetch products count
        const prodRes = await fetch(`${API_BASE}/api/products/my-products`, {
          headers: { 'x-user-id': user.id || user._id }
        });
        const prodData = await prodRes.json();
        if (prodRes.ok && prodData.success) {
          setListingCount(prodData.products.length);
        }

        // Fetch orders count & revenue
        const orderRes = await fetch(`${API_BASE}/api/orders`, {
          headers: { 'x-user-id': user.id || user._id }
        });
        const orderData = await orderRes.json();
        if (orderRes.ok && orderData.success) {
          const allOrders = orderData.orders;
          const completed = allOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered');
          setCompletedOrdersCount(completed.length);
          
          const pending = allOrders.filter(o => o.status !== 'Completed' && o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Rejected');
          setPendingCount(pending.length);

          let revenue = 0;
          completed.forEach(o => {
            const valStr = o.product?.total || o.price || '0';
            const val = parseFloat(valStr.toString().replace(/[^0-9.]/g, ''));
            if (!isNaN(val)) revenue += val;
          });
          setTotalRevenue(revenue);

          const uniqueBuyers = new Set(allOrders.map(o => o.buyerId?.toString() || o.buyer?.name || o.buyer));
          setActiveBuyersCount(uniqueBuyers.size);
        }
      } catch (err) {
        console.error('Error fetching farmer stats:', err);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      change: 'From completed orders',
      icon: IndianRupee,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-600 bg-green-50 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50'
    },
    {
      title: 'Products Listed',
      value: listingCount.toString(),
      change: 'Active crops listed on market',
      icon: Sprout,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50'
    },
    {
      title: 'Orders Completed',
      value: completedOrdersCount.toString(),
      change: `${pendingCount} orders pending execution`,
      icon: ClipboardList,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'
    },
    {
      title: 'Active Buyers',
      value: activeBuyersCount.toString(),
      change: 'Unique corporate buyers',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-charcoal/5 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.title}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            
            <div>
              <h3 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100 tracking-tight">{stat.value}</h3>
              <div className="flex items-center gap-1 mt-2">
                <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${stat.textColor}`}>
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

