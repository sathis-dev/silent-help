'use client';

/**
 * Accessibility settings — client-only, persisted to localStorage under `sh_a11y`.
 *
 * Features:
 *  - Quiet mode: greyscale + animation: none (for overstimulated users, sensory overload)
 *  - Reduce motion: respects prefers-reduced-motion automatically, can be forced on
 *  - Dyslexic font: switches typography to an OpenDyslexic-friendly system stack
 *  - Font scale: S / M / L / XL (100% / 112% / 124% / 140% rem root)
 *  - High contrast: boosts contrast in calm palette
 *  - Haptics: adds vibration on critical taps on supported devices
 *
 * Every setting is applied via data-* attributes on <html>; the CSS layer in
 * globals.css reads them. Zero JS animation work — pure CSS overrides.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface A11ySettings {
    quietMode: boolean;
    reduceMotion: boolean;
    dyslexicFont: boolean;
    fontScale: 'S' | 'M' | 'L' | 'XL';
    highContrast: boolean;
    haptics: boolean;
}

const DEFAULTS: A11ySettings = {
    quietMode: false,
    reduceMotion: false,
    dyslexicFont: false,
    fontScale: 'M',
    highContrast: false,
    haptics: true,
};

interface Ctx {
    settings: A11ySettings;
    setSetting: <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => void;
    reset: () => void;
    vibrate: (pattern?: number | number[]) => void;
}

const AccessibilityContext = createContext<Ctx | null>(null);

function load(): A11ySettings {
    if (typeof window === 'undefined') return DEFAULTS;
    try {
        const raw = window.localStorage.getItem('sh_a11y');
        if (!raw) return DEFAULTS;
        const parsed = JSON.parse(raw);
        return { ...DEFAULTS, ...parsed };
    } catch {
        return DEFAULTS;
    }
}

function persist(s: A11ySettings) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem('sh_a11y', JSON.stringify(s));
    } catch {
        // ignore
    }
}

function apply(s: A11ySettings) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.dataset.quietMode = s.quietMode ? 'on' : 'off';
    root.dataset.reduceMotion = s.reduceMotion ? 'on' : 'off';
    root.dataset.dyslexic = s.dyslexicFont ? 'on' : 'off';
    root.dataset.fontScale = s.fontScale;
    root.dataset.highContrast = s.highContrast ? 'on' : 'off';
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<A11ySettings>(DEFAULTS);

    useEffect(() => {
        const loaded = load();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings(loaded);
        apply(loaded);
    }, []);

    const setSetting = useCallback(<K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
        setSettings((prev) => {
            const next = { ...prev, [key]: value };
            persist(next);
            apply(next);
            return next;
        });
    }, []);

    const reset = useCallback(() => {
        setSettings(DEFAULTS);
        persist(DEFAULTS);
        apply(DEFAULTS);
    }, []);

    const vibrate = useCallback(
        (pattern: number | number[] = 10) => {
            if (!settings.haptics) return;
            if (typeof navigator === 'undefined' || !navigator.vibrate) return;
            try {
                navigator.vibrate(pattern);
            } catch {
                // ignore
            }
        },
        [settings.haptics],
    );

    const value = useMemo<Ctx>(() => ({ settings, setSetting, reset, vibrate }), [settings, setSetting, reset, vibrate]);

    return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useA11y(): Ctx {
    const v = useContext(AccessibilityContext);
    if (!v) {
        // Fallback — render without crashing if provider isn't mounted (shouldn't happen).
        return {
            settings: DEFAULTS,
            setSetting: () => {},
            reset: () => {},
            vibrate: () => {},
        };
    }
    return v;
}
