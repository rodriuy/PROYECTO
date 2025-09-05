'use client';

import React, { createContext, useState, useMemo } from 'react';
import es from '@/locales/es.json';
import en from '@/locales/en.json';

type Language = 'es' | 'en';

type Translations = typeof es;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = { es, en };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const contextValue = useMemo(() => {
    // Set html lang attribute
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
    return {
      language,
      setLanguage,
      translations: translations[language],
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}
