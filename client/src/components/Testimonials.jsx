import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "The soil NPK probes completely saved my potato fields from chemical burn. My harvest yield rose by 34% this season while saving over ₹45,000 in urea inputs.",
      author: "Devendra Patil",
      role: "Owner, Patil Agri Farms",
      location: "Indore, MP",
      initials: "DP",
      color: "bg-green-500 text-white",
      rating: 5
    },
    {
      quote: "Deploying AgriNova across 1,200 acres gave us automated water telemetry. We cut irrigation electricity and water pumping bills by 38% in the first season.",
      author: "Sarah Jenkins",
      role: "Operations VP, GreenBasin Foods",
      location: "Oregon, USA",
      initials: "SJ",
      color: "bg-blue-500 text-white",
      rating: 5
    },
    {
      quote: "The Mandi price analytics updates are extremely precise. By timing my tomato sales to peak index values, I made 22% higher profit than going through regional middle agents.",
      author: "Rajesh Gowda",
      role: "Lead Farmer",
      location: "Kolar, Karnataka",
      initials: "RG",
      color: "bg-amber-500 text-white",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-bg-base relative overflow-hidden">
      <div className="absolute top-10 left-10 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-sm font-bold text-primary tracking-widest uppercase">Grower Success</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal dark:text-gray-100 mt-2 mb-4 leading-tight">
            Trusted by modern farmers worldwide
          </h2>
          <p className="text-base text-charcoal dark:text-gray-100-light font-normal">
            Discover how smallholders and commercial agriculture enterprises use AgriNova to optimize their operations.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-charcoal/5 dark:border-white/5 shadow-sm hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between"
            >
              {/* Quote Icon overlay */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-charcoal dark:text-gray-100-light/5 pointer-events-none" />

              <div>
                {/* Rating */}
                <div className="flex text-amber-500 gap-1 mb-6">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm italic text-charcoal dark:text-gray-100 leading-relaxed font-normal mb-8">
                  "{test.quote}"
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="flex items-center gap-4 pt-6 border-t border-charcoal/5 dark:border-white/5">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-display font-extrabold text-sm ${test.color} shrink-0 shadow-inner`}>
                  {test.initials}
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100">{test.author}</h4>
                  <p className="text-[10px] text-charcoal dark:text-gray-100-light/70 font-semibold">{test.role}</p>
                  <p className="text-[10px] text-primary font-bold">{test.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

