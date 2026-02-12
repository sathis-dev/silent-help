'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import Sidebar from '@/components/layout/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
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

    if (!isAuthenticated) return null;

    return (
        <div className="flex" style={{ height: '100vh' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                {/* Mobile header */}
                <header style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'var(--bg-secondary)',
                }}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-secondary)', padding: '4px',
                            display: 'flex', alignItems: 'center',
                        }}
                        aria-label="Open menu"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <span style={{ fontSize: '1.1rem' }}>🌙</span>
                        <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>Silent Help</span>
                    </div>
                </header>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {children}
                </div>
            </main>

            {/* SOS Button */}
            <button className="sos-btn" aria-label="SOS - Emergency support">
                SOS
            </button>
        </div>
    );
}
