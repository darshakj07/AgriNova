import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { ShieldCheck, MessageSquare, ArrowRight, TrendingUp, ShoppingCart, Award, ClipboardList } from 'lucide-react';

const getLastSixMonths = () => {
  const months = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    months.push(m.toLocaleString('default', { month: 'short' }));
  }
  return months;
};

const getOrderMonth = (order) => {
  if (order.createdAt) {
    return new Date(order.createdAt).toLocaleString('default', { month: 'short' });
  }
  if (order.date) {
    const part = order.date.split(' ')[0];
    return part;
  }
  return 'Jun';
};

const weatherConditions = {
  0: { desc: "Sunny & Dry", emoji: "☀️" },
  1: { desc: "Mainly Clear", emoji: "🌤️" },
  2: { desc: "Partly Cloudy", emoji: "⛅" },
  3: { desc: "Overcast", emoji: "☁️" },
  45: { desc: "Foggy", emoji: "🌫️" },
  48: { desc: "Foggy", emoji: "🌫️" },
  51: { desc: "Light Drizzle", emoji: "🌧️" },
  53: { desc: "Moderate Drizzle", emoji: "🌧️" },
  55: { desc: "Dense Drizzle", emoji: "🌧️" },
  61: { desc: "Slight Rain", emoji: "🌧️" },
  63: { desc: "Moderate Rain", emoji: "🌧️" },
  65: { desc: "Heavy Rain", emoji: "🌧️" },
  71: { desc: "Snowing", emoji: "❄️" },
  80: { desc: "Rain Showers", emoji: "🌦️" },
  95: { desc: "Thunderstorm", emoji: "⛈️" }
};

