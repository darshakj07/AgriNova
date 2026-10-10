import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, MapPin, MessageSquare, Star, Sprout, Award, Calendar } from 'lucide-react';

export default function SupplierProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0, reviews: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplierAndReviews = async () => {
      try {
        setLoading(true);
        const [farmersRes, reviewsRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/farmers`),
          fetch(`${API_BASE}/api/reviews/user/${id}`)
        ]);
        
        const farmersData = await farmersRes.json();
        if (farmersRes.ok && farmersData.success) {
          const match = farmersData.farmers.find(f => f._id === id);
          if (match) setFarmer(match);
        }

        const reviewsData = await reviewsRes.json();
        if (reviewsRes.ok && reviewsData.success) {
          setStats({
            avgRating: reviewsData.avgRating,
            totalReviews: reviewsData.totalReviews,
            reviews: reviewsData.reviews
          });
        }
      } catch (err) {
        console.error('Error fetching supplier details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplierAndReviews();
  }, [id]);

  if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400 font-semibold">Loading supplier profile...</div>;
  if (!farmer) return <div className="text-center py-12 text-gray-500 dark:text-gray-400 font-semibold">Supplier not found.</div>;

  const mockCrops = [
    { id: 1, name: 'Organic Potatoes', rate: '₹1,400/qtl', qty: '25 qtl', status: 'Available' },
    { id: 2, name: 'Sharbati Wheat', rate: '₹2,650/qtl', qty: '80 qtl', status: 'Available' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('../suppliers')}
          className="p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-charcoal dark:text-gray-100/60 hover:text-primary transition-all focus:outline-none"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Supplier Profile</h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Accredited farm registry and listed inventory.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: General Profile Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 text-center space-y-4">
            
            <div className="w-20 h-20 rounded-3xl bg-[#F8FAF5] dark:bg-[#0F172A] text-primary flex items-center justify-center font-display font-extrabold text-3xl border border-primary/10 mx-auto shadow-sm">
              {farmer.firstName?.charAt(0) || 'F'}
            </div>

            <div>
              <h3 className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100 leading-snug">{farmer.firstName} {farmer.lastName}</h3>
              <p className="text-xs text-primary font-bold mt-0.5">{farmer.farmName || 'Grower'}</p>
              <span className="text-xs text-gray-400 font-semibold flex items-center justify-center gap-1 mt-2">
                <MapPin className="w-3.5 h-3.5 text-gray-300" />
                {farmer.farmLocation || 'Farm Site'}
              </span>
            </div>

            <div className="flex justify-center items-center gap-1.5 py-1.5 px-3 bg-yellow-550/10 text-yellow-750 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20 rounded-full w-fit mx-auto text-xs font-bold uppercase tracking-wider">
              â­ {stats.avgRating > 0 ? stats.avgRating : 'N/A'} Rating ({stats.totalReviews} Reviews)
            </div>

            <div className="pt-6 border-t border-gray-50 flex gap-2">
              <Link
                to="../messages"
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 focus:outline-none"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Grower</span>
              </Link>
            </div>
          </div>

          {/* Farm Accreditations */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
            <h4 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm uppercase tracking-wider">Accreditations</h4>
            <div className="space-y-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-primary shrink-0" />
                <span>Verified Land Register (Acreage: {farmer.farmArea || farmer.farmAcres || '15'} Acres)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="w-4.5 h-4.5 text-primary shrink-0" />
                <span>Standard Moisture Compliance Accredited</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4.5 h-4.5 text-primary shrink-0" />
                <span>Partner Since: June 2024</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Columns: Active products catalog */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Available Farm Listings</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Crop produce currently listed for direct sales.</p>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase">
                    <th className="pb-3">Crop Name</th>
                    <th className="pb-3">Starting Rate</th>
                    <th className="pb-3">Available Qty</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-semibold text-gray-600 dark:text-gray-300 divide-y divide-gray-50 dark:divide-gray-800">
                  {mockCrops.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors">
                      <td className="py-3.5 text-charcoal dark:text-gray-100 font-bold">{c.name}</td>
                      <td className="py-3.5 font-extrabold text-charcoal dark:text-gray-100">{c.rate}</td>
                      <td className="py-3.5">{c.qty}</td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`../products/${c.id}`}
                          className="py-1.5 px-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary/25 text-gray-500 dark:text-gray-400 hover:text-primary transition-all text-xs font-extrabold uppercase tracking-wider inline-block"
                        >
                          {'Details / Bid'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-display font-bold text-charcoal dark:text-gray-100 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span>Verified Reviews ({stats.totalReviews})</span>
              </h3>
            </div>
            
            <div className="space-y-4">
              {stats.reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-medium">No reviews yet for this supplier.</div>
              ) : stats.reviews.map((rev) => (
                <div key={rev._id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0F172A]/50 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-charcoal dark:text-gray-100 font-bold">{rev.reviewerId?.companyName || rev.reviewerId?.firstName || 'Buyer'}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-0.5 text-accent">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{rev.review}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

