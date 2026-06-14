'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import RiskMeter from '@/components/RiskMeter';
import ResultsCard, { ClauseType } from '@/components/ResultsCard';
import ShareButtons from '@/components/ShareButtons';
import InstallBanner from '@/components/InstallBanner';
import LanguageSelector from '@/components/LanguageSelector';
import { ArrowLeft, RefreshCw, Send, Loader2, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface AnalysisResult {
  documentType: string;
  overallRisk: 'SAFE' | 'CAUTION' | 'HIGH_RISK';
  riskReason: string;
  summary: string[];
  clauses: ClauseType[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export default function ResultsPage() {
  const t = useTranslations();
  const router = useRouter();
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [documentContext, setDocumentContext] = useState<string>('');
  const [targetLang, setTargetLang] = useState<string>('English');
  const [loading, setLoading] = useState(true);

  // Q&A States
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  useEffect(() => {
    // Load result from sessionStorage
    const savedResult = sessionStorage.getItem('docsaathi_result');
    const savedContext = sessionStorage.getItem('docsaathi_context');
    const savedTargetLang = sessionStorage.getItem('docsaathi_target_lang');

    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
        setDocumentContext(savedContext || '');
        setTargetLang(savedTargetLang || 'English');
      } catch (err) {
        console.error('Failed to parse saved analysis result:', err);
      }
    }
    setLoading(false);
  }, []);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking || !documentContext) return;

    const userQuery = question.trim();
    setQuestion('');
    setAskError(null);
    setIsAsking(true);

    // Append user message to chat history
    setChatHistory((prev) => [...prev, { role: 'user', text: userQuery }]);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentContext: documentContext,
          question: userQuery,
          language: targetLang,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to get answer from AI.');
      }

      const data = await response.json();
      
      // Append assistant answer
      setChatHistory((prev) => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err: any) {
      console.error(err);
      setAskError(err.message || 'Failed to retrieve answer. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="asterisk-spike text-[#cc785c] animate-spin mb-4" style={{ width: '32px', height: '32px' }} />
          <p className="text-sm font-semibold tracking-wide uppercase text-[#6c6a64] font-mono">Loading Results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-brand-canvas text-brand-body flex flex-col font-sans">
        <header className="h-16 border-b border-brand-hairline flex items-center px-4 justify-between">
          <div className="flex items-center gap-1.5 font-display text-lg text-brand-ink">
            <span className="asterisk-spike text-brand-primary" />
            <span className="font-semibold tracking-tight">DocSaathi</span>
          </div>
        </header>
        <main className="flex-grow flex flex-col items-center justify-center p-6 space-y-4 text-center">
          <AlertCircle className="w-12 h-12 text-brand-primary animate-bounce" />
          <h2 className="text-2xl font-display text-brand-ink">No Analysis Data Found</h2>
          <p className="text-sm text-brand-muted max-w-sm">
            We couldn't find any recent legal document analysis results. Please upload a new contract.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center justify-center bg-brand-primary hover:bg-brand-primary-active text-brand-on-primary font-bold text-sm px-5 py-2.5 rounded-md transition-colors shadow"
          >
            Go to Upload Page
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-body flex flex-col font-sans transition-colors duration-200 pb-28 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 bg-brand-canvas border-b border-brand-hairline h-16 flex items-center px-4 justify-between z-10">
        <Link 
          href="/analyze" 
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('btn_analyze')}</span>
        </Link>
        
        <div className="flex items-center gap-1.5 font-display text-lg text-brand-ink">
          <span className="asterisk-spike text-brand-primary" />
          <span className="font-semibold tracking-tight">DocSaathi</span>
        </div>

        <LanguageSelector />
      </header>

      {/* Main Analysis Document (Target for PDF Capture) */}
      <main id="results-content" className="flex-grow max-w-3xl w-full mx-auto px-4 py-8 space-y-8 bg-brand-canvas">
        
        {/* Title */}
        <div className="border-b border-brand-hairline pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-3xl md:text-4xl text-brand-ink tracking-tight font-display capitalize">
            {result.documentType}
          </h1>
          <span className="text-xs uppercase tracking-wider font-mono text-brand-muted block">
            AI simplified in {targetLang}
          </span>
        </div>

        {/* Risk Assessment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <RiskMeter risk={result.overallRisk} reason={result.riskReason} />
          </div>

          {/* Plain Language Summary */}
          <div className="md:col-span-2 bg-brand-surface-card border border-brand-hairline p-6 rounded-lg shadow-subtle space-y-4">
            <h3 className="text-lg md:text-xl text-brand-ink font-semibold tracking-tight font-sans flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-primary" />
              <span>{t('summary_title')}</span>
            </h3>
            
            <ul className="space-y-3">
              {result.summary.map((point, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm md:text-base text-brand-body leading-relaxed">
                  <span className="text-brand-primary mt-1 flex-shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Clause-by-Clause Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl text-brand-ink font-display tracking-tight border-b border-brand-hairline pb-2">
            {t('clauses_title')}
          </h3>
          
          <div className="space-y-3">
            {result.clauses.map((clause, index) => (
              <ResultsCard key={index} clause={clause} />
            ))}
          </div>
        </div>

        {/* Follow-up Q&A Module (Hidden during PDF download via id) */}
        <div id="pdf-exclude-actions" className="space-y-6 pt-4">
          <div className="bg-brand-surface-card border border-brand-hairline p-5 rounded-lg shadow-subtle space-y-4">
            <h4 className="text-base md:text-lg text-brand-ink font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-brand-primary" />
              <span>Ask follow-up questions in {targetLang}</span>
            </h4>

            {/* Chat Thread */}
            {chatHistory.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto border border-brand-hairline rounded-md bg-brand-canvas p-3">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] uppercase font-mono tracking-wide text-brand-muted mb-0.5 px-1">
                      {msg.role === 'user' ? 'You' : 'DocSaathi'}
                    </span>
                    <div className={`p-3 rounded-lg text-sm leading-relaxed max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-brand-primary text-brand-on-primary rounded-tr-none'
                        : 'bg-brand-surface-soft text-brand-ink rounded-tl-none border border-brand-hairline'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isAsking && (
                  <div className="flex items-center gap-2 text-xs text-brand-muted font-mono p-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                    <span>Thinking...</span>
                  </div>
                )}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('ask_placeholder')}
                disabled={isAsking}
                className="flex-grow px-3 py-2 bg-brand-canvas border border-brand-hairline text-brand-ink text-sm rounded-md focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-subtle disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isAsking || !question.trim()}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-active text-brand-on-primary rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{t('ask_submit')}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {askError && (
              <p className="text-xs text-risk-red font-semibold">
                ⚠️ {askError}
              </p>
            )}
          </div>

          {/* Desktop Share Clusters */}
          <div className="hidden md:block border-t border-brand-hairline pt-6">
            <ShareButtons 
              documentType={result.documentType}
              overallRisk={result.overallRisk}
              riskReason={result.riskReason}
              summary={result.summary}
            />
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-brand-muted italic leading-relaxed pt-4">
          {t('disclaimer')}
        </p>

      </main>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-canvas/90 backdrop-blur-md border-t border-brand-hairline p-4 z-40 flex items-center shadow-lg">
        <ShareButtons 
          documentType={result.documentType}
          overallRisk={result.overallRisk}
          riskReason={result.riskReason}
          summary={result.summary}
        />
      </div>

      {/* PWA Install banner popup */}
      <InstallBanner />
    </div>
  );
}
