import { describe, expect, it } from 'vitest';

import {
  observabilityEventsToEventRows,
  runtimeStatusToSignerDashboardView,
} from '../src/adapters/runtime-view-models';

describe('runtimeStatusToSignerDashboardView', () => {
  it('renders an offline peer as offline even when it has cached signing capacity', () => {
    const view = runtimeStatusToSignerDashboardView({
      status: {
        device_id: 'test-device',
        pending_ops: 0,
        last_active: 0,
        known_peers: 1,
        request_seq: 1,
      },
      metadata: {
        device_id: 'test-device',
        member_idx: 1,
        share_public_key: 'share-public-key',
        group_public_key: 'group-public-key',
        peers: ['peer-public-key'],
      },
      readiness: {
        runtime_ready: true,
        restore_complete: true,
        sign_ready: true,
        ecdh_ready: true,
        threshold: 2,
        signing_peer_count: 1,
        ecdh_peer_count: 1,
        last_refresh_at: null,
        degraded_reasons: [],
      },
      peers: [
        {
          idx: 2,
          pubkey: 'peer-public-key',
          known: true,
          last_seen: null,
          online: false,
          incoming_available: 70,
          outgoing_available: 70,
          outgoing_spent: 0,
          can_sign: true,
          can_ping: true,
          can_onboard: true,
          can_ecdh: true,
          should_send_nonces: false,
        },
      ],
      peer_permission_states: [],
      pending_operations: [],
    });

    expect(view.peerRows[0]).toMatchObject({
      state: 'offline',
      statusLabel: 'offline',
    });
  });
});

describe('observabilityEventsToEventRows', () => {
  it('renders sign completions as visible success log rows', () => {
    const rows = observabilityEventsToEventRows([
      {
        ts: 1_717_200_000_000,
        level: 'info',
        component: 'igloo.runtime',
        domain: 'sign',
        event: 'complete',
        message: 'Sign request completed',
      },
    ]);

    expect(rows[0]).toMatchObject({
      badgeLabel: 'sign',
      badgeTone: 'success',
      message: 'Sign request completed',
    });
  });

  it('canonicalizes structured log domains for the dashboard filters', () => {
    const rows = observabilityEventsToEventRows([
      {
        ts: 1_717_200_000_000,
        level: 'info',
        component: 'igloo.runtime',
        domain: 'relay',
        event: 'inbound_event',
        message: 'Inbound relay event received',
      },
      {
        ts: 1_717_200_000_100,
        level: 'info',
        component: 'igloo.runtime',
        domain: 'onboarding',
        event: 'peer_onboarded',
        message: 'Peer onboarded',
      },
      {
        ts: 1_717_200_000_200,
        level: 'warn',
        component: 'igloo.runtime',
        domain: 'signer policy',
        event: 'approval_required',
      },
    ]);

    expect(rows.map((row) => [row.badgeLabel, row.badgeTone, row.message])).toEqual([
      ['relay', 'sync', 'Inbound relay event received'],
      ['onboard', 'onboard', 'Peer onboarded'],
      ['policy', 'policy', 'approval_required'],
    ]);
  });
});
