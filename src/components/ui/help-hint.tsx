import * as React from 'react';
import { HelpCircle, Info } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Tooltip, type TooltipProps } from './tooltip';

export type HelpHintProps = {
  content: React.ReactNode;
  ariaLabel: string;
  placement?: TooltipProps['placement'];
  className?: string;
  iconSize?: number;
  icon?: 'help' | 'info';
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
  iconSize = 14,
  icon = 'help',
}: HelpHintProps) {
  const Icon = icon === 'info' ? Info : HelpCircle;

  return (
    <Tooltip
      className={className}
      content={content}
      placement={placement}
      trigger={
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn('igloo-help-hint-trigger')}
        >
          <Icon size={iconSize} aria-hidden="true" />
        </button>
      }
    />
  );
}
