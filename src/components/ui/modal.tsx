import * as React from 'react';

import { Dialog } from './dialog';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement>;
  className?: string;
  children: React.ReactNode;
};

/**
 * Modal is a thin compatibility shim over the hardened {@link Dialog} engine.
 *
 * The Paper design system shipped a lightweight `Modal` (backdrop + centered
 * panel + a window-level Escape listener that closed *every* open modal at
 * once). The security-hardening track replaced it with `Dialog`, which adds a
 * focus trap, initial-focus + restore, ref-counted body scroll-lock, a LIFO
 * Escape stack (only the topmost dialog closes), and full ARIA wiring.
 *
 * We keep `Dialog` as the single engine and back the original `Modal` API with
 * it so existing call sites (ExportPackageModal, HostShell, …) are untouched
 * while inheriting the hardened behavior. `ModalProps` is a strict subset of
 * `DialogProps`, so this is a direct forward.
 */
export function Modal({ open, onClose, title, initialFocusRef, className, children }: ModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      initialFocusRef={initialFocusRef}
      className={className}
    >
      {children}
    </Dialog>
  );
}
