'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-subtle)] transition-colors',
        'focus:border-[color:var(--color-border-glow)] focus:bg-white/[0.05] focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[90px] w-full rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-subtle)] transition-colors resize-none',
      'focus:border-[color:var(--color-border-glow)] focus:bg-white/[0.05] focus:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
