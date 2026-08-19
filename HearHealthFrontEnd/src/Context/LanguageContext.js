import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSLATIONS } from '../Constants/LanguageConfig';

export const LanguageContext = createContext({
  lang: 'VN',
  setLang: () => {},
  toggleLanguage: () => {},
  t: TRANSLATIONS.VN
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState('VN');

  useEffect(() => {
    // Load persisted language
    const loadLang = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('app_language');
        if (savedLang === 'VN' || savedLang === 'EN') {
          setLangState(savedLang);
        }
      } catch (error) {
        console.error("Error loading language from storage", error);
      }
    };
    loadLang();
  }, []);

  const setLang = async (newLang) => {
    setLangState(newLang);
    try {
      await AsyncStorage.setItem('app_language', newLang);
    } catch (error) {
      console.error("Error saving language to storage", error);
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'VN' ? 'EN' : 'VN');
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.VN;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};


