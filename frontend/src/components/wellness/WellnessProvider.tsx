'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getWellnessProfile, submitOnboarding, type WellnessProfile, type OnboardingAnswers } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';

interface WellnessContextType {
    profile: WellnessProfile | null;
    isLoading: boolean;
    hasProfile: boolean;
    error: string | null;
    loadProfile: () => Promise<WellnessProfile | null>;
    submitAnswers: (answers: OnboardingAnswers) => Promise<WellnessProfile | null>;
    clearProfile: () => void;
}

const WellnessContext = createContext<WellnessContextType>({
    profile: null,
    isLoading: false,
    hasProfile: false,
    error: null,
    loadProfile: async () => null,
    submitAnswers: async () => null,
    clearProfile: () => { },
});

export function WellnessProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [profile, setProfile] = useState<WellnessProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useCallback(async (): Promise<WellnessProfile | null> => {
        if (!isAuthenticated) return null;
        setIsLoading(true);
        setError(null);
        try {
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
        }}>
            {children}
        </WellnessContext.Provider>
    );
}

export function useWellness() {
    return useContext(WellnessContext);
}
