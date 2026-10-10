import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Navigation, AlertCircle, Check, Loader2, Edit3 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icon reference in Vite bundling
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Helper component to center the map when location changes and invalidate size
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);

  // Force Leaflet to recalculate container dimensions when map mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// Map Click Listener to place marker
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function LocationPicker({ onChange, value }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Local location states
  const [location, setLocation] = useState(value || {
    address: '',
    city: '',
    state: '',
    lat: 22.7196, // default Indore
    lng: 75.8577,
    selected: false
  });

  // Map settings
  const [mapCenter, setMapCenter] = useState([location.lat, location.lng]);
  const [mapZoom, setMapZoom] = useState(13);
  
  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const dropdownRef = useRef(null);

  // Sync state with parent component
  const updateLocationState = (newLoc) => {
    setLocation(newLoc);
    if (onChange) {
      onChange(newLoc);
    }
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reverse geocoding function via OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Failed to resolve coordinates to address.');
      
      const data = await response.json();
      const addr = data.address || {};
      
      // Extract city, prioritizing local designations
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
      const state = addr.state || '';
      
      // Construct a clean readable address line
      const formattedAddress = data.display_name || `${addr.road || ''}${addr.neighbourhood ? ', ' + addr.neighbourhood : ''}`;

      updateLocationState({
        address: formattedAddress,
        city,
        state,
        lat,
        lng,
        selected: true
      });
      setMapCenter([lat, lng]);
    } catch (err) {
      setError('Error resolving address. Please try selecting again or input manually.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // geocoding search for mapping
  const handleSearchAddress = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setError('');
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Search failed.');
      
      const data = await response.json();
      setSearchResults(data);
      if (data.length === 0) {
        setError('No matching places found. Try refining search.');
      }
    } catch (err) {
      setError('Search failed. Please check your network connection.');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const addr = result.address || {};
    const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
    const state = addr.state || '';
    
    updateLocationState({
      address: result.display_name,
      city,
      state,
      lat,
      lng,
      selected: true
    });
    setMapCenter([lat, lng]);
    setMapZoom(16);
    setSearchResults([]);
    setSearchQuery('');
  };

  // Browser Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser geolocation is not supported on this device.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          setError('Location permission denied. Please enable permission or select on map.');
        } else if (err.code === 2) {
          setError('Location source unavailable. Please select on map.');
        } else {
          setError('Location acquisition timed out. Please try again.');
        }
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapClick = (latlng) => {
    reverseGeocode(latlng.lat, latlng.lng);
  };

  const handleManualFieldChange = (field, val) => {
    const updated = {
      ...location,
      [field]: val,
      selected: true
    };
    updateLocationState(updated);
  };

  return (
    <div className="space-y-4">
      {/* Search and Detect controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchAddress} className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search farm address, village, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/40 text-xs font-semibold text-charcoal dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Locate Button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={loading}
          className="py-2.5 px-4 rounded-2xl bg-primary/10 hover:bg-primary/15 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>Detect Location</span>
        </button>
      </div>

      {/* Dropdown Suggestions List */}
      {searchResults.length > 0 && (
        <div 
          ref={dropdownRef}
          className="relative z-20"
        >
          <div className="absolute top-0 left-0 right-0 bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-gray-50 text-xs font-semibold text-charcoal dark:text-gray-100">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(result)}
                className="w-full p-3 px-4 text-left hover:bg-primary/5 transition-colors block truncate"
              >
                📍 {result.display_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-800 text-[11px] font-semibold">
          <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Inline Interactive Leaflet Map */}
      <div className="h-[280px] sm:h-[320px] w-full rounded-2xl overflow-hidden border border-gray-150 relative z-0 shadow-xs">
        <MapContainer
          key="static-inline-map"
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {location.selected && (
            <Marker position={[location.lat, location.lng]} icon={defaultIcon} />
          )}
          <MapClickHandler onMapClick={handleMapClick} />
          <MapController center={mapCenter} zoom={mapZoom} />
        </MapContainer>
        
        {/* Helper overlay */}
        <div className="absolute bottom-2 left-2 bg-charcoal/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md pointer-events-none z-10">
          🖱️ Click anywhere on map to position marker
        </div>
      </div>

      {/* Selected/Editable details fields */}
      <div className="p-5 bg-[#F8FAF5] dark:bg-[#0F172A] rounded-3xl border border-primary/10 dark:border-primary/5 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/10 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
            Farm Coordinates Configured
          </span>
          {location.selected ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
              <Check className="w-4.5 h-4.5" /> Set & Ready
            </span>
          ) : (
            <span className="text-gray-400 font-bold flex items-center gap-1 text-[11px]">
              📍 Marker Not Set
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[9px] text-gray-400 uppercase font-bold flex items-center gap-1">
              <Edit3 className="w-3 h-3 text-primary" /> Farm Address / Landmark / Village
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Patil Farms, Near Hanuman Mandir, Village Palasia"
              value={location.address}
              onChange={(e) => handleManualFieldChange('address', e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-[#1E293B] border border-gray-150 focus:outline-none focus:border-primary/40 rounded-xl text-xs font-semibold text-charcoal dark:text-gray-100 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-gray-400 uppercase font-bold">City / Tehsil / District</label>
            <input
              type="text"
              required
              placeholder="e.g. Indore"
              value={location.city}
              onChange={(e) => handleManualFieldChange('city', e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-[#1E293B] border border-gray-150 focus:outline-none focus:border-primary/40 rounded-xl text-xs font-semibold text-charcoal dark:text-gray-100 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-gray-400 uppercase font-bold">State</label>
            <input
              type="text"
              required
              placeholder="e.g. Madhya Pradesh"
              value={location.state}
              onChange={(e) => handleManualFieldChange('state', e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-[#1E293B] border border-gray-150 focus:outline-none focus:border-primary/40 rounded-xl text-xs font-semibold text-charcoal dark:text-gray-100 transition-all"
            />
          </div>

          <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1 font-mono text-[9px] text-gray-400 font-bold border-t border-gray-100 dark:border-gray-800">
            <span>LATITUDE: {location.lat ? location.lat.toFixed(6) : 'N/A'}</span>
            <span>LONGITUDE: {location.lng ? location.lng.toFixed(6) : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

