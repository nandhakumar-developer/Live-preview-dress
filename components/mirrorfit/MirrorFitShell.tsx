'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Category, Product, MirrorFitSettings } from '@/types/database';
import { useVirtualTryOn } from '@/hooks/useVirtualTryOn';
import { useScreenRecording } from '@/hooks/useScreenRecording';
import { useMirrorFitSession } from '@/hooks/useMirrorFitSession';
import { CameraPreview } from './CameraPreview';
import { CategoryTabs } from './CategoryTabs';
import { ProductGallery } from './ProductGallery';
import { SessionTimer } from './SessionTimer';
import { TryOnControls } from './TryOnControls';
import { GarmentLightboxModal } from './GarmentLightboxModal';
import { RecordedVideoModal } from './RecordedVideoModal';
import {
  AlertCircle,
  Crown,
  CircleDot,
} from 'lucide-react';

interface MirrorFitShellProps {
  initialCategories: Category[];
  initialProducts: Product[];
  initialSettings: MirrorFitSettings;
}

export function MirrorFitShell({
  initialCategories,
  initialProducts,
  initialSettings,
}: MirrorFitShellProps) {
  const [categories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isMirrorFullscreen, setIsMirrorFullscreen] = useState<boolean>(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const mirrorStageRef = useRef<HTMLElement | null>(null);

  const {
    state: tryOnState,
    error: tryOnError,
    isAiConnected,
    selectedProduct,
    cameraStream,
    transformedStream,
    framing,
    startCamera,
    stopCameraAndAi,
    selectProduct,
    toggleMirror,
    toggleFitMode,
    toggleLockFraming,
    localVideoRef,
    remoteVideoRef,
  } = useVirtualTryOn(initialProducts[0] || null);

  const {
    isRecording,
    recordingSeconds,
    recordedUrl,
    isReplaying,
    startRecording,
    stopRecording,
    deleteRecording,
    closeReplay,
    downloadRecording,
  } = useScreenRecording();

  const handleEndSession = useCallback(() => {
    stopRecording();
    stopCameraAndAi();
  }, [stopRecording, stopCameraAndAi]);

  const {
    sessionSecondsLeft,
    isSessionActive,
    isSessionWarning,
    startSession,
    endSession,
    resetIdleTimer,
  } = useMirrorFitSession({
    previewSeconds: initialSettings.preview_seconds || 30,
    idleTimeoutSeconds: initialSettings.idle_timeout_seconds || 60,
    onSessionTimeout: handleEndSession,
    onIdleTimeout: handleEndSession,
  });

  const handleStartPreview = useCallback(async () => {
    resetIdleTimer();
    // Clear any past recording so new recording starts fresh
    deleteRecording();
    await startCamera();
    startSession();
    if (selectedProduct) {
      await selectProduct(selectedProduct);
    }
  }, [resetIdleTimer, deleteRecording, startCamera, startSession, selectedProduct, selectProduct]);

  const handleUserEndSession = useCallback(() => {
    handleEndSession();
    endSession();
  }, [handleEndSession, endSession]);

  // Wait for AI try-on to connect before recording so the transformed stream is captured.
  useEffect(() => {
    const canRecord =
      cameraStream &&
      tryOnState === 'ai-ready' &&
      (!isAiConnected || transformedStream);

    if (canRecord && !isRecording && !recordedUrl && !isReplaying) {
      const streamToRecord = isAiConnected ? transformedStream : cameraStream;
      startRecording(streamToRecord);
    }
  }, [
    cameraStream,
    transformedStream,
    tryOnState,
    isAiConnected,
    isRecording,
    recordedUrl,
    isReplaying,
    startRecording,
  ]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsMirrorFullscreen(document.fullscreenElement === mirrorStageRef.current);
    };

    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  useEffect(() => {
    if (tryOnState === 'ai-ready' && !isSessionActive) {
      startSession();
    }
  }, [tryOnState, isSessionActive, startSession]);

  const fetchProducts = useCallback(async (catId: string, page: number) => {
    const url = `/api/products?categoryId=${encodeURIComponent(catId)}&page=${page}&pageSize=5`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    }
  }, []);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setCurrentPage(1);
    fetchProducts(catId, 1);
    resetIdleTimer();
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      fetchProducts(selectedCategoryId, prev);
      resetIdleTimer();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      fetchProducts(selectedCategoryId, next);
      resetIdleTimer();
    }
  };

  const handleProductSelect = async (product: Product) => {
    resetIdleTimer();
    await selectProduct(product);
  };

  const handleChangeOutfit = () => {
    document.getElementById('product-gallery')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleToggleFullscreen = useCallback(async () => {
    const stage = mirrorStageRef.current;
    if (!stage) {
      setFullscreenError('The preview is not available for fullscreen.');
      return;
    }

    try {
      if (document.fullscreenElement === stage) {
        await document.exitFullscreen();
      } else {
        await stage.requestFullscreen();
      }
      setFullscreenError(null);
    } catch (error) {
      console.error('Unable to toggle preview fullscreen:', error);
      setFullscreenError('Unable to open fullscreen preview. Check your browser permissions.');
    }
  }, []);

  const handleInspectProduct = (product: Product) => {
    resetIdleTimer();
    setLightboxProduct(product);
    setIsLightboxOpen(true);
  };

  const hasCamera = !!cameraStream;

  return (
    <div
      className="relative min-h-screen flex flex-col select-none"
      style={{
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        padding: '16px 20px',
      }}
    >
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between mb-4 pb-4"
        style={{ borderBottom: '1px solid var(--border-light)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 4px 12px rgba(130,35,56,0.3)',
            }}
          >
            <Crown className="w-5 h-5" style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <h1
              className="font-editorial text-xl font-bold leading-none"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              MirrorFit
            </h1>
          </div>
        </div>

        {/* Center: Session Timer & Auto-Recording Badge */}
        <div className="flex items-center gap-3">
          <SessionTimer
            secondsLeft={sessionSecondsLeft}
            isWarning={isSessionWarning}
            isActive={isSessionActive}
          />
          {isRecording && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-md animate-pulse"
              style={{
                background: 'rgba(220, 38, 38, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(254, 202, 202, 0.4)',
              }}
            >
              <CircleDot className="w-3.5 h-3.5 text-white animate-spin" />
              <span className="font-mono text-[11px] tracking-wider">
                REC {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

      </header>

      {/* ── Error Banner ── */}
      {(tryOnError || fullscreenError) && (
        <div
          className="mb-4 flex items-center justify-between px-4 py-3 rounded-2xl animate-fade-in"
          style={{
            background: 'var(--error-bg)',
            border: '1px solid #f5c2be',
            color: 'var(--error)',
          }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-medium">{tryOnError || fullscreenError}</span>
          </div>
          {tryOnError && (
            <button
              type="button"
              onClick={startCamera}
              className="text-xs font-bold underline ml-4"
              style={{ color: 'var(--error)' }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* ── Main Stage ── */}
      <main
        ref={mirrorStageRef}
        className="flex-1 w-full"
        style={{
          maxWidth: isMirrorFullscreen ? '100%' : '1800px',
          width: isMirrorFullscreen ? '100vw' : undefined,
          height: isMirrorFullscreen ? '100dvh' : undefined,
          marginInline: isMirrorFullscreen ? 0 : 'auto',
          marginBottom: isMirrorFullscreen ? 0 : '20px',
          minHeight: 0,
        }}
      >
        <CameraPreview
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          isAiConnected={isAiConnected}
          hasCameraStream={hasCamera}
          framing={framing}
          onToggleMirror={toggleMirror}
          onToggleFitMode={toggleFitMode}
          onToggleLockFraming={toggleLockFraming}
          selectedProduct={selectedProduct}
          onStartPreview={handleStartPreview}
          onEndSession={handleUserEndSession}
          isFullscreen={isMirrorFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />
      </main>

      {/* ── Bottom Controls & Gallery ── */}
      <footer
        className="mx-auto w-full space-y-5"
        style={{ maxWidth: isMirrorFullscreen ? '100%' : '1800px' }}
      >
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CategoryTabs
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
          />

          <div className="flex items-center gap-2">
            <TryOnControls
              hasCamera={hasCamera}
              onEndSession={handleUserEndSession}
              onChangeOutfit={handleChangeOutfit}
            />
          </div>
        </div>

        {/* Product Gallery */}
        <ProductGallery
          products={products}
          selectedProduct={selectedProduct}
          onSelectProduct={handleProductSelect}
          onInspectProduct={handleInspectProduct}
          page={currentPage}
          totalPages={totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
      </footer>

      {/* Garment Lightbox Modal */}
      <GarmentLightboxModal
        product={lightboxProduct}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onSelectAndFit={handleProductSelect}
        isSelected={selectedProduct?.id === lightboxProduct?.id}
      />

      {/* Automatically Shown Recorded Video Modal (When Session Ends) */}
      <RecordedVideoModal
        isOpen={isReplaying}
        videoUrl={recordedUrl}
        product={selectedProduct}
        onClose={closeReplay}
        onDownload={downloadRecording}
        onDelete={deleteRecording}
      />
    </div>
  );
}
