'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getWellnessProfile, submitOnboarding, type WellnessProfile, type OnboardingAnswers } from '@/lib/api';
import { useUser } from '@clerk/nextjs';

interface WellnessContextType {
    profile: WellnessProfile | null;
    isLoading: boolean;
    hasProfile: boolean;
    error: string | null;
    loadProfile: () => Promise<WellnessProfile | null>;
    submitAnswers: (answers: OnboardingAnswers) => Promise<WellnessProfile | null>;
    clearProfile: () => void;
    setContextProfile: (profile: WellnessProfile) => void;
}

const WellnessContext = createContext<WellnessContextType>({
    profile: null,
    isLoading: false,
    hasProfile: false,
    error: null,
    loadProfile: async () => null,
    submitAnswers: async () => null,
    clearProfile: () => { },
    setContextProfile: () => { },
});

export function WellnessProvider({ children }: { children: ReactNode }) {
    const { isSignedIn } = useUser();
    const isAuthenticated = !!isSignedIn;
    const [profile, setProfile] = useState<WellnessProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useCallback(async (): Promise<WellnessProfile | null> => {
        const isGuest = !isAuthenticated && typeof window !== 'undefined' && !!localStorage.getItem('sh_guest_name');
        if (!isAuthenticated && !isGuest) return null;
        
        setIsLoading(true);
        setError(null);
        try {
            if (isGuest) {
                const stored = localStorage.getItem('sh_guest_profile');
                if (stored) {
                    const p = JSON.parse(stored);
                    setProfile(p);
                    return p;
                }
                return null;
            }
            
            const data = await getWellnessProfile();
            if (data.hasProfile && data.profile) {
                setProfile(data.profile);
                return data.profile;
            }
            setProfile(null);
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load profile');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const submitAnswers = useCallback(async (answers: OnboardingAnswers): Promise<WellnessProfile | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await submitOnboarding(answers);
            if (data.profile) {
                setProfile(data.profile);
                return data.profile;
            }
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit answers');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearProfile = useCallback(() => {
        setProfile(null);
        setError(null);
    }, []);

    return (
        <WellnessContext.Provider value={{
            profile,
            isLoading,
            hasProfile: !!profile,
            error,
            loadProfile,
            submitAnswers,
            clearProfile,
            setContextProfile: setProfile,
        }}>
            {children}
        </WellnessContext.Provider>
    );
}

export function useWellness() {
    return useContext(WellnessContext);
}
