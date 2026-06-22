import * as React from 'react';

import { Button } from '../../ui/button';
import { CRITICAL_E2E_TEST_IDS } from '../../../lib/e2e-test-ids';

export function CreateActionRow({ onBack, children }: { onBack?: () => void; children: React.ReactNode }) {
  if (!onBack) return <>{children}</>;
  return (
    <div className="igloo-create-action-row">
      <Button type="button" variant="secondary" className="igloo-create-back-action" data-testid={CRITICAL_E2E_TEST_IDS.createBack} onClick={onBack}>
        Go Back
      </Button>
      {children}
    </div>
  );
}

export function shortKey(value: string) {
  if (!value || value === 'n/a') return 'n/a';
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}
