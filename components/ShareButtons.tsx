'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Share2, FileDown, Loader2 } from 'lucide-react';

interface ShareButtonsProps {
  documentType: string;
  overallRisk: 'SAFE' | 'CAUTION' | 'HIGH_RISK';
  riskReason: string;
  summary: string[];
}

export default function ShareButtons({ documentType, overallRisk, riskReason, summary }: ShareButtonsProps) {
  const t = useTranslations();
  const [isDownloading, setIsDownloading] = useState(false);

  const getWhatsAppLink = () => {
    if (typeof window === 'undefined') return '';
    const riskEmoji = overallRisk === 'SAFE' ? '🟢' : overallRisk === 'CAUTION' ? '🟡' : '🔴';
    
    // Construct message
    let text = `*DocSaathi Legal Simplifier Analysis*\n\n`;
    text += `📄 *Document:* ${documentType}\n`;
    text += `${riskEmoji} *Risk Level:* ${overallRisk}\n`;
    text += `💡 *Verdict:* ${riskReason}\n\n`;
    text += `*Summary of Key Points:*\n`;
    summary.slice(0, 3).forEach((bullet) => {
      text += `• ${bullet}\n`;
    });
    text += `\nSimplify your contracts at: ${window.location.origin}`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = document.getElementById('results-content');
      if (!element) {
        throw new Error('Analysis content container not found');
      }

      // Hide elements not needed in PDF (like follow-up input)
      const actionBlock = document.getElementById('pdf-exclude-actions');
      if (actionBlock) actionBlock.style.display = 'none';

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#faf9f5', // Match brand.canvas color
        logging: false,
      });

      // Show actions again
      if (actionBlock) actionBlock.style.display = '';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Multi-page handling
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`DocSaathi-${documentType.replace(/\s+/g, '-')}-Analysis.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      {/* WhatsApp Share Button */}
      <a
        href={getWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-[140px] h-10 flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-medium text-sm rounded-md px-4 py-2 transition-colors duration-250 cursor-pointer shadow-subtle"
      >
        <Share2 className="w-4 h-4" />
        <span>{t('btn_whatsapp')}</span>
      </a>

      {/* PDF Download Button */}
      <button
        onClick={handleDownloadPDF}
        disabled={isDownloading}
        className="flex-1 min-w-[140px] h-10 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-active text-brand-on-primary font-medium text-sm rounded-md px-4 py-2 transition-colors duration-250 disabled:opacity-75 disabled:cursor-not-allowed shadow-subtle"
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        <span>{isDownloading ? 'Downloading...' : t('btn_download')}</span>
      </button>
    </div>
  );
}
