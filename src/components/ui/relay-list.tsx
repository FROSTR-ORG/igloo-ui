import * as React from 'react';
import { Loader2, RefreshCw, X } from 'lucide-react';

import { CRITICAL_E2E_TEST_IDS } from '../../lib/e2e-test-ids';
import { Button } from './button';
import { IconButton } from './icon-button';
import { StatusDot } from './status-indicator';

export type RelayPingFn = (url: string) => Promise<{ latencyMs?: number; error?: string }>;
export type RelayNormalizeFn = (relays: string[]) => { relays: string[]; errors: string[] };

type RelayPingState = { status: 'idle' | 'pinging' | 'ok' | 'failed'; latencyMs?: number };

export type RelayListProps = {
  relays: string[];
  onChange: (relays: string[]) => void;
  onPing?: RelayPingFn;
  normalizeRelays?: RelayNormalizeFn;
  readOnly?: boolean;
};

export function RelayList({
  relays,
  onChange,
  onPing,
  normalizeRelays,
  readOnly = false,
}: RelayListProps) {
  const [pings, setPings] = React.useState<Record<string, RelayPingState>>({});
  const [draft, setDraft] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

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
      setError(null);
      return;
    }
    const nextRelays = [...relays, next];
    const normalized = normalizeRelays?.(nextRelays) ?? { relays: nextRelays, errors: [] };
    if (normalized.errors.length > 0) {
      setError(normalized.errors[0]);
      return;
    }
    onChange(normalized.relays);
    setDraft('');
    setError(null);
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
            <IconButton
              className="igloo-create-relay-icon"
              aria-label={`Ping ${relay}`}
              icon={<RefreshCw size={14} aria-hidden="true" />}
              onClick={() => void runPing(relay)}
              disabled={!onPing || status === 'pinging'}
              loading={status === 'pinging'}
              loadingLabel={`Pinging ${relay}`}
            />
            {readOnly ? null : (
              <button
                type="button"
                className="igloo-create-relay-icon igloo-create-relay-remove"
                aria-label={`Remove ${relay}`}
                onClick={() => onChange(relays.filter((entry) => entry !== relay))}
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
            onChange={(event) => {
              setDraft(event.target.value);
              setError(null);
            }}
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
          {error ? <p className="igloo-create-relay-error">{error}</p> : null}
        </div>
      )}
    </div>
  );
}
