import React, { useState, useEffect } from 'react';
import { BellRing, CheckCheck, Trash2, Filter } from 'lucide-react';
import NotificationCard from '../components/NotificationCard';
import EmptyState from '../components/EmptyState';

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('all'); // all | unread | order | buyer | alert

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
    if (window.confirm('Are you sure you want to clear all notification alerts?')) {
      localStorage.setItem('agrinova_notifications', JSON.stringify([]));
      setNotifications([]);
      window.dispatchEvent(new Event('notifications_updated'));
    }
  };

  // Filtering logic
  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return notif.unread;
    return notif.type === activeTab;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100 flex items-center gap-2">
            <span>Alert Center</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Stay updated with instant buyer bids, shipping milestones, and sensor metrics.</p>
        </div>

        {/* Global actions */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-xl border border-gray-150 hover:border-red-200 text-gray-400 hover:text-red-500 bg-white dark:bg-[#1E293B] text-sm font-bold transition-all flex items-center gap-1.5 focus:outline-none"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs Filter Bar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-3 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-gray-400 text-sm font-bold px-2 border-r border-gray-100 dark:border-gray-800 mr-1 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filter:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 dark:bg-[#0F172A]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'unread'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 dark:bg-[#0F172A]'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.25 rounded-md text-xs font-bold ${activeTab === 'unread' ? 'bg-white dark:bg-[#1E293B]/20 text-white' : 'bg-red-500 text-white'}`}>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('order')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'order'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 dark:bg-[#0F172A]'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('buyer')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'buyer'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 dark:bg-[#0F172A]'
            }`}
          >
            Bids
          </button>
          <button
            onClick={() => setActiveTab('alert')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'alert'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 dark:bg-[#0F172A]'
            }`}
          >
            System
          </button>
        </div>
      </div>

      {/* Notifications List container */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notif => (
            <NotificationCard
              key={notif.id}
              notification={notif}
            />
          ))
        ) : (
          <EmptyState
            title="All Clear!"
            description={
              activeTab === 'unread'
                ? "No unread alerts. You're fully up to date!"
                : "No matching notification alerts found in this category."
            }
            onReset={activeTab !== 'all' ? () => setActiveTab('all') : null}
            actionText="View All Alerts"
          />
        )}
      </div>

    </div>
  );
}



