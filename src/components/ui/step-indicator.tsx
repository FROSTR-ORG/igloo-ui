import * as React from 'react';
import { Check } from 'lucide-react';

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
 * Accessible ordered list of flow steps. Renders the Paper design's connector
 * lines and completed-step checkmarks (`is-complete` / `is-active` chip states)
 * while keeping a semantic `<ol>` with `aria-current="step"` on the active step
 * so assistive tech announces progress. Connectors are decorative and marked
 * `aria-hidden`.
 */
export function StepIndicator({
  steps,
  currentStepId,
  ariaLabel = 'Progress',
  className,
}: StepIndicatorProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);
  return (
    <ol role="list" aria-label={ariaLabel} className={cn('igloo-step-progress', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isComplete = currentIndex > -1 && index < currentIndex;
        return (
          <React.Fragment key={step.id}>
            {index > 0 ? (
              <li
                aria-hidden="true"
                className={
                  currentIndex > -1 && index <= currentIndex
                    ? 'igloo-step-connector is-complete'
                    : 'igloo-step-connector'
                }
              />
            ) : null}
            <li
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'igloo-step-chip',
                isComplete && 'is-complete',
                isActive && 'is-active',
              )}
            >
              <span>{isComplete ? <Check size={14} aria-hidden="true" /> : index + 1}</span>
              <strong>{step.label}</strong>
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
}
