import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Droplets, Heart, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Benefits() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Maximize Profit Margins',
      desc: 'Lower chemical fertilizer input waste while selling crops at peak market index valuations to drive double-digit ROI gains.',
      color: 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800/50'
    },
    {
      icon: Droplets,
      title: 'Automated Water Savings',
      desc: 'Leverage smart irrigation sensors to keep soil moisture levels optimal, cutting down utility electricity pumping bills.',
      color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800/50'
    },
    {
      icon: ShieldCheck,
      title: 'Restored Soil Vigor',
      desc: 'Track chemical saturation levels in real-time, preventing soil compaction and promoting micro-organism growth.',
      color: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800/50'
    },
    {
      icon: Heart,
      title: 'Direct Market Pipeline',
      desc: 'Bypass intermediary distributors to list catalog yields directly onto our certified commercial bulk buyer platform.',
      color: 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800/50'
    }
  ];

  return (
    <section id="benefits" className="py-24 bg-white dark:bg-[#1E293B] relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Text column */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="text-sm font-bold text-primary tracking-widest uppercase mb-2">Grower Incentives</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal dark:text-gray-100 mb-6 leading-tight">
              Designed by agronomists to benefit your bottom line
            </h2>
            <p className="text-base text-charcoal dark:text-gray-100-light leading-relaxed mb-8">
              Traditional farming relies heavily on guesswork. AgriNova converts agricultural telemetry into clear, step-by-step action sheets that lower operational overheads and increase harvest weights.
            </p>

            {/* Micro card promo */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-[#1E293B] dark:to-[#0F172A] border border-green-100 dark:border-primary/20 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 mb-1">Need localized guidance?</h4>
                <p className="text-xs text-charcoal dark:text-gray-100-light leading-relaxed">
                  AgriNova provides 24/7 expert chat services connecting you to certified regional agronomists and crop health specialists.
                </p>
                <a href="#" className="inline-flex items-center gap-1 text-[11px] font-bold text-primary mt-2 hover:underline">
                  Talk to an Agronomist <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Benefits Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-charcoal/5 dark:border-white/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${benefit.color} mb-6`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-charcoal dark:text-gray-100 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-charcoal dark:text-gray-100-light/85 leading-relaxed font-normal">
                      {benefit.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}

