import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, CloudRain, Wind, Droplets, Thermometer, AlertCircle, Compass, LineChart, CheckCircle2 } from 'lucide-react';

export default function WeatherDashboard({ isDashboard = false, initialLocation }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const getMockWeather = (cityName, countryName = "India") => {
    const cleanName = cityName ? cityName.split(',')[0].split('(')[0].trim() : "Indore";
    const seed = cleanName.length;
    const baseTemp = 28 + (seed % 7); // 28 to 34
    const baseHumidity = 60 + (seed % 20); // 60 to 80
    const baseWind = 8 + (seed % 12); // 8 to 20
    const weatherCode = (seed % 3) === 0 ? 3 : (seed % 5 === 0 ? 61 : 1); // 3: Overcast, 61: Rain, 1: Clear
    
    const dailyTime = [];
    const dailyMax = [];
    const dailyMin = [];
    const dailyRain = [];
    
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dailyTime.push(d.toISOString().split('T')[0]);
      dailyMax.push(baseTemp + Math.sin(i) * 2 - (i * 0.5));
      dailyMin.push(baseTemp - 8 + Math.cos(i) * 1.5);
      dailyRain.push(Math.round((i * 15 + (seed * 7)) % 100));
    }

    return {
      city: cleanName,
      country: countryName || "India",
      current: {
        temperature_2m: baseTemp,
        relative_humidity_2m: baseHumidity,
        wind_speed_10m: baseWind,
        wind_direction_10m: 180 + (seed * 15) % 180,
        weather_code: weatherCode
      },
      daily: {
        time: dailyTime,
        temperature_2m_max: dailyMax.map(v => Math.round(v * 10) / 10),
        temperature_2m_min: dailyMin.map(v => Math.round(v * 10) / 10),
        precipitation_probability_max: dailyRain
      }
    };
  };

  const parseCoordinates = (locationStr) => {
    if (!locationStr) return null;
    const match = locationStr.match(/\(Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)\)/i);
    if (match) {
      return {
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2]),
      };
    }
    return null;
  };

  const getCityName = (locationStr) => {
    if (!locationStr) return "";
    const idx = locationStr.indexOf("(");
    if (idx !== -1) {
      return locationStr.substring(0, idx).trim();
    }
    return locationStr.trim();
  };

  const getWeatherForLocation = async (lat, lng, name, countryName = "") => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        const weatherData = await weatherRes.json();
        setWeather({
          ...weatherData,
          city: name,
          country: countryName,
        });
      } catch (innerErr) {
        console.warn("Forecast fetch failed or timed out, loading high-fidelity mock weather data", innerErr);
        const mock = getMockWeather(name, countryName);
        setWeather(mock);
      }
    } catch (error) {
      console.error("Error fetching weather for coordinates:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeather = async () => {
    if (!city) return;
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        const geoData = await geoRes.json();
        
        if (geoData.results?.length) {
          const { latitude, longitude, name, country } = geoData.results[0];
          await getWeatherForLocation(latitude, longitude, name, country);
        } else {
          console.warn("City search returned empty, loading fallback data");
          const mock = getMockWeather(city);
          setWeather(mock);
        }
      } catch (innerErr) {
        console.warn("Geocoding fetch failed or timed out, loading fallback data", innerErr);
        const mock = getMockWeather(city);
        setWeather(mock);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loc = initialLocation || "Surat, Gujarat";
    const coords = parseCoordinates(loc);
    const name = getCityName(loc);
    
    if (coords) {
      getWeatherForLocation(coords.latitude, coords.longitude, name);
    } else if (name) {
      setCity(name);
      const fetchGeocoded = async () => {
        try {
          setLoading(true);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);
          
          try {
            const geoRes = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`,
              { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            const geoData = await geoRes.json();
            if (geoData.results?.length) {
              const { latitude, longitude, name: geoName, country } = geoData.results[0];
              await getWeatherForLocation(latitude, longitude, geoName, country);
            } else {
              const mock = getMockWeather(name);
              setWeather(mock);
            }
          } catch (innerErr) {
            console.warn("Initial geocoding fetch failed, loading mock weather data", innerErr);
            const mock = getMockWeather(name);
            setWeather(mock);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchGeocoded();
    }
  }, [initialLocation]);
  // const forecastData = [
  //   { day: 'Mon', temp: '32° / 24°', icon: Sun, label: 'Sunny', rain: '5%' },
  //   { day: 'Tue', temp: '31° / 23°', icon: Sun, label: 'Sunny', rain: '10%' },
  //   { day: 'Wed', temp: '29° / 22°', icon: CloudRain, label: 'Showers', rain: '65%' },
  //   { day: 'Thu', temp: '28° / 21°', icon: CloudRain, label: 'Rainy', rain: '80%' },
  //   { day: 'Fri', temp: '30° / 23°', icon: Sun, label: 'Clear', rain: '15%' },
  // ];

  const soilMetrics = [
    { name: 'Moisture Depth 10cm', value: '38%', status: 'Optimal', color: 'text-green-600 bg-green-50 border-green-200' },
    { name: 'Moisture Depth 30cm', value: '44%', status: 'Optimal', color: 'text-green-600 bg-green-50 border-green-200' },
    { name: 'Soil Salinity', value: '1.2 dS/m', status: 'Safe', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { name: 'Nitrogen Content', value: '42 mg/kg', status: 'Moderate', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { name: 'Phosphorus Content', value: '28 mg/kg', status: 'High', color: 'text-green-600 bg-green-50 border-green-200' },
    { name: 'Potassium Content', value: '180 mg/kg', status: 'Optimal', color: 'text-green-600 bg-green-50 border-green-200' },
  ];

  const weatherConditions = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain",
  71: "Snow",
  80: "Rain Showers",
  95: "Thunderstorm"
};
const forecastDays =
  weather?.daily?.time?.map((date, index) => ({
    day: new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
    }),
    max: weather.daily.temperature_2m_max[index],
    min: weather.daily.temperature_2m_min[index],
    rain:
      weather.daily.precipitation_probability_max[index],
  })) || [];

const downloadCSV = () => {
  if (!forecastDays.length) {
    alert("Search a city first");
    return;
  }

  const headers = ["Day", "Max Temp", "Min Temp", "Rain Probability"];

  const rows = forecastDays.map((item) => [
    item.day,
    item.max,
    item.min,
    item.rain + "%"
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${city || "weather-forecast"}.csv`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

  return (
    <section id="weather" className={`${isDashboard ? 'py-2 bg-transparent' : 'py-24 bg-white dark:bg-[#1E293B]'} relative overflow-hidden`}>
      {/* Background blobs */}
      {!isDashboard && (
        <>
          <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      <div className={`${isDashboard ? 'max-w-full' : 'max-w-7xl px-4 sm:px-6 lg:px-8'} mx-auto relative z-10`}>
        
        {/* Section Header */}
        {!isDashboard && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold text-primary tracking-widest uppercase">Predictive Climate Advisory</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal dark:text-gray-100 mt-2 mb-4 leading-tight">
              Hyper-localized weather and soil intelligence
            </h2>
            <p className="text-base text-charcoal dark:text-gray-100-light font-normal">
              Micro-climate monitoring provides real-time updates directly from your crops. Never get caught off guard by sudden frost or flash droughts.
            </p>
          </div>
        )}
        <div className={`${isDashboard ? 'max-w-xl mb-6' : 'max-w-xl mx-auto mb-10'}`}>
  <div className="flex gap-3">
    <input
      type="text"
      placeholder="Search city (e.g. Surat)"
      value={city}
      onChange={(e) => setCity(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          getWeather();
        }
      }}
      className="flex-1 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0F172A] text-charcoal dark:text-gray-100 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
    />

    <button
      onClick={getWeather}
      className="px-6 py-3 bg-primary text-white rounded-xl font-semibold"
    >
      Search
    </button>
  </div>
</div>

        {/* Loading Animation */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto mb-10 p-8 rounded-3xl glassmorphism shadow-xl border border-charcoal/5 dark:border-white/5 flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="flex flex-col items-center gap-6">
                {/* Spinning Loader */}
                <div className="relative w-16 h-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-full h-full"
                  >
                    <div className="w-full h-full rounded-full border-4 border-primary/20 border-t-primary shadow-lg shadow-primary/20" />
                  </motion.div>
                </div>
                <div className="text-center">
                  <h3 className="font-display font-bold text-xl text-charcoal dark:text-gray-100 mb-2">Fetching Weather Data</h3>
                  <p className="text-sm text-charcoal dark:text-gray-100-light/70">Analyzing satellite data and soil metrics...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Preview Module */}
        {!loading && (
        <div className={`${isDashboard ? 'max-w-full' : 'max-w-5xl mx-auto'} rounded-3xl overflow-hidden glassmorphism shadow-xl border border-charcoal/5 dark:border-white/5`}>
          
          {/* Header & Tabs */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">AgriNova WeatherNode #08492</span>
              <h3 className="font-display font-bold text-2xl mt-1">Live Soil & Climate Center</h3>
            </div>
            {/* Tab Buttons */}
            <div className="flex bg-white/20 dark:bg-[#1E293B]/30 p-1.5 rounded-2xl border border-white/10 shrink-0">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-[#1E293B] text-primary shadow-md' : 'text-white/80 hover:text-white'}`}
              >
                Field Overview
              </button>
              <button 
                onClick={() => setActiveTab('forecast')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'forecast' ? 'bg-white dark:bg-[#1E293B] text-primary shadow-md' : 'text-white/80 hover:text-white'}`}
              >
                5-Day Forecast
              </button>
              <button 
                onClick={() => setActiveTab('soil')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'soil' ? 'bg-white dark:bg-[#1E293B] text-primary shadow-md' : 'text-white/80 hover:text-white'}`}
              >
                Soil Stratum
              </button>
            </div>
          </div>

          {/* Dynamic Content Panel */}
          <div className="p-6 md:p-8 bg-bg-base/40">
            <AnimatePresence mode="wait">
              
              {/* Tab 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {/* Left Column: Big Temp Weather */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-charcoal/5 dark:border-white/5 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-bold text-charcoal dark:text-gray-100">Air Temperature</h4>
                        <p className="text-xs text-charcoal dark:text-gray-100-light/70">{weather?.city
  ? `${weather.city}, ${weather.country}`
  : "Search a city"}</p>
                      </div>
                      <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />
                    </div>
                    <div className="my-8">
                      <div className="flex items-baseline">
                        <span className="font-display font-extrabold text-6xl text-charcoal dark:text-gray-100">{weather?.current?.temperature_2m ?? "--"}°</span>
                        <span className="font-display font-bold text-2xl text-charcoal dark:text-gray-100-light">C</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30 mt-2 inline-block">
                        {weatherConditions[weather?.current?.weather_code] || "Unknown"}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-charcoal/5 dark:border-white/5 flex justify-between text-xs text-charcoal dark:text-gray-100-light/80">
                      <span>Low: 24°C</span>
                      <span>High: 34°C</span>
                    </div>
                  </div>

                  {/* Middle Column: Core Telemetry Grid */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-charcoal/5 dark:border-white/5 shadow-sm grid grid-cols-2 gap-4">
                    <div className="flex flex-col justify-between p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Droplets className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Humidity</span>
                      </div>
                      <div>
                        <span className="font-display font-bold text-xl text-charcoal dark:text-gray-100">{weather?.current?.relative_humidity_2m ?? "--"}%</span>
                        <span className="text-[10px] text-charcoal dark:text-gray-100-light/60 block mt-0.5">Optimum range</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-3 rounded-xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                      <div className="flex items-center gap-2 text-amber-600 mb-2">
                        <Wind className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Wind</span>
                      </div>
                      <div>
                        <span className="font-display font-bold text-xl text-charcoal dark:text-gray-100">{weather?.current?.wind_speed_10m ?? "--"} km/h</span>
                        <span className="text-[10px] text-charcoal dark:text-gray-100-light/60 block mt-0.5">Vector: {weather?.current?.wind_direction_10m ?? "--"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-3 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <Thermometer className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Feels Like</span>
                      </div>
                      <div>
                        <span className="font-display font-bold text-xl text-charcoal dark:text-gray-100">{weather?.current?.temperature_2m ?? "--"}°C</span>
                        <span className="text-[10px] text-charcoal dark:text-gray-100-light/60 block mt-0.5">Root level</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                      <div className="flex items-center gap-2 text-emerald-600 mb-2">
                        <Compass className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Rain Prob</span>
                      </div>
                      <div>
                        <span className="font-display font-bold text-xl text-charcoal dark:text-gray-100">{weather?.daily?.precipitation_probability_max?.[0] ?? "--"}%</span>
                        <span className="text-[10px] text-charcoal dark:text-gray-100-light/60 block mt-0.5">No alerts</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Warning Panel */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-charcoal/5 dark:border-white/5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-amber-600 mb-4">
                        <AlertCircle className="w-5 h-5" />
                        <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100">AI Advisory Action</h4>
                      </div>
                      <p className="text-xs text-charcoal dark:text-gray-100-light leading-relaxed mb-4">
                        A mild temperature surge is projected for Wed-Thu. Atmospheric moisture will drop, suggesting soil moisture preservation protocols.
                      </p>
                      <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-[11px] font-medium leading-normal flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                        <span>Recommended drip cycle increase of 6 min for Wheat Fields A4 and A5.</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md">
                      Approve Irrigation Change
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: FORECAST */}
              {activeTab === 'forecast' && (
                <motion.div
                  key="forecast"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {forecastDays.map((item, idx) => {
                      const Icon = CloudRain;
                      return (
                        <div key={idx} className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-charcoal/5 dark:border-white/5 shadow-sm text-center flex flex-col items-center justify-between">
                          <span className="text-xs font-bold text-charcoal dark:text-gray-100-light/50 uppercase">{item.day}</span>
                          <div className="my-4 p-3 bg-primary/5 rounded-full text-primary">
                            <Icon className="w-8 h-8" />
                          </div>
                          <div>
                            <span className="font-display font-extrabold text-sm text-charcoal dark:text-gray-100 block">{item.max}° / {item.min}°</span>
                            <span className="text-[10px] text-charcoal dark:text-gray-100-light/60 font-medium block mt-1">Forecast</span>
                          </div>
                          <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/50 mt-3 block">
                           {item.rain}% Rain
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-white dark:bg-[#1E293B]/80 border border-charcoal/5 dark:border-white/5 rounded-2xl p-4 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-charcoal dark:text-gray-100-light font-medium flex items-center gap-2">
                      <LineChart className="w-4 h-4 text-primary" />
                      Satellite data indicates high solar radiation index (UV-A) starting Wednesday.
                    </span>
                    <button
  onClick={downloadCSV}
  className="px-4 py-2 rounded-xl border border-primary/20 text-primary text-xs font-bold hover:bg-primary/5 transition-all"
>
  Download CSV Forecast
</button>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: SOIL */}
              {activeTab === 'soil' && (
                <motion.div
                  key="soil"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-6"
                >
                  {soilMetrics.map((metric, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-charcoal/5 dark:border-white/5 shadow-sm flex flex-col justify-between">
                      <span className="text-xs font-bold text-charcoal dark:text-gray-100-light/60 block">{metric.name}</span>
                      <div className="flex items-baseline gap-2 mt-4 mb-2">
                        <span className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">{metric.value}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${metric.color}`}>
                          {metric.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-charcoal dark:text-gray-100-light/40 font-medium">Last calibrated: 12h ago</span>
                    </div>
                  ))}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
        )}

      </div>
    </section>
  );
}

