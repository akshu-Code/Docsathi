'use client';

import React from 'react';
import { languages, getLanguageByCode } from '@/lib/languages';
import { useLanguage } from './I18nProvider';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { locale, setLocale, isLoading } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value);
  };

  const currentLanguage = getLanguageByCode(locale);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Globe className="absolute left-3 w-4 h-4 text-brand-muted pointer-events-none" />
      <select
        value={locale}
        onChange={handleLanguageChange}
        disabled={isLoading}
        className="pl-9 pr-8 py-2 bg-brand-canvas text-brand-ink border border-brand-hairline rounded-md text-sm font-medium shadow-subtle hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none cursor-pointer disabled:opacity-50 transition-colors"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
      <div className="absolute right-3 pointer-events-none flex items-center">
        <svg className="w-4 h-4 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
