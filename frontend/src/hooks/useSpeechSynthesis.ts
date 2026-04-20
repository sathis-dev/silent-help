'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechSynthesis() {
    const [isSupported, setIsSupported] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!window.speechSynthesis) {
            setTimeout(() => setIsSupported(false), 0);
            return;
        }

        const loadVoices = () => {
            voicesRef.current = window.speechSynthesis.getVoices();
        };

        loadVoices();
        // Chrome requires onvoiceschanged to populate the list on initial load
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    const speak = useCallback((text: string) => {
        if (!isSupported || typeof window === 'undefined') return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find a soothing/good English voice if possible
        const voices = voicesRef.current;
        if (voices.length > 0) {
            // Priority: Google UK English Female -> Samantha -> Any Female English -> Any English
            const preferredVoice = voices.find(v => v.name.includes('Google UK English Female')) ||
                                   voices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria')) ||
                                   voices.find(v => v.lang.startsWith('en-') && v.name.toLowerCase().includes('female')) ||
                                   voices.find(v => v.lang.startsWith('en-'));
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
        }

        // Calmer pacing
        utterance.rate = 0.95; 
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isSupported]);

    const stop = useCallback(() => {
        if (!isSupported || typeof window === 'undefined') return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [isSupported]);

    return {
        isSupported,
        isSpeaking,
        speak,
        stop
    };
}
