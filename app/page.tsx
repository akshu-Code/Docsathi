'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSelector from '@/components/LanguageSelector';
import UploadZone from '@/components/UploadZone';
import InstallBanner from '@/components/InstallBanner';
import { ArrowRight, Shield, Zap, Sparkles, FileText, CheckCircle2, AlertTriangle, Settings, Eye } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const t = useTranslations();
  const router = useRouter();

  // Carry the file forward to the analyze page by saving to sessionStorage
  const handleFileSelected = (file: File) => {
    // Read the file as base64 or arraybuffer to store, or just save metadata and let them choose language
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        sessionStorage.setItem('temp_uploaded_file_data', reader.result as string);
        sessionStorage.setItem('temp_uploaded_file_name', file.name);
        sessionStorage.setItem('temp_uploaded_file_type', file.type);
        router.push('/analyze');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-body flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. Top Navigation */}
      <header className="sticky top-0 bg-brand-canvas border-b border-brand-hairline h-16 flex items-center px-4 md:px-8 justify-between z-10">
        <div className="flex items-center gap-2 font-display text-2xl text-brand-ink">
          <span className="asterisk-spike text-brand-primary" />
          <span className="font-semibold tracking-tight">DocSaathi</span>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link 
            href="/settings" 
            className="flex items-center gap-1.5 text-sm font-medium text-brand-ink hover:text-brand-primary transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{t('app_nav_settings')}</span>
          </Link>
          <Link 
            href="/analyze" 
            className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-active text-brand-on-primary text-sm font-semibold rounded-md transition-all shadow-subtle flex items-center gap-1.5"
          >
            <span>Try App</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </nav>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-6xl w-full mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Headline */}
        <div className="lg:col-span-6 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/15 text-xs font-semibold uppercase tracking-wider font-mono rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Document Assistant</span>
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-brand-ink font-display leading-[1.05] tracking-[-1.5px] font-normal">
            {t('hero_title')}
          </h1>
          
          <p className="text-lg md:text-xl text-brand-body leading-relaxed max-w-lg font-sans">
            {t('hero_subtitle')}
          </p>

          <div className="flex items-center gap-4 pt-2">
            <Link 
              href="/analyze" 
              className="px-5 py-3 bg-brand-primary hover:bg-brand-primary-active text-brand-on-primary font-semibold text-sm rounded-md shadow transition-colors flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#mockup-preview" 
              className="px-5 py-3 bg-brand-canvas border border-brand-hairline text-brand-ink hover:bg-brand-surface-soft font-semibold text-sm rounded-md shadow-subtle transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>See Demo</span>
            </a>
          </div>
        </div>

        {/* Right Upload Zone Card */}
        <div className="lg:col-span-6 bg-brand-surface-card border border-brand-hairline rounded-xl p-6 md:p-8 shadow-subtle">
          <UploadZone onFileSelected={handleFileSelected} />
        </div>
      </section>

      {/* 3. Trust Strip */}
      <section className="bg-brand-surface-cream-strong border-y border-brand-hairline py-4 px-4 text-center text-xs md:text-sm font-medium text-brand-ink tracking-wide font-mono">
        {t('trust_strip')}
      </section>

      {/* 4. Three-Step Visual (Steps Cards) */}
      <section className="max-w-6xl w-full mx-auto px-4 md:px-8 py-20 space-y-12">
        <h2 className="text-3xl md:text-4xl text-brand-ink font-display text-center tracking-tight">
          How DocSaathi Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-brand-surface-card border border-brand-hairline p-8 rounded-lg shadow-subtle space-y-4">
            <div className="w-10 h-10 bg-brand-primary/10 border border-brand-primary/15 rounded-full flex items-center justify-center text-brand-primary font-mono font-bold text-lg">
              1
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-brand-ink font-sans">
              {t('step1_title')}
            </h3>
            <p className="text-sm text-brand-body leading-relaxed">
              {t('step1_desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-brand-surface-card border border-brand-hairline p-8 rounded-lg shadow-subtle space-y-4">
            <div className="w-10 h-10 bg-brand-primary/10 border border-brand-primary/15 rounded-full flex items-center justify-center text-brand-primary font-mono font-bold text-lg">
              2
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-brand-ink font-sans">
              {t('step2_title')}
            </h3>
            <p className="text-sm text-brand-body leading-relaxed">
              {t('step2_desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-brand-surface-card border border-brand-hairline p-8 rounded-lg shadow-subtle space-y-4">
            <div className="w-10 h-10 bg-brand-primary/10 border border-brand-primary/15 rounded-full flex items-center justify-center text-brand-primary font-mono font-bold text-lg">
              3
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-brand-ink font-sans">
              {t('step3_title')}
            </h3>
            <p className="text-sm text-brand-body leading-relaxed">
              {t('step3_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Product Preview (Dark Navy Mockup Card) */}
      <section id="mockup-preview" className="bg-brand-surface-dark py-20 px-4 md:px-8 border-t border-brand-surface-dark-elevated">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Description */}
          <div className="lg:col-span-5 space-y-6 text-brand-on-dark">
            <h2 className="text-3xl md:text-4xl text-brand-on-dark font-display tracking-tight leading-tight">
              A Contract Verdict in Seconds
            </h2>
            <p className="text-brand-on-dark-soft text-sm md:text-base leading-relaxed">
              No need to struggle with nested clauses, confusing legal terms, or fine-prints. DocSaathi acts as your personal legal advisor, giving you immediate verdicts and identifying warning signals cleanly.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-risk-green flex-shrink-0" />
                <span>Auto-categorizes clauses by safe, caution, and red flag levels</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-risk-green flex-shrink-0" />
                <span>Translates explanations into 20 languages instantly</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-risk-green flex-shrink-0" />
                <span>Secure local-only execution: we do not store any document data</span>
              </div>
            </div>
          </div>

          {/* Right Mockup (Actual Page Preview) */}
          <div className="lg:col-span-7 bg-brand-surface-dark-elevated border border-brand-surface-dark/20 p-5 rounded-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-surface-dark p-2 text-xs text-brand-on-dark-soft">
              <span className="font-semibold text-brand-on-dark">DocSaathi Preview</span>
              <span className="font-mono">Verdict: Caution</span>
            </div>

            {/* Simulated Risk Banner */}
            <div className="flex items-center justify-between gap-4 p-4 bg-brand-surface-dark rounded-md border border-brand-surface-dark-elevated">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-risk-yellow/10 text-risk-yellow border border-risk-yellow/20">
                  🟡 Caution
                </span>
                <p className="text-sm font-semibold text-brand-on-dark">
                  This contract has 2 high-risk clauses you should know about.
                </p>
              </div>
              
              {/* Micro-gauge render */}
              <div className="w-12 h-12 rounded-full border-4 border-risk-yellow/25 border-t-risk-yellow rotate-45" />
            </div>

            {/* Sample Clauses Accordions */}
            <div className="space-y-3">
              <div className="p-4 bg-brand-surface-dark rounded-md border border-brand-surface-dark-elevated flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-risk-red">🔴</span>
                  <span className="text-sm font-medium text-brand-on-dark">Termination Clause</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-risk-red/10 text-risk-red border border-risk-red/20 rounded-full">
                  Red Flag
                </span>
              </div>

              <div className="p-4 bg-brand-surface-dark rounded-md border border-brand-surface-dark-elevated flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-risk-yellow">🟡</span>
                  <span className="text-sm font-medium text-brand-on-dark">Late Payment Penalties</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-risk-yellow/10 text-risk-yellow border border-risk-yellow/20 rounded-full">
                  Caution
                </span>
              </div>

              <div className="p-4 bg-brand-surface-dark rounded-md border border-brand-surface-dark-elevated flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-risk-green">🟢</span>
                  <span className="text-sm font-medium text-brand-on-dark">Privacy & NDA Policy</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-risk-green/10 text-risk-green border border-risk-green/20 rounded-full">
                  Safe
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Dark Footer */}
      <footer className="bg-brand-surface-dark text-brand-on-dark-soft border-t border-brand-surface-dark-elevated py-12 px-4 md:px-8">
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-brand-on-dark text-xl font-display">
            <span className="asterisk-spike text-brand-primary" />
            <span className="font-semibold tracking-tight">DocSaathi</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center text-xs">
            <Link href="/settings" className="hover:text-brand-on-dark transition-colors">Preferences</Link>
            <span className="text-brand-surface-dark-elevated">·</span>
            <Link href="/analyze" className="hover:text-brand-on-dark transition-colors">Upload Document</Link>
            <span className="text-brand-surface-dark-elevated">·</span>
            <span className="text-brand-on-dark-soft">100% Secure & Private</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs">Language:</span>
            <LanguageSelector />
          </div>
        </div>
        
        <div className="max-w-6xl w-full mx-auto text-center text-[10px] text-brand-on-dark-soft/50 border-t border-brand-surface-dark-elevated/40 mt-8 pt-4">
          © 2026 DocSaathi · Dedicated to Legal Accessibility. All Rights Reserved.
        </div>
      </footer>

      {/* Install Banner */}
      <InstallBanner />
    </div>
  );
}
