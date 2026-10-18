'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { uploadGarmentImageAction } from '@/lib/products/mutations';

interface ImageUploaderProps {
  initialImageUrl?: string | null;
  onImageUploaded: (storagePathOrUrl: string) => void;
}

export function ImageUploader({ initialImageUrl, onImageUploaded }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(false);

    // 1. Client-side Size Validation (8MB limit)
    const maxBytes = 8 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError('Image exceeds the maximum allowed size of 8 MB.');
      return;
    }

    // 2. MIME Type Validation
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setUploadError('Invalid format. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onImageUploaded('');

    // 3. Server Upload via Server Action
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadGarmentImageAction(formData);

      if (res.success && res.publicUrl) {
        setUploadSuccess(true);
        onImageUploaded(res.publicUrl);
      }
    } catch (err: unknown) {
      console.warn('Upload error:', err);
      setUploadError(
        err instanceof Error
          ? err.message
          : 'Failed to upload image to Supabase Storage. Check bucket configuration.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setUploadSuccess(false);
    setUploadError(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full flex flex-col space-y-3">
      <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
        Dress Photography <span className="text-red-500">*</span>
      </label>

      {/* Upload Box */}
      {!previewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[16/9] md:aspect-[21/9] border-2 border-dashed border-[#E8E2D8] hover:border-[#7A1F2B] rounded-2xl bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6 text-[#7A1F2B]" />
          </div>
          <p className="text-xs font-semibold text-[#1A1816]">
            Click to upload or drag &amp; drop
          </p>
          <p className="text-[11px] text-[#736C65] mt-1">
            JPEG, PNG, or WebP &bull; Maximum 8 MB &bull; Clear front-facing photo on plain background
          </p>
        </div>
      ) : (
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-[#F4EFEB] border border-[#E8E2D8] shadow-inner group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Dress Preview"
            className="w-full h-full object-contain p-2"
          />

          {/* Action overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-full bg-white text-[#1A1816] text-xs font-semibold shadow-md hover:bg-[#FAF8F5] transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace Image</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Uploading progress indicator */}
      {isUploading && (
        <div className="flex items-center space-x-2 text-xs text-[#7A1F2B] font-medium animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Uploading to Supabase Storage...</span>
        </div>
      )}

      {/* Success banner */}
      {uploadSuccess && (
        <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Image uploaded securely.</span>
        </div>
      )}

      {/* Error banner */}
      {uploadError && (
        <div className="flex items-center space-x-1.5 text-xs text-red-600 font-medium">
          <AlertCircle className="w-4 h-4" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
