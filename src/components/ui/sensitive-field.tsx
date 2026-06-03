import * as React from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Button } from './button';

export interface SensitiveFieldProps {
  /** The secret value to mask/reveal. */
  value: string;
  /** Optional human label used in the visible label and a11y names. */
  label?: string;
  /** Label for the reveal button (when masked). */
  revealLabel?: string;
  /** Label for the hide button (when revealed). */
  hideLabel?: string;
  /** Whether a copy control is shown. */
  copyable?: boolean;
  /** Label for the copy button. */
  copyLabel?: string;
  /** Auto re-mask delay in ms after revealing. 0 disables. */
  autoMaskMs?: number;
  /** Whether the value starts revealed. */
  initiallyRevealed?: boolean;
  /** Placeholder text shown while masked. */
  maskPlaceholder?: string;
  /** Optional className applied to the root element. */
  className?: string;
  /** Called when the value transitions to revealed. */
  onReveal?: () => void;
  /** Called after a successful copy. */
  onCopy?: () => void;
}

async function copyToClipboard(value: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
  }
}

const SensitiveField = React.forwardRef<HTMLDivElement, SensitiveFieldProps>(
  (
    {
      value,
      label,
      revealLabel = 'Reveal',
      hideLabel = 'Hide',
      copyable = true,
      copyLabel = 'Copy',
      autoMaskMs = 30000,
      initiallyRevealed = false,
      maskPlaceholder = '••••••••••',
      className,
      onReveal,
      onCopy,
    },
    ref,
  ) => {
    const [revealed, setRevealed] = React.useState(initiallyRevealed);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = React.useCallback(() => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    // Re-mask timer; restarts whenever reveal state or delay changes.
    React.useEffect(() => {
      if (revealed && autoMaskMs > 0) {
        timerRef.current = setTimeout(() => {
          setRevealed(false);
          timerRef.current = null;
        }, autoMaskMs);
      }
      return clearTimer;
    }, [revealed, autoMaskMs, clearTimer]);

    // Clean up any pending timer on unmount.
    React.useEffect(() => clearTimer, [clearTimer]);

    const labelText = label ?? 'sensitive value';

    function toggle() {
      setRevealed((prev) => {
        const next = !prev;
        if (next) onReveal?.();
        return next;
      });
    }

    async function handleCopy() {
      await copyToClipboard(value);
      onCopy?.();
    }

    return (
      <div ref={ref} className={cn('igloo-sensitive-field igloo-stack', className)}>
        {label ? <span className="igloo-sensitive-label">{label}</span> : null}
        <div className="igloo-sensitive-row flex items-center gap-2">
          {revealed ? (
            <code
              role="region"
              aria-label={`Revealed ${labelText}`}
              className="igloo-sensitive-value font-mono text-sm break-all text-blue-100"
            >
              {value}
            </code>
          ) : (
            <span aria-hidden="true" className="igloo-sensitive-mask font-mono text-sm text-gray-500">
              {maskPlaceholder}
            </span>
          )}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={toggle}
            aria-expanded={revealed}
            aria-label={`${revealed ? hideLabel : revealLabel} ${labelText}`}
          >
            {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            {revealed ? hideLabel : revealLabel}
          </Button>
          {copyable ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              aria-label={`${copyLabel} ${labelText}`}
            >
              <Copy aria-hidden="true" />
              {copyLabel}
            </Button>
          ) : null}
        </div>
      </div>
    );
  },
);
SensitiveField.displayName = 'SensitiveField';

export { SensitiveField };
