import * as React from 'react';

import { cn } from '../../lib/utils';

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const value = React.useContext(TabsContext);
  if (!value) {
    throw new Error('Tabs components must be rendered within <Tabs>');
  }
  return value;
}

export type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

export function Tabs({ value, defaultValue, onValueChange, className, children }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
  const currentValue = value ?? internalValue;

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      <div className={cn('grid gap-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-2xl border border-slate-700/40 bg-slate-950/35 p-1.5',
        className,
      )}
      {...props}
    />
  );
}

export type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export function TabsTrigger({ className, value, onClick, ...props }: TabsTriggerProps) {
  const context = useTabsContext();
  const active = context.value === value;

  return (
    <button
      type="button"
      data-state={active ? 'active' : 'inactive'}
      className={cn(
        'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-orange-500/15 text-orange-100'
          : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100',
        className,
      )}
      onClick={(event) => {
        context.setValue(value);
        onClick?.(event);
      }}
      {...props}
    />
  );
}

export type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function TabsContent({ className, value, ...props }: TabsContentProps) {
  const context = useTabsContext();
  if (context.value !== value) return null;
  return <div className={cn('grid gap-4', className)} {...props} />;
}
