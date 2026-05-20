import * as React from 'react';
import { cn } from '../../lib/utils';

type AppHeaderProps = {
  mode?: 'welcome' | 'task' | 'profile' | 'dashboard';
  title?: string;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  logoSrc?: string;
  logoAlt?: string;
  centered?: boolean;
  links?: Array<{ label: string; href: string }>;
  taskLabel?: string;
  profileName?: string;
  actions?: React.ReactNode;
};

const defaultLinks = [
  { label: 'Website', href: '#' },
  { label: 'Docs', href: '#' },
  { label: 'GitHub', href: '#' },
];

export function AppHeader({
  mode,
  title = 'igloo',
  subtitle,
  right,
  className,
  logoSrc,
  logoAlt = 'FROSTR',
  centered = false,
  links = defaultLinks,
  taskLabel,
  profileName,
  actions,
}: AppHeaderProps) {
  const paperMode = Boolean(mode);
  const displayTitle = paperMode ? 'Igloo' : title;
  const displaySubtitle = paperMode && subtitle === undefined ? 'Threshold Signing for Nostr' : subtitle;
  const rightContent = right ?? renderPaperRightContent({ mode, links, taskLabel, profileName, actions });

  return (
    <header className={cn(paperMode ? 'flex w-full justify-center px-5 py-5 sm:px-10 lg:px-20' : 'mb-6', className)}>
      <div
        className={cn(
          paperMode
            ? 'flex w-full max-w-[1000px] items-center justify-between rounded-xl border border-igloo-border bg-igloo-panel px-5 py-3.5'
            : 'flex flex-wrap items-center gap-3',
          centered ? 'justify-center text-center' : 'justify-between',
        )}
      >
        <div className={cn('flex items-center gap-3 sm:gap-4', paperMode && 'gap-3.5', centered && 'justify-center')}>
          {logoSrc && <img src={logoSrc} alt={logoAlt} className="h-9 w-9 object-contain sm:h-10 sm:w-10" />}
          <div className={cn(paperMode && 'flex min-h-12 flex-col justify-center gap-0.5')}>
            <h1
              className={cn(
                paperMode
                  ? 'text-[28px] font-bold leading-8 tracking-[-0.01em] text-igloo-primary'
                  : 'bg-gradient-to-r from-blue-300 via-blue-200 to-cyan-300 bg-clip-text font-sharetech text-[2.05rem] font-bold uppercase leading-none tracking-[0.11em] text-transparent sm:text-[2.45rem]',
              )}
            >
              {displayTitle}
            </h1>
            {displaySubtitle && (
              <p className={cn(paperMode ? 'text-xs leading-4 tracking-[0.01em] text-igloo-subtle' : 'mt-0.5 text-[0.8rem] text-blue-400', centered && 'mx-auto max-w-xl')}>
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>
        {rightContent && <div className={cn(paperMode ? 'flex items-center gap-5' : 'flex items-center gap-2', centered && 'w-full justify-center')}>{rightContent}</div>}
      </div>
    </header>
  );
}

function renderPaperRightContent({
  mode,
  links,
  taskLabel,
  profileName,
  actions,
}: {
  mode?: AppHeaderProps['mode'];
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
