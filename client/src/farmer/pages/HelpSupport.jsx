import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, MessageSquare, AlertCircle, FileText, Send, CheckCircle2, Eye, X } from 'lucide-react';

export default function HelpSupport() {
  const { user } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [openFaqId, setOpenFaqId] = useState(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Listing',
    priority: 'Medium',
    description: ''
  });

  const faqs = [
    {
      id: 1,
      question: "How do I list a crop product on AgriNova?",
      answer: "Navigate to the 'My Crops' page and click 'Add Crop Product' at the top. Enter your crop parameters, including volume available, price per quintal, and high-resolution images. Once submitted, your listing is live in the buyer marketplace catalog."
    },
    {
      id: 2,
      question: "How does the payment escrow system work?",
      answer: "When a buyer commits to buy your crop, they deposit the total value into a secure AgriNova Escrow Account. Once the crop is shipped and verified at the destination warehouse, the funds are instantly released to your linked bank account. This prevents default and guarantees payment."
    },
    {
      id: 3,
      question: "How are crop quality samples verified?",
      answer: "Buyers can request a physical crop sample. You will receive an address label to ship a 1-2kg sample box. Additionally, you can request an on-farm inspection by an AgriNova verified agronomist. Having an inspector-verified batch adds a 'Verified Premium' badge to your listing, attracting 18% higher bids."
    },
    {
      id: 4,
      question: "Who is responsible for logistics and shipping costs?",
      answer: "During negotiation, you and the buyer can agree on who handles logistics. If the buyer handles logistics, their trucks will arrive at your farm gate on the scheduled date. If you handle logistics, you will transport the batch to their specified facility, and the negotiated price will reflect the transport allowance."
    },
    {
      id: 5,
      question: "What if there is a dispute during quality check at warehouse?",
      answer: "If a buyer reports a moisture discrepancy, our neutral third-party arbiters are assigned to inspect the batch. The escrow funds remain locked safely. In 95% of cases, disputes are resolved through price adjustments or partial shipments within 48 hours."
    }
  ];

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/tickets`, {
        headers: {
          'x-user-id': user.id || user._id
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Error fetching support tickets:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleToggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user._id
        },
        body: JSON.stringify(ticketForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTicketRef(data.ticket.id);
        setTicketSubmitted(true);
        setTicketForm({ subject: '', category: 'Listing', priority: 'Medium', description: '' });
        fetchTickets();
      } else {
        alert(data.message || 'Failed to submit support ticket.');
      }
    } catch (err) {
      console.error('Error raising ticket:', err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Help & Support</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5 font-sans">Access user documentation FAQs or submit a support ticket to our team.</p>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: FAQ Accordion & Contact options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* FAQ Accordion container */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 flex items-center gap-1.5 border-b border-gray-50 pb-3">
              <HelpCircle className="w-4.5 h-4.5 text-primary" />
              <span>Frequently Asked Questions</span>
            </h3>

            <div className="space-y-2.5 pt-2">
              {faqs.map(faq => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id} className="border border-gray-150/60 dark:border-white/5 rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#0F172A]/50">
                    <button
                      onClick={() => handleToggleFaq(faq.id)}
                      className="w-full px-5 py-4 text-left flex justify-between items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 dark:bg-[#0F172A] transition-colors focus:outline-none"
                    >
                      <span className="text-sm font-bold text-charcoal dark:text-gray-100">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-sm font-medium text-gray-450 leading-relaxed bg-white dark:bg-[#1E293B] border-t border-gray-50 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Contact Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-charcoal/5 dark:border-white/5 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50 flex items-center justify-center shrink-0 border border-blue-100">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">EMAIL SUPPORT</span>
                <a href="mailto:support@agrinova.com" className="text-sm font-extrabold text-charcoal dark:text-gray-100 hover:text-primary transition-colors">support@agrinova.com</a>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-charcoal/5 dark:border-white/5 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50 flex items-center justify-center shrink-0 border border-green-100">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">TOLL-FREE PHONE</span>
                <a href="tel:1800123456" className="text-sm font-extrabold text-charcoal dark:text-gray-100 hover:text-primary transition-colors">1800-12-3456</a>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-charcoal/5 dark:border-white/5 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50 flex items-center justify-center shrink-0 border border-amber-100">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">WHATSAPP AGENT</span>
                <span className="text-sm font-extrabold text-charcoal dark:text-gray-100">+91 99887 76655</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Raise a Ticket Form */}
        <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
          {!ticketSubmitted ? (
            <form onSubmit={handleRaiseTicket} className="space-y-5 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 flex items-center gap-1.5">
                    <FileText className="w-4.5 h-4.5 text-primary" />
                    <span>Raise Support Ticket</span>
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">Submit an issue report and our engineers will address it in 4 hours.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ESCROW Payment Delay"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Category</label>
                      <select
                        value={ticketForm.category}
                        onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                        className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:border-primary/30 cursor-pointer"
                      >
                        <option value="Listing">Crop Listing</option>
                        <option value="Payments">Payments & Escrow</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Technical">Technical Issue</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Priority</label>
                      <select
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                        className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:border-primary/30 cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Description</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Detail your inquiry or issue here. Include order IDs or crop names if applicable."
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100 resize-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 focus:outline-none"
              >
                {loading ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Ticket</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center shadow-inner mb-4">
                <CheckCircle2 className="w-7 h-7 stroke-[2]" />
              </div>
              <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-base">Ticket Submitted!</h3>
              <p className="text-sm text-gray-400 font-semibold mt-1">Your ticket reference code is:</p>
              <span className="font-mono font-extrabold text-sm text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/15 mt-3 inline-block">
                {ticketRef}
              </span>
              <p className="text-sm text-gray-450 leading-relaxed max-w-xs mt-6 font-medium">
                Our customer experience unit is reviewing your report. Updates will be delivered to your alerts panel.
              </p>

              <button
                onClick={() => setTicketSubmitted(false)}
                className="mt-8 px-5 py-2.5 rounded-xl border border-gray-150 hover:border-primary/25 text-gray-500 dark:text-gray-400 hover:text-primary text-sm font-bold transition-all hover:bg-gray-50 dark:bg-[#0F172A] focus:outline-none"
              >
                Raise Another Ticket
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Support Ticket History Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-base">Your Support Tickets</h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Track resolution status and updates for your submitted inquiries.</p>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          {tickets.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-charcoal/5 dark:border-white/5 text-xs font-bold text-gray-400 uppercase">
                  <th className="pb-3">Ticket ID</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Date Raised</th>
                  <th className="pb-3 text-right">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5 font-semibold text-gray-600 dark:text-gray-300">
                {tickets.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 font-mono font-bold text-xs text-primary">{t.id}</td>
                    <td className="py-4 text-charcoal dark:text-gray-100 max-w-[200px] truncate">{t.subject}</td>
                    <td className="py-4">{t.category}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        t.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' :
                        t.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' :
                        'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-4 text-xs font-medium text-gray-400">
                      {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                        t.status === 'Resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        t.status === 'In Progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="p-1.5 rounded-lg border border-gray-150 text-gray-400 hover:text-primary hover:border-primary/30 transition-colors focus:outline-none bg-white dark:bg-[#1E293B]"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-400 font-semibold text-xs border border-dashed border-gray-150 rounded-2xl">
              No support tickets raised yet. Fill out the form above to submit a ticket.
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                <h3 className="font-display font-bold text-lg text-charcoal dark:text-gray-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Ticket Details
                </h3>
                <button onClick={() => setSelectedTicket(null)} className="p-2 text-gray-400 hover:text-charcoal dark:text-gray-100 transition-colors focus:outline-none rounded-full hover:bg-gray-50 dark:bg-[#0F172A]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#FAFBF8]">
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Subject</span>
                    <p className="text-sm font-bold text-charcoal dark:text-gray-100">{selectedTicket.subject}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Ticket ID</span>
                    <p className="font-mono text-xs font-bold text-primary">{selectedTicket.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-[#1E293B] p-3 rounded-2xl border border-charcoal/5 dark:border-white/5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Category</span>
                    <p className="text-xs font-bold text-charcoal dark:text-gray-100">{selectedTicket.category}</p>
                  </div>
                  <div className="bg-white dark:bg-[#1E293B] p-3 rounded-2xl border border-charcoal/5 dark:border-white/5 flex flex-col justify-center items-start">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Status</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block ${
                        selectedTicket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        selectedTicket.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100'
                      }`}>
                        {selectedTicket.status}
                    </span>
                  </div>
                </div>

                {/* User Description */}
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Your Issue Description</span>
                  <div className="p-4 bg-white dark:bg-[#1E293B] border border-charcoal/5 dark:border-white/5 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Admin Response */}
                {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Admin Resolution</span>
                    <div className="space-y-3">
                      {selectedTicket.responses.map((resp, idx) => (
                        <div key={idx} className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-sm font-bold text-charcoal dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                          <span className="text-xs font-bold text-primary block mb-1 capitalize">{resp.sender}</span>
                          {resp.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-[#0F172A] border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center text-xs font-medium text-gray-400">
                    Awaiting admin response...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

