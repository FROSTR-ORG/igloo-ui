import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  /** override the row class (defaults to igloo-toggle-row) */
  rowClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onCheckedChange, label, description, rowClassName, ...inputProps }, ref) => (
    <label className={cn('igloo-toggle-row', rowClassName)}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        {...inputProps}
      />
      <span>
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
    </label>
  ),
);

Checkbox.displayName = 'Checkbox';
