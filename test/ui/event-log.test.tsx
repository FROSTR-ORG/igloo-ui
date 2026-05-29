import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EventLog, type LogEntry } from '../../src';

const entries: LogEntry[] = [
  { id: '1', time: '09:00:00', level: 'INFO', message: 'started' },
  { id: '2', time: '09:00:01', level: 'SIGN', message: 'signed', data: { sig: 'deadbeef' } },
];

describe('EventLog', () => {
  it('starts collapsed and shows the event count', () => {
    render(<EventLog entries={entries} />);
    expect(screen.getByText('2 events')).toBeInTheDocument();
    // Collapsed: entry messages not rendered.
    expect(screen.queryByText('started')).toBeNull();
  });

  it('expands on header click to reveal entries', () => {
    render(<EventLog entries={entries} />);
    fireEvent.click(screen.getByRole('button', { name: /event log/i }));
    expect(screen.getByText('started')).toBeInTheDocument();
    expect(screen.getByText('signed')).toBeInTheDocument();
  });

  it('shows an empty state when expanded with no entries', () => {
    render(<EventLog entries={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /event log/i }));
    expect(screen.getByText('No events yet')).toBeInTheDocument();
  });

  it('renders a clear control only when there are entries and onClear is provided', () => {
    const onClear = vi.fn();
    const { rerender } = render(<EventLog entries={entries} onClear={onClear} />);
    const clearBtn = screen.getByRole('button', { name: 'Clear log' });
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);

    rerender(<EventLog entries={[]} onClear={onClear} />);
    expect(screen.queryByRole('button', { name: 'Clear log' })).toBeNull();
  });
});
