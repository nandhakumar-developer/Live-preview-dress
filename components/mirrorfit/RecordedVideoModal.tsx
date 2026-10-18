'use client';

import React from 'react';
import { Download, Trash2, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product } from '@/types/database';

interface RecordedVideoModalProps {
  isOpen: boolean;
  videoUrl: string | null;
  product?: Product | null;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export function RecordedVideoModal({
  isOpen,
  videoUrl,
  product,
  onClose,
  onDownload,
  onDelete,
}: RecordedVideoModalProps) {
  if (!isOpen || !videoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        className="bg-[#18151A] rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-white/15 flex flex-col items-center relative overflow-hidden"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(130, 35, 56, 0.2)',
        }}
      >
        {/* Glow accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent opacity-70" />

        {/* Modal Header */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2.5 text-white">
            <div className="w-8 h-8 rounded-full bg-[#7A1F2B] flex items-center justify-center text-[#C5A880]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-white tracking-wide">
                Virtual Try-On Recording
              </h3>
              {product ? (
                <p className="text-[11px] text-[#C5A880] font-medium truncate max-w-xs">
                  {product.name}
                </p>
              ) : (
                <p className="text-[11px] text-white/60">
                  Preview session captured successfully
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Display */}
        <div className="w-full aspect-[9/16] max-h-[55vh] bg-black rounded-2xl overflow-hidden my-4 relative shadow-inner flex items-center justify-center border border-white/10">
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Information badge */}
        <div className="w-full flex items-center gap-2 px-3.5 py-2 mb-4 rounded-xl bg-white/5 border border-white/10 text-white/70 text-[11px]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Recording completed. You can review your virtual fit or download the clip to your device.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-semibold transition-colors w-full sm:w-auto justify-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onDownload}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 text-xs font-semibold transition-all shadow-sm flex-1 sm:flex-none"
            >
              <Download className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Download Video</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#7A1F2B] text-white hover:bg-[#5E1721] text-xs font-semibold shadow-lg transition-colors flex-1 sm:flex-none text-center"
            >
              Done / Try Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
