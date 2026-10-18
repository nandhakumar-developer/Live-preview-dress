'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface MirrorFitSessionHook {
  sessionSecondsLeft: number;
  isSessionActive: boolean;
  isSessionWarning: boolean;
  startSession: (seconds?: number) => void;
  endSession: () => void;
  resetIdleTimer: () => void;
}

export function useMirrorFitSession(options?: {
  previewSeconds?: number;
  idleTimeoutSeconds?: number;
  onSessionTimeout?: () => void;
  onIdleTimeout?: () => void;
}): MirrorFitSessionHook {
  const maxSessionSeconds = options?.previewSeconds || 30;
  const idleTimeoutSeconds = options?.idleTimeoutSeconds || 60;

  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(maxSessionSeconds);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onSessionTimeoutRef = useRef(options?.onSessionTimeout);
  const onIdleTimeoutRef = useRef(options?.onIdleTimeout);

  useEffect(() => {
    onSessionTimeoutRef.current = options?.onSessionTimeout;
    onIdleTimeoutRef.current = options?.onIdleTimeout;
  });

  const endSession = useCallback(() => {
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = null;
    }
    setIsSessionActive(false);
    setSessionSecondsLeft(maxSessionSeconds);
    if (onSessionTimeoutRef.current) {
      onSessionTimeoutRef.current();
    }
  }, [maxSessionSeconds]);

  const startSession = useCallback(
    (seconds?: number) => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
      const initial = seconds || maxSessionSeconds;
      setSessionSecondsLeft(initial);
      setIsSessionActive(true);

      sessionIntervalRef.current = setInterval(() => {
        setSessionSecondsLeft((prev) => {
          if (prev <= 1) {
            if (sessionIntervalRef.current) {
              clearInterval(sessionIntervalRef.current);
              sessionIntervalRef.current = null;
            }
            setIsSessionActive(false);
            if (onSessionTimeoutRef.current) {
              onSessionTimeoutRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [maxSessionSeconds]
  );

  const resetIdleTimer = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    idleTimeoutRef.current = setTimeout(() => {
      endSession();
      if (onIdleTimeoutRef.current) {
        onIdleTimeoutRef.current();
      }
    }, idleTimeoutSeconds * 1000);
  }, [idleTimeoutSeconds, endSession]);

  // Touch and activity listeners to reset idle timer
  useEffect(() => {
    const handleActivity = () => {
      resetIdleTimer();
    };

    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('click', handleActivity, { passive: true });

    resetIdleTimer();

    return () => {
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    };
  }, [resetIdleTimer]);

  const isSessionWarning = isSessionActive && sessionSecondsLeft <= 5;

  return {
    sessionSecondsLeft,
    isSessionActive,
    isSessionWarning,
    startSession,
    endSession,
    resetIdleTimer,
  };
}
