'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, getWellnessProfile } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(email, password);
            setAuth(data.token, data.user);

            // Check if user has a wellness profile — route accordingly
            try {
                const profile = await getWellnessProfile();
                if (profile.hasProfile) {
                    router.push('/dashboard');
                } else {
                    router.push('/onboarding');
                }
            } catch {
                // If profile check fails, default to onboarding
                router.push('/onboarding');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌙</div>
                    <h1>Welcome back</h1>
                    <p className="subtitle">Sign in to Silent Help</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                        style={{ marginTop: '8px', padding: '14px' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="divider">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}
