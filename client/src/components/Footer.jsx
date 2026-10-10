import React, { useState } from 'react';
import { Sprout, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [subMsg, setSubMsg] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubStatus('loading');
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubStatus('success');
        setSubMsg('You\'re subscribed!');
        setEmail('');
      } else {
        setSubStatus('error');
        setSubMsg(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setSubStatus('error');
      setSubMsg('Network error. Please try again.');
    }
  };
  return (
    <footer className="bg-charcoal text-white border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
      
      {/* Decorative glows */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 pb-16 border-b border-white/5">
          
          {/* Logo & Pitch */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-6 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Sprout className="w-5.5 h-5.5 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">
                Agri<span className="text-primary">Nova</span>
              </span>
            </a>
            <p className="text-xs text-white/60 leading-relaxed font-normal mb-6 max-w-sm">
              Cultivating the future of agriculture by connecting advanced IoT field telemetry, neural advisories, and live market price indices.
            </p>
            {/* Socials */}
            <div className="flex gap-3 text-white/50">
              <a href="#" className="p-2 rounded-xl bg-white/10 dark:bg-[#1E293B]/5 hover:bg-white/20 dark:bg-[#1E293B]/10 hover:text-white transition-colors flex items-center justify-center" aria-label="Twitter X">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="p-2 rounded-xl bg-white/10 dark:bg-[#1E293B]/5 hover:bg-white/20 dark:bg-[#1E293B]/10 hover:text-white transition-colors flex items-center justify-center" aria-label="Instagram">
                <svg className="w-4 h-4 text-current" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="p-2 rounded-xl bg-white/10 dark:bg-[#1E293B]/5 hover:bg-white/20 dark:bg-[#1E293B]/10 hover:text-white transition-colors flex items-center justify-center" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links: Product */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/90 mb-5">Platform</h4>
            <ul className="space-y-3 text-xs text-white/50 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Soil Telemetry</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Weather Nodes</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mandi Index</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Enterprise API</a></li>
            </ul>
          </div>

          {/* Links: Resources */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/90 mb-5">Resources</h4>
            <ul className="space-y-3 text-xs text-white/50 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Agronomy Blogs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Platform Status</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Developer Docs</a></li>
            </ul>
          </div>

          {/* Links: Company */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/90 mb-5">Company</h4>
            <ul className="space-y-3 text-xs text-white/50 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Press Kit</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security Certs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/90 mb-5">Subscribe</h4>
            <p className="text-[11px] text-white/40 leading-normal font-normal mb-4">
              Get weekly crop pricing digests and modern farming guides.
            </p>
            <form className="relative" onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email..."
                disabled={subStatus === 'loading' || subStatus === 'success'}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-white/10 dark:bg-[#1E293B]/5 border border-white/10 focus:outline-none focus:border-primary text-xs font-semibold text-white transition-all placeholder-white/30 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={subStatus === 'loading' || subStatus === 'success'}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary hover:bg-primary-dark text-white shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {subStatus === 'loading' ? (
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
            {subMsg && (
              <p className={`text-[10px] mt-2 font-semibold ${
                subStatus === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {subMsg}
              </p>
            )}
          </div>

        </div>

        {/* Bottom copyright details */}
        <div className="pt-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-white/40 font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-white dark:bg-[#1E293B]/5 text-[9px] font-bold text-primary flex items-center gap-1 border border-white/5">
              <ShieldCheck className="w-3.5 h-3.5" /> SOC2 COMPLIANT
            </span>
            <span>© 2026 AgriNova Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Farmer Agreement</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

