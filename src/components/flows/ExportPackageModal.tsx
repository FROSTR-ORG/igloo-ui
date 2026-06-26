import * as React from 'react';

import { CRITICAL_E2E_TEST_IDS as TID } from '../../lib/e2e-test-ids';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { PasswordField } from '../ui/password-field';

type Props = {
  open: boolean;
  onClose: () => void;
  /** "Export Profile" | "Export Share" */
  title: string;
  /** One-line explainer shown under the title in the entry state. */
  description: string;
  /** Summary line, e.g. "Share #1 (Index 1) · Keyset: My Signing Key · 2 relays · 3 peers". */
  summary: string;
  /** The masked-to-reveal exported package once produced (entry state while null). */
  result: string | null;
  busy?: boolean;
  error?: string | null;
  /** Re-encrypt + produce the package with the entered export password. */
  onExport: (password: string) => void;
  onCopy: (value: string) => void;
  onDownload: (value: string) => void;
};

export function ExportPackageModal({
  open,
  onClose,
  title,
  description,
  summary,
  result,
  busy = false,
  error = null,
  onExport,
  onCopy,
  onDownload,
}: Props) {
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const passwordId = React.useId();
  const confirmId = React.useId();

  // Reset entry fields whenever the modal opens/closes so a stale password never
  // lingers between exports.
  React.useEffect(() => {
    if (!open) {
      setPassword('');
      setConfirm('');
    }
  }, [open]);

  const mismatch = confirm.length > 0 && password !== confirm;
  const canExport = password.length > 0 && password === confirm && !busy;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      initialFocusRef={passwordInputRef}
      className="igloo-export-modal max-w-xl"
    >
      {result ? (
        <div className="igloo-stack igloo-export-stack" data-testid={TID.exportComplete}>
          <p className="text-sm font-medium text-emerald-300">Backup Ready</p>
          <pre className="igloo-code-block igloo-export-result" data-testid={TID.exportResult}>{result}</pre>
          <p className="igloo-message-muted">
            Store this backup somewhere safe. Anyone with this file and the password can control your share.
          </p>
          <div className="igloo-button-row igloo-export-actions">
            <Button type="button" size="sm" data-testid={TID.exportCopy} onClick={() => onCopy(result)}>
              Copy
            </Button>
            <Button type="button" size="sm" variant="secondary" data-testid={TID.exportDownload} onClick={() => onDownload(result)}>
              Download
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="igloo-stack igloo-export-stack"
          onSubmit={(event) => {
            event.preventDefault();
            if (canExport) onExport(password);
          }}
        >
          <p className="igloo-message-muted">{description}</p>
          <p className="igloo-export-summary">{summary}</p>
          <div className="igloo-onboard-field igloo-export-field">
            <label htmlFor={passwordId}>Export Password</label>
            <PasswordField
              ref={passwordInputRef}
              id={passwordId}
              data-testid={TID.exportPassword}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
            />
          </div>
          <div className="igloo-onboard-field igloo-export-field">
            <label htmlFor={confirmId}>Confirm Password</label>
            <PasswordField
              id={confirmId}
              data-testid={TID.exportConfirm}
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              disabled={busy}
            />
          </div>
          {mismatch ? <span className="igloo-field-error">Passwords do not match.</span> : null}
          {error ? <span className="igloo-field-error">{error}</span> : null}
          <div className="igloo-button-row igloo-export-actions">
            <Button type="button" size="sm" variant="secondary" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              data-testid={TID.exportSubmit}
              disabled={!canExport}
              loading={busy}
              loadingLabel="Exporting..."
            >
              Export
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
