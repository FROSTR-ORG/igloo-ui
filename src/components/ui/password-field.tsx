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
    return (
      <div className={cn('igloo-password-field', shellClassName)}>
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={className}
          {...passwordManagerOptOutProps}
          {...props}
        />
        <button
          type="button"
          className="igloo-password-field-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
    );
  },
);
PasswordField.displayName = 'PasswordField';
