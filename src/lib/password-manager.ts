// FROSTR password inputs are encryption passphrases, not site logins, so a
// password manager autofilling saved credentials (or offering to save the
// passphrase) is actively wrong. Spread these attributes onto every password
// input to opt out of the major managers, which each document respecting one of
// them:
//   - autoComplete="new-password" — tells the browser not to autofill existing creds
//   - data-1p-ignore               — 1Password
//   - data-lpignore                — LastPass
//   - data-bwignore                — Bitwarden
//   - data-form-type="other"       — Dashlane
// Field stays a real type=password (masking, accessibility, reveal toggle intact).
export const passwordManagerOptOutProps = {
  autoComplete: 'new-password',
  'data-1p-ignore': 'true',
  'data-lpignore': 'true',
  'data-bwignore': 'true',
  'data-form-type': 'other',
} as const;
