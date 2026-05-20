import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Button } from './button';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-igloo-primary focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-igloo-action text-white hover:bg-igloo-action-hover',
        ghost: 'text-igloo-primary hover:bg-igloo-primary/15 hover:text-igloo-text',
        destructive: 'text-igloo-error hover:bg-igloo-error/20',
        success: 'text-igloo-success hover:bg-igloo-success/20',
        outline: 'border border-igloo-border text-igloo-primary hover:bg-igloo-primary/10'
      },
      size: {
        default: 'h-8 w-8',
        sm: 'h-7 w-7',
        lg: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default'
    }
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  tooltip?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, tooltip, ...props }, ref) => (
    <Button
      variant="ghost"
      size="sm"
      className={cn(iconButtonVariants({ variant, size }), className)}
      ref={ref}
      title={tooltip}
      aria-label={tooltip}
      type="button"
      {...props}
    >
      {icon}
    </Button>
  )
);

IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
