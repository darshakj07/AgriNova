import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Sprout, LayoutGrid, CheckCircle2, ArrowLeft, Camera, XCircle } from 'lucide-react';
import LocationPicker from '../../components/LocationPicker';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const parseInitialLocation = (locationStr) => {
  if (!locationStr) return null;
  const match = locationStr.match(/\(Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)\)/i);
  const addressIdx = locationStr.indexOf('(');
  const address = addressIdx !== -1 ? locationStr.substring(0, addressIdx).trim() : locationStr.trim();
  
  let city = '';
  let state = '';
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 3) {
    state = parts[parts.length - 1];
    city = parts[parts.length - 2];
  } else if (parts.length === 2) {
    city = parts[1];
  }

  if (match) {
    return {
      address,
      city,
      state,
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2]),
      selected: true
    };
  }
  return {
    address,
    city,
    state,
    lat: 22.7196,
    lng: 75.8577,
    selected: false
  };
};

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useOutletContext();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [farmName, setFarmName] = useState(user?.farmName || '');
  const [farmLocation, setFarmLocation] = useState(user?.farmLocation || '');
  const [farmLocationData, setFarmLocationData] = useState(() => parseInitialLocation(user?.farmLocation));
  const [farmAcres, setFarmAcres] = useState(user?.farmAcres || '');
  const [primaryCrops, setPrimaryCrops] = useState(user?.primaryCrops || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setProfilePhoto('');
  };
  
  const [success, setSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          farmName,
          farmLocation,
          farmAcres: Number(farmAcres),
          primaryCrops,
          profilePhoto
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      if (updateUser) {
        updateUser(data.user);
      } else {
        localStorage.setItem('agrinova_user', JSON.stringify(data.user));
      }
      window.dispatchEvent(new Event('storage'));
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        navigate('../profile');
      }, 1200);
    } catch (error) {
      setErrorMessage(error.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('../profile')}
          className="p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-charcoal dark:text-gray-100/60 hover:text-primary transition-all"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Edit Farm Profile</h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Modify details and photo configurations.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white dark:bg-[#1E293B]/90 z-20 flex flex-col items-center justify-center text-center p-6">
            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
            <h3 className="font-display font-bold text-lg text-charcoal dark:text-gray-100">Saving Changes</h3>
            <p className="text-xs text-gray-450 mt-1">Updating details across your dashboard panels...</p>
          </div>
        )}

        {/* Success Modal Overlay */}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white dark:bg-[#1E293B]/95 z-20 flex flex-col items-center justify-center p-6 text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-primary mb-4 animate-bounce" />
            <h3 className="font-display font-bold text-xl text-charcoal dark:text-gray-100">Profile Saved!</h3>
            <p className="text-sm text-gray-400 mt-1">Updating details across your dashboard panels...</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs font-semibold">
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-900 font-bold">Failed to save profile</p>
                <p className="mt-0.5 text-red-800/80 leading-normal">{errorMessage}</p>
              </div>
            </div>
          )}
          
          {/* Photo Uploader */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b border-gray-50 dark:border-gray-800">
            <label className="relative group cursor-pointer inline-block">
              <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handlePhotoUpload} />
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary bg-linear-to-br from-primary to-secondary border-2 border-white shadow-md flex items-center justify-center text-white text-xl font-display font-extrabold">
                  {firstName?.charAt(0)}{lastName?.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-5 h-5" />
              </div>
            </label>
            <div className="text-center sm:text-left">
              <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">Upload Profile Photo</h4>
              <p className="text-xs text-gray-400 mt-1 font-medium">JPEG, PNG formats. Max file size: 2MB.</p>
              {profilePhoto && (
                <button type="button" onClick={removePhoto} className="text-xs text-red-500 font-bold mt-2 hover:underline">
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Part 1: Personal Credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 pb-2">
              Personal Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-bold text-charcoal dark:text-gray-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-bold text-charcoal dark:text-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-bold text-charcoal dark:text-gray-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  disabled
                  value={email}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Part 2: Farm Specifications */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 pb-2">
              Farm Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Farm Identity Name</label>
                <input
                  type="text"
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-bold text-charcoal dark:text-gray-100"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Farm Location Configuration</label>
                <LocationPicker
                  onChange={(loc) => {
                    setFarmLocationData(loc);
                    setFarmLocation(`${loc.address} (Lat: ${loc.lat.toFixed(6)}, Lng: ${loc.lng.toFixed(6)})`);
                  }}
                  value={farmLocationData}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Farm Area (Acres)</label>
                <input
                  type="number"
                  required
                  value={farmAcres}
                  onChange={(e) => setFarmAcres(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-bold text-charcoal dark:text-gray-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Primary Crops</label>
                <input
                  type="text"
                  required
                  value={primaryCrops}
                  onChange={(e) => setPrimaryCrops(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-bold text-charcoal dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('../profile')}
              className="px-5 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:bg-[#0F172A] dark:hover:bg-white/5 text-sm font-bold text-charcoal dark:text-gray-100/70"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10"
            >
              Save Profile
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}



