import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import BuyerCard from '../components/BuyerCard';
import EmptyState from '../components/EmptyState';

export default function Buyers() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [buyersList, setBuyersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch registered buyers from MongoDB
  const fetchBuyers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE}/api/auth/buyers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch buyers list.');
      }

      setBuyersList(data.buyers || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error fetching buyers from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  // Filter buyers list
  const filteredBuyers = buyersList.filter(buyer => {
    const name = buyer.companyName || '';
    const city = buyer.city || '';
    const businessType = buyer.businessType || '';

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          city.toLowerCase().includes(searchQuery.toLowerCase());
                          
    let matchesCategory = true;
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'mart') {
        matchesCategory = businessType.toLowerCase() === 'wholesaler';
      } else if (categoryFilter === 'processor') {
        matchesCategory = businessType.toLowerCase() === 'processing';
      } else {
        matchesCategory = businessType.toLowerCase() === categoryFilter.toLowerCase();
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Active Buyers</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Explore certified buyers on AgriNova and initiate crop sales negotiations.</p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by buyer company or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
          />
        </div>

        {/* Category selector */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:border-primary/30 cursor-pointer select-none"
        >
          <option value="all" className="bg-white dark:bg-[#0F172A] text-charcoal dark:text-gray-100">All Buyer Types</option>
          <option value="mart" className="bg-white dark:bg-[#0F172A] text-charcoal dark:text-gray-100">Wholesale Marts</option>
          <option value="exporter" className="bg-white dark:bg-[#0F172A] text-charcoal dark:text-gray-100">Exporters</option>
          <option value="processor" className="bg-white dark:bg-[#0F172A] text-charcoal dark:text-gray-100">Food Processors</option>
          <option value="retailer" className="bg-white dark:bg-[#0F172A] text-charcoal dark:text-gray-100">Retailers</option>
        </select>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <p className="text-sm text-gray-400 font-bold">Synchronizing enterprise buyer directory...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-3xl flex items-start gap-3 text-red-800 text-sm font-semibold max-w-xl mx-auto">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-bold">Connection Alert</p>
            <p className="mt-0.5 text-red-800/80 leading-normal">{error}</p>
            <button 
              onClick={fetchBuyers}
              className="mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-900 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Grid List */}
      {!loading && !error && (
        filteredBuyers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuyers.map(buyer => (
              <BuyerCard key={buyer._id} buyer={buyer} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={buyersList.length === 0 ? "No active buyers found" : "No Match Found"}
            description={buyersList.length === 0 ? "Enterprise buyer accounts will appear here once registered on AgriNova." : "Try modifying search keywords or resetting type filters."}
            onReset={buyersList.length === 0 ? null : () => {
              setSearchQuery('');
              setCategoryFilter('all');
            }}
          />
        )
      )}

    </div>
  );
}

