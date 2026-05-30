import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DesktopAppShell } from '../src/components/flows/DesktopAppShell';

describe('DesktopAppShell', () => {
  it('renders shell metadata and dispatches navigation changes', () => {
    const onSelectTab = vi.fn();

    render(
      <DesktopAppShell
        appKicker="FROSTR V2"
        appTitle="Igloo Home"
        appDescription="Shared desktop shell"
        tabs={[
          { key: 'profiles', label: 'Profiles', detail: 'Inventory' },
          { key: 'signer', label: 'Signer', detail: 'Runtime' },
        ]}
        activeTab="profiles"
        onSelectTab={onSelectTab}
        paths={[{ label: 'Profiles', value: '/tmp/profiles' }]}
        heroKicker="Desktop"
        heroTitle="Managed profiles"
        heroDescription="Vault-backed shares."
        statuses={[
          { label: 'Signer stopped' },
          { label: 'Idle', tone: 'busy' },
        ]}
      >
        <div>content</div>
      </DesktopAppShell>,
    );

    // jsdom 28 joins the label/detail elements without a separator in the
    // accessible name ("SignerRuntime"), so match whitespace-flexibly.
    fireEvent.click(screen.getByRole('button', { name: /signer\s*runtime/i }));
    expect(onSelectTab).toHaveBeenCalledWith('signer');
    expect(screen.getByText('Managed profiles')).toBeInTheDocument();
    expect(screen.getByText('/tmp/profiles')).toBeInTheDocument();
  });
});
