import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, CloudRain, Star, ShoppingBag, Radio, Activity } from 'lucide-react';

export default function Products() {
  const products = [
    {
      id: 1,
      name: 'AgriNova Soil Probe v2',
      category: 'IoT Hardware',
      price: '$189.00',
      rating: 4.9,
      reviews: 142,
      badge: 'Best Seller',
      icon: Cpu,
      iconColor: 'text-green-500 bg-green-50 dark:text-green-400 dark:bg-green-900/30',
      color: 'from-green-500/10 to-emerald-500/5',
      desc: 'Wireless, self-charging sensor tracking Nitrogen, Phosphorus, Potassium (NPK), moisture, pH, and soil temperature.'
    },
    {
      id: 2,
      name: 'Micro-Climate Weather Station',
      category: 'IoT Hardware',
      price: '$299.00',
      rating: 4.8,
      reviews: 89,
      badge: 'Solar Powered',
      icon: CloudRain,
      iconColor: 'text-blue-500 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
      color: 'from-blue-500/10 to-indigo-500/5',
      desc: 'Ambient outdoor node measuring wind vectors, barometric pressure, rainfall volume, UV metrics, and ambient humidity.'
    },
    {
      id: 3,
      name: 'Smart Drip Valve Controller',
      category: 'IoT Hardware',
      price: '$149.00',
      rating: 4.7,
      reviews: 64,
      badge: 'Auto Irrigation',
      icon: Radio,
      iconColor: 'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
      color: 'from-amber-500/10 to-orange-500/5',
      desc: 'Solenoid automated valve controller that integrates with NPK soil probes to execute micro-irrigation plans automatically.'
    },
    {
      id: 4,
      name: 'AI Crop Advisory Licence',
      category: 'Software Plan',
      price: '$99.00/yr',
      rating: 5.0,
      reviews: 310,
      badge: 'Premium SaaS',
      icon: Activity,
      iconColor: 'text-purple-500 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30',
      color: 'from-purple-500/10 to-pink-500/5',
      desc: 'Full access to deep satellite diagnostics, multi-farm digital twin mapping, disease diagnosis scanner, and custom NPK charts.'
    }
  ];

  return (
    <section id="products" className="py-24 bg-bg-base relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-sm font-bold text-primary tracking-widest uppercase">Smart Catalog</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal dark:text-gray-100 mt-2 mb-4 leading-tight">
              Pre-calibrated hardware and software packages
            </h2>
            <p className="text-base text-charcoal dark:text-gray-100-light font-normal">
              AgriNova nodes connect instantly to our secure platform. Unbox, scan the QR code, and start monitoring in less than 5 minutes.
            </p>
          </div>
          <div className="shrink-0 flex gap-3">
            <button className="px-5 py-2.5 rounded-xl border border-charcoal/10 dark:border-white/10 bg-white dark:bg-[#1E293B] hover:border-primary/20 text-sm font-semibold text-charcoal dark:text-gray-100 transition-all">
              Filter Hardware
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">
              View All Catalog
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: product.id * 0.05 }}
                className="rounded-3xl bg-white dark:bg-[#1E293B] border border-charcoal/5 dark:border-white/5 hover:border-primary/25 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div>
                  {/* Visual Product Placeholder */}
                  <div className={`h-48 bg-gradient-to-br ${product.color} relative flex items-center justify-center border-b border-charcoal/5 dark:border-white/5`}>
                    
                    {/* Badge */}
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white dark:bg-[#1E293B]/90 border border-charcoal/5 dark:border-white/5 text-[10px] font-bold text-primary shadow-sm">
                      {product.badge}
                    </span>

                    {/* Central Graphic */}
                    <div className={`w-20 h-20 rounded-3xl ${product.iconColor} flex items-center justify-center shadow-md transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                      <Icon className="w-10 h-10" />
                    </div>

                    {/* Grid Pattern Inside Graphic */}
                    <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <span className="text-[11px] font-bold text-charcoal dark:text-gray-100-light/50 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="font-display font-bold text-lg text-charcoal dark:text-gray-100 mt-1 mb-2">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-charcoal dark:text-gray-100">{product.rating}</span>
                      <span className="text-xs text-charcoal dark:text-gray-100-light/50 font-medium">({product.reviews})</span>
                    </div>

                    <p className="text-xs text-charcoal dark:text-gray-100-light/85 leading-relaxed font-normal">
                      {product.desc}
                    </p>
                  </div>
                </div>

                {/* Footer buy */}
                <div className="p-6 pt-0 border-t border-charcoal/5 dark:border-white/5 mt-auto flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-charcoal dark:text-gray-100-light/40 block">PRICE</span>
                    <span className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100">{product.price}</span>
                  </div>
                  <button className="p-3 rounded-xl bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center group/btn">
                    <ShoppingBag className="w-4 h-4 transform group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

