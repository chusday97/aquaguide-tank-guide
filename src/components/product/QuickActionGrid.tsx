import type { ReactNode } from 'react';

export type QuickActionItem = {
  label: string;
  description?: string;
  icon: ReactNode;
  onClick: () => void;
  tone?: 'normal' | 'warning' | 'danger' | 'info' | 'muted';
  active?: boolean;
};

type QuickActionGridProps = {
  actions: QuickActionItem[];
};

const toneClassName: Record<NonNullable<QuickActionItem['tone']>, string> = {
  normal: 'bg-emerald-50/80 text-emerald-800 hover:bg-emerald-50',
  warning: 'bg-amber-50/80 text-amber-800 hover:bg-amber-50',
  danger: 'bg-red-50/80 text-red-700 hover:bg-red-50',
  info: 'bg-sky-50/80 text-sky-800 hover:bg-sky-50',
  muted: 'bg-white/88 text-ink/72 hover:bg-white',
};

const activeToneClassName: Record<NonNullable<QuickActionItem['tone']>, string> = {
  normal: 'bg-emerald-800 text-white hover:bg-emerald-900',
  warning: 'bg-amber-700 text-white hover:bg-amber-800',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  info: 'bg-sky-800 text-white hover:bg-sky-900',
  muted: 'bg-ink text-white hover:bg-ink/90',
};

export function QuickActionGrid({ actions }: QuickActionGridProps) {
  return (
    <div className="quick-action-grid">
      {actions.map(action => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className={`quick-action-button grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-center gap-3 text-left ${
            action.active ? activeToneClassName[action.tone || 'muted'] : toneClassName[action.tone || 'muted']
          }`}
        >
          <span className={`quick-action-icon flex shrink-0 items-center justify-center rounded-[12px] ${action.active ? 'bg-white/14 text-white' : 'bg-white/80 shadow-[0_2px_8px_rgba(18,56,45,0.05)]'}`}>
            {action.icon}
          </span>
          <span className="min-w-0">
            <span className="type-card-title block text-current [overflow-wrap:anywhere]">{action.label}</span>
            {action.description && (
              <span className="quick-action-description text-current">{action.description}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
