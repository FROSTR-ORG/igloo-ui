import { describe, expect, it } from 'vitest';

import {
  observabilityEventsToEventRows,
  runtimePeerPermissionStatesToPolicyDashboardView,
  runtimeStatusToSignerDashboardView,
} from '../src';

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
          latency_ms: 24,
          nonce_inventory_history: [
            { updated_at: 1700000000, held_count: 4 },
            { updated_at: 1700000001, held_count: 9 },
          ],
          can_sign: true,
          should_send_nonces: false,
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
          context: {
            method_label: 'SIGN',
            peer_label: 'Peer #2',
            detail_label: 'kind:1 Short Text Note',
          },
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
      latencyMs: 24,
      nonceInventoryHistory: [
        { updatedAt: 1700000000, heldCount: 4 },
        { updatedAt: 1700000001, heldCount: 9 },
      ],
    });
    expect(view.pendingOperationRows[0]).toMatchObject({
      id: 'req-1',
      operationLabel: 'sign',
      thresholdLabel: 'threshold 2',
      responseLabel: '1 response',
    });
    expect(view.pendingApprovalRows?.[0]).toMatchObject({
      id: 'req-1',
      methodLabel: 'SIGN',
      peerLabel: 'Peer #2',
      detailLabel: 'kind:1 Short Text Note',
    });
  });

  it('keeps ordinary pending runtime operations out of pending approvals', () => {
    const view = runtimeStatusToSignerDashboardView({
      status: {
        device_id: 'device-1',
        pending_ops: 1,
        last_active: 1700000000,
        known_peers: 1,
        request_seq: 7,
      },
      metadata: {
        device_id: 'device-1',
        member_idx: 1,
        share_public_key: 'share-pub-1',
        group_public_key: 'group-pub-1',
        peers: ['peer-1'],
      },
      readiness: {
        runtime_ready: true,
        restore_complete: false,
        sign_ready: false,
        ecdh_ready: true,
        threshold: 2,
        signing_peer_count: 0,
        ecdh_peer_count: 1,
        last_refresh_at: 1700000000,
        degraded_reasons: [],
      },
      peers: [],
      peer_permission_states: [],
      pending_operations: [
        {
          op_type: 'sign',
          request_id: 'req-sign',
          started_at: 1700000000,
          timeout_at: 1700000060,
          target_peers: ['peer-1'],
          threshold: 2,
          collected_responses: [],
          context: 'SignSession',
        },
      ],
    });

    expect(view.pendingApprovalRows).toEqual([]);
    expect(view.pendingOperationRows).toHaveLength(1);
    expect(view.pendingOperationRows[0]).toMatchObject({
      id: 'req-sign',
      operationLabel: 'sign',
      thresholdLabel: 'threshold 2',
      timeoutLabel: '1m',
      responseLabel: '0 responses',
    });
  });

  it('projects runtime policy state into signer peer method badges', () => {
    const view = runtimeStatusToSignerDashboardView({
      status: {
        device_id: 'device-1',
        pending_ops: 0,
        last_active: 1700000000,
        known_peers: 1,
        request_seq: 9,
      },
      metadata: {
        device_id: 'device-1',
        member_idx: 1,
        share_public_key: 'share-pub-1',
        group_public_key: 'group-pub-1',
        peers: ['peer-1'],
      },
      readiness: {
        runtime_ready: true,
        restore_complete: true,
        sign_ready: true,
        ecdh_ready: true,
        threshold: 2,
        signing_peer_count: 1,
        ecdh_peer_count: 1,
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
          incoming_available: 80,
          outgoing_available: 70,
          outgoing_spent: 5,
          latency_ms: 31,
          can_sign: true,
          should_send_nonces: false,
        },
      ],
      peer_permission_states: [
        {
          pubkey: 'peer-1',
          manual_override: {
            request: { ping: 'unset', onboard: 'unset', sign: 'unset', ecdh: 'unset' },
            respond: { ping: 'unset', onboard: 'unset', sign: 'unset', ecdh: 'unset' },
          },
          remote_observation: null,
          effective_policy: {
            request: { ping: true, onboard: false, sign: true, ecdh: false },
            respond: { ping: true, onboard: true, sign: false, ecdh: false },
          },
        },
      ],
      pending_operations: [],
    });

    expect(view.peerRows[0].permissionMethods).toEqual(['sign', 'ping', 'onboard']);
  });

  it('projects runtime peer method capabilities into signer peer badges', () => {
    const view = runtimeStatusToSignerDashboardView({
      status: {
        device_id: 'device-1',
        pending_ops: 0,
        last_active: 1700000000,
        known_peers: 1,
        request_seq: 9,
      },
      metadata: {
        device_id: 'device-1',
        member_idx: 1,
        share_public_key: 'share-pub-1',
        group_public_key: 'group-pub-1',
        peers: ['peer-1'],
      },
      readiness: {
        runtime_ready: true,
        restore_complete: true,
        sign_ready: false,
        ecdh_ready: true,
        threshold: 2,
        signing_peer_count: 0,
        ecdh_peer_count: 1,
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
          incoming_available: 0,
          outgoing_available: 70,
          outgoing_spent: 5,
          can_sign: false,
          can_ping: true,
          can_onboard: false,
          can_ecdh: true,
          should_send_nonces: false,
        },
      ],
      peer_permission_states: [],
      pending_operations: [],
    });

    expect(view.peerRows[0].permissionMethods).toEqual(['ecdh', 'ping']);
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
          should_send_nonces: true,
        },
      ],
      peer_permission_states: [],
      pending_operations: [],
    });

    expect(view.readinessLabel).toBe('Signer degraded');
    expect(view.relaySummary).toBe('insufficient_signing_peers, pending_operations_recovered');
    expect(view.peerRows[0]).toMatchObject({
      alias: 'Peer #3',
      state: 'offline',
      statusLabel: 'offline',
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
        level: 'info',
        component: 'runtime',
        domain: 'sync',
        event: 'pool_sync',
      },
      {
        ts: 1700000001000,
        level: 'info',
        component: 'runtime',
        domain: 'sign',
        event: 'request_received',
      },
      {
        ts: 1700000002000,
        level: 'info',
        component: 'runtime',
        domain: 'ecdh',
        event: 'request_processed',
      },
      {
        ts: 1700000003000,
        level: 'warn',
        component: 'runtime',
        domain: 'signer policy',
        event: 'approval_required',
      },
      {
        ts: 1700000004000,
        level: 'info',
        component: 'runtime',
        domain: 'ping',
        event: 'sweep',
      },
      {
        ts: 1700000005000,
        level: 'info',
        component: 'runtime',
        domain: 'echo',
        event: 'published',
      },
      {
        ts: 1700000006000,
        level: 'warn',
        component: 'runtime',
        domain: 'runtime',
        event: 'restore_skipped',
        reason: 'missing_snapshot',
      },
      {
        ts: 1700000007000,
        level: 'error',
        component: 'runtime',
        domain: 'runtime',
        event: 'failure',
        message: 'sign failed',
      },
    ]);

    expect(rows).toHaveLength(8);
    expect(rows.map((row) => row.badgeTone)).toEqual([
      'sync',
      'success',
      'ecdh',
      'policy',
      'ping',
      'echo',
      'warning',
      'danger',
    ]);
    expect(rows[0]).toMatchObject({
      id: '0-1700000000000-runtime-sync-pool_sync',
      badgeLabel: 'sync',
      message: 'pool_sync',
      timestampLabel: expect.stringMatching(/^\d{1,2}:\d{2}:\d{2}[ap]$/),
    });
    expect(rows[6]).toMatchObject({
      id: '6-1700000006000-runtime-runtime-restore_skipped',
      badgeLabel: 'runtime',
      badgeTone: 'warning',
      message: 'restore_skipped',
      timestampLabel: expect.stringMatching(/^\d{1,2}:\d{2}:\d{2}[ap]$/),
    });
    expect(rows[7]).toMatchObject({
      id: '7-1700000007000-runtime-runtime-failure',
      badgeLabel: 'runtime',
      badgeTone: 'danger',
      message: 'sign failed',
      timestampLabel: expect.stringMatching(/^\d{1,2}:\d{2}:\d{2}[ap]$/),
    });
    expect(rows[0].timestampLabel).not.toMatch(/\//);
  });
});
