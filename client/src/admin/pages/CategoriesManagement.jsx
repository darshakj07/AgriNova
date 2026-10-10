import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Trash2, Edit, Sprout } from 'lucide-react';

export default function CategoriesManagement() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: '', description: '', rateRange: '' });

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name) {
      alert("Category name is required.");
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCategories(prev => [...prev, data.category]);
        setNewCat({ name: '', description: '', rateRange: '' });
        alert("New agricultural produce category added.");
      } else {
        alert(data.message || 'Failed to add category');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Error communicating with server.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (confirm("Remove this crop category? All associated items will lose categorization.")) {
      try {
        const res = await fetch(`${API_BASE}/api/categories/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
          setCategories(prev => prev.filter(c => c.id !== id && c._id !== id));
          alert("Category removed successfully.");
        } else {
          alert(data.message || 'Failed to remove category');
        }
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Categories Management</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Define crop catalogs, classification hierarchies, and standard trading price bands.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Category Form */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
            <Plus className="w-4.5 h-4.5 text-primary" />
            <span>Create Produce Class</span>
          </h3>
          <form onSubmit={handleAddCategory} className="space-y-3.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block uppercase">CATEGORY NAME</label>
              <input
                type="text"
                placeholder="e.g. Spices & Condiments"
                value={newCat.name}
                onChange={(e) => setNewCat(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block uppercase">DESCRIPTION</label>
              <textarea
                placeholder="Brief summary of crops inside this class..."
                rows="3"
                value={newCat.description}
                onChange={(e) => setNewCat(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-xs font-semibold text-charcoal dark:text-gray-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block uppercase">TRADING PRICE BAND</label>
              <input
                type="text"
                placeholder="e.g. ₹5,000 - ₹12,000/qtl"
                value={newCat.rateRange}
                onChange={(e) => setNewCat(prev => ({ ...prev, rateRange: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold uppercase tracking-wide rounded-xl shadow-md transition-all mt-2 cursor-pointer focus:outline-none"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 space-y-4">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2">
            <FolderTree className="w-4.5 h-4.5 text-primary" />
            <span>Active Produce Classifications</span>
          </h3>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 dark:bg-[#0F172A]/50 border-b border-gray-100 dark:border-gray-800">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap pl-6">Class ID</th>
                  <th className="p-4 whitespace-nowrap">Class Name</th>
                  <th className="p-4 whitespace-nowrap">Market Description</th>
                  <th className="p-4 text-center  whitespace-nowrap">Active Listings</th>
                  <th className="p-4 whitespace-nowrap">Standard Price Range</th>
                  <th className="p-4 text-right  whitespace-nowrap pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5 font-semibold text-gray-600 dark:text-gray-300">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-primary font-mono font-bold text-xs pl-6">CAT-{String(c.id).slice(-4).toUpperCase()}</td>
                    <td className="p-4 font-bold text-charcoal dark:text-gray-100 flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-primary shrink-0" />
                      <span>{c.name}</span>
                    </td>
                    <td className="p-4 text-xs font-medium max-w-xs leading-relaxed text-gray-500 dark:text-gray-400">{c.description}</td>
                    <td className="p-4 text-center font-bold text-charcoal dark:text-gray-100">{c.listings}</td>
                    <td className="p-4 text-xs font-mono">{c.rateRange}</td>
                    <td className="p-4 text-right space-x-1.5 shrink-0 whitespace-nowrap pr-6">
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-1.5 rounded-lg border border-red-100 dark:border-red-800/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors focus:outline-none inline-flex items-center"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

