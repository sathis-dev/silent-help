'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-300 ease-out-quint disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-border-glow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa] text-slate-950 shadow-[0_10px_30px_-10px_rgba(125,211,252,0.6)] hover:shadow-[0_14px_40px_-10px_rgba(125,211,252,0.7)] hover:-translate-y-[1px]',
        secondary:
          'glass text-[color:var(--color-fg)] hover:bg-white/5 hover:border-white/15',
        ghost:
          'bg-transparent text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] hover:bg-white/5',
        outline:
          'border border-white/10 bg-transparent text-[color:var(--color-fg)] hover:bg-white/5 hover:border-white/20',
        danger:
          'bg-[color:var(--color-danger)]/15 text-[color:var(--color-danger)] border border-[color:var(--color-danger)]/30 hover:bg-[color:var(--color-danger)]/25',
        success:
          'bg-[color:var(--color-success)]/15 text-[color:var(--color-success)] border border-[color:var(--color-success)]/30 hover:bg-[color:var(--color-success)]/25',
        accent:
          'bg-[color:var(--accent,#7dd3fc)]/15 text-[color:var(--accent,#7dd3fc)] border border-[color:var(--accent,#7dd3fc)]/30 hover:bg-[color:var(--accent,#7dd3fc)]/25',
      },
      size: {
        xs: 'h-8 px-3 text-xs',
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-9 w-9',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
