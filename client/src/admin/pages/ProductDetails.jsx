import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sprout, ShieldCheck, MapPin, Calendar } from 'lucide-react';

export default function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const userString = localStorage.getItem('agrinova_user');
  const user = userString ? JSON.parse(userString) : null;
  const adminId = user ? (user.id || user._id) : '';

  const [product, setProduct] = useState(null);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        headers: { 'x-user-id': adminId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProduct(data.product);
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  };

  useEffect(() => {
    if (adminId && id) {
      fetchProduct();
    }
  }, [adminId, id]);

  const handleToggleVerify = async () => {
    if (!product) return;
    try {
      const nextVerifyState = !product.verified;
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId
        },
        body: JSON.stringify({ verified: nextVerifyState })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(nextVerifyState ? 'Quality check pass approved successfully!' : 'Quality check pass revoked.');
        fetchProduct();
      } else {
        alert(data.message || 'Failed to update quality verification.');
      }
    } catch (err) {
      console.error('Error updating quality verification:', err);
      alert('Network error updating quality check.');
    }
  };

  const handleModerateStatus = async (suspend) => {
    if (!product) return;
    try {
      const targetQty = suspend ? 0 : 50;
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId
        },
        body: JSON.stringify({ quantity: targetQty })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(suspend ? 'Listing suspended successfully.' : 'Listing activated successfully.');
        fetchProduct();
      } else {
        alert(data.message || 'Failed to moderate listing.');
      }
    } catch (err) {
      console.error('Error moderating listing status:', err);
      alert('Network error moderating listing status.');
    }
  };

  if (!product) return <div className="text-center py-12 text-gray-550 font-semibold">Loading product catalog details...</div>;

  const isSuspended = product.quantity === 0;
  const farmerName = product.farmerId ? `${product.farmerId.firstName} ${product.farmerId.lastName}` : 'AgriNova Supplier';
  const location = product.farmerId ? product.farmerId.farmLocation || 'India' : 'India';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('../products')}
            className="p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-charcoal dark:text-gray-100/60 hover:text-primary transition-all focus:outline-none bg-white dark:bg-[#1E293B]"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Crop Listing Inspection</h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Audit crop moisture ratings, laboratory test profiles, and catalog moderation bounds.</p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => handleModerateStatus(!isSuspended)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all focus:outline-none ${
              !isSuspended
                ? 'border-red-200 dark:border-red-800/50 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 dark:border-red-900/50'
                : 'border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 dark:border-green-900/50'
            }`}
          >
            {!isSuspended ? 'Suspend Listing' : 'Activate Listing'}
          </button>
          <button
            onClick={handleToggleVerify}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 focus:outline-none text-white ${
              product.verified ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{product.verified ? 'Revoke Lab Pass' : 'Approve Quality Lab Pass'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - General Crop Information */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-55/10 pb-3">
              <Sprout className="w-4.5 h-4.5 text-primary" />
              <span>Catalog Details</span>
            </h3>
            <div className="grid grid-cols-1 gap-4 text-xs font-semibold text-gray-650">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">CROP SPECIE</span>
                <span className="text-charcoal dark:text-gray-100 font-bold text-sm block mt-0.5">{product.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">CLASSIFICATION</span>
                <span className="text-charcoal dark:text-gray-100 font-bold block mt-0.5">{product.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">GROWER / OWNER</span>
                <span className="text-primary font-bold block mt-0.5">{farmerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">PACKAGING DETAILS</span>
                <span className="text-charcoal dark:text-gray-100 font-bold block mt-0.5">Jute Bags (50kg)</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-55/10 pb-3">
              <MapPin className="w-4.5 h-4.5 text-primary" />
              <span>Location Bounds</span>
            </h3>
            <div className="grid grid-cols-1 gap-4 text-xs font-semibold text-gray-655">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">HARVEST WAREHOUSE</span>
                <span className="text-charcoal dark:text-gray-100 font-bold block mt-0.5">{location}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">GEO COORDINATES</span>
                <span className="font-mono text-charcoal dark:text-gray-100 font-bold block mt-0.5">22.7196° N, 75.8577° E</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns - Metrics, description and labs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-[#0F172A] rounded-2xl">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">AVAILABLE VOLUME</span>
              <span className="text-lg font-extrabold text-charcoal dark:text-gray-100 block mt-1">{product.quantity} qtl</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#0F172A] rounded-2xl">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">PRICE PER QTL</span>
              <span className="text-lg font-extrabold text-primary block mt-1">₹{product.price}/qtl</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#0F172A] rounded-2xl">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">MOISTURE RATING</span>
              <span className="text-lg font-extrabold text-charcoal dark:text-gray-100 block mt-1">12.5%</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#0F172A] rounded-2xl">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">QUALITY STATUS</span>
              <span className={`text-sm font-extrabold block mt-1 ${product.verified ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {product.verified ? 'Lab Checked Pass' : 'Pending Lab Check'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Crop Description</h4>
            <p className="text-sm font-semibold text-charcoal dark:text-gray-100 leading-relaxed">{product.description || 'No description provided for this crop listing.'}</p>
          </div>

          {/* Lab Audits & Certifications */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-55/10 pb-3">
              <ShieldCheck className="w-4.5 h-4.5 text-primary" />
              <span>Laboratory Verification & Audits</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-start text-xs font-semibold p-3 bg-gray-50 dark:bg-[#0F172A] rounded-xl">
                <div className="space-y-1">
                  <span className="text-charcoal dark:text-gray-100 font-bold block">Soil & Quality Inspector</span>
                  <span className="text-gray-400 font-medium block">Checked: {new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`px-2 py-0.75 rounded font-bold ${product.verified ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-150 dark:border-amber-800/50'}`}>
                  {product.verified ? 'Clean / Approved' : 'Pending verification'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

