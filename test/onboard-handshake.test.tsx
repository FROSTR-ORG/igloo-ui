import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnboardHandshakePanel } from '../src/components/flows/create/onboard-handshake';

describe('OnboardHandshakePanel', () => {
  it('renders the provided keyset, threshold, and share label', () => {
    render(
      <OnboardHandshakePanel
        keysetName="Acme Keyset"
        thresholdLabel="2/3"
        shareLabel="Share #1"
      />,
    );
    expect(screen.getByText(/Acme Keyset \(2\/3\)/)).toBeInTheDocument();
    expect(screen.getByText(/Share #1/)).toBeInTheDocument();
  });
});
