import * as React from 'react';
import { ArrowLeft } from 'lucide-react';

import { cn } from '../../lib/utils';
import { IconButton } from './icon-button';

type ContentCardProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  headerRight?: React.ReactNode;
  onBack?: () => void;
  backButtonTooltip?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function ContentCard({
  title,
  description,
  action,
  headerRight,
  onBack,
  backButtonTooltip = 'Back',
  className,
  children,
  ...props
}: ContentCardProps) {
  const right = headerRight ?? action;

  return (
    <section
      className={cn('rounded-lg bg-gray-900/40 p-4 shadow-lg sm:p-5', className)}
      {...props}
    >
      {(title || description || right || onBack) && (
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold text-blue-200">{title}</h2>}
            {description && <p className="mt-1 max-w-2xl text-[0.82rem] text-blue-400">{description}</p>}
          </div>
          {(right || onBack) && (
            <div className="flex items-center gap-1.5 text-[0.8rem] text-blue-400">
              {right}
              {onBack ? (
                <IconButton
                  variant="ghost"
                  icon={<ArrowLeft className="h-4 w-4" />}
                  onClick={onBack}
                  tooltip={backButtonTooltip}
                />
              ) : null}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
