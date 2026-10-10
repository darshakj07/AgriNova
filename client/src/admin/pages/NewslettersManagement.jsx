import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Users, CheckCircle, AlertCircle, Loader2, Trash2, Calendar } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NewslettersManagement() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendStatus, setSendStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [sendMsg, setSendMsg] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/subscribers`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribers(data.subscribers);
      }
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setSendStatus('error');
      setSendMsg('Please fill in both subject and message fields.');
      return;
    }
    if (subscribers.length === 0) {
      setSendStatus('error');
      setSendMsg('There are no subscribers to send to yet.');
      return;
    }
    setSendStatus('loading');
    setSendMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/subscribers/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendStatus('success');
        setSendMsg(`Email broadcast sent to ${subscribers.length} subscriber(s)!`);
        setSubject('');
        setMessage('');
      } else {
        setSendStatus('error');
        setSendMsg(data.message || 'Failed to send broadcast.');
      }
    } catch (err) {
      setSendStatus('error');
      setSendMsg('Network error. Please check the server connection.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Marketing</p>
          <h1 className="text-2xl font-extrabold text-charcoal dark:text-gray-100">
            Newsletter Management
          </h1>
          <p className="text-sm text-charcoal/60 dark:text-gray-400 mt-1">
            Compose and broadcast emails to all newsletter subscribers.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-2xl px-5 py-3">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-charcoal/50 dark:text-gray-400 font-medium">Total Subscribers</p>
            <p className="text-2xl font-extrabold text-primary leading-none">{loading ? '...' : subscribers.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Compose Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-3 bg-white dark:bg-[#1E293B] rounded-2xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-charcoal dark:text-gray-100">Compose Broadcast</h2>
              <p className="text-xs text-charcoal/50 dark:text-gray-400">Will be sent to all {subscribers.length} subscriber(s)</p>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-charcoal/70 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Weekly Crop Pricing Update – July 2026"
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal/10 dark:border-white/10 bg-[#F8FAF5] dark:bg-[#0F172A] text-sm text-charcoal dark:text-gray-100 font-medium placeholder-charcoal/30 dark:placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-charcoal/70 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                Message Body
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your newsletter content here. Use new lines for paragraphs..."
                rows={10}
                className="w-full px-4 py-3 rounded-xl border border-charcoal/10 dark:border-white/10 bg-[#F8FAF5] dark:bg-[#0F172A] text-sm text-charcoal dark:text-gray-100 font-medium placeholder-charcoal/30 dark:placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Status Feedback */}
            {sendStatus && sendStatus !== 'loading' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold ${
                  sendStatus === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}
              >
                {sendStatus === 'success'
                  ? <CheckCircle className="w-4 h-4 shrink-0" />
                  : <AlertCircle className="w-4 h-4 shrink-0" />
                }
                {sendMsg}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={sendStatus === 'loading'}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-extrabold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sendStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Broadcast...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send to All Subscribers
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Subscribers List Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-2xl border border-charcoal/5 dark:border-white/5 shadow-sm flex flex-col"
        >
          <div className="p-5 border-b border-charcoal/5 dark:border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-charcoal dark:text-gray-100">Subscriber List</h2>
              <p className="text-xs text-charcoal/50 dark:text-gray-400">{subscribers.length} registered emails</p>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-charcoal/5 dark:divide-white/5">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-charcoal/40 dark:text-gray-500 text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading subscribers...
              </div>
            ) : subscribers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-charcoal/30 dark:text-gray-600 gap-3">
                <Mail className="w-10 h-10 opacity-40" />
                <p className="text-sm font-semibold">No subscribers yet.</p>
                <p className="text-xs text-center px-6">Share your landing page so visitors can subscribe from the footer.</p>
              </div>
            ) : (
              subscribers.map((sub, idx) => (
                <motion.div
                  key={sub._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary/3 dark:hover:bg-white/3 group transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-xs shrink-0">
                    {sub.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-charcoal dark:text-gray-100 truncate">{sub.email}</p>
                    <p className="text-[10px] text-charcoal/40 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(sub.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
