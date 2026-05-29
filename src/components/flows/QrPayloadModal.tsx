import * as React from 'react';

import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { SensitiveTextarea } from '../ui/sensitive-textarea';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  payload: string;
  label?: string;
};

function hashBits(value: string) {
  let seed = 0;
  for (let index = 0; index < value.length; index += 1) {
    seed = (seed * 31 + value.charCodeAt(index)) >>> 0;
  }
  const bits: number[] = [];
  for (let row = 0; row < 21 * 21; row += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    bits.push(seed & 1);
  }
  return bits;
}

function QrLike({ value }: { value: string }) {
  const bits = React.useMemo(() => hashBits(value), [value]);
  return (
    <div className="igloo-qr-grid" aria-hidden="true">
      {bits.map((bit, index) => (
        <span key={`${index}-${bit}`} className={bit ? 'is-on' : ''} />
      ))}
    </div>
  );
}

export function QrPayloadModal({ open, onClose, title, payload, label }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-xl">
      <div className="igloo-stack">
        {label ? <p className="igloo-message-muted">{label}</p> : null}
        <div className="igloo-qr-shell">
          <QrLike value={payload} />
        </div>
        <SensitiveTextarea value={payload} />
        <div className="igloo-button-row">
          <Button type="button" size="sm" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
