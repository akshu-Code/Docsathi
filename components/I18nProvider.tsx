'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: async () => {},
  isLoading: true,
});

export const useLanguage = () => useContext(LanguageContext);

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<string>('en');
  const [messages, setMessages] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  const setLocale = async (newLocale: string) => {
    try {
      setIsLoading(true);
      // Load UI language translation file
      const msgs = (await import(`../messages/${newLocale}.json`)).default;
      setMessages(msgs);
      setLocaleState(newLocale);
      localStorage.setItem('NEXT_LOCALE', newLocale);
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (error) {
      console.error(`Failed to load translations for locale: ${newLocale}`, error);
      // Fallback to English messages on error
      if (newLocale !== 'en') {
        try {
          const fallbackMsgs = (await import(`../messages/en.json`)).default;
          setMessages(fallbackMsgs);
          setLocaleState('en');
        } catch (e) {
          console.error('Failed to load English fallback translations', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initLocale = async () => {
      let detectedLocale = '';
      
      if (typeof window !== 'undefined') {
        // 1. Check localStorage
        detectedLocale = localStorage.getItem('NEXT_LOCALE') || '';

        // 2. Check cookies
        if (!detectedLocale) {
          const match = document.cookie.match(/(^| )NEXT_LOCALE=([^;]+)/);
          if (match) detectedLocale = match[2];
        }

        // 3. Check browser settings
        if (!detectedLocale && navigator.language) {
          const browserLang = navigator.language.split('-')[0];
          const supported = [
            'hi', 'en', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa',
            'ur', 'ar', 'fr', 'es', 'pt', 'de', 'id', 'sw', 'vi', 'tr'
          ];
          if (supported.includes(browserLang)) {
            detectedLocale = browserLang;
          }
        }
      }

      detectedLocale = detectedLocale || 'en';
      await setLocale(detectedLocale);
    };

    initLocale();
  }, []);

  if (isLoading && Object.keys(messages).length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="asterisk-spike text-[#cc785c] animate-spin mb-4" style={{ width: '32px', height: '32px' }} />
          <p className="text-sm font-medium tracking-wide uppercase text-[#6c6a64] font-mono">Loading / loading...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, isLoading }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}
