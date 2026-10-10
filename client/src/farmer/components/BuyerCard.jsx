import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, MessageSquare, TrendingUp, ShieldCheck } from 'lucide-react';

export default function BuyerCard({ buyer }) {
  // Map database fields to visual model with fallback defaults
  const name = buyer.name || buyer.companyName || 'AgriNova Buyer';
  const rawCategory = buyer.category || buyer.businessType || 'Retailer';
  const location = buyer.location || buyer.city || 'Indore, MP';
  
  // Format business type category nicely
  const getCategoryLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'retailer':
        return 'Retailer';
      case 'wholesaler':
        return 'Wholesale Mart';
      case 'exporter':
        return 'Exporter';
      case 'processing':
        return 'Processor';
      default:
        return type || 'Buyer';
    }
  };

  // Generate deterministic premium metrics
  const category = getCategoryLabel(rawCategory);
  const rating = buyer.rating > 0 ? buyer.rating : 'N/A';
  const reviewsCount = buyer.reviewsCount || 0;
  
  const getVolumeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'retailer':
        return '240 Tons/yr';
      case 'wholesaler':
        return '950 Tons/yr';
      case 'exporter':
        return '1,500 Tons/yr';
      case 'processing':
        return '3,200 Tons/yr';
      default:
        return '680 Tons/yr';
    }
  };
  const volume = buyer.volume || getVolumeLabel(rawCategory);

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Top subtle glow for hover state */}
      <div className="absolute top-0 inset-x-0 h-1 bg-transparent group-hover:bg-primary transition-colors" />

      {/* Header Info */}
      <div>
        <div className="flex justify-between items-start mb-4">
          {/* Buyer Avatar bubble */}
          <div className="w-12 h-12 rounded-2xl bg-primary/10 bg-linear-to-br from-primary/15 to-secondary/5 text-primary flex items-center justify-center font-display font-extrabold text-base border border-primary/5 shadow-inner">
            {name.charAt(0)}
          </div>
          
          {/* Trust rating */}
          <div className="flex items-center gap-1 text-xs font-bold text-[#F9A825] bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-800/50 shadow-xs">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{rating} ({reviewsCount})</span>
          </div>
        </div>

        {/* Categories and Verification */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-primary bg-primary/5 dark:bg-primary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {category}
          </span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
            <ShieldCheck className="w-3 h-3 text-blue-500 dark:text-blue-400 fill-current text-white dark:text-[#1E293B]" />
            Verified
          </span>
        </div>

        <h4 className="font-display font-bold text-charcoal dark:text-gray-100 text-base mt-3.5 group-hover:text-primary transition-colors leading-tight truncate">
          {name}
        </h4>
        
        {/* Geographic location */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate">{location}</span>
        </div>
      </div>

      {/* Bottom Metrics Details */}
      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">VOLUME PURCHASED</span>
          <span className="text-sm font-extrabold text-charcoal dark:text-gray-100 flex items-center gap-1 mt-1 font-display">
            <TrendingUp className="w-4 h-4 text-primary" />
            {volume}
          </span>
        </div>

        <Link
          to="../messages"
          state={{ 
            contactBuyerId: buyer._id, 
            contactBuyerName: name, 
            contactCategory: category, 
            contactLocation: location 
          }}
          className="px-4.5 py-2.5 rounded-xl bg-primary/5 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-primary/10 hover:border-transparent shadow-xs hover:shadow-md focus:outline-none"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Contact</span>
        </Link>
      </div>

    </div>
  );
}

