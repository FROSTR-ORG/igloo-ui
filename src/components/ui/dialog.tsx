import * as React from 'react';
import { AlertTriangle } from 'lucide-react';

import { cn } from '../../lib/utils';
import { useFocusTrap, getTabbableElements } from '../../lib/use-focus-trap';
import { Backdrop } from './backdrop';
import { Button } from './button';

/* ------------------------------------------------------------------ */
/* Module-level Escape stack                                          */
/* ------------------------------------------------------------------ */
// Only the topmost open Dialog should respond to Escape, so nested dialogs
// close one layer at a time. We keep a single document-level listener and a
// LIFO stack of close handlers.

type EscapeHandler = () => void;
const escapeStack: EscapeHandler[] = [];
let escapeListenerAttached = false;

function handleDocumentEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;
  const top = escapeStack[escapeStack.length - 1];
  if (top) {
    event.stopPropagation();
    top();
  }
}

function pushEscapeHandler(handler: EscapeHandler) {
  escapeStack.push(handler);
  if (!escapeListenerAttached && typeof document !== 'undefined') {
    document.addEventListener('keydown', handleDocumentEscape);
    escapeListenerAttached = true;
  }
}

function removeEscapeHandler(handler: EscapeHandler) {
  const index = escapeStack.lastIndexOf(handler);
  if (index !== -1) escapeStack.splice(index, 1);
  if (escapeStack.length === 0 && escapeListenerAttached && typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleDocumentEscape);
    escapeListenerAttached = false;
  }
}

/* ------------------------------------------------------------------ */
/* Body scroll-lock reference counting                                */
/* ------------------------------------------------------------------ */
let scrollLockCount = 0;
let savedBodyOverflow = '';

function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  if (scrollLockCount === 0) {
    savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = savedBodyOverflow;
  }
}

let dialogIdCounter = 0;
function useDialogIds() {
  return React.useMemo(() => {
    dialogIdCounter += 1;
    return {
      titleId: `igloo-dialog-title-${dialogIdCounter}`,
      descriptionId: `igloo-dialog-desc-${dialogIdCounter}`,
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/* Dialog                                                             */
/* ------------------------------------------------------------------ */

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /**
   * Explicit accessible-name reference for callers that render their own
   * titled heading inside `children` (e.g. ConfirmDialog) instead of passing
   * `title`. Without this the `role="dialog"` would lack an accessible name.
   */
  ariaLabelledBy?: string;
  initialFocusRef?: React.RefObject<HTMLElement>;
  preventDismissOnBackdrop?: boolean;
  preventDismissOnEscape?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  ariaLabelledBy,
  initialFocusRef,
  preventDismissOnBackdrop = false,
  preventDismissOnEscape = false,
  className,
  children,
}: DialogProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const { titleId, descriptionId } = useDialogIds();

  useFocusTrap(panelRef, open);

  // Escape handling via the shared module-level stack so only the topmost
  // dialog reacts. Re-register whenever the close intent changes.
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;
  const preventEscapeRef = React.useRef(preventDismissOnEscape);
  preventEscapeRef.current = preventDismissOnEscape;

  React.useEffect(() => {
    if (!open) return;
    const handler: EscapeHandler = () => {
      if (!preventEscapeRef.current) onCloseRef.current();
    };
    pushEscapeHandler(handler);
    return () => removeEscapeHandler(handler);
  }, [open]);

  // Body scroll-lock while open.
  React.useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [open]);

  // Focus management: focus initialFocusRef or first tabbable on open, and
  // restore the previously focused element on close.
  React.useEffect(() => {
    if (!open) return;
    const previouslyFocused = (typeof document !== 'undefined'
      ? document.activeElement
      : null) as HTMLElement | null;

    // Defer to allow the panel to mount/render its children.
    const raf =
      typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame
        : (cb: FrameRequestCallback) => window.setTimeout(() => cb(0), 0);
    const handle = raf(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }
      const panel = panelRef.current;
      if (!panel) return;
      const tabbables = getTabbableElements(panel);
      if (tabbables.length > 0) {
        tabbables[0].focus();
      } else {
        panel.focus();
      }
    });

    return () => {
      if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(handle as number);
      }
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [open, initialFocusRef]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <Backdrop
        onDismiss={() => {
          if (!preventDismissOnBackdrop) onClose();
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : ariaLabelledBy}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-slate-700/40 bg-slate-950/95 p-6 shadow-2xl outline-none',
          className,
        )}
      >
        {title ? (
          <div id={titleId} className="mb-2 text-lg font-semibold text-slate-100">
            {title}
          </div>
        ) : null}
        {description ? (
          <p id={descriptionId} className="mb-4 text-sm text-slate-400">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ConfirmDialog                                                      */
/* ------------------------------------------------------------------ */

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  // The styled <h3> title lives inside `children`, so the dialog cannot derive
  // its accessible name from the Dialog `title` prop without losing the
  // icon+heading layout. Give the heading a stable id and reference it via
  // `ariaLabelledBy` so `role="dialog"` is named for assistive tech.
  const titleId = React.useId();
  return (
    <Dialog open={open} onClose={onCancel} className="max-w-md" ariaLabelledBy={titleId}>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex-shrink-0 rounded-full p-2',
            variant === 'danger' ? 'bg-red-500/20' : 'bg-yellow-500/20',
          )}
        >
          <AlertTriangle
            className={cn(
              'h-6 w-6',
              variant === 'danger' ? 'text-red-400' : 'text-yellow-400',
            )}
          />
        </div>
        <div className="flex-1">
          <h3 id={titleId} className="text-lg font-semibold text-blue-200">{title}</h3>
          <p className="mt-2 text-sm text-gray-400">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
