import * as React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

type DashboardHeaderAction = {
  label: string;
  active?: boolean;
  testId?: string;
  onClick: () => void;
};

type AppHeaderProps = {
  mode: 'welcome' | 'task' | 'profile' | 'dashboard';
  className?: string;
  logoSrc?: string;
  logoAlt?: string;
  brandAction?: {
    ariaLabel: string;
    testId?: string;
    onClick: () => void;
  };
  taskLabel?: string;
  profileName?: string;
  actions?: React.ReactNode;
};

export function AppHeader({
  mode,
  className,
  logoSrc,
  logoAlt = 'FROSTR',
  brandAction,
  taskLabel,
  profileName,
  actions,
}: AppHeaderProps) {
  const rightContent = renderShellRightContent({ mode, taskLabel, profileName, actions });
  const brandContent = (
    <>
      {logoSrc && <img src={logoSrc} alt={logoAlt} className="h-9 w-9 object-contain sm:h-10 sm:w-10" />}
      <div className="flex min-h-12 flex-col justify-center gap-0.5">
        <h1
          className="text-[28px] font-bold leading-8 tracking-[-0.01em] text-igloo-primary"
        >
          Igloo
        </h1>
        {mode === 'welcome' ? (
          <p className="text-xs leading-4 tracking-[0.01em] text-igloo-subtle">
            Threshold Signing for Nostr
          </p>
        ) : null}
      </div>
    </>
  );

  return (
    <header
      className={cn(
        'flex w-full justify-center py-5',
        mode === 'dashboard' ? 'px-0' : 'px-5 sm:px-10 lg:px-20',
        className,
      )}
    >
      <div
        className="flex w-full max-w-[1000px] min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-igloo-border bg-igloo-panel px-5 py-3.5 sm:flex-nowrap"
      >
        {brandAction ? (
          <button
            type="button"
            aria-label={brandAction.ariaLabel}
            data-testid={brandAction.testId}
            className="flex min-w-0 items-center gap-3.5 text-left"
            onClick={brandAction.onClick}
          >
            {brandContent}
          </button>
        ) : (
          <div className="flex min-w-0 items-center gap-3.5">{brandContent}</div>
        )}
        {rightContent && <div className="flex min-w-0 flex-wrap items-center justify-end gap-5">{rightContent}</div>}
      </div>
    </header>
  );
}

export function DashboardHeaderActions({
  dashboard,
  permissions,
  settings,
}: {
  dashboard: DashboardHeaderAction;
  permissions: DashboardHeaderAction;
  settings: DashboardHeaderAction;
}) {
  return (
    <nav className="flex min-w-0 flex-wrap items-center justify-end gap-2" aria-label="Dashboard navigation">
      <button
        type="button"
        id="operator-tab-signer"
        data-testid={dashboard.testId}
        aria-pressed={dashboard.active ?? false}
        className={cn(
          'rounded-md px-3 py-1.5 text-sm text-igloo-muted transition-colors hover:bg-igloo-primary/15 hover:text-igloo-primary',
          dashboard.active && 'bg-igloo-primary/15 text-igloo-primary',
        )}
        onClick={dashboard.onClick}
      >
        {dashboard.label}
      </button>
      <button
        type="button"
        id="operator-tab-permissions"
        data-testid={permissions.testId}
        aria-pressed={permissions.active ?? false}
        className={cn(
          'rounded-md px-3 py-1.5 text-sm text-igloo-muted transition-colors hover:bg-igloo-primary/15 hover:text-igloo-primary',
          permissions.active && 'bg-igloo-primary/15 text-igloo-primary',
        )}
        onClick={permissions.onClick}
      >
        {permissions.label}
      </button>
      <span className="mx-2 h-6 w-px bg-igloo-border" aria-hidden="true" />
      <button
        type="button"
        id="operator-tab-settings"
        aria-label={settings.label}
        title={settings.label}
        data-testid={settings.testId}
        aria-pressed={settings.active ?? false}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-md text-igloo-muted transition-colors hover:bg-igloo-primary/15 hover:text-igloo-primary',
          settings.active && 'bg-igloo-primary/15 text-igloo-primary',
        )}
        onClick={settings.onClick}
      >
        <SettingsIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </nav>
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
