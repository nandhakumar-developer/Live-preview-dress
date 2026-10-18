'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface ScreenRecordingHook {
  isRecording: boolean;
  recordingSeconds: number;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  isReplaying: boolean;
  recordingError: string | null;
  startRecording: (stream: MediaStream | null) => Promise<boolean>;
  stopRecording: () => void;
  deleteRecording: () => void;
  openReplay: () => void;
  closeReplay: () => void;
  downloadRecording: (filename?: string) => void;
}

const MAX_RECORDING_SECONDS = 300;

export function useScreenRecording(): ScreenRecordingHook {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to safely revoke old object URLs
  const cleanupUrl = useCallback((url: string | null) => {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Error revoking object URL:', e);
      }
    }
  }, []);

  // Delete recording
  const deleteRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    cleanupUrl(recordedUrl);
    setRecordedUrl(null);
    setRecordedBlob(null);
    chunksRef.current = [];
    setIsRecording(false);
    setIsReplaying(false);
    setRecordingSeconds(0);
    setRecordingError(null);
  }, [recordedUrl, cleanupUrl]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping media recorder:', e);
      }
    }
    setIsRecording(false);
  }, []);

  // Start recording
  const startRecording = useCallback(
    async (stream: MediaStream | null): Promise<boolean> => {
      setRecordingError(null);

      if (!stream || stream.getVideoTracks().length === 0) {
        setRecordingError('No video stream available to record.');
        return false;
      }

      // Detect supported MIME type
      const possibleTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ];
      const mimeType = possibleTypes.find((type) => MediaRecorder.isTypeSupported(type));

      if (!mimeType) {
        setRecordingError('Video recording is not supported by this browser.');
        return false;
      }

      // Cleanup any previous recording
      cleanupUrl(recordedUrl);
      setRecordedUrl(null);
      setRecordedBlob(null);
      chunksRef.current = [];
      setRecordingSeconds(0);

      try {
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            setRecordedBlob(blob);
            const url = URL.createObjectURL(blob);
            setRecordedUrl(url);
            // Automatically open video player for customer review
            setIsReplaying(true);
          }
        };

        recorder.start(500); // 500ms time slice
        setIsRecording(true);

        // Start timer up to MAX_RECORDING_SECONDS
        let elapsed = 0;
        timerRef.current = setInterval(() => {
          elapsed += 1;
          setRecordingSeconds(elapsed);
          if (elapsed >= MAX_RECORDING_SECONDS) {
            stopRecording();
          }
        }, 1000);

        return true;
      } catch (err) {
        console.error('Failed to start MediaRecorder:', err);
        setRecordingError('Failed to initialize screen recording.');
        setIsRecording(false);
        return false;
      }
    },
    [recordedUrl, cleanupUrl, stopRecording]
  );

  const openReplay = useCallback(() => {
    if (recordedUrl) {
      setIsReplaying(true);
    }
  }, [recordedUrl]);

  const closeReplay = useCallback(() => {
    setIsReplaying(false);
  }, []);

  const downloadRecording = useCallback((filename = 'virtual-try-on-recording.webm') => {
    if (!recordedUrl) return;
    const a = document.createElement('a');
    a.href = recordedUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [recordedUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      cleanupUrl(recordedUrl);
    };
  }, [recordedUrl, cleanupUrl]);

  return {
    isRecording,
    recordingSeconds,
    recordedBlob,
    recordedUrl,
    isReplaying,
    recordingError,
    startRecording,
    stopRecording,
    deleteRecording,
    openReplay,
    closeReplay,
    downloadRecording,
  };
}
