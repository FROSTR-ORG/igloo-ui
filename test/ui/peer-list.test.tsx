import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PeerList, type PeerPolicy } from '../../src';

function makePeer(overrides: Partial<PeerPolicy> = {}): PeerPolicy {
  return {
    alias: 'peer',
    pubkey: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
    send: true,
    receive: true,
    state: 'online',
    ...overrides,
  };
}

describe('PeerList', () => {
  it('renders peers when expanded and an empty message with no peers', () => {
    render(<PeerList peers={[]} />);
    expect(screen.getByText('No peers configured')).toBeInTheDocument();
  });

  it('collapses and expands via the header (click) and reflects aria-expanded', () => {
    render(<PeerList peers={[makePeer()]} />);
    const header = screen.getByRole('button', { name: /peer list/i });
    expect(header).toHaveAttribute('aria-expanded', 'true');
    // Peer card visible while expanded.
    expect(screen.getByText(/abcdef01/)).toBeInTheDocument();

    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/abcdef01/)).toBeNull();
  });

  it('toggles collapse via Enter and Space keyboard activation', () => {
    render(<PeerList peers={[makePeer()]} />);
    const header = screen.getByRole('button', { name: /peer list/i });

    fireEvent.keyDown(header, { key: 'Enter' });
    expect(header).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(header, { key: ' ' });
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows online / sign-ready / known / total summary counts', () => {
    render(
      <PeerList
        peers={[
          makePeer({ state: 'online' }),
          makePeer({ pubkey: 'b'.repeat(64), state: 'warning', statusLabel: 'sign-ready' }),
          makePeer({ pubkey: 'c'.repeat(64), state: 'offline' }),
        ]}
      />,
    );
    expect(screen.getByText('1 online')).toBeInTheDocument();
    expect(screen.getByText('1 sign-ready')).toBeInTheDocument();
    // known = not offline => 2
    expect(screen.getByText('2 known')).toBeInTheDocument();
    expect(screen.getByText('3 total')).toBeInTheDocument();
  });

  it('renders NonceBar values reflecting available/spent capacity', () => {
    render(
      <PeerList
        peers={[makePeer({ incomingAvailable: 5, outgoingAvailable: 12, outgoingSpent: 3 })]}
      />,
    );
    // NonceBar labels In / Out / Spent each render their numeric value.
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('toggles policy controls and dispatches policy changes', () => {
    const calls: Array<[string, string, boolean]> = [];
    const peer = makePeer({ send: true, receive: false });
    render(
      <PeerList
        peers={[peer]}
        onPolicyChange={(pubkey, field, value) => calls.push([pubkey, field, value])}
      />,
    );

    // Policy controls hidden until the policy toggle is opened.
    expect(screen.queryByText('Outbound Allow')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Policy controls' }));

    const outbound = screen.getByRole('button', { name: /Outbound Allow/ });
    fireEvent.click(outbound);
    expect(calls).toContainEqual([peer.pubkey, 'send', false]);

    const inbound = screen.getByRole('button', { name: /Inbound Block/ });
    fireEvent.click(inbound);
    expect(calls).toContainEqual([peer.pubkey, 'receive', true]);
  });
});
