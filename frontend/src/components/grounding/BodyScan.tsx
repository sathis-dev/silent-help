"use client";

/**
 * BodyScan Component
 * 
 * Interactive body scan for the MID pathway.
 * Helps users identify and name where they feel tension.
 * Uses SVG for accessibility and performance.
 */

import { useState, useCallback } from 'react';
import { triggerHaptic, triggerSuccessHaptic } from '@/lib/haptics';

interface BodyArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  associations: string[];
}

const BODY_AREAS: BodyArea[] = [
  { id: 'head', name: 'Head', x: 85, y: 10, width: 30, height: 30, 
    associations: ['headache', 'racing thoughts', 'dizziness'] },
  { id: 'jaw', name: 'Jaw', x: 85, y: 40, width: 30, height: 15, 
    associations: ['clenching', 'tension', 'grinding'] },
  { id: 'neck', name: 'Neck & Shoulders', x: 70, y: 55, width: 60, height: 25, 
    associations: ['stiffness', 'tightness', 'pain'] },
  { id: 'chest', name: 'Chest', x: 75, y: 80, width: 50, height: 40, 
    associations: ['tightness', 'heavy', 'racing heart'] },
  { id: 'stomach', name: 'Stomach', x: 80, y: 120, width: 40, height: 35, 
    associations: ['butterflies', 'nausea', 'knots'] },
  { id: 'hands', name: 'Hands', x: 40, y: 130, width: 25, height: 30, 
    associations: ['trembling', 'sweaty', 'cold'] },
  { id: 'legs', name: 'Legs', x: 75, y: 160, width: 50, height: 60, 
    associations: ['restless', 'weak', 'shaky'] },
  { id: 'feet', name: 'Feet', x: 75, y: 220, width: 50, height: 25, 
    associations: ['grounded', 'heavy', 'light'] },
];

interface BodyScanProps {
  onComplete?: (result: BodyScanResult) => void;
  onCancel?: () => void;
  className?: string;
}

interface BodyScanResult {
  areas: Record<string, number>;
  dominantArea: string | null;
  dominantAssociation: string | null;
}

