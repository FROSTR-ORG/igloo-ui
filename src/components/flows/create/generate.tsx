import * as React from 'react';
import { Copy, EyeOff, HelpCircle, Loader2, Pencil, RefreshCw, X } from 'lucide-react';

import { Button } from '../../ui/button';
import { PasswordField } from '../../ui/password-field';
import { StatusDot } from '../../ui/status-indicator';
import { CRITICAL_E2E_TEST_IDS } from '../../../lib/e2e-test-ids';
import type { SharedGeneratedShare, SharedLocalSaveDraft, RelayPingFn } from './types';
import { CreateActionRow, shortKey } from './common';

export function CreateFlowTaskBanner({
  kicker,
  description,
  points,
}: {
  kicker: string;
  description: React.ReactNode;
  points: string[];
}) {
  return (
    <section className="igloo-task-banner">
      <span className="igloo-task-kicker">{kicker}</span>
      {description ? <p>{description}</p> : null}
      <div className="igloo-task-points">
        {points.map((point, index) => {
          const [title, ...detailParts] = point.split('|');
          const detail = detailParts.join('|');
          return (
            <span key={point}>
              <em>{index + 1}</em>
              {detail ? (
                <strong>
                  {title}
                  <small>{detail}</small>
                </strong>
              ) : (
                point
              )}
            </span>
          );
        })}
      </div>
    </section>
  );
}

export function CreateFlowGenerateCard({
  groupName,
  threshold,
  count,
  privateKey = '',
  onChangeForm,
  onGenerate,
  onBack,
}: {
  groupName: string;
  threshold: string;
  count: string;
  privateKey?: string;
  onChangeForm: (
    field: 'groupName' | 'threshold' | 'count' | 'privateKey',
    value: string,
  ) => void;
  onGenerate: () => void;
  onBack?: () => void;
}) {
  const thresholdValue = Number.parseInt(threshold, 10) || 2;
  const countValue = Number.parseInt(count, 10) || 3;
  const thresholdSummary = `Any ${thresholdValue} of ${countValue} shares can sign - min threshold is 2, min shares is 3`;

  const adjustNumber = (field: 'threshold' | 'count', direction: -1 | 1) => {
    const currentValue = field === 'threshold' ? thresholdValue : countValue;
    const nextValue = Math.max(2, currentValue + direction);
    onChangeForm(field, String(nextValue));
  };

  return (
    <div className="igloo-create-keyset-form">
      <label className="igloo-create-field">
        <span>Keyset Name</span>
        <div className="igloo-create-input-shell">
          <Pencil size={16} aria-hidden="true" />
          <input
            aria-label="Group Name"
            value={groupName}
            onChange={(event) => onChangeForm('groupName', event.target.value)}
            placeholder="e.g. My Signing Key, Work Key..."
          />
        </div>
        <small>A friendly name for this keyset's group profile. Visible to all peers in the keyset.</small>
      </label>

      <div className="igloo-create-threshold-row">
        <CreateCounterControl
          label="Threshold"
          value={threshold}
          onDecrease={() => adjustNumber('threshold', -1)}
          onIncrease={() => adjustNumber('threshold', 1)}
          onChange={(value) => onChangeForm('threshold', value)}
        />
        <span className="igloo-create-threshold-divider">/</span>
        <CreateCounterControl
          label="Total Shares"
          value={count}
          onDecrease={() => adjustNumber('count', -1)}
          onIncrease={() => adjustNumber('count', 1)}
          onChange={(value) => onChangeForm('count', value)}
        />
      </div>

      <p className="igloo-create-threshold-help">{thresholdSummary}</p>

      <label className="igloo-create-field">
        <span className="igloo-create-label-with-help">
          Existing Private Key (optional)
          <HelpCircle size={14} aria-hidden="true" />
        </span>
        <div className="igloo-create-private-row">
          <div className="igloo-create-input-shell">
            <input
              aria-label="Existing Private Key (optional)"
              value={privateKey}
              onChange={(event) => onChangeForm('privateKey', event.target.value)}
              placeholder="Paste an nsec1... key or leave blank"
            />
            <EyeOff size={16} aria-hidden="true" />
          </div>
        </div>
        <small>Provide an existing key, otherwise a new one will be generated for you in the next step.</small>
      </label>

      <CreateActionRow onBack={onBack}>
        <Button type="button" className="igloo-create-primary-action" data-testid={CRITICAL_E2E_TEST_IDS.createGenerateNext} onClick={onGenerate}>
          Next Step
        </Button>
      </CreateActionRow>
    </div>
  );
}

