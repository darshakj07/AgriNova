import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Radio, MapPin, Check, Smartphone } from 'lucide-react';

export default function MobileApp() {
  return (
    <section className="py-24 bg-white dark:bg-[#1E293B] relative overflow-hidden">
      {/* Decorative radial gradients */}
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Pure CSS Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative">
              {/* Phone Container */}
              <div className="w-[280px] h-[560px] rounded-[44px] border-[10px] border-charcoal bg-charcoal shadow-2xl relative overflow-hidden ring-1 ring-white/10 flex flex-col">
                
                {/* Speaker Grill & Camera Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-charcoal rounded-b-2xl z-30 flex justify-center items-center">
                  <div className="w-12 h-1 bg-white dark:bg-[#1E293B]/20 rounded-full mb-1" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[#1E293B]/10 ml-2 mb-1" />
                </div>

                {/* App Screen inside phone */}
                <div className="flex-1 bg-bg-base relative overflow-hidden flex flex-col p-4 pt-8 justify-between">
                  
                  {/* Phone Header */}
                  <div className="flex justify-between items-center text-charcoal dark:text-gray-100/40 text-[10px] font-extrabold pb-2 border-b border-charcoal/5 dark:border-white/5">
                    <span>9:41 AM</span>
                    <span className="text-primary font-bold">AgriNova AI</span>
                  </div>

                  {/* App Scanner Panel (Main visual) */}
                  <div className="flex-1 my-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-charcoal/5 dark:border-white/5 p-4 flex flex-col justify-between relative overflow-hidden shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                        <Camera className="w-3 h-3 animate-pulse" /> LIVE DIAGNOSIS
                      </span>
                      <span className="text-[8px] font-bold bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded">
                        Leaf Match: 94%
                      </span>
                    </div>

                    {/* Camera Scanner Box */}
                    <div className="flex-1 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-[#1E293B] dark:to-[#0F172A] border border-green-100 dark:border-primary/20 flex items-center justify-center relative overflow-hidden min-h-[160px]">
                      {/* Leaf Vector shape inside scanner */}
                      <svg className="w-20 h-20 text-primary/10 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17,8C8,20 5.9,26.17 3.82,21.34L5.71,22L7.38,28.5C11.5,28.8 17.5,26.5 21,21C22,9 22.5,7 22,5C20.5,5.5 18,6 17,8Z" />
                      </svg>

                      {/* Laser scanner line effect */}
                      <motion.div
                        animate={{ y: [-40, 110, -40] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="absolute left-0 right-0 h-0.5 bg-primary/40 shadow-[0_0_8px_rgba(46,225,50,0.6)]"
                      />

                      {/* Diagnostic HUD Corner outlines */}
                      <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-primary/40" />
                      <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-primary/40" />
                      <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-primary/40" />
                      <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-primary/40" />
                    </div>

                    {/* Diagnosis report HUD */}
                    <div className="mt-3">
                      <p className="text-[9px] font-bold text-charcoal dark:text-gray-100">Report: Rice Blast Pathogen</p>
                      <p className="text-[8px] text-charcoal dark:text-gray-100-light/80 leading-normal mt-0.5">Mild saturation. Apply Tricyclazole spray in Sector B within 48 hours.</p>
                    </div>
                  </div>

                  {/* Phone Footer Navigation */}
                  <div className="h-10 bg-white dark:bg-[#1E293B] border border-charcoal/5 dark:border-white/5 rounded-xl flex items-center justify-around px-2 text-charcoal dark:text-gray-100/50">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <Camera className="w-4 h-4" />
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>

                {/* Home Indicator bar */}
                <div className="h-4 bg-charcoal flex justify-center items-center">
                  <div className="w-20 h-1 bg-white dark:bg-[#1E293B]/20 rounded-full mb-1" />
                </div>
              </div>

              {/* Decorative side badge */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute top-20 -right-8 glassmorphism border border-primary/20 shadow-xl rounded-2xl p-3 flex items-center gap-2 max-w-[140px]"
              >
                <div className="w-7 h-7 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold text-charcoal dark:text-gray-100 leading-tight">Offline Diagnostic Ready</span>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Copy & Badges */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-sm font-bold text-primary tracking-widest uppercase mb-2">Mobile Application</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal dark:text-gray-100 mb-6 leading-tight">
              Manage your fields from the palm of your hand
            </h2>
            <p className="text-base text-charcoal dark:text-gray-100-light leading-relaxed mb-8">
              Take the intelligence of the AgriNova platform anywhere. Our mobile apps for iOS and Android let you diagnose crop issues in real-time, record notes in the field, and view offline sensor logs.
            </p>

            {/* List of Mobile Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">Real-time Leaf Diagnostic Scanner</h4>
                  <p className="text-xs text-charcoal dark:text-gray-100-light/80 mt-0.5">Simply point your camera to diagnose 140+ fungal and bacterial pathogens in seconds.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">Robust Offline Mode</h4>
                  <p className="text-xs text-charcoal dark:text-gray-100-light/80 mt-0.5">No signal? No problem. Record field telemetry logs offline; the app syncs once it detects a connection.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">Interactive GPS Boundary Mapping</h4>
                  <p className="text-xs text-charcoal dark:text-gray-100-light/80 mt-0.5">Walk and plot field boundaries directly on satellite backgrounds to monitor spatial yield density.</p>
                </div>
              </div>
            </div>

            {/* App Badges */}
            <div className="flex flex-wrap gap-4">
              <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-charcoal text-white hover:bg-charcoal-light shadow-md transition-colors">
                {/* Simulated Apple icon */}
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M17.05,20.28c-.98,.95-2.05,.88-3.08,.4-1.09-.5-2.08-.48-3.24,0-1.44,.62-2.2,.44-3.06-.4C4.7,17.25 4.56,11.83 7.44,11.51c1.55,.17 2.44,.03 3.31,.03s1.95-1 3.71-.82c1.67,.17 2.83,.89 3.52,.96-3.21,2.02-2.43,6.38 .07,7.8C18.4,22.75 17.75,20.97 17.05,20.28M15.03,8.75c1.42-1.8 .09-4.21-1.07-4.5-1.92,.26-3.79,2.43-3.13,4.54 2.37,.22 3.36-1.39 4.2-2.04" />
                </svg>
                <div className="text-left leading-none">
                  <span className="text-[9px] font-bold text-white/50 block">Download on the</span>
                  <span className="font-display font-bold text-sm">App Store</span>
                </div>
              </a>

              <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-charcoal text-white hover:bg-charcoal-light shadow-md transition-colors">
                {/* Simulated Play Store icon */}
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M5,3.06C4.81,3.06 4.63,3.14 4.5,3.28C4.5,3.28 12.8,11.58 12.8,11.58C12.8,11.58 16.59,7.79 16.59,7.79C15.42,7.12 13.06,5.77 10.05,4.05C7.94,2.84 6.09,3.06 5,3.06M3.28,4.5C3.14,4.63 3.06,4.81 3.06,5V19C3.06,19.19 3.14,19.37 3.28,19.5L11.58,11.2L3.28,4.5M12.8,12.8L4.5,21.1C4.63,21.24 4.81,21.32 5,21.32C6.09,21.32 7.94,21.54 10.05,20.33C13.06,18.61 15.42,17.26 16.59,16.59L12.8,12.8M18,15.77C19.14,15.11 20.25,14.47 20.69,14.22C21.41,13.81 21.41,13.19 20.69,12.78C20.25,12.53 19.14,11.89 18,11.23L14.22,15L18,15.77Z" />
                </svg>
                <div className="text-left leading-none">
                  <span className="text-[9px] font-bold text-white/50 block">GET IT ON</span>
                  <span className="font-display font-bold text-sm">Google Play</span>
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

