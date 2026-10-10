import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

const formatCurrencyShort = (val) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

export default function RevenueChart() {
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(() => getLastSixMonths());
  const [points, setPoints] = useState("40₹70 120₹70 200₹70 280₹70 360₹70 440₹70");
  const [areaPoints, setAreaPoints] = useState("40₹70 120₹70 200₹70 280₹70 360₹70 440₹70 440₹70 40₹70");
  const [circleCoords, setCircleCoords] = useState([170, 170, 170, 170, 170, 170]);
  const [yLabels, setYLabels] = useState({ top: '₹60K', mid: '₹40K', low: '₹20K' });
  const [monthlyVals, setMonthlyVals] = useState([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      const userString = localStorage.getItem('agrinova_user');
      const user = userString ? JSON.parse(userString) : null;
      if (!user) return;

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/orders`, {
          headers: {
            'x-user-id': user.id || user._id
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const completedOrders = data.orders.filter(o => o.status === 'Completed' || o.status === 'Delivered');
          
          const list = getLastSixMonths();
          const totals = {};
          list.forEach(m => { totals[m] = 0; });

          completedOrders.forEach(o => {
            const m = getOrderMonth(o);
            const valStr = o.product?.total || o.price || '0';
            const val = parseFloat(valStr.toString().replace(/[^0-9.]/g, ''));
            if (!isNaN(val) && totals[m] !== undefined) {
              totals[m] += val;
            }
          });

          const vals = list.map(m => totals[m]);
          setMonthlyVals(vals);
          const maxVal = Math.max(...vals, 0);

          // Calculate Y coordinates
          // Baseline Y=170, Top Y=35. Range = 135.
          const coords = vals.map(v => {
            if (maxVal === 0) return 170;
            return Math.round(170 - (v / maxVal) * 135);
          });
          setCircleCoords(coords);

          // Points coordinate string
          const pts = coords.map((cy, idx) => `${40 + idx * 80},${cy}`).join(' ');
          setPoints(pts);
          setAreaPoints(`${pts} 440₹70 40₹70`);

          // Set labels
          if (maxVal > 0) {
            setYLabels({
              top: formatCurrencyShort(maxVal),
              mid: formatCurrencyShort(maxVal * 2 / 3),
              low: formatCurrencyShort(maxVal / 3)
            });
          } else {
            setYLabels({
              top: '₹60K',
              mid: '₹40K',
              low: '₹20K'
            });
          }
        }
      } catch (err) {
        console.error('Error fetching revenue chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 flex flex-col justify-between h-full min-h-[300px] relative">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Revenue Analytics</h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Calculated based on completed order dispatches.</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
          <TrendingUp className="w-4 h-4" />
          <span>Completed Orders</span>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="flex-1 w-full relative min-h-[160px] flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 bg-white dark:bg-[#1E293B]/70 flex items-center justify-center z-10">
            <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        )}

        <svg className="w-full h-full min-h-[160px]" viewBox="0 0 500 200" preserveAspectRatio="none">
          <defs>
            {/* Green fade gradient */}
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2E7D32" stopOpacity="0.00" />
            </linearGradient>
            {/* Line border gradient */}
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#66BB6A" />
              <stop offset="50%" stopColor="#2E7D32" />
              <stop offset="100%" stopColor="#F9A825" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          <line x1="40" y1="40" x2="460" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
          <line x1="40" y1="85" x2="460" y2="85" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
          <line x1="40" y1="130" x2="460" y2="130" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
          <line x1="40" y1="170" x2="460" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />

          {/* Shaded Area */}
          <polygon points={areaPoints} fill="url(#chartGrad)" />

          {/* Stroke Line */}
          <polyline
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Interactive highlight dots */}
          <circle cx="40" cy={circleCoords[0]} r="5" fill="#ffffff" stroke="#2E7D32" strokeWidth="2.5" className="hover:r-7 transition-all cursor-pointer" />
          <circle cx="120" cy={circleCoords[1]} r="5" fill="#ffffff" stroke="#2E7D32" strokeWidth="2.5" className="hover:r-7 transition-all cursor-pointer" />
          <circle cx="200" cy={circleCoords[2]} r="5" fill="#ffffff" stroke="#2E7D32" strokeWidth="2.5" className="hover:r-7 transition-all cursor-pointer" />
          <circle cx="280" cy={circleCoords[3]} r="5" fill="#ffffff" stroke="#2E7D32" strokeWidth="2.5" className="hover:r-7 transition-all cursor-pointer" />
          <circle cx="360" cy={circleCoords[4]} r="5" fill="#ffffff" stroke="#2E7D32" strokeWidth="2.5" className="hover:r-7 transition-all cursor-pointer" />
          <circle cx="440" cy={circleCoords[5]} r="6" fill="#ffffff" stroke="#F9A825" strokeWidth="3" className="hover:r-8 transition-all cursor-pointer" />

          {/* Axis Labels (X-Axis) */}
          <text x="40" y="192" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">{months[0]}</text>
          <text x="120" y="192" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">{months[1]}</text>
          <text x="200" y="192" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">{months[2]}</text>
          <text x="280" y="192" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">{months[3]}</text>
          <text x="360" y="192" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">{months[4]}</text>
          <text x="440" y="192" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">{months[5]}</text>

          {/* Axis Labels (Y-Axis) */}
          <text x="32" y="44" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="end">{yLabels.top}</text>
          <text x="32" y="89" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="end">{yLabels.mid}</text>
          <text x="32" y="134" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="end">{yLabels.low}</text>
        </svg>
      </div>

    </div>
  );
}

