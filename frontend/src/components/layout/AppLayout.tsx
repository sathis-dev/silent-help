'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import IconNav from '@/components/layout/IconNav';
import { useWellness } from '@/components/wellness/WellnessProvider';
import { getThemeForEmotion } from '@/components/layout/IconNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useUser();
    const isAuthenticated = !!isSignedIn;
    const isLoading = !isLoaded;
    const { profile } = useWellness();

    // Get the accent color from the user's stress type
    const emotionKey = profile
        ? ((profile as unknown as Record<string, unknown>).emotionalProfile as string || 'pressure').toLowerCase()
        : 'pressure';
    const theme = getThemeForEmotion(emotionKey);

    useEffect(() => {
        const isGuest = typeof window !== 'undefined' && !!localStorage.getItem('sh_guest_name');
        if (!isLoading && !isAuthenticated && !isGuest) {
            router.replace('/auth/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="auth-container">
                <div className="loading-dots"><span /><span /><span /></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        const isGuest = typeof window !== 'undefined' && !!localStorage.getItem('sh_guest_name');
        if (!isGuest) return null;
    }

    return (
        <div className="app-shell">
            <IconNav accentColor={theme.accent} />
            <main className="app-main">
                {children}
            </main>
        </div>
    );
}
