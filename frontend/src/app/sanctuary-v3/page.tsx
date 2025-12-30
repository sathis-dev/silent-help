'use client';

/**
 * Sanctuary V3 Demo Page
 * 
 * This page demonstrates the complete Sanctuary V3 design system
 * following the SANCTUARY_V3_SPEC.json specification.
 * 
 * Features:
 * - Responsive layout (Observatory on desktop, Pocket Sanctuary on mobile)
 * - Living Nebula background
 * - Biometric Orb with BPM sync
 * - Floating dock navigation
 * - Bento tool grid
 * - SOS button with hold protection
 * - Insights drawer
 */

import React from 'react';
import { SanctuaryV3 } from '@/components/layout';

export default function SanctuaryV3Demo() {
  return (
    <SanctuaryV3
      userName="Friend"
      cognitiveState="calm"
      onNavigate={(section) => {
        console.log('Navigate to:', section);
      }}
      onToolSelect={(tool) => {
        console.log('Tool selected:', tool);
      }}
      onSOSActivate={() => {
        console.log('SOS Activated!');
        // In production, this would open crisis resources
      }}
    />
  );
}
