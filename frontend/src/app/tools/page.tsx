'use client';

import { useState } from 'react';
import BreathingExercise from '@/components/activities/BreathingExercise';
import GroundingExercise from '@/components/activities/GroundingExercise';
import BodyReleaseExercise from '@/components/activities/BodyReleaseExercise';

const ArrowLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;

type ToolId = 'breathing' | 'grounding' | 'bodyscan' | 'sleep' | null;

const TOOLS = [
    {
        id: 'breathing' as ToolId,
        name: 'Box Breathing',
        description: 'A calming 4-4-4-4 breathing pattern to slow your heart rate and find calm.',
        icon: '🌊',
        color: '#2dd4bf', // Teal
        duration: '4 min',
    },
    {
        id: 'grounding' as ToolId,
        name: '5-4-3-2-1 Grounding',
        description: 'Use your five senses to ground yourself in the present moment.',
        icon: '🖐️',
        color: '#a78bfa', // Purple
        duration: '3 min',
    },
    {
        id: 'bodyscan' as ToolId,
        name: 'Body Scan',
        description: 'Progressively release tension from head to toe.',
        icon: '✨',
        color: '#fbbf24', // Amber
        duration: '5 min',
    },
    {
        id: 'sleep' as ToolId,
        name: 'Sleep Reset',
        description: 'A gentle soft breathing routine to quiet racing thoughts before sleep.',
        icon: '🌙',
        color: '#818cf8', // Indigo
        duration: '5 min',
    },
];

export default function ToolsPage() {
    const [activeTool, setActiveTool] = useState<ToolId>(null);

    const activeToolData = TOOLS.find(t => t.id === activeTool);

    // Render active tool overlay
    if (activeTool && activeToolData) {
        return (
            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        onClick={() => setActiveTool(null)} 
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px', marginLeft: '-8px' }}
                    >
                        <ArrowLeft />
                    </button>
                    <div>
                        <h1 style={{ fontWeight: 600, fontSize: '1.5rem', color: '#f8fafc', margin: 0 }}>{activeToolData.name}</h1>
                        <p style={{ color: activeToolData.color, fontSize: '0.9rem', margin: 0 }}>{activeToolData.duration} Session</p>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        width: '100%', maxWidth: '500px',
                        background: 'linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(2,6,23,0.4) 100%)',
                        border: `1px solid ${activeToolData.color}30`,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: `0 20px 40px -10px ${activeToolData.color}10`,
                        animation: 'activity-fade-in 0.5s ease-out',
                    }}>
                        {activeTool === 'breathing' && (
                            <BreathingExercise variant="box" accent={activeToolData.color} onComplete={() => setActiveTool(null)} onCancel={() => setActiveTool(null)} />
                        )}
                        {activeTool === 'grounding' && (
                            <GroundingExercise variant="5-4-3-2-1" accent={activeToolData.color} onComplete={() => setActiveTool(null)} onCancel={() => setActiveTool(null)} />
                        )}
                        {activeTool === 'bodyscan' && (
                            <BodyReleaseExercise variant="pmr-short" accent={activeToolData.color} onComplete={() => setActiveTool(null)} onCancel={() => setActiveTool(null)} />
                        )}
                        {activeTool === 'sleep' && (
                            <BreathingExercise variant="soft" accent={activeToolData.color} onComplete={() => setActiveTool(null)} onCancel={() => setActiveTool(null)} />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Render tools grid
    return (
        <div style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto', overflowY: 'auto', height: '100%' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontWeight: 600, fontSize: '2rem', marginBottom: '8px', color: '#f8fafc' }}>Library</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: 0 }}>
                    Quick exercises to help you find calm, focus, and balance entirely on your own terms.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {TOOLS.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        style={{
                            textAlign: 'left',
                            cursor: 'pointer',
                            outline: 'none',
                            background: 'rgba(15,23,42,0.4)',
                            border: `1px solid ${tool.color}30`,
                            borderRadius: '20px',
                            padding: '24px',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '200px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = `0 12px 24px -10px ${tool.color}20`;
                            e.currentTarget.style.borderColor = `${tool.color}60`;
                            e.currentTarget.style.background = 'rgba(15,23,42,0.7)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = `${tool.color}30`;
                            e.currentTarget.style.background = 'rgba(15,23,42,0.4)';
                        }}
                    >
                        {/* Background glow orb */}
                        <div style={{
                            position: 'absolute',
                            top: '-20%',
                            right: '-10%',
                            width: '150px',
                            height: '150px',
                            background: `radial-gradient(circle, ${tool.color}15 0%, transparent 70%)`,
                            borderRadius: '50%',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }} />

                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
                                <div style={{ 
                                    width: '48px', height: '48px', 
                                    borderRadius: '16px', 
                                    background: `${tool.color}15`, 
                                    border: `1px solid ${tool.color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    marginBottom: '20px'
                                }}>
                                    {tool.icon}
                                </div>
                                <span style={{ 
                                    fontSize: '0.8rem', 
                                    color: tool.color, 
                                    fontWeight: 600,
                                    background: `${tool.color}10`,
                                    padding: '4px 10px',
                                    borderRadius: '99px'
                                }}>
                                    {tool.duration}
                                </span>
                            </div>
                            
                            <div>
                                <h3 style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: '8px', color: '#f8fafc' }}>
                                    {tool.name}
                                </h3>
                                <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                                    {tool.description}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
