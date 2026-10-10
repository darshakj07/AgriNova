import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, ShieldAlert, Award } from 'lucide-react';

export default function Stats() {
  const statsList = [
    { 
      id: 1, 
      value: '50K+', 
      label: 'Onboarded Farmers', 
      desc: 'Active growers across 14 regions',
      icon: Users,
      color: 'text-primary bg-primary/10'
    },
    { 
      id: 2, 
      value: '98.4%', 
      label: 'Prediction Accuracy', 
      desc: 'AI-driven soil & climate forecast',
      icon: CheckCircle,
      color: 'text-secondary bg-secondary/10'
    },
    { 
      id: 3, 
      value: '$24.5M', 
      label: 'Input Costs Saved', 
      desc: 'Smart resource management optimization',
      icon: ShieldAlert,
      color: 'text-accent bg-accent/10'
    },
    { 
      id: 4, 
      value: '1.2M+', 
      label: 'Tons Tracked Yield', 
      desc: 'Verified harvest metrics tracked safely',
      icon: Award,
      color: 'text-emerald-600 bg-emerald-600/10'
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-[#1E293B] border-y border-charcoal/5 dark:border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsList.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex items-start gap-4 p-4 hover:bg-bg-base rounded-2xl transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-3xl text-charcoal dark:text-gray-100 tracking-tight mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-bold text-charcoal dark:text-gray-100 mb-1">{stat.label}</p>
                  <p className="text-xs text-charcoal dark:text-gray-100-light/70 font-medium">{stat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

