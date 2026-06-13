import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Sparkline } from '../src/components/ui/sparkline';

afterEach(cleanup);

describe('Sparkline', () => {
  it('renders nothing for an empty series', () => {
    const { container } = render(<Sparkline values={[]} label="empty" />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders a single flat point pinned to the right edge', () => {
    const { container } = render(<Sparkline values={[5]} width={72} height={20} label="single" />);
    const polyline = container.querySelector('polyline');
    expect(polyline).not.toBeNull();
    // One point, anchored at the right edge (x = width).
    expect(polyline?.getAttribute('points')?.trim().split(' ')).toHaveLength(1);
    expect(polyline?.getAttribute('points')).toContain('72.0,');
  });

  it('plots one point per value across the width, oldest-to-newest', () => {
    const { container } = render(
      <Sparkline values={[1, 2, 3, 4]} width={90} height={20} label="series" />,
    );
    const points = container.querySelector('polyline')?.getAttribute('points')?.trim().split(' ');
    expect(points).toHaveLength(4);
    // First sample at x=0, last at x=width.
    expect(points?.[0]).toMatch(/^0\.0,/);
    expect(points?.[3]).toMatch(/^90\.0,/);
  });

  it('exposes an accessible label', () => {
    const { getByLabelText } = render(<Sparkline values={[1, 2]} label="peer nonce history" />);
    expect(getByLabelText('peer nonce history')).toBeInTheDocument();
  });
});
