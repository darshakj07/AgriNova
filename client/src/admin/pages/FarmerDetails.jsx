import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Sprout, ShieldCheck, MapPin, Award, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FarmerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch all farmers
        const farmersRes = await fetch(`${API_BASE}/api/auth/farmers`);
        const farmersData = await farmersRes.json();
        if (!farmersRes.ok) {
          throw new Error(farmersData.message || 'Failed to retrieve grower registry.');
        }
        
        const currentFarmer = farmersData.farmers?.find(f => f._id === id);
        if (!currentFarmer) {
          throw new Error('Grower record not found in system.');
        }

        // 2. Fetch all products to get this farmer's listed crops
        const productsRes = await fetch(`${API_BASE}/api/products`, {
          headers: {
            'x-user-id': id
          }
        });
        
        let listedCrops = [];
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          listedCrops = (productsData.products || []).filter(p => {
            const fId = p.farmerId?._id || p.farmerId;
            return fId === id;
          });
        }

        setFarmer({
          id: currentFarmer._id,
          name: `${currentFarmer.firstName} ${currentFarmer.lastName}`,
          farmName: currentFarmer.farmName,
          location: currentFarmer.farmLocation,
          email: currentFarmer.email,
          phone: currentFarmer.phone,
          acres: currentFarmer.farmAcres || 0,
          cropsCount: listedCrops.length,
          verified: !currentFarmer.isBlocked,
          isBlocked: currentFarmer.isBlocked,
          blockedReason: currentFarmer.blockedReason,
          crops: listedCrops.map(c => ({
            id: c._id,
            name: c.name,
            category: c.category,
            qty: `${c.quantity} qtl`,
            rate: `₹${c.price}/qtl`
          }))
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerData();
  }, [id]);

  const handleApproveAcreage = () => {
    if (!farmer) return;
    setFarmer(prev => ({ ...prev, verified: true }));
    alert("Land acreage certificates and grower details approved successfully!");
  };

  const handleDeleteCrop = async (cropId) => {
    if (!farmer) return;
    const confirmDelete = window.confirm("Are you sure you want to moderate and delete this listing?");
    if (!confirmDelete) return;

    try {
      const adminUser = JSON.parse(localStorage.getItem('agrinova_user') || '{}');
      const res = await fetch(`${API_BASE}/api/products/${cropId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': adminUser?.id || adminUser?._id || ''
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to moderate crop listing.');
      }
      
      const updatedCrops = farmer.crops.filter(c => c.id !== cropId);
      setFarmer(prev => ({ ...prev, crops: updatedCrops, cropsCount: updatedCrops.length }));
      alert("Listing deleted and moderated from Produce Marketplace.");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-gray-450 font-bold">Retrieving grower profile details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3 text-red-650 dark:text-red-400">
        <AlertTriangle className="w-10 h-10" />
        <p className="text-sm font-bold">Failed to load grower: {error}</p>
        <button onClick={() => navigate('../farmers')} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">Go Back</button>
      </div>
    );
  }

  if (!farmer) return <div className="text-center py-12 text-gray-550 font-semibold">Grower not found.</div>;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('../farmers')}
            className="p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-charcoal dark:text-gray-100/60 hover:text-primary transition-all focus:outline-none"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Farmer Profile Oversight</h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Audit land registry accreditations and crop catalog listings.</p>
          </div>
        </div>

        {/* Verify Acreage Button */}
        {!farmer.verified && (
          <button
            onClick={handleApproveAcreage}
            className="px-5 py-3 rounded-2xl bg-secondary hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 self-start sm:self-auto uppercase tracking-wider focus:outline-none"
          >
            <ShieldCheck className="w-4.5 h-4.5" />
            <span>Approve Acreage & Verify</span>
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: General Profile details */}
        <div className="space-y-6">
          
          {/* Profile particulars */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
              <User className="w-4.5 h-4.5 text-primary" />
              <span>Identity particulars</span>
            </h3>
            <div className="grid grid-cols-1 gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">NAME</span>
                <span className="text-charcoal dark:text-gray-100 font-bold text-sm block mt-0.5">{farmer.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">PHONE NUMBER</span>
                <span className="text-charcoal dark:text-gray-100 font-bold block mt-0.5">{farmer.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">EMAIL ADDRESS</span>
                <span className="text-charcoal dark:text-gray-100 font-bold block mt-0.5">{farmer.email}</span>
              </div>
            </div>
          </div>

          {/* Farm registry */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
              <Award className="w-4.5 h-4.5 text-primary" />
              <span>Farm Land Registry</span>
            </h3>
            <div className="grid grid-cols-1 gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">FARM ENTITY</span>
                <span className="text-charcoal dark:text-gray-100 font-bold text-sm block mt-0.5">{farmer.farmName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">ACREAGE SIZE</span>
                <span className="text-charcoal dark:text-gray-100 font-bold block mt-0.5">{farmer.acres} Acres</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">LOCATION BOUNDARIES</span>
                <span className="text-gray-500 dark:text-gray-400 font-medium block mt-0.5 flex items-start gap-1">
                  <MapPin className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                  {farmer.location}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold font-bold">ACREAGE STATUS</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold block mt-1 w-fit ${
                  farmer.verified ? 'bg-green-50 dark:bg-green-900/30 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-155 dark:border-green-800/50 dark:border-green-500/30' : 'bg-amber-50 dark:bg-amber-900/30 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-155 dark:border-amber-800/50 dark:border-amber-500/30 animate-pulse'
                }`}>
                  {farmer.verified ? 'Land Certificate Approved' : 'Awaiting Document Audit'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Columns: Active listed crops */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Active Listings ({farmer.cropsCount})</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Crops posted by this grower currently in the marketplace.</p>
              </div>
            </div>

            {farmer.crops.length > 0 ? (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase">
                      <th className="pb-3">Crop Name</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Listed Qty</th>
                      <th className="pb-3">Price Rate</th>
                      <th className="pb-3 text-right">Moderator actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold text-gray-600 dark:text-gray-300 divide-y divide-gray-50 dark:divide-gray-800">
                    {farmer.crops.map((c) => (
                      <tr key={c.id}>
                        <td className="py-4 text-charcoal dark:text-gray-100 font-bold">{c.name}</td>
                        <td className="py-4">{c.category}</td>
                        <td className="py-4">{c.qty}</td>
                        <td className="py-4 font-extrabold text-charcoal dark:text-gray-100">{c.rate}</td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDeleteCrop(c.id)}
                            className="p-2 rounded-xl border border-red-100 dark:border-red-800/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors focus:outline-none"
                            title="Delete listing (moderate)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-gray-400 font-semibold space-y-1">
                <Sprout className="w-8 h-8 mx-auto text-gray-250 stroke-[1.5]" />
                <p>No active listed inventory for this grower.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

