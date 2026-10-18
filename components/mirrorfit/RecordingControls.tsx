'use client';

import React, { useState } from 'react';
import { Video, Square, Play, Trash2, Shield, X, Sparkles } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  recordingSeconds: number;
  hasRecording: boolean;
  recordedUrl: string | null;
  isReplaying: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onOpenReplay: () => void;
  onCloseReplay: () => void;
  onDeleteRecording: () => void;
  disabled?: boolean;
}

export function RecordingControls({
  isRecording,
  recordingSeconds,
  hasRecording,
  recordedUrl,
  isReplaying,
  onStartRecording,
  onStopRecording,
  onOpenReplay,
  onCloseReplay,
  onDeleteRecording,
  disabled = false,
}: RecordingControlsProps) {
  const [showConsentModal, setShowConsentModal] = useState(false);

  const handleRequestRecord = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      setShowConsentModal(true);
    }
  };

  const handleConfirmConsent = () => {
    setShowConsentModal(false);
    onStartRecording();
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Record / Stop Button */}
        {!isRecording ? (
          <button
            type="button"
            onClick={handleRequestRecord}
            disabled={disabled}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white border border-[#E8E2D8] text-[#1A1816] hover:bg-[#7A1F2B] hover:text-white hover:border-[#7A1F2B] font-semibold text-xs tracking-wide shadow-sm transition-all touch-target disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Video className="w-4 h-4 text-[#7A1F2B] group-hover:text-white" />
            <span>Record Clip (30s)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopRecording}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-red-600 text-white font-semibold text-xs tracking-wide shadow-lg animate-pulse touch-target"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop ({30 - recordingSeconds}s)</span>
          </button>
        )}

        {/* Replay Button (when a clip was captured) */}
        {hasRecording && !isRecording && (
          <button
            type="button"
            onClick={onOpenReplay}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-[#1A1816] text-white hover:bg-black font-semibold text-xs tracking-wide shadow-md transition-all touch-target"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#C5A880]" />
            <span>Replay</span>
          </button>
        )}

        {/* Delete Recording Button */}
        {hasRecording && !isRecording && (
          <button
            type="button"
            onClick={onDeleteRecording}
            title="Delete recorded clip"
            className="p-2.5 rounded-full bg-white border border-[#E8E2D8] text-red-600 hover:bg-red-50 transition-colors touch-target flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Consent Modal before Recording */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D8] relative">
            <div className="w-12 h-12 rounded-full bg-[#FBF0F1] flex items-center justify-center mb-4 text-[#7A1F2B]">
              <Shield className="w-6 h-6" />
            </div>

            <h3 className="font-editorial text-xl font-semibold text-[#1A1816] mb-2">
              Temporary Video Recording
            </h3>
            <p className="text-xs text-[#736C65] leading-relaxed mb-6">
              This will record up to 30 seconds of your AI-transformed virtual try-on preview.
              The recording stays temporarily in your device&apos;s memory so you can replay it after your session.
              It is <strong>never uploaded to a server or saved permanently</strong>, and is erased when you delete it, start another recording, or close MirrorFit.
            </p>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="flex-1 py-3 rounded-full border border-[#E8E2D8] text-[#1A1816] text-xs font-semibold hover:bg-[#F4EFEB] transition-colors touch-target"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConsent}
                className="flex-1 py-3 rounded-full bg-[#7A1F2B] text-white text-xs font-semibold hover:bg-[#5E1721] shadow-md transition-colors touch-target flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Recording</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playback Replay Modal */}
      {isReplaying && recordedUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1A1816] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-white/20 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-2 text-white">
                <Play className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-editorial text-lg">Your Virtual Try-On Replay</h3>
              </div>
              <button
                type="button"
                onClick={onCloseReplay}
                className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full aspect-[9/16] max-h-[60vh] bg-black rounded-2xl overflow-hidden my-4 relative shadow-inner flex items-center justify-center">
              <video
                src={recordedUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            <div className="w-full flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  onDeleteRecording();
                  onCloseReplay();
                }}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Recording</span>
              </button>

              <button
                type="button"
                onClick={onCloseReplay}
                className="px-6 py-2.5 rounded-full bg-white text-[#1A1816] hover:bg-[#FAF8F5] text-xs font-semibold shadow-md transition-colors"
              >
                Close Replay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