function CreateCounterControl({
  label,
  value,
  onDecrease,
  onIncrease,
  onChange,
}: {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <label className="igloo-create-field">
      <span className="igloo-create-label-with-help">
        {label}
        <HelpCircle size={14} aria-hidden="true" />
      </span>
      <div className="igloo-create-counter">
        <button type="button" aria-label={`Decrease ${label}`} onClick={onDecrease}>
          -
        </button>
        <input
          aria-label={label}
          type="number"
          min={2}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" aria-label={`Increase ${label}`} onClick={onIncrease}>
          +
        </button>
      </div>
    </label>
  );
}

export function CreateFlowSharePicker({
  shares,
  selectedMemberIdx,
  onSelect,
}: {
  shares: SharedGeneratedShare[];
  selectedMemberIdx: number | null;
  onSelect: (memberIdx: number) => void;
}) {
  return (
    <div className="igloo-flow-list">
      {shares.map((share) => (
        <div
          key={share.member_idx}
          className={selectedMemberIdx === share.member_idx ? 'igloo-flow-card is-selected' : 'igloo-flow-card'}
        >
          <button type="button" className="igloo-flow-card-select" onClick={() => onSelect(share.member_idx)}>
            <strong>{share.name}</strong>
            <span>Member {share.member_idx}</span>
            <small>{share.share_public_key}</small>
          </button>
        </div>
      ))}
    </div>
  );
}

