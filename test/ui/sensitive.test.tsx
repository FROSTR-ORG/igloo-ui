import { fireEvent, render, screen, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SensitiveField, SensitiveTextarea } from '../../src';

describe('SensitiveField', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('masks the value by default and does not render the plaintext', () => {
    render(<SensitiveField value="super-secret" label="Share" autoMaskMs={0} />);
    expect(screen.queryByText('super-secret')).toBeNull();
    // The masked placeholder is aria-hidden, value is not exposed.
    expect(screen.getByRole('button', { name: /reveal share/i })).toBeInTheDocument();
  });

  it('reveals on toggle and exposes the value in a labeled region', () => {
    const onReveal = vi.fn();
    render(<SensitiveField value="super-secret" label="Share" autoMaskMs={0} onReveal={onReveal} />);

    fireEvent.click(screen.getByRole('button', { name: /reveal share/i }));

    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(screen.getByText('super-secret')).toBeInTheDocument();
    const region = screen.getByRole('region', { name: /revealed share/i });
    expect(region).toHaveTextContent('super-secret');
    // The reveal button now offers to hide and reports expanded state.
    const hideBtn = screen.getByRole('button', { name: /hide share/i });
    expect(hideBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('auto re-masks after autoMaskMs using fake timers', () => {
    vi.useFakeTimers();
    render(<SensitiveField value="abc123" label="Share" autoMaskMs={5000} />);

    fireEvent.click(screen.getByRole('button', { name: /reveal share/i }));
    expect(screen.getByText('abc123')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('abc123')).toBeNull();
    expect(screen.getByRole('button', { name: /reveal share/i })).toBeInTheDocument();
  });

  it('copies without revealing the value', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const onCopy = vi.fn();

    render(<SensitiveField value="copy-me" label="Share" autoMaskMs={0} onCopy={onCopy} />);

    // Still masked.
    expect(screen.queryByText('copy-me')).toBeNull();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy share/i }));
    });

    expect(writeText).toHaveBeenCalledWith('copy-me');
    expect(onCopy).toHaveBeenCalledTimes(1);
    // Copying did not reveal the value.
    expect(screen.queryByText('copy-me')).toBeNull();
  });

  it('omits the copy control when copyable is false', () => {
    render(<SensitiveField value="x" label="Share" copyable={false} autoMaskMs={0} />);
    expect(screen.queryByRole('button', { name: /copy/i })).toBeNull();
  });
});

describe('SensitiveTextarea', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('masks by default and reveals a readonly textarea on toggle', () => {
    render(<SensitiveTextarea value={'line1\nline2'} label="Payload" autoMaskMs={0} />);
    // Masked: no textbox rendered yet.
    expect(screen.queryByRole('textbox')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /reveal payload/i }));

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute('readonly');
    expect(textarea.value).toBe('line1\nline2');
    expect(screen.getByRole('region', { name: /revealed payload/i })).toBeInTheDocument();
  });

  it('auto re-masks after the delay', () => {
    vi.useFakeTimers();
    render(<SensitiveTextarea value="hidden" label="Payload" autoMaskMs={3000} />);

    fireEvent.click(screen.getByRole('button', { name: /reveal payload/i }));
    expect(screen.getByDisplayValue('hidden')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByDisplayValue('hidden')).toBeNull();
  });

  it('copies without revealing', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<SensitiveTextarea value="secret-text" label="Payload" autoMaskMs={0} />);
    expect(screen.queryByDisplayValue('secret-text')).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy payload/i }));
    });

    expect(writeText).toHaveBeenCalledWith('secret-text');
    expect(screen.queryByDisplayValue('secret-text')).toBeNull();
  });
});
