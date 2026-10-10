import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Toggle visibility based on scroll position
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 right-6 z-[9998] group flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#1E293B] border border-primary/20 text-primary shadow-lg shadow-primary/10 hover:bg-primary hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/25 focus:outline-none animate-in fade-in slide-in-from-bottom-5"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={2.5} />
    </button>
  );
}

