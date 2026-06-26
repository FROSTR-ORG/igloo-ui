import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '../../lib/utils';
import { passwordManagerOptOutProps } from '../../lib/password-manager';

export interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Optional extra class on the shell wrapper. */
  shellClassName?: string;
}

/**
 * Password input with a functional show/hide reveal toggle. Mirrors the
 * `.igloo-create-input-shell` look so it drops into the existing flow forms.
 */
export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, shellClassName, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true';

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const focusInputFromShell = (event: React.SyntheticEvent<HTMLDivElement>) => {
      if (props.disabled) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('button,input,textarea,select,a')) return;
      event.preventDefault();
      inputRef.current?.focus();
    };

    return (
      <div
        className={cn('igloo-password-field', shellClassName)}
        data-invalid={invalid ? 'true' : undefined}
        onMouseDown={focusInputFromShell}
        onPointerDown={focusInputFromShell}
      >
        <input
          ref={inputRef}
          type={visible ? 'text' : 'password'}
          className={cn('igloo-password-field-control', className)}
          {...passwordManagerOptOutProps}
          {...props}
        />
        <button
          type="button"
          className="igloo-password-field-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          disabled={props.disabled}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
    );
  },
);
PasswordField.displayName = 'PasswordField';
