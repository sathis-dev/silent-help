'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useUser, UserButton, useClerk } from '@clerk/nextjs';
import { useState } from 'react';

/* ═══════════════════════════════════════════════
   5 Stress-Type Themes
   ═══════════════════════════════════════════════ */
export const STRESS_THEMES = {
    overwhelmed: {
        accent: '#a78bfa',
        gradient: 'linear-gradient(135deg, #a78bfa, #818cf8)',
        glow: 'rgba(167, 139, 250, 0.25)',
        label: 'Overwhelmed',
        icon: '🌊',
        bg: 'rgba(167, 139, 250, 0.08)',
    },
    anxious: {
        accent: '#38bdf8',
        gradient: 'linear-gradient(135deg, #38bdf8, #818cf8)',
        glow: 'rgba(56, 189, 248, 0.25)',
        label: 'Anxious',
        icon: '🧠',
        bg: 'rgba(56, 189, 248, 0.08)',
    },
    frustrated: {
        accent: '#f97316',
        gradient: 'linear-gradient(135deg, #f97316, #f59e0b)',
        glow: 'rgba(249, 115, 22, 0.25)',
        label: 'Frustrated',
        icon: '🔥',
        bg: 'rgba(249, 115, 22, 0.08)',
    },
    sad: {
        accent: '#818cf8',
        gradient: 'linear-gradient(135deg, #818cf8, #a78bfa)',
        glow: 'rgba(129, 140, 248, 0.25)',
        label: 'Sad',
        icon: '💧',
        bg: 'rgba(129, 140, 248, 0.08)',
    },
    pressure: {
        accent: '#2dd4bf',
        gradient: 'linear-gradient(135deg, #2dd4bf, #38bdf8)',
        glow: 'rgba(45, 212, 191, 0.25)',
        label: 'Pressure',
        icon: '⚡',
        bg: 'rgba(45, 212, 191, 0.08)',
    },
} as const;

export type StressType = keyof typeof STRESS_THEMES;

export function getThemeForEmotion(emotion?: string): (typeof STRESS_THEMES)[keyof typeof STRESS_THEMES] {
    if (emotion && emotion in STRESS_THEMES) {
        return STRESS_THEMES[emotion as StressType];
    }
    return STRESS_THEMES.pressure;
}

/* ═══════════════════════════════════════════════
   Navigation Items
   ═══════════════════════════════════════════════ */
const NAV_ITEMS = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        id: 'chat',
        label: 'AI Chat',
        path: '/chat',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
        ),
    },
    {
        id: 'journal',
        label: 'Journal',
        path: '/journal',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                <line x1="8" y1="7" x2="16" y2="7" />
                <line x1="8" y1="11" x2="13" y2="11" />
            </svg>
        ),
    },
    {
        id: 'tools',
        label: 'Wellness Tools',
        path: '/tools',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
            </svg>
        ),
    },
    {
        id: 'gratitude',
        label: 'Gratitude',
        path: '/gratitude',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
        ),
    },
    {
        id: 'letters',
        label: 'Letters',
        path: '/letters',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
            </svg>
        ),
    },
    {
        id: 'clinical',
        label: 'Check-ins',
        path: '/clinical',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
    },
    {
        id: 'reassess',
        label: 'Re-assess',
        path: '/onboarding',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6" />
                <path d="M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
            </svg>
        ),
    },
    {
        id: 'profile',
        label: 'Profile',
        path: '/profile',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        ),
    },
];

/* ═══════════════════════════════════════════════
   Icon Navigation Component
   ═══════════════════════════════════════════════ */
interface IconNavProps {
    accentColor?: string;
}

export default function IconNav({ accentColor = '#2dd4bf' }: IconNavProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isSignedIn } = useUser();
    const { signOut } = useClerk();
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(path);
    };

    const handleLogout = () => {
        const isGuest = typeof window !== 'undefined' && !!localStorage.getItem('sh_guest_name');
        if (isGuest) {
            localStorage.removeItem('sh_guest_name');
            localStorage.removeItem('sh_guest_token');
            router.push('/');
        } else {
            signOut();
            router.push('/auth/login');
        }
    };

    return (
        <>
            {/* Desktop: Vertical icon rail */}
            <nav className="icon-nav" style={{ '--nav-accent': accentColor } as React.CSSProperties}>
                <div className="icon-nav-logo">
                    <span>🌙</span>
                </div>

                <div className="icon-nav-items">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            className={`icon-nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => router.push(item.path)}
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            aria-label={item.label}
                        >
                            {isActive(item.path) && (
                                <div className="icon-nav-indicator" style={{ background: accentColor }} />
                            )}
                            <div className="icon-nav-icon" style={isActive(item.path) ? { color: accentColor } : {}}>
                                {item.icon}
                            </div>
                            {hoveredId === item.id && (
                                <div className="icon-nav-tooltip">{item.label}</div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="icon-nav-footer">
                    {/* SOS Button */}
                    <button
                        className="icon-nav-sos"
                        aria-label="SOS - Emergency support"
                        title="SOS - Emergency support"
                        onClick={() => router.push('/sos')}
                    >
                        SOS
                    </button>

                    {/* User avatar */}
                    <div className="icon-nav-user">
                        {isSignedIn ? (
                            <UserButton
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: 'icon-nav-avatar-box',
                                        userButtonTrigger: 'focus:shadow-none',
                                    },
                                }}
                            />
                        ) : (
                            <button
                                className="icon-nav-avatar"
                                onClick={handleLogout}
                                title="Logout"
                            >
                                {(typeof window !== 'undefined'
                                    ? localStorage.getItem('sh_guest_name')?.[0]?.toUpperCase()
                                    : '?') || '?'}
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile: Bottom tab bar */}
            <nav className="icon-nav-mobile" style={{ '--nav-accent': accentColor } as React.CSSProperties}>
                {NAV_ITEMS.slice(0, 4).map(item => (
                    <button
                        key={item.id}
                        className={`icon-nav-mobile-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => router.push(item.path)}
                        aria-label={item.label}
                    >
                        <div className="icon-nav-mobile-icon" style={isActive(item.path) ? { color: accentColor } : {}}>
                            {item.icon}
                        </div>
                        <span className="icon-nav-mobile-label" style={isActive(item.path) ? { color: accentColor } : {}}>
                            {item.label.split(' ')[0]}
                        </span>
                        {isActive(item.path) && (
                            <div className="icon-nav-mobile-dot" style={{ background: accentColor }} />
                        )}
                    </button>
                ))}
                {/* SOS in mobile bottom bar */}
                <button
                    className="icon-nav-mobile-item sos"
                    aria-label="SOS"
                    onClick={() => router.push('/sos')}
                >
                    <div className="icon-nav-mobile-sos">SOS</div>
                </button>
            </nav>
        </>
    );
}
