import * as React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from 'lucide-react';

import { cn } from '../../lib/utils';

type AlertTone = 'default' | 'danger' | 'warning' | 'success';

const toneIcon: Record<AlertTone, LucideIcon> = {
  default: Info,
  danger: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
};

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  tone?: AlertTone;
};

export function Alert({ className, title, tone = 'danger', children, ...props }: AlertProps) {
  const Icon = toneIcon[tone];
  return (
    <div className={cn('igloo-alert', `igloo-alert--${tone}`, className)} {...props}>
      <Icon size={20} aria-hidden="true" className="igloo-alert-icon" />
      <div className="igloo-alert-body">
        {title ? <strong>{title}</strong> : null}
        {children ? <div>{children}</div> : null}
      </div>
    </div>
  );
}
