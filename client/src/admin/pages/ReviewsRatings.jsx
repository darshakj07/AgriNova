import React, { useState, useEffect } from 'react';
import { Star, Search, ShieldAlert, Trash2, CheckCircle, EyeOff, Loader2 } from 'lucide-react';

export default function ReviewsRatings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('All');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const userString = localStorage.getItem('agrinova_user');
        const user = userString ? JSON.parse(userString) : null;
        if (!user) return;

        const res = await fetch(`${API_BASE}/api/reviews`, {
          headers: { 'x-user-id': user.id || user._id }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const getAvgRating = () => {
    if (reviews.length === 0) return '0.0';
    const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = filterRating === 'All' || r.rating.toString() === filterRating;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Reviews & Ratings</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Audit user-submitted feedback and rating distributions.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Star className="w-5.5 h-5.5 fill-current" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase">AVERAGE RATING</span>
            <span className="text-xl font-extrabold text-charcoal dark:text-gray-100 block mt-0.5">{getAvgRating()} / 5.0</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50 flex items-center justify-center text-red-650 dark:text-red-400 shrink-0">
            <ShieldAlert className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase">FLAGGED FEEDBACKS</span>
            <span className="text-xl font-extrabold text-charcoal dark:text-gray-100 block mt-0.5">2 Pending Review</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-55/10 dark:bg-green-900/30 border border-green-100 dark:border-green-800/50 flex items-center justify-center text-green-700 dark:text-green-400 shrink-0">
            <CheckCircle className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase">TOTAL REVIEWS</span>
            <span className="text-xl font-extrabold text-charcoal dark:text-gray-100 block mt-0.5">142 Submitted</span>
          </div>
        </div>
      </div>

      {/* Filter and search */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by writer, recipient, comment text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-155 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {['All', '5', '4', '3', '2', '1'].map((rt) => (
            <button
              key={rt}
              onClick={() => setFilterRating(rt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none shrink-0 ${
                filterRating === rt
                  ? 'bg-primary text-white'
                  : 'bg-gray-55/10 text-charcoal dark:text-gray-100/70 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {rt === 'All' ? 'All Ratings' : `${rt} ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-gray-400 font-bold">Fetching reviews...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 dark:bg-[#0F172A]/50 border-b border-gray-100 dark:border-gray-800">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap pl-6">Author</th>
                  <th className="p-4 whitespace-nowrap">Recipient</th>
                  <th className="p-4 whitespace-nowrap">Rating Score</th>
                  <th className="p-4 whitespace-nowrap">Comment Feedback</th>
                  <th className="p-4 whitespace-nowrap pr-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5 font-semibold text-gray-600 dark:text-gray-300">
                {filteredReviews.length > 0 ? filteredReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-bold text-charcoal dark:text-gray-100 pl-6">{r.author}</td>
                    <td className="p-4 font-bold text-primary">{r.target}</td>
                    <td className="p-4 text-yellow-500 font-bold">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </td>
                    <td className="p-4 text-xs max-w-xs leading-relaxed text-gray-550 italic font-semibold">
                      "{r.comment}"
                    </td>
                    <td className="p-4 text-xs text-gray-400 font-bold pr-6">
                      {r.date}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400 font-bold">No reviews found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

