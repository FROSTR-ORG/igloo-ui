import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-igloo-border bg-igloo-panel px-3 py-2 text-sm text-igloo-text placeholder:text-igloo-subtle transition-[background-color,border-color,box-shadow,color,opacity] duration-150 ease-out hover:border-igloo-primary/40 focus-visible:border-igloo-primary focus-visible:bg-igloo-panel-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-igloo-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-rose-500/50 aria-[invalid=true]:focus-visible:ring-rose-500/35',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
