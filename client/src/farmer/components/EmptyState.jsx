import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function EmptyState({ title, description, onReset, actionText }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-charcoal/15 rounded-3xl bg-white dark:bg-[#1E293B]/40 my-6">
      
      {/* Search Icon bubble */}
      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#0F172A] text-gray-400 flex items-center justify-center shadow-inner mb-4">
        <Search className="w-6 h-6 stroke-[1.5]" />
      </div>

      {/* Text Context */}
      <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm">{title}</h3>
      <p className="text-sm text-gray-400 font-medium max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10 flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{actionText || 'Reset Filters'}</span>
        </button>
      )}

    </div>
  );
}



