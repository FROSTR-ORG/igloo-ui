import * as React from 'react';

import { cn } from '../../lib/utils';

export type StepIndicatorStep = {
  id: string;
  label: React.ReactNode;
};

export type StepIndicatorProps = {
  steps: StepIndicatorStep[];
  currentStepId: string;
  ariaLabel?: string;
  className?: string;
};

/**
 * Accessible ordered list of flow steps. The active step carries
 * `aria-current="step"` so assistive tech announces progress.
 */
export function StepIndicator({
  steps,
  currentStepId,
  ariaLabel = 'Progress',
  className,
}: StepIndicatorProps) {
  return (
    <ol role="list" aria-label={ariaLabel} className={cn('igloo-step-progress', className)}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStepId;
        return (
          <li
            key={step.id}
            aria-current={isActive ? 'step' : undefined}
            className={isActive ? 'igloo-step-chip is-active' : 'igloo-step-chip'}
          >
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
          </li>
        );
      })}
    </ol>
  );
}
