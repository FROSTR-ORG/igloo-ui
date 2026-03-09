import * as React from 'react';

import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

type RecoveredKey = {
  nsec: string;
  signing_key_hex: string;
};

type Props = {
  recoverForm: {
    groupPackageJson: string;
    sharePackageJsons: string[];
  };
  recoveredKey: RecoveredKey | null;
  onChangeGroup: (value: string) => void;
  onChangeShare: (index: number, value: string) => void;
  onAddShareSlot: (value?: string) => void;
  onRecover: () => void;
};

export function RecoveryWorkspace({
  recoverForm,
  recoveredKey,
  onChangeGroup,
  onChangeShare,
  onAddShareSlot,
  onRecover,
}: Props) {
  return (
    <section className="panel-grid">
      <section className="panel">
        <div className="panel-head">
          <h3>Recover nsec</h3>
          <Button type="button" variant="secondary" onClick={() => onAddShareSlot()}>
            Add share slot
          </Button>
        </div>
        <div className="stack">
          <label>
            Group package JSON
            <Textarea value={recoverForm.groupPackageJson} onChange={(event) => onChangeGroup(event.target.value)} />
          </label>
          {recoverForm.sharePackageJsons.map((value, index) => (
            <label key={index}>
              Share package #{index + 1}
              <Textarea value={value} onChange={(event) => onChangeShare(index, event.target.value)} />
            </label>
          ))}
          <Button type="button" onClick={onRecover}>Recover nsec</Button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Recovered material</h3>
        </div>
        {recoveredKey ? (
          <div className="stack">
            <label>
              nsec
              <Textarea readOnly value={recoveredKey.nsec} />
            </label>
            <label>
              Signing key hex
              <Textarea readOnly value={recoveredKey.signing_key_hex} />
            </label>
          </div>
        ) : (
          <div className="empty">Recovered material will appear here.</div>
        )}
      </section>
    </section>
  );
}
