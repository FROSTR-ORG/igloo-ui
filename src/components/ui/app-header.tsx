import * as React from 'react';
import { cn } from '../../lib/utils';

type AppHeaderProps = {
  mode: 'welcome' | 'task' | 'profile' | 'dashboard';
  className?: string;
  logoSrc?: string;
  logoAlt?: string;
  taskLabel?: string;
  profileName?: string;
  actions?: React.ReactNode;
};

export function AppHeader({
  mode,
  className,
  logoSrc,
  logoAlt = 'FROSTR',
  taskLabel,
  profileName,
  actions,
}: AppHeaderProps) {
  const rightContent = renderShellRightContent({ mode, taskLabel, profileName, actions });

  return (
    <header className={cn('flex w-full justify-center px-5 py-5 sm:px-10 lg:px-20', className)}>
      <div
        className="flex w-full max-w-[1000px] items-center justify-between rounded-xl border border-igloo-border bg-igloo-panel px-5 py-3.5"
      >
        <div className="flex items-center gap-3.5">
          {logoSrc && <img src={logoSrc} alt={logoAlt} className="h-9 w-9 object-contain sm:h-10 sm:w-10" />}
          <div className="flex min-h-12 flex-col justify-center gap-0.5">
            <h1
              className="text-[28px] font-bold leading-8 tracking-[-0.01em] text-igloo-primary"
            >
              Igloo
            </h1>
            <p className="text-xs leading-4 tracking-[0.01em] text-igloo-subtle">
              Threshold Signing for Nostr
            </p>
          </div>
        </div>
        {rightContent && <div className="flex items-center gap-5">{rightContent}</div>}
      </div>
    </header>
  );
}

function renderShellRightContent({
  mode,
  taskLabel,
  profileName,
  actions,
}: {
  mode: AppHeaderProps['mode'];
  taskLabel?: string;
  profileName?: string;
  actions?: React.ReactNode;
}) {
  if (mode === 'welcome') {
    return null;
  }

  if (mode === 'task') {
    return <span className="font-sharetech text-[13px] leading-4 text-[#8494A7]">{taskLabel}</span>;
  }

  if (mode === 'profile') {
    return <span className="text-base text-igloo-muted">{profileName}</span>;
  }

  if (mode === 'dashboard') {
    return actions;
  }

  return null;
}
