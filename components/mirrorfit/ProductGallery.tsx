'use client';

import React from 'react';
import { Product } from '@/types/database';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface ProductGalleryProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  onInspectProduct?: (product: Product) => void;
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function ProductGallery({
  products,
  selectedProduct,
  onSelectProduct,
  onInspectProduct,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
}: ProductGalleryProps) {
  const displayedProducts = products.slice(0, 5);

  return (
    <div id="product-gallery" className="w-full space-y-3">
      {displayedProducts.length === 0 ? (
        <div
          className="w-full h-44 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
          style={{
            border: '1.5px dashed var(--border)',
            background: 'var(--surface-2)',
          }}
        >
          <Sparkles className="w-7 h-7 mb-2" style={{ color: 'var(--gold)' }} />
          <h4
            className="font-editorial text-base font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            No Garments in this Collection
          </h4>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            Select another category or check back when new garments are added.
          </p>
        </div>
      ) : (
        <div className="product-gallery-grid grid gap-3">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProduct?.id === product.id}
              onSelect={onSelectProduct}
              onInspect={onInspectProduct}
            />
          ))}
          {/* Fill empty slots so layout stays consistent */}
          {Array.from({ length: Math.max(0, 5 - displayedProducts.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="rounded-2xl"
              style={{
                aspectRatio: '3/4',
                border: '1.5px dashed var(--border-light)',
                background: 'var(--surface-2)',
              }}
            />
          ))}
        </div>
      )}

      {/* Control Bar */}
      <div className="flex items-center justify-between pt-1 px-0.5">
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            Page {page} of {Math.max(1, totalPages)} &bull; Showing {displayedProducts.length} garments
          </span>

        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrevPage}
              disabled={page <= 1}
              className="btn-icon btn btn-secondary touch-target"
              style={{ padding: '8px' }}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNextPage}
              disabled={page >= totalPages}
              className="btn-icon btn btn-secondary touch-target"
              style={{ padding: '8px' }}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
