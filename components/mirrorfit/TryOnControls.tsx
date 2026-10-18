'use client';

import React from 'react';
import { LogOut, Sparkles } from 'lucide-react';

interface TryOnControlsProps {
  hasCamera: boolean;
  onEndSession: () => void;
  onChangeOutfit: () => void;
}

export function TryOnControls({
  hasCamera,
  onEndSession,
  onChangeOutfit,
}: TryOnControlsProps) {
  if (!hasCamera) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onChangeOutfit}
        className="btn btn-secondary touch-target"
        style={{ fontSize: '12px' }}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
        Change Garment
      </button>

      <button
        type="button"
        onClick={onEndSession}
        className="btn touch-target"
        style={{
          background: 'var(--text-primary)',
          color: '#fff',
          border: '1.5px solid var(--text-primary)',
          fontSize: '12px',
        }}
      >
        <LogOut className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
        End Session
      </button>
    </div>
  );
}
