import * as React from 'react';
import { cn } from '../../lib/utils';

type PageLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  maxWidth?: string;
  header?: React.ReactNode;
  surface?: 'default' | 'welcome';
};

export function PageLayout({
  className,
  maxWidth = 'max-w-3xl',
  header,
  children,
  surface = 'default',
  style,
  ...props
}: PageLayoutProps) {
  const isWelcome = surface === 'welcome';

  return (
    <div
      className={cn(isWelcome ? 'min-h-screen p-0 text-blue-100' : 'min-h-screen p-3 sm:p-6 text-blue-100', className)}
      style={{
        ...(isWelcome
          ? { backgroundImage: 'linear-gradient(160deg, #030712 0%, #0b1220 50%, #121f48 100%)' }
          : null),
        ...style,
      }}
      {...props}
    >
      <div className={cn('mx-auto flex w-full flex-col', isWelcome ? 'gap-0' : 'gap-4', maxWidth)}>
        {header}
        {children}
      </div>
    </div>
  );
}
