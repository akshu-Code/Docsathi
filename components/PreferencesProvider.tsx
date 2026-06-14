'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface PreferencesContextType {
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const PreferencesContext = createContext<PreferencesContextType>({
  fontSize: 'medium',
  setFontSize: () => {},
  theme: 'light',
  setTheme: () => {},
});

export const usePreferences = () => useContext(PreferencesContext);

export default function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load from localStorage on mount
    const savedSize = localStorage.getItem('pref-font-size') as 'small' | 'medium' | 'large';
    if (savedSize && ['small', 'medium', 'large'].includes(savedSize)) {
      setFontSizeState(savedSize);
    }
    const savedTheme = localStorage.getItem('pref-theme') as 'light' | 'dark';
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
      root.classList.add(`font-size-${fontSize}`);
    }
  }, [fontSize]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSizeState(size);
    localStorage.setItem('pref-font-size', size);
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('pref-theme', newTheme);
  };

  return (
    <PreferencesContext.Provider value={{ fontSize, setFontSize, theme, setTheme }}>
      {children}
    </PreferencesContext.Provider>
  );
}
