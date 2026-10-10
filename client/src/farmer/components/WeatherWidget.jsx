import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Droplets, Wind, ArrowRight, Sprout, Cloud, CloudRain } from 'lucide-react';

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

export default function WeatherWidget({ user }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWidgetWeather = async () => {
      const locationStr = user?.farmLocation;
      if (!locationStr) return;

      // Parse coordinates
      const match = locationStr.match(/\(Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)\)/i);
      let latitude = 22.7196; // Fallback Indore
      let longitude = 75.8577;
      let addressName = "Indore";

      const addressIdx = locationStr.indexOf('(');
      if (addressIdx !== -1) {
        addressName = locationStr.substring(0, addressIdx).trim();
      } else {
        addressName = locationStr.trim();
      }

      if (match) {
        latitude = parseFloat(match[1]);
        longitude = parseFloat(match[2]);
      } else {
        // Geocode if no coordinates
        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(addressName)}&count=1`
          );
          const geoData = await geoRes.json();
          if (geoData.results?.length) {
            latitude = geoData.results[0].latitude;
            longitude = geoData.results[0].longitude;
            addressName = geoData.results[0].name;
          }
        } catch (e) {
          console.error("Geocoding failed for widget", e);
        }
      }

      try {
        setLoading(true);
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code`
        );
        const data = await res.json();
        setWeatherData({
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          windDir: data.current.wind_direction_10m,
          code: data.current.weather_code,
          address: addressName
        });
      } catch (error) {
        console.error("Error fetching widget weather:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWidgetWeather();
  }, [user?.farmLocation]);

  const temp = weatherData ? `${weatherData.temp}°` : "32°";
  const desc = weatherData ? weatherConditions[weatherData.code] || "Scattered Clouds" : "Scattered Clouds";
  const humidity = weatherData ? `${weatherData.humidity}%` : "38%";
  const wind = weatherData ? `${weatherData.windSpeed} km/h` : "12 km/h";
  const windDir = weatherData ? ` ${weatherData.windDir}°` : " NW";
  const nodeName = weatherData ? weatherData.address : "Indore Region";

  // Select suitable icon
  let WeatherIcon = Sun;
  if (weatherData) {
    if ([51, 53, 55, 61, 63, 65, 80].includes(weatherData.code)) {
      WeatherIcon = CloudRain;
    } else if ([1, 2, 3, 45, 48].includes(weatherData.code)) {
      WeatherIcon = Cloud;
    }
  }

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 flex flex-col justify-between h-full min-h-[300px] relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-white dark:bg-[#1E293B]/70 flex items-center justify-center z-10">
          <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="max-w-[70%]">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Telemetry Sensor</h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">{nodeName} Node</p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-bold border border-green-200 uppercase tracking-wide shrink-0">
          Active
        </span>
      </div>

      {/* Main Temperature and Icon display */}
      <div className="my-6 flex items-center justify-between">
        <div>
          <div className="flex items-baseline">
            <span className="font-display font-extrabold text-5xl text-charcoal dark:text-gray-100">{temp}</span>
            <span className="font-display font-bold text-xl text-gray-400">C</span>
          </div>
          <span className="text-sm font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-full mt-2 inline-block max-w-[170px] truncate">
            {desc}
          </span>
        </div>
        <WeatherIcon className="w-16 h-16 text-amber-500 animate-spin-slow shrink-0" />
      </div>

      {/* Mini details list */}
      <div className="space-y-3 pt-4 border-t border-gray-50 text-sm">
        
        {/* NPK state */}
        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Sprout className="w-4 h-4 text-green-500" />
            NPK Nitrogen
          </span>
          <span className="font-bold text-charcoal dark:text-gray-100">Optimal (42 mg/kg)</span>
        </div>

        {/* Moisture state */}
        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Droplets className="w-4 h-4 text-blue-500" />
            Soil Moisture
          </span>
          <span className="font-bold text-charcoal dark:text-gray-100">{humidity} (Optimum)</span>
        </div>

        {/* Wind speed */}
        <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Wind className="w-4 h-4 text-amber-500" />
            Wind Velocity
          </span>
          <span className="font-bold text-charcoal dark:text-gray-100 truncate max-w-[120px]">{wind}{windDir}</span>
        </div>

      </div>

      {/* Redirect Footer */}
      <Link 
        to="/farmer/weather"
        className="mt-6 w-full py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-charcoal dark:text-gray-100/70 hover:text-primary text-sm font-bold transition-all text-center flex items-center justify-center gap-1.5 group"
      >
        <span>Full weather telemetry</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>

    </div>
  );
}



