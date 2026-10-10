import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Cpu, ShieldCheck, SunDim, BarChart3, Navigation, ArrowRight } from 'lucide-react';

export default function Features() {
  const featuresList = [
    {
      icon: BrainCircuit,
      title: 'Smart Crop Advisory',
      desc: 'Hyper-localized, AI-powered planting and nutrient guides customized for your soil profile and ambient weather forecasts.',
      color: 'from-green-500 to-emerald-600',
      shadow: 'shadow-green-500/10'
    },
    {
      icon: Cpu,
      title: 'IoT Soil Insights',
      desc: 'Plug-and-play soil probes measuring Nitrogen, Phosphorus, Potassium (NPK), temperature, and moisture levels in real-time.',
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/10'
    },
    {
      icon: Navigation,
      title: 'Satellite Field Diagnostics',
      desc: 'Deep satellite monitoring of crop health (NDVI indices), identifying anomalies and disease outbreaks before they spread.',
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/10'
    },
    {
      icon: SunDim,
      title: 'Smart Precision Irrigation',
      desc: 'Predictive water delivery recommendation schedules that reduce waste by up to 40% while preserving root moisture balance.',
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/10'
    },
    {
      icon: BarChart3,
      title: 'Mandi Price Index',
      desc: 'Predictive agricultural market analysis with live price trackers, forecasting commodity values to maximize sales margins.',
      color: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/10'
    },
    {
      icon: ShieldCheck,
      title: 'Harvest Traceability',
      desc: 'End-to-end crop log certification to guarantee organic practices and connect you directly with global bulk distributors.',
      color: 'from-teal-600 to-primary',
      shadow: 'shadow-primary/10'
    }
  ];

  return (
    <section id="features" className="py-24 bg-bg-base relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-sm font-bold text-primary tracking-widest uppercase">The AgriNova Platform</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal dark:text-gray-100 mt-2 mb-4 leading-tight">
            Integrated features to revolutionize your yield output
          </h2>
          <p className="text-base text-charcoal dark:text-gray-100-light font-normal">
            Everything you need to monitor, manage, and scale your agricultural enterprise from a single centralized cloud hub.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="rounded-3xl p-8 bg-white dark:bg-[#1E293B] border border-charcoal/5 dark:border-white/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 group flex flex-col justify-between"
              >
                <div>
                  {/* Icon Frame */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg ${feature.shadow} mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-display font-bold text-xl text-charcoal dark:text-gray-100 mb-3">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-charcoal dark:text-gray-100-light/95 leading-relaxed font-normal mb-6">
                    {feature.desc}
                  </p>
                </div>

                {/* Footer Link */}
                <a href="#" className="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:text-primary-dark transition-colors mt-auto">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

