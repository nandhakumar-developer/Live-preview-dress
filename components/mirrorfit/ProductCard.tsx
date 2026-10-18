'use client';

import React from 'react';
import { Product } from '@/types/database';
import { Sparkles, Check, Eye, ZoomIn } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product) => void;
  onInspect?: (product: Product) => void;
}

export function ProductCard({
  product,
  isSelected,
  onSelect,
  onInspect,
}: ProductCardProps) {
  const formattedPrice = product.price
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: product.currency || 'INR',
        maximumFractionDigits: 0,
      }).format(product.price)
    : null;

  return (
    <div
      onClick={() => onSelect(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(product)}
      aria-label={`Select ${product.name} for virtual try-on`}
      aria-pressed={isSelected}
      className="group relative flex flex-col rounded-2xl border cursor-pointer overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-[#822338]"
      style={{
        background: 'var(--surface)',
        borderColor: isSelected ? 'var(--accent)' : 'var(--border-light)',
        boxShadow: isSelected
          ? '0 0 0 2px var(--accent), var(--shadow-md)'
          : 'var(--shadow-sm)',
        transform: isSelected ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Garment Image */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: '3/4',
          background: 'var(--surface-2)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.thumbnail_path || product.image_path}
          alt={product.name}
          className="w-full h-full object-cover object-top"
          style={{
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(to top, rgba(28,25,23,0.5) 0%, rgba(28,25,23,0.15) 60%, transparent 100%)',
            transition: 'opacity 0.25s ease',
          }}
        />

        {/* Garment Type Badge — top left */}
        <div className="absolute top-2 left-2 z-10">
          <span
            className="badge badge-neutral"
            style={{ fontSize: '9px', padding: '3px 8px' }}
          >
            {product.garment_type}
          </span>
        </div>

        {/* Inspect Button — top right (hover only, unless selected) */}
        {onInspect && !isSelected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInspect(product);
            }}
            title="View full image"
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.92)';
              (e.currentTarget as HTMLButtonElement).style.color = '';
            }}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Selected Check — top right */}
        {isSelected && (
          <div
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center animate-fade-in-scale"
            style={{ background: 'var(--accent)' }}
          >
            <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        )}

        {/* Bottom Fitted Label (selected state) */}
        {isSelected && (
          <div
            className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-1.5 py-2 animate-fade-in"
            style={{
              background: 'linear-gradient(to top, rgba(130,35,56,0.9) 0%, transparent 100%)',
            }}
          >
            <Sparkles className="w-3 h-3 text-white" />
            <span className="text-white text-[10px] font-semibold tracking-wider uppercase">Selected</span>
          </div>
        )}

        {/* Try-on overlay button (hover, not selected) */}
        {!isSelected && (
          <div
            className="absolute bottom-2 left-2 right-2 z-10 flex justify-center opacity-0 group-hover:opacity-100"
            style={{ transition: 'opacity 0.2s ease' }}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect(product); }}
              className="btn btn-primary w-full"
              style={{ fontSize: '11px', padding: '7px 12px', borderRadius: '10px' }}
            >
              <Eye className="w-3 h-3" />
              Try On
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div
        className="p-3 flex flex-col"
        style={{ background: 'var(--surface)' }}
      >
        <h4
          className="product-name line-clamp-1"
          style={{
            color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
            transition: 'color 0.2s ease',
          }}
        >
          {product.name}
        </h4>
        {product.color && (
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {product.color}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          {formattedPrice ? (
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {formattedPrice}
            </span>
          ) : (
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Bespoke</span>
          )}
          {onInspect && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onInspect(product); }}
              className="text-[10px] font-semibold flex items-center gap-1"
              style={{ color: 'var(--accent)' }}
            >
              <Eye className="w-3 h-3" />
              Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
