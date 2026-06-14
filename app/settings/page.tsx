'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/components/I18nProvider';
import { usePreferences } from '@/components/PreferencesProvider';
import { languages } from '@/lib/languages';
import { ArrowLeft, Moon, Sun, Type, Globe } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const t = useTranslations();
  const { locale, setLocale } = useLanguage();
  const { fontSize, setFontSize, theme, setTheme } = usePreferences();

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-body flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 bg-brand-canvas border-b border-brand-hairline h-16 flex items-center px-4 justify-between z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-ink hover:text-brand-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('btn_save')}</span>
        </Link>
        <div className="flex items-center gap-1.5 font-display text-lg text-brand-ink">
          <span className="asterisk-spike text-brand-primary" />
          <span className="font-semibold tracking-tight">DocSaathi</span>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </header>

      {/* Content */}
      <main className="flex-grow max-w-2xl w-full mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl text-brand-ink tracking-tight font-display">
            {t('title')}
          </h1>
        </div>

        <div className="bg-brand-surface-card border border-brand-hairline rounded-lg p-6 space-y-6 shadow-subtle">
          {/* UI Language Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider font-mono text-brand-muted">
              <Globe className="w-4 h-4 text-brand-primary" />
              <span>{t('ui_lang')}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={`px-3 py-2 text-sm font-medium border rounded-md text-center transition-all cursor-pointer ${
                    locale === lang.code
                      ? 'bg-brand-primary border-brand-primary text-brand-on-primary'
                      : 'bg-brand-canvas border-brand-hairline text-brand-ink hover:border-brand-primary/40'
                  }`}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-brand-hairline" />

          {/* Text Size Scale */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider font-mono text-brand-muted">
              <Type className="w-4 h-4 text-brand-primary" />
              <span>{t('font_size')}</span>
            </label>
            <div className="flex rounded-md border border-brand-hairline overflow-hidden shadow-subtle max-w-sm">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-2 text-sm font-medium text-center transition-colors cursor-pointer capitalize ${
                    fontSize === size
                      ? 'bg-brand-primary text-brand-on-primary'
                      : 'bg-brand-canvas text-brand-ink hover:bg-brand-surface-soft'
                  }`}
                >
                  {t(`font_${size}`)}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-brand-hairline" />

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider font-mono text-brand-muted">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-brand-primary" />
                ) : (
                  <Sun className="w-4 h-4 text-brand-primary" />
                )}
                <span>{t('dark_mode')}</span>
              </label>
            </div>
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                theme === 'dark' ? 'bg-brand-primary' : 'bg-[#e6dfd8] dark:bg-brand-hairline'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-brand-hairline text-center text-xs text-brand-muted">
        © 2026 DocSaathi · Premium Legal Simplifier
      </footer>
    </div>
  );
}
