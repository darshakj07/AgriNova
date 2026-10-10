import React from 'react';
import { useOutletContext } from 'react-router-dom';
import WeatherDashboard from '../../components/WeatherDashboard';

export default function Weather() {
  const { user } = useOutletContext();
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Climate & Soil Telemetry</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Real-time parameters gathered directly from soil sensors and satellite geocoding nodes.</p>
      </div>

      {/* Mount Shared Premium Weather Dashboard */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 overflow-hidden">
        <WeatherDashboard isDashboard={true} initialLocation={user?.farmLocation} />
      </div>
    </div>
  );
}


