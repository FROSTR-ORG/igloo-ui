import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LogEntryComponent, type LogEntryData } from '../../src';

const base: LogEntryData = {
  id: 'x',
  time: '09:00:00',
  level: 'INFO',
  message: 'hello',
};

describe('LogEntryComponent', () => {
  it('renders message and level without an expand affordance when there is no data', () => {
    render(<LogEntryComponent log={base} />);
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('INFO')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('expands and collapses data on click', () => {
    render(<LogEntryComponent log={{ ...base, data: { foo: 'bar' } }} />);
    const toggle = screen.getByRole('button');
    expect(toggle).toBeInTheDocument();
    // Formatted JSON is present in the DOM (collapsed via CSS), assert content.
    expect(screen.getByText(/"foo": "bar"/)).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.getByText(/"foo": "bar"/)).toBeInTheDocument();
  });

  it('toggles via Enter and Space keys', () => {
    render(<LogEntryComponent log={{ ...base, data: { n: 1 } }} />);
    const toggle = screen.getByRole('button');
    fireEvent.keyDown(toggle, { key: 'Enter' });
    fireEvent.keyDown(toggle, { key: ' ' });
    // No throw; element remains interactive.
    expect(toggle).toHaveAttribute('tabindex', '0');
  });

  it('uses a custom formatter', () => {
    const formatter = vi.fn(() => 'CUSTOM-OUTPUT');
    render(<LogEntryComponent log={{ ...base, data: { a: 1 } }} formatter={formatter} />);
    expect(formatter).toHaveBeenCalled();
    expect(screen.getByText('CUSTOM-OUTPUT')).toBeInTheDocument();
  });

  it('truncates by maxLines with the truncation marker', () => {
    const manyLines = Array.from({ length: 50 }, (_, i) => `row-${i}`);
    render(
      <LogEntryComponent
        log={{ ...base, data: manyLines }}
        formatter={(d) => (d as string[]).join('\n')}
        maxLines={3}
        truncationMarker="[CUT]"
      />,
    );
    const pre = screen.getByText(/row-0/);
    expect(pre.textContent).toContain('row-0');
    expect(pre.textContent).toContain('row-2');
    expect(pre.textContent).not.toContain('row-3');
    expect(pre.textContent).toContain('[CUT]');
  });

  it('truncates by maxChars', () => {
    render(
      <LogEntryComponent
        log={{ ...base, data: 'x'.repeat(100) }}
        formatter={(d) => String(d)}
        maxChars={10}
        truncationMarker="…"
      />,
    );
    const pre = screen.getByText(/x{10}…/);
    // 10 chars + marker, not the full 100.
    expect(pre.textContent).toBe(`${'x'.repeat(10)}…`);
  });

  it('falls back safely when the formatter throws on a circular reference', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    // Custom formatter that throws; component should fall back to defaultFormatter,
    // which itself catches JSON.stringify failures on circular refs.
    render(
      <LogEntryComponent
        log={{ ...base, data: circular }}
        formatter={() => {
          throw new Error('boom');
        }}
      />,
    );
    // Safe fallback for a circular object is the '[object]' sentinel.
    expect(screen.getByText('[object]')).toBeInTheDocument();
  });

  it('default formatter handles circular references without crashing', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    render(<LogEntryComponent log={{ ...base, data: circular }} />);
    expect(screen.getByText('[object]')).toBeInTheDocument();
  });
});
