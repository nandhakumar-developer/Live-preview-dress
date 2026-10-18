'use client';

import React from 'react';
import { CameraFraming, Product } from '@/types/database';
import {
  Sparkles,
  Camera,
  Lock,
  Unlock,
  FlipHorizontal,
  Maximize2,
  Maximize,
  Minimize,
  LogOut,
} from 'lucide-react';

interface CameraPreviewProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  isAiConnected: boolean;
  hasCameraStream: boolean;
  framing: CameraFraming;
  onToggleMirror: () => void;
  onToggleFitMode: () => void;
  onToggleLockFraming: () => void;
  selectedProduct?: Product | null;
  onStartPreview: () => void;
  onEndSession: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function CameraPreview({
  localVideoRef,
  remoteVideoRef,
  isAiConnected,
  hasCameraStream,
  framing,
  onToggleMirror,
  onToggleFitMode,
  onToggleLockFraming,
  selectedProduct,
  onStartPreview,
  onEndSession,
  isFullscreen,
  onToggleFullscreen,
}: CameraPreviewProps) {
  return (
    <div
      className="preview-ambient-glow relative w-full h-full rounded-3xl overflow-hidden flex items-center justify-center"
      style={{
        background: '#18151A',
        border: '1px solid rgba(130,35,56,0.5)',
        boxShadow: 'var(--shadow-xl)',
        height: isFullscreen ? '100dvh' : 'clamp(460px, 76dvh, 1200px)',
        borderRadius: isFullscreen ? 0 : undefined,
      }}
    >
      {/* ── AI Transformed Video (on top) ── */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: framing.fitMode === 'cover' ? 'cover' : 'contain',
          transform: framing.mirrored ? 'scaleX(-1)' : 'scaleX(1)',
          opacity: isAiConnected ? 1 : 0,
          zIndex: isAiConnected ? 10 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* ── Local Camera Feed ── */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full"
        style={{
          objectFit: framing.fitMode === 'cover' ? 'cover' : 'contain',
          transform: framing.mirrored ? 'scaleX(-1)' : 'scaleX(1)',
          opacity: hasCameraStream ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* ── Empty State ── */}
      {!hasCameraStream && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
          style={{ zIndex: 5 }}
        >
          <div className="flex flex-col items-center text-center">
            {selectedProduct ? (
              <>
                <div
                  className="w-36 h-44 mb-4 overflow-hidden rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedProduct.image_path}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <h3 className="mb-4 max-w-xs truncate text-base font-semibold text-white">
                  {selectedProduct.name}
                </h3>
              </>
            ) : (
              <>
                <Camera className="mb-3 h-10 w-10" style={{ color: 'var(--gold)' }} />
                <p className="mb-4 text-sm text-white/70">Select a garment below</p>
              </>
            )}
            <button
              type="button"
              onClick={onStartPreview}
              disabled={!selectedProduct}
              className="btn btn-primary touch-target flex items-center gap-2"
              style={{
                padding: '11px 28px',
                fontSize: '14px',
                fontWeight: 600,
                opacity: selectedProduct ? 1 : 0.55,
                cursor: selectedProduct ? 'pointer' : 'not-allowed',
              }}
            >
              <Sparkles className="h-4 w-4" />
              <span>Try Now</span>
            </button>
          </div>
        </div>
      )}

      {/* ── AI Status Pill (top-left) ── */}
      {isAiConnected && (
        <div
          className="absolute top-5 left-5 flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full animate-fade-in"
          style={{
            background: 'rgba(21, 128, 61, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            color: '#bbf7d0',
            zIndex: 20,
          }}
        >
          <span
            className="status-dot status-dot-live"
            style={{ width: '6px', height: '6px', flexShrink: 0 }}
          />
          <Sparkles className="w-3 h-3" />
          <span>AI Try-On Live</span>
        </div>
      )}

      {/* ── Floating Controls Toolbar (top-right) ── */}
      {onToggleFullscreen && (
        <div
          className="absolute top-5 right-5 flex items-center gap-1.5 p-1.5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(228,221,212,0.7)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 20,
          }}
        >
          {hasCameraStream && [
            {
              onClick: onToggleMirror,
              icon: <FlipHorizontal className="w-4 h-4" />,
              active: framing.mirrored,
              title: framing.mirrored ? 'Mirror Active' : 'Enable Mirror',
            },
            {
              onClick: onToggleFitMode,
              icon: <Maximize2 className="w-4 h-4" />,
              active: framing.fitMode === 'contain',
              title: `Fit: ${framing.fitMode}`,
            },
            {
              onClick: onToggleLockFraming,
              icon: framing.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />,
              active: framing.locked,
              title: framing.locked ? 'Framing Locked' : 'Lock Framing',
            },
          ].map(({ onClick, icon, active, title }, i) => (
            <button
              key={i}
              type="button"
              onClick={onClick}
              title={title}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                }
              }}
            >
              {icon}
            </button>
          ))}

          {hasCameraStream && isFullscreen && (
            <button
              type="button"
              onClick={onEndSession}
              title="End Session"
              className="h-9 rounded-xl flex items-center justify-center gap-2 px-3 text-xs font-semibold"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                transition: 'all 0.2s ease',
              }}
            >
              <LogOut className="w-4 h-4" />
              <span>End Session</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mirror'}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            }}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
