'use client';

import React from 'react';
import { Category, Product } from '@/types/database';
import { Check, ChevronLeft, ChevronRight, Shirt } from 'lucide-react';

interface FullscreenDressPickerProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onClose: () => void;
}

export function FullscreenDressPicker({
  categories,
  selectedCategoryId,
  onSelectCategory,
  products,
  selectedProduct,
  onSelectProduct,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
  onClose,
}: FullscreenDressPickerProps) {
  const categoryOptions = [{ id: 'all', name: 'All' }, ...categories];

  return (
    <aside
      aria-label="Choose a garment"
      className="fullscreen-dress-picker absolute inset-y-0 right-0 z-30 flex flex-col"
    >
      <div className="flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <Shirt className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Choose a look
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {products.length} garments · Page {page} of {Math.max(totalPages, 1)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="touch-target shrink-0 rounded-xl px-3 text-xs font-semibold"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
          aria-label="Close garment picker"
        >
          Close
        </button>
      </div>

      <div
        className="flex gap-2 overflow-x-auto border-b px-4 py-3 sm:px-5"
        style={{ scrollbarWidth: 'none' }}
        aria-label="Filter garments by collection"
      >
        {categoryOptions.map((category) => {
          const isActive = selectedCategoryId === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              aria-pressed={isActive}
              className="touch-target shrink-0 rounded-full border px-3 text-xs font-semibold"
              style={{
                background: isActive ? 'var(--accent)' : 'var(--surface)',
                borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      <div className="fullscreen-dress-list min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        {products.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed p-6 text-center text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            No garments in this collection.
          </div>
        ) : (
          products.map((product) => {
            const isSelected = selectedProduct?.id === product.id;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelectProduct(product)}
                aria-pressed={isSelected}
                className="flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors"
                style={{
                  background: isSelected ? 'var(--accent-light)' : 'var(--surface)',
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border-light)',
                  boxShadow: isSelected ? '0 0 0 1px var(--accent)' : 'var(--shadow-sm)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.thumbnail_path || product.image_path}
                  alt=""
                  className="h-20 w-16 shrink-0 rounded-xl object-cover object-top"
                  loading="lazy"
                />
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate text-sm font-semibold"
                    style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}
                  >
                    {product.name}
                  </span>
                  <span className="mt-1 block truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                    {[product.garment_type, product.color].filter(Boolean).join(' · ')}
                  </span>
                  <span
                    className="mt-2 inline-block text-xs font-semibold"
                    style={{ color: 'var(--accent)' }}
                  >
                    {isSelected ? 'Currently trying on' : 'Try this garment'}
                  </span>
                </span>
                {isSelected && (
                  <Check className="mr-1 h-5 w-5 shrink-0" style={{ color: 'var(--accent)' }} />
                )}
              </button>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3 sm:px-5">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPrevPage}
              disabled={page <= 1}
              className="touch-target flex items-center gap-1 rounded-xl border px-3 text-xs font-semibold"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              aria-label="Previous garments"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={onNextPage}
              disabled={page >= totalPages}
              className="touch-target flex items-center gap-1 rounded-xl border px-3 text-xs font-semibold"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              aria-label="Next garments"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
