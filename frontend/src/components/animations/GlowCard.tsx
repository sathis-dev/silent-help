'use client';

import { useRef, useState, type ReactNode } from 'react';

interface GlowCardProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    glowColor?: string;
    borderRadius?: number;
}

export default function GlowCard({
    children,
    className = '',
    style = {},
    glowColor = 'rgba(56, 189, 248, 0.15)',
    borderRadius = 16,
}: GlowCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [glow, setGlow] = useState({ x: 50, y: 50, active: false });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setGlow({ x, y, active: true });
    };

    const handleMouseLeave = () => setGlow(prev => ({ ...prev, active: false }));

    return (
        <div
            ref={cardRef}
            className={`glow-card ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                position: 'relative',
                borderRadius: `${borderRadius}px`,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(12px)',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                ...style,
            }}
        >
            {/* Spotlight glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    opacity: glow.active ? 1 : 0,
                    background: `radial-gradient(600px circle at ${glow.x}% ${glow.y}%, ${glowColor}, transparent 60%)`,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />
            {/* Border glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    opacity: glow.active ? 1 : 0,
                    border: `1px solid ${glowColor.replace('0.15', '0.3')}`,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
}
