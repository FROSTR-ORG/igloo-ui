import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '../../lib/utils';

export type CollapsibleProps = {
  title: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

export function Collapsible({
  title,
  defaultOpen = false,
  className,
  contentClassName,
  children,
}: CollapsibleProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className={cn('overflow-hidden rounded-lg border border-igloo-border bg-igloo-panel', className)}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="text-sm font-medium text-igloo-text">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-igloo-muted" /> : <ChevronDown className="h-4 w-4 text-igloo-muted" />}
      </button>
      {open ? <div className={cn('border-t border-igloo-border-muted p-4', contentClassName)}>{children}</div> : null}
    </div>
  );
}
