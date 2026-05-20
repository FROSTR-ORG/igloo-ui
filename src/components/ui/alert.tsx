import * as React from 'react';

import { cn } from '../../lib/utils';

type AlertTone = 'default' | 'danger' | 'warning' | 'success';

const toneClass: Record<AlertTone, string> = {
  default: 'border-igloo-border bg-igloo-panel text-igloo-text',
  danger: 'border-igloo-error/35 bg-igloo-error/10 text-igloo-error',
  warning: 'border-igloo-warning/35 bg-igloo-warning/10 text-igloo-warning',
  success: 'border-igloo-success/35 bg-igloo-success/10 text-igloo-success',
};

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  tone?: AlertTone;
};

export function Alert({ className, title, tone = 'danger', children, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        'grid gap-2 rounded-2xl border px-4 py-3 backdrop-blur-sm',
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {title ? <strong className="text-sm font-semibold">{title}</strong> : null}
      {children ? <div className="text-sm">{children}</div> : null}
    </div>
  );
}
