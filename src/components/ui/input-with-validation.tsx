import * as React from 'react';

import { cn } from '../../lib/utils';
import { Input, type InputProps } from './input';

export type InputWithValidationProps = InputProps & {
  error?: string | null;
  hint?: string | null;
};

export function InputWithValidation({
  className,
  error,
  hint,
  ...props
}: InputWithValidationProps) {
  const ariaInvalid = error ? true : props['aria-invalid'];
  return (
    <div className="grid gap-2">
      <Input
        className={cn(error ? 'border-rose-500/50 focus-visible:ring-rose-500/35' : '', className)}
        {...props}
        aria-invalid={ariaInvalid}
      />
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
    </div>
  );
}
