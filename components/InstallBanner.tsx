'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, X, Share } from 'lucide-react';

export default function InstallBanner() {
  const t = useTranslations();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Increment visit count
    const visits = parseInt(localStorage.getItem('docsaathi_visits') || '0', 10);
    const newVisits = visits + 1;
    localStorage.setItem('docsaathi_visits', newVisits.toString());

    // Detect if running in standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const detectIOS = /iphone|ipad|ipod/.test(ua);
    setIsIOS(detectIOS);

    // Listen for beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show only if visits >= 2
      if (newVisits >= 2) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and visits >= 2, show iOS install banner
    if (detectIOS && newVisits >= 2) {
      setIsVisible(true);
    }

    // FALLBACK FOR TESTING: If visits >= 2, show mock banner for testing on non-supported desktop browsers
    if (!detectIOS && newVisits >= 2) {
      // Show it anyway, users can click and we'll log or trigger if available
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install prompt outcome: ${outcome}`);
      setDeferredPrompt(null);
      setIsVisible(false);
    } else {
      // Fallback instruction for browsers where deferredPrompt is not supported (e.g. desktop firefox)
      alert("To install this app, please use the install option in your browser menu (usually a '+' icon in the URL bar or 'Add to Home screen' in settings).");
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:max-w-md bg-brand-surface-dark text-brand-on-dark border border-brand-surface-dark-elevated p-4 rounded-lg shadow-lg z-50 flex items-start gap-3 animate-slide-up">
      <div className="p-2 bg-brand-primary/10 rounded-md text-brand-primary flex-shrink-0">
        <Download className="w-6 h-6" />
      </div>
      
      <div className="flex-grow">
        <h5 className="text-sm font-semibold font-sans text-brand-on-dark mb-1">
          {t('install_prompt')}
        </h5>
        
        {isIOS ? (
          <p className="text-xs text-brand-on-dark-soft leading-normal mb-2 flex items-center gap-1.5 flex-wrap">
            <span>To install on iOS: Tap</span>
            <Share className="w-3.5 h-3.5 inline text-blue-400" />
            <span>then select</span>
            <span className="font-semibold text-brand-on-dark">"Add to Home Screen"</span>
          </p>
        ) : (
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-primary-active text-brand-on-primary rounded text-xs font-semibold shadow transition-colors"
            >
              {t('btn_install')}
            </button>
            <button
              onClick={handleClose}
              className="text-xs text-brand-on-dark-soft hover:text-brand-on-dark transition-colors"
            >
              {t('btn_close')}
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleClose}
        className="text-brand-on-dark-soft hover:text-brand-on-dark transition-colors flex-shrink-0"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
