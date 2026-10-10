import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Truck, MessageSquare, AlertCircle, CheckCheck, Trash2 } from 'lucide-react';

export default function Notifications() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // 1. Load notifications
    const stored = JSON.parse(localStorage.getItem('agrinova_notifications') || '[]');
    setNotifications(stored);

    // 2. Mark all as read immediately if there are any unread items
    const hasUnread = stored.some(n => n.unread);
    if (hasUnread) {
      const updated = stored.map(n => ({ ...n, unread: false }));
      localStorage.setItem('agrinova_notifications', JSON.stringify(updated));
      setNotifications(updated);
      window.dispatchEvent(new Event('notifications_updated'));
    }

    // 3. Listen for incoming notifications while the user is actively viewing this page
    const handleUpdate = () => {
      const fresh = JSON.parse(localStorage.getItem('agrinova_notifications') || '[]');
      setNotifications(fresh);
      const freshUnread = fresh.some(n => n.unread);
      if (freshUnread) {
        const readFresh = fresh.map(n => ({ ...n, unread: false }));
        localStorage.setItem('agrinova_notifications', JSON.stringify(readFresh));
        setNotifications(readFresh);
        window.dispatchEvent(new Event('notifications_updated'));
      }
    };

    window.addEventListener('notifications_updated', handleUpdate);
    return () => window.removeEventListener('notifications_updated', handleUpdate);
  }, []);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      localStorage.setItem('agrinova_notifications', JSON.stringify([]));
      setNotifications([]);
      window.dispatchEvent(new Event('notifications_updated'));
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Bid Updates') return n.type === 'buyer' || n.type === 'Bid Updates';
    if (activeFilter === 'Shipping') return n.type === 'order' || n.type === 'Shipping';
    if (activeFilter === 'System') return n.type === 'system' || n.type === 'alert' || n.type === 'System';
    return true;
  });

  const getIcon = (type) => {
    const t = type ? type.toLowerCase() : '';
    if (t === 'buyer' || t === 'bid updates') {
      return <MessageSquare className="w-5 h-5" />;
    }
    if (t === 'order' || t === 'shipping') {
      return <Truck className="w-5 h-5" />;
    }
    if (t === 'system' || t === 'alert') {
      return <ShieldCheck className="w-5 h-5" />;
    }
    return <Bell className="w-5 h-5" />;
  };

  const getIconContainerClass = (type) => {
    const t = type ? type.toLowerCase() : '';
    if (t === 'buyer' || t === 'bid updates') {
      return 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800/50';
    }
    if (t === 'order' || t === 'shipping') {
      return 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800/50';
    }
    if (t === 'system' || t === 'alert') {
      return 'text-green-600 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800/50';
    }
    return 'text-gray-500 bg-gray-50 border-gray-100 dark:text-gray-400 dark:bg-[#0F172A] dark:border-gray-800';
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100 flex items-center gap-2">
            <span>Notification Hub</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Stay updated on bid status, escrow releases, and shipping milestones.</p>
        </div>

        {/* Global Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-xl border border-gray-150 hover:border-red-200 text-gray-405 hover:text-red-500 bg-white dark:bg-[#1E293B] text-sm font-bold transition-all flex items-center gap-1.5 focus:outline-none"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 shadow-sm flex gap-2 overflow-x-auto no-scrollbar">
        {['All', 'Bid Updates', 'Shipping', 'System'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap focus:outline-none border ${
              activeFilter === filter
                ? 'bg-primary border-primary text-white shadow-sm'
                : 'bg-gray-50 dark:bg-[#0F172A] border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-charcoal dark:hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {filteredNotifs.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifs.map((notif) => (
            <div key={notif.id} className={`bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-5 sm:p-6 shadow-sm flex gap-4 transition-all relative ${
              notif.unread ? 'border-l-4 border-l-primary border-primary/20 shadow-md shadow-primary/5' : ''
            }`}>
              
              {/* Icon */}
              <div className={`p-3 rounded-2xl border shrink-0 self-start ${getIconContainerClass(notif.type)}`}>
                {getIcon(notif.type)}
              </div>

              {/* Text */}
              <div className="space-y-1 pr-12 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-base text-charcoal dark:text-gray-100">{notif.title}</h3>
                  <span className="text-[10px] text-gray-450 font-semibold">{notif.time}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{notif.message}</p>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-1">{notif.category || notif.type}</span>
              </div>

              {/* Unread circle badge */}
              {notif.unread && (
                <span className="absolute top-6 right-6 w-2.5 h-2.5 bg-red-500 rounded-full" />
              )}

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center mx-auto border border-gray-100 dark:border-gray-800 text-gray-300 mb-4">
            <Bell className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100">No Notifications</h3>
          <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mt-1">
            There are no active notifications matching the selected filter category tab.
          </p>
        </div>
      )}

    </div>
  );
}

