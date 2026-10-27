import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, RefreshCw, MapPin } from 'lucide-react';

export default function MandiPrices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Commodities' },
    { id: 'grain', name: 'Grains' },
    { id: 'vegetable', name: 'Vegetables' },
    { id: 'oilseed', name: 'Oilseeds' },
  ];

  const mandiData = [
    { name: 'Wheat (Sharbati)', category: 'grain', price: '₹31.80/qtl', local: '₹2,650/qtl', change: '+2.4%', isPositive: true, volume: '2,420 Tons', mandi: 'Indore Mandi', trend: [30, 45, 60, 50, 75, 90] },
    { name: 'Paddy (Basmati)', category: 'grain', price: '₹48.50/qtl', local: '₹4,050/qtl', change: '+1.8%', isPositive: true, volume: '1,890 Tons', mandi: 'Karnal Mandi', trend: [40, 50, 52, 48, 55, 65] },
    { name: 'Soybean (Yellow)', category: 'oilseed', price: '₹56.20/qtl', local: '₹4,700/qtl', change: '-1.2%', isPositive: false, volume: '3,200 Tons', mandi: 'Dewas Mandi', trend: [68, 65, 63, 64, 60, 58] },
    { name: 'Tomato (Hybrid)', category: 'vegetable', price: '₹21.60/qtl', local: '₹1,800/qtl', change: '+12.5%', isPositive: true, volume: '840 Tons', mandi: 'Kolar Mandi', trend: [10, 20, 15, 30, 45, 65] },
    { name: 'Potato (Jyoti)', category: 'vegetable', price: '₹16.80/qtl', local: '₹1,400/qtl', change: '-0.5%', isPositive: false, volume: '1,560 Tons', mandi: 'Agra Mandi', trend: [20, 18, 19, 17, 18, 17] },
    { name: 'Mustard Seeds', category: 'oilseed', price: '₹65.80/qtl', local: '₹5,500/qtl', change: '+0.8%', isPositive: true, volume: '980 Tons', mandi: 'Alwar Mandi', trend: [55, 58, 57, 59, 62, 64] },
    { name: 'Maize (Yellow)', category: 'grain', price: '₹24.50/qtl', local: '₹2,050/qtl', change: '+1.1%', isPositive: true, volume: '1,220 Tons', mandi: 'Chhindwara Mandi', trend: [30, 32, 31, 33, 35, 38] },
    { name: 'Onion (Red)', category: 'vegetable', price: '₹22.80/qtl', local: '₹1,900/qtl', change: '-4.2%', isPositive: false, volume: '1,320 Tons', mandi: 'Lasalgaon Mandi', trend: [35, 32, 30, 28, 26, 24] },
  ];

  // Filtering Logic
  const filteredData = mandiData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.mandi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="mandi" className="py-24 bg-bg-base relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-bold text-primary tracking-widest uppercase">Mandi Intelligence</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal dark:text-gray-100 mt-2 mb-4 leading-tight">
            Real-time agricultural commodity index
          </h2>
          <p className="text-base text-charcoal dark:text-gray-400 font-normal">
            Track daily market price movements, transaction volumes, and trading trends across major regional mandis to sell at the absolute peak.
          </p>
        </div>

        {/* Mandi Widget Control Panel */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-xl p-6 md:p-8">
          
          {/* Controls: Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between pb-6 border-b border-charcoal/5 dark:border-white/5 mb-6">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal dark:text-gray-400/80" />
              <input
                type="text"
                placeholder="Search crop or mandi location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-bg-base border border-charcoal/10 dark:border-white/10 focus:outline-none focus:border-primary/40 text-sm font-medium text-charcoal dark:text-gray-100 transition-all"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-primary text-white shadow-md shadow-primary/10'
                      : 'bg-bg-base text-charcoal dark:text-gray-100 hover:bg-charcoal/5 border border-charcoal/5 dark:border-white/5'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sync Alert Indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold text-charcoal dark:text-gray-400 self-end lg:self-auto">
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-primary" />
              <span>Live Synced 1m ago</span>
            </div>
          </div>

          {/* Commodities Table */}
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-charcoal/5 dark:border-white/5 text-xs font-bold text-charcoal dark:text-gray-400 uppercase">
                  <th className="pb-4 font-semibold">Commodity Name</th>
                  <th className="pb-4 font-semibold">Location</th>
                  <th className="pb-4 font-semibold">Live Market Price</th>
                  <th className="pb-4 font-semibold text-center">24h Change</th>
                  <th className="pb-4 font-semibold text-center">Trend (7d)</th>
                  <th className="pb-4 font-semibold">Trading Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                <AnimatePresence>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                      <motion.tr
                        key={item.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className="group hover:bg-bg-base/30 transition-all duration-150"
                      >
                        {/* Name */}
                        <td className="py-4 font-display font-bold text-charcoal dark:text-gray-100 text-sm">
                          {item.name}
                        </td>
                        
                        {/* Mandi Location */}
                        <td className="py-4 text-xs font-semibold text-charcoal dark:text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-primary/60" />
                            {item.mandi}
                          </span>
                        </td>
                        
                        {/* Prices */}
                        <td className="py-4">
                          <span className="font-display font-extrabold text-sm text-charcoal dark:text-gray-100 block">{item.price}</span>
                          <span className="text-[10px] text-charcoal dark:text-gray-400 font-bold block">{item.local}</span>
                        </td>
                        
                        {/* Change */}
                        <td className="py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            item.isPositive
                              ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50'
                              : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
                          }`}>
                            {item.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {item.change}
                          </span>
                        </td>
                        
                        {/* Sparkline Graphic */}
                        <td className="py-4">
                          <div className="flex items-end justify-center gap-0.5 h-6 w-20 mx-auto">
                            {item.trend.map((val, i) => (
                              <div
                                key={i}
                                style={{ height: `${(val / 100) * 100}%` }}
                                className={`w-1.5 rounded-t-sm transition-all duration-300 ${
                                  item.isPositive ? 'bg-green-400 group-hover:bg-primary' : 'bg-red-400 group-hover:bg-red-500'
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        
                        {/* Volume */}
                        <td className="py-4 font-mono text-xs font-bold text-charcoal dark:text-gray-400">
                          {item.volume}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-sm font-semibold text-charcoal dark:text-gray-400">
                        No commodities found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </section>
  );
}

