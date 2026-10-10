import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShieldAlert, Trash2, CheckCircle2 } from 'lucide-react';

export default function BuyerBids() {
  const { user } = useOutletContext();
  const [bids, setBids] = useState([]);

  useEffect(() => {
    let stored = JSON.parse(localStorage.getItem('agrinova_bids') || '[]');
    if (stored.length === 0) {
      const mockBids = [
        { id: 1, cropId: 1, cropName: 'Organic Potatoes', farmer: 'Devendra Patil', qty: '25 qtl', bidRate: '₹1,350/qtl', status: 'Accepted' },
        { id: 2, cropId: 3, cropName: 'Yellow Soybean', farmer: 'Rajesh Mishra', qty: '500 qtl', bidRate: '₹4,800/qtl', status: 'Countered', counterRate: '₹4,850/qtl' },
        { id: 3, cropId: 4, cropName: 'Mustard Seeds', farmer: 'Meena Bai', qty: '80 qtl', bidRate: '₹5,400/qtl', status: 'Pending' }
      ];
      localStorage.setItem('agrinova_bids', JSON.stringify(mockBids));
      stored = mockBids;
    }
    setBids(stored);
  }, []);

  const handleCancelBid = (id) => {
    const updated = bids.filter(b => b.id !== id);
    setBids(updated);
    localStorage.setItem('agrinova_bids', JSON.stringify(updated));
    alert("Bid cancelled successfully.");
  };

  const handleAcceptCounter = async (bid) => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const qtyVal = parseInt(bid.qty.replace(/[^0-9]/g, ''));
    const rateVal = parseInt(bid.counterRate.replace(/[^0-9]/g, ''));
    const totalVal = qtyVal * rateVal;

    const newOrder = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      buyer: {
        name: user?.companyName || 'Indore Wholesale Supermarkets',
        manager: user ? `${user.firstName} ${user.lastName}` : 'Buyer Manager',
        phone: user?.phone || '+91 99887 76655',
        address: user?.city ? `${user.city}, Business: ${user.companyName || 'Corporate Buyer'}, Phone: ${user.phone || ''}` : 'Plot 42, B2B Industrial Mandi Sector, Indore, MP - 452001'
      },
      product: {
        id: bid.cropId,
        name: bid.cropName,
        category: 'Oilseeds',
        qty: `${qtyVal} Quintals`,
        rate: `₹${rateVal}/qtl`,
        total: `₹${totalVal.toLocaleString()}`
      },
      payment: {
        status: 'Held in Escrow',
        method: 'AgriNova Escrow Direct',
        transactionId: `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`
      },
      farmer: bid.farmer,
      status: 'Quality Checking'
    };

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user._id
        },
        body: JSON.stringify(newOrder)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || 'Failed to place order from bid.');
        return;
      }

      // Update bid status
      const updatedBids = bids.map(b => {
        if (b.id === bid.id) {
          return { ...b, status: 'Accepted', bidRate: bid.counterRate };
        }
        return b;
      });
      setBids(updatedBids);
      localStorage.setItem('agrinova_bids', JSON.stringify(updatedBids));

      alert("Counter-offer accepted! The transaction has been placed under secure AgriNova Escrow.");
    } catch (err) {
      console.error('Error accepting counter bid:', err);
      alert('Error accepting counter offer: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Negotiation Bids Log</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">Track crops bids submitted to farmer suppliers and respond to counter-proposals.</p>
      </div>

      {/* List of bids */}
      {bids.length > 0 ? (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div key={bid.id} className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/10 transition-colors">
              
              {/* Bid Meta */}
              <div className="space-y-2">
                <span className={`px-2.5 py-0.75 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  bid.status === 'Accepted' ? 'bg-green-50 text-green-700 border border-green-150' :
                  bid.status === 'Countered' ? 'bg-amber-50 text-amber-700 border border-amber-150 animate-pulse' :
                  'bg-blue-50 text-blue-700 border border-blue-150'
                }`}>
                  {bid.status}
                </span>
                <h3 className="font-display font-extrabold text-base text-charcoal dark:text-gray-100">{bid.cropName} ({bid.qty})</h3>
                <span className="text-xs text-gray-400 font-semibold block">Supplier: {bid.farmer}</span>
              </div>

              {/* Proposed rates */}
              <div className="space-y-1">
                <span className="text-xs text-gray-400 block uppercase">YOUR PROPOSED RATE</span>
                <span className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100 block mt-0.5">{bid.bidRate}</span>
              </div>

              {/* Counter details */}
              {bid.status === 'Countered' ? (
                <div className="space-y-1">
                  <span className="text-xs text-amber-600 font-extrabold block uppercase flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Supplier Counter-Offer
                  </span>
                  <span className="font-display font-extrabold text-lg text-amber-700 block mt-0.5">{bid.counterRate}</span>
                </div>
              ) : (
                <div className="space-y-1 text-sm font-semibold text-gray-400">
                  <span>Escrow Protection</span>
                  <span className="block mt-0.5 text-gray-500 dark:text-gray-400 font-bold">Standard Terms</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-gray-50 shrink-0">
                {bid.status === 'Pending' && (
                  <button
                    onClick={() => handleCancelBid(bid.id)}
                    className="py-2.5 px-4 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1 focus:outline-none"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Cancel Bid</span>
                  </button>
                )}

                {bid.status === 'Countered' && (
                  <>
                    <button
                      onClick={() => handleCancelBid(bid.id)}
                      className="py-2.5 px-4 rounded-xl border border-gray-150 text-gray-550 hover:bg-gray-50 dark:bg-[#0F172A] transition-all text-xs font-bold uppercase tracking-wider focus:outline-none"
                    >
                      Reject Counter
                    </button>
                    <button
                      onClick={() => handleAcceptCounter(bid)}
                      className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md shadow-primary/10 focus:outline-none"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Counter</span>
                    </button>
                  </>
                )}

                {bid.status === 'Accepted' && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-100 py-1.5 px-3 rounded-xl uppercase tracking-wider">
                    Bid Approved & Locked
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-12 text-center shadow-sm">
          <span className="text-4xl block mb-2">ðŸ¤</span>
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100">No Active Bids</h3>
          <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mt-1">
            Place negotiation bids on crop listings inside the Produce Marketplace to initiate communications.
          </p>
        </div>
      )}

    </div>
  );
}

