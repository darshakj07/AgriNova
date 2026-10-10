import React from 'react';
import { Bell, ShoppingBag, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function NotificationCard({ notification, onRead }) {
  const icons = {
    'order': { icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800/50' },
    'buyer': { icon: MessageSquare, color: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800/50' },
    'system': { icon: Bell, color: 'text-green-600 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800/50' },
    'alert': { icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800/50' }
  };

  const config = icons[notification.type] || icons['system'];
  const Icon = config.icon;

  return (
    <div className={`p-5 rounded-2xl border bg-white dark:bg-[#1E293B] flex items-start gap-4 transition-all duration-300 relative ${
      notification.unread 
        ? 'border-primary/20 shadow-md shadow-primary/5' 
        : 'border-charcoal/5 dark:border-white/5 shadow-sm'
    }`}>
      
      {/* Unread indicator dot */}
      {notification.unread && (
        <span className="absolute top-5 right-5 w-2 h-2 bg-red-500 rounded-full" />
      )}

      {/* Category Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${config.color}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Text Context */}
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{notification.category}</span>
          <span className="text-xs text-gray-400 font-semibold">{notification.time}</span>
        </div>
        <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 mt-1">{notification.title}</h4>
        <p className="text-sm text-gray-400 leading-normal font-medium mt-1">{notification.message}</p>
      </div>

    </div>
  );
}



