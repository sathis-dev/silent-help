'use client';

/**
 * Silent Help — on-device dictation hook.
 *
 * Drop-in companion to `useSpeechRecognition` that records mic audio with
 * MediaRecorder and transcribes it *in the browser* via Whisper-tiny. No
 * audio ever reaches a server.
 *
 * Trade-off vs Web Speech API: Whisper runs at end-of-utterance (batch),
 * so there's no live interim transcript during speech. We surface a
 * "Transcribing privately…" state instead.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    preloadVoiceOnDevice,
    probeVoiceOnDevice,
    transcribeOnDevice,
} from '@/lib/voice-on-device';

export type DictationPhase = 'idle' | 'listening' | 'transcribing' | 'done' | 'error';

export interface OnDeviceDictationState {
    isSupported: boolean;
    isListening: boolean;
    isTranscribing: boolean;
    phase: DictationPhase;
    transcript: string;
    loadProgress: number; // 0..100, -1 when not loading
    loadMessage: string;
    error: string | null;
    startListening: () => Promise<void>;
    stopListening: () => Promise<void>;
    resetTranscript: () => void;
}

export function useOnDeviceDictation(): OnDeviceDictationState {
    const [isSupported, setIsSupported] = useState(true);
    const [phase, setPhase] = useState<DictationPhase>('idle');
    const [transcript, setTranscript] = useState('');
    const [loadProgress, setLoadProgress] = useState(-1);
    const [loadMessage, setLoadMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    // Probe capabilities once. Pre-warm model on idle so the first click is snappy.
    useEffect(() => {
        let alive = true;
        probeVoiceOnDevice()
            .then((cap) => {
                if (!alive) return;
                setIsSupported(cap.mediaRecorder);
                if (cap.mediaRecorder) preloadVoiceOnDevice();
            })
            .catch(() => {
                if (alive) setIsSupported(false);
            });
        return () => {
            alive = false;
        };
    }, []);

    const cleanup = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recorderRef.current = null;
        chunksRef.current = [];
    }, []);

    const startListening = useCallback(async () => {
        if (!isSupported) return;
        setError(null);
        setTranscript('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mime = pickMime();
            const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
            chunksRef.current = [];
            rec.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorderRef.current = rec;
            rec.start(250);
            setPhase('listening');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            setPhase('error');
            cleanup();
        }
    }, [isSupported, cleanup]);

    const stopListening = useCallback(async () => {
        const rec = recorderRef.current;
        if (!rec) return;
        const stopped: Promise<void> = new Promise((resolve) => {
            rec.onstop = () => resolve();
            try {
                rec.stop();
            } catch {
                resolve();
            }
        });
        await stopped;
        const chunks = chunksRef.current;
        cleanup();

        if (chunks.length === 0) {
            setPhase('idle');
            return;
        }

        setPhase('transcribing');
        const blob = new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' });
        try {
            const text = await transcribeOnDevice(blob, {
                onProgress: (pct, msg) => {
                    setLoadProgress(pct);
                    setLoadMessage(msg);
                },
            });
            setLoadProgress(-1);
            setTranscript(text);
            setPhase('done');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            setPhase('error');
            setLoadProgress(-1);
        }
    }, [cleanup]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        if (phase === 'done' || phase === 'error') setPhase('idle');
    }, [phase]);

    return {
        isSupported,
        isListening: phase === 'listening',
        isTranscribing: phase === 'transcribing',
        phase,
        transcript,
        loadProgress,
        loadMessage,
        error,
        startListening,
        stopListening,
        resetTranscript,
    };
}

function pickMime(): string | null {
    if (typeof MediaRecorder === 'undefined') return null;
    const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
    ];
    for (const m of candidates) {
        if (MediaRecorder.isTypeSupported(m)) return m;
    }
    return null;
}
