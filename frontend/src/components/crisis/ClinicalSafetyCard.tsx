"use client";

/**
 * ClinicalSafetyCard Component
 * 
 * Shown when the Safety Switch is triggered.
 * Replaces AI session with deterministic support.
 * Calm, grounded tone - no exclamation marks.
 */

import type { ClinicalSafetyCard as SafetyCardType, CrisisResource } from '@/lib/types';
import { CrisisContactButton } from './CrisisContactButton';
import { triggerHaptic } from '@/lib/haptics';

interface ClinicalSafetyCardProps {
  card: SafetyCardType;
  onDismiss?: () => void;
  className?: string;
}

const toneClasses = {
  calm: 'bg-[--surface] border-[--primary]',
  urgent: 'bg-[--surface] border-[#F59E0B]',
  emergency: 'bg-[--surface] border-[#EF4444]',
};

const titleClasses = {
  calm: 'text-[--primary]',
  urgent: 'text-[#F59E0B]',
  emergency: 'text-[#EF4444]',
};

export function ClinicalSafetyCard({
  card,
  onDismiss,
  className = '',
}: ClinicalSafetyCardProps) {
  const getVariant = (resource: CrisisResource): 'emergency' | 'primary' | 'secondary' => {
    if (resource.number === '999') return 'emergency';
    if (resource.name === 'Samaritans') return 'primary';
    return 'secondary';
  };

  const handleDismiss = () => {
    triggerHaptic('light');
    onDismiss?.();
  };

  return (
    <div
      className={`
        rounded-3xl border-2 p-6 shadow-lg
        animate-fade-in
        ${toneClasses[card.tone]}
        ${className}
      `}
      role="alertdialog"
      aria-labelledby="safety-card-title"
      aria-describedby="safety-card-message"
    >
      {/* Title */}
      <h2
        id="safety-card-title"
        className={`text-2xl font-semibold mb-4 ${titleClasses[card.tone]}`}
      >
        {card.title}
      </h2>

      {/* Message - calm, grounded, no exclamation marks */}
      <p
        id="safety-card-message"
        className="text-[--text] text-lg leading-relaxed mb-6"
      >
        {card.message}
      </p>

      {/* Primary Resource - Large, prominent */}
      <div className="mb-4">
        <CrisisContactButton
          resource={card.primaryResource}
          variant={getVariant(card.primaryResource)}
          size="large"
        />
      </div>

      {/* Additional Resources */}
      {card.additionalResources.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {card.additionalResources.map((resource) => (
            <CrisisContactButton
              key={resource.number}
              resource={resource}
              variant="secondary"
              size="medium"
            />
          ))}
        </div>
      )}

      {/* Self-Care Options */}
      {card.selfCareOptions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[--border]">
          <h3 className="text-sm font-medium text-[--text-muted] mb-3">
            While you wait, you might try
          </h3>
          <ul className="space-y-2">
            {card.selfCareOptions.map((option, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-[--text]"
              >
                <span className="text-[--primary] mt-1">•</span>
                <span>{option}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dismiss Button - Only for non-emergency */}
      {card.tone !== 'emergency' && onDismiss && (
        <button
          onClick={handleDismiss}
          className="
            mt-6 w-full py-3 rounded-xl
            text-[--text-muted] text-sm
            bg-[--surface-2] hover:bg-[--border]
            transition-colors
          "
        >
          I understand, continue
        </button>
      )}
    </div>
  );
}

/**
 * Default Safety Cards for Different Severities
 */
export const DEFAULT_SAFETY_CARDS: Record<string, SafetyCardType> = {
  critical: {
    title: 'We hear you',
    message: 'It sounds like you are going through something really difficult right now. You do not have to face this alone. Speaking with someone who understands can help.',
    tone: 'urgent',
    primaryResource: {
      number: '116 123',
      name: 'Samaritans',
      description: 'Free 24/7 emotional support',
      type: 'call',
    },
    additionalResources: [
      {
        number: '85258',
        name: 'Shout',
        description: 'Free text support',
        type: 'text',
      },
      {
        number: '111',
        name: 'NHS 111',
        description: 'Urgent medical help',
        type: 'call',
      },
    ],
    selfCareOptions: [
      'Find a quiet, safe space',
      'Focus on your breathing',
      'Reach out to someone you trust',
    ],
  },
  high: {
    title: 'You matter',
    message: 'What you are feeling is valid, and support is available whenever you need it. Consider reaching out to someone who can listen.',
    tone: 'calm',
    primaryResource: {
      number: '116 123',
      name: 'Samaritans',
      description: 'Free 24/7 emotional support',
      type: 'call',
    },
    additionalResources: [
      {
        number: '0300 123 3393',
        name: 'Mind Infoline',
        description: 'Mental health information',
        type: 'call',
      },
    ],
    selfCareOptions: [
      'Take a moment to breathe',
      'Ground yourself with the 5-4-3-2-1 technique',
      'Consider calling a trusted friend or family member',
    ],
  },
  medium: {
    title: 'Support is here',
    message: 'If you need to talk to someone, these resources are available 24/7.',
    tone: 'calm',
    primaryResource: {
      number: '116 123',
      name: 'Samaritans',
      description: 'Free 24/7 emotional support',
      type: 'call',
    },
    additionalResources: [],
    selfCareOptions: [
      'Take things one moment at a time',
      'It is okay to ask for help',
    ],
  },
};
