import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Search, ShieldAlert, CheckCircle, AlertTriangle, 
  X, AlertCircle, ShieldCheck, UserX, Clock, ArrowRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessagesMonitoring() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalAnalyzed: 0, flaggedCount: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0, resolvedCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  
  // Modals state
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [conversationContext, setConversationContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  let token = localStorage.getItem('agrinova_token');
  
  // Quick fix for mock_jwt_token error in middleware
  if (token === 'mock_jwt_token') {
    const userStr = localStorage.getItem('agrinova_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.id || token;
      } catch (e) {}
    }
  }

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/messages/monitoring`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/messages/${id}/moderation`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic update
        setMessages(messages.map(m => m._id === id ? { ...m, moderationStatus: newStatus } : m));
        if (selectedAnalysis && selectedAnalysis._id === id) {
          setSelectedAnalysis({ ...selectedAnalysis, moderationStatus: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const fetchConversationContext = async (senderId, receiverId) => {
    try {
      setContextLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/messages/context?senderId=${senderId}&receiverId=${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConversationContext(data.messages);
      }
    } catch (error) {
      console.error('Error fetching context:', error);
    } finally {
      setContextLoading(false);
    }
  };

  const openAnalysis = (msg) => {
    setSelectedAnalysis(msg);
  };

  const openContext = (msg) => {
    fetchConversationContext(msg.senderId._id, msg.receiverId._id);
  };

  const filteredMessages = messages.filter(m => {
    const sName = `${m.senderId?.firstName || ''} ${m.senderId?.lastName || ''} ${m.senderId?.companyName || ''}`.toLowerCase();
    const rName = `${m.receiverId?.firstName || ''} ${m.receiverId?.lastName || ''} ${m.receiverId?.companyName || ''}`.toLowerCase();
    const txt = m.text.toLowerCase();
    const q = searchQuery.toLowerCase();
    
    const matchesSearch = sName.includes(q) || rName.includes(q) || txt.includes(q);
    const matchesRisk = filterRisk === 'All' || m.analysis?.riskLevel === filterRisk;
    
    return matchesSearch && matchesRisk;
  });

  const getRiskColor = (level) => {
    if (level === 'High') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50';
    if (level === 'Medium') return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50';
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Safe': return 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300';
      case 'Flagged': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'Under Review': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      case 'Resolved': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'Escalated': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      default: return 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">AI Message Monitoring</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Real-time NLP analysis of marketplace communications to detect fraud and policy violations.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#1E293B]/80 backdrop-blur-xl border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none p-5 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-3 text-primary mb-2">
            <div className="p-2 bg-primary/10 rounded-lg"><Activity className="w-5 h-5" /></div>
            <span className="font-bold text-sm uppercase tracking-wide">Total Analyzed</span>
          </div>
          <span className="text-3xl font-extrabold text-charcoal dark:text-gray-100">{stats.totalAnalyzed}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#1E293B]/80 backdrop-blur-xl border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none p-5 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg"><ShieldAlert className="w-5 h-5" /></div>
            <span className="font-bold text-sm uppercase tracking-wide">High Risk</span>
          </div>
          <span className="text-3xl font-extrabold text-charcoal dark:text-gray-100">{stats.highRisk}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-[#1E293B]/80 backdrop-blur-xl border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none p-5 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
            <span className="font-bold text-sm uppercase tracking-wide">Pending Review</span>
          </div>
          <span className="text-3xl font-extrabold text-charcoal dark:text-gray-100">{stats.flaggedCount}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#1E293B]/80 backdrop-blur-xl border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none p-5 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-3 text-green-500 mb-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
            <span className="font-bold text-sm uppercase tracking-wide">Resolved</span>
          </div>
          <span className="text-3xl font-extrabold text-charcoal dark:text-gray-100">{stats.resolvedCount}</span>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary/50 text-sm font-medium text-charcoal dark:text-gray-100"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'High', 'Medium', 'Low'].map(risk => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterRisk === risk ? 'bg-primary text-white shadow-md' : 'bg-gray-50 dark:bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-800/50'}`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 dark:bg-[#0F172A]/50 border-b border-gray-100 dark:border-gray-800">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Sender & Receiver</th>
                <th className="p-4">Message Preview</th>
                <th className="p-4">AI Score</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400 font-medium">Loading AI analysis data...</td></tr>
              ) : filteredMessages.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400 font-medium">No messages found matching criteria.</td></tr>
              ) : (
                filteredMessages.map((msg, i) => {
                  const sName = msg.senderId ? (msg.senderId.firstName ? `${msg.senderId.firstName} ${msg.senderId.lastName}` : msg.senderId.companyName) : 'Unknown';
                  const rName = msg.receiverId ? (msg.receiverId.firstName ? `${msg.receiverId.firstName} ${msg.receiverId.lastName}` : msg.receiverId.companyName) : 'Unknown';
                  const riskLvl = msg.analysis?.riskLevel || 'Low';
                  
                  return (
                    <motion.tr 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      transition={{ delay: i * 0.05 }}
                      key={msg._id} 
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4 pl-6 whitespace-nowrap text-gray-500 dark:text-gray-400 font-medium text-xs">
                        {new Date(msg.createdAt).toLocaleDateString()}<br/>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-charcoal dark:text-gray-100">{sName} <span className="text-[10px] text-gray-400 font-medium uppercase px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-md ml-1">{msg.senderId?.role}</span></div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 font-medium">
                          <ArrowRight className="w-3 h-3" /> {rName}
                        </div>
                      </td>
                      <td className="p-4 max-w-[250px] truncate text-gray-600 dark:text-gray-300 font-medium">
                        "{msg.text}"
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${getRiskColor(riskLvl)}`}>
                          {riskLvl === 'High' ? <ShieldAlert className="w-3.5 h-3.5" /> : riskLvl === 'Medium' ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                          {msg.analysis?.riskScore || 0}/100
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(msg.moderationStatus)}`}>
                          {msg.moderationStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6 whitespace-nowrap">
                        <button 
                          onClick={() => openAnalysis(msg)}
                          className="px-4 py-1.5 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-charcoal dark:text-gray-100 hover:border-primary hover:text-primary rounded-lg text-xs font-bold shadow-sm transition-all focus:outline-none"
                        >
                          Review
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals & Slide-overs */}
      <AnimatePresence>
        {selectedAnalysis && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[100] flex justify-end"
            onClick={() => setSelectedAnalysis(null)}
          >
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-white dark:bg-[#1E293B] h-full shadow-2xl flex flex-col overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1E293B] z-10">
                <h3 className="font-display font-extrabold text-xl text-charcoal dark:text-gray-100">Moderation Review</h3>
                <button onClick={() => setSelectedAnalysis(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors focus:outline-none">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-8 flex-1">
                {/* Score Header */}
                <div className={`p-6 rounded-2xl border ${getRiskColor(selectedAnalysis.analysis?.riskLevel)} flex items-center justify-between`}>
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wide opacity-80 block mb-1">AI Risk Assessment</span>
                    <h4 className="text-2xl font-black">{selectedAnalysis.analysis?.riskLevel} Risk ({selectedAnalysis.analysis?.riskScore}/100)</h4>
                  </div>
                  {selectedAnalysis.analysis?.riskLevel === 'High' ? <ShieldAlert className="w-12 h-12 opacity-80" /> : <ShieldCheck className="w-12 h-12 opacity-80" />}
                </div>

                {/* Message Details */}
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Original Message</h5>
                  <div className="bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 p-4 rounded-xl text-charcoal dark:text-gray-100 font-medium text-sm italic">
                    "{selectedAnalysis.text}"
                  </div>
                </div>

                {/* AI Summary */}
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Groq AI Summary
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                    {selectedAnalysis.analysis?.summary || 'No summary provided.'}
                  </p>
                </div>

                {/* Violations */}
                {selectedAnalysis.analysis?.violations?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Detected Violations</h5>
                    <ul className="space-y-2">
                      {selectedAnalysis.analysis.violations.map((v, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/30 p-2.5 rounded-lg border border-red-100 dark:border-red-800/50">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Taken */}
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Suggested Action</h5>
                  <div className="bg-charcoal text-white px-4 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2 shadow-md">
                    <ShieldCheck className="w-4 h-4" /> {selectedAnalysis.analysis?.suggestedAction || 'None'}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0F172A] flex flex-wrap gap-3 sticky bottom-0">
                <button 
                  onClick={() => openContext(selectedAnalysis)}
                  className="w-full mb-2 py-3 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-charcoal dark:text-gray-100 font-bold rounded-xl hover:bg-gray-50 dark:bg-[#0F172A] transition-colors shadow-sm"
                >
                  View Full Chat Context
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedAnalysis._id, 'Resolved')}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-500/20 transition-all focus:outline-none"
                >
                  Mark Resolved
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedAnalysis._id, 'Safe')}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-charcoal dark:text-gray-100 font-bold rounded-xl transition-all focus:outline-none"
                >
                  Mark Safe
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedAnalysis._id, 'Escalated')}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md shadow-red-500/20 transition-all focus:outline-none"
                >
                  Escalate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Conversation Context Modal */}
        {conversationContext && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            onClick={() => setConversationContext(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#0F172A]/50">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100">Conversation Context</h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">Surrounding timeline of messages</p>
                </div>
                <button onClick={() => setConversationContext(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-[#0F172A]">
                {contextLoading ? (
                  <p className="text-center font-medium text-gray-400">Loading context...</p>
                ) : (
                  conversationContext.map((msg, idx) => {
                    const isSender = msg.senderId?._id === selectedAnalysis?.senderId?._id;
                    const isTargetMsg = msg._id === selectedAnalysis?._id;
                    return (
                      <div key={idx} className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-gray-400 font-bold mb-1 ml-1">{msg.senderId?.firstName || 'User'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className={`p-3 max-w-[80%] rounded-2xl text-sm font-medium ${
                          isTargetMsg ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50 shadow-md ring-2 ring-red-400/50 dark:ring-red-500/30' 
                          : isSender ? 'bg-primary text-white rounded-tr-sm' 
                          : 'bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-charcoal dark:text-gray-100 rounded-tl-sm'
                        }`}>
                          {msg.text}
                          {isTargetMsg && <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-red-600 dark:text-red-400 border-t border-red-200 dark:border-red-800/50/50 pt-2"><AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" /> Flagged Message</div>}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



