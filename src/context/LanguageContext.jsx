import { createContext, useContext, useState, useEffect } from 'react';
import en from '../translations/en';
import ta from '../translations/ta';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Check local storage for language preference
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Default to English, or you could detect browser language
      setLanguage('en');
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ta' : 'en';
    changeLanguage(newLang);
  };

  // The translation function
  const t = (key) => {
    const dictionary = language === 'ta' ? ta : en;
    return dictionary[key] || key; // fallback to key if not found
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