export default function Dashboard() {
  const { user } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [recentOrders, setRecentOrders] = useState([]);

  const [buyerStats, setBuyerStats] = useState([
    { id: 1, name: 'Total Purchases', value: '₹0', change: 'Completed transaction value' },
    { id: 2, name: 'Active Bids', value: '0 Bids', change: 'Direct bids awaiting response' },
    { id: 3, name: 'Completed Orders', value: '0 Orders', change: 'Fulfillment completed' },
    { id: 4, name: 'Verified Suppliers', value: '0 Farmers', change: 'Direct trade partners' }
  ]);
  const [activeBidsList, setActiveBidsList] = useState([]);
  const [purchaseChartData, setPurchaseChartData] = useState([
    { month: 'Jan', val: 10, amt: '₹0' },
    { month: 'Feb', val: 10, amt: '₹0' },
    { month: 'Mar', val: 10, amt: '₹0' },
    { month: 'Apr', val: 10, amt: '₹0' },
    { month: 'May', val: 10, amt: '₹0' },
    { month: 'Jun', val: 10, amt: '₹0' }
  ]);

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchBuyerWeather = async () => {
      const cityName = user.city || user.companyLocation || 'Indore';
      let latitude = 22.7196;
      let longitude = 75.8577;
      let addressName = cityName;

      try {
        setWeatherLoading(true);
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`
        );
        const geoData = await geoRes.json();
        if (geoData.results?.length) {
          latitude = geoData.results[0].latitude;
          longitude = geoData.results[0].longitude;
          addressName = geoData.results[0].name;
        }

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=precipitation_probability`
        );
        const data = await res.json();
        
        const rainProb = data.hourly?.precipitation_probability?.[0] || 0;

        setWeatherData({
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          code: data.current.weather_code,
          address: addressName,
          rainProbability: rainProb
        });
      } catch (error) {
        console.error("Error fetching buyer weather:", error);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchBuyerWeather();
  }, [user]);

  const fetchRecentOrders = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/api/orders?limit=3`, {
        headers: {
          'x-user-id': user.id || user._id
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const mapped = data.orders.map(o => ({
          id: o.id,
          farmer: o.farmer,
          crop: o.product.name,
          qty: o.product.qty,
          total: o.product.total,
          status: o.status
        }));
        setRecentOrders(mapped);
      }
    } catch (err) {
      console.error('Error fetching recent orders:', err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/orders`, {
          headers: {
            'x-user-id': user.id || user._id
          }
        });
        const data = await response.json();
        
        // Load bids from localStorage
        const localBids = JSON.parse(localStorage.getItem('agrinova_bids') || '[]');
        setActiveBidsList(localBids.slice(0, 3).map((b, idx) => ({
          id: b.id || idx,
          farmer: b.farmer || 'AgriNova Farmer',
          crop: b.cropName || b.crop,
          bidRate: b.bidRate || b.price,
          qty: b.qty,
          status: b.status || 'Pending'
        })));

        if (response.ok && data.success) {
          const allOrders = data.orders;
          const completed = allOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered');
          const completedCount = completed.length;
          
          let totalPurchased = 0;
          completed.forEach(o => {
            const valStr = o.product?.total || o.price || '0';
            const val = parseFloat(valStr.toString().replace(/[^0-9.]/g, ''));
            if (!isNaN(val)) totalPurchased += val;
          });

          const uniqueFarmers = new Set(allOrders.map(o => o.farmerId?.toString() || o.farmer));

          setBuyerStats([
            { id: 1, name: 'Total Purchases', value: `₹${totalPurchased.toLocaleString()}`, change: 'Completed contract escrow value' },
            { id: 2, name: 'Active Bids', value: `${localBids.length} Bids`, change: `${localBids.filter(b => b.status === 'Pending').length} awaiting response` },
            { id: 3, name: 'Completed Orders', value: `${completedCount} Orders`, change: `${allOrders.filter(o => o.status !== 'Completed' && o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Rejected').length} in transit` },
            { id: 4, name: 'Verified Suppliers', value: `${uniqueFarmers.size} Farmers`, change: 'Direct growers traded' }
          ]);

          // Calculate chart data from completed orders
          const monthsList = getLastSixMonths();
          const totals = {};
          monthsList.forEach(m => { totals[m] = 0; });

          completed.forEach(o => {
            const m = getOrderMonth(o);
            const valStr = o.product?.total || o.price || '0';
            const val = parseFloat(valStr.toString().replace(/[^0-9.]/g, ''));
            if (!isNaN(val) && totals[m] !== undefined) {
              totals[m] += val;
            }
          });

          const maxTotal = Math.max(...Object.values(totals), 0);
          const scaledChartData = monthsList.map(m => {
            const totalVal = totals[m];
            const percent = maxTotal > 0 ? (totalVal / maxTotal) * 90 + 10 : 10;
            
            let amtFormatted = '₹0';
            if (totalVal >= 100000) {
              amtFormatted = `₹${(totalVal / 100000).toFixed(1)}L`;
            } else if (totalVal >= 1000) {
              amtFormatted = `₹${(totalVal / 1000).toFixed(0)}K`;
            } else {
              amtFormatted = `₹${totalVal}`;
            }

            return {
              month: m,
              val: percent,
              amt: amtFormatted
            };
          });
          setPurchaseChartData(scaledChartData);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };

    fetchDashboardStats();
    fetchRecentOrders();
  }, [user]);

  return (
    <div className="space-y-8">
      
      {/* Welcome Buyer Banner */}
      <div className="bg-primary bg-linear-to-r from-primary to-primary-dark rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-primary/10">
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 dark:bg-[#1E293B]/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#1E293B]/10 text-xs font-bold text-secondary border border-white/10 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 fill-current" />
              Verified corporate buyer
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-none mb-2">
            Welcome back, {user?.firstName || 'Buyer'}!
          </h1>
          <p className="text-sm text-white/80 leading-relaxed">
            Verify crop quality metrics, place bids on direct farmer listings, and manage secure escrow payments under <strong className="text-white">{user?.companyName || 'Indore Wholesalers'}</strong>.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {buyerStats.map((stat) => (
          <div key={stat.id} className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{stat.name}</span>
              <span className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100 block mt-2">{stat.value}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary mt-4">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics chart and Mini Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Mock Analytics Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Purchase Expenses</h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Escrow transaction volumes across the last 6 months.</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-xs font-bold border border-primary/5">
              2026 Volume
            </span>
          </div>

          <div className="h-64 w-full flex items-end justify-between gap-3 pt-6 border-b border-gray-100 dark:border-gray-800">
            {purchaseChartData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                  {bar.amt}
                </span>
                <div 
                  className="w-full rounded-t-xl bg-linear-to-t from-primary/80 to-primary group-hover:from-primary group-hover:to-primary-dark transition-all duration-500 shadow-sm shadow-primary/10"
                  style={{ height: `${bar.val}%` }}
                />
                <span className="text-xs text-gray-400 font-semibold">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Weather Widget */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          {weatherLoading && (
            <div className="absolute inset-0 bg-white dark:bg-[#1E293B]/70 flex items-center justify-center z-10">
              <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Market Weather</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5 truncate max-w-[170px]">Live conditions in {weatherData?.address || 'Indore'}.</p>
              </div>
              <span className="text-xs font-bold text-gray-400">TODAY</span>
            </div>
            
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">
                  {weatherData ? (weatherConditions[weatherData.code]?.emoji || "â˜€ï¸") : "â˜€ï¸"}
                </span>
                <div>
                  <span className="text-3xl font-display font-extrabold text-charcoal dark:text-gray-100">
                    {weatherData ? `${weatherData.temp}°C` : "32°C"}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold block">
                    {weatherData ? (weatherConditions[weatherData.code]?.desc || "Sunny & Dry") : "Sunny & Dry"}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                {weatherData ? `${weatherData.humidity}%` : "38%"} Humidity
              </span>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-gray-50 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Rain Probability</span>
                <span className="text-charcoal dark:text-gray-100 font-bold">{weatherData ? `${weatherData.rainProbability}%` : "15%"}</span>
              </div>
              <div className="flex justify-between">
                <span>Wind Velocity</span>
                <span className="text-charcoal dark:text-gray-100 font-bold">{weatherData ? `${weatherData.windSpeed} km/h` : "12 km/h"}</span>
              </div>
              <div className="flex justify-between">
                <span>Soil Moisture Avg</span>
                <span className="text-charcoal dark:text-gray-100 font-bold">42% (Optimal)</span>
              </div>
            </div>
          </div>

          <Link to="../weather" className="mt-4 text-xs font-extrabold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider text-center block pt-4 border-t border-gray-50">
            View Live Weather Charts &rarr;
          </Link>
        </div>

      </div>

      {/* Orders and Active Bids Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Active Purchase Shipments</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Escrow protected orders currently in delivery.</p>
            </div>
            <Link to="../orders" className="text-xs font-extrabold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider">
              All Orders
            </Link>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Supplier</th>
                  <th className="pb-3">Crop Type</th>
                  <th className="pb-3">Total Value</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="font-semibold text-gray-600 dark:text-gray-300 divide-y divide-gray-50 dark:divide-gray-800">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors">
                    <td className="py-3.5 font-mono text-xs font-bold text-charcoal dark:text-gray-100">{ord.id}</td>
                    <td className="py-3.5 text-charcoal dark:text-gray-100 font-bold">{ord.farmer}</td>
                    <td className="py-3.5">{ord.crop}</td>
                    <td className="py-3.5 font-extrabold text-charcoal dark:text-gray-100">{ord.total}</td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2 py-0.75 rounded-md text-[10px] font-bold ${
                        ord.status === 'Completed' || ord.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-150 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                        ord.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border border-blue-150 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                        ord.status === 'Rejected' || ord.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-150 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                        'bg-amber-50 text-amber-700 border border-amber-150 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Bids */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Active Crop Bids</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5 font-semibold">Bids placed on grower listings.</p>
              </div>
              <Link to="../bids" className="text-xs font-extrabold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider">
                Bids Log
              </Link>
            </div>

            <div className="space-y-4">
              {activeBidsList.length > 0 ? (
                activeBidsList.map((bid) => (
                  <div key={bid.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 flex flex-col justify-between gap-2.5 hover:border-primary/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100">{bid.farmer}</h4>
                        <p className="text-xs text-primary font-bold mt-0.5">{bid.crop} ({bid.qty})</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        bid.status === 'Accepted' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                        bid.status === 'Countered' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      }`}>
                        {bid.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      <span>Bid Rate: <strong className="text-charcoal dark:text-gray-100 font-bold">{bid.bidRate}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-400 font-semibold text-xs border border-dashed border-gray-150 rounded-2xl">
                  No active bids placed yet.
                </div>
              )}
            </div>
          </div>

          <Link
            to="../messages"
            className="mt-6 w-full py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-gray-500 dark:text-gray-400 hover:text-primary text-xs font-extrabold transition-all text-center flex items-center justify-center gap-1.5 uppercase tracking-wider group focus:outline-none"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Negotiation Chats</span>
          </Link>
        </div>

      </div>

    </div>
  );
}

