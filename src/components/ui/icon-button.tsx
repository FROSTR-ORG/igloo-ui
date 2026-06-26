import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Button } from './button';
import { Tooltip, type TooltipProps } from './tooltip';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-[background-color,border-color,box-shadow,color,opacity,transform] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-igloo-primary focus-visible:ring-offset-0 disabled:pointer-events-none disabled:scale-100 disabled:opacity-50',
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
        default: 'h-10 w-10',
        sm: 'h-10 w-10 [&_svg]:h-3.5 [&_svg]:w-3.5',
        lg: 'h-11 w-11'
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
  tooltipPlacement?: TooltipProps['placement'];
  loading?: boolean;
  loadingLabel?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      tooltip,
      tooltipPlacement = 'bottom',
      loading = false,
      loadingLabel,
      disabled,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const accessibleLabel = loading ? loadingLabel ?? ariaLabel ?? tooltip : ariaLabel ?? tooltip;
    const tooltipContent = loading ? loadingLabel ?? tooltip : tooltip;
    const button = (
      <Button
        variant="ghost"
        size="sm"
        className={cn(iconButtonVariants({ variant, size }), className)}
        ref={ref}
        aria-label={accessibleLabel}
        aria-busy={loading || undefined}
        data-loading={loading ? 'true' : undefined}
        disabled={disabled || loading}
        type="button"
        {...props}
      >
        {loading ? <Loader2 className="igloo-spin" aria-hidden="true" /> : icon}
      </Button>
    );

    if (!tooltipContent) {
      return button;
    }

    return (
      <Tooltip
        content={tooltipContent}
        placement={tooltipPlacement}
        tooltipClassName="max-w-[14rem]"
        trigger={button}
      />
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
