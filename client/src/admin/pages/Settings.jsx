import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldAlert, Cpu, Database, Save } from 'lucide-react';

export default function Settings() {
  const [sysConfig, setSysConfig] = useState({
    siteName: 'AgriNova Platform',
    supportEmail: 'support@agrinova.com',
    currency: 'INR (₹)',
    maintenanceMode: false,
    sandboxMode: true,
    rateLimiting: true,
    smsGateway: 'Twilio API Node'
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert("System parameters committed to server configuration database!");
  };

  const handleToggleMaintenance = () => {
    setSysConfig(prev => {
      const nextMode = !prev.maintenanceMode;
      alert(`System Maintenance Mode is now ${nextMode ? 'ACTIVE (Platform lockdown)' : 'INACTIVE (Platform live)'}`);
      return { ...prev, maintenanceMode: nextMode };
    });
  };

  const handleToggleSandbox = () => {
    setSysConfig(prev => {
      const nextMode = !prev.sandboxMode;
      alert(`System transaction environment switched to ${nextMode ? 'SANDBOX (Mock Escrows)' : 'PRODUCTION (Bank/Razorpay Gateway)'}`);
      return { ...prev, sandboxMode: nextMode };
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">System Settings</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Configure platform maintenance status, transaction modes, and customer service contacts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick parameters status */}
        <div className="space-y-6">
          {/* Node telemetry status */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <Cpu className="w-4.5 h-4.5 text-primary" />
              <span>Platform Node Telemetry</span>
            </h3>
            <div className="grid grid-cols-1 gap-3.5 text-xs font-semibold text-gray-600 dark:text-gray-300 leading-none">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">DATABASE STATUS</span>
                <span className="text-green-700 dark:text-green-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Connected (MongoDB)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">API LATENCY</span>
                <span className="text-charcoal dark:text-gray-100 font-bold">42 ms (Stable)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">SERVER ENVIRONMENT</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                  sysConfig.sandboxMode ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-green-50 dark:bg-green-900/30 text-green-750 dark:text-green-400'
                }`}>
                  {sysConfig.sandboxMode ? 'TESTNET (SANDBOX)' : 'PRODUCTION'}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Operations */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
              <ShieldAlert className="w-4.5 h-4.5 text-primary" />
              <span>Emergency Controls</span>
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleToggleMaintenance}
                className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                  sysConfig.maintenanceMode
                    ? 'bg-red-600 text-white border-red-650 hover:bg-red-700'
                    : 'bg-white dark:bg-[#1E293B] text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/30'
                } focus:outline-none uppercase tracking-wide`}
              >
                {sysConfig.maintenanceMode ? 'Disable Maintenance lockdown' : 'Trigger Maintenance lockdown'}
              </button>
              <button
                onClick={handleToggleSandbox}
                className="w-full py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-xs font-extrabold transition-all focus:outline-none uppercase tracking-wide"
              >
                {sysConfig.sandboxMode ? 'Switch to Production Payouts' : 'Switch to Sandbox Payouts'}
              </button>
            </div>
          </div>
        </div>

        {/* Global Settings Form */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-4">
            <SettingsIcon className="w-4.5 h-4.5 text-primary" />
            <span>Platform Variables</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-4.5 text-xs font-semibold text-gray-650">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold block uppercase">SITE NAME</label>
                <input
                  type="text"
                  required
                  value={sysConfig.siteName}
                  onChange={(e) => setSysConfig(prev => ({ ...prev, siteName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold block uppercase">SUPPORT EMAIL</label>
                <input
                  type="email"
                  required
                  value={sysConfig.supportEmail}
                  onChange={(e) => setSysConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold block uppercase">CURRENCY SYMBOL</label>
                <input
                  type="text"
                  required
                  value={sysConfig.currency}
                  onChange={(e) => setSysConfig(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold block uppercase">SMS TELECOM GATEWAY</label>
                <input
                  type="text"
                  required
                  value={sysConfig.smsGateway}
                  onChange={(e) => setSysConfig(prev => ({ ...prev, smsGateway: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center">
                <input
                  id="rate-limiting"
                  type="checkbox"
                  checked={sysConfig.rateLimiting}
                  onChange={(e) => setSysConfig(prev => ({ ...prev, rateLimiting: e.target.checked }))}
                  className="h-4.5 w-4.5 rounded border-charcoal/10 dark:border-white/10 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                />
                <label htmlFor="rate-limiting" className="ml-2.5 text-xs font-bold text-charcoal dark:text-gray-100 select-none cursor-pointer">
                  Enable API Rate Limiting protection (100 req/min/IP)
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold uppercase tracking-wide rounded-xl shadow-md transition-all flex items-center gap-1.5 focus:outline-none"
            >
              <Save className="w-4 h-4" />
              <span>Save System Variables</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

