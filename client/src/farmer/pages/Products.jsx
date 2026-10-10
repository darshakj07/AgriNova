import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Search, Plus, Grid, List, Loader2, AlertCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';

export default function Products() {
  const { user } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch crop listings from MongoDB
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE}/api/products/my-products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to retrieve crops.');
      }

      setProductsList(data.products || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error fetching crops. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProducts();
    }
  }, [user]);

  // Handle crop deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listed crop product? This will remove it from the market.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product.');
      }

      // Filter out from state
      setProductsList(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message || 'Error deleting product. Please try again.');
      console.error(err);
    }
  };

  // Filter crops in memory
  const filteredProducts = productsList.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">My Crop Products</h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Manage list prices and available volumes in the public mandi catalog.</p>
        </div>
        <Link
          to="add"
          className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 self-start sm:self-auto group"
        >
          <Plus className="w-4 h-4 transform group-hover:scale-110 transition-transform" />
          <span>Add Crop Product</span>
        </Link>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Left Side: Category Filter Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <div className="flex bg-gray-50 dark:bg-[#0F172A] p-1 rounded-2xl border border-gray-100 dark:border-gray-800">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'grains', label: 'Grains' },
              { id: 'vegetables', label: 'Vegetables' },
              { id: 'oilseeds', label: 'Oilseeds' },
              { id: 'fruits', label: 'Fruits' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all focus:outline-none whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-white dark:bg-[#1E293B] text-primary shadow-sm border border-gray-100 dark:border-gray-800/60 font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary font-semibold'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Search and View Mode */}
        <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3 shrink-0">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs md:w-60">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crop products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
            />
          </div>

          {/* View Toggles */}
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-150 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all focus:outline-none cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-[#1E293B] text-primary shadow-sm' : 'text-gray-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all focus:outline-none cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-[#1E293B] text-primary shadow-sm' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <p className="text-sm text-gray-400 font-bold">Synchronizing crop inventories...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-3xl flex items-start gap-3 text-red-800 text-sm font-semibold max-w-xl mx-auto">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-bold">Database Error</p>
            <p className="mt-0.5 text-red-800/80 leading-normal">{error}</p>
            <button 
              onClick={fetchProducts}
              className="mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-900 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Catalog Render list */}
      {!loading && !error && (
        filteredProducts.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            /* List Mode (Table View) */
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm overflow-hidden p-6">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-charcoal/5 dark:border-white/5 text-xs font-bold text-gray-400 uppercase">
                      <th className="pb-3">Crop Name</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Volume available</th>
                      <th className="pb-3">Price per Quintal</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5">
                    {filteredProducts.map(product => (
                      <tr key={product._id} className={`transition-colors ${product.quantity <= 0 ? 'bg-red-50/20 hover:bg-red-50/40 dark:bg-red-900/10 dark:hover:bg-red-900/20 border-l-4 border-red-500' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                        <td className="py-4 text-sm font-bold text-charcoal dark:text-gray-100 pl-3">{product.name}</td>
                        <td className="py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">{product.category}</td>
                        <td className="py-4 text-sm font-semibold text-gray-650">
                          {product.quantity <= 0 ? (
                            <span className="flex items-center gap-1.5 text-red-600 font-bold">
                              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                              <span>0 Quintals</span>
                            </span>
                          ) : (
                            <span>{product.quantity} Quintals</span>
                          )}
                        </td>
                        <td className="py-4 font-display font-extrabold text-sm text-charcoal dark:text-gray-100">₹{product.price.toLocaleString('en-IN')}/qtl</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${
                            product.status === 'In Stock' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' :
                            product.status === 'Low Stock' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <Link 
                              to={`edit/${product._id}`}
                              className="px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary text-sm font-bold hover:bg-gray-50 dark:bg-[#0F172A] transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="px-2.5 py-1.5 rounded-lg border border-gray-150 dark:border-gray-800 text-gray-400 hover:text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <EmptyState
            title={productsList.length === 0 ? "No listed crops yet" : "No Match Found"}
            description={productsList.length === 0 ? "Add your first harvest list item to begin trading in the AgriNova catalog." : "Try checking for spelling corrections or reset your filters."}
            onReset={productsList.length === 0 ? null : () => {
              setSearchQuery('');
              setCategoryFilter('all');
            }}
          />
        )
      )}

    </div>
  );
}

