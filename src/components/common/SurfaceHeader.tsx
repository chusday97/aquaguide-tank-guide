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

const iconButtonClass = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-ink/65 transition-colors hover:bg-black/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400';

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
    <header className={cn('surface-header flex min-h-14 shrink-0 items-center gap-3 border-b border-black/[0.06] bg-white/85 backdrop-blur-md px-4 py-3 min-[760px]:px-6', className)}>
      {onBack && (
        <button type="button" onClick={onBack} className={iconButtonClass} aria-label={backLabel} title={backLabel}>
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="type-meta uppercase tracking-[0.1em] text-ink/45">{eyebrow}</div>}
        <div className="text-[16px] font-black tracking-tight text-ink min-[760px]:text-[17px]">{title}</div>
        {description && <div className="type-meta mt-0.5 break-words text-ink/52">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      {onClose && (
        <button type="button" onClick={onClose} className={iconButtonClass} aria-label={closeLabel} title={closeLabel}>
          <X className="h-4.5 w-4.5" />
        </button>
      )}
    </header>
  );
}

