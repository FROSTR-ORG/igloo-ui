import * as React from 'react';

import { cn } from '../../lib/utils';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, className, children }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-slate-700/40 bg-slate-950/95 p-6 shadow-2xl',
          className,
        )}
      >
        {title ? <div className="mb-4 text-lg font-semibold text-slate-100">{title}</div> : null}
        {children}
      </div>
    </div>
  );
}
