import * as React from 'react';
import { FileText, LayoutDashboard, Settings, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tooltip } from './tooltip';

export type AppHeaderBrandAction = {
  onClick: () => void;
  ariaLabel: string;
  testId?: string;
  disabled?: boolean;
};

export type AppHeaderProps = {
  mode: 'welcome' | 'task' | 'profile' | 'dashboard';
  className?: string;
  logoSrc?: string;
  logoAlt?: string;
  links?: Array<{ label: string; href: string }>;
  taskLabel?: string;
  profileName?: string;
  actions?: React.ReactNode;
  brandAction?: AppHeaderBrandAction;
};

export type DashboardHeaderAction = {
  onClick: () => void;
  label: string;
  ariaLabel?: string;
  testId?: string;
  id?: string;
  active?: boolean;
  disabled?: boolean;
};

export type DashboardHeaderActionsProps = {
  dashboard?: DashboardHeaderAction;
  recover?: DashboardHeaderAction;
  permissions: DashboardHeaderAction;
  settings: DashboardHeaderAction;
  className?: string;
};

const defaultLinks = [
  { label: 'Website', href: '#' },
  { label: 'Docs', href: '#' },
  { label: 'GitHub', href: '#' },
];

export function AppHeader({
  mode,
  className,
  logoSrc,
  logoAlt = 'FROSTR',
  links = defaultLinks,
  taskLabel,
  profileName,
  actions,
  brandAction,
}: AppHeaderProps) {
  const rightContent = renderShellRightContent({ mode, links, taskLabel, profileName, actions });
  const showSubtitle = mode === 'welcome' || mode === 'task';

  return (
    <header className={cn('relative z-[45] flex w-full justify-center px-5 py-3 sm:px-10 sm:py-5 lg:px-20', className)}>
      <div
        className="flex w-full max-w-[1000px] min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-igloo-border bg-igloo-panel px-4 py-3 sm:flex-nowrap sm:px-5 sm:py-3.5"
      >
        <BrandLockup
          action={brandAction}
          logoAlt={logoAlt}
          logoSrc={logoSrc}
          showSubtitle={showSubtitle}
        />
        {rightContent && (
          <div className="flex min-w-0 max-w-full flex-wrap items-center justify-start gap-2 sm:justify-end sm:gap-5">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}

function BrandLockup({
  action,
  logoAlt,
  logoSrc,
  showSubtitle,
}: {
  action?: AppHeaderBrandAction;
  logoAlt: string;
  logoSrc?: string;
  showSubtitle: boolean;
}) {
  const content = (
    <>
      {logoSrc && (
        <img
          src={logoSrc}
          alt={action ? '' : logoAlt}
          className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
        />
      )}
      <div className={cn('flex flex-col justify-center', showSubtitle ? 'min-h-12 gap-0.5' : 'min-h-10')}>
        {showSubtitle ? (
          <h1 className="text-[28px] font-bold leading-8 tracking-[-0.01em] text-igloo-primary">
            Igloo
          </h1>
        ) : (
          <span className="text-[28px] font-bold leading-8 tracking-[-0.01em] text-igloo-primary">
            Igloo
          </span>
        )}
        {showSubtitle ? (
          <p className="text-xs leading-4 tracking-[0.01em] text-igloo-subtle">
            Threshold Signing for Nostr
          </p>
        ) : null}
      </div>
    </>
  );

  const className = cn(
    'flex min-w-0 items-center gap-3.5 rounded-lg',
    action &&
      'transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-igloo-primary/10 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-igloo-primary/60',
  );

  if (!action) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button
      type="button"
      aria-label={action.ariaLabel}
      data-testid={action.testId}
      disabled={action.disabled}
      onClick={action.onClick}
      className={cn(className, 'disabled:pointer-events-none disabled:opacity-50')}
    >
      {content}
    </button>
  );
}

function renderShellRightContent({
  mode,
  links,
  taskLabel,
  profileName,
  actions,
}: {
  mode: AppHeaderProps['mode'];
  links: NonNullable<AppHeaderProps['links']>;
  taskLabel?: string;
  profileName?: string;
  actions?: React.ReactNode;
}) {
  if (mode === 'welcome') {
    return links.map((link) => (
      <a key={link.label} href={link.href} className="font-sharetech text-[13px] leading-4 text-[#8494A7] transition-colors hover:text-igloo-primary">
        {link.label}
      </a>
    ));
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

export function DashboardHeaderActions({
  dashboard,
  recover,
  permissions,
  settings,
  className,
}: DashboardHeaderActionsProps) {
  return (
    <nav
      className={cn('flex h-auto min-w-0 shrink flex-wrap items-center gap-2 sm:h-6 sm:shrink-0 sm:gap-5', className)}
      aria-label="Dashboard actions"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3.5">
        {dashboard ? (
          <DashboardTextAction
            action={dashboard}
            icon={<LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />}
          />
        ) : null}
        {recover ? (
          <DashboardTextAction action={recover} icon={<FileText className="h-3.5 w-3.5" aria-hidden="true" />} />
        ) : null}
        <DashboardTextAction
          action={permissions}
          icon={<SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />}
        />
      </div>
      <div className="hidden h-6 w-px shrink-0 bg-[#1E3A8A4D] sm:block" />
      <Tooltip
        content={settings.label}
        tooltipClassName="max-w-[10rem]"
        trigger={
          <button
            id={settings.id}
            type="button"
            aria-label={settings.ariaLabel ?? settings.label}
            aria-pressed={settings.active}
            data-testid={settings.testId}
            disabled={settings.disabled}
            onClick={settings.onClick}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-md text-[#D1D5DB] transition-[background-color,color,box-shadow,transform] duration-150 ease-out hover:bg-igloo-primary/10 hover:text-white active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-igloo-primary/60 disabled:pointer-events-none disabled:opacity-50 sm:h-6 sm:w-6',
              settings.active && 'bg-igloo-primary/15 text-igloo-primary',
            )}
          >
            <Settings className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        }
      />
    </nav>
  );
}

function DashboardTextAction({
  action,
  icon,
}: {
  action: DashboardHeaderAction;
  icon: React.ReactNode;
}) {
  return (
    <button
      id={action.id}
      type="button"
      aria-label={action.ariaLabel}
      aria-pressed={action.active}
      data-testid={action.testId}
      disabled={action.disabled}
      onClick={action.onClick}
      className={cn(
        'inline-flex min-h-10 min-w-0 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium leading-[18px] text-[#D1D5DB] transition-[background-color,color,box-shadow,transform] duration-150 ease-out hover:bg-igloo-primary/10 hover:text-white active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-igloo-primary/60 disabled:pointer-events-none disabled:opacity-50 sm:h-6 sm:min-h-0 sm:px-1.5',
        action.active && 'bg-igloo-primary/15 text-igloo-primary',
      )}
    >
      {icon}
      <span>{action.label}</span>
    </button>
  );
}
