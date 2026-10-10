import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Play, ShoppingCart, ShieldCheck, 
  CloudRain, TrendingUp, Truck, Star, Leaf, Users,
  Wallet, Cpu, Building2, IndianRupee, Package,ArrowUpRight
} from 'lucide-react';

export default function Hero() {
  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const floatingElements = [
    { type: 'card', id: 'trading', icon: Users, iconColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40', title: 'Marketplace', desc: 'Direct Trading', time: 'Zero middlemen involved', top: '8%', left: '5%', delay: 0.2 },
    { type: 'card', id: 'pricing', icon: IndianRupee, iconColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40', title: 'Intelligence', desc: 'Smart Pricing', time: 'Real-time Mandi rates', top: '12%', right: '2%', delay: 0.3 },
    { type: 'card', id: 'payment', icon: ShieldCheck, iconColor: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/40', title: 'Security', desc: 'Secure Escrow', time: '100% safe transactions', top: '45%', left: '-2%', delay: 0.4 },
    { type: 'card', id: 'advisory', icon: Leaf, iconColor: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40', title: 'Smart Farming', desc: 'AI Advisory', time: 'Crop health predictions', top: '42%', right: '0%', delay: 0.5 },
    { type: 'card', id: 'quality', icon: Star, iconColor: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/40', title: 'Assurance', desc: 'Verified Quality', time: 'Standardized grading', bottom: '15%', left: '8%', delay: 0.6 },
    { type: 'card', id: 'logistics', icon: Truck, iconColor: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/40', title: 'Fulfillment', desc: 'Logistics Support', time: 'End-to-end delivery', bottom: '22%', right: '2%', delay: 0.7 },
    { type: 'card', id: 'weather', icon: CloudRain, iconColor: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/40', title: 'Hyper-local Data', desc: 'Weather Alerts', time: 'Real-time forecasting', bottom: '5%', right: '20%', delay: 0.8 }
  ];

  return (
    <section className="relative w-full min-h-screen pt-32 pb-20 md:pt-32 md:pb-24 overflow-hidden bg-[#fafafa] dark:bg-[#0B0F19] transition-colors duration-500 font-sans">
      
      {/* ========================================= */}
      {/* ULTRA-PREMIUM BACKGROUND                  */}
      {/* ========================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        {/* Very subtle dot grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMykiLz48L3N2Zz4=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
        
        {/* Soft radial primary glow behind right side */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 dark:bg-primary/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
        
        {/* Golden sunrise ambient light bottom left */}
        <div className="absolute left-[-10%] bottom-[-20%] w-[600px] h-[600px] bg-amber-300/15 dark:bg-amber-500/10 rounded-full blur-[150px]"></div>

      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10 w-full h-full">
        <div className="flex flex-col lg:flex-row items-center justify-between h-full gap-16 lg:gap-8">
          
          {/* ========================================= */}
          {/* LEFT CONTENT (42%)                        */}
          {/* ========================================= */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-[45%] flex flex-col justify-center items-start z-20 pt-10 lg:pt-0 relative"
          >
            {/* Background Glow for Left Column */}
            <div className="absolute inset-0 bg-primary blur-[160px] pointer-events-none rounded-full" style={{ opacity: 0.12 }}></div>
            
            {/* Top Badge */}
           <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glassmorphism border border-primary/20 text-xs font-semibold text-primary mb-8 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Next-Gen Smart Agriculture Platform</span>
          </motion.div>

            {/* Main Heading */}
            <motion.h1 variants={itemVariants} transition={{ delay: 0.2 }} className="relative text-slate-900 dark:text-white font-[900] text-[42px] sm:text-[48px] lg:text-[56px] leading-[1.1] tracking-tight mb-8 font-display">
              India's Smart <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/70">
                Agriculture
              </span> <br />
              Marketplace
            </motion.h1>

            {/* Description */}
            <motion.p variants={itemVariants} transition={{ delay: 0.3 }} className="relative text-slate-600 dark:text-slate-300 text-[16px] sm:text-[15px] leading-[1.7] max-w-[500px] mb-12 font-medium">
              A digital bridge connecting farmers and buyers through <span className="font-bold text-primary dark:text-primary">AI-powered</span> technology, real-time weather intelligence, smart pricing, secure escrow payments, and transparent agricultural trading.
            </motion.p>

            {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20"
          >
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group">
              Start Free Trial
              <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-charcoal dark:text-gray-100 hover:text-primary glassmorphism border border-charcoal/10 dark:border-white/10 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-current" />
              Watch Demo Video
            </button>
          </motion.div>

            {/* Trusted Companies */}
            <motion.div variants={itemVariants} transition={{ delay: 0.7 }} className="relative w-full text-center sm:text-left max-w-[620px]">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-[0.1em]">
                Trusted by Farmers • Buyers • Agri Businesses
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-10 grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100">
                <span className="font-display font-black text-2xl tracking-tighter text-slate-900 dark:text-white">IndiaMART</span>
                <span className="font-display font-bold text-2xl text-slate-900 dark:text-white">BigHaat</span>
                <span className="font-display font-bold text-2xl text-slate-900 dark:text-white">DeHaat</span>
                <span className="font-display font-semibold text-xl italic tracking-tighter text-slate-900 dark:text-white">Krishi Jagran</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ========================================= */}
          {/* RIGHT CONTENT (58%)                       */}
          {/* ========================================= */}
          <div className="w-full lg:w-[58%] hidden lg:flex items-center justify-center z-10 relative min-h-[600px]">
            
            {/* Removed SVG Connecting Lines as requested */}

            {/* Floating Elements (Boxes) */}
            {floatingElements.map((el) => {
              const Icon = el.icon;
              return (
                <motion.div
                  key={el.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: el.delay, duration: 0.5, type: 'spring' }}
                  className="absolute z-20"
                  style={{ top: el.top, left: el.left, right: el.right, bottom: el.bottom }}
                >
                  <motion.div
                    animate={{ y: [-6, 6, -6] }}
                    transition={{ duration: 4 + (el.delay * 2), repeat: Infinity, ease: "easeInOut" }}
                    className="flex items-center gap-3 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-white/50 dark:border-white/10 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${el.bg}`}>
                      <Icon className={`w-5 h-5 ${el.iconColor}`} />
                    </div>
                    <div className="flex flex-col pr-2">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{el.title}</span>
                      <span className={`text-[13px] leading-tight mt-0.5 ${el.valueColor || 'text-slate-800 dark:text-slate-200 font-semibold'} ${el.descColor || ''}`}>{el.desc}</span>
                      <span className={`text-[11px] mt-0.5 ${el.timeColor || 'text-slate-500 dark:text-slate-400'}`}>{el.time}</span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
            
            {/* 3D Farming Island Centerpiece */}
            <motion.div
              animate={{ y: [-15, 15, -15] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full flex items-center justify-center z-10"
            >
              <img 
                src="/agrinova-island-light.png" 
                alt="3D Farming Ecosystem Light" 
                className="w-full max-w-[580px] h-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.15)] dark:hidden mix-blend-multiply"
                style={{ 
                  WebkitMaskImage: `radial-gradient(closest-side, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)`,
                  maskImage: `radial-gradient(closest-side, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)`
                }}
              />
              <img 
                src="/agrinova-island-dark.png" 
                alt="3D Farming Ecosystem Dark" 
                className="w-full max-w-[580px] h-auto object-contain hidden dark:block drop-shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
                style={{ 
                  WebkitMaskImage: 'radial-gradient(closest-side, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
                  maskImage: 'radial-gradient(closest-side, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)' 
                }}
              />
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
