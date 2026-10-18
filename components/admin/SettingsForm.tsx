'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MirrorFitSettings } from '@/types/database';
import { updateMirrorFitSettingsAction } from '@/lib/products/mutations';
import { Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface SettingsFormProps {
  initialSettings: MirrorFitSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [previewSeconds, setPreviewSeconds] = useState(initialSettings.preview_seconds.toString());
  const [recordingEnabled, setRecordingEnabled] = useState(initialSettings.recording_enabled);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateMirrorFitSettingsAction({
        preview_seconds: parseInt(previewSeconds || '30', 10),
        recording_enabled: recordingEnabled,
      });

      setMessage({ type: 'success', text: 'MirrorFit settings updated successfully!' });
      router.refresh();
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update settings.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 md:p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-5 max-w-2xl">
      <div>
        <h1 className="section-heading text-[#1A1816]">
          MirrorFit Settings
        </h1>
        <p className="body-copy text-[#736C65] mt-1">
          Set the fitting duration and choose whether customers can record previews.
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-2xl flex items-center space-x-2 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="max-w-sm space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
            AI Preview Session Limit (Seconds)
          </label>
          <input
            type="number"
            min="10"
            max="120"
            required
            value={previewSeconds}
            onChange={(e) => setPreviewSeconds(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] text-xs text-[#1A1816] focus:outline-none focus:ring-2 focus:ring-[#7A1F2B]"
          />
          <span className="text-[10px] text-[#736C65]">Standard retail limit: 30 seconds</span>
        </div>

        <div className="pt-2">
          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={recordingEnabled}
              onChange={(e) => setRecordingEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-[#7A1F2B] focus:ring-[#7A1F2B]"
            />
            <div>
              <span className="text-xs font-semibold text-[#1A1816] block">
                Allow Customer Clip Recording
              </span>
              <span className="text-[11px] text-[#736C65]">
                Permits customer to record up to 30s of their preview locally for immediate replay.
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E8E2D8] flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#7A1F2B] text-white hover:bg-[#5E1721] text-xs font-semibold shadow-md transition-all disabled:opacity-50 touch-target"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSubmitting ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </form>
  );
}
