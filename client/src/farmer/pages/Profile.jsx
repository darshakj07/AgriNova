import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Sprout, LayoutGrid, ShieldCheck, Edit3, Calendar, CheckCircle, Award, Star } from 'lucide-react';

export default function Profile() {
  const { user } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0, reviews: [] });
  const [totalListings, setTotalListings] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (!user || (!user._id && !user.id)) return;
        const res = await fetch(`${API_BASE}/api/reviews/user/${user._id || user.id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setStats({
            avgRating: data.avgRating,
            totalReviews: data.totalReviews,
            reviews: data.reviews
          });
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    const fetchListings = async () => {
      try {
        if (!user || (!user._id && !user.id)) return;
        const res = await fetch(`${API_BASE}/api/products/my-products`, {
          headers: {
            'x-user-id': user._id || user.id
          }
        });
        const data = await res.json();
        if (res.ok) {
          setTotalListings(data.products?.length || 0);
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
      }
    };
    fetchReviews();
    fetchListings();
  }, [user]);

  const userInitials = user 
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() 
    : 'DP';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Farmer Profile</h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Your verified grower credentials and agricultural telemetry parameters.</p>
        </div>
        <Link
          to="edit"
          className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 self-start sm:self-auto group"
        >
          <Edit3 className="w-4 h-4 transform group-hover:rotate-12 transition-transform" />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* Main Profile Showcase Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-md overflow-hidden">
        
        {/* Sleek top card banner */}
        <div className="h-40 bg-gradient-to-r from-primary to-primary-dark relative">
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <div className="absolute -bottom-12 left-8 sm:left-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary border-4 border-white shadow-xl flex items-center justify-center text-white font-display font-extrabold text-3xl">
              {userInitials}
            </div>
          </div>
          <div className="absolute top-4 right-6 bg-white dark:bg-[#1E293B]/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-primary dark:text-white uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-secondary fill-current" />
            <span>Active Partner</span>
          </div>
        </div>

        {/* Content details below uploader */}
        <div className="pt-16 pb-8 px-8 sm:px-12 space-y-8">
          
          {/* Main User Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
            <div>
              <h3 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100 flex items-center gap-2">
                <span>{user?.firstName} {user?.lastName}</span>
                <ShieldCheck className="w-6 h-6 text-primary fill-current text-white" />
              </h3>
              <p className="text-sm text-gray-400 font-medium mt-1">Grower ID: <strong className="text-charcoal dark:text-gray-100">#AGR-92048</strong></p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-primary/5 px-4 py-2.5 rounded-2xl border border-primary/10 text-center min-w-[90px]">
                <span className="text-xs font-bold text-gray-400 block uppercase">LISTINGS</span>
                <span className="font-display font-extrabold text-base text-primary">{totalListings} Crops</span>
              </div>
              <div className="bg-primary/5 px-4 py-2.5 rounded-2xl border border-primary/10 text-center min-w-[90px]">
                <span className="text-xs font-bold text-gray-400 block uppercase">RATING</span>
                <span className="font-display font-extrabold text-base text-primary">{stats.avgRating > 0 ? `${stats.avgRating} ★` : 'N/A'}</span>
              </div>
              <div className="bg-primary/5 px-4 py-2.5 rounded-2xl border border-primary/10 text-center min-w-[90px]">
                <span className="text-xs font-bold text-gray-400 block uppercase">REVIEWS</span>
                <span className="font-display font-extrabold text-base text-primary">{stats.totalReviews}</span>
              </div>
            </div>
          </div>

          {/* Grid Layout: Personal Details & Farm details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1: Personal Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                Contact & Account Details
              </h4>
              
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60">
                  <User className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Full Name</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block">{user?.firstName} {user?.lastName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60">
                  <Phone className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Phone Number</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block">{user?.phone || '+91 98765 43210'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60">
                  <Mail className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Email Address</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block truncate">{user?.email || 'farmer@agrinova.com'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60">
                  <Calendar className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Grower Since</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block">January 2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Farm Specifications */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                Farm Specifications
              </h4>

              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60">
                  <Sprout className="w-4.5 h-4.5 text-primary shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Farm Name</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block">{user?.farmName || 'Patil Agri Farms'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60">
                  <LayoutGrid className="w-4.5 h-4.5 text-primary shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Total Acreage</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block">{user?.farmArea || user?.farmAcres || '15'} Acres</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60">
                  <MapPin className="w-4.5 h-4.5 text-primary shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Location Coordinates</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block">{user?.farmLocation || 'Indore, MP'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60">
                  <Award className="w-4.5 h-4.5 text-primary shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Primary Crops Harvested</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block">{user?.primaryCrops || 'Wheat, Potatoes, Soybean'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Secure partner certification banner */}
          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
            <div>
              <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 mb-1">AgriNova Verified Merchant</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Your farm profile undergoes annual NDVI satellite tracking and soil quality assessments. This badge allows you to sell crop listings in direct escrow bids, commanding up to 18% higher market rates.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-extrabold text-xl text-charcoal dark:text-gray-100 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400 fill-current" />
            <span>Verified Reviews ({stats.totalReviews})</span>
          </h3>
        </div>
        
        {stats.reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-[#0F172A] rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <p className="font-medium text-sm">No reviews yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {stats.reviews.map(review => (
              <div key={review._id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all bg-gray-50 dark:bg-[#0F172A]/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-charcoal dark:text-gray-100 text-sm">{review.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">By {review.reviewerId?.firstName || 'Buyer'} on {new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{review.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{review.review}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}