export function CreateFlowShareSelection({
  shares,
  selectedMemberIdx,
  keysetName,
  groupPublicKey,
  actionLabel = 'Next Step',
  onSelectShare,
  onCopyGroupPublicKey,
  onAction,
  onBack,
}: {
  shares: SharedGeneratedShare[];
  selectedMemberIdx: number | null;
  keysetName: string;
  groupPublicKey: string;
  actionLabel?: string;
  onSelectShare: (memberIdx: number) => void;
  onCopyGroupPublicKey: () => void;
  onAction: () => void;
  onBack?: () => void;
}) {
  const selectedShare = shares.find((share) => share.member_idx === selectedMemberIdx) ?? shares[0] ?? null;

  return (
    <div className="igloo-create-profile-form">
      <section className="igloo-create-profile-panel">
        <header>
          <h3>Group Public Key</h3>
          <p>Copy this key when you need to identify the new keyset outside this device.</p>
        </header>
        <div className="igloo-create-profile-summary">
          <div>
            <span>{keysetName}</span>
            <strong>{groupPublicKey}</strong>
          </div>
          <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.selectShareCopyGroupKey} onClick={onCopyGroupPublicKey}>
            <Copy size={13} aria-hidden="true" />
            Copy group public key
          </Button>
        </div>
      </section>

      <section className="igloo-create-profile-panel">
        <header>
          <h3>Choose Local Share</h3>
          <p>One share saves locally; the rest become remote onboarding packages.</p>
        </header>
        <div className="igloo-create-share-list">
          {shares.map((share) => {
            const isSelected = share.member_idx === selectedShare?.member_idx;
            return (
              <button
                type="button"
                key={share.member_idx}
                className={isSelected ? 'igloo-create-share-option is-selected' : 'igloo-create-share-option'}
                data-testid={CRITICAL_E2E_TEST_IDS.selectShareOption}
                data-member-idx={share.member_idx}
                onClick={() => onSelectShare(share.member_idx)}
                aria-pressed={isSelected}
              >
                <span className="igloo-create-share-radio" aria-hidden="true" />
                <span className="igloo-create-share-copy">
                  <strong>{share.name}</strong>
                  <small>{share.share_public_key}</small>
                </span>
                <span className="igloo-create-share-state">
                  {isSelected ? 'Save to this device' : 'Distribute remotely'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <CreateActionRow onBack={onBack}>
        <Button type="button" className="igloo-create-primary-action" data-testid={CRITICAL_E2E_TEST_IDS.selectShareNext} onClick={onAction}>
          {actionLabel}
        </Button>
      </CreateActionRow>
    </div>
  );
}

type RelayPingState = { status: 'idle' | 'pinging' | 'ok' | 'failed'; latencyMs?: number };

function RelayList({
  relays,
  onChange,
  onPing,
  readOnly = false,
}: {
  relays: string[];
  // Optional: only invoked from the editable (non-readOnly) controls below, so a
  // read-only/locked relay list needs no handler.
  onChange?: (relays: string[]) => void;
  onPing?: RelayPingFn;
  readOnly?: boolean;
}) {
  const [pings, setPings] = React.useState<Record<string, RelayPingState>>({});
  const [draft, setDraft] = React.useState('');

  const runPing = React.useCallback(
    async (url: string) => {
      if (!onPing) return;
      setPings((current) => ({ ...current, [url]: { status: 'pinging' } }));
      const result = await onPing(url);
      setPings((current) => ({
        ...current,
        [url]:
          typeof result.latencyMs === 'number'
            ? { status: 'ok', latencyMs: result.latencyMs }
            : { status: 'failed' },
      }));
    },
    [onPing],
  );

  // Auto-ping relays that don't yet have a recorded result (initial mount + new adds).
  React.useEffect(() => {
    for (const url of relays) {
      if (!pings[url]) void runPing(url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relays]);

  function addRelay() {
    const next = draft.trim();
    if (!next || relays.includes(next)) {
      setDraft('');
      return;
    }
    onChange?.([...relays, next]);
    setDraft('');
  }

  return (
    <div className="igloo-create-relay-list" data-testid={CRITICAL_E2E_TEST_IDS.relayList}>
      {relays.map((relay) => {
        const ping = pings[relay];
        const status = ping?.status ?? 'idle';
        const dotState = status === 'ok' ? 'online' : status === 'failed' ? 'offline' : status === 'pinging' ? 'warning' : 'idle';
        return (
          <div className="igloo-create-relay-row" key={relay} data-testid={CRITICAL_E2E_TEST_IDS.relayRow} data-relay-url={relay}>
            <span className="igloo-create-relay-url">{relay}</span>
            <span className="igloo-create-relay-status" aria-label={`Status: ${status}`}>
              {status === 'pinging' ? (
                <Loader2 size={14} aria-hidden="true" className="igloo-spin" />
              ) : (
                <StatusDot state={dotState} />
              )}
            </span>
            <span className="igloo-create-relay-ping">{ping?.latencyMs != null ? `${ping.latencyMs}ms` : '---'}</span>
            <button
              type="button"
              className="igloo-create-relay-icon"
              aria-label={`Ping ${relay}`}
              onClick={() => void runPing(relay)}
              disabled={!onPing || status === 'pinging'}
            >
              <RefreshCw size={14} aria-hidden="true" />
            </button>
            {readOnly ? null : (
              <button
                type="button"
                className="igloo-create-relay-icon igloo-create-relay-remove"
                aria-label={`Remove ${relay}`}
                onClick={() => onChange?.(relays.filter((entry) => entry !== relay))}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        );
      })}
      {readOnly ? null : (
        <div className="igloo-create-relay-add">
          <input
            aria-label="Add relay"
            data-testid={CRITICAL_E2E_TEST_IDS.relayAddInput}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addRelay();
              }
            }}
            placeholder="wss://relay.example.com"
          />
          <Button type="button" size="sm" variant="secondary" data-testid={CRITICAL_E2E_TEST_IDS.relayAddSubmit} onClick={addRelay}>
            Add Relay
          </Button>
        </div>
      )}
    </div>
  );
}

export function CreateFlowProfileSetup({
  draft,
  actionLabel,
  onLabelChange,
  onPrimarySecretChange,
  onSecondarySecretChange,
  onRelaysChange,
  onPingRelay,
  onAction,
  onBack,
  lockIdentity = false,
  lockName = lockIdentity,
}: {
  draft: SharedLocalSaveDraft;
  actionLabel: string;
  onLabelChange: (value: string) => void;
  onPrimarySecretChange: (value: string) => void;
  onSecondarySecretChange: (value: string) => void;
  // Optional: omit when the relay list is locked (`lockIdentity`) — it renders
  // read-only and never emits a change.
  onRelaysChange?: (relays: string[]) => void;
  onPingRelay?: RelayPingFn;
  onAction: () => void;
  onBack?: () => void;
  lockIdentity?: boolean;
  // Whether the device name is read-only. Defaults to lockIdentity so existing
  // callers are unchanged; the onboard flow opts out so the recipient can name
  // their own device while the keyset relays stay locked.
  lockName?: boolean;
}) {
  const relayRows = draft.relayUrls
    .split(/\r?\n/)
    .map((relay) => relay.trim())
    .filter(Boolean);

  return (
    <div className="igloo-create-profile-form">
      <label className="igloo-create-profile-field">
        <span>Profile Name</span>
        <small>A name for this profile to identify it in the peer list.</small>
        <input
          aria-label="Device Profile Name"
          data-testid={CRITICAL_E2E_TEST_IDS.saveProfileName}
          value={draft.label}
          onChange={(event) => onLabelChange(event.target.value)}
          readOnly={lockName}
        />
      </label>

      <section className="igloo-create-profile-section">
        <header>
          <h3>Profile Password</h3>
          <p>This password encrypts your profile on this device. You'll need it each time you unlock it.</p>
        </header>
        <div className="igloo-create-profile-passwords">
          <label>
            <span>Password</span>
            <PasswordField
              aria-label="Device Password"
              data-testid={CRITICAL_E2E_TEST_IDS.saveProfilePassword}
              value={draft.primarySecret}
              onChange={(event) => onPrimarySecretChange(event.target.value)}
            />
          </label>
          <label>
            <span>Confirm Password</span>
            <PasswordField
              aria-label="Confirm Password"
              data-testid={CRITICAL_E2E_TEST_IDS.saveProfileConfirm}
              value={draft.secondarySecret ?? ''}
              onChange={(event) => onSecondarySecretChange(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="igloo-create-profile-section">
        <header>
          <h3>Relays</h3>
        </header>
        <RelayList
          relays={relayRows}
          onChange={onRelaysChange}
          onPing={onPingRelay}
          readOnly={lockIdentity}
        />
      </section>

      <CreateActionRow onBack={onBack}>
        <Button type="button" className="igloo-create-primary-action" data-testid={CRITICAL_E2E_TEST_IDS.saveProfileNext} onClick={onAction}>
          {actionLabel}
        </Button>
      </CreateActionRow>
    </div>
  );
}

export function CreateFlowReviewPanel({
  profileName,
  sharePublicKey,
  groupPublicKey,
  relays,
  actionLabel,
  onAccept,
  title = 'Review Device Profile',
  description = 'Confirm the local profile details before this browser initializes the signer and prepares remote bfonboard packages.',
}: {
  profileName: string;
  sharePublicKey: string;
  groupPublicKey: string;
  relays: string[];
  actionLabel: string;
  onAccept: () => void;
  title?: string;
  description?: string;
}) {
  const rows = [
    { label: 'Device Label', value: profileName },
    { label: 'Share Public Key', value: shortKey(sharePublicKey) },
    { label: 'Group Public Key', value: shortKey(groupPublicKey) },
    { label: 'Relays', value: `${relays.length} connected` },
  ];

  return (
    <div className="igloo-create-review-form">
      <section className="igloo-create-review-panel">
        <header>
          <span>Device Review</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </header>
        <div className="igloo-create-review-summary">
          {rows.map((row) => (
            <div className="igloo-create-review-row" key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </section>
      <Button type="button" className="igloo-create-primary-action" onClick={onAccept}>
        {actionLabel}
      </Button>
    </div>
  );
}
