'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export interface ClauseType {
  title: string;
  risk: 'SAFE' | 'CAUTION' | 'RED_FLAG';
  originalText: string;
  plainExplanation: string;
  whyItMatters?: string;
}

interface ResultsCardProps {
  clause: ClauseType;
}

export default function ResultsCard({ clause }: ResultsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations();

  const riskConfigs = {
    SAFE: {
      color: 'text-risk-green bg-risk-green/10 border-risk-green/20',
      label: t('risk_badge_safe'),
      icon: ShieldCheck,
      emoji: '🟢'
    },
    CAUTION: {
      color: 'text-risk-yellow bg-risk-yellow/10 border-risk-yellow/20',
      label: t('risk_badge_caution'),
      icon: HelpCircle,
      emoji: '🟡'
    },
    RED_FLAG: {
      color: 'text-risk-red bg-risk-red/10 border-risk-red/20',
      label: t('risk_badge_red'),
      icon: AlertTriangle,
      emoji: '🔴'
    }
  };

  const currentConfig = riskConfigs[clause.risk] || riskConfigs.SAFE;
  const IconComponent = currentConfig.icon;

  return (
    <div className="border border-brand-hairline bg-brand-canvas rounded-lg overflow-hidden shadow-subtle hover:border-brand-primary/45 transition-all">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 focus:outline-none focus:bg-brand-surface-soft hover:bg-brand-surface-soft/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl leading-none flex-shrink-0" role="img" aria-label={clause.risk}>
            {currentConfig.emoji}
          </span>
          <div>
            <h4 className="text-base md:text-lg font-medium text-brand-ink font-sans">
              {clause.title}
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold border rounded-full ${currentConfig.color}`}>
            <IconComponent className="w-3.5 h-3.5" />
            <span>{currentConfig.label}</span>
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-brand-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-brand-muted" />
          )}
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-4 md:p-5 bg-brand-surface-soft/30 border-t border-brand-hairline space-y-4">
          {/* Plain Language Explanation */}
          <div>
            <span className="text-xs uppercase tracking-wider font-mono text-brand-muted block mb-1">
              {t('summary_title')}
            </span>
            <p className="text-brand-body text-base font-medium leading-relaxed">
              {clause.plainExplanation}
            </p>
          </div>

          {/* Why It Matters (for RED_FLAG or CAUTION) */}
          {(clause.risk === 'RED_FLAG' || clause.risk === 'CAUTION') && clause.whyItMatters && (
            <div className={`p-3.5 rounded-md border flex gap-3 ${
              clause.risk === 'RED_FLAG' 
                ? 'bg-risk-red/5 border-risk-red/15 text-risk-red' 
                : 'bg-risk-yellow/5 border-risk-yellow/15 text-risk-yellow'
            }`}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block mb-0.5">
                  {t('why_matters')}
                </span>
                <p className="text-sm font-medium leading-relaxed">
                  {clause.whyItMatters}
                </p>
              </div>
            </div>
          )}

          {/* Original Clause Text */}
          <div className="border border-brand-hairline rounded bg-brand-canvas p-3">
            <span className="text-xs uppercase tracking-wider font-mono text-brand-muted block mb-1.5">
              {t('original_text')}
            </span>
            <p className="text-sm text-brand-muted leading-relaxed font-mono whitespace-pre-line break-words max-h-40 overflow-y-auto pr-1">
              {clause.originalText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
