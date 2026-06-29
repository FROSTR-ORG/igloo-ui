import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  DashboardConditionBanner,
  DashboardLoadFailedScreen,
  DashboardLoadingScreen,
  deriveDashboardState,
  type DashboardState,
} from '../src';

type StatusInput = Parameters<typeof deriveDashboardState>[0]['status'];

// Minimal runtime-status builder; defaults to a healthy, sign-ready runtime with
// one connected relay and one online signing peer. Override per assertion.
function status(overrides: Partial<NonNullable<StatusInput>> = {}): NonNullable<StatusInput> {
  return {
    status: { device_id: 'd', pending_ops: 0, last_active: 0, known_peers: 1, request_seq: 1 },
    metadata: { device_id: 'd', member_idx: 1, share_public_key: 's', group_public_key: 'g', peers: ['p'] },
    readiness: {
      runtime_ready: true,
      restore_complete: true,
      sign_ready: true,
      ecdh_ready: true,
      threshold: 2,
      signing_peer_count: 1,
      ecdh_peer_count: 1,
      last_refresh_at: 0,
      degraded_reasons: [],
    },
    peers: [
      {
        idx: 2,
        pubkey: 'p',
        known: true,
        last_seen: 1,
        online: true,
        incoming_available: 1,
        outgoing_available: 1,
        outgoing_spent: 0,
        can_sign: true,
        can_ecdh: true,
        can_ping: true,
        should_send_nonces: true,
        last_response_latency_ms: 10,
        avg_latency_ms: 10,
        nonce_history: [],
      },
    ],
    peer_permission_states: [],
    pending_operations: [],
    connected_relays: ['wss://relay.one'],
    configured_relays: ['wss://relay.one'],
    ...overrides,
  };
}

function bannerKinds(state: DashboardState): string[] {
  return state.kind === 'ready' ? state.banners.map((b) => b.kind) : [];
}

describe('deriveDashboardState', () => {
  it('reports load-failed from the client error, taking precedence over loading', () => {
    const state = deriveDashboardState({
      active: true,
      status: status({ readiness: { ...status().readiness, restore_complete: false } }),
      loadError: { message: 'daemon failed to start', at: 5 },
    });
    expect(state).toEqual({ kind: 'load-failed', message: 'daemon failed to start', at: 5 });
  });

  it('reports load-failed from the bridge-enriched soft signal when no client error', () => {
    const state = deriveDashboardState({
      active: true,
      status: status({ last_load_error: { message: 'recovered from packages', at: 9 } }),
    });
    expect(state).toEqual({ kind: 'load-failed', message: 'recovered from packages', at: 9 });
  });

  it('stays ready (not loading) when restore_complete is false but a status is present', () => {
    // restore_complete just means "no pending operations"; it goes false during
    // normal operation and must not hide the dashboard behind a loading screen.
    const state = deriveDashboardState({
      active: true,
      status: status({ readiness: { ...status().readiness, restore_complete: false } }),
    });
    expect(bannerKinds(state)).toEqual([]);
    expect(state.kind).toBe('ready');
  });

  it('reports loading while active with no status yet', () => {
    expect(deriveDashboardState({ active: true, status: null }).kind).toBe('loading');
  });

  it('reports ready with no banners when stopped', () => {
    expect(deriveDashboardState({ active: false, status: null })).toEqual({
      kind: 'ready',
      banners: [],
    });
  });

  it('reports ready with no banners for a healthy runtime', () => {
    expect(bannerKinds(deriveDashboardState({ active: true, status: status() }))).toEqual([]);
  });

  it('reports all-relays-offline when relays are reported but none connected', () => {
    const state = deriveDashboardState({
      active: true,
      status: status({ connected_relays: [], configured_relays: ['a', 'b'] }),
    });
    expect(state).toMatchObject({
      kind: 'ready',
      banners: [{ kind: 'all-relays-offline', connectedCount: 0, configuredCount: 2 }],
    });
  });

  it('does not report all-relays-offline when relay health is unreported', () => {
    const state = deriveDashboardState({
      active: true,
      status: status({ connected_relays: null, readiness: { ...status().readiness, sign_ready: true } }),
    });
    expect(bannerKinds(state)).toEqual([]);
  });

  it('reports signing-blocked=policy when peers are online but none may sign', () => {
    const base = status();
    const state = deriveDashboardState({
      active: true,
      status: status({
        readiness: { ...base.readiness, sign_ready: false },
        peers: [{ ...base.peers[0], online: true, can_sign: false }],
      }),
    });
    expect(state).toMatchObject({ kind: 'ready', banners: [{ kind: 'signing-blocked', reason: 'policy' }] });
  });

  it('reports signing-blocked=insufficient-peers when no peer is online', () => {
    const base = status();
    const state = deriveDashboardState({
      active: true,
      status: status({
        readiness: { ...base.readiness, sign_ready: false },
        peers: [{ ...base.peers[0], online: false, can_sign: false }],
      }),
    });
    expect(state).toMatchObject({
      kind: 'ready',
      banners: [{ kind: 'signing-blocked', reason: 'insufficient-peers' }],
    });
  });

  it('suppresses signing-blocked when all relays are offline (mutually exclusive)', () => {
    const base = status();
    const state = deriveDashboardState({
      active: true,
      status: status({
        readiness: { ...base.readiness, sign_ready: false },
        peers: [{ ...base.peers[0], online: false }],
        connected_relays: [],
      }),
    });
    expect(bannerKinds(state)).toEqual(['all-relays-offline']);
  });

  it('reports signing-failed for the retained sign failure and respects dismissal', () => {
    const failure = {
      request_id: 'req-1',
      op_type: 'Sign' as const,
      code: 'peer_rejected',
      message: 'peer rejected',
      failed_at: 42,
    };
    const shown = deriveDashboardState({ active: true, status: status({ last_sign_failure: failure }) });
    expect(shown).toMatchObject({
      kind: 'ready',
      banners: [{ kind: 'signing-failed', requestId: 'req-1', message: 'peer rejected', at: 42 }],
    });

    const dismissed = deriveDashboardState({
      active: true,
      status: status({ last_sign_failure: failure }),
      dismissedSignFailureId: 'req-1',
    });
    expect(bannerKinds(dismissed)).toEqual([]);
  });

  it('ignores a non-sign last failure', () => {
    const state = deriveDashboardState({
      active: true,
      status: status({
        last_sign_failure: { request_id: 'p', op_type: 'Ping', code: 'timeout', message: 'x', failed_at: 1 },
      }),
    });
    expect(bannerKinds(state)).toEqual([]);
  });
});

