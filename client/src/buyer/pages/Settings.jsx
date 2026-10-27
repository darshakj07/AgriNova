import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Globe, Key, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Settings() {
  const { currentLang, changeLanguage, languages } = useLanguage();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [whatsappNotifs, setWhatsappNotifs] = useState(false);
  const [language, setLanguage] = useState(currentLang);

  useEffect(() => {
    setLanguage(currentLang);
  }, [currentLang]);

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [success, setSuccess] = useState(false);

  const handleUpdateNotifs = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      alert("Passwords do not match!");
      return;
    }
    setSuccess(true);
    setPasswordForm({ current: '', next: '', confirm: '' });
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Account Settings</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Customize notification channels, preferred language registers, and credentials.</p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary shrink-0" />
          <span>Settings preferences updated successfully!</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Toggles: Notification and Language */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notifications Toggles */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm uppercase tracking-wider border-b border-gray-50 dark:border-gray-800 pb-3 flex items-center gap-2">
              <Bell className="w-4.5 h-4.5 text-primary" />
              <span>Notification channels</span>
            </h3>
            
            <form onSubmit={handleUpdateNotifs} className="space-y-4 pt-2">
              <div className="flex items-center justify-between py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800">
                <div>
                  <span className="text-charcoal dark:text-gray-100 block">Email Alerts</span>
                  <span className="text-xs text-gray-400 font-semibold font-medium mt-0.5">Sends bid receipts, orders finalization invoices.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="h-4.5 w-4.5 rounded bg-white dark:bg-[#0F172A] border-charcoal/10 dark:border-white/10 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800">
                <div>
                  <span className="text-charcoal dark:text-gray-100 block">SMS Alerts</span>
                  <span className="text-xs text-gray-400 font-semibold font-medium mt-0.5">Sends shipping transit milestones, load dispatches.</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsNotifs}
                  onChange={(e) => setSmsNotifs(e.target.checked)}
                  className="h-4.5 w-4.5 rounded bg-white dark:bg-[#0F172A] border-charcoal/10 dark:border-white/10 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                <div>
                  <span className="text-charcoal dark:text-gray-100 block">WhatsApp Alerts</span>
                  <span className="text-xs text-gray-400 font-semibold font-medium mt-0.5">Instant counter-offer alerts directly on mobile chat.</span>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappNotifs}
                  onChange={(e) => setWhatsappNotifs(e.target.checked)}
                  className="h-4.5 w-4.5 rounded bg-white dark:bg-[#0F172A] border-charcoal/10 dark:border-white/10 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="mt-4 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition-all uppercase tracking-wider focus:outline-none"
              >
                Save Channels Configs
              </button>
            </form>
          </div>

          {/* Languages select */}
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm uppercase tracking-wider border-b border-gray-50 dark:border-gray-800 pb-3 flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-primary" />
              <span>System Language</span>
            </h3>

            <div className="space-y-4 pt-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Preferred Register</label>
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLanguage(newLang);
                  changeLanguage(newLang);
                }}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-semibold text-charcoal dark:text-gray-100 notranslate cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.label})
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Right Password settings */}
        <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-6 h-fit">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center gap-2">
            <Key className="w-4.5 h-4.5 text-primary" />
            <span>Credentials Settings</span>
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.current}
                onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-semibold text-charcoal dark:text-gray-100"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                required
                value={passwordForm.next}
                onChange={(e) => setPasswordForm(p => ({ ...p, next: e.target.value }))}
                className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-semibold text-charcoal dark:text-gray-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-sm font-semibold text-charcoal dark:text-gray-100"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition-all uppercase tracking-wider shadow-sm focus:outline-none"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

