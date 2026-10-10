import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-24 bg-bg-base relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Banner Frame */}
        <div className="relative rounded-[40px] bg-gradient-to-br from-primary to-primary-dark p-8 md:p-16 text-white overflow-hidden shadow-2xl shadow-primary/10">
          
          {/* Background Ambient Elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 dark:bg-[#1E293B]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-[200px] h-[200px] bg-secondary/20 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            
            {/* Top Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 dark:bg-[#1E293B]/10 text-xs font-semibold text-white mb-6 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5" />
              Risk-Free 14-Day Evaluation
            </span>

            {/* Title */}
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-6 leading-tight">
              Ready to scale your agricultural output?
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal mb-10 max-w-xl mx-auto">
              Get instant access to our live soil-twin modeling, climate advisory sheets, and region-wide Mandi commodity price indices.
            </p>

            {/* Form */}
            {submitted ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 rounded-2xl bg-white dark:bg-[#1E293B]/10 border border-white/20 inline-flex items-center gap-3"
              >
                <CheckCircle className="w-6 h-6 text-secondary" />
                <span className="font-display font-bold text-sm">Thank you! Our advisory team will reach out shortly.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-8">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your professional email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/20 dark:bg-[#1E293B]/10 border border-white/20 focus:outline-none focus:border-white focus:bg-white/30 dark:bg-[#1E293B]/20 placeholder-white/50 text-white font-medium text-sm transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="px-6 py-4 rounded-2xl bg-white dark:bg-[#1E293B] text-primary hover:bg-emerald-50 text-sm font-bold shadow-lg transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Benefits checks */}
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-xs font-semibold text-white/70">
              <span className="flex items-center gap-1.5">✓ Instant Setup</span>
              <span className="flex items-center gap-1.5">✓ No credit card required</span>
              <span className="flex items-center gap-1.5">✓ Cancel anytime</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

