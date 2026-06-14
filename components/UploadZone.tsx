'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { UploadCloud, Camera, FileText, AlertCircle, FileImage } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export default function UploadZone({ onFileSelected }: UploadZoneProps) {
  const t = useTranslations();
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Validate size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setError(t('file_info') + ' (Selected: ' + (file.size / (1024 * 1024)).toFixed(1) + 'MB)');
      return false;
    }

    // Validate type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(t('file_info'));
      return false;
    }

    // Set details
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    setFileType(file.type === 'application/pdf' ? 'pdf' : 'image');
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraSelect = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/*"
        onChange={handleChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />

      {/* Main Drag Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`w-full border-2 border-dashed rounded-lg p-8 md:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-brand-primary bg-brand-surface-soft'
            : 'border-brand-hairline bg-brand-canvas hover:border-brand-primary-active'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-brand-surface-card rounded-full text-brand-primary shadow-subtle">
            <UploadCloud className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          
          <div className="space-y-1">
            <p className="text-base md:text-lg font-medium text-brand-ink">
              {t('upload_drag')}
            </p>
            <p className="text-xs text-brand-muted">
              {t('file_info')}
            </p>
          </div>

          {fileName && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-surface-soft border border-brand-hairline rounded-md text-sm text-brand-body font-medium">
              {fileType === 'pdf' ? (
                <FileText className="w-4 h-4 text-red-500" />
              ) : (
                <FileImage className="w-4 h-4 text-green-500" />
              )}
              <span className="truncate max-w-[200px]">{fileName}</span>
              <span className="text-xs text-brand-muted">({fileSize})</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Camera CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={triggerCameraSelect}
          className="w-full h-12 inline-flex items-center justify-center gap-2 bg-brand-surface-card border border-brand-hairline text-brand-ink font-medium rounded-md px-4 py-2.5 shadow-subtle hover:bg-brand-surface-soft hover:border-brand-primary/40 transition-colors cursor-pointer"
        >
          <Camera className="w-5 h-5 text-brand-primary" />
          <span>{t('upload_camera')}</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-risk-red/5 border border-risk-red/20 text-risk-red rounded-md text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Privacy notice */}
      <p className="text-xs text-center text-brand-muted mt-2">
        🔒 {t('privacy_notice')}
      </p>
    </div>
  );
}
