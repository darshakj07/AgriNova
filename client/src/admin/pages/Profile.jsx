import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Mail, Phone, Calendar, KeyRound } from 'lucide-react';

export default function Profile() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const userString = localStorage.getItem('agrinova_user');
  const loggedUser = userString ? JSON.parse(userString) : null;
  const adminId = loggedUser ? (loggedUser.id || loggedUser._id) : '';

  const [profile, setProfile] = useState({
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@gmail.com',
    phone: '+91 99999 88888',
    role: 'Full Platform Admin',
    joinedDate: '2026-01-10',
    clearanceLevel: 'Superuser (Level 4)',
    permissions: ['Oversight Directories', 'Manage Escrow Ledgers', 'NLP Flag Moderations', 'Weather Mapping Sensor controls']
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        headers: { 'x-user-id': adminId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const u = data.user;
        const updatedProfile = {
          ...profile,
          firstName: u.firstName || 'System',
          lastName: u.lastName || 'Administrator',
          email: u.email || 'admin@gmail.com',
          phone: u.phone || '+91 99999 88888',
          role: u.role || 'Full Platform Admin'
        };
        setProfile(updatedProfile);
        setFormData(updatedProfile);
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchProfile();
    }
  }, [adminId]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Admin profile details updated successfully!");
        
        // Sync local storage user representation
        localStorage.setItem('agrinova_user', JSON.stringify({
          ...loggedUser,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          phone: data.user.phone
        }));

        fetchProfile();
        setIsEditing(false);
      } else {
        alert(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Error updating admin profile:', err);
      alert('Error communicating with server.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Admin Profile</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5 font-bold">Configure security credentials, admin details, and view platform operational bounds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-6 h-fit">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary to-emerald-700 text-white flex items-center justify-center font-display font-extrabold text-3xl shadow-lg shadow-primary/20 mx-auto">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100 leading-snug">{profile.firstName} {profile.lastName}</h3>
              <p className="text-xs text-primary font-bold mt-1 uppercase tracking-wider">{profile.role}</p>
            </div>
            <div className="flex justify-center items-center gap-1.5 py-1 px-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50 rounded-full w-fit mx-auto text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{profile.clearanceLevel}</span>
            </div>
          </div>

          <div className="space-y-3.5 pt-6 border-t border-gray-50 text-xs font-semibold text-charcoal dark:text-gray-100 leading-none">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 font-medium">Joined platform: {profile.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Edit or Display Details */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-primary" />
              <span>Profile Credentials</span>
            </h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-lg border border-gray-150 hover:border-primary/20 text-xs font-bold text-charcoal dark:text-gray-100 hover:text-primary transition-all focus:outline-none cursor-pointer bg-white dark:bg-[#1E293B]"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Credentials'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-semibold text-gray-655">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold block uppercase">FIRST NAME</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold block uppercase">LAST NAME</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold block uppercase">EMAIL ADDRESS (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-150 text-sm font-semibold text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold block uppercase">PHONE CONTACT</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-55/10 border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold uppercase tracking-wide rounded-xl shadow-md transition-all focus:outline-none cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Permission segment */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-primary" />
                  <span>Assigned System Permissions</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.permissions.map((p, idx) => (
                    <div key={idx} className="p-3.5 bg-gray-50 dark:bg-[#0F172A] rounded-2xl flex items-center gap-2 border border-charcoal/5 dark:border-white/5">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      <span className="text-xs font-semibold text-charcoal dark:text-gray-100">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

