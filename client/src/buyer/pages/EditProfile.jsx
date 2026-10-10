import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, ShieldCheck, CheckCircle, XCircle, Building2, Camera } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useOutletContext();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [companyLocation, setCompanyLocation] = useState(user?.city || user?.companyLocation || '');
  const [businessType, setBusinessType] = useState(user?.businessType || 'retailer');
  const [primaryCrops, setPrimaryCrops] = useState(user?.primaryCrops || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
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
          companyName,
          city: companyLocation,
          businessType,
          profilePhoto
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      // Map backend city field to companyLocation for UI backward-compatibility
      const updatedUser = {
        ...data.user,
        companyLocation: data.user.city
      };

      if (updateUser) {
        updateUser(updatedUser);
      } else {
        localStorage.setItem('agrinova_user', JSON.stringify(updatedUser));
      }
      window.dispatchEvent(new Event('storage'));

      setSaving(false);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('../profile');
      }, 1000);
    } catch (error) {
      setErrorMessage(error.message || 'Server error. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('../profile')}
          className="p-2 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-charcoal dark:text-gray-100/60 hover:text-primary transition-all focus:outline-none"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Modify Profile</h2>
          <p className="text-sm text-gray-450 font-medium mt-0.5">Edit corporate license settings and profile particulars.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        
        {saving && (
          <div className="absolute inset-0 bg-white dark:bg-[#1E293B]/90 z-20 flex flex-col items-center justify-center text-center p-6 backdrop-blur-xs">
            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
            <h3 className="font-display font-bold text-lg text-charcoal dark:text-gray-100">Saving Changes</h3>
            <p className="text-xs text-gray-450 mt-1">Updating details across your dashboard panels...</p>
          </div>
        )}

        {success && (
          <div className="absolute inset-0 bg-white dark:bg-[#1E293B]/95 z-20 flex flex-col items-center justify-center text-center p-6">
            <CheckCircle className="w-14 h-14 text-primary mb-3" />
            <h3 className="font-display font-bold text-lg text-charcoal dark:text-gray-100">Profile Updated</h3>
            <p className="text-xs text-gray-450 mt-1">Directing you back to your corporate profile...</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Section 1: Corporate Registry Details */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 pb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" /> Corporate Settings
              </h3>

              <div className="space-y-4">
                {/* Company Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">GST Registered Entity</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 text-sm font-semibold text-charcoal dark:text-gray-100 transition-all"
                  />
                </div>

                {/* Business Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Business Classification</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 text-sm font-bold text-charcoal dark:text-gray-100 select-none cursor-pointer"
                  >
                    <option value="retailer">Retailer / Supermarket</option>
                    <option value="wholesaler">Wholesale Distributor</option>
                    <option value="exporter">Export Merchant</option>
                    <option value="processing">Food Processing Plant</option>
                  </select>
                </div>

                {/* Target crops */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Primary Target Crops</label>
                  <input
                    type="text"
                    required
                    value={primaryCrops}
                    onChange={(e) => setPrimaryCrops(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 text-sm font-semibold text-charcoal dark:text-gray-100 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Logistics */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 pb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" /> Representative & Contact
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 text-sm font-semibold text-charcoal dark:text-gray-100 transition-all"
                    />
                  </div>
                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 text-sm font-semibold text-charcoal dark:text-gray-100 transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">GST Registered Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 text-sm font-semibold text-charcoal dark:text-gray-100 transition-all"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">Corporate Email Coordinates</label>
                  <input
                    type="email"
                    required
                    disabled
                    value={email}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-400 cursor-not-allowed"
                  />
                </div>

                {/* Shipping Location */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">Delivery Shipping Address</label>
                  <input
                    type="text"
                    required
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 text-sm font-semibold text-charcoal dark:text-gray-100 transition-all"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('../profile')}
              className="px-5 py-3 rounded-2xl border border-gray-150 dark:border-gray-800 hover:bg-gray-50 dark:bg-[#0F172A] text-sm font-bold text-charcoal dark:text-gray-100/70 transition-all focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10"
            >
              Save Profile Configurations
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}

