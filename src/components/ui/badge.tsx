import * as React from 'react';

import { cn } from '../../lib/utils';

type BadgeTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

const toneClass: Record<BadgeTone, string> = {
  default: 'border-slate-500/30 bg-slate-500/15 text-slate-200',
  success: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200',
  warning: 'border-amber-500/30 bg-amber-500/15 text-amber-200',
  danger: 'border-rose-500/30 bg-rose-500/15 text-rose-100',
  info: 'border-sky-500/30 bg-sky-500/15 text-sky-200',
};

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide',
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}
