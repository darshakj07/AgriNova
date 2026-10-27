import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Shield, Bell, Globe, Save, Lock, Smartphone, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile'); // profile | security | notifications | localization
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const { user, updateUser } = useOutletContext();
  const { currentLang, changeLanguage, languages } = useLanguage();
  const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Form states populated from context
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '9876543210',
    farmName: user?.farmName || 'GreenValley',
    farmLocation: user?.farmLocation || user?.city || 'Indore, MP',
    farmArea: user?.farmAcres || user?.farmArea || '15 Acres',
    primaryCrops: user?.primaryCrops || 'Soybean, Wheat'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailBids: true,
    smsBids: false,
    emailOrders: true,
    smsOrders: true,
    weeklyReport: true,
    salinityAlerts: true
  });

  const [localization, setLocalization] = useState({
    language: currentLang,
    areaUnit: 'Acres',
    tempUnit: 'Celsius'
  });

  useEffect(() => {
    setLocalization(prev => ({ ...prev, language: currentLang }));
  }, [currentLang]);

  // Load initial settings
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '9876543210',
        farmName: user.farmName || 'GreenValley',
        farmLocation: user.farmLocation || user.city || 'Indore, MP',
        farmArea: user.farmAcres || user.farmArea || '15 Acres',
        primaryCrops: user.primaryCrops || 'Soybean, Wheat'
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone,
          farmName: profileForm.farmName,
          farmLocation: profileForm.farmLocation,
          farmAcres: parseFloat(profileForm.farmArea) || 0,
          primaryCrops: profileForm.primaryCrops
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
      
      setSuccessMsg('Profile settings and farm details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      alert(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    setLoading(true);
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password.');
      }

      setSuccessMsg('Security credentials updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      alert(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Notification parameters saved.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 800);
  };

  const handleLocalizationSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    if (localization.language) {
      changeLanguage(localization.language);
    }

    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Display and language standards updated.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Settings</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Manage credentials, farm configurations, metrics telemetry, and alerts.</p>
      </div>

      {/* Main Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Tabs List */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-4 h-fit space-y-1.5">
          <button
            onClick={() => { setActiveTab('profile'); setSuccessMsg(''); }}
            className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all ${
              activeTab === 'profile'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Farm Details</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('security'); setSuccessMsg(''); }}
            className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all ${
              activeTab === 'security'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security Settings</span>
          </button>

          <button
            onClick={() => { setActiveTab('notifications'); setSuccessMsg(''); }}
            className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all ${
              activeTab === 'notifications'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications Alerts</span>
          </button>

          <button
            onClick={() => { setActiveTab('localization'); setSuccessMsg(''); }}
            className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all ${
              activeTab === 'localization'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Localization & Units</span>
          </button>
        </div>

        {/* Right Side: Active Settings Form Container */}
        <div className="lg:col-span-3 bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 relative">
          
          {/* Action Success Toast message */}
          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold flex items-center gap-2 animate-fade-in shadow-sm">
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form rendering */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100">Profile & Farm Details</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Manage your standard credentials and geographical parameters.</p>
              </div>

              {/* Input grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">First Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Last Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled
                    value={profileForm.email}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                  />
                </div>

                <div className="sm:col-span-2 my-2 border-t border-gray-50 pt-4">
                  <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100">Farm Credentials</h4>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">Parameters verified for mandi listing catalogs.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Farm Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.farmName}
                    onChange={(e) => setProfileForm({ ...profileForm, farmName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Farm Location</label>
                  <input
                    type="text"
                    required
                    value={profileForm.farmLocation}
                    onChange={(e) => setProfileForm({ ...profileForm, farmLocation: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Farm Area</label>
                  <input
                    type="text"
                    required
                    value={profileForm.farmArea}
                    onChange={(e) => setProfileForm({ ...profileForm, farmArea: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Primary Crops</label>
                  <input
                    type="text"
                    required
                    value={profileForm.primaryCrops}
                    onChange={(e) => setProfileForm({ ...profileForm, primaryCrops: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-4 border-t border-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100">Security Settings</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Manage portal credentials and authentication layers.</p>
              </div>

              <div className="space-y-5 max-w-md">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationsSubmit} className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100">Notification Alerts</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Toggle what system and bid updates are forwarded to you.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">Bid Alert Emails</h4>
                    <p className="text-xs text-gray-400 font-semibold">Receive direct email digests as soon as buyer bids are entered.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailBids}
                      onChange={(e) => setNotifications({ ...notifications, emailBids: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#1E293B] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>

                <div className="flex items-start justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">SMS Bid Alerts</h4>
                    <p className="text-xs text-gray-400 font-semibold">Instant text updates to mobile phone number for negotiations.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.smsBids}
                      onChange={(e) => setNotifications({ ...notifications, smsBids: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#1E293B] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>

                <div className="flex items-start justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">Order Shipping Alerts</h4>
                    <p className="text-xs text-gray-400 font-semibold">Track logistics updates, dispatch reviews, and escrow releases.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailOrders}
                      onChange={(e) => setNotifications({ ...notifications, emailOrders: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#1E293B] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>

                <div className="flex items-start justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">NPK Probe Soil Alerts</h4>
                    <p className="text-xs text-gray-400 font-semibold">Get high-priority alerts regarding soil humidity, salinity, or NPK drops.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.salinityAlerts}
                      onChange={(e) => setNotifications({ ...notifications, salinityAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#1E293B] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'localization' && (
            <form onSubmit={handleLocalizationSubmit} className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100">Localization & Units</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Select preferred language and unit parameters for dashboard statistics.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">System Language</label>
                  <select
                    value={localization.language}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setLocalization({ ...localization, language: newLang });
                      changeLanguage(newLang);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:border-primary/30 cursor-pointer notranslate"
                  >
                    {languages.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.native} ({l.label})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Land Area Unit</label>
                  <select
                    value={localization.areaUnit}
                    onChange={(e) => setLocalization({ ...localization, areaUnit: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:border-primary/30 cursor-pointer"
                  >
                    <option value="Acres">Acres</option>
                    <option value="Hectares">Hectares</option>
                    <option value="Bighas">Bighas</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Atmospheric Temp Unit</label>
                  <select
                    value={localization.tempUnit}
                    onChange={(e) => setLocalization({ ...localization, tempUnit: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:border-primary/30 cursor-pointer"
                  >
                    <option value="Celsius">Celsius (°C)</option>
                    <option value="Fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Localization</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}



