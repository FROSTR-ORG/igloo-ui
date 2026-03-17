import * as React from 'react';
import { HelpCircle } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Tooltip } from '../ui/tooltip';

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
    <section className="igloo-flow-root igloo-stack">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="igloo-inline-title">
            <CardTitle>Recover nsec</CardTitle>
            <Tooltip
              trigger={<HelpCircle size={15} className="text-blue-400 cursor-help" />}
              content="Provide the group package plus enough share packages to meet threshold, then reconstruct the original nsec."
            />
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={() => onAddShareSlot()}>
            Add share slot
          </Button>
        </CardHeader>
        <CardContent className="igloo-stack">
          <CardDescription>
            Recovery is standalone here: paste threshold share material and reconstruct the original nsec locally.
          </CardDescription>
          <label>
            Group package JSON
            <Textarea className="min-h-[132px]" value={recoverForm.groupPackageJson} onChange={(event) => onChangeGroup(event.target.value)} />
          </label>
          {recoverForm.sharePackageJsons.map((value, index) => (
            <label key={index}>
              Share package #{index + 1}
              <Textarea className="min-h-[112px]" value={value} onChange={(event) => onChangeShare(index, event.target.value)} />
            </label>
          ))}
          <Button type="button" size="sm" onClick={onRecover}>Recover nsec</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recovered material</CardTitle>
          <CardDescription>
            The recovered nsec and hex signing key appear here after a successful recovery.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recoveredKey ? (
            <div className="igloo-stack">
              <label>
                nsec
                <Textarea className="min-h-[96px]" readOnly value={recoveredKey.nsec} />
              </label>
              <label>
                Signing key hex
                <Textarea className="min-h-[96px]" readOnly value={recoveredKey.signing_key_hex} />
              </label>
            </div>
          ) : (
            <div className="igloo-empty">Recovered material will appear here.</div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