describe('dashboard state screens', () => {
  it('renders the loading screen', () => {
    render(
      <DashboardLoadingScreen
        profileSummary={{
          profileName: 'My Signing Key',
          thresholdLabel: '2/3',
          groupKeyLabel: 'npub1qe3...7k4m',
          shareLabel: 'Share #1',
          shareKeyLabel: '02a3f8...8f2c',
        }}
      />,
    );
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    expect(screen.getByText('Preparing your dashboard.')).toBeInTheDocument();
    expect(screen.getByText('My Signing Key')).toBeInTheDocument();
    expect(screen.getByText('Share #1')).toBeInTheDocument();
  });

  it('renders the load-failed screen with retry and clear actions', () => {
    const onRetry = vi.fn();
    const onClear = vi.fn();
    render(
      <DashboardLoadFailedScreen
        message="bad snapshot"
        onRetry={onRetry}
        onClear={onClear}
        clearLabel="Clear credentials"
        clearVariant="destructive"
        profileSummary={{ profileName: 'My Signing Key' }}
      />,
    );
    expect(screen.getByText('Couldn’t load profile')).toBeInTheDocument();
    expect(screen.getByText('Try again, or return to your profiles.')).toBeInTheDocument();
    expect(screen.getByText('bad snapshot')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('dashboard-load-failed-retry'));
    expect(onRetry).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /clear credentials/i }));
    expect(onClear).toHaveBeenCalled();
  });

  it('renders each condition banner kind', () => {
    const { rerender } = render(
      <DashboardConditionBanner banner={{ kind: 'all-relays-offline', connectedCount: 0, configuredCount: 3 }} />,
    );
    expect(screen.getByTestId('dashboard-banner-all-relays-offline')).toHaveTextContent('0 of 3');

    rerender(<DashboardConditionBanner banner={{ kind: 'signing-blocked', reason: 'policy' }} />);
    expect(screen.getByTestId('dashboard-banner-signing-blocked')).toHaveTextContent(/permissions/i);

    rerender(<DashboardConditionBanner banner={{ kind: 'signing-blocked', reason: 'insufficient-peers' }} />);
    expect(screen.getByTestId('dashboard-banner-signing-blocked')).toHaveTextContent(/threshold/i);
  });

  it('renders a dismissible signing-failed banner', () => {
    const onDismiss = vi.fn();
    render(
      <DashboardConditionBanner
        banner={{ kind: 'signing-failed', requestId: 'r', opType: 'Sign', message: 'it failed', at: 1 }}
        timestampLabel="just now"
        onDismiss={onDismiss}
      />,
    );
    expect(screen.getByText('it failed')).toBeInTheDocument();
    expect(screen.getByText('just now')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('dashboard-banner-signing-failed-dismiss'));
    expect(onDismiss).toHaveBeenCalled();
  });
});
