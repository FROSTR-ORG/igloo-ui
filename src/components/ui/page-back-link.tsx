import { ChevronLeft } from 'lucide-react';

import { cn } from '../../lib/utils';

export type PageBackLinkProps = {
  label: string;
  onBack: () => void;
  className?: string;
};

export function PageBackLink({ label, onBack, className }: PageBackLinkProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-8 items-center gap-1.5 text-[13px] leading-[18px] text-igloo-muted transition-colors hover:text-igloo-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-igloo-primary',
        className,
      )}
      onClick={onBack}
    >
      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
