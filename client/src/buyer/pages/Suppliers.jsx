import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, MessageSquare, User, Loader2, AlertCircle, Star } from 'lucide-react';

export default function Suppliers() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [searchQuery, setSearchQuery] = useState('');
  const [suppliersList, setSuppliersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch registered farmers from MongoDB
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE}/api/auth/farmers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch suppliers.');
      }

      setSuppliersList(data.farmers || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error fetching farmers directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter suppliers in memory
  const filteredSuppliers = suppliersList.filter(sup => {
    const fullName = `${sup.firstName || ''} ${sup.lastName || ''}`.toLowerCase();
    const farmName = (sup.farmName || '').toLowerCase();
    const location = (sup.farmLocation || '').toLowerCase();
    const crops = (sup.primaryCrops || '').toLowerCase();

    return fullName.includes(searchQuery.toLowerCase()) ||
           farmName.includes(searchQuery.toLowerCase()) ||
           location.includes(searchQuery.toLowerCase()) ||
           crops.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Farmer Suppliers Directory</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Browse verified direct farmer partners accredited by AgriNova quality protocols.</p>
      </div>

      {/* Search control */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 sm:p-6 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search farmers, farms, location, or crop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <p className="text-sm text-gray-400 font-bold">Synchronizing farmer supplier directory...</p>
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
              onClick={fetchSuppliers}
              className="mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-900 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Suppliers Grid */}
      {!loading && !error && (
        filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((sup) => {
              const fullName = `${sup.firstName} ${sup.lastName}`;
              const farmName = sup.farmName || 'Grower';
              const location = sup.farmLocation || 'Farm Site';
              const rating = sup.rating || 0;
              const reviewsCount = sup.reviewsCount || 0;

              return (
                <div key={sup._id} className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md hover:border-primary/10 transition-all duration-350 relative group">
                  
                  {/* Profile details */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#F8FAF5] border border-primary/10 text-primary flex items-center justify-center font-display font-extrabold text-lg">
                        {fullName.charAt(0)}
                      </div>
                      <div className="flex items-center gap-1 py-1 px-2.5 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20 rounded-lg text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" /> {rating}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-extrabold text-base text-charcoal dark:text-gray-100">{fullName}</h3>
                      <span className="text-xs text-primary font-bold block">{farmName}</span>
                      <span className="text-xs text-gray-400 font-semibold flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        <span className="truncate">{location}</span>
                      </span>
                    </div>

                    {/* Crops details */}
                    <div className="p-3 bg-gray-50 dark:bg-[#0F172A] rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1 text-xs">
                      <span className="text-[9px] text-gray-450 block uppercase tracking-wider font-extrabold">Primary Crops</span>
                      <span className="text-charcoal dark:text-gray-100 font-bold">{sup.primaryCrops || 'Various Crops'}</span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-6 border-t border-gray-50 mt-6 flex gap-2">
                    <button
                      type="button"
                      className="flex-1 py-2.5 rounded-xl border border-gray-150 text-gray-400 bg-white dark:bg-[#1E293B] text-xs font-extrabold text-center uppercase tracking-wider flex items-center justify-center gap-1 cursor-not-allowed"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </button>
                    
                    {/* Contact Button Redirecting to Messages with navigation state */}
                    <Link
                      to="../messages"
                      state={{ 
                        contactFarmerId: sup._id, 
                        contactFarmerName: fullName, 
                        contactCategory: farmName, 
                        contactLocation: location 
                      }}
                      className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/10 transition-colors flex items-center justify-center focus:outline-none"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center mx-auto border border-gray-100 dark:border-gray-800 text-gray-300 mb-4">
              <User className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100">No Suppliers Found</h3>
            <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mt-1">
              There are no verified farmers listed matching your search criteria.
            </p>
          </div>
        )
      )}

    </div>
  );
}

