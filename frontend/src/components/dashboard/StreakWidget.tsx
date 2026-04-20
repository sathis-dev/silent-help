'use client';

import { useState, useEffect } from 'react';
import GlowCard from '@/components/animations/GlowCard';
import { getStreak, isActiveToday } from '@/lib/streak';

interface StreakWidgetProps {
    accent: string;
}

export default function StreakWidget({ accent }: StreakWidgetProps) {
    const [streak, setStreak] = useState(() => getStreak());
    const [todayDone, setTodayDone] = useState(() => isActiveToday());

    useEffect(() => {
        // Subscribe to periodic refresh only — initial state set via lazy initializers above
        const interval = setInterval(() => {
            setStreak(getStreak());
            setTodayDone(isActiveToday());
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const streakEmoji = streak.currentStreak >= 7 ? '🔥' : streak.currentStreak >= 3 ? '✨' : '🌱';

    return (
        <GlowCard glowColor={`${accent}20`} borderRadius={16} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Streak circle */}
                <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: todayDone
                        ? `linear-gradient(135deg, ${accent}30, ${accent}10)`
                        : 'rgba(15,23,42,0.6)',
                    border: todayDone
                        ? `2px solid ${accent}`
                        : '2px dashed rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: todayDone ? `0 0 20px ${accent}30` : 'none',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0,
                }}>
                    {streakEmoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <span style={{
                            fontSize: '1.6rem', fontWeight: 700, color: accent,
                            fontVariantNumeric: 'tabular-nums',
                        }}>
                            {streak.currentStreak}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                            day{streak.currentStreak !== 1 ? 's' : ''} streak
                        </span>
                    </div>
                    <p style={{
                        margin: 0, color: '#64748b', fontSize: '0.8rem',
                    }}>
                        {todayDone
                            ? 'You showed up today — that matters.'
                            : streak.currentStreak > 0
                                ? 'Log a mood, journal, or breathe to keep it going.'
                                : 'Start your wellness journey today.'
                        }
                    </p>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: 4,
                    alignItems: 'flex-end', flexShrink: 0,
                }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Best: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{streak.longestStreak}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Total: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{streak.totalActiveDays}</span>
                    </div>
                </div>
            </div>
        </GlowCard>
    );
}
