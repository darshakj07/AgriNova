import React from 'react';
import { useOutletContext } from 'react-router-dom';
import WeatherDashboard from '../../components/WeatherDashboard';

export default function Weather() {
  const { user } = useOutletContext();
  return (
    <div className="w-full">
      <WeatherDashboard isDashboard={true} initialLocation={user?.city || user?.companyLocation} />
    </div>
  );
}

