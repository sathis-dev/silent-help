'use client';

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

class SoundEngine {
    private ac: AudioContext | null = null;
    readonly isSupported = typeof window !== 'undefined' && (window.AudioContext || (window as WebkitWindow).webkitAudioContext);

    private getContext(): AudioContext {
        if (!this.ac) {
            const AudioContextClass = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
            this.ac = new AudioContextClass!();
        }
        if (this.ac.state === 'suspended') {
            this.ac.resume();
        }
        return this.ac;
    }

    /**
     * Plays a soft, calming sine wave chime. Perfect for meditation starts/stops.
     * @param frequency The base pitch (Hz). E.g., 432Hz is calming.
     * @param duration Time in seconds before the sound fades completely.
     */
    public playChime(frequency: number = 432, duration: number = 3.0) {
        if (!this.isSupported) return;

        const ctx = this.getContext();
        const t = ctx.currentTime;

        // 1. Master Volume Control (Envelope)
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, t);
        // Instant attack, smooth but long decay
        gainNode.gain.linearRampToValueAtTime(0.3, t + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);

        // 2. The Sound Source (Sine wave is softest)
        const oscillator = ctx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, t);

        // Optional: Adding a slight frequency slide (vibrato/bend) makes it sound more organic
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.98, t + duration);

        // 3. Connect and Play
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(t);
        oscillator.stop(t + duration);
    }

    /**
     * Plays a deep, sustained, low-frequency hum. Perfect for breathing pacing.
     * @param isExhale Lowers pitch slightly for exhales.
     */
    public playBreathCue(isExhale: boolean = false) {
        if (!this.isSupported) return;

        const ctx = this.getContext();
        const t = ctx.currentTime;
        const duration = 2.0;
        
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, t);
        // Extremely soft volume
        gainNode.gain.linearRampToValueAtTime(0.05, t + 0.5);
        gainNode.gain.linearRampToValueAtTime(0, t + duration);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(isExhale ? 200 : 300, t);

        const oscillator = ctx.createOscillator();
        oscillator.type = 'sine';
        const startFreq = isExhale ? 140 : 120;
        const endFreq = isExhale ? 100 : 160;
        
        oscillator.frequency.setValueAtTime(startFreq, t);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, t + duration * 0.8);

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(t);
        oscillator.stop(t + duration);
    }
}

// Export a singleton instance
export const soundManager = new SoundEngine();
