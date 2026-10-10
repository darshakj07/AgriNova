import React, { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Search, MapPin, Wheat, Carrot, Droplet, Sprout, ShoppingCart, Heart, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';

export default function Marketplace() {
  const { user } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const socketRef = useRef(null);



  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem('agrinova_wishlist') || '[]');
  });

  const categories = ['All', 'Grains', 'Vegetables', 'Oilseeds'];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE}/api/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch marketplace products.');
      }
      setCrops(data.products || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load crop listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProducts();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    socketRef.current = io(API_BASE);

    const handleUpdate = () => {
      console.log('[Socket] Marketplace product update broadcast received, fetching updated listings...');
      fetchProducts();
    };

    socketRef.current.on('stockUpdated', (data) => {
      console.log('[Socket] Marketplace live stock update received:', data);
      handleUpdate();
    });
    socketRef.current.on('productCreated', handleUpdate);
    socketRef.current.on('productUpdated', handleUpdate);
    socketRef.current.on('productDeleted', handleUpdate);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user?.id]);

  const handleToggleWishlist = (crop) => {
    let updated;
    const cropId = crop._id;
    const exists = wishlist.some(item => (item._id === cropId || item.id === cropId));
    if (exists) {
      updated = wishlist.filter(item => (item._id !== cropId && item.id !== cropId));
    } else {
      updated = [...wishlist, { ...crop, id: cropId }];
    }
    setWishlist(updated);
    localStorage.setItem('agrinova_wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist_updated'));
  };

  const handleAddToCart = (crop) => {
    const cart = JSON.parse(localStorage.getItem('agrinova_cart') || '[]');
    const cropId = crop._id;
    const exists = cart.some(item => (item._id === cropId || item.id === cropId));
    if (!exists) {
      const updated = [...cart, { ...crop, id: cropId, quantitySelected: Math.min(10, crop.quantity) }];
      localStorage.setItem('agrinova_cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cart_updated'));
      alert(`${crop.name} added to escrow cart successfully!`);
    } else {
      alert(`${crop.name} is already in your escrow cart.`);
    }
  };

  const getMoistureContent = (crop) => {
    switch (crop.category) {
      case 'Grains': return '11.5%';
      case 'Vegetables': return '14.0%';
      case 'Oilseeds': return '8.5%';
      default: return '12.0%';
    }
  };

  const getHarvestDate = (crop) => {
    if (!crop.createdAt) return 'June 01, 2026';
    return new Date(crop.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const filteredCrops = crops.filter(crop => {
    const farmerName = crop.farmerId ? `${crop.farmerId.firstName} ${crop.farmerId.lastName}` : '';
    const farmLocation = crop.farmerId?.farmLocation || '';
    
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          farmLocation.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
    
    // Hide out-of-stock crops (quantity <= 0)
    const hasStock = crop.quantity > 0;
    
    return matchesSearch && matchesCategory && hasStock;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Grains': return <Wheat className="w-5 h-5 text-amber-500" />;
      case 'Vegetables': return <Carrot className="w-5 h-5 text-orange-500" />;
      case 'Oilseeds': return <Droplet className="w-5 h-5 text-yellow-600" />;
      default: return <Sprout className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Produce Marketplace</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Place bids or checkout verified crops with platform escrow protection.</p>
      </div>

      {/* Control Panel: Search & Category Pills */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search crop, farmer, or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
          />
        </div>

        {/* Categories Horizontal Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap focus:outline-none border ${
                selectedCategory === cat
                  ? 'bg-primary border-primary text-white shadow-sm shadow-primary/10'
                  : 'bg-gray-50 dark:bg-[#0F172A] border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-charcoal dark:hover:text-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Crops Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <p className="text-sm text-gray-400 font-bold">Synchronizing active crop offers...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-900/30 p-8 text-center text-red-800 dark:text-red-200 font-semibold shadow-sm">
          ⚠️ {error}
        </div>
      ) : filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => {
            const cropId = crop._id;
            const isWished = wishlist.some(item => (item._id === cropId || item.id === cropId));
            const farmerName = crop.farmerId ? `${crop.farmerId.firstName} ${crop.farmerId.lastName}` : 'Unknown Farmer';
            const farmLocation = crop.farmerId?.farmLocation || 'India';
            const moisture = getMoistureContent(crop);
            const harvest = getHarvestDate(crop);

            return (
              <div key={cropId} className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-md hover:border-primary/10 transition-all duration-350 relative group">
                
                {/* Wishlist toggle */}
                <button
                  onClick={() => handleToggleWishlist(crop)}
                  className={`absolute top-4 right-4 p-2 rounded-full border transition-all z-10 cursor-pointer ${
                    isWished 
                      ? 'bg-red-50 border-red-100 text-red-500 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 shadow-sm'
                      : 'bg-white dark:bg-[#1E293B]/80 backdrop-blur-xs border-gray-100 dark:border-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-4.5 h-4.5 ${isWished ? 'fill-current' : ''}`} />
                </button>

                {/* Card Top Image area */}
                <div className="w-full h-44 relative bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center overflow-hidden border-b border-gray-50 dark:border-gray-800/50">
                  {crop.images && crop.images.length > 0 ? (
                    <img 
                      src={typeof crop.images[0] === 'object' ? (crop.images[0]?.secure_url || crop.images[0]?.url) : crop.images[0]} 
                      alt={crop.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      crop.category === 'Grains' ? 'bg-gradient-to-br from-amber-50 to-amber-100/30' :
                      crop.category === 'Vegetables' ? 'bg-gradient-to-br from-orange-50 to-orange-100/30' :
                      crop.category === 'Oilseeds' ? 'bg-gradient-to-br from-yellow-50 to-yellow-100/30' :
                      'bg-gradient-to-br from-emerald-50 to-emerald-100/30'
                    }`}>
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="p-3 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800">
                          {getCategoryIcon(crop.category)}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{crop.category} Placeholder</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Details section */}
                <div className="p-6 space-y-4">
                  {/* Category & Name */}
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 rounded-lg shrink-0">
                      {getCategoryIcon(crop.category)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">{crop.category}</span>
                      <h3 className="font-display font-extrabold text-base text-charcoal dark:text-gray-100 mt-0.5 truncate">{crop.name}</h3>
                    </div>
                  </div>

                  {/* Pricing / Qty */}
                  <div className="flex items-baseline gap-1.5 pt-2 border-t border-gray-50 dark:border-gray-800/50">
                    <span className="font-display font-extrabold text-xl text-charcoal dark:text-gray-100">₹{crop.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">/qtl</span>
                    <span className="ml-auto text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/60 px-2.5 py-1 rounded-lg">
                      Qty: {crop.quantity} qtl
                    </span>
                  </div>

                  {/* Core parameters list */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#0F172A]/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Moisture Content</span>
                      <span className="text-charcoal dark:text-gray-100 font-bold mt-0.5 block">{moisture}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Harvest Date</span>
                      <span className="text-charcoal dark:text-gray-100 font-bold mt-0.5 block">{harvest}</span>
                    </div>
                  </div>

                  {/* Supplier info */}
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-50 dark:border-gray-800/50 min-w-0 gap-2">
                    <span className="truncate flex-1">Farmer: <strong className="text-charcoal dark:text-gray-100">{farmerName}</strong></span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farmLocation)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-primary transition-all font-bold shrink-0 max-w-[55%] hover:underline cursor-pointer min-w-0"
                      title="View on Google Maps"
                    >
                      <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className="truncate">{farmLocation}</span>
                    </a>
                  </div>
                </div>

                {/* Card footer buttons */}
                <div className="p-4 border-t border-gray-50 dark:border-gray-800/50 bg-[#FAFBF8] dark:bg-[#0F172A] flex gap-2">
                  <Link
                    to={`../products/${cropId}`}
                    className="flex-1 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-gray-650 hover:text-primary bg-white dark:bg-[#1E293B] text-xs font-extrabold text-center transition-all uppercase tracking-wider cursor-pointer"
                  >
                    View Details / Bid
                  </Link>
                  <button
                    onClick={() => handleAddToCart(crop)}
                    className="px-3 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/10 transition-colors flex items-center justify-center focus:outline-none cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-12 text-center shadow-sm">
          <span className="text-4xl block mb-2">🌾</span>
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100">No Crops Found</h3>
          <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mt-1">
            We couldn't find any crop listings matching your active category tab or search details.
          </p>
        </div>
      )}

    </div>
  );
}

