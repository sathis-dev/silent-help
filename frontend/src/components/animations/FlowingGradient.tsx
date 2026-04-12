'use client';

interface FlowingGradientProps {
    colors?: string[];
    speed?: number;
    className?: string;
    style?: React.CSSProperties;
}

export default function FlowingGradient({
    colors = ['#a78bfa', '#818cf8', '#38bdf8', '#2dd4bf'],
    speed = 8,
    className = '',
    style = {},
}: FlowingGradientProps) {
    const gradient = `linear-gradient(270deg, ${colors.join(', ')})`;

    return (
        <div
            className={`flowing-gradient ${className}`}
            style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                background: gradient,
                backgroundSize: '300% 300%',
                animation: `flowing-gradient-move ${speed}s ease infinite`,
                opacity: 0.12,
                pointerEvents: 'none',
                zIndex: 0,
                ...style,
            }}
        />
    );
}
