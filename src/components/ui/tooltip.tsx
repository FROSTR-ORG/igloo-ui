import * as React from 'react';

import { cn } from '../../lib/utils';

export type TooltipProps = {
  trigger: React.ReactNode;
  content: React.ReactNode;
  className?: string;
};

export function Tooltip({ trigger, content, className }: TooltipProps) {
  return (
    <span className={cn('group relative inline-flex', className)}>
      {trigger}
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-xl border border-slate-700/40 bg-slate-950/95 px-3 py-2 text-xs leading-5 text-slate-200 shadow-xl group-hover:block group-focus-within:block">
        {content}
      </span>
    </span>
  );
}
