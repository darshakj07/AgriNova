import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector({ variant = 'default', className = '' }) {
  const { currentLang, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const active = languages.find((l) => l.code === currentLang) || languages[0];

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return languages;
    const q = searchQuery.toLowerCase().trim();
    return languages.filter(
      (l) =>
        l.label.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.short.toLowerCase().includes(q)
    );
  }, [languages, searchQuery]);

  // Mobile / Full-width drawer variant
  if (variant === 'full') {
    return (
      <div className={`notranslate rounded-2xl border border-charcoal/10 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 p-3 space-y-2.5 ${className}`}>
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-charcoal dark:text-gray-100">
            <Globe className="w-4 h-4 text-primary" />
            Language / भाषा
          </span>
          <span className="text-primary font-bold">{active.native}</span>
        </div>

        {/* Scrollable horizontally or grid */}
        <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'bg-charcoal/5 dark:bg-white/5 text-charcoal dark:text-gray-200 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <span className="font-semibold truncate max-w-full">{lang.native}</span>
                <span className={`text-[9px] truncate max-w-full ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  {lang.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact navbar pill button with searchable dropdown
  return (
    <div className={`relative notranslate ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-charcoal dark:text-gray-100/90 hover:text-primary hover:bg-primary/5 border border-charcoal/10 dark:border-white/10 transition-colors focus:outline-none cursor-pointer"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-primary shrink-0" />
        <span className="font-bold">{active.short}</span>
        <span className="hidden xl:inline text-xs opacity-75">({active.native})</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1E293B] border border-charcoal/10 dark:border-white/10 shadow-2xl py-2 z-50 text-left animate-in fade-in zoom-in-95 duration-100">
          
          {/* Header & Search */}
          <div className="px-3 pb-2 border-b border-charcoal/5 dark:border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Select Language</span>
              <span className="text-[10px] text-primary">{languages.length} Indian Languages</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language..."
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#0F172A] border border-charcoal/10 dark:border-white/10 text-xs font-medium text-charcoal dark:text-gray-100 focus:outline-none focus:border-primary/40"
              />
            </div>
          </div>

          {/* Languages list */}
          <div className="max-h-64 overflow-y-auto divide-y divide-charcoal/5 dark:divide-white/5 py-1">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'text-primary bg-primary/10 font-bold'
                        : 'text-charcoal dark:text-gray-200 hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold leading-tight">{lang.native}</span>
                      <span className="text-[10px] text-gray-400 leading-tight">{lang.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-xs text-gray-400 font-medium">
                No matching language
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
