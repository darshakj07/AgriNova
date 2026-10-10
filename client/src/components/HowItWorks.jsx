import React from 'react';
import { motion } from 'framer-motion';
import { Map, Brain, Bell, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      no: '01',
      icon: Map,
      title: 'Map and Probe fields',
      desc: 'Insert AgriNova NPK probes in your soil plots and draw field boundaries on our high-res interactive dashboard mapping client.',
      color: 'bg-green-500/10 text-green-600 border-green-500/20'
    },
    {
      no: '02',
      icon: Brain,
      title: 'Calibrate soil profile',
      desc: 'Our neural engines ingest sensor readings and overlay them with 10 years of satellite NDVI and thermal weather maps.',
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    },
    {
      no: '03',
      icon: Bell,
      title: 'Get smart action plan',
      desc: 'Receive alerts, optimal drip-cycle parameters, fertilizer ratios, and harvest windows directly via SMS or the web application.',
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    },
    {
      no: '04',
      icon: TrendingUp,
      title: 'Scale and Sell crops',
      desc: 'Optimize growth metrics to earn high-margin crop certifications and list your catalog in our regional direct-buy mandi marketplace.',
      color: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-[#1E293B] relative overflow-hidden">
      {/* Visual background elements */}
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <span className="text-sm font-bold text-primary tracking-widest uppercase">Streamlined Onboarding</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal dark:text-gray-100 mt-2 mb-4 leading-tight">
            Four simple steps to digital agriculture transformation
          </h2>
          <p className="text-base text-charcoal dark:text-gray-100-light font-normal">
            No complex coding or specialized IT support required. We ship pre-calibrated sensors that sync automatically with your profile.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="relative">
          {/* Connecting line (Desktop) */}
          <div className="hidden lg:block absolute top-[68px] left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-green-300 via-blue-300 to-emerald-300 -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="flex flex-col items-center lg:items-start text-center lg:text-left relative group"
                >
                  {/* Step bubble and number wrapper */}
                  <div className="flex items-center justify-between w-full mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${step.color} shadow-sm group-hover:scale-110 transition-transform duration-300 mx-auto lg:mx-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-display font-extrabold text-5xl text-charcoal dark:text-gray-100-light/10 select-none hidden lg:block group-hover:text-primary/20 transition-colors duration-300">
                      {step.no}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-lg text-charcoal dark:text-gray-100 mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-charcoal dark:text-gray-100-light/80 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

