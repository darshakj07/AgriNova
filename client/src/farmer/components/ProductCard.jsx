import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Tag, Box, Sprout, Wheat, Carrot, Droplet, AlertCircle } from 'lucide-react';

export default function ProductCard({ product, onDelete }) {
  const statusColors = {
    'In Stock': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50',
    'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
    'Out of Stock': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
  };

  // Select dynamic Lucide icon based on category
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'grains':
        return <Wheat className="w-8 h-8 text-primary" />;
      case 'vegetables':
        return <Carrot className="w-8 h-8 text-orange-500" />;
      case 'oilseeds':
        return <Droplet className="w-8 h-8 text-yellow-600" />;
      default:
        return <Sprout className="w-8 h-8 text-primary" />;
    }
  };

  const isOutOfStock = product.quantity <= 0;

  return (
    <div className={`bg-white dark:bg-[#1E293B] rounded-3xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group ${
      isOutOfStock ? 'border-red-200 shadow-red-50/50 shadow-md ring-1 ring-red-100/50' : 'border-charcoal/5 dark:border-white/5'
    }`}>
      
      {/* Top Banner (primary image representation or category icon) */}
      <div className="h-44 bg-linear-to-br from-primary/10 to-secondary/5 relative overflow-hidden flex items-center justify-center">
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
              Alert: Out of Stock
            </span>
          </div>
        )}
        
        {product.images && product.images.length > 0 ? (
          <img 
            src={typeof product.images[0] === 'object' ? (product.images[0]?.secure_url || product.images[0]?.url) : product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1E293B] flex items-center justify-center shadow-md transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 z-10">
            {getCategoryIcon(product.category)}
          </div>
        )}

        {/* Status Badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider z-10 ${statusColors[product.status] || 'bg-gray-50 dark:bg-[#0F172A] text-charcoal dark:text-gray-100'}`}>
          {product.status}
        </span>

        {/* Background Grid Accent */}
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            {product.category}
          </span>
          <h4 className="font-display font-bold text-charcoal dark:text-gray-100 text-base mt-1 group-hover:text-primary transition-colors truncate">
            {product.name}
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed font-normal mt-2 line-clamp-2 min-h-[32px]">
            {product.description || 'No description provided for this crop listing.'}
          </p>
        </div>

        {/* Telemetry info */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-50 text-xs font-semibold text-gray-650">
          <div className="flex items-center gap-1.5">
            <Box className="w-4 h-4 text-primary/50" />
            <span>{product.quantity} Qtl</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-amber-500/50" />
            <span className="text-charcoal dark:text-gray-100 font-bold">₹{product.price.toLocaleString('en-IN')}/qtl</span>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="p-3 px-4 bg-gray-50 dark:bg-[#0F172A]/50 border-t border-charcoal/5 dark:border-white/5 flex items-center justify-end gap-2">
        <Link
          to={`edit/${product._id}`}
          className="p-2 rounded-xl bg-primary/5 dark:bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-transparent shadow-xs focus:outline-none"
        >
          <Edit2 className="w-4 h-4" />
        </Link>
        <button
          onClick={() => onDelete(product._id)}
          className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-transparent shadow-xs focus:outline-none cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}

