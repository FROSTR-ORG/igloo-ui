import { describe, expect, it } from 'vitest';

import {
  buildPeerReadinessRows,
  observabilityEventsToEventRows,
  runtimePeerPermissionStatesToPolicyDashboardView,
  runtimeStatusToSignerDashboardView,
} from '../src';

function livePeer(overrides: Record<string, unknown> = {}) {
  return {
    idx: 2,
    pubkey: 'cc',
    known: true,
    last_seen: 1700000000,
    online: true,
    incoming_available: 4,
    outgoing_available: 4,
    outgoing_spent: 1,
    can_sign: true,
    can_ecdh: true,
    can_ping: true,
    should_send_nonces: false,
    last_response_latency_ms: 120,
    avg_latency_ms: 95,
    nonce_history: [{ ts: 1700000000, held: 4 }],
    ...overrides,
  };
}

describe('design runtime adapters', () => {
  it('maps runtime status into the signer dashboard view model', () => {
    const view = runtimeStatusToSignerDashboardView({
      status: {
        device_id: 'device-1',
        pending_ops: 1,
        last_active: 1700000000,
        known_peers: 2,
        request_seq: 7,
      },
      metadata: {
        device_id: 'device-1',
        member_idx: 1,
        share_public_key: 'share-pub-1',
        group_public_key: 'group-pub-1',
        peers: ['peer-1', 'peer-2'],
      },
      readiness: {
        runtime_ready: true,
        restore_complete: true,
        sign_ready: true,
        ecdh_ready: true,
        threshold: 2,
        signing_peer_count: 2,
        ecdh_peer_count: 2,
        last_refresh_at: 1700000000,
        degraded_reasons: [],
      },
      peers: [
        {
          idx: 2,
          pubkey: 'peer-1',
          known: true,
          last_seen: 1700000000,
          online: true,
          incoming_available: 9,
          outgoing_available: 7,
          outgoing_spent: 1,
          can_sign: true,
          can_ecdh: true,
          can_ping: true,
          should_send_nonces: false,
          last_response_latency_ms: 120,
          avg_latency_ms: 95,
          nonce_history: [
            { ts: 1700000000, held: 4 },
            { ts: 1700000005, held: 6 },
          ],
        },
      ],
      peer_permission_states: [],
      pending_operations: [
        {
          op_type: 'sign',
          request_id: 'req-1',
          started_at: 1700000000,
          timeout_at: 1700000300,
          target_peers: ['peer-1', 'peer-2'],
          threshold: 2,
          collected_responses: [{}],
          context: {},
        },
      ],
    });

    expect(view.profileName).toBe('device-1');
    expect(view.thresholdLabel).toBe('2/2');
    expect(view.publicKeyLabel).toBe('group-pub-1');
    expect(view.shareLabel).toBe('Share #1');
    expect(view.readinessLabel).toBe('Signer online');
    expect(view.relaySummary).toBe('Runtime ready');
    expect(view.peerRows[0]).toMatchObject({
      alias: 'Peer #2',
      pubkey: 'peer-1',
      state: 'online',
      statusLabel: 'sign-ready',
      incomingAvailable: 9,
      outgoingAvailable: 7,
      outgoingSpent: 1,
      // Telemetry: capability badges, latency, and the nonce-history series.
      canSign: true,
      canEcdh: true,
      canPing: true,
      lastResponseLatencyMs: 120,
      avgLatencyMs: 95,
    });
    expect(view.peerRows[0].nonceSeries).toEqual([
      { ts: 1700000000, held: 4 },
      { ts: 1700000005, held: 6 },
    ]);
    expect(view.pendingOperationRows[0]).toMatchObject({
      id: 'req-1',
      operationLabel: 'sign',
      thresholdLabel: 'threshold 2',
      responseLabel: '1 response',
    });
  });

  it('maps degraded runtime status into warning readiness labels', () => {
    const view = runtimeStatusToSignerDashboardView({
      status: {
        device_id: 'device-1',
        pending_ops: 0,
        last_active: 1700000000,
        known_peers: 1,
        request_seq: 8,
      },
      metadata: {
        device_id: 'device-1',
        member_idx: 1,
        share_public_key: 'share-pub-1',
        group_public_key: 'group-pub-1',
        peers: ['peer-1', 'peer-2'],
      },
      readiness: {
        runtime_ready: true,
        restore_complete: false,
        sign_ready: false,
        ecdh_ready: false,
        threshold: 2,
        signing_peer_count: 1,
        ecdh_peer_count: 1,
        last_refresh_at: null,
        degraded_reasons: ['insufficient_signing_peers', 'pending_operations_recovered'],
      },
      peers: [
        {
          idx: 3,
          pubkey: 'peer-2',
          known: true,
          last_seen: null,
          online: false,
          incoming_available: 0,
          outgoing_available: 0,
          outgoing_spent: 0,
          can_sign: false,
          can_ecdh: false,
          can_ping: false,
          should_send_nonces: true,
          last_response_latency_ms: null,
          avg_latency_ms: null,
          nonce_history: [],
        },
      ],
      peer_permission_states: [],
      pending_operations: [],
    });

    expect(view.readinessLabel).toBe('Signer degraded');
    expect(view.relaySummary).toBe('insufficient_signing_peers, pending_operations_recovered');
    expect(view.peerRows[0]).toMatchObject({
      alias: 'Peer #3',
      state: 'warning',
      statusLabel: 'known',
    });
  });

  it('maps runtime peer permission states into the policy dashboard view model', () => {
    const view = runtimePeerPermissionStatesToPolicyDashboardView([
      {
        pubkey: 'peer-1',
        manual_override: {
          request: { ping: 'allow', onboard: 'unset', sign: 'deny', ecdh: 'unset' },
          respond: { ping: 'unset', onboard: 'allow', sign: 'allow', ecdh: 'deny' },
        },
        remote_observation: null,
        effective_policy: {
          request: { ping: true, onboard: false, sign: false, ecdh: false },
          respond: { ping: true, onboard: true, sign: true, ecdh: false },
        },
      },
    ]);

    expect(view.peerRows[0].pubkey).toBe('peer-1');
    expect(view.peerRows[0].request.sign).toBe(false);
    expect(view.peerRows[0].respond.onboard).toBe(true);
    expect(view.peerRows[0].manualOverride?.request.ping).toBe('allow');
    expect(view.peerRows[0].manualOverride?.respond.ecdh).toBe('deny');
  });

  it('maps observability events into design event log rows', () => {
    const rows = observabilityEventsToEventRows([
      {
        ts: 1700000000000,
        level: 'warn',
        component: 'runtime',
        domain: 'runtime',
        event: 'restore_skipped',
        reason: 'missing_snapshot',
      },
      {
        ts: 1700000001000,
        level: 'error',
        component: 'runtime',
        domain: 'runtime',
        event: 'failure',
        message: 'sign failed',
      },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: '0-1700000000000-runtime-runtime-restore_skipped',
      badgeLabel: 'runtime',
      badgeTone: 'warning',
      message: 'restore_skipped',
    });
    expect(rows[1]).toMatchObject({
      id: '1-1700000001000-runtime-runtime-failure',
      badgeLabel: 'runtime',
      badgeTone: 'danger',
      message: 'sign failed',
    });
  });
});

