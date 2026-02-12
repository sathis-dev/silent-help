'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function Home() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.replace('/dashboard');
                return;
            }
        }
        // Trigger entrance animation
        const t = setTimeout(() => setShow(true), 100);
        return () => clearTimeout(t);
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="auth-container">
                <div className="loading-dots"><span /><span /><span /></div>
            </div>
        );
    }

    return (
        <div className="landing-page">
            {/* Ambient background */}
            <div className="landing-bg">
                <div className="landing-orb landing-orb-1" />
                <div className="landing-orb landing-orb-2" />
                <div className="landing-orb landing-orb-3" />
            </div>

            <div className={`landing-content ${show ? 'visible' : ''}`}>
                {/* Logo + Branding */}
                <div className="landing-logo">
                    <div className="landing-logo-circle">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4z" fill="url(#grad)" fillOpacity="0.15" stroke="url(#grad)" strokeWidth="1.5" />
                            <path d="M18 28c0 0 2 4 6 4s6-4 6-4" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="19" cy="20" r="2" fill="#7dd3fc" />
                            <circle cx="29" cy="20" r="2" fill="#818cf8" />
                            <defs>
                                <linearGradient id="grad" x1="4" y1="4" x2="44" y2="44">
                                    <stop stopColor="#38bdf8" />
                                    <stop offset="1" stopColor="#818cf8" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                <h1 className="landing-title">Silent Help</h1>
                <p className="landing-subtitle">
                    Your compassionate AI companion for<br />mental wellness & emotional support
                </p>

                <div className="landing-features">
                    <div className="landing-feature">
                        <span className="landing-feature-icon">🧠</span>
                        <span>AI-powered support</span>
                    </div>
                    <div className="landing-feature">
                        <span className="landing-feature-icon">🛡️</span>
                        <span>Private & confidential</span>
                    </div>
                    <div className="landing-feature">
                        <span className="landing-feature-icon">💚</span>
                        <span>Crisis-aware safety net</span>
                    </div>
                </div>

                <button
                    className="landing-cta"
                    onClick={() => router.push('/onboarding')}
                >
                    <span>Get Started</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>

                <p className="landing-login-link">
                    Already have an account?{' '}
                    <a onClick={() => router.push('/auth/login')} style={{ cursor: 'pointer' }}>Sign in</a>
                </p>
            </div>
        </div>
    );
}
