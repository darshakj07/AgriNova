import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { ShieldCheck, MessageSquare, ArrowRight, Star } from 'lucide-react';
import StatsCards from '../components/StatsCards';
import RecentOrders from '../components/RecentOrders';
import WeatherWidget from '../components/WeatherWidget';
import RevenueChart from '../components/RevenueChart';

export default function Dashboard() {
  const { user } = useOutletContext();

  const getFarmCity = () => {
    const loc = user?.farmLocation;
    if (!loc) return 'Indore';
    const addressIdx = loc.indexOf('(');
    const address = addressIdx !== -1 ? loc.substring(0, addressIdx).trim() : loc.trim();
    const parts = address.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const last = parts[parts.length - 1];
      const secondLast = parts[parts.length - 2];
      if (/^\d{6}$/.test(last) || ['india', 'madhya pradesh', 'mp'].includes(last.toLowerCase())) {
        return secondLast;
      }
      return last;
    }
    return parts[0] || 'Indore';
  };

  const [buyerRequests, setBuyerRequests] = useState([]);

  useEffect(() => {
    const localBids = JSON.parse(localStorage.getItem('agrinova_bids') || '[]');
    setBuyerRequests(localBids.slice(0, 3).map((b, idx) => ({
      id: b.id || idx,
      buyer: b.buyer || 'AgriNova Buyer',
      crop: b.cropName || b.crop,
      bid: b.bidRate || b.price,
      qty: b.qty,
      type: 'Active Bid'
    })));
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Welcome Farmer Banner */}
      <div className="bg-primary bg-linear-to-r from-primary to-primary-dark rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-primary/10">
        {/* Background grids */}
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 dark:bg-[#1E293B]/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-white/20 text-xs font-bold text-secondary dark:text-white border border-white/10 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 fill-current" />
              Verified farm partner
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-none mb-2">
            Welcome back, {user?.firstName || 'Farmer'}!
          </h1>
          <p className="text-sm sm:text-sm text-white/80 leading-relaxed">
            Your fields at <strong className="text-white">{user?.farmName || 'GreenValley'}</strong> are currently running optimal soil NPK ratios. A 15% probability of rain is forecast for {getFarmCity()} over the next 48 hours.
          </p>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <StatsCards />

      {/* Analytics Mid Grid: Chart & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <WeatherWidget user={user} />
        </div>
      </div>

      {/* Action logs Bottom Grid: Orders & Buyer Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders table */}
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>

        {/* Recent Buyer Requests list */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Buyer Bids</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Active market requests for your crops.</p>
              </div>
              <Link to="/farmer/buyers" className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-0.5 transition-colors">
                <span>Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Requests list */}
            <div className="space-y-4">
              {buyerRequests.length > 0 ? (
                buyerRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 flex flex-col justify-between gap-3 hover:border-primary/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100">{req.buyer}</h4>
                        <p className="text-xs text-primary font-semibold mt-0.5">{req.crop}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50`}>
                        {req.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-sm font-semibold text-gray-500 dark:text-gray-400">
                      <span>Target: <strong className="text-gray-700 dark:text-gray-200">{req.qty}</strong></span>
                      <span>Bid: <strong className="text-charcoal dark:text-gray-100 font-extrabold">{req.bid}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-400 font-semibold text-xs border border-dashed border-gray-150 rounded-2xl">
                  No active buyer bids received yet.
                </div>
              )}
            </div>
          </div>

          <Link
            to="/farmer/messages"
            className="mt-6 w-full py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-gray-500 dark:text-gray-400 hover:text-primary text-sm font-bold transition-all text-center flex items-center justify-center gap-1.5 group"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Negotiation Chats</span>
          </Link>

        </div>

      </div>

    </div>
  );
}



