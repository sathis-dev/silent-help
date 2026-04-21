import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { WellnessProvider } from '@/components/wellness/WellnessProvider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Silent Help · The quiet place between you and the storm',
  description:
    'A private, pathway-aware mental-health companion. Encrypted journalling, AI support, offline-first calm tools and a UK crisis safety net.',
};

export const viewport: Viewport = {
  themeColor: '#05070d',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#7dd3fc',
          colorBackground: '#0a0f1a',
          colorInputBackground: 'rgba(255,255,255,0.03)',
          colorInputText: '#f5f7fb',
          colorText: '#f5f7fb',
          colorTextSecondary: '#9aa7bd',
          borderRadius: '14px',
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        },
        elements: {
          card: 'bg-transparent shadow-none border-0',
          headerTitle: 'text-2xl font-semibold tracking-tight',
          headerSubtitle: 'text-[color:var(--color-fg-muted)]',
          socialButtonsBlockButton:
            'bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20',
          formButtonPrimary:
            'bg-gradient-to-br from-[#7dd3fc] to-[#a78bfa] text-slate-950 hover:shadow-lg normal-case font-medium',
          footer: 'hidden',
          formFieldInput:
            'bg-white/[0.03] border border-white/10 focus:border-[#7dd3fc]/40',
        },
      }}
    >
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <body className="font-sans antialiased">
          <TooltipProvider delayDuration={200}>
            <WellnessProvider>
              {children}
              <Toaster />
            </WellnessProvider>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
