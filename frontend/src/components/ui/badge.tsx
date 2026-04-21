import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-white/10 bg-white/5 text-[color:var(--color-fg-muted)]',
        solid:
          'border-transparent bg-[color:var(--color-fg)] text-[color:var(--color-bg)]',
        outline: 'border-white/15 text-[color:var(--color-fg)]',
        accent:
          'border-[color:var(--accent,#7dd3fc)]/30 bg-[color:var(--accent,#7dd3fc)]/10 text-[color:var(--accent,#7dd3fc)]',
        success:
          'border-[color:var(--color-success)]/30 bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]',
        warning:
          'border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]',
        danger:
          'border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
