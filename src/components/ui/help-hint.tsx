import * as React from 'react';
import { HelpCircle } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Tooltip } from './tooltip';

export type HelpHintProps = {
  content: React.ReactNode;
  ariaLabel: string;
  placement?: 'top' | 'bottom';
  className?: string;
  iconSize?: number;
};

/**
 * Keyboard-focusable help affordance. Wraps a `<button>` trigger (so it is
 * reachable by Tab and exposes an accessible name) in a Tooltip that opens on
 * focus or hover. Replaces bare `HelpCircle` icons and `title=`-attribute
 * tooltips that previously gated help text behind hover only.
 */
export function HelpHint({
  content,
  ariaLabel,
  placement = 'bottom',
  className,
  iconSize = 15,
}: HelpHintProps) {
  return (
    <Tooltip
      className={className}
      content={content}
      trigger={
        <button
          type="button"
          aria-label={ariaLabel}
          data-placement={placement}
          className={cn(
            'inline-flex items-center justify-center rounded-full text-blue-400 outline-none transition-colors hover:text-blue-300 focus-visible:ring-2 focus-visible:ring-blue-400/60',
          )}
        >
          <HelpCircle size={iconSize} aria-hidden="true" />
        </button>
      }
    />
  );
}
