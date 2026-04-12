'use client';

interface PulseRingProps {
    color?: string;
    size?: number;
    children?: React.ReactNode;
}

export default function PulseRing({
    color = '#38bdf8',
    size = 48,
    children,
}: PulseRingProps) {
    return (
        <div
            className="pulse-ring-container"
            style={{
                position: 'relative',
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                className="pulse-ring pulse-ring-1"
                style={{
                    position: 'absolute',
                    inset: -6,
                    borderRadius: '50%',
                    border: `2px solid ${color}`,
                    opacity: 0,
                    animation: 'pulse-ring-anim 2.5s ease-out infinite',
                }}
            />
            <div
                className="pulse-ring pulse-ring-2"
                style={{
                    position: 'absolute',
                    inset: -6,
                    borderRadius: '50%',
                    border: `2px solid ${color}`,
                    opacity: 0,
                    animation: 'pulse-ring-anim 2.5s ease-out infinite 0.8s',
                }}
            />
            {children}
        </div>
    );
}
