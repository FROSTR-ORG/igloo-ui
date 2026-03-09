import * as React from 'react';

import { cn } from '../../lib/utils';

type AlertTone = 'default' | 'danger' | 'warning' | 'success';

const toneClass: Record<AlertTone, string> = {
  default: 'border-slate-500/30 bg-slate-950/40 text-slate-200',
  danger: 'border-rose-500/35 bg-rose-950/45 text-rose-100',
  warning: 'border-amber-500/35 bg-amber-950/35 text-amber-100',
  success: 'border-emerald-500/35 bg-emerald-950/35 text-emerald-100',
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
