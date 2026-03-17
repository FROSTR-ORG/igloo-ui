import * as React from 'react';
import { cn } from '../../lib/utils';

type AppHeaderProps = {
  title?: string;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  logoSrc?: string;
  logoAlt?: string;
  centered?: boolean;
};

export function AppHeader({
  title = 'igloo',
  subtitle,
  right,
  className,
  logoSrc,
  logoAlt = 'FROSTR',
  centered = false,
}: AppHeaderProps) {
  return (
    <header className={cn('mb-6', className)}>
      <div
        className={cn(
          'flex flex-wrap items-center gap-3',
          centered ? 'justify-center text-center' : 'justify-between',
        )}
      >
        <div className={cn('flex items-center gap-3 sm:gap-4', centered && 'justify-center')}>
          {logoSrc && <img src={logoSrc} alt={logoAlt} className="h-9 w-9 object-contain sm:h-10 sm:w-10" />}
          <div>
            <h1 className="bg-gradient-to-r from-blue-300 via-blue-200 to-cyan-300 bg-clip-text font-sharetech text-[2.05rem] font-bold uppercase leading-none tracking-[0.11em] text-transparent sm:text-[2.45rem]">
              {title}
            </h1>
            {subtitle && (
              <p className={cn('mt-0.5 text-[0.8rem] text-blue-400', centered && 'mx-auto max-w-xl')}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {right && <div className={cn('flex items-center gap-2', centered && 'w-full justify-center')}>{right}</div>}
      </div>
    </header>
  );
}
