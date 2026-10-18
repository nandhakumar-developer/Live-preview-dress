'use client';

import React from 'react';
import { Category } from '@/types/database';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryTabs({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryTabsProps) {
  const allTabs = [
    { id: 'all', name: 'All Collections' },
    ...categories,
  ];

  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto select-none"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {allTabs.map((tab) => {
        const isActive = selectedCategoryId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectCategory(tab.id)}
            className="touch-target whitespace-nowrap text-xs font-semibold px-4 py-2 rounded-full"
            style={{
              background: isActive ? 'var(--accent)' : 'var(--surface)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              border: isActive ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
              boxShadow: isActive ? '0 2px 8px rgba(130,35,56,0.25)' : 'var(--shadow-sm)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              }
            }}
            aria-pressed={isActive}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
