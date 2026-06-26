import * as React from 'react';
import { cn } from '../../lib/utils';

type PageLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  maxWidth?: string;
  header?: React.ReactNode;
  surface?: 'default' | 'welcome' | 'dashboard';
};

const APP_BACKGROUND_IMAGE = 'linear-gradient(160deg, #030712 0%, #0b1220 50%, #121f48 100%)';

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
  const isDashboard = surface === 'dashboard';

  return (
    <div
      className={cn(
        isWelcome || isDashboard
          ? 'min-h-dvh overflow-x-clip p-0 text-blue-100'
          : 'min-h-dvh overflow-x-clip p-3 text-blue-100 sm:p-6',
        className,
      )}
      style={{
        backgroundImage: APP_BACKGROUND_IMAGE,
        ...style,
      }}
      {...props}
    >
      <div className={cn('mx-auto flex w-full flex-col', isWelcome || isDashboard ? 'gap-0' : 'gap-4', maxWidth)}>
        {header}
        {children}
      </div>
    </div>
  );
}
