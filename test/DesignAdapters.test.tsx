import { describe, expect, it } from 'vitest';

import {
  buildPeerReadinessRows,
  buildPendingApprovalRows,
  observabilityEventsToEventRows,
  runtimePeerPermissionStatesToPolicyDashboardView,
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

describe('buildPendingApprovalRows', () => {
  const approval = {
    request_id: 'req-1',
    peer: 'AABBCCDDEEFF00112233',
    method: 'sign',
    queued_at: 1_700_000_000,
    expires_at: 1_700_000_300,
  };

  it('projects a parked approval into a row, carrying pubkey + method for the host', () => {
    const [row] = buildPendingApprovalRows({ approvals: [approval] });
    expect(row.id).toBe('req-1');
    expect(row.methodLabel).toBe('SIGN');
    expect(row.pubkey).toBe('aabbccddeeff00112233'); // lowercased
    expect(row.method).toBe('sign');
    expect(row.peerLabel).toContain('aabbcc'); // short pubkey fallback
  });

  it('prefers a supplied peer alias over the short pubkey', () => {
    const [row] = buildPendingApprovalRows({
      approvals: [approval],
      peerAliases: { aabbccddeeff00112233: 'Peer #2' },
    });
    expect(row.peerLabel).toBe('Peer #2');
  });

  it('returns an empty array when nothing is parked', () => {
    expect(buildPendingApprovalRows({ approvals: [] })).toEqual([]);
  });
});
