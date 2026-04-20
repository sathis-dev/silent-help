'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Ambient Sound Player
 * 
 * Uses Web Audio API to generate procedural ambient soundscapes.
 * No MP3 files needed — everything is synthesized in real-time.
 */

type AmbientType = 'rain' | 'waves' | 'binaural' | 'whitenoise';

interface AmbientMeta {
    label: string;
    emoji: string;
    color: string;
}

const AMBIENT_OPTIONS: Record<AmbientType, AmbientMeta> = {
    rain:       { label: 'Rain',           emoji: '🌧️', color: '#38bdf8' },
    waves:      { label: 'Ocean Waves',    emoji: '🌊', color: '#818cf8' },
    binaural:   { label: 'Binaural 432Hz', emoji: '🧠', color: '#a78bfa' },
    whitenoise: { label: 'White Noise',    emoji: '☁️',  color: '#94a3b8' },
};

interface AmbientPlayerProps {
    accent?: string;
}

export default function AmbientPlayer({ accent = '#2dd4bf' }: AmbientPlayerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [playing, setPlaying] = useState<AmbientType | null>(null);
    const [volume, setVolume] = useState(0.3);

    const ctxRef = useRef<AudioContext | null>(null);
    const nodesRef = useRef<AudioNode[]>([]);
    const gainRef = useRef<GainNode | null>(null);

    const getCtx = useCallback(() => {
        if (!ctxRef.current) {
            ctxRef.current = new AudioContext();
        }
        if (ctxRef.current.state === 'suspended') {
            ctxRef.current.resume();
        }
        return ctxRef.current;
    }, []);

    const stopAll = useCallback(() => {
        nodesRef.current.forEach(n => {
            try {
                if (n instanceof AudioBufferSourceNode || n instanceof OscillatorNode) {
                    n.stop();
                }
                n.disconnect();
            } catch { /* already stopped */ }
        });
        nodesRef.current = [];
        gainRef.current = null;
    }, []);

    const startSound = useCallback((type: AmbientType) => {
        stopAll();
        const ctx = getCtx();

        const masterGain = ctx.createGain();
        masterGain.gain.value = volume;
        masterGain.connect(ctx.destination);
        gainRef.current = masterGain;

        if (type === 'whitenoise' || type === 'rain') {
            // Brown/pink noise via buffer
            const bufferSize = ctx.sampleRate * 2;
            const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
            for (let ch = 0; ch < 2; ch++) {
                const data = buffer.getChannelData(ch);
                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    if (type === 'rain') {
                        // Brown noise (deeper, rain-like)
                        lastOut = (lastOut + (0.02 * white)) / 1.02;
                        data[i] = lastOut * 3.5;
                    } else {
                        data[i] = white;
                    }
                }
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = type === 'rain' ? 800 : 4000;

            source.connect(filter);
            filter.connect(masterGain);
            source.start();
            nodesRef.current.push(source, filter);

        } else if (type === 'waves') {
            // Slow modulated low-frequency drone
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 55; // Deep A1

            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.08; // Very slow modulation

            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 20;

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 200;

            osc.connect(filter);
            filter.connect(masterGain);
            osc.start();
            lfo.start();
            nodesRef.current.push(osc, lfo, lfoGain, filter);

        } else if (type === 'binaural') {
            // Two slightly detuned sine waves (432Hz & 440Hz) create binaural beat
            const oscL = ctx.createOscillator();
            oscL.type = 'sine';
            oscL.frequency.value = 432;

            const oscR = ctx.createOscillator();
            oscR.type = 'sine';
            oscR.frequency.value = 440;

            const merger = ctx.createChannelMerger(2);
            oscL.connect(merger, 0, 0);
            oscR.connect(merger, 0, 1);
            merger.connect(masterGain);

            oscL.start();
            oscR.start();
            nodesRef.current.push(oscL, oscR, merger);
        }

        nodesRef.current.push(masterGain);
    }, [getCtx, stopAll, volume]);

    const toggle = useCallback((type: AmbientType) => {
        if (playing === type) {
            stopAll();
            setPlaying(null);
        } else {
            startSound(type);
            setPlaying(type);
        }
    }, [playing, stopAll, startSound]);

    // Update volume live
    useEffect(() => {
        if (gainRef.current) {
            gainRef.current.gain.value = volume;
        }
    }, [volume]);

    // Cleanup on unmount
    useEffect(() => {
        return () => { stopAll(); };
    }, [stopAll]);

    const activeMeta = playing ? AMBIENT_OPTIONS[playing] : null;

    return (
        <div style={{ position: 'fixed', bottom: 90, right: 20, zIndex: 1000 }}>
            {/* Expanded Panel */}
            {isOpen && (
                <div style={{
                    position: 'absolute', bottom: 56, right: 0,
                    width: 240, padding: '16px',
                    background: 'rgba(15,23,42,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>
                        Ambient Sounds
                    </div>
                    {(Object.entries(AMBIENT_OPTIONS) as [AmbientType, AmbientMeta][]).map(([key, meta]) => (
                        <button
                            key={key}
                            onClick={() => toggle(key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: 12,
                                background: playing === key ? `${meta.color}15` : 'rgba(2,6,23,0.4)',
                                border: playing === key ? `1px solid ${meta.color}40` : '1px solid rgba(255,255,255,0.05)',
                                color: playing === key ? meta.color : '#94a3b8',
                                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                                transition: 'all 0.2s',
                                width: '100%', textAlign: 'left',
                            }}
                        >
                            <span style={{ fontSize: '1.1rem' }}>{meta.emoji}</span>
                            {meta.label}
                            {playing === key && (
                                <span style={{
                                    marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%',
                                    background: meta.color,
                                    boxShadow: `0 0 8px ${meta.color}`,
                                    animation: 'breathe-glow 2s ease-in-out infinite',
                                }} />
                            )}
                        </button>
                    ))}

                    {/* Volume slider */}
                    {playing && (
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>🔈</span>
                            <input
                                type="range" min="0" max="1" step="0.05"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                style={{
                                    flex: 1, height: 4, appearance: 'none',
                                    background: `linear-gradient(to right, ${activeMeta?.color || accent} ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
                                    borderRadius: 4, outline: 'none', cursor: 'pointer',
                                }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>🔊</span>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: playing
                        ? `linear-gradient(135deg, ${activeMeta?.color || accent}30, ${activeMeta?.color || accent}10)`
                        : 'rgba(15,23,42,0.8)',
                    border: playing
                        ? `2px solid ${activeMeta?.color || accent}60`
                        : '1px solid rgba(255,255,255,0.1)',
                    color: playing ? (activeMeta?.color || accent) : '#64748b',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem',
                    boxShadow: playing ? `0 0 20px ${activeMeta?.color || accent}30` : '0 4px 12px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                aria-label="Ambient sounds"
                title="Ambient sounds"
            >
                {playing ? '🎵' : '🎶'}
            </button>
        </div>
    );
}
