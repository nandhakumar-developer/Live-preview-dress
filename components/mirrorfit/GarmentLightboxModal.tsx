'use client';

import React from 'react';
import { Product } from '@/types/database';
import { X, Sparkles, Check, Tag } from 'lucide-react';

interface GarmentLightboxModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectAndFit: (product: Product) => void;
  isSelected: boolean;
}

export function GarmentLightboxModal({
  product,
  isOpen,
  onClose,
  onSelectAndFit,
  isSelected,
}: GarmentLightboxModalProps) {
  if (!isOpen || !product) return null;

  const formattedPrice = product.price
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: product.currency || 'INR',
        maximumFractionDigits: 0,
      }).format(product.price)
    : 'Bespoke Inquire';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#E8E2D8] flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* High-Resolution Full Garment Image */}
        <div className="w-full md:w-1/2 bg-[#F4EFEB] relative flex items-center justify-center overflow-hidden min-h-[360px] md:min-h-[500px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_path}
            alt={product.name}
            className="w-full h-full object-cover object-top"
          />

          <div className="absolute top-4 left-4 flex flex-col space-y-1.5">
            <span className="bg-white/95 backdrop-blur-sm text-[#1A1816] text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full shadow-md border border-[#E8E2D8] flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-[#7A1F2B]" />
              <span>{product.garment_type}</span>
            </span>
            {product.color && (
              <span className="bg-black/80 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-md">
                {product.color}
              </span>
            )}
          </div>
        </div>

        {/* Garment Details & 1-Tap Fitting Action */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-white">
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 text-xs text-[#736C65] font-mono mb-1">
                {product.sku && <span>SKU: {product.sku}</span>}
              </div>
              <h2 className="product-name text-[#1A1816] leading-tight">
                {product.name}
              </h2>
              <div className="text-xl font-bold text-[#7A1F2B] mt-2">
                {formattedPrice}
              </div>
            </div>

            {product.description && (
              <div className="pt-2">
                <h4 className="text-xs uppercase font-semibold text-[#736C65] tracking-wider mb-1">
                  Atelier Craftsmanship &amp; Fabric
                </h4>
                <p className="body-copy text-[#1A1816] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {product.try_on_prompt && (
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A1F2B] flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Fitting Style Model</span>
                </span>
                <p className="text-xs text-[#736C65] italic">
                  &ldquo;{product.try_on_prompt}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-[#F4EFEB] space-y-3">
            <button
              type="button"
              onClick={() => {
                onSelectAndFit(product);
                onClose();
              }}
              className={`w-full py-4 rounded-full font-semibold text-xs tracking-wider uppercase shadow-lg transition-all flex items-center justify-center space-x-2 touch-target ${
                isSelected
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-[#7A1F2B] text-white hover:bg-[#5E1721] pulse-glow'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Currently Fitted on Smart Mirror</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Fit This Garment Now</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-full border border-[#E8E2D8] text-[#736C65] hover:text-[#1A1816] hover:bg-[#FAF8F5] text-xs font-semibold transition-colors"
            >
              Back to Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
