import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('agrinova_cart') || '[]');
    setCartItems(items);
  }, []);

  const handleUpdateQty = (id, delta) => {
    const updated = cartItems.map(item => {
      if (item.id === id) {
        const nextQty = item.quantitySelected + delta;
        return { ...item, quantitySelected: nextQty > 0 ? nextQty : 1 };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('agrinova_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart_updated'));
  };

  const handleRemove = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('agrinova_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart_updated'));
  };

  const parseVal = (val) => {
    if (typeof val === 'number') return val;
    return parseInt(val?.toString().replace(/[^0-9]/g, '') || '1400');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const newOrders = cartItems.map(item => {
      const priceVal = parseVal(item.price);
      const totalAmount = item.quantitySelected * priceVal;

      return {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        buyer: {
          name: user?.companyName || 'Indore Wholesale Supermarkets',
          manager: user ? `${user.firstName} ${user.lastName}` : 'Buyer Manager',
          phone: user?.phone || '+91 99887 76655',
          address: user?.city ? `${user.city}, Business: ${user.companyName || 'Corporate Buyer'}, Phone: ${user.phone || ''}` : 'Plot 42, B2B Industrial Mandi Sector, Indore, MP - 452001'
        },
        product: {
          id: item._id || item.id,
          name: item.name,
          category: item.category,
          qty: `${item.quantitySelected} Quintals`,
          rate: `₹${priceVal}/qtl`,
          total: `₹${totalAmount.toLocaleString()}`
        },
        payment: {
          status: 'Held in Escrow',
          method: 'AgriNova Escrow Direct',
          transactionId: `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`
        },
        farmer: item.farmerId?.firstName ? `${item.farmerId.firstName} ${item.farmerId.lastName}`.trim() : (item.farmer || 'AgriNova Farmer'),
        status: 'Quality Checking'
      };
    });

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user._id
        },
        body: JSON.stringify(newOrders)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || 'Failed to place orders.');
        return;
      }

      localStorage.removeItem('agrinova_cart');
      setCartItems([]);
      window.dispatchEvent(new Event('cart_updated'));
      
      alert("AgriNova Escrow Payment Successful! Your payment is securely locked. Tracking details are available in My Orders.");
      navigate('../orders');
    } catch (err) {
      console.error('Error during checkout:', err);
      alert('Error during checkout: ' + err.message);
    }
  };


  const cartTotal = cartItems.reduce((acc, item) => acc + (item.quantitySelected * parseVal(item.price)), 0);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Secure Escrow Cart</h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">AgriNova escrow secures your capital until the supplier completes verified delivery.</p>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Product Name */}
                <div className="space-y-1">
                  <span className="px-2 py-0.25 rounded bg-primary/5 text-primary text-[9px] font-extrabold uppercase border border-primary/5">
                    {item.category}
                  </span>
                  <h3 className="font-display font-extrabold text-base text-charcoal dark:text-gray-100">{item.name}</h3>
                  <span className="text-xs text-gray-400 font-semibold block">Supplier: {item.farmer || 'Verified Grower'} {item.location ? `• ${item.location}` : ''}</span>
                </div>

                {/* Adjust Quantities */}
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 p-1.5 rounded-xl shrink-0">
                  <button
                    onClick={() => handleUpdateQty(item.id, -1)}
                    className="p-1 bg-white dark:bg-[#1E293B] rounded-lg border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-extrabold text-charcoal dark:text-gray-100 min-w-[50px] text-center">{item.quantitySelected} qtl</span>
                  <button
                    onClick={() => handleUpdateQty(item.id, 1)}
                    className="p-1 bg-white dark:bg-[#1E293B] rounded-lg border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Price and Subtotal */}
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">SUBTOTAL</span>
                  <span className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100 block mt-0.5">
                    ₹{(item.quantitySelected * parseVal(item.price)).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-450 dark:text-gray-400 font-semibold block mt-0.5">Rate: {item.price}/qtl</span>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2.5 rounded-xl border border-red-100 dark:border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors focus:outline-none self-end sm:self-auto shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>
            ))}
          </div>

          {/* Checkout Summary panel */}
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-sm p-6 sm:p-8 space-y-6">
              <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm uppercase tracking-wider border-b border-gray-50 dark:border-gray-800 pb-3">Escrow Checkout Summary</h3>
              
              <div className="space-y-3.5 text-sm font-semibold text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal Value</span>
                  <span className="text-charcoal dark:text-gray-100 font-bold">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>AgriNova Escrow Fee</span>
                  <span className="text-primary font-bold">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Verifications / QC</span>
                  <span className="text-primary font-bold">Included</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-base font-display font-extrabold text-charcoal dark:text-gray-100">
                  <span>Total Escrow Amount</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Escrow Guarantee alert banner */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                  Your funds are secured in AgriNova's locked escrow node and will not be transferred to the supplier until you verify and authorize delivery receipt.
                </p>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition-all uppercase tracking-wider shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 focus:outline-none"
              >
                <span>Authorize Escrow Lock & Buy</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center mx-auto border border-gray-100 dark:border-gray-800 text-gray-300">
            <ShoppingCart className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-charcoal dark:text-gray-100">Your Cart is Empty</h3>
            <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mt-1">
              Browse our marketplace to source verified agricultural produce from direct farmer partners.
            </p>
          </div>
          <Link
            to="../marketplace"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all"
          >
            Source Produce
          </Link>
        </div>
      )}

    </div>
  );
}

