import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, MapPin, Wheat, Carrot, Droplet, Sprout, Trash2 } from 'lucide-react';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('agrinova_wishlist') || '[]');
    setWishlist(items);
  }, []);

  const handleRemove = (id) => {
    const updated = wishlist.filter(item => (item.id !== id && item._id !== id));
    setWishlist(updated);
    localStorage.setItem('agrinova_wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist_updated'));
  };

  const handleAddToCart = (crop) => {
    const cart = JSON.parse(localStorage.getItem('agrinova_cart') || '[]');
    const cropId = crop._id || crop.id;
    const exists = cart.some(item => (item.id === cropId || item._id === cropId));
    if (!exists) {
      const updated = [...cart, { ...crop, id: cropId, quantitySelected: Math.min(10, crop.quantity || crop.qty || 10) }];
      localStorage.setItem('agrinova_cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cart_updated'));
      alert(`${crop.name} added to cart successfully!`);
    } else {
      alert(`${crop.name} is already in your cart.`);
    }
  };

  const getMoistureContent = (crop) => {
    if (crop.moisture) return crop.moisture;
    switch (crop.category) {
      case 'Grains': return '11.5%';
      case 'Vegetables': return '14.0%';
      case 'Oilseeds': return '8.5%';
      default: return '12.0%';
    }
  };

  const getHarvestDate = (crop) => {
    if (crop.harvest) return crop.harvest;
    if (!crop.createdAt) return 'June 01, 2026';
    return new Date(crop.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

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
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">My Wishlist</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Saved grower listings and preferred direct farm listings.</p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((crop) => {
            const cropId = crop._id || crop.id;
            const farmerName = crop.farmerId ? `${crop.farmerId.firstName} ${crop.farmerId.lastName}` : (crop.farmer || 'Unknown Farmer');
            const farmLocation = crop.farmerId?.farmLocation || (crop.location || 'India');
            const moisture = getMoistureContent(crop);
            const harvest = getHarvestDate(crop);
            const priceVal = typeof crop.price === 'number' ? `₹${crop.price.toLocaleString()}` : crop.price;
            const quantityVal = crop.quantity !== undefined ? `${crop.quantity} qtl` : (crop.qty || 'N/A');

            return (
              <div key={cropId} className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-md hover:border-primary/10 transition-all duration-350 relative group">
                
                {/* Card Top Image area */}
                <div className="w-full h-44 relative bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center overflow-hidden border-b border-gray-50">
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
                  <div className="flex items-baseline gap-1.5 pt-2 border-t border-gray-50 dark:border-gray-800">
                    <span className="font-display font-extrabold text-xl text-charcoal dark:text-gray-100">{priceVal}</span>
                    <span className="text-xs text-gray-450 font-bold uppercase">/qtl</span>
                    <span className="ml-auto text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-105/60 px-2.5 py-1 rounded-lg">
                      Qty: {quantityVal}
                    </span>
                  </div>

                  {/* Core parameters list */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#0F172A]/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-[9px] text-gray-450 block uppercase tracking-wider">Moisture Content</span>
                      <span className="text-charcoal dark:text-gray-100 font-bold mt-0.5 block">{moisture}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-455 block uppercase tracking-wider">Harvest Date</span>
                      <span className="text-charcoal dark:text-gray-100 font-bold mt-0.5 block">{harvest}</span>
                    </div>
                  </div>

                  {/* Supplier info with maps link */}
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-450 pt-2 border-t border-gray-50 dark:border-gray-800 min-w-0 gap-2">
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

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-50 dark:border-gray-800 bg-[#FAFBF8] dark:bg-[#0F172A] flex gap-2">
                  <button
                    onClick={() => handleRemove(cropId)}
                    className="flex-1 py-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-555/10 text-xs font-extrabold text-center transition-all uppercase tracking-wider flex items-center justify-center gap-1 focus:outline-none cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                  <button
                    onClick={() => handleAddToCart(crop)}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold text-center transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 focus:outline-none cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center mx-auto border border-gray-100 dark:border-gray-800 text-gray-300">
            <Heart className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Your Wishlist is Empty</h3>
            <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mt-1">
              Add agricultural listings to your wishlist while searching the produce marketplace catalog.
            </p>
          </div>
          <Link
            to="../marketplace"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            Explore Listings
          </Link>
        </div>
      )}

    </div>
  );
}

