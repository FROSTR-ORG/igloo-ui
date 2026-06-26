import { fireEvent, render, screen, act } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Dialog, ConfirmDialog } from '../../src';

/**
 * Dialog focus management defers via requestAnimationFrame. Flush it with fake
 * timers (the component falls back to setTimeout when rAF is unavailable, and
 * jsdom's rAF is timer-backed) so initial-focus assertions are deterministic.
 */
function flushRaf() {
  act(() => {
    vi.advanceTimersByTime(50);
  });
}

describe('Dialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.style.overflow = '';
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(
      <Dialog open onClose={() => {}} title="T">
        <button type="button">A</button>
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Dialog open={false} onClose={() => {}} title="T">
        <button type="button">A</button>
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('renders above sidebar overlays', () => {
    render(
      <Dialog open onClose={() => {}} title="T">
        <button type="button">A</button>
      </Dialog>,
    );

    expect(screen.getByRole('dialog').parentElement).toHaveClass('z-[80]');
  });

  it('moves focus into the dialog on open (first tabbable, else the panel)', () => {
    render(
      <Dialog open onClose={() => {}} title="T">
        <button type="button">First</button>
        <button type="button">Second</button>
      </Dialog>,
    );
    flushRaf();
    const panel = screen.getByRole('dialog');
    const first = screen.getByRole('button', { name: 'First' });
    // In a real browser the first tabbable receives focus. jsdom has no layout,
    // so getTabbableElements' visibility heuristic can fall back to focusing the
    // panel itself; either way focus is trapped inside the dialog.
    const active = document.activeElement;
    expect(active === first || active === panel).toBe(true);
    expect(panel.contains(active)).toBe(true);
  });

  it('honors initialFocusRef', () => {
    function Harness() {
      const ref = React.useRef<HTMLButtonElement>(null);
      return (
        <Dialog open onClose={() => {}} title="T" initialFocusRef={ref}>
          <button type="button">First</button>
          <button type="button" ref={ref}>
            Target
          </button>
        </Dialog>
      );
    }
    render(<Harness />);
    flushRaf();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Target' }));
  });

  it('restores focus to the previously focused element on close', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'opener';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { rerender } = render(
      <Dialog open onClose={() => {}} title="T">
        <button type="button">Inside</button>
      </Dialog>,
    );
    flushRaf();
    // Focus moved into the dialog (exact target depends on jsdom layout).
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);

    rerender(
      <Dialog open={false} onClose={() => {}} title="T">
        <button type="button">Inside</button>
      </Dialog>,
    );
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('closes on Escape via the document-level stack', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="T">
        <button type="button">A</button>
      </Dialog>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on Escape when preventDismissOnEscape is set', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="T" preventDismissOnEscape>
        <button type="button">A</button>
      </Dialog>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Escape only closes the topmost dialog when nested', () => {
    const closeOuter = vi.fn();
    const closeInner = vi.fn();
    const { rerender } = render(
      <>
        <Dialog open onClose={closeOuter} title="Outer">
          <button type="button">outer</button>
        </Dialog>
        <Dialog open onClose={closeInner} title="Inner">
          <button type="button">inner</button>
        </Dialog>
      </>,
    );

    // First Escape closes only the inner (topmost) dialog.
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeInner).toHaveBeenCalledTimes(1);
    expect(closeOuter).not.toHaveBeenCalled();

    // Simulate the inner dialog closing in response.
    rerender(
      <>
        <Dialog open onClose={closeOuter} title="Outer">
          <button type="button">outer</button>
        </Dialog>
        <Dialog open={false} onClose={closeInner} title="Inner">
          <button type="button">inner</button>
        </Dialog>
      </>,
    );

    // Next Escape now reaches the outer dialog.
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeOuter).toHaveBeenCalledTimes(1);
  });

  it('dismisses on backdrop click unless prevented', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Dialog open onClose={onClose} title="T">
        <button type="button">A</button>
      </Dialog>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    rerender(
      <Dialog open onClose={onClose} title="T" preventDismissOnBackdrop>
        <button type="button">A</button>
      </Dialog>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('ConfirmDialog', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('gives the dialog an accessible name referencing the styled heading', () => {
    render(
      <ConfirmDialog
        open
        title="Delete profile?"
        message="Cannot be undone."
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    // role=dialog is named by the h3 via aria-labelledby (the PR38 a11y fix).
    expect(screen.getByRole('dialog', { name: 'Delete profile?' })).toBeInTheDocument();
  });

  it('invokes onConfirm and onCancel from the respective buttons', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Proceed?"
        message="Sure?"
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
