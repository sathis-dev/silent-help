'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register, submitOnboarding } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';

export default function RegisterPage() {
    const router = useRouter();
    const { setAuth } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await register(email, password, name);
            setAuth(data.token, data.user);

            // Send onboarding data if available
            const onboardingRaw = localStorage.getItem('sh_onboarding');
            if (onboardingRaw) {
                try {
                    const answers = JSON.parse(onboardingRaw);
                    await submitOnboarding(answers);
                    localStorage.removeItem('sh_onboarding'); // Clean up
                } catch {
                    // Non-critical — profile can be created later
                    console.warn('Failed to submit onboarding data');
                }
            }

            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✨</div>
                    <h1>Create your account</h1>
                    <p className="subtitle">Your safe space starts here</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            className="input"
                            placeholder="What should we call you?"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

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
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            placeholder="At least 6 characters"
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
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="divider">
                    Already have an account?{' '}
                    <Link href="/auth/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
