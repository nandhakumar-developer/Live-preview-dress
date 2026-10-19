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
import { FullscreenDressPicker } from './FullscreenDressPicker';
import {
  AlertCircle,
  Crown,
  CircleDot,
} from 'lucide-react';

interface MirrorFitShellProps {
  initialCategories: Category[];
  initialProducts: Product[];
  initialTotalPages: number;
  initialSettings: MirrorFitSettings;
}

export function MirrorFitShell({
  initialCategories,
  initialProducts,
  initialTotalPages,
  initialSettings,
}: MirrorFitShellProps) {
  const [categories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);
  const productPageCache = useRef(new Map<string, {
    products: Product[];
    totalPages: number;
    page: number;
    expiresAt: number;
  }>([['all:1', {
    products: initialProducts,
    totalPages: initialTotalPages,
    page: 1,
    expiresAt: 0,
  }]]));
  const cacheProductPage = useCallback((key: string, value: {
    products: Product[];
    totalPages: number;
    page: number;
    expiresAt: number;
  }) => {
    productPageCache.current.delete(key);
    productPageCache.current.set(key, value);
    if (productPageCache.current.size > 20) {
      const oldestKey = productPageCache.current.keys().next().value;
      if (oldestKey !== undefined) productPageCache.current.delete(oldestKey);
    }
  }, []);
  const requestIdRef = useRef(0);
  const [isMirrorFullscreen, setIsMirrorFullscreen] = useState<boolean>(false);
  const [isDressPickerOpen, setIsDressPickerOpen] = useState<boolean>(false);
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
      const isFullscreen = document.fullscreenElement === mirrorStageRef.current;
      setIsMirrorFullscreen(isFullscreen);
      if (!isFullscreen) setIsDressPickerOpen(false);
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
    const requestId = ++requestIdRef.current;
    const cacheKey = `${catId}:${page}`;
    const cached = productPageCache.current.get(cacheKey);
    if (cached && (cached.expiresAt === 0 || cached.expiresAt > Date.now())) {
      if (cached.expiresAt === 0) cached.expiresAt = Date.now() + 30_000;
      setProducts(cached.products);
      setTotalPages(cached.totalPages);
      setCurrentPage(cached.page);
      setProductLoadError(null);
      return;
    }
    productPageCache.current.delete(cacheKey);

    setProductLoadError(null);
    const url = `/api/products?categoryId=${encodeURIComponent(catId)}&page=${page}&pageSize=5`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Product request failed (${res.status})`);
      const data = await res.json();
      cacheProductPage(cacheKey, {
        products: data.products,
        totalPages: data.totalPages,
        page: data.page,
        expiresAt: Date.now() + 30_000,
      });
      if (requestId !== requestIdRef.current) return;
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
      setProductLoadError(null);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error('Unable to load MirrorFit products:', error);
      setProductLoadError('Unable to load garments. Please try selecting the category again.');
    }
  }, [cacheProductPage]);

  const handleSelectCategory = useCallback((catId: string) => {
    if (selectedCategoryId === catId) return;
    setSelectedCategoryId(catId);
    setCurrentPage(1);
    fetchProducts(catId, 1);
    resetIdleTimer();
  }, [fetchProducts, resetIdleTimer, selectedCategoryId]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      fetchProducts(selectedCategoryId, prev);
      resetIdleTimer();
    }
  }, [currentPage, fetchProducts, resetIdleTimer, selectedCategoryId]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      fetchProducts(selectedCategoryId, next);
      resetIdleTimer();
    }
  }, [currentPage, fetchProducts, resetIdleTimer, selectedCategoryId, totalPages]);

  const handleProductSelect = useCallback(async (product: Product) => {
    resetIdleTimer();
    await selectProduct(product);
  }, [resetIdleTimer, selectProduct]);

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

  const handleInspectProduct = useCallback((product: Product) => {
    resetIdleTimer();
    setLightboxProduct(product);
    setIsLightboxOpen(true);
  }, [resetIdleTimer]);

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
        className="relative flex-1 w-full"
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
          isDressPickerOpen={isDressPickerOpen}
          onToggleDressPicker={() => setIsDressPickerOpen((open) => !open)}
        />
        {isMirrorFullscreen && isDressPickerOpen && (
          <FullscreenDressPicker
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
            products={products}
            selectedProduct={selectedProduct}
            onSelectProduct={handleProductSelect}
            page={currentPage}
            totalPages={totalPages}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onClose={() => setIsDressPickerOpen(false)}
          />
        )}
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
        {productLoadError && (
          <p role="alert" className="text-sm text-red-700">
            {productLoadError}
          </p>
        )}
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
