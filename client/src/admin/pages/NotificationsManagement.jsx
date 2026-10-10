import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';

export default function NotificationsManagement() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', target: 'All Users', type: 'Info' });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(API_BASE);
    setSocket(s);

    const stored = JSON.parse(localStorage.getItem('agrinova_announcements') || '[]');
    if (stored.length === 0) {
      const defaultAnnouncements = [
        { id: 1, title: 'Escrow Maintenance Scheduled', message: 'AgriNova payment systems will undergo essential maintenance on Sunday, June 14th from 2:00 AM to 4:00 AM.', target: 'All Users', type: 'Warning', date: '2026-06-08' },
        { id: 2, title: 'Basmati Crop Rate Updates', message: 'New export limits released for basmati crop classifications. Check current price caps in marketplace.', target: 'Farmers Only', type: 'Info', date: '2026-06-05' },
        { id: 3, title: 'Corporate Registry Verification', message: 'Please re-verify your GSTIN credential documents under settings to unlock higher escrow payout limits.', target: 'Buyers Only', type: 'Alert', date: '2026-06-02' }
      ];
      localStorage.setItem('agrinova_announcements', JSON.stringify(defaultAnnouncements));
      setAnnouncements(defaultAnnouncements);
    } else {
      setAnnouncements(stored);
    }

    return () => {
      s.disconnect();
    };
  }, []);

  const handleDispatch = (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      alert("Notification title and message are required.");
      return;
    }
    const created = {
      id: Date.now(),
      title: form.title,
      message: form.message,
      target: form.target,
      type: form.type,
      date: new Date().toISOString().split('T')[0]
    };
    
    // Save locally
    const updated = [created, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('agrinova_announcements', JSON.stringify(updated));

    // Emit socket broadcast
    if (socket) {
      socket.emit('sendAnnouncement', created);
    }

    setForm({ title: '', message: '', target: 'All Users', type: 'Info' });
    alert("System bulletin broadcasted successfully.");
  };

  const handleRetract = (id) => {
    if (confirm("Retract this notification bulletin from user feeds?")) {
      const updated = announcements.filter(a => a.id !== id);
      setAnnouncements(updated);
      localStorage.setItem('agrinova_announcements', JSON.stringify(updated));
      alert("Notification retracted.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Notifications Dispatch</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Broadcast system announcements, warnings, SMS alerts, and app-wide banners.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dispatch Form */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
            <Plus className="w-4.5 h-4.5 text-primary" />
            <span>Compose Announcement</span>
          </h3>
          <form onSubmit={handleDispatch} className="space-y-3.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block uppercase">BULLETIN TITLE</label>
              <input
                type="text"
                placeholder="e.g. Server Upgrade Schedule"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block uppercase">BROADCAST AUDIENCE</label>
              <select
                value={form.target}
                onChange={(e) => setForm(prev => ({ ...prev, target: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-55/10 border border-gray-150 focus:outline-none focus:border-primary/30 text-xs font-bold text-charcoal dark:text-gray-100"
              >
                <option value="All Users">All Platform Users</option>
                <option value="Farmers Only">Farmers Only</option>
                <option value="Buyers Only">Buyers Only</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block uppercase">SEVERITY LEVEL</label>
              <select
                value={form.type}
                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-55/10 border border-gray-150 focus:outline-none focus:border-primary/30 text-xs font-bold text-charcoal dark:text-gray-100"
              >
                <option value="Info">Info (Green)</option>
                <option value="Warning">Warning (Amber)</option>
                <option value="Alert">Alert (Red)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block uppercase">MESSAGE BODY</label>
              <textarea
                placeholder="Type your alert message here..."
                rows="4"
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-xs font-semibold text-charcoal dark:text-gray-100"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold uppercase tracking-wide rounded-xl shadow-md transition-all mt-2 cursor-pointer focus:outline-none"
            >
              Broadcast Bulletin
            </button>
          </form>
        </div>

        {/* History of Announcements */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 space-y-4">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-primary" />
            <span>Historically Broadcasted Bulletins</span>
          </h3>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 dark:bg-[#0F172A]/50 border-b border-gray-100 dark:border-gray-800">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap pl-6">Title & Target</th>
                  <th className="p-4 whitespace-nowrap">Announcement Summary</th>
                  <th className="p-4 whitespace-nowrap">Severity</th>
                  <th className="p-4 whitespace-nowrap">Sent Date</th>
                  <th className="p-4 text-right  whitespace-nowrap pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5 font-semibold text-gray-600 dark:text-gray-300">
                {announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-4 pl-6">
                      <span className="text-charcoal dark:text-gray-100 font-bold block">{ann.title}</span>
                      <span className="text-[10px] text-primary font-bold block">{ann.target}</span>
                    </td>
                    <td className="p-4 text-xs font-medium max-w-xs leading-relaxed text-gray-500 dark:text-gray-400">{ann.message}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ann.type === 'Warning'
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-155 dark:border-amber-800/50'
                          : ann.type === 'Alert'
                          ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-155 dark:border-red-800/50 animate-pulse'
                          : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50'
                      }`}>
                        {ann.type}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-gray-400">{ann.date}</td>
                    <td className="p-4 text-right pr-6">
                      <button
                        onClick={() => handleRetract(ann.id)}
                        className="p-1.5 rounded-lg border border-red-100 dark:border-red-800/50 text-red-500 hover:bg-red-55/10 dark:hover:bg-red-900/30 transition-colors focus:outline-none cursor-pointer"
                        title="Retract announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {announcements.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400 font-semibold">
                      No broadcast history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

