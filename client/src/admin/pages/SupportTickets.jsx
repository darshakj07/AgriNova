import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, CheckCircle, Reply } from 'lucide-react';

export default function SupportTickets() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const userString = localStorage.getItem('agrinova_user');
  const user = userString ? JSON.parse(userString) : null;
  const adminId = user ? (user.id || user._id) : '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets`, {
        headers: { 'x-user-id': adminId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets(data.tickets);
        if (data.tickets.length > 0 && !selectedTicketId) {
          setSelectedTicketId(data.tickets[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching support tickets:', err);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchTickets();
    }
  }, [adminId]);

  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    try {
      const res = await fetch(`${API_BASE}/api/tickets/${activeTicket.id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': adminId
        },
        body: JSON.stringify({ text: replyText, status: 'Resolved' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReplyText('');
        alert("Response sent. Ticket resolved successfully!");
        fetchTickets();
      } else {
        alert(data.message || 'Failed to submit response.');
      }
    } catch (err) {
      console.error('Error sending support reply:', err);
      alert('Error communicating with server.');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const applicantName = t.userId ? `${t.userId.firstName} ${t.userId.lastName}` : 'User';
    return applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Support Tickets Helpdesk</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Solve customer inquiries, escrow questions, and profile verification support tickets.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket list */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 sm:p-6 shadow-sm flex flex-col space-y-4">
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm flex items-center gap-2 border-b border-gray-50 pb-3">
            <HelpCircle className="w-4.5 h-4.5 text-primary" />
            <span>Open Tickets List</span>
          </h3>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search user or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-xs font-semibold text-charcoal dark:text-gray-100"
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-96 divide-y divide-gray-50 dark:divide-white/5 dark:divide-white/5 dark:divide-white/5 space-y-1">
            {filteredTickets.map((t) => {
              const applicantName = t.userId ? `${t.userId.firstName} ${t.userId.lastName}` : 'AgriNova User';
              const dateRaised = new Date(t.createdAt).toLocaleDateString();

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full p-3.5 rounded-2xl flex flex-col gap-1 text-left transition-all relative ${
                    selectedTicketId === t.id
                      ? 'bg-[#F8FAF5] dark:bg-primary/10 border border-primary/10 dark:border-primary/20 shadow-sm'
                      : 'border border-transparent hover:bg-gray-50 dark:hover:bg-white/5 dark:bg-[#0F172A]/70'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] text-primary font-bold uppercase">{t.category}</span>
                    <span className={`px-2 py-0.25 rounded text-[8px] font-bold ${
                      t.status === 'Open' ? 'bg-red-50 dark:bg-red-900/30 text-red-750 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 truncate w-full mt-0.5">{t.subject}</h4>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold mt-1">
                    <span>{applicantName.split(' ')[0]}</span>
                    <span>{dateRaised}</span>
                  </div>
                </button>
              );
            })}
            {filteredTickets.length === 0 && (
              <div className="text-center py-6 text-gray-450 text-xs font-semibold">
                No tickets found.
              </div>
            )}
          </div>
        </div>

        {/* Reply workspace */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6">
          {activeTicket ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              {/* Ticket Details Body */}
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-55/10">
                  <span className="text-xs text-primary font-bold">{activeTicket.category} &bull; Received on {new Date(activeTicket.createdAt).toLocaleDateString()}</span>
                  <h3 className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100 mt-1">{activeTicket.subject}</h3>
                  <span className="text-xs text-gray-400 font-semibold mt-1 block">From: <strong className="font-bold text-charcoal dark:text-gray-100">{activeTicket.userId ? `${activeTicket.userId.firstName} ${activeTicket.userId.lastName} (${activeTicket.userRole})` : 'AgriNova User'}</strong></span>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-[#0F172A] rounded-2xl text-sm font-semibold text-charcoal dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {activeTicket.description}
                </div>

                {/* Historic responses */}
                {activeTicket.responses && activeTicket.responses.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider">Helpdesk Activity</h4>
                    {activeTicket.responses.map((r, i) => (
                      <div key={i} className="p-3.5 bg-[#F8FAF5] dark:bg-primary/5 border border-primary/10 dark:border-primary/20 rounded-2xl text-xs font-semibold text-charcoal dark:text-gray-100">
                        <span className="text-primary font-bold block">{r.sender} &bull; {new Date(r.createdAt).toLocaleString()}</span>
                        <p className="mt-1 leading-relaxed text-gray-650 dark:text-gray-300">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Form */}
              {activeTicket.status !== 'Resolved' ? (
                <form onSubmit={handleSendReply} className="space-y-3 pt-6 border-t border-gray-50 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold block uppercase flex items-center gap-1">
                      <Reply className="w-3.5 h-3.5" />
                      <span>COMPOSE REPLY RESOLUTION</span>
                    </label>
                    <textarea
                      placeholder="Type your official helpdesk response here. Sending this will mark the ticket as resolved."
                      rows="4"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-150 focus:outline-none focus:border-primary/30 text-xs font-semibold text-charcoal dark:text-gray-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold uppercase tracking-wide rounded-xl shadow-md transition-all focus:outline-none cursor-pointer"
                  >
                    Send Reply & Resolve Ticket
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-150 dark:border-green-800/50 text-green-800 dark:text-green-400 text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-green-700 dark:text-green-400 shrink-0" />
                  <span>This ticket has been resolved and closed. No further actions are required.</span>
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 flex-1">
              <HelpCircle className="w-10 h-10 text-gray-250 mb-3" />
              <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm">No Ticket Selected</h3>
              <p className="text-sm text-gray-400 font-medium max-w-xs mt-1">Select an active support ticket from the list to view and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

