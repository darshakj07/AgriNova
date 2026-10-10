import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sprout, Trash2, ArrowRight } from 'lucide-react';

export default function ProductsManagement() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const userString = localStorage.getItem('agrinova_user');
  const user = userString ? JSON.parse(userString) : null;
  const adminId = user ? (user.id || user._id) : '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: { 'x-user-id': adminId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching crop products:', err);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchProducts();
    }
  }, [adminId]);

  const handleDeleteListing = async (id) => {
    if (confirm("Are you sure you want to delete and moderate this crop listing from the public marketplace?")) {
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`, {
          method: 'DELETE',
          headers: { 'x-user-id': adminId }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          alert("Listing deleted and archived successfully.");
          fetchProducts();
        } else {
          alert(data.message || 'Failed to delete listing.');
        }
      } catch (err) {
        console.error('Error deleting listing:', err);
        alert('Error communicating with server.');
      }
    }
  };

  const handleToggleStatus = async (id, currentQty) => {
    const targetQty = currentQty > 0 ? 0 : 50; // Suspend = 0 qty, Allow = 50 qty
    try {
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
        alert(targetQty === 0 ? "Listing suspended successfully (Stock set to 0)." : "Listing activated successfully.");
        fetchProducts();
      } else {
        alert(data.message || 'Failed to modify listing status.');
      }
    } catch (err) {
      console.error('Error updating listing status:', err);
      alert('Error communicating with server.');
    }
  };

  const categories = ['All', 'Grains', 'Vegetables', 'Fruits', 'Oilseeds'];

  const filteredProducts = products.filter(p => {
    const farmerName = p.farmerId ? `${p.farmerId.firstName} ${p.farmerId.lastName}` : '';
    const farmerLoc = p.farmerId ? p.farmerId.farmLocation || '' : '';
    
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmerLoc.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Products Management</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Audit crop catalogs, moisture ratings, active crop listings, and quality parameters.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search crop, grower name, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-55/10 border border-gray-155 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none shrink-0 ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-55/10 text-charcoal dark:text-gray-100/70 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid / Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 dark:bg-[#0F172A]/50 border-b border-gray-100 dark:border-gray-800">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 whitespace-nowrap pl-6">Crop Name</th>
                <th className="p-4 whitespace-nowrap">Category</th>
                <th className="p-4 whitespace-nowrap">Grower / Farmer</th>
                <th className="p-4 whitespace-nowrap">Volume (Qty)</th>
                <th className="p-4 whitespace-nowrap">Moisture Info</th>
                <th className="p-4 whitespace-nowrap">Pricing Rate</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 text-right  whitespace-nowrap pr-6">Moderator Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5 font-semibold text-gray-600 dark:text-gray-300">
              {filteredProducts.map((p) => {
                const farmer = p.farmerId ? `${p.farmerId.firstName} ${p.farmerId.lastName}` : 'AgriNova Supplier';
                const location = p.farmerId ? p.farmerId.farmLocation || 'India' : 'India';
                const statusLabel = p.quantity > 0 ? 'Listed' : 'Suspended';

                return (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-bold text-charcoal dark:text-gray-100 flex items-center gap-2 pl-6">
                      <Sprout className="w-4 h-4 text-primary shrink-0" />
                      <span>{p.name}</span>
                    </td>
                    <td className="p-4">{p.category}</td>
                    <td className="p-4">
                      <span className="text-xs text-charcoal dark:text-gray-100 font-bold block">{farmer}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">{location}</span>
                    </td>
                    <td className="p-4">{p.quantity} qtl</td>
                    <td className="p-4 text-xs font-mono">12.5%</td>
                    <td className="p-4 font-extrabold text-charcoal dark:text-gray-100">₹{p.price}/qtl</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        statusLabel === 'Listed' 
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50' 
                          : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-150 dark:border-red-800/50'
                      }`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5 shrink-0 whitespace-nowrap pr-6">
                      <button
                        onClick={() => handleToggleStatus(p._id, p.quantity)}
                        className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-colors focus:outline-none ${
                          statusLabel === 'Listed'
                            ? 'border-amber-100 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 dark:border-amber-900/50'
                            : 'border-green-100 dark:border-green-800/50 text-green-650 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 dark:border-green-900/50'
                        }`}
                      >
                        {statusLabel === 'Listed' ? 'Suspend' : 'Allow'}
                      </button>
                      <button
                        onClick={() => handleDeleteListing(p._id)}
                        className="p-1.5 rounded-lg border border-red-100 dark:border-red-800/50 text-red-500 hover:bg-red-55/10 dark:hover:bg-red-900/30 dark:border-red-900/50 transition-colors focus:outline-none inline-flex items-center"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`${p._id}`}
                        className="p-1.5 rounded-lg border border-gray-150 hover:border-primary/20 text-gray-550 hover:text-primary dark:border-white/10 dark:text-gray-400 dark:hover:text-primary dark:hover:border-primary/30 transition-all inline-flex items-center justify-center focus:outline-none"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-400 font-semibold">
                    No matching listed crops found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

