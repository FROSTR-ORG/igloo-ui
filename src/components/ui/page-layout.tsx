import * as React from 'react';
import { cn } from '../../lib/utils';

type PageLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  maxWidth?: string;
  header?: React.ReactNode;
};

export function PageLayout({ className, maxWidth = 'max-w-3xl', header, children, ...props }: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen p-3 sm:p-6 text-blue-100', className)} {...props}>
      <div className={cn('mx-auto flex w-full flex-col gap-4', maxWidth)}>
        {header}
        {children}
      </div>
    </div>
  );
}
