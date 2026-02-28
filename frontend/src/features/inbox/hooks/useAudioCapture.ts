import { useState, useRef, useCallback } from 'react';
import apiClient from '@shared/api/apiClient';
import { ApiResponse } from '@shared/types/common.types';
import { InboxItem } from '../types/inbox.types';

/**
 * Hook para grabar audio desde el micrófono y enviarlo al backend
 * para su transcripción automática con Whisper.
 *
 * Uso:
 *   const { isRecording, startRecording, stopAndTranscribe, transcribing, error } = useAudioCapture();
 */
export function useAudioCapture(onSuccess?: (item: InboxItem) => void) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const startRecording = useCallback(async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
        } catch (e) {
            setError('No se pudo acceder al micrófono');
        }
    }, []);

    const stopAndTranscribe = useCallback(async () => {
        const recorder = mediaRecorderRef.current;
        if (!recorder) return;

        return new Promise<void>((resolve) => {
            recorder.onstop = async () => {
                // Para los tracks del stream
                recorder.stream.getTracks().forEach((t) => t.stop());
                setIsRecording(false);

                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('file', blob, 'recording.webm');

                try {
                    setTranscribing(true);
                    const res = await apiClient.post<ApiResponse<InboxItem>>(
                        '/inbox/audio',
                        formData,
                        { headers: { 'Content-Type': 'multipart/form-data' } }
                    );
                    onSuccess?.(res.data.data);
                } catch (e) {
                    setError('Error al transcribir el audio');
                } finally {
                    setTranscribing(false);
                    resolve();
                }
            };

            recorder.stop();
        });
    }, [onSuccess]);

    return { isRecording, startRecording, stopAndTranscribe, transcribing, error };
}