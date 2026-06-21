import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';

import { WelcomeEntryHero, WelcomeReturningHero } from '../src/components/flows/HostShell';
import { CRITICAL_E2E_TEST_IDS } from '../src/lib/e2e-test-ids';

afterEach(() => {
  cleanup();
});

const noop = () => {};

test('WelcomeEntryHero renders host productLabel, tagline, primary + secondary actions', () => {
  render(
    <WelcomeEntryHero
      productLabel="Igloo Home"
      tagline="Desktop co-signer."
      primaryAction={{ heading: 'Create / Rotate Keyset', description: 'Generate or rotate.', buttonLabel: 'Start', onAction: noop, testId: 'entry-primary' }}
      secondaryActions={[{ id: 'load', label: 'Load Profile', onAction: noop }]}
    />,
  );
  expect(screen.getByRole('heading', { name: 'Igloo Home' })).toBeInTheDocument();
  expect(screen.getByText('Desktop co-signer.')).toBeInTheDocument();
  expect(screen.getByTestId('entry-primary')).toHaveTextContent('Start');
  expect(screen.getByRole('button', { name: 'Load Profile' })).toBeInTheDocument();
});

test('WelcomeReturningHero hides ⋮ menu items the host does not support', () => {
  render(
    <WelcomeReturningHero
      productLabel="Igloo"
      layout="single"
      profiles={[{ id: 'p1', label: 'Dev', thresholdLabel: '2/3', memberLabel: '#1', publicKeyLabel: 'npub…', canRotate: false, canRecover: false, canDelete: true }]}
      onUnlock={noop}
      onRotate={noop}
      onDelete={noop}
      secondaryActions={[{ id: 'onboard', label: 'Onboard New Device', onAction: noop }]}
    />,
  );
  expect(screen.getByRole('button', { name: 'Onboard New Device' })).toBeInTheDocument();
  // Open the ⋮ menu before asserting menu items
  fireEvent.click(screen.getByTestId(CRITICAL_E2E_TEST_IDS.welcomeProfileMenuTrigger));
  expect(screen.queryByRole('menuitem', { name: 'Rotate' })).not.toBeInTheDocument();
  expect(screen.queryByRole('menuitem', { name: 'Recover' })).not.toBeInTheDocument();
});

test('WelcomeReturningHero meta row shows only publicKeyLabel when thresholdLabel and memberLabel are empty', () => {
  render(
    <WelcomeReturningHero
      productLabel="Igloo Home"
      layout="single"
      profiles={[{ id: 'abc12345', label: 'My Desktop Key', thresholdLabel: '', memberLabel: '', publicKeyLabel: 'abc12345', canRotate: true, canRecover: true, canDelete: true }]}
      onUnlock={noop}
      onRotate={noop}
      onDelete={noop}
      secondaryActions={[]}
    />,
  );
  const metaRow = document.querySelector('.igloo-welcome-profile-meta');
  expect(metaRow).not.toBeNull();
  const text = metaRow!.textContent ?? '';
  // Should contain the public key label
  expect(text).toContain('abc12345');
  // Should NOT start with a separator dot
  expect(text.trimStart()).not.toMatch(/^\./);
  // Should have no leading or doubled separator dots
  expect(text).not.toContain('..');
  // Should not render empty values before/after the key label
  expect(text.trim()).toBe('abc12345');
});
