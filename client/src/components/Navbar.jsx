import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Menu, X, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Products', href: '#products' },
    { name: 'Weather', href: '#weather' },
    { name: 'Mandi Prices', href: '#mandi' },
    { name: 'Benefits', href: '#benefits' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'glassmorphism py-3 shadow-sm shadow-primary/5' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-charcoal dark:text-gray-100">
              Agri<span className="text-primary">Nova</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-charcoal dark:text-gray-100/80 hover:text-primary transition-colors relative group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-sm font-medium text-charcoal dark:text-gray-100/80 hover:text-primary transition-colors">
              <Globe className="w-4 h-4" />
              <span>EN</span>
            </button>
            <ThemeToggle />
            <Link to="/login" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-charcoal dark:text-gray-100 hover:text-primary border border-charcoal/10 dark:border-white/10 hover:border-primary/20 transition-all duration-300">
              Log In
            </Link>
            <Link to="/register" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center gap-2 group">
              Sign Up
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-primary/10 text-charcoal dark:text-gray-100 transition-colors focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Slide-over */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glassmorphism border-t border-charcoal/5 dark:border-white/5 overflow-hidden shadow-lg"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl text-base font-semibold text-charcoal dark:text-gray-100 hover:bg-primary/10 hover:text-primary transition-all"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 border-t border-charcoal/10 dark:border-white/10 flex flex-col gap-3 px-4">
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold border border-charcoal/20 text-charcoal dark:text-gray-100">
                  <Globe className="w-5 h-5" />
                  Language: English
                </button>
                <Link to="/login" onClick={() => setIsOpen(false)} className="py-3 rounded-xl text-base font-bold border border-charcoal/20 text-charcoal dark:text-gray-100 text-center">
                  Log In
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="py-3 rounded-xl text-base font-bold text-white bg-primary hover:bg-primary-dark text-center shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  Sign Up
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