describe('buildPeerReadinessRows', () => {
  it('merges live peers with roster + policy peers, deduped and sorted by pubkey', () => {
    const rows = buildPeerReadinessRows({
      peers: [livePeer({ idx: 2, pubkey: 'CC' })],
      rosterPubkeys: ['cc', 'dd'], // cc is also live; dd is roster-only
      policyPubkeys: ['ee'], // policy-only
    });

    expect(rows.map((r) => r.pubkey)).toEqual(['cc', 'dd', 'ee']);

    // Live peer: full telemetry + canonical (fixed) state mapping — sign-ready is
    // 'online', not 'warning'.
    const cc = rows.find((r) => r.pubkey === 'cc')!;
    expect(cc.state).toBe('online');
    expect(cc.statusLabel).toBe('sign-ready');
    expect(cc).toMatchObject({ canSign: true, canEcdh: true, canPing: true, lastResponseLatencyMs: 120, avgLatencyMs: 95 });
    expect(cc.nonceSeries).toEqual([{ ts: 1700000000, held: 4 }]);

    // Roster-only peer: known/idle, empty telemetry.
    const dd = rows.find((r) => r.pubkey === 'dd')!;
    expect(dd).toMatchObject({ state: 'idle', statusLabel: 'known', canSign: false, canEcdh: false, canPing: false });
    expect(dd.lastResponseLatencyMs).toBeNull();
    expect(dd.nonceSeries).toEqual([]);

    // Policy-only peer: offline.
    const ee = rows.find((r) => r.pubkey === 'ee')!;
    expect(ee).toMatchObject({ state: 'offline', statusLabel: 'offline' });
  });

  it('lower-cases pubkeys and keeps a single row per peer', () => {
    const rows = buildPeerReadinessRows({
      peers: [livePeer({ pubkey: 'AB' })],
      rosterPubkeys: ['ab'],
      policyPubkeys: ['ab'],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].pubkey).toBe('ab');
    expect(rows[0].state).toBe('online'); // live status wins over roster/policy
  });

  it('returns an empty array when there are no peers from any source', () => {
    expect(buildPeerReadinessRows({ peers: [] })).toEqual([]);
  });
});
