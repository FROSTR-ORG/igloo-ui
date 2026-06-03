import * as React from 'react';

import { cn } from '../../lib/utils';

export type BackdropProps = {
  onDismiss: () => void;
  className?: string;
};

/**
 * A real, keyboard-focusable dismiss surface rendered behind a dialog. Using a
 * `<button>` (rather than a `<div onClick>`) keeps the affordance reachable by
 * keyboard and assistive tech.
 */
export function Backdrop({ onDismiss, className }: BackdropProps) {
  return (
    <button
      type="button"
      aria-label="Dismiss"
      onClick={onDismiss}
      className={cn(
        'absolute inset-0 z-0 h-full w-full cursor-default bg-black/65 backdrop-blur-sm',
        className,
      )}
    />
  );
}
