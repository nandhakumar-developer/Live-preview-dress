'use client';

import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface SessionTimerProps {
  secondsLeft: number;
  isWarning: boolean;
  isActive: boolean;
}

export function SessionTimer({ secondsLeft, isWarning, isActive }: SessionTimerProps) {
  if (!isActive) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 border ${
        isWarning
          ? 'bg-amber-600/90 text-white border-amber-400 animate-pulse'
          : 'bg-[#1A1816]/90 text-white border-white/20'
      }`}
    >
      {isWarning ? (
        <AlertTriangle className="w-4 h-4 text-amber-200" />
      ) : (
        <Clock className="w-4 h-4 text-[#C5A880]" />
      )}
      <span className="font-mono text-sm font-semibold tracking-wider">{formatted}</span>
      {isWarning && <span className="text-[10px] font-bold uppercase tracking-wider">Ending Soon</span>}
    </div>
  );
}
