'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/components/I18nProvider';
import { languages, getLanguageByCode } from '@/lib/languages';
import UploadZone from '@/components/UploadZone';
import LanguageSelector from '@/components/LanguageSelector';
import { ArrowLeft, Globe, HelpCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AnalyzePage() {
  const t = useTranslations();
  const router = useRouter();
  const { locale } = useLanguage();
  
  // Default target language for explanation is the current UI locale
  const [targetLang, setTargetLang] = useState(locale);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Helper to convert base64 dataURL back to File object
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Check if a file was carried over from the landing page
  useEffect(() => {
    const fileData = sessionStorage.getItem('temp_uploaded_file_data');
    const fileName = sessionStorage.getItem('temp_uploaded_file_name');
    const fileType = sessionStorage.getItem('temp_uploaded_file_type');

    if (fileData && fileName && fileType) {
      try {
        const file = dataURLtoFile(fileData, fileName);
        setSelectedFile(file);
        // Clear temp storage so refreshing doesn't lock it
        sessionStorage.removeItem('temp_uploaded_file_data');
        sessionStorage.removeItem('temp_uploaded_file_name');
        sessionStorage.removeItem('temp_uploaded_file_type');
      } catch (e) {
        console.error('Failed to parse temporary file from landing page:', e);
      }
    }
  }, []);

  // Sync target language if UI language changes before selecting override
  useEffect(() => {
    setTargetLang(locale);
  }, [locale]);

  // Loading text steps
  const loadingTexts = [
    t('loading_1'),
    t('loading_2'),
    t('loading_3'),
  ];

  // Rotate loading text messages
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingTexts.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please upload a document first.');
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Pass the native name of the target language to Claude prompt
    const targetLangDetails = getLanguageByCode(targetLang);
    formData.append('language', targetLangDetails.name);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze document.');
      }

      const data = await response.json();
      
      // Save data + raw document content/text for follow-up questions
      // Read file text or base64 to store locally in session storage
      let documentContextText = '';
      if (selectedFile.type === 'application/pdf') {
        // We will store mock or try to request it if text extraction was returned
        // Let's store the clauses text as baseline if we can't extract raw
        documentContextText = data.clauses.map((c: any) => `${c.title}:\n${c.originalText}`).join('\n\n');
      } else {
        documentContextText = `[Image Analysis Context: ${data.documentType}]`;
      }

      sessionStorage.setItem('docsaathi_result', JSON.stringify(data));
      sessionStorage.setItem('docsaathi_context', documentContextText);
      sessionStorage.setItem('docsaathi_target_lang', targetLangDetails.name);

      router.push('/results');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please check your network and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-body flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 bg-brand-canvas border-b border-brand-hairline h-16 flex items-center px-4 justify-between z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('app_nav_home')}</span>
        </Link>
        
        <div className="flex items-center gap-1.5 font-display text-lg text-brand-ink">
          <span className="asterisk-spike text-brand-primary" />
          <span className="font-semibold tracking-tight">DocSaathi</span>
        </div>

        <LanguageSelector />
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-2xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        {isLoading ? (
          /* Sleek Skeleton Loading state */
          <div className="w-full py-16 text-center space-y-8 animate-pulse">
            <div className="flex justify-center">
              <div className="p-5 bg-brand-surface-card rounded-full shadow-subtle border border-brand-hairline">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-display text-brand-ink transition-all duration-300">
                {loadingTexts[loadingStep]}
              </h2>
              <p className="text-sm text-brand-muted max-w-sm mx-auto leading-relaxed">
                Analyzing clauses, extracting parameters, and rewriting legally safe summaries. This might take a few moments.
              </p>
            </div>

            {/* Skeleton Loading Card */}
            <div className="max-w-md mx-auto border border-brand-hairline bg-brand-surface-card rounded-lg p-6 space-y-4">
              <div className="h-6 bg-brand-hairline rounded w-3/4 mx-auto" />
              <div className="h-4 bg-brand-hairline rounded w-5/6 mx-auto" />
              <div className="h-4 bg-brand-hairline rounded w-2/3 mx-auto" />
            </div>
          </div>
        ) : (
          /* Normal Upload State */
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl text-brand-ink tracking-tight font-display">
                {t('upload_title')}
              </h1>
            </div>

            {/* Upload Zone */}
            <div className="bg-brand-surface-card border border-brand-hairline rounded-lg p-5 shadow-subtle">
              <UploadZone onFileSelected={handleFileSelected} />
            </div>

            {/* Language Selector & CTA Button */}
            {selectedFile && (
              <div className="bg-brand-surface-card border border-brand-hairline rounded-lg p-5 space-y-4 shadow-subtle">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold uppercase tracking-wider font-mono text-brand-muted flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-brand-primary" />
                    <span>{t('output_lang')}</span>
                  </label>
                  
                  <div className="relative">
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="w-full pl-3 pr-10 py-3 bg-brand-canvas text-brand-ink border border-brand-hairline rounded-md text-base font-semibold shadow-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none cursor-pointer"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.nativeName} ({lang.name})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-risk-red/5 border border-risk-red/20 text-risk-red rounded-md text-sm font-semibold">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="w-full h-12 inline-flex items-center justify-center bg-whatsapp hover:bg-green-700 text-white font-bold text-base rounded-md px-6 py-3 shadow-subtle transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  {t('btn_analyze')}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-brand-hairline text-center text-xs text-brand-muted bg-brand-canvas">
        © 2026 DocSaathi · Premium Legal Simplifier
      </footer>
    </div>
  );
}
