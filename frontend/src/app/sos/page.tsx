'use client';

import { useRouter } from 'next/navigation';
import FadeIn from '@/components/animations/FadeIn';
import GlowCard from '@/components/animations/GlowCard';
import BreathingExercise, { type BreathingVariant } from '@/components/activities/BreathingExercise';

export default function SOSPage() {
    const router = useRouter();
    const accent = '#ef4444'; // Red/crimson alert theme

    return (
        <div style={{
            minHeight: '100vh',
            background: '#020617', // Very dark slate
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            position: 'relative',
        }}>
            {/* Urgent, Full Screen Panic Breathing */}
            <FadeIn delay={0}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ color: '#f8fafc', fontSize: '2rem', marginBottom: '8px' }}>Breathe with me.</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '40px' }}>You are safe. Just focus on the circle.</p>
                    
                    {/* Embedded 4-7-8 Breathing (Calming down-regulation) */}
                    <BreathingExercise 
                        variant={'calm-60' as BreathingVariant}
                        accent={accent}
                        onComplete={() => {}}
                        onCancel={() => {}}
                    />
                </div>
            </FadeIn>

            {/* Crisis Connectors */}
            <FadeIn delay={300} direction="up">
                <GlowCard glowColor={`${accent}20`} borderRadius={24} style={{ maxWidth: '600px', width: '100%', padding: '32px' }}>
                    <h2 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: '24px', textAlign: 'center' }}>Immediate Support</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a href="tel:988" style={{ textDecoration: 'none' }}>
                            <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer' }}>
                                <h3 style={{ margin: '0 0 8px', color: accent, fontSize: '1.2rem' }}>Call 988</h3>
                                <p style={{ margin: 0, color: '#f8fafc', fontSize: '0.9rem' }}>Suicide & Crisis Lifeline</p>
                            </div>
                        </a>
                        
                        <a href="sms:741741?body=HOME" style={{ textDecoration: 'none' }}>
                            <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer' }}>
                                <h3 style={{ margin: '0 0 8px', color: '#38bdf8', fontSize: '1.2rem' }}>Text &quot;HOME&quot; to 741741</h3>
                                <p style={{ margin: 0, color: '#f8fafc', fontSize: '0.9rem' }}>Crisis Text Line</p>
                            </div>
                        </a>
                    </div>
                </GlowCard>
            </FadeIn>

            <button 
                onClick={() => router.back()}
                style={{
                    marginTop: '48px',
                    padding: '12px 24px',
                    borderRadius: '99px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                }}
            >
                Return to Dashboard
            </button>
        </div>
    );
}
