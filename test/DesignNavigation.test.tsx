import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AppHeader, PageBackLink } from '../src';

describe('design navigation primitives', () => {
  it('renders the welcome header links', () => {
    render(<AppHeader mode="welcome" />);

    expect(screen.getByText('Igloo')).toHaveClass('text-igloo-primary');
    expect(screen.getByText('Threshold Signing for Nostr')).toHaveClass('text-igloo-subtle');
    expect(screen.getByRole('link', { name: 'Website' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Docs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  });

  it('renders task, profile, and dashboard header modes without generic right content', () => {
    const { rerender } = render(<AppHeader mode="task" taskLabel="Create" />);

    expect(screen.getByText('Create')).toHaveClass('font-sharetech');

    rerender(<AppHeader mode="profile" profileName="My Signing Key" />);
    expect(screen.getByText('My Signing Key')).toHaveClass('text-igloo-muted');

    rerender(<AppHeader mode="dashboard" actions={<button type="button">Lock</button>} />);
    expect(screen.getByRole('button', { name: 'Lock' })).toBeInTheDocument();
  });

  it('renders a screen-level back link', () => {
    const onBack = vi.fn();

    render(<PageBackLink label="Back to Welcome" onBack={onBack} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back to Welcome' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
