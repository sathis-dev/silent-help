'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Sidebar, MobileNav } from '@/components/app/Sidebar';
import { TopBar } from '@/components/app/TopBar';
import { CommandPalette } from '@/components/app/CommandPalette';
import { Aurora, NoiseOverlay } from '@/components/ui/aurora';
import { useWellness } from '@/components/wellness/WellnessProvider';
import { resolveEmotion, emotionCssVars } from '@/lib/emotion-theme';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { profile } = useWellness();
  const [cmdOpen, setCmdOpen] = useState(false);

  const theme = resolveEmotion(profile?.emotionalProfile ?? null);

  useEffect(() => {
    const isGuest =
      typeof window !== 'undefined' && !!localStorage.getItem('sh_guest_name');
    if (isLoaded && !isSignedIn && !isGuest) {
      router.replace('/auth/login');
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loading-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    const isGuest =
      typeof window !== 'undefined' && !!localStorage.getItem('sh_guest_name');
    if (!isGuest) return null;
  }

  return (
    <div
      className="relative min-h-screen"
      style={emotionCssVars(theme)}
    >
      <Aurora
        colors={[theme.glow, 'rgba(167,139,250,0.22)', 'rgba(125,211,252,0.22)']}
        intensity="soft"
      />
      <NoiseOverlay />

      <Sidebar theme={theme} />
      <div className="flex min-h-screen flex-col md:pl-[76px]">
        <TopBar theme={theme} onOpenCommand={() => setCmdOpen(true)} />
        <main className="relative flex-1 pb-24 md:pb-12">{children}</main>
      </div>
      <MobileNav theme={theme} />
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
