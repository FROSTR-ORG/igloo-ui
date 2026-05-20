import { cn } from '../../lib/utils';

export type StatusState = 'online' | 'warning' | 'offline' | 'idle';

export function StatusDot({
  state,
  className,
  size = 'default'
}: {
  state: StatusState;
  className?: string;
  size?: 'sm' | 'default';
}) {
  const sizeClass = size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5';
  return (
    <span
      className={cn(
        'inline-flex rounded-full',
        sizeClass,
        state === 'online' && 'bg-igloo-success',
        state === 'warning' && 'bg-igloo-warning',
        state === 'offline' && 'bg-igloo-error',
        state === 'idle' && 'bg-igloo-subtle',
        className
      )}
    />
  );
}

export function StatusBadge({
  state,
  label,
  className
}: {
  state: StatusState;
  label?: string;
  className?: string;
}) {
  const stateLabel = label ?? state;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        state === 'online' && 'bg-igloo-success/20 text-igloo-success ring-igloo-success/30',
        state === 'warning' && 'bg-igloo-warning/20 text-igloo-warning ring-igloo-warning/30',
        state === 'offline' && 'bg-igloo-error/20 text-igloo-error ring-igloo-error/30',
        state === 'idle' && 'bg-igloo-subtle/20 text-igloo-muted ring-igloo-subtle/30',
        className
      )}
    >
      <StatusDot state={state} size="sm" />
      <span className="capitalize">{stateLabel}</span>
    </span>
  );
}
