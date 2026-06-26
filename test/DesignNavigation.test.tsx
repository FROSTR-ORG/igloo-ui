import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AppHeader, DashboardHeaderActions, PageBackLink, PageLayout } from '../src';

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

  it('renders the Paper AuthActions dashboard header variant', () => {
    const onDashboard = vi.fn();
    const onPermissions = vi.fn();
    const onSettings = vi.fn();

    render(
      <AppHeader
        mode="dashboard"
        logoSrc="/logo.png"
        brandAction={{
          ariaLabel: 'Dashboard',
          testId: 'dashboard-home',
          onClick: onDashboard,
        }}
        actions={
          <DashboardHeaderActions
            dashboard={{
              label: 'Dashboard',
              onClick: onDashboard,
              testId: 'dashboard-action',
            }}
            permissions={{
              label: 'Permissions',
              active: true,
              onClick: onPermissions,
              testId: 'dashboard-permissions',
            }}
            settings={{ label: 'Settings', onClick: onSettings, testId: 'dashboard-settings' }}
          />
        }
      />,
    );

    expect(screen.queryByText('Threshold Signing for Nostr')).not.toBeInTheDocument();
    expect(screen.getByTestId('dashboard-home')).toHaveAttribute('aria-label', 'Dashboard');
    expect(screen.getByTestId('dashboard-action')).toHaveTextContent('Dashboard');
    expect(screen.queryByRole('button', { name: 'Recover' })).not.toBeInTheDocument();
    expect(screen.getByTestId('dashboard-permissions')).toHaveTextContent('Permissions');
    expect(screen.getByTestId('dashboard-permissions')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('dashboard-settings')).toHaveAttribute('aria-label', 'Settings');

    fireEvent.click(screen.getByTestId('dashboard-home'));
    fireEvent.click(screen.getByTestId('dashboard-action'));
    fireEvent.click(screen.getByTestId('dashboard-permissions'));
    fireEvent.click(screen.getByTestId('dashboard-settings'));

    expect(onDashboard).toHaveBeenCalledTimes(2);
    expect(onPermissions).toHaveBeenCalledTimes(1);
    expect(onSettings).toHaveBeenCalledTimes(1);
  });

  it('renders a screen-level back link', () => {
    const onBack = vi.fn();

    render(<PageBackLink label="Back to Welcome" onBack={onBack} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back to Welcome' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders the welcome page layout without the default padded shell', () => {
    const { container } = render(
      <PageLayout surface="welcome" maxWidth="max-w-none">
        <main>Welcome</main>
      </PageLayout>,
    );

    expect(container.firstElementChild).toHaveClass('p-0');
    expect(container.firstElementChild).not.toHaveClass('p-3');
  });
});
