'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster(props: React.ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast rounded-[var(--radius-md)] border border-white/10 bg-[color:var(--color-bg-elevated)]/90 backdrop-blur-xl text-[color:var(--color-fg)] shadow-[var(--shadow-soft)]',
          description: 'text-[color:var(--color-fg-muted)]',
          actionButton: 'bg-white/10 text-[color:var(--color-fg)]',
          cancelButton: 'bg-white/5 text-[color:var(--color-fg-muted)]',
        },
      }}
      {...props}
    />
  );
}
