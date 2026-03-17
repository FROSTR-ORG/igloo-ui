import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[0.82rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:h-[0.95rem] [&_svg]:w-[0.95rem] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-blue-100 hover:bg-blue-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
        secondary: 'bg-gray-800/50 text-blue-200 hover:bg-gray-700/50 border border-blue-900/30',
        ghost: 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/30',
        outline: 'border border-blue-900/30 bg-transparent text-blue-300 hover:bg-blue-900/20 hover:text-blue-200',
        link: 'text-blue-400 underline-offset-4 hover:underline hover:text-blue-300'
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
