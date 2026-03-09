import * as React from 'react';
import { cn } from '../../lib/utils';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
  logoSrc?: string;
  logoAlt?: string;
};

export function AppHeader({
  title = 'igloo',
  subtitle,
  right,
  className,
  logoSrc,
  logoAlt = 'FROSTR'
}: AppHeaderProps) {
  return (
    <header className={cn('mb-6', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {logoSrc && <img src={logoSrc} alt={logoAlt} className="h-11 w-11 object-contain" />}
          <div>
            <h1 className="bg-gradient-to-r from-blue-300 via-blue-200 to-cyan-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              {title}
            </h1>
            {subtitle && <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}
