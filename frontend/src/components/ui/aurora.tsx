'use client';

import { cn } from '@/lib/cn';

interface AuroraProps extends React.HTMLAttributes<HTMLDivElement> {
  colors?: string[];
  intensity?: 'soft' | 'normal' | 'strong';
}

export function Aurora({ colors, intensity = 'normal', className, ...props }: AuroraProps) {
  const palette =
    colors && colors.length >= 3
      ? colors
      : ['rgba(125, 211, 252, 0.5)', 'rgba(167, 139, 250, 0.5)', 'rgba(45, 212, 191, 0.4)'];
  const opacity = intensity === 'soft' ? 0.4 : intensity === 'strong' ? 0.9 : 0.65;

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      {...props}
    >
      <div
        className="absolute left-[5%] top-[-10%] h-[55vmax] w-[55vmax] rounded-full blur-[110px]"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${palette[0]}, transparent 60%)`,
          opacity,
          animation: 'aurora-drift 22s var(--ease-out-quint) infinite alternate',
        }}
      />
      <div
        className="absolute right-[-10%] top-[20%] h-[50vmax] w-[50vmax] rounded-full blur-[120px]"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${palette[1]}, transparent 60%)`,
          opacity: opacity * 0.9,
          animation: 'aurora-drift 28s var(--ease-out-quint) infinite alternate-reverse',
        }}
      />
      <div
        className="absolute bottom-[-15%] left-[20%] h-[50vmax] w-[50vmax] rounded-full blur-[120px]"
        style={{
          background: `radial-gradient(circle at 40% 40%, ${palette[2]}, transparent 60%)`,
          opacity: opacity * 0.8,
          animation: 'aurora-drift 26s var(--ease-out-quint) infinite alternate',
        }}
      />
    </div>
  );
}

export function NoiseOverlay({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}
