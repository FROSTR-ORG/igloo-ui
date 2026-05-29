import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RecoveryWorkspace } from '../src/components/flows/RecoveryWorkspace';

describe('RecoveryWorkspace', () => {
  it('dispatches recovery actions and renders recovered material', () => {
    const onRecover = vi.fn();

    render(
      <RecoveryWorkspace
        recoverForm={{ groupPackageJson: '{}', sharePackageJsons: ['{"idx":1}'] }}
        recoveredKey={{ nsec: 'nsec1demo', signing_key_hex: 'abcd' }}
        onChangeGroup={vi.fn()}
        onChangeShare={vi.fn()}
        onAddShareSlot={vi.fn()}
        onRecover={onRecover}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /recover nsec/i }));
    expect(onRecover).toHaveBeenCalledTimes(1);

    // Recovered material is masked by default; reveal the nsec field first.
    expect(screen.queryByDisplayValue('nsec1demo')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^reveal nsec$/i }));
    expect(screen.getByDisplayValue('nsec1demo')).toBeInTheDocument();
  });
});
