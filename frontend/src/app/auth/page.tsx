'use client';

import { Suspense, useState, type FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, register, getWellnessProfile } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';

type AuthMode = 'login' | 'register' | 'guest';

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuth } = useAuth();
    
    const initialMode = (searchParams.get('mode') as AuthMode) || 'login';
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [guestName, setGuestName] = useState('');
    
    // UI state
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showGuestInput, setShowGuestInput] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const switchMode = (newMode: AuthMode) => {
        setIsTransitioning(true);
        setError('');
        setTimeout(() => {
            setMode(newMode);
            setIsTransitioning(false);
        }, 200);
    };

    const handleGuestContinue = () => {
        setShowGuestInput(true);
    };

    const handleGuestSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (guestName.trim()) {
            localStorage.setItem('sh_guest_name', guestName.trim());
            router.push('/onboarding');
        }
    };

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const data = await login(email, password);
                setAuth(data.token, data.user);
                
                try {
                    const profile = await getWellnessProfile();
                    router.push(profile.hasProfile ? '/dashboard' : '/onboarding');
                } catch {
                    router.push('/onboarding');
                }
            } else if (mode === 'register') {
                const data = await register(email, password, name);
                setAuth(data.token, data.user);
                router.push('/onboarding');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-layout">
            {/* Left Panel - Animated Wellness Graphic */}
            <div className="auth-visual-panel">
                <div className="auth-visual-bg">
                    {/* Animated gradient orbs */}
                    <div className="auth-orb auth-orb-1" />
                    <div className="auth-orb auth-orb-2" />
                    <div className="auth-orb auth-orb-3" />
                    <div className="auth-orb auth-orb-4" />
                </div>
                
                <div className={`auth-visual-content ${mounted ? 'visible' : ''}`}>
                    <div className="auth-logo">
                        <div className="auth-logo-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" opacity="0.3"/>
                                <path d="M12 6v6l4 2"/>
                                <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.6"/>
                            </svg>
                        </div>
                        <span className="auth-logo-text">Silent Help</span>
                    </div>
                    
                    <h1 className="auth-visual-title">Your Journey to Wellness Begins Here</h1>
                    <p className="auth-visual-subtitle">
                        A compassionate AI companion designed to support your mental wellbeing with personalized guidance and care.
                    </p>
                    
                    <div className="auth-features">
                        <div className="auth-feature">
                            <div className="auth-feature-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                            </div>
                            <span>Private & Secure</span>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </div>
                            <span>Empathetic Support</span>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                                </svg>
                            </div>
                            <span>Personalized Care</span>
                        </div>
                    </div>
                </div>
                
                {/* Decorative elements */}
                <div className="auth-visual-decoration">
                    <div className="decoration-line decoration-line-1" />
                    <div className="decoration-line decoration-line-2" />
                    <div className="decoration-circle decoration-circle-1" />
                    <div className="decoration-circle decoration-circle-2" />
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="auth-form-panel">
                <div className={`auth-form-container ${isTransitioning ? 'transitioning' : ''} ${mounted ? 'visible' : ''}`}>
                    
                    {/* Login Form */}
                    {mode === 'login' && (
                        <div className="auth-form-content">
                            <div className="auth-form-header">
                                <h2>Welcome back</h2>
                                <p>Sign in to continue your wellness journey</p>
                            </div>

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-field">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                        className={error ? 'has-error' : ''}
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className={error ? 'has-error' : ''}
                                    />
                                </div>

                                {error && (
                                    <div className="auth-error" role="alert">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="8" x2="12" y2="12"/>
                                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button type="submit" className="auth-submit-btn" disabled={loading}>
                                    {loading ? (
                                        <span className="btn-loading">
                                            <span className="spinner" />
                                            Signing in...
                                        </span>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </form>

                            <div className="auth-divider">
                                <span>or continue with</span>
                            </div>

                            <div className="social-buttons">
                                <button type="button" className="social-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    <span>Google</span>
                                </button>
                                <button type="button" className="social-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                    </svg>
                                    <span>Apple</span>
                                </button>
                            </div>

                            <div className="auth-switch">
                                <span>{"Don't have an account?"}</span>
                                <button type="button" onClick={() => switchMode('register')}>
                                    Create one
                                </button>
                            </div>

                            <button 
                                type="button" 
                                className="guest-btn"
                                onClick={() => switchMode('guest')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                Continue as Guest
                            </button>
                        </div>
                    )}

                    {/* Register Form */}
                    {mode === 'register' && (
                        <div className="auth-form-content">
                            <div className="auth-form-header">
                                <h2>Create your account</h2>
                                <p>Your safe space starts here</p>
                            </div>

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-field">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="What should we call you?"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="reg-email">Email</label>
                                    <input
                                        id="reg-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="reg-password">Password</label>
                                    <input
                                        id="reg-password"
                                        type="password"
                                        placeholder="At least 6 characters"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                {error && (
                                    <div className="auth-error" role="alert">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="8" x2="12" y2="12"/>
                                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button type="submit" className="auth-submit-btn" disabled={loading}>
                                    {loading ? (
                                        <span className="btn-loading">
                                            <span className="spinner" />
                                            Creating account...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>

                            <div className="auth-divider">
                                <span>or continue with</span>
                            </div>

                            <div className="social-buttons">
                                <button type="button" className="social-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    <span>Google</span>
                                </button>
                                <button type="button" className="social-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                    </svg>
                                    <span>Apple</span>
                                </button>
                            </div>

                            <div className="auth-switch">
                                <span>Already have an account?</span>
                                <button type="button" onClick={() => switchMode('login')}>
                                    Sign in
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Guest Mode */}
                    {mode === 'guest' && (
                        <div className="auth-form-content guest-mode">
                            <button 
                                type="button" 
                                className="back-btn"
                                onClick={() => {
                                    setShowGuestInput(false);
                                    switchMode('login');
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5"/>
                                    <polyline points="12 19 5 12 12 5"/>
                                </svg>
                            </button>

                            <div className="guest-welcome">
                                <div className="guest-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </div>
                                
                                <h2>Welcome, Guest</h2>
                                <p>
                                    {showGuestInput 
                                        ? "Just one quick thing..."
                                        : "Experience Silent Help without creating an account. Your session will be private and temporary."
                                    }
                                </p>
                            </div>

                            <div className={`guest-input-section ${showGuestInput ? 'visible' : ''}`}>
                                {showGuestInput ? (
                                    <form onSubmit={handleGuestSubmit} className="auth-form">
                                        <div className="form-field guest-name-field">
                                            <label htmlFor="guest-name">What should we call you?</label>
                                            <input
                                                id="guest-name"
                                                type="text"
                                                placeholder="Enter your name or nickname"
                                                value={guestName}
                                                onChange={e => setGuestName(e.target.value)}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <button type="submit" className="auth-submit-btn">
                                            <span>Begin Your Journey</span>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12h14"/>
                                                <polyline points="12 5 19 12 12 19"/>
                                            </svg>
                                        </button>
                                    </form>
                                ) : (
                                    <button 
                                        type="button" 
                                        className="auth-submit-btn guest-continue"
                                        onClick={handleGuestContinue}
                                    >
                                        <span>Continue as Guest</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14"/>
                                            <polyline points="12 5 19 12 12 19"/>
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {!showGuestInput && (
                                <div className="guest-benefits">
                                    <div className="benefit-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                        <span>No sign-up required</span>
                                    </div>
                                    <div className="benefit-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                        <span>Full access to wellness tools</span>
                                    </div>
                                    <div className="benefit-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                        <span>Personalized AI companion</span>
                                    </div>
                                </div>
                            )}

                            {!showGuestInput && (
                                <div className="auth-switch guest-account-prompt">
                                    <span>Want to save your progress?</span>
                                    <button type="button" onClick={() => switchMode('register')}>
                                        Create an account
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Loading fallback for Suspense
function AuthLoading() {
    return (
        <div className="auth-layout">
            <div className="auth-visual-panel">
                <div className="auth-visual-bg">
                    <div className="auth-orb auth-orb-1" />
                    <div className="auth-orb auth-orb-2" />
                    <div className="auth-orb auth-orb-3" />
                    <div className="auth-orb auth-orb-4" />
                </div>
            </div>
            <div className="auth-form-panel">
                <div className="auth-form-container visible">
                    <div className="auth-form-header" style={{ textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '0 auto 16px', width: 32, height: 32, borderWidth: 3 }} />
                        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<AuthLoading />}>
            <AuthContent />
        </Suspense>
    );
}
