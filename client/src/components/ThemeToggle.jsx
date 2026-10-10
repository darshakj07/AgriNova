import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl hover:bg-primary/5 text-charcoal dark:text-gray-100/60 hover:text-primary relative transition-colors focus:outline-none flex items-center justify-center"
      aria-label="Toggle Dark Mode"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 0 : 1,
            opacity: theme === 'dark' ? 0 : 1,
            rotate: theme === 'dark' ? -90 : 0
          }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="w-5 h-5" />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 1 : 0,
            opacity: theme === 'dark' ? 1 : 0,
            rotate: theme === 'dark' ? 0 : 90
          }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="w-5 h-5" />
        </motion.div>
      </div>
    </button>
  );
}
