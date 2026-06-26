import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[0.82rem] font-medium transition-[background-color,border-color,box-shadow,color,opacity,transform] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-igloo-primary focus-visible:ring-offset-2 focus-visible:ring-offset-igloo-page disabled:pointer-events-none disabled:scale-100 disabled:opacity-50 data-[loading=true]:cursor-wait data-[loading=true]:opacity-85 data-[loading=true]:active:scale-100 data-[static=true]:active:scale-100 [&_svg]:pointer-events-none [&_svg]:h-[0.95rem] [&_svg]:w-[0.95rem] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-igloo-action text-white hover:bg-igloo-action-hover',
        destructive: 'bg-igloo-error text-white hover:bg-igloo-error/85',
        success: 'bg-igloo-success text-white hover:bg-igloo-success/85',
        secondary: 'border border-igloo-border bg-igloo-panel text-igloo-text hover:bg-igloo-panel-strong',
        ghost: 'text-igloo-primary hover:bg-igloo-primary/15 hover:text-igloo-text',
        outline: 'border border-igloo-border bg-transparent text-igloo-primary hover:bg-igloo-primary/10 hover:text-igloo-text',
        link: 'text-igloo-primary underline-offset-4 hover:underline hover:text-igloo-text'
      },
      size: {
        default: 'h-9 px-3.5 py-1.5',
        sm: 'h-8 rounded-md px-3 text-[0.76rem]',
        lg: 'h-10 rounded-md px-5 text-sm',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  static?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      children,
      disabled,
      loading = false,
      loadingLabel,
      static: isStatic = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const stabilizesLoadingLabel = !asChild && Boolean(loadingLabel);
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={asChild ? disabled : disabled || loading}
        aria-busy={loading || undefined}
        data-loading={loading ? 'true' : undefined}
        data-static={isStatic ? 'true' : undefined}
        {...props}
      >
        {loading && !asChild ? <Loader2 className="igloo-spin" aria-hidden="true" /> : null}
        {stabilizesLoadingLabel ? (
          <span className="grid">
            <span
              className={cn('col-start-1 row-start-1 inline-flex items-center justify-center gap-2', loading && 'invisible')}
              aria-hidden={loading ? true : undefined}
              data-button-label="idle"
            >
              {children}
            </span>
            <span
              className={cn('col-start-1 row-start-1 inline-flex items-center justify-center gap-2', !loading && 'invisible')}
              aria-hidden={!loading ? true : undefined}
              data-button-label="loading"
            >
              {loadingLabel}
            </span>
          </span>
        ) : loading && loadingLabel ? (
          loadingLabel
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
