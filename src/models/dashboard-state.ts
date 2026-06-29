/**
 * Top-level signer-dashboard presentation state.
 *
 * Derived once (see `deriveDashboardState` in the runtime adapter) from runtime
 * status plus the client's own load/activation error, and rendered the same way
 * by every client (pwa / chrome / home). Two states replace the signer panel
 * (`loading`, `load-failed`); `ready` renders the panel with zero or more
 * conditions. Severe availability conditions may replace the running dashboard
 * sections, while dismissible failures remain as banners above the panel.
 */
export type DashboardState =
  | { kind: 'loading'; detail?: string }
  | { kind: 'load-failed'; message: string; at?: number }
  | { kind: 'ready'; banners: DashboardBanner[] };

/**
 * Why signing is currently unavailable. `policy` — peers are reachable but none
 * is permitted to sign; `insufficient-peers` — not enough peers are online to
 * meet the threshold. (The `ask` approval queue is surfaced by its own card, not
 * a banner.)
 */
export type SigningBlockedReason = 'policy' | 'insufficient-peers';

/**
 * A dashboard condition. `all-relays-offline` and `signing-blocked` are mutually
 * exclusive availability states; `signing-failed` is an independent, dismissible
 * record of the most recent failed sign attempt.
 */
export type DashboardBanner =
  | { kind: 'all-relays-offline'; connectedCount: number; configuredCount: number }
  | { kind: 'signing-blocked'; reason: SigningBlockedReason }
  | { kind: 'signing-failed'; requestId: string; opType: string; message: string; at: number };
