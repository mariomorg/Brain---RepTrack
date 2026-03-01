import React from 'react';
import { useAudioCapture } from '../hooks/useAudioCapture';
import { InboxItem } from '../types/inbox.types';

interface AudioCaptureButtonProps {
    onTranscribed: (item: InboxItem) => void;
}

/**
 * Botón de grabación de audio para el Inbox.
 * Añade este componente en InboxPage junto al campo de texto existente.
 *
 * Uso en InboxPage.tsx:
 *   <AudioCaptureButton onTranscribed={refresh} />
 */
export function AudioCaptureButton({ onTranscribed }: AudioCaptureButtonProps) {
    const { isRecording, startRecording, stopAndTranscribe, transcribing, error } =
        useAudioCapture(onTranscribed);

    return (
        <div className="flex flex-col items-center gap-1">
            <button
                type="button"
                onClick={isRecording ? stopAndTranscribe : startRecording}
                disabled={transcribing}
                title={isRecording ? 'Detener y transcribir' : 'Grabar audio'}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                    ${isRecording
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }
                    ${transcribing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                {transcribing ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Transcribiendo…
                    </>
                ) : isRecording ? (
                    <>
                        <span className="w-3 h-3 bg-white rounded-full" />
                        Detener
                    </>
                ) : (
                    <>
                        <MicIcon />
                        Grabar audio
                    </>
                )}
            </button>

            {/* También permite subir un archivo de audio existente */}
            {!isRecording && !transcribing && (
                <label className="text-xs text-gray-500 cursor-pointer hover:text-indigo-600 transition-colors">
                    o sube un archivo
                    <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            uploadFile(file, onTranscribed);
                            e.target.value = '';
                        }}
                    />
                </label>
            )}

            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}

// ── Subir archivo existente ────────────────────────────────────────────────────
async function uploadFile(file: File, onSuccess: (item: InboxItem) => void) {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const { default: apiClient } = await import('@shared/api/apiClient');
        const res = await apiClient.post('/inbox/audio', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        onSuccess(res.data.data);
    } catch {
        console.error('Error al subir archivo de audio');
    }
}

// ── Icono micrófono inline (sin dependencia extra) ────────────────────────────
function MicIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    );
}