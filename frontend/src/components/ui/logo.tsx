import { cn } from '@/lib/cn';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  withWordmark?: boolean;
}

export function Logo({ size = 40, withWordmark, className, ...props }: LogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)} {...props}>
      <div
        className="relative flex items-center justify-center rounded-2xl"
        style={{
          width: size,
          height: size,
          background:
            'conic-gradient(from 140deg at 50% 50%, #7dd3fc, #a78bfa, #fb7185, #fbbf24, #34d399, #7dd3fc)',
          padding: 1.5,
        }}
      >
        <div
          className="flex h-full w-full items-center justify-center rounded-[inherit]"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 40%, rgba(255,255,255,0.08), rgba(5,7,13,0.95))',
          }}
        >
          <svg viewBox="0 0 48 48" width={size * 0.55} height={size * 0.55} fill="none">
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0" stopColor="#7dd3fc" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="19" stroke="url(#logo-grad)" strokeWidth="2" />
            <path
              d="M15 26c1.5 3.5 5 5.5 9 5.5s7.5-2 9-5.5"
              stroke="url(#logo-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="18" cy="20" r="1.8" fill="#7dd3fc" />
            <circle cx="30" cy="20" r="1.8" fill="#a78bfa" />
          </svg>
        </div>
      </div>
      {withWordmark && (
        <span className="text-[1.05rem] font-semibold tracking-tight text-[color:var(--color-fg)]">
          Silent Help
        </span>
      )}
    </div>
  );
}
