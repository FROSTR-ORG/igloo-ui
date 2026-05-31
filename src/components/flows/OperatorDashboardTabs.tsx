import * as React from 'react';

import { cn } from '../../lib/utils';

export type OperatorDashboardTab = 'signer' | 'permissions' | 'settings';

export type OperatorDashboardTabItem = {
  key: OperatorDashboardTab;
  label: string;
  icon?: React.ReactNode;
  description: string;
};

type Props = {
  tabs: OperatorDashboardTabItem[];
  activeTab: OperatorDashboardTab;
  onChangeTab: (tab: OperatorDashboardTab) => void;
};

export function OperatorDashboardTabs({ tabs, activeTab, onChangeTab }: Props) {
  return (
    <section className="rounded-2xl border border-blue-900/30 bg-slate-950/60 p-3 shadow-2xl backdrop-blur-sm">
      <div
        role="tablist"
        aria-label="Operator dashboard sections"
        className={cn(
          'flex flex-col gap-2',
          tabs.length > 1 && 'sm:flex-row sm:flex-wrap',
          tabs.length >= 3 && 'xl:flex-nowrap',
        )}
      >
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`operator-panel-${tab.key}`}
              id={`operator-tab-${tab.key}`}
              data-testid={`dashboard-tab-${tab.key}`}
              onClick={() => onChangeTab(tab.key)}
              className={cn(
                'rounded-xl border px-4 py-3 text-left transition-colors sm:min-w-0 sm:flex-1',
                active
                  ? 'border-blue-500/40 bg-blue-500/15 text-blue-100'
                  : 'border-blue-900/20 bg-transparent text-gray-400 hover:border-blue-800/40 hover:bg-blue-950/20 hover:text-blue-200',
              )}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                {tab.icon}
                {tab.label}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide opacity-80">{tab.description}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