export function BodyScan({
  onComplete,
  onCancel,
  className = '',
}: BodyScanProps) {
  const [selectedAreas, setSelectedAreas] = useState<Record<string, number>>({});
  const [currentArea, setCurrentArea] = useState<BodyArea | null>(null);
  const [step, setStep] = useState<'scan' | 'detail' | 'complete'>('scan');
  const [dominantAssociation, setDominantAssociation] = useState<string | null>(null);

  const handleAreaClick = useCallback((area: BodyArea) => {
    triggerHaptic('medium');
    setCurrentArea(area);
    setStep('detail');
  }, []);

  const handleTensionSelect = useCallback((level: number) => {
    if (!currentArea) return;
    
    triggerHaptic('light');
    setSelectedAreas((prev) => ({
      ...prev,
      [currentArea.id]: level,
    }));
    setCurrentArea(null);
    setStep('scan');
  }, [currentArea]);

  const handleAssociationSelect = useCallback((association: string) => {
    triggerHaptic('light');
    setDominantAssociation(association);
  }, []);

  const handleComplete = useCallback(() => {
    triggerSuccessHaptic();
    
    // Find the area with highest tension
    let dominantArea: string | null = null;
    let maxTension = 0;
    
    for (const [area, tension] of Object.entries(selectedAreas)) {
      if (tension > maxTension) {
        maxTension = tension;
        dominantArea = area;
      }
    }
    
    onComplete?.({
      areas: selectedAreas,
      dominantArea,
      dominantAssociation,
    });
    
    setStep('complete');
  }, [selectedAreas, dominantAssociation, onComplete]);

  const getTensionColor = (level: number): string => {
    const colors = [
      'transparent',
      '#86EFAC', // green-300
      '#FDE047', // yellow-300
      '#FDBA74', // orange-300
      '#FCA5A5', // red-300
    ];
    return colors[Math.min(level, 4)] || 'transparent';
  };

  // Scan View - Body outline with clickable areas
  if (step === 'scan') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <h2 className="text-xl font-medium text-[--text] mb-2">
          Body Scan
        </h2>
        <p className="text-sm text-[--text-muted] mb-6 text-center">
          Tap the areas where you notice tension or discomfort
        </p>

        {/* SVG Body Outline */}
        <svg
          viewBox="0 0 200 260"
          className="w-64 h-80"
          role="img"
          aria-label="Body outline for tension mapping"
        >
          {/* Body Outline */}
          <path
            d="M100,10 
               C120,10 130,25 130,40 
               C130,55 120,65 100,65 
               C80,65 70,55 70,40 
               C70,25 80,10 100,10
               M70,70 L60,90 L40,140 L50,145 L75,100 L75,155 L60,230 L80,235 L100,170 L120,235 L140,230 L125,155 L125,100 L150,145 L160,140 L140,90 L130,70 Z"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />

          {/* Clickable Areas */}
          {BODY_AREAS.map((area) => (
            <g key={area.id}>
              <rect
                x={area.x}
                y={area.y}
                width={area.width}
                height={area.height}
                rx="8"
                fill={getTensionColor(selectedAreas[area.id] || 0)}
                fillOpacity={selectedAreas[area.id] ? 0.6 : 0.1}
                stroke={selectedAreas[area.id] ? getTensionColor(selectedAreas[area.id]) : 'var(--text-muted)'}
                strokeWidth="1"
                strokeDasharray={selectedAreas[area.id] ? 'none' : '4,4'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleAreaClick(area)}
                role="button"
                tabIndex={0}
                aria-label={`Select ${area.name}`}
              />
            </g>
          ))}
        </svg>

        {/* Area count */}
        <p className="text-sm text-[--text-muted] mt-4">
          {Object.keys(selectedAreas).length} of {BODY_AREAS.length} areas checked
        </p>

        {/* Action buttons */}
        <div className="flex gap-4 mt-6 w-full max-w-xs">
          <button
            onClick={onCancel}
            className="
              flex-1 px-4 py-3 rounded-xl
              text-[--text-muted] bg-[--surface-2]
              hover:bg-[--border] transition-colors
            "
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={Object.keys(selectedAreas).length === 0}
            className="
              flex-1 px-4 py-3 rounded-xl font-medium
              text-[--on-primary] bg-[--primary]
              hover:opacity-90 transition-opacity
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Detail View - Tension level selector
  if (step === 'detail' && currentArea) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <h2 className="text-xl font-medium text-[--text] mb-2">
          {currentArea.name}
        </h2>
        <p className="text-sm text-[--text-muted] mb-6">
          How much tension do you notice here?
        </p>

        {/* Tension Level Buttons */}
        <div className="grid grid-cols-4 gap-3 w-full max-w-sm mb-6">
          {[1, 2, 3, 4].map((level) => (
            <button
              key={level}
              onClick={() => handleTensionSelect(level)}
              className="
                py-6 rounded-xl font-medium text-lg
                transition-all hover:scale-105
              "
              style={{
                backgroundColor: getTensionColor(level),
                color: level >= 3 ? 'white' : 'var(--text)',
              }}
            >
              {level === 1 && 'Low'}
              {level === 2 && 'Mild'}
              {level === 3 && 'Moderate'}
              {level === 4 && 'High'}
            </button>
          ))}
        </div>

        {/* Common associations */}
        <div className="w-full max-w-sm">
          <p className="text-sm text-[--text-muted] mb-3">
            Does it feel like...
          </p>
          <div className="flex flex-wrap gap-2">
            {currentArea.associations.map((assoc) => (
              <button
                key={assoc}
                onClick={() => {
                  handleAssociationSelect(assoc);
                  handleTensionSelect(2);
                }}
                className="
                  px-4 py-2 rounded-full text-sm
                  bg-[--surface-2] text-[--text]
                  hover:bg-[--border] transition-colors
                "
              >
                {assoc}
              </button>
            ))}
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={() => {
            setCurrentArea(null);
            setStep('scan');
          }}
          className="mt-6 text-sm text-[--text-muted] hover:text-[--text]"
        >
          No tension here
        </button>
      </div>
    );
  }

  // Complete View
  if (step === 'complete') {
    const dominantAreaData = BODY_AREAS.find(
      (a) => a.id === Object.entries(selectedAreas).sort((a, b) => b[1] - a[1])[0]?.[0]
    );

    return (
      <div className={`text-center ${className}`}>
        <div className="text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-medium text-[--text] mb-2">
          Scan Complete
        </h2>
        
        {dominantAreaData && (
          <p className="text-[--text-muted] mb-4">
            You noticed the most tension in your {dominantAreaData.name.toLowerCase()}.
          </p>
        )}
        
        <p className="text-sm text-[--text-muted] mb-6">
          Awareness is the first step. Would you like to try a technique to release some of this tension?
        </p>
        
        <button
          onClick={() => onComplete?.({
            areas: selectedAreas,
            dominantArea: dominantAreaData?.id || null,
            dominantAssociation,
          })}
          className="px-6 py-3 bg-[--primary] text-[--on-primary] rounded-xl font-medium"
        >
          Continue
        </button>
      </div>
    );
  }

  return null;
}
