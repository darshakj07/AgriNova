import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Sprout, ShieldAlert, ArrowRight, TrendingUp, AlertTriangle, 
  BarChart3, PieChart as PieChartIcon 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function Dashboard() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('agrinova_token');
  const userString = localStorage.getItem('agrinova_user');
  const user = userString ? JSON.parse(userString) : null;
  const adminId = user ? (user.id || user._id) : '';

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    farmersCount: 0,
    buyersCount: 0,
    productsCount: 0,
    escrowTotal: 0,
    escrowTxCount: 0
  });
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [ordersStatusData, setOrdersStatusData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'x-user-id': adminId
          }
        });
        const data = await res.json();
        
        if (data.success) {
          setStats(data.stats);
          setRecentVerifications(data.recentVerifications);
          // Reverse to show oldest to newest on charts
          setMonthlyAnalytics([...data.monthlyAnalytics].reverse());
          setProductsByCategory(data.productsByCategory);
          setOrdersStatusData(data.ordersStatusData);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  const statCards = [
    { id: 1, name: 'Active Farmers', value: `${stats.farmersCount} growers`, change: `Verified accounts`, icon: Users, color: 'bg-green-50 dark:bg-green-900/30 dark:bg-green-500/20 text-green-700 dark:text-green-400' },
    { id: 2, name: 'Active Buyers', value: `${stats.buyersCount} corporates`, change: `Verified accounts`, icon: Users, color: 'bg-blue-50 dark:bg-blue-900/30 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' },
    { id: 3, name: 'Active Listings', value: `${stats.productsCount} crops`, change: `Live on marketplace`, icon: Sprout, color: 'bg-yellow-50 dark:bg-yellow-500/20 text-yellow-750 dark:text-yellow-400' },
    { id: 4, name: 'Value Held in Escrow', value: `₹${stats.escrowTotal.toLocaleString()}`, change: `${stats.escrowTxCount} transactions`, icon: ShieldAlert, color: 'bg-amber-50 dark:bg-amber-900/30 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' }
  ];

  const systemAlerts = [
    { id: 1, title: 'Probe Telemetry Offline', desc: 'Station Indore B4 moisture probe is unresponsive.', type: 'Warning' },
    { id: 2, title: 'Logistics SLA Breach', desc: 'Order shipping checks are fully operational.', type: 'Info' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Welcome Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">System Administration Panel</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Oversee market registries, escrow transactions, and platform verification protocols.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.id} className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{stat.name}</span>
                <span className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100 block mt-2">{stat.value}</span>
              </div>
              <div className={`p-3 rounded-2xl ${stat.color} shrink-0`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary mt-4">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1 - Area Chart */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 flex items-center gap-1.5">
                <TrendingUp className="w-4.5 h-4.5 text-primary" />
                <span>Monthly Escrow Turnover & Fees</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">Visual growth curve of platform trade volume.</p>
            </div>
          </div>
          
          <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTurnover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7DAE41" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7DAE41" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-charcoal)', borderRadius: '12px', border: '1px solid rgba(150, 150, 150, 0.1)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-charcoal)' }} />
                <Area type="monotone" name="Turnover (₹)" dataKey="turnoverVal" stroke="#7DAE41" strokeWidth={3} fillOpacity={1} fill="url(#colorTurnover)" />
                <Area type="monotone" name="Platform Fees (₹)" dataKey="feesVal" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorFees)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 - Bar Chart */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5 text-blue-500" />
                <span>User Registrations Acquisition</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">Growth of active buyer and grower registries.</p>
            </div>
            <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 dark:bg-blue-500/20 px-2 py-0.5 rounded-md">New Signups</span>
          </div>
          
          <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <RechartsTooltip cursor={{fill: 'rgba(150, 150, 150, 0.1)'}} contentStyle={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-charcoal)', borderRadius: '12px', border: '1px solid rgba(150, 150, 150, 0.1)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-charcoal)' }} />
                <Bar name="New Farmers" dataKey="newFarmers" fill="#7DAE41" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar name="New Buyers" dataKey="newBuyers" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Row 2 (Pie Chart & Performance Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie Chart */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 flex items-center gap-1.5">
              <PieChartIcon className="w-4.5 h-4.5 text-amber-500" />
              <span>Active Listings by Category</span>
            </h3>
          </div>
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productsByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {productsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-charcoal)', borderRadius: '12px', border: '1px solid rgba(150, 150, 150, 0.1)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px', color: 'var(--color-charcoal)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
          <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100">Monthly Platform Performance Breakdown</h3>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-50 dark:border-white/5 text-xs font-bold text-gray-400 uppercase">
                  <th className="pb-3">Billing Cycle</th>
                  <th className="pb-3">Escrow Turnover</th>
                  <th className="pb-3">Comm. Collected</th>
                  <th className="pb-3 text-center">New Growers</th>
                  <th className="pb-3 text-center">New Buyers</th>
                </tr>
              </thead>
              <tbody className="font-semibold text-gray-600 dark:text-gray-300 divide-y divide-gray-50 dark:divide-white/5">
                {[...monthlyAnalytics].reverse().map((d, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 text-charcoal dark:text-gray-100 font-bold">{d.month}</td>
                    <td className="py-3.5 font-bold text-charcoal dark:text-gray-100">{d.turnover}</td>
                    <td className="py-3.5 font-bold text-primary">{d.fees}</td>
                    <td className="py-3.5 text-center text-xs">{d.newFarmers}</td>
                    <td className="py-3.5 text-center text-xs">{d.newBuyers}</td>
                  </tr>
                ))}
                {monthlyAnalytics.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400 font-semibold">
                      No billing cycle analytics data compiled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grid: Verifications & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Verification requests */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Pending Verification Requests</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Review documentation to approve land registries or business licenses.</p>
            </div>
            <Link to="../verifications" className="text-xs font-extrabold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider flex items-center gap-0.5">
              <span>View All Requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-50 dark:border-white/5 text-xs font-bold text-gray-400 uppercase">
                  <th className="pb-3">Request ID</th>
                  <th className="pb-3">Partner Entity</th>
                  <th className="pb-3">Document Type</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="font-semibold text-gray-600 dark:text-gray-300 divide-y divide-gray-50 dark:divide-white/5">
                {recentVerifications.map((req) => (
                  <tr key={req.id}>
                    <td className="py-3.5 font-mono text-xs font-bold text-charcoal dark:text-gray-100">{req.id}</td>
                    <td className="py-3.5 text-charcoal dark:text-gray-100 font-bold">{req.name}</td>
                    <td className="py-3.5">{req.type} &bull; <span className="text-xs text-gray-400 font-semibold">{req.details}</span></td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2 py-0.75 rounded-md text-[10px] font-bold ${
                        req.status === 'Approved' ? 'bg-green-50 dark:bg-green-900/30 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50 dark:border-green-500/30' :
                        'bg-amber-50 dark:bg-amber-900/30 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-150 dark:border-amber-800/50 dark:border-amber-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentVerifications.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-400 font-semibold text-xs">
                      No pending verification requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health / Warnings */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display font-bold text-charcoal dark:text-gray-100">System Health Alerts</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Active anomalies detected in telemetry.</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>

            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/30/30 dark:bg-red-500/10 border border-red-100 dark:border-red-800/50 dark:border-red-900/30 flex flex-col justify-between gap-1.5 hover:border-red-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <h4 className="font-display font-bold text-sm text-red-900 dark:text-red-200">{alert.title}</h4>
                    <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-750 dark:text-red-400 dark:text-red-300 text-[9px] font-extrabold uppercase">
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-xs text-red-800 dark:text-red-400/80 dark:text-red-200/80 font-medium leading-relaxed">{alert.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="../settings"
            className="mt-6 w-full py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-gray-550 hover:text-primary text-xs font-extrabold transition-all text-center flex items-center justify-center gap-1.5 uppercase tracking-wider focus:outline-none"
          >
            Open System Maintenance Panel
          </Link>
        </div>

      </div>
    </div>
  );
}

