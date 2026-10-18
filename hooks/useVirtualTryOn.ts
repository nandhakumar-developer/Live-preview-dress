'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Product, TryOnState, CameraFraming } from '@/types/database';
import { buildTryOnPrompt } from '@/lib/decart/prompts';

export interface VirtualTryOnHook {
  state: TryOnState;
  error: string | null;
  isAiConnected: boolean;
  selectedProduct: Product | null;
  cameraStream: MediaStream | null;
  transformedStream: MediaStream | null;
  framing: CameraFraming;
  startCamera: () => Promise<void>;
  stopCameraAndAi: () => void;
  selectProduct: (product: Product) => Promise<void>;
  toggleMirror: () => void;
  toggleFitMode: () => void;
  toggleLockFraming: () => void;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useVirtualTryOn(initialProduct: Product | null = null): VirtualTryOnHook {
  const [state, setState] = useState<TryOnState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isAiConnected, setIsAiConnected] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [transformedStream, setTransformedStream] = useState<MediaStream | null>(null);

  const [framing, setFraming] = useState<CameraFraming>({
    mirrored: true,
    fitMode: 'cover',
    zoom: 1,
    locked: false,
  });

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  // Store the realtime client so we can call .set() and .disconnect()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const realtimeClientRef = useRef<any>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Keep ref in sync with state (to avoid stale closures in cleanup)
  useEffect(() => {
    cameraStreamRef.current = cameraStream;
  }, [cameraStream]);

  // Safe and idempotent cleanup function
  const stopCameraAndAi = useCallback(() => {
    // 1. Disconnect Decart realtime client
    if (realtimeClientRef.current) {
      try {
        realtimeClientRef.current.disconnect();
      } catch (e) {
        console.warn('Error disconnecting Decart realtime client:', e);
      }
      realtimeClientRef.current = null;
    }

    // 2. Stop camera tracks
    const stream = cameraStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        try { track.stop(); } catch (e) { console.warn('Error stopping camera track:', e); }
      });
      setCameraStream(null);
      cameraStreamRef.current = null;
    }

    // 3. Clear video elements srcObject
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setTransformedStream(null);
    setIsAiConnected(false);
    setState('idle');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopCameraAndAi(); };
  }, [stopCameraAndAi]);

  // 1. Start local camera after user gesture
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setState('requesting-camera');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      setCameraStream(stream);
      cameraStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(() => {});
      }

      setState('camera-ready');
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const msg =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings.'
          : 'Unable to start camera. Please check your webcam connection and try again.';
      setError(msg);
      setState('error');
    }
  }, []);

  // Helper: fetch garment image as a Blob for SDK's `image` field
  const fetchGarmentBlob = async (url: string): Promise<Blob | null> => {
    try {
      // For blob URLs (custom upload), convert directly
      if (url.startsWith('blob:')) {
        const res = await fetch(url);
        return await res.blob();
      }
      // For remote URLs, fetch through our proxy to avoid CORS
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) return await res.blob();
      return null;
    } catch {
      return null;
    }
  };

  // 2. Select product and connect / update Decart AI Lucy V-TON stream using the SDK
  const selectProduct = useCallback(
    async (product: Product) => {
      setSelectedProduct(product);

      const stream = cameraStreamRef.current;
      if (!stream) {
        // Camera not started yet — just set product, camera start will happen separately
        return;
      }

      setState('connecting-ai');
      setError(null);

      try {
        // If we already have a realtime client, update garment and prompt
        if (realtimeClientRef.current) {
          const garmentBlob = await fetchGarmentBlob(product.image_path);
          if (garmentBlob) {
            await realtimeClientRef.current.setImage(garmentBlob);
          }
          await realtimeClientRef.current.setPrompt(buildTryOnPrompt(product), { enhance: true });
          setState('ai-ready');
          return;
        }

        // Fetch ephemeral token from our secure backend
        const res = await fetch('/api/decart/token', { method: 'POST' });
        const tokenData = await res.json();

        if (!tokenData.isConfigured || !tokenData.apiKey) {
          // Graceful demo mode — camera still works, just no AI overlay
          setIsAiConnected(false);
          setTransformedStream(null);
          setState('ai-ready');
          return;
        }

        // Dynamically import Decart SDK (client-side only)
        const { createDecartClient, models } = await import('@decartai/sdk');

        const decartClient = createDecartClient({
          apiKey: tokenData.apiKey,
        });

        const model = models.realtime('lucy-vton-latest');

        // Fetch garment image as blob
        const garmentBlob = await fetchGarmentBlob(product.image_path);

        const realtimeClient = await decartClient.realtime.connect(stream, {
          model,
          mirror: 'auto',
          onRemoteStream: (remoteStream: MediaStream) => {
            setTransformedStream(remoteStream);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              remoteVideoRef.current.play().catch(() => {});
            }
            setIsAiConnected(true);
            setState('ai-ready');
          },
          initialState: {
            prompt: {
              text: buildTryOnPrompt(product),
              enhance: true,
            },
            ...(garmentBlob ? { image: garmentBlob } : {}),
          },
        });

        realtimeClient.on('error', (err: unknown) => {
          console.warn('Decart realtime error, falling back to demo mode:', err);
          setIsAiConnected(false);
          setState('ai-ready');
        });

        realtimeClient.on('connectionChange', (connState: string) => {
          if (connState === 'connected') {
            setIsAiConnected(true);
            setState('ai-ready');
          } else if (connState === 'disconnected' || connState === 'failed') {
            setIsAiConnected(false);
          }
        });

        realtimeClientRef.current = realtimeClient;
      } catch (aiErr) {
        console.warn('AI Try-on connection failed, gracefully falling back to Demo Mode:', aiErr);
        setIsAiConnected(false);
        setState('ai-ready');
      }
    },
    []
  );

  const toggleMirror = useCallback(() => {
    setFraming((prev) => ({ ...prev, mirrored: !prev.mirrored }));
  }, []);

  const toggleFitMode = useCallback(() => {
    setFraming((prev) => ({
      ...prev,
      fitMode: prev.fitMode === 'cover' ? 'contain' : 'cover',
    }));
  }, []);

  const toggleLockFraming = useCallback(() => {
    setFraming((prev) => ({ ...prev, locked: !prev.locked }));
  }, []);

  return {
    state,
    error,
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
  };
}
