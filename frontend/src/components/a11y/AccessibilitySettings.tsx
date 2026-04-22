'use client';

import { useA11y } from './AccessibilityProvider';
import { Card, CardContent } from '@/components/ui/card';

type FontScale = 'S' | 'M' | 'L' | 'XL';

function Toggle({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-6 py-3">
            <div className="flex-1">
                <div className="text-sm font-medium text-[color:var(--color-fg)]">{label}</div>
                <div className="mt-0.5 text-xs text-[color:var(--color-fg-muted)]">{description}</div>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-white/15 transition-colors"
                style={{ background: checked ? 'rgba(125, 211, 252, 0.55)' : 'rgba(255,255,255,0.04)' }}
            >
                <span
                    className="pointer-events-none inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: `translateX(${checked ? 22 : 2}px)` }}
                />
            </button>
        </div>
    );
}

export default function AccessibilitySettings() {
    const { settings, setSetting, reset } = useA11y();

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-semibold tracking-tight">Accessibility</h3>
                        <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                            Quiet, slow, legible — your companion on your terms.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={reset}
                        className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-[color:var(--color-fg-muted)] hover:border-white/20 hover:text-[color:var(--color-fg)]"
                    >
                        Reset
                    </button>
                </div>

                <div className="mt-4 divide-y divide-white/[0.06]">
                    <Toggle
                        label="Quiet mode"
                        description="Greyscale, zero animation — designed for sensory overload or overwhelm."
                        checked={settings.quietMode}
                        onChange={(v) => setSetting('quietMode', v)}
                    />
                    <Toggle
                        label="Reduce motion"
                        description="Disables all decorative animation and transitions."
                        checked={settings.reduceMotion}
                        onChange={(v) => setSetting('reduceMotion', v)}
                    />
                    <Toggle
                        label="Dyslexic-friendly font"
                        description="Uses a legibility-focused type stack (OpenDyslexic / Atkinson Hyperlegible)."
                        checked={settings.dyslexicFont}
                        onChange={(v) => setSetting('dyslexicFont', v)}
                    />
                    <Toggle
                        label="High contrast"
                        description="Brightens text, strengthens borders in the calm palette."
                        checked={settings.highContrast}
                        onChange={(v) => setSetting('highContrast', v)}
                    />
                    <Toggle
                        label="Haptics (mobile)"
                        description="Subtle vibration on breathing cues and critical taps."
                        checked={settings.haptics}
                        onChange={(v) => setSetting('haptics', v)}
                    />
                </div>

                <div className="mt-5 border-t border-white/[0.06] pt-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-fg-subtle)]">Text size</div>
                    <div className="mt-3 flex gap-2">
                        {(['S', 'M', 'L', 'XL'] as const).map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setSetting('fontScale', s as FontScale)}
                                className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
                                style={{
                                    borderColor:
                                        settings.fontScale === s ? 'rgba(125,211,252,0.5)' : 'rgba(255,255,255,0.1)',
                                    background:
                                        settings.fontScale === s ? 'rgba(125,211,252,0.12)' : 'rgba(255,255,255,0.02)',
                                    color:
                                        settings.fontScale === s ? '#7dd3fc' : 'var(--color-fg-muted)',
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
