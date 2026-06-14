'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface RiskMeterProps {
  risk: 'SAFE' | 'CAUTION' | 'HIGH_RISK';
  reason?: string;
  className?: string;
}

export default function RiskMeter({ risk, reason, className = '' }: RiskMeterProps) {
  const t = useTranslations();

  // Map risk level to details
  const config = {
    SAFE: {
      color: '#16a34a', // Risk Green
      bgClass: 'bg-risk-green/10',
      textClass: 'text-risk-green border-risk-green/20',
      label: t('risk_safe'),
      emoji: '🟢',
      angle: 30, // Angle on a scale of 0 to 180
    },
    CAUTION: {
      color: '#d97706', // Risk Yellow
      bgClass: 'bg-risk-yellow/10',
      textClass: 'text-risk-yellow border-risk-yellow/20',
      label: t('risk_caution'),
      emoji: '🟡',
      angle: 90,
    },
    HIGH_RISK: {
      color: '#dc2626', // Risk Red
      bgClass: 'bg-risk-red/10',
      textClass: 'text-risk-red border-risk-red/20',
      label: t('risk_high'),
      emoji: '🔴',
      angle: 150,
    },
  }[risk] || {
    color: '#6b7280',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-500 border-gray-200',
    label: 'Unknown',
    emoji: '⚪',
    angle: 0,
  };

  // SVG parameters
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half circle (180 deg)
  
  // Angle conversion: 0 to 180 degrees map to dashoffset
  const pointerRotation = config.angle - 90; // Rotate relative to top (90 deg)

  return (
    <div className={`flex flex-col items-center justify-center p-6 bg-brand-surface-card border border-brand-hairline rounded-lg shadow-subtle ${className}`}>
      {/* Gauge SVG */}
      <div className="relative w-48 h-28 flex items-center justify-center overflow-hidden">
        <svg className="w-full h-full transform translate-y-4" viewBox="0 0 200 120">
          {/* Background Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e6dfd8"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="dark:stroke-brand-hairline"
          />
          {/* Segments Colors */}
          {/* Safe (Green) path */}
          <path
            d="M 20 100 A 80 80 0 0 1 73 45"
            fill="none"
            stroke="#16a34a"
            strokeWidth={strokeWidth}
          />
          {/* Caution (Yellow) path */}
          <path
            d="M 73 45 A 80 80 0 0 1 127 45"
            fill="none"
            stroke="#d97706"
            strokeWidth={strokeWidth}
          />
          {/* High Risk (Red) path */}
          <path
            d="M 127 45 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#dc2626"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Gauge needle / pointer */}
          <g transform={`translate(100, 100) rotate(${pointerRotation})`}>
            <polygon points="-4,0 0,-92 4,0" fill={config.color} className="transition-transform duration-1000 ease-out" />
            <circle cx="0" cy="0" r="8" fill={config.color} />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Verdict Info */}
      <div className="text-center mt-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-base font-semibold border rounded-full ${config.bgClass} ${config.textClass}`}>
          <span>{config.emoji}</span>
          <span>{config.label}</span>
        </span>
        
        {reason && (
          <p className="mt-3 text-sm md:text-base font-medium text-brand-body max-w-sm">
            {reason}
          </p>
        )}
      </div>
    </div>
  );
}
