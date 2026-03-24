'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { SignUpButton, SignInButton, useUser, useAuth } from '@clerk/nextjs';
import { useWellness } from '@/components/wellness/WellnessProvider';

function AuthForms() {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const { getToken } = useAuth();
    const { setContextProfile } = useWellness();
    const [guestName, setGuestName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isSignedIn) {
            const finishFlow = async () => {
                const token = await getToken();
                await checkAndSubmitPending(token || undefined);
                router.replace('/dashboard');
            };
            finishFlow();
        }
    }, [isSignedIn, router, getToken]);

    const checkAndSubmitPending = async (token?: string) => {
        const pending = localStorage.getItem('sh_pending_assessment');
        if (!pending) return false;
        
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`; 
            
            const res = await fetch('/api/assessment/submit', {
                method: 'POST',
                headers,
                body: pending
            });
            const data = await res.json();
            
            if (data.profile) {
                if (!token) {
                    localStorage.setItem('sh_guest_profile', JSON.stringify(data.profile));
                }
                setContextProfile(data.profile);
                localStorage.removeItem('sh_pending_assessment');
            }
        } catch (e) {
            console.error('Failed to submit assessment:', e);
        }
        return true;
    };

    const handleGuestSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (guestName.trim()) {
            localStorage.setItem('sh_guest_name', guestName.trim());
            setLoading(true);
            const hasPending = await checkAndSubmitPending();
            setLoading(false);
            
            if (hasPending) {
                router.push('/dashboard');
            } else {
                router.push('/onboarding');
            }
        }
    };

    if (isSignedIn) {
        return (
            <div className="auth-container min-h-screen flex items-center justify-center bg-[#0f172a]">
                <div className="loading-dots"><span /><span /><span /></div>
            </div>
        );
    }

    return (
        <div className="auth-page w-full min-h-screen relative overflow-hidden bg-[#0f172a]">
            {/* Ambient Background with slow pulse animations */}
            <div className="auth-ambient absolute inset-0 pointer-events-none">
                <div className="ambient-orb orb-1 absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="ambient-orb orb-2 absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
            </div>

            <div className="auth-container relative z-10 flex flex-col min-h-screen items-center justify-center p-4">
                <div className="auth-card bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
                    
                    <div className="auth-header text-center mb-8">
                        <div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-5 border border-cyan-500/30">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold mb-3 text-white tracking-tight">Save Your Progress</h2>
                        <p className="text-slate-400 text-sm leading-relaxed px-2">Create a free account to instantly save your personalized wellness profile securely, or continue as a guest.</p>
                    </div>

                    <div className="auth-options flex flex-col gap-4">
                        <div className="flex justify-center w-full group">
                            <SignUpButton mode="modal">
                                <button className="landing-cta w-full !px-0 flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 transform group-hover:-translate-y-1">
                                    <span className="whitespace-nowrap font-semibold">Create Free Account</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </SignUpButton>
                        </div>

                        <div className="flex justify-center w-full">
                            <SignInButton mode="modal">
                                <button className="w-full flex justify-center items-center h-[54px] rounded-full font-medium text-slate-300 border border-slate-700 bg-slate-800/40 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-300">
                                    <span>Sign In</span>
                                </button>
                            </SignInButton>
                        </div>

                        <div className="flex items-center text-slate-500 my-4">
                            <div className="flex-1 h-px bg-slate-700/60" />
                            <span className="px-5 text-[11px] font-bold tracking-widest text-slate-500">OR</span>
                            <div className="flex-1 h-px bg-slate-700/60" />
                        </div>

                        <div className="guest-section">
                            <form onSubmit={handleGuestSubmit} className="flex flex-col gap-4">
                                <div className="form-group flex flex-col gap-2 mb-0">
                                    <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase ml-1">Guest Access</label>
                                    <input
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="What should we call you?"
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl px-5 py-4 bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={loading || !guestName.trim()}
                                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium h-[54px] transition-all duration-300 disabled:opacity-50 mt-1 hover:shadow-lg flex items-center justify-center gap-2 group/guest hover:border-slate-500"
                                >
                                    {loading ? (
                                        <div className="loading-dots"><span /><span /><span /></div>
                                    ) : (
                                        <>
                                            Continue as Guest
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50 group-hover/guest:translate-x-1 group-hover/guest:opacity-100 transition-all">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="auth-container min-h-screen flex items-center justify-center bg-[#0f172a]">
                <div className="loading-dots"><span /><span /><span /></div>
            </div>
        }>
            <AuthForms />
        </Suspense>
    );
}
