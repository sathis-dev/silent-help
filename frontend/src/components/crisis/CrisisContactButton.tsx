"use client";

/**
 * CrisisContactButton Component
 * 
 * One-tap access to UK crisis lines.
 * Uses tel: links for direct calling.
 * Large touch targets for Fitts's Law compliance.
 */

import { triggerHaptic, triggerSOSHaptic } from '@/lib/haptics';
import type { CrisisResource } from '@/lib/types';

interface CrisisContactButtonProps {
  resource: CrisisResource;
  size?: 'large' | 'medium' | 'small';
  variant?: 'emergency' | 'primary' | 'secondary';
  className?: string;
}

const sizeClasses = {
  large: 'min-h-[80px] min-w-[200px] text-xl p-6',   // Fitts's Law - large touch targets
  medium: 'min-h-[60px] min-w-[160px] text-lg p-4',
  small: 'min-h-[48px] min-w-[120px] text-base p-3',
};

const variantClasses = {
  emergency: 'bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#B91C1C]',
  primary: 'bg-[#10B981] text-white hover:bg-[#059669] active:bg-[#047857]',
  secondary: 'bg-[#3B82F6] text-white hover:bg-[#2563EB] active:bg-[#1D4ED8]',
};

export function CrisisContactButton({
  resource,
  size = 'large',
  variant = 'primary',
  className = '',
}: CrisisContactButtonProps) {
  const handleClick = () => {
    if (variant === 'emergency') {
      triggerSOSHaptic();
    } else {
      triggerHaptic('heavy');
    }
  };

  // Format phone number for tel: link
  const phoneLink = resource.type === 'text' 
    ? `sms:${resource.number}?body=SHOUT`
    : `tel:${resource.number.replace(/\s/g, '')}`;

  return (
    <a
      href={phoneLink}
      onClick={handleClick}
      className={`
        block rounded-2xl font-semibold text-center
        transition-all duration-150 ease-out
        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-[--focus]
        active:scale-[0.98]
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      role="button"
      aria-label={`Call ${resource.name} at ${resource.number}`}
    >
      <div className="flex flex-col items-center justify-center h-full gap-1">
        <span className="font-bold">{resource.name}</span>
        <span className="text-sm opacity-90">{resource.number}</span>
        {resource.type === 'text' && (
          <span className="text-xs opacity-75">Text SHOUT</span>
        )}
      </div>
    </a>
  );
}

/**
 * CrisisContactGrid Component
 * 
 * Grid layout for multiple crisis contacts.
 * Optimized for one-handed use in distress.
 */
interface CrisisContactGridProps {
  resources: CrisisResource[];
  className?: string;
}

export function CrisisContactGrid({ resources, className = '' }: CrisisContactGridProps) {
  // Determine variant based on resource type
  const getVariant = (resource: CrisisResource): 'emergency' | 'primary' | 'secondary' => {
    if (resource.number === '999') return 'emergency';
    if (resource.name === 'Samaritans' || resource.name === 'NHS 111') return 'primary';
    return 'secondary';
  };

  return (
    <div className={`grid grid-cols-1 gap-4 ${className}`}>
      {resources.map((resource) => (
        <CrisisContactButton
          key={resource.number}
          resource={resource}
          variant={getVariant(resource)}
          size="large"
        />
      ))}
    </div>
  );
}
