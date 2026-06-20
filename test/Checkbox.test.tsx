import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../src/components/ui/checkbox';

describe('Checkbox', () => {
  it('renders igloo-toggle-row markup with label + description and fires onCheckedChange', () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox checked={false} onCheckedChange={onCheckedChange} label="Remember state" description="Persist things." data-testid="cb" />,
    );
    const input = screen.getByTestId('cb') as HTMLInputElement;
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBe(false);
    expect(screen.getByText('Remember state')).toBeInTheDocument();
    expect(screen.getByText('Persist things.')).toBeInTheDocument();
    expect(input.closest('label')?.className).toContain('igloo-toggle-row');
    fireEvent.click(input);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
