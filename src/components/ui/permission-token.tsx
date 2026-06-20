import * as React from 'react';

import { cn } from '../../lib/utils';

export const PERMISSION_METHODS = ['sign', 'ecdh', 'ping', 'onboard'] as const;

export type PermissionMethod = (typeof PERMISSION_METHODS)[number];
export type PermissionTokenVariant = 'policy' | 'distribution';
export type PermissionTokenInactiveTone = 'method' | 'neutral';

const permissionLabels: Record<PermissionMethod, string> = {
  sign: 'SIGN',
  ecdh: 'ECDH',
  ping: 'PING',
  onboard: 'ONBOARD',
};

export function normalizePermissionMethod(value: string): PermissionMethod | null {
  const normalized = value.trim().toLowerCase();
  return (PERMISSION_METHODS as readonly string[]).includes(normalized)
    ? (normalized as PermissionMethod)
    : null;
}

type PermissionTokenCommonProps = {
  method: PermissionMethod;
  active?: boolean;
  variant?: PermissionTokenVariant;
  inactiveTone?: PermissionTokenInactiveTone;
  className?: string;
  label?: string;
  ariaLabel?: string;
  title?: string;
};

export type PermissionTokenProps = PermissionTokenCommonProps & {
  as?: 'button' | 'span';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export function PermissionToken({
  method,
  active = true,
  variant = 'policy',
  inactiveTone = 'method',
  className,
  label = permissionLabels[method],
  ariaLabel,
  title,
  as,
  disabled,
  onClick,
}: PermissionTokenProps) {
  const sharedProps = {
    className: cn('igloo-permission-token', className),
    'data-method': method,
    'data-state': active ? 'active' : 'inactive',
    'data-variant': variant,
    'data-inactive-tone': inactiveTone,
    title: title ?? ariaLabel,
  } as const;

  if (as === 'span' || (!onClick && as !== 'button')) {
    return (
      <span aria-label={ariaLabel} {...sharedProps}>
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      {...sharedProps}
    >
      {label}
    </button>
  );
}

export type PermissionTokenGroupProps = {
  methods?: readonly PermissionMethod[];
  activeMethods?: readonly PermissionMethod[];
  variant?: PermissionTokenVariant;
  inactiveTone?: PermissionTokenInactiveTone;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  onToggle?: (method: PermissionMethod, nextActive: boolean) => void;
  getAriaLabel?: (method: PermissionMethod, active: boolean) => string;
};

export function PermissionTokenGroup({
  methods = PERMISSION_METHODS,
  activeMethods = PERMISSION_METHODS,
  variant = 'policy',
  inactiveTone = 'method',
  className,
  ariaLabel,
  disabled,
  onToggle,
  getAriaLabel,
}: PermissionTokenGroupProps) {
  const activeSet = React.useMemo(() => new Set(activeMethods), [activeMethods]);

  return (
    <div className={cn('igloo-permission-token-group', className)} aria-label={ariaLabel}>
      {methods.map((method) => {
        const active = activeSet.has(method);
        return (
          <PermissionToken
            key={method}
            method={method}
            active={active}
            variant={variant}
            inactiveTone={inactiveTone}
            as={onToggle ? 'button' : 'span'}
            disabled={disabled}
            ariaLabel={getAriaLabel?.(method, active)}
            onClick={onToggle ? () => onToggle(method, !active) : undefined}
          />
        );
      })}
    </div>
  );
}
