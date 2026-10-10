import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, MapPin, ShieldCheck, Edit3, Award, Calendar, 
  Building2, Briefcase, CheckCircle, ShieldCheck as Shield, Star, Sprout
} from 'lucide-react';

export default function Profile() {
  const { user } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });

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
          });
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    fetchReviews();
  }, [user]);

  const userInitials = user 
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() 
    : 'BY';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-5xl mx-auto"
    >
      {/* Header Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Corporate Profile</h2>
          <p className="text-sm text-gray-450 font-medium mt-0.5">Manage your AgriNova partner credentials and license parameters.</p>
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
        
        {/* Banner with organic trade gradient */}
        <div className="h-44 bg-gradient-to-r from-emerald-800 via-primary to-emerald-950 relative">
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <div className="absolute -bottom-14 left-8 sm:left-12">
            <div className="w-28 h-28 rounded-[24px] bg-gradient-to-br from-[#F8FAF5] to-white border-4 border-white shadow-xl flex items-center justify-center text-primary font-display font-extrabold text-4xl transform hover:scale-105 transition-transform duration-300">
              {userInitials}
            </div>
          </div>
          <div className="absolute top-4 right-6 bg-white/20 dark:bg-[#1E293B]/40 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-white fill-current" />
            <span>Verified Partner</span>
          </div>
        </div>

        {/* Content Details */}
        <div className="pt-18 pb-8 px-8 sm:px-12 space-y-8">
          
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
            <div>
              <h3 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100 flex items-center gap-2">
                <span>{user?.firstName} {user?.lastName}</span>
                <Shield className="w-6 h-6 text-primary fill-current text-white" />
              </h3>
              <p className="text-xs text-primary font-bold mt-1">{user?.companyName || 'Verified Corporate Partner'}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#1E293B] text-charcoal dark:text-white border border-gray-100 dark:border-gray-800 px-8 py-4 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-800 rounded-2xl shadow-sm dark:shadow-none">
              <div className="flex-1 py-3 sm:py-0 sm:px-6 first:pl-0 last:pr-0 flex items-center justify-center sm:justify-start gap-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-white/50 font-bold uppercase tracking-widest block mb-1">Corporate Rep Score</span>
                  <span className="font-display font-bold text-lg">{stats.avgRating > 0 ? `${stats.avgRating} / 5.0` : 'N/A'}</span>
                </div>
              </div>
              
              <div className="flex-1 py-3 sm:py-0 sm:px-6 first:pl-0 last:pr-0 flex items-center justify-center sm:justify-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary" />
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-white/50 font-bold uppercase tracking-widest block mb-1">Completed Escrows</span>
                  <span className="font-display font-bold text-lg">24 Secured</span>
                </div>
              </div>

              <div className="flex-1 py-3 sm:py-0 sm:px-6 first:pl-0 last:pr-0 flex items-center justify-center sm:justify-start gap-4">
                <Star className="w-6 h-6 text-primary" />
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-white/50 font-bold uppercase tracking-widest block mb-1">Total Verified Reviews</span>
                  <span className="font-display font-bold text-lg">{stats.totalReviews} Received</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout: Corporate & Fulfillment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1: Corporate Registry */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-450 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" /> Corporate Registry
              </h4>
              
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60 hover:border-primary/10 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-405 uppercase block">Registered entity name</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block">{user?.companyName || 'Indore Wholesalers'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60 hover:border-primary/10 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Briefcase className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-405 uppercase block">Business Classification</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block capitalize">{user?.businessType || 'Retailer'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60 hover:border-primary/10 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Award className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-405 uppercase block">GSTIN Certificate ID</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block">23ABCDE1234F1Z8</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60 hover:border-primary/10 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-405 uppercase block">Merchant Since</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block">June 2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Contacts & Logistics */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-450 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" /> Contacts & Logistics
              </h4>

              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60 hover:border-primary/10 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-405 uppercase block">GST Registered Representative</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block">{user?.firstName} {user?.lastName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60 hover:border-primary/10 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Phone className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-405 uppercase block">Registered Phone</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block">{user?.phone || '+91 99887 76655'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60 hover:border-primary/10 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-405 uppercase block">Corporate Email Coordinates</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block truncate">{user?.email || 'buyer@agrinova.com'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800/60 hover:border-primary/10 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div className="truncate flex-1">
                    <span className="text-[10px] font-bold text-gray-405 uppercase block">Delivery Shipping Address (City)</span>
                    <span className="text-sm font-bold text-charcoal dark:text-gray-100 mt-0.5 block truncate">{user?.city || user?.companyLocation || 'Plot 42, Mandi Area, Indore, MP'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Crops Full Width Banner */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/10 transition-all duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100">Primary Target Procurement Crops</h4>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Crops routinely authorized for direct escrow contract bids.</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-150 text-xs font-bold text-primary shadow-xs">
                {user?.primaryCrops || 'Wheat, Potatoes, Soybeans'}
              </span>
            </div>

          </div>

          {/* Escrow Partner Certification Banner */}
          <div className="p-6 rounded-3xl bg-[#F8FAF5] dark:bg-primary/5 border border-primary/10 dark:border-primary/20 flex items-start gap-4 shadow-xs">
            <Shield className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 mb-1">Escrow Authorized Merchant</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Your corporate account has been fully verified for immediate escrow authorizations. This allows you to post secure bids directly on crop listings, locking down logistics and logistics telemetry configurations instantly.
              </p>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

