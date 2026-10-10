import React, { useState } from 'react';
import { CloudSun, Search, Plus, Trash2, Power, Settings } from 'lucide-react';

export default function WeatherManagement() {
  const [stations, setStations] = useState([
    { id: 'WST-801', name: 'Nagpur East Agro Station', region: 'Nagpur, MH', temp: '34°C', moisture: '62%', status: 'Online', sensorType: 'Moisture + Soil pH' },
    { id: 'WST-802', name: 'Karnal Rice-Belt Station', region: 'Karnal, HR', temp: '29°C', moisture: '75%', status: 'Online', sensorType: 'Precipitation Radar' },
    { id: 'WST-803', name: 'Ratnagiri Orchards Node', region: 'Ratnagiri, MH', temp: '31°C', moisture: '82%', status: 'Offline', sensorType: 'Humidity Monitor' },
    { id: 'WST-804', name: 'Indore Plateau Telemetry', region: 'Indore, MP', temp: '33°C', moisture: '58%', status: 'Online', sensorType: 'Soil pH + UV Rating' }
  ]);

  const [newStation, setNewStation] = useState({ name: '', region: '', sensorType: 'Moisture + Soil pH' });

  const handleToggleStatus = (id) => {
    const updated = stations.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Online' ? 'Offline' : 'Online';
        return { ...s, status: nextStatus };
      }
      return s;
    });
    setStations(updated);
  };

  const handleAddStation = (e) => {
    e.preventDefault();
    if (!newStation.name || !newStation.region) {
      alert("Please enter both Station Name and Region.");
      return;
    }
    const created = {
      id: `WST-${Math.floor(100 + Math.random() * 900)}`,
      name: newStation.name,
      region: newStation.region,
      temp: 'N/A',
      moisture: 'N/A',
      status: 'Online',
      sensorType: newStation.sensorType
    };
    setStations(prev => [...prev, created]);
    setNewStation({ name: '', region: '', sensorType: 'Moisture + Soil pH' });
    alert("New agricultural telemetry station mapped successfully.");
  };

  const handleDeleteStation = (id) => {
    if (confirm("Disconnect and remove this telemetry node configuration?")) {
      setStations(prev => prev.filter(s => s.id !== id));
      alert("Telemetry node removed.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Weather Telemetries</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Configure active regional telemetry nodes and map microclimate sensors for growers.</p>
      </div>

      {/* Grid: Config Station Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Config Station Form */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
            <Plus className="w-4.5 h-4.5 text-primary" />
            <span>Map New Station</span>
          </h3>
          <form onSubmit={handleAddStation} className="space-y-3.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block uppercase">STATION NAME</label>
              <input
                type="text"
                placeholder="e.g. Surat Southern Telemetry"
                value={newStation.name}
                onChange={(e) => setNewStation(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block uppercase">REGION TARGET</label>
              <input
                type="text"
                placeholder="e.g. Surat, Gujarat"
                value={newStation.region}
                onChange={(e) => setNewStation(prev => ({ ...prev, region: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold block uppercase">TELEMETRY SENSORS</label>
              <select
                value={newStation.sensorType}
                onChange={(e) => setNewStation(prev => ({ ...prev, sensorType: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-xs font-bold text-charcoal dark:text-gray-100"
              >
                <option value="Moisture + Soil pH">Moisture + Soil pH</option>
                <option value="Precipitation Radar">Precipitation Radar</option>
                <option value="Humidity Monitor">Humidity Monitor</option>
                <option value="Soil pH + UV Rating">Soil pH + UV Rating</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold uppercase tracking-wide rounded-xl shadow-md transition-all mt-2 cursor-pointer focus:outline-none"
            >
              Map Station
            </button>
          </form>
        </div>

        {/* Mapped Stations List */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 space-y-4">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2">
            <CloudSun className="w-4.5 h-4.5 text-primary" />
            <span>Active Microclimate Nodes</span>
          </h3>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 dark:bg-[#0F172A]/50 border-b border-gray-100 dark:border-gray-800">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap pl-6">Station ID</th>
                  <th className="p-4 whitespace-nowrap">Station Details</th>
                  <th className="p-4 whitespace-nowrap">Sensors Mapped</th>
                  <th className="p-4 whitespace-nowrap">Telemetry Readings</th>
                  <th className="p-4 whitespace-nowrap">Node Status</th>
                  <th className="p-4 text-right  whitespace-nowrap pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5 font-semibold text-gray-600 dark:text-gray-300">
                {stations.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-primary font-mono font-bold text-xs pl-6">{s.id}</td>
                    <td className="p-4">
                      <span className="text-charcoal dark:text-gray-100 font-bold block">{s.name}</span>
                      <span className="text-[10px] text-gray-400 font-semibold block">{s.region}</span>
                    </td>
                    <td className="p-4 text-xs font-medium">{s.sensorType}</td>
                    <td className="p-4">
                      <span className="text-charcoal dark:text-gray-100 font-bold block">T: {s.temp}</span>
                      <span className="text-[10px] text-primary font-bold block">M: {s.moisture}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'Online'
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50'
                          : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-155 dark:border-red-800/50'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap pr-6">
                      <button
                        onClick={() => handleToggleStatus(s.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          s.status === 'Online'
                            ? 'border-amber-100 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                            : 'border-green-155 dark:border-green-800/50 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
                        }`}
                        title={s.status === 'Online' ? 'Turn Off Station' : 'Turn On Station'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStation(s.id)}
                        className="p-1.5 rounded-lg border border-red-100 dark:border-red-800/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors focus:outline-none"
                        title="Delete telemetry mapping"
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

