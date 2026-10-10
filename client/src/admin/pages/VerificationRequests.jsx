import React, { useState, useEffect } from 'react';
import { Search, FileText } from 'lucide-react';

export default function VerificationRequests() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const userString = localStorage.getItem('agrinova_user');
  const user = userString ? JSON.parse(userString) : null;
  const adminId = user ? (user.id || user._id) : '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [requests, setRequests] = useState([]);

  const fetchUsers = async () => {
    try {
      const headers = { 'x-user-id': adminId };

      const fRes = await fetch(`${API_BASE}/api/auth/farmers`, { headers });
      const fData = await fRes.json();
      const farmers = fData.success ? fData.farmers : [];

      const bRes = await fetch(`${API_BASE}/api/auth/buyers`, { headers });
      const bData = await bRes.json();
      const buyers = bData.success ? bData.buyers : [];

      const mapped = [
        ...farmers.map(f => ({
          id: f._id,
          customId: `REQ-${f._id.toString().slice(-4).toUpperCase()}`,
          name: `${f.firstName} ${f.lastName}`,
          type: 'Farmer Acreage',
          document: `Land Registry Certificate (Patta No. ${Math.floor(1000 + Math.random() * 9000)})`,
          value: `${f.farmAcres || 15} Acres (${f.farmLocation || 'MH'})`,
          status: f.verified ? 'Approved' : 'Pending',
          date: new Date(f.createdAt).toLocaleDateString('en-US')
        })),
        ...buyers.map(b => ({
          id: b._id,
          customId: `REQ-${b._id.toString().slice(-4).toUpperCase()}`,
          name: b.companyName || `${b.firstName} ${b.lastName}`,
          type: 'Buyer GSTIN',
          document: 'Corporate GST Registry Doc & PAN Card',
          value: `GSTIN: 23${b.companyName?.slice(0, 4).toUpperCase() || 'AABC'}1234${b.city?.charAt(0).toUpperCase() || 'F'}1Z5`,
          status: b.verified ? 'Approved' : 'Pending',
          date: new Date(b.createdAt).toLocaleDateString('en-US')
        }))
      ];
      setRequests(mapped);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchUsers();
    }
  }, [adminId]);

  const handleAuditRequest = async (id, approve) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/users/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId
        },
        body: JSON.stringify({ verified: approve })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Verification request updated successfully to: ${approve ? 'Approved' : 'Rejected'}`);
        fetchUsers();
      } else {
        alert(data.message || 'Failed to update verification status.');
      }
    } catch (err) {
      console.error('Error verifying user:', err);
      alert('Network error verifying user');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.document.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.customId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || req.type.includes(selectedType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Verification Requests</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Audit grower land registries, corporate buyer licenses, and identity document uploads.</p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search request ID, name, documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-55/10 border border-gray-155 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {['All', 'Farmer', 'Buyer'].map((ty) => (
            <button
              key={ty}
              onClick={() => setSelectedType(ty)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none shrink-0 ${
                selectedType === ty
                  ? 'bg-primary text-white'
                  : 'bg-gray-55/10 text-charcoal dark:text-gray-100/70 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {ty === 'All' ? 'All Requests' : `${ty} Audits`}
            </button>
          ))}
        </div>
      </div>

      {/* Requests table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 dark:bg-[#0F172A]/50 border-b border-gray-100 dark:border-gray-800">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 whitespace-nowrap pl-6">Request ID</th>
                <th className="p-4 whitespace-nowrap">Applicant Name</th>
                <th className="p-4 whitespace-nowrap">Audit Type</th>
                <th className="p-4 whitespace-nowrap">Document Certificate</th>
                <th className="p-4 whitespace-nowrap">Claims Details</th>
                <th className="p-4 whitespace-nowrap">Verification State</th>
                <th className="p-4 text-right  whitespace-nowrap pr-6">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5 font-semibold text-gray-600 dark:text-gray-300">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-primary font-mono font-bold text-xs pl-6">{req.customId}</td>
                  <td className="p-4 font-bold text-charcoal dark:text-gray-100">{req.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.type.includes('Farmer') ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                      {req.type}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-medium text-gray-550 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{req.document}</span>
                  </td>
                  <td className="p-4 text-xs font-semibold text-charcoal dark:text-gray-100">{req.value}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      req.status === 'Approved'
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50'
                        : req.status === 'Rejected'
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-155 dark:border-red-800/50'
                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-155 dark:border-amber-800/50 animate-pulse'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5 shrink-0 whitespace-nowrap pr-6">
                    {req.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleAuditRequest(req.id, true)}
                          className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-800/50 hover:bg-green-100/30 dark:hover:bg-green-900/30 rounded text-[10px] font-bold transition-all focus:outline-none"
                        >
                          Approve Check
                        </button>
                        <button
                          onClick={() => handleAuditRequest(req.id, false)}
                          className="px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-750 dark:text-red-400 border border-red-150 dark:border-red-800/50 hover:bg-red-100/30 dark:hover:bg-red-900/30 rounded text-[10px] font-bold transition-all focus:outline-none"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Audited & Closed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400 font-semibold">
                    No verification requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

