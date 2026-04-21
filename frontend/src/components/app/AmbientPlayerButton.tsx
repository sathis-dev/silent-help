'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Music4, Pause, Play, Volume2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';

type AmbientType = 'rain' | 'waves' | 'binaural' | 'whitenoise';

const OPTIONS: Record<AmbientType, { label: string; emoji: string; color: string; description: string }> = {
  rain: { label: 'Rain', emoji: '🌧️', color: '#38bdf8', description: 'Soft downpour' },
  waves: { label: 'Waves', emoji: '🌊', color: '#818cf8', description: 'Slow tidal drone' },
  binaural: { label: 'Binaural', emoji: '🧠', color: '#a78bfa', description: '432 Hz · 440 Hz' },
  whitenoise: { label: 'White noise', emoji: '☁️', color: '#94a3b8', description: 'Masking field' },
};

export function AmbientPlayerButton({ accent = '#7dd3fc' }: { accent?: string }) {
  const [playing, setPlaying] = useState<AmbientType | null>(null);
  const [volume, setVolume] = useState(0.3);
  const [open, setOpen] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  const stopAll = useCallback(() => {
    nodesRef.current.forEach((n) => {
      try {
        if (n instanceof AudioBufferSourceNode || n instanceof OscillatorNode) n.stop();
        n.disconnect();
      } catch {
        /* noop */
      }
    });
    nodesRef.current = [];
    gainRef.current = null;
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);

  const startSound = useCallback(
    (type: AmbientType) => {
      stopAll();
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
      gainRef.current = master;

      if (type === 'whitenoise' || type === 'rain') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const data = buffer.getChannelData(ch);
          let last = 0;
          for (let i = 0; i < bufferSize; i++) {
            const w = Math.random() * 2 - 1;
            if (type === 'rain') {
              last = (last + 0.02 * w) / 1.02;
              data[i] = last * 3.5;
            } else data[i] = w;
          }
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = type === 'rain' ? 800 : 4000;
        src.connect(filter);
        filter.connect(master);
        src.start();
        nodesRef.current.push(src, filter);
      } else if (type === 'waves') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 55;
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.08;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 20;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        osc.connect(filter);
        filter.connect(master);
        osc.start();
        lfo.start();
        nodesRef.current.push(osc, lfo, lfoGain, filter);
      } else if (type === 'binaural') {
        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.value = 432;
        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.value = 440;
        const merger = ctx.createChannelMerger(2);
        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(master);
        oscL.start();
        oscR.start();
        nodesRef.current.push(oscL, oscR, merger);
      }
      nodesRef.current.push(master);
      setPlaying(type);
    },
    [stopAll, volume],
  );

  const toggle = (type: AmbientType) => {
    if (playing === type) {
      stopAll();
      setPlaying(null);
    } else startSound(type);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[color:var(--color-fg-muted)] transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-[color:var(--color-fg)]',
            playing && 'text-[color:var(--color-fg)]',
          )}
          style={playing ? { borderColor: `${accent}55`, background: `${accent}15` } : undefined}
          aria-label="Ambient sounds"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Music4 className="h-4 w-4" />}
          {playing && (
            <span
              className="absolute inset-0 -z-10 rounded-full"
              style={{ boxShadow: `0 0 0 0 ${accent}88`, animation: 'pulse-ring 2s ease-out infinite' }}
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3">
        <div className="mb-2 px-1 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">
          Ambient
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(OPTIONS) as AmbientType[]).map((type) => {
            const opt = OPTIONS[type];
            const active = playing === type;
            return (
              <button
                key={type}
                onClick={() => toggle(type)}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left text-xs transition-all hover:border-white/20 hover:bg-white/[0.05]',
                  active && 'border-white/20',
                )}
                style={active ? { borderColor: `${opt.color}55`, background: `${opt.color}15` } : undefined}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="font-medium text-[color:var(--color-fg)]">{opt.label}</span>
                  {active ? <Pause className="ml-auto h-3 w-3" /> : <Play className="ml-auto h-3 w-3 opacity-70" />}
                </span>
                <span className="text-[10px] text-[color:var(--color-fg-subtle)]">{opt.description}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-3 px-1">
          <Volume2 className="h-3.5 w-3.5 text-[color:var(--color-fg-subtle)]" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 accent-[color:var(--color-fg)]"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
