import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, CheckCircle2, Trash2, Star, Loader2, AlertCircle } from 'lucide-react';

export default function AddProduct() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Grains');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  
  // Image list (array of Base64 strings)
  const [images, setImages] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Handle local image selection and base64 encoding
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setError('');
    
    files.forEach(file => {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('One or more files exceed the 5MB size limit.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => {
          // Prevent duplicates
          if (prev.includes(reader.result)) return prev;
          return [...prev, reader.result];
        });
      };
      reader.onerror = () => {
        setError('Error reading file contents.');
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image from list
  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Make an image primary (swap it to index 0)
  const makePrimary = (indexToSwap) => {
    setImages(prev => {
      const copy = [...prev];
      const selectedImage = copy[indexToSwap];
      // Remove it from current index
      copy.splice(indexToSwap, 1);
      // Insert at the front (index 0)
      return [selectedImage, ...copy];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      setError('Session expired. Please log in again.');
      return;
    }

    if (quantity < 0 || price < 0) {
      setError('Quantity and Price must be positive values.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name,
        category,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        description,
        images
      };

      const response = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to list product in database.');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/farmer/products');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/farmer/products')}
          className="p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-charcoal dark:text-gray-100/60 hover:text-primary transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Add Crop Product</h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5">List a new harvest catalog item for direct buyers.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        
        {/* Success Modal Overlay */}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white dark:bg-[#1E293B]/95 z-20 flex flex-col items-center justify-center p-6 text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-primary mb-4 animate-bounce" />
            <h3 className="font-display font-bold text-xl text-charcoal dark:text-gray-100">Product Listed!</h3>
            <p className="text-sm text-gray-400 mt-1">Your crop will appear on the buyer marketplace catalog instantly.</p>
          </motion.div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-250 rounded-2xl flex items-start gap-3 text-red-800 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-bold">Error Listing Crop</p>
              <p className="mt-0.5 text-red-800/80 leading-normal">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Crop Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Crop Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sharbati Wheat"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-bold text-charcoal dark:text-gray-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-bold text-gray-600 dark:text-gray-300 cursor-pointer select-none"
              >
                <option value="Grains">Grains</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Oilseeds">Oilseeds</option>
                <option value="Fruits">Fruits</option>
              </select>
            </div>
          </div>

          {/* Row 2: Quantity & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Available Quantity (Quintals)</label>
              <input
                type="number"
                required
                min="0"
                step="any"
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-bold text-charcoal dark:text-gray-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Price per Quintal (₹)</label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 2650"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-bold text-charcoal dark:text-gray-100"
              />
            </div>
          </div>

          {/* Row 3: Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Product Description</label>
            <textarea
              required
              rows="4"
              placeholder="Provide crop details: harvesting date, moisture metrics, variety (e.g. Lokwan, Hybrid) etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-bold text-charcoal dark:text-gray-100 resize-none"
            />
          </div>

          {/* Row 4: Multiple Image Uploader */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase">Product Images</label>
            
            {/* Hidden Input File */}
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              id="product-images-input"
              onChange={handleImageChange}
            />

            {/* Clickable box */}
            <div 
              onClick={() => document.getElementById('product-images-input').click()}
              className="border border-dashed border-gray-200 dark:border-gray-700 hover:border-primary/30 bg-gray-50 dark:bg-[#0F172A] hover:bg-primary/5 p-8 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-bold text-charcoal dark:text-gray-100">Click to choose crop photos (multiple allowed)</span>
              <span className="text-xs text-gray-400 mt-1 font-semibold">Supports PNG, JPG up to 5MB. First image selected is Primary.</span>
            </div>

            {/* Image Preview Gallery */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="relative rounded-2xl overflow-hidden border border-gray-250 aspect-square group shadow-xs bg-gray-100 dark:bg-slate-800">
                    <img 
                      src={typeof imgUrl === 'object' && imgUrl !== null ? (imgUrl.secure_url || imgUrl.url) : imgUrl} 
                      alt={`crop-${idx}`} 
                      className="w-full h-full object-cover" 
                    />
                    
                    {/* Primary Badge */}
                    {idx === 0 ? (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md z-10">
                        <Star className="w-3 h-3 fill-white" /> Primary
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => makePrimary(idx)}
                        className="absolute top-2 left-2 bg-black/60 hover:bg-primary text-white text-[9px] font-bold uppercase px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                      >
                        Make Primary
                      </button>
                    )}

                    {/* Delete overlay button */}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={() => navigate('/farmer/products')}
              className="px-5 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:bg-[#0F172A] text-sm font-bold text-charcoal dark:text-gray-100/70 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Product'
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}

