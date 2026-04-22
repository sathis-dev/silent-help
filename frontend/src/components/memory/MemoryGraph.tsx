'use client';

/**
 * MemoryGraph — a gentle, kind-based visualization of the memories the AI holds.
 * Each memory is a node, coloured by its `kind` (context/preference/goal/etc.).
 * Nodes cluster around a kind-anchor and gently float with CSS (respects reduce-motion).
 * No canvas / WebGL — plain SVG, keeps bundle lean.
 */

import { useMemo } from 'react';
import type { Memory } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

const KIND_COLORS: Record<Memory['kind'], string> = {
    context: '#7dd3fc',
    preference: '#a78bfa',
    goal: '#fbbf24',
    boundary: '#fb7185',
    relationship: '#22d3ee',
    event: '#2dd4bf',
};

const KIND_LABELS: Record<Memory['kind'], string> = {
    context: 'Context',
    preference: 'Preference',
    goal: 'Goal',
    boundary: 'Boundary',
    relationship: 'Relationship',
    event: 'Event',
};

interface Props {
    memories: Memory[];
    loading?: boolean;
}

interface Node {
    id: string;
    x: number;
    y: number;
    r: number;
    color: string;
    kind: Memory['kind'];
    content: string;
}

function layout(memories: Memory[], width: number, height: number): Node[] {
    // Group memories by kind, place each kind around a circle anchor.
    const kinds = Array.from(new Set(memories.map((m) => m.kind))).sort();
    const centerX = width / 2;
    const centerY = height / 2;
    const anchorRadius = Math.min(width, height) * 0.3;
    const anchors = new Map<Memory['kind'], { ax: number; ay: number }>();
    kinds.forEach((k, i) => {
        const angle = (i / Math.max(kinds.length, 1)) * Math.PI * 2 - Math.PI / 2;
        anchors.set(k, {
            ax: centerX + Math.cos(angle) * anchorRadius,
            ay: centerY + Math.sin(angle) * anchorRadius,
        });
    });

    return memories.map((m, i) => {
        const anchor = anchors.get(m.kind) ?? { ax: centerX, ay: centerY };
        // Spiral around the anchor so nodes don't overlap perfectly
        const angle = i * 2.39996; // golden angle
        const dist = 18 + Math.sqrt(i) * 12;
        return {
            id: m.id,
            x: anchor.ax + Math.cos(angle) * dist,
            y: anchor.ay + Math.sin(angle) * dist,
            r: 7 + Math.min(m.salience * 6, 10),
            color: KIND_COLORS[m.kind],
            kind: m.kind,
            content: m.content,
        };
    });
}

export default function MemoryGraph({ memories, loading }: Props) {
    const nodes = useMemo(() => layout(memories, 520, 280), [memories]);
    const presentKinds = useMemo(
        () => Array.from(new Set(memories.map((m) => m.kind))).sort(),
        [memories],
    );

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                            <Sparkles className="h-4 w-4 text-[color:var(--color-accent)]" />
                            Your memory map
                        </h3>
                        <p className="mt-1 text-xs text-[color:var(--color-fg-muted)]">
                            The shape of what your companion is quietly holding for you.
                        </p>
                    </div>
                    {presentKinds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {presentKinds.map((k) => (
                                <span
                                    key={k}
                                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider"
                                    style={{
                                        borderColor: `${KIND_COLORS[k]}55`,
                                        color: KIND_COLORS[k],
                                        background: `${KIND_COLORS[k]}12`,
                                    }}
                                >
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: KIND_COLORS[k] }} />
                                    {KIND_LABELS[k]}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-5">
                    {loading ? (
                        <Skeleton className="h-[280px] w-full rounded-xl" />
                    ) : memories.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                            <p className="text-sm text-[color:var(--color-fg-muted)]">
                                Nothing to map yet. Write a journal or have a conversation and your memory will grow.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent">
                            <svg viewBox="0 0 520 280" className="h-[280px] w-full">
                                <defs>
                                    {Object.entries(KIND_COLORS).map(([k, c]) => (
                                        <radialGradient key={k} id={`glow-${k}`} cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor={c} stopOpacity="0.9" />
                                            <stop offset="60%" stopColor={c} stopOpacity="0.4" />
                                            <stop offset="100%" stopColor={c} stopOpacity="0" />
                                        </radialGradient>
                                    ))}
                                </defs>
                                {/* Soft connection lines between same-kind pairs */}
                                {nodes.flatMap((n1, i) =>
                                    nodes.slice(i + 1).map((n2) => {
                                        if (n1.kind !== n2.kind) return null;
                                        const dx = n1.x - n2.x;
                                        const dy = n1.y - n2.y;
                                        const d = Math.hypot(dx, dy);
                                        if (d > 80) return null;
                                        return (
                                            <line
                                                key={`${n1.id}-${n2.id}`}
                                                x1={n1.x}
                                                y1={n1.y}
                                                x2={n2.x}
                                                y2={n2.y}
                                                stroke={n1.color}
                                                strokeOpacity="0.18"
                                                strokeWidth="1"
                                            />
                                        );
                                    }),
                                )}
                                {nodes.map((n) => (
                                    <g key={n.id}>
                                        <circle cx={n.x} cy={n.y} r={n.r * 2.2} fill={`url(#glow-${n.kind})`} opacity="0.5" />
                                        <circle cx={n.x} cy={n.y} r={n.r} fill={n.color} fillOpacity="0.85">
                                            <title>{`${KIND_LABELS[n.kind]}: ${n.content}`}</title>
                                        </circle>
                                    </g>
                                ))}
                            </svg>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
