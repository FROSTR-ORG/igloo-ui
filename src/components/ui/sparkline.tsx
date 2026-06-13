import * as React from 'react';

import { cn } from '../../lib/utils';

export type SparklineProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** Series values, oldest first. */
  values: number[];
  width?: number;
  height?: number;
  /** Accessible label describing what the series represents. */
  label?: string;
};

/**
 * Minimal inline-SVG sparkline: a single polyline over a numeric series in a
 * fixed-width slot (so it column-aligns in repeated rows). Renders nothing for
 * an empty series and a flat baseline for a single point. Purely presentational
 * — no axes, ticks, or interactivity.
 */
export function Sparkline({
  values,
  width = 72,
  height = 20,
  label = 'history',
  className,
  ...props
}: SparklineProps) {
  if (values.length === 0) {
    return null;
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  // A single point has no horizontal extent; pin it to the right edge.
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  const pad = 1;
  const usableHeight = height - pad * 2;

  const points = values
    .map((value, index) => {
      const x = values.length > 1 ? index * step : width;
      const y = pad + (1 - (value - min) / span) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <span
      className={cn('inline-flex flex-shrink-0 items-center', className)}
      style={{ width, height }}
      {...props}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
