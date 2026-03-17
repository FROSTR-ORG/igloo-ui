import * as React from 'react';

export type DesktopShellTab = {
  key: string;
  label: string;
  detail: string;
};

export type DesktopShellPath = {
  label: string;
  value: React.ReactNode;
};

export type DesktopShellStatus = {
  label: string;
  tone?: 'default' | 'live' | 'busy';
};

type Props = {
  appKicker: string;
  appTitle: string;
  appDescription: string;
  tabs: DesktopShellTab[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pathsTitle?: string;
  paths: DesktopShellPath[];
  heroKicker: string;
  heroTitle: string;
  heroDescription: React.ReactNode;
  statuses: DesktopShellStatus[];
  error?: React.ReactNode;
  children: React.ReactNode;
};

function statusClassName(tone: DesktopShellStatus['tone']) {
  if (tone === 'live') return 'igloo-shell-pill is-live';
  if (tone === 'busy') return 'igloo-shell-pill is-busy';
  return 'igloo-shell-pill';
}

export function DesktopAppShell({
  appKicker,
  appTitle,
  appDescription,
  tabs,
  activeTab,
  onSelectTab,
  pathsTitle = 'Local Paths',
  paths,
  heroKicker,
  heroTitle,
  heroDescription,
  statuses,
  error,
  children,
}: Props) {
  return (
    <div className="igloo-shell-app">
      <aside className="igloo-shell-rail">
        <div className="igloo-shell-brand">
          <div className="igloo-shell-kicker">{appKicker}</div>
          <h1>{appTitle}</h1>
          <p>{appDescription}</p>
        </div>

        <nav className="igloo-shell-nav">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'igloo-shell-nav-item is-active' : 'igloo-shell-nav-item'}
              onClick={() => onSelectTab(tab.key)}
              type="button"
            >
              <span>{tab.label}</span>
              <small>{tab.detail}</small>
            </button>
          ))}
        </nav>

        <section className="igloo-shell-paths">
          <h2>{pathsTitle}</h2>
          <dl>
            {paths.map((path) => (
              <React.Fragment key={path.label}>
                <dt>{path.label}</dt>
                <dd>{path.value}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>
      </aside>

      <main className="igloo-shell-main">
        <header className="igloo-shell-hero">
          <div>
            <div className="igloo-shell-kicker">{heroKicker}</div>
            <h2>{heroTitle}</h2>
            <p>{heroDescription}</p>
          </div>
          <div className="igloo-shell-status-bar">
            {statuses.map((status) => (
              <span key={`${status.label}-${status.tone ?? 'default'}`} className={statusClassName(status.tone)}>
                {status.label}
              </span>
            ))}
          </div>
        </header>

        {error ? <div className="igloo-shell-alert">{error}</div> : null}
        {children}
      </main>
    </div>
  );
}
