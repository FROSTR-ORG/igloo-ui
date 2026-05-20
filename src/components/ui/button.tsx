import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[0.82rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-igloo-primary focus-visible:ring-offset-2 focus-visible:ring-offset-igloo-page disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:h-[0.95rem] [&_svg]:w-[0.95rem] [&_svg]:shrink-0',
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
        sm: 'h-7.5 rounded-md px-2.5 text-[0.74rem]',
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
