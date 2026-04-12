'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Sidebar from '@/components/layout/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useUser();
    const isAuthenticated = !!isSignedIn;
    const isLoading = !isLoaded;
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

    // SOS Button dragging logic
    const [sosPos, setSosPos] = useState({ right: 24, bottom: 90 }); // Moved up to avoid covering send button
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, startRight: 0, startBottom: 0 });

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);
        dragRef.current.startX = e.clientX;
        dragRef.current.startY = e.clientY;
        dragRef.current.startRight = sosPos.right;
        dragRef.current.startBottom = sosPos.bottom;
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!isDragging) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        
        let newRight = dragRef.current.startRight - dx;
        let newBottom = dragRef.current.startBottom - dy;
        
        // Boundaries roughly
        newRight = Math.max(10, Math.min(newRight, typeof window !== 'undefined' ? window.innerWidth - 70 : 1000));
        newBottom = Math.max(10, Math.min(newBottom, typeof window !== 'undefined' ? window.innerHeight - 70 : 1000));
        
        setSosPos({ right: newRight, bottom: newBottom });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

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
            <button 
                className="sos-btn" 
                aria-label="SOS - Emergency support"
                style={{ 
                    position: 'fixed',
                    right: `${sosPos.right}px`, 
                    bottom: `${sosPos.bottom}px`,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    touchAction: 'none' // prevent scrolling on mobile
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                title="Drag to move"
            >
                SOS
            </button>
        </div>
    );
}
