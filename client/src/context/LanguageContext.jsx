import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', short: 'EN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', short: 'HI' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', short: 'GU' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', short: 'MR' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', short: 'PA' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', short: 'BN' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', short: 'TE' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', short: 'TA' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', short: 'KN' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', short: 'ML' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', short: 'OR' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', short: 'AS' },
  { code: 'ur', label: 'Urdu', native: 'اردو', short: 'UR' },
];

export const VALID_CODES = LANGUAGES.map(l => l.code);

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState(() => {
    const saved = localStorage.getItem('agrinova_language');
    if (saved && VALID_CODES.includes(saved)) {
      return saved;
    }
    const map = {
      English: 'en',
      Hindi: 'hi',
      Gujarati: 'gu',
      Marathi: 'mr',
      Punjabi: 'pa',
      Bengali: 'bn',
      Telugu: 'te',
      Tamil: 'ta',
      Kannada: 'kn',
      Malayalam: 'ml',
      Odia: 'or',
      Assamese: 'as',
      Urdu: 'ur'
    };
    if (saved && map[saved]) return map[saved];
    return 'en';
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const scriptLoadedRef = useRef(false);

  // Helper to remove any leftover Google Translate cookies
  const clearGoogleTranslateCookies = () => {
    const host = window.location.hostname;
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    if (host && host !== 'localhost') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${host}; path=/;`;
    }
  };

  // Helper to dynamically load Google Translate script ONLY when a non-English language is chosen
  const ensureGoogleTranslateLoaded = (targetLang) => {
    if (window.google?.translate?.TranslateElement) {
      applyComboSelection(targetLang);
      return;
    }

    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    // Define the global callback
    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,gu,mr,pa,bn,te,ta,kn,ml,or,as,ur',
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setTimeout(() => applyComboSelection(targetLang), 300);
      } catch (e) {
        console.warn('Translate element init error:', e);
      }
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  };

  const applyComboSelection = (langCode) => {
    try {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.warn('Translate combo error:', e);
    }
  };

  const applyGoogleTranslate = (langCode) => {
    const host = window.location.hostname;
    const cookieVal = `/auto/${langCode}`;

    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (host && host !== 'localhost') {
      document.cookie = `googtrans=${cookieVal}; domain=.${host}; path=/;`;
    }

    ensureGoogleTranslateLoaded(langCode);
    applyComboSelection(langCode);
  };

  const changeLanguage = (langCode) => {
    if (!VALID_CODES.includes(langCode)) return;
    setIsTranslating(true);
    setCurrentLangState(langCode);
    localStorage.setItem('agrinova_language', langCode);

    if (langCode === 'en') {
      // Revert to English cleanly
      clearGoogleTranslateCookies();
      applyComboSelection('en');

      // If an existing translation iframe was loaded, restore clean state
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change'));
      }
    } else {
      applyGoogleTranslate(langCode);
    }

    window.dispatchEvent(new CustomEvent('language_changed', { detail: { lang: langCode } }));

    setTimeout(() => {
      setIsTranslating(false);
    }, 400);
  };

  useEffect(() => {
    // If initial language is English, make sure cookies are clear so Google Translate doesn't run
    if (currentLang === 'en') {
      clearGoogleTranslateCookies();
    } else {
      applyGoogleTranslate(currentLang);
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        changeLanguage,
        isTranslating,
        languages: LANGUAGES,
        currentLanguageObj: LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0]
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
