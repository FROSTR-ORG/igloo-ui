import * as React from 'react';

import { cn } from '../../lib/utils';

export type TooltipProps = {
  trigger: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  tooltipClassName?: string;
  placement?: 'top' | 'bottom' | 'right' | 'left' | 'bottom-left';
  withArrow?: boolean;
};

type TooltipTriggerProps = {
  'aria-describedby'?: string;
  'data-tooltip-open'?: 'true';
  'data-tooltip-placement'?: TooltipProps['placement'];
  onBlur?: React.FocusEventHandler;
  onFocus?: React.FocusEventHandler;
  onKeyDown?: React.KeyboardEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};

export function Tooltip({
  trigger,
  content,
  className,
  tooltipClassName,
  placement = 'bottom',
  withArrow = true,
}: TooltipProps) {
  const tooltipId = React.useId();
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const open = hovered || focused;

  React.useEffect(() => {
    const onAnyTooltipOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== tooltipId) {
        setHovered(false);
        setFocused(false);
      }
    };

    document.addEventListener('igloo-tooltip-open', onAnyTooltipOpen);
    return () => document.removeEventListener('igloo-tooltip-open', onAnyTooltipOpen);
  }, [tooltipId]);

  React.useEffect(() => {
    if (open) {
      document.dispatchEvent(new CustomEvent('igloo-tooltip-open', { detail: tooltipId }));
    }
  }, [open, tooltipId]);

  const triggerNode = React.isValidElement<TooltipTriggerProps>(trigger)
    ? React.cloneElement(trigger, {
        'aria-describedby': [trigger.props['aria-describedby'], tooltipId].filter(Boolean).join(' ') || tooltipId,
        'data-tooltip-open': open ? 'true' : undefined,
        'data-tooltip-placement': placement,
        onBlur: (event) => {
          trigger.props.onBlur?.(event);
          setFocused(false);
        },
        onFocus: (event) => {
          trigger.props.onFocus?.(event);
          setFocused(true);
        },
        onKeyDown: (event) => {
          trigger.props.onKeyDown?.(event);
          if (event.key === 'Escape') {
            setHovered(false);
            setFocused(false);
          }
        },
        onMouseEnter: (event) => {
          trigger.props.onMouseEnter?.(event);
          setHovered(true);
        },
        onMouseLeave: (event) => {
          trigger.props.onMouseLeave?.(event);
          setHovered(false);
        },
      })
    : trigger;

  return (
    <span
      className={cn('igloo-tooltip', className)}
      data-tooltip-open={open ? 'true' : undefined}
      data-tooltip-placement={placement}
    >
      {triggerNode}
      <span
        id={tooltipId}
        role="tooltip"
        className={cn('igloo-tooltip-content', tooltipClassName)}
      >
        {content}
        {withArrow ? (
          <span aria-hidden="true" data-tooltip-arrow="" className="igloo-tooltip-arrow" />
        ) : null}
      </span>
    </span>
  );
}
