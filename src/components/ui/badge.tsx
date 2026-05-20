import * as React from 'react';

import { cn } from '../../lib/utils';

type BadgeTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

const toneClass: Record<BadgeTone, string> = {
  default: 'border-igloo-muted/30 bg-igloo-muted/15 text-igloo-text',
  success: 'border-igloo-success/30 bg-igloo-success/15 text-igloo-success',
  warning: 'border-igloo-warning/30 bg-igloo-warning/15 text-igloo-warning',
  danger: 'border-igloo-error/30 bg-igloo-error/15 text-igloo-error',
  info: 'border-igloo-info/30 bg-igloo-info/15 text-igloo-info',
};

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}
