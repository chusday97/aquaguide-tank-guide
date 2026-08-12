import type { ReactNode } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SurfaceHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
};

const iconButtonClass = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg text-ink/60 transition-colors hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400';

export function SurfaceHeader({
  title,
  description,
  eyebrow,
  actions,
  onBack,
  backLabel = '返回',
  onClose,
  closeLabel = '关闭',
  className,
}: SurfaceHeaderProps) {
  return (
    <header className={cn('surface-header flex min-h-16 shrink-0 items-center gap-3 border-b border-border bg-white px-3 py-2.5 min-[760px]:px-4', className)}>
      {onBack && (
        <button type="button" onClick={onBack} className={iconButtonClass} aria-label={backLabel} title={backLabel}>
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="type-meta uppercase tracking-[0.1em] text-ink/45">{eyebrow}</div>}
        <div className="type-card-title break-words text-ink">{title}</div>
        {description && <div className="type-meta mt-1 break-words text-ink/52">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      {onClose && (
        <button type="button" onClick={onClose} className={iconButtonClass} aria-label={closeLabel} title={closeLabel}>
          <X className="h-5 w-5" />
        </button>
      )}
    </header>
  );
}

