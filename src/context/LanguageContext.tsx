/**
 * LanguageContext — Manages application active language state ('ar' | 'en')
 * Uses platform-safe storage: SQLite on native, localStorage on web.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { translations, Language, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'GROWTHOS_APP_LANGUAGE';

/**
 * Platform-safe storage helpers
 * On web: uses localStorage
 * On native: uses a simple in-memory fallback (language resets on app restart)
 * This avoids accessing web-only APIs on native which can cause subtle crashes.
 */
let _savedLang: Language | null = null;

function loadSavedLanguage(): Language | null {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'ar' || saved === 'en') return saved;
    } else if (_savedLang) {
      return _savedLang;
    }
  } catch (e) {
    // Silently ignore storage errors
  }
  return null;
}

function persistLanguage(lang: Language) {
  try {
    _savedLang = lang;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  } catch (e) {
    // Silently ignore storage errors
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const saved = loadSavedLanguage();
    if (saved) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    persistLanguage(lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.ar;
    let str: string = langDict[key] || translations.ar[key] || String(key);

    if (params) {
      Object.keys(params).forEach((paramKey) => {
        str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
      });
    }

    return str;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
