'use client';

import { useContext } from 'react';
import { LanguageContext } from '@/context/LanguageProvider';

type Translations = {
  [key: string]: string;
};

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  const { translations, language, setLanguage } = context;

  const t = (key: keyof Translations) => {
    return translations[key] || key;
  };
  
  const toggleLanguage = (lang: 'es' | 'en') => {
    setLanguage(lang);
  }

  return { t, language, toggleLanguage };
}
