import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type QuickActionItem = {
  id?: string;
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

const primaryActionIds = new Set(['recordWaterChange', 'recordFeeding', 'recordExistingSpecies']);

function QuickActionButton({ action }: { action: QuickActionItem }) {
  return (
    <button
      type="button"
      data-quick-action-id={action.id || undefined}
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
  );
}

export function QuickActionGrid({ actions }: QuickActionGridProps) {
  const { i18n } = useTranslation();
  const primaryActions = actions.filter(action => action.id && primaryActionIds.has(action.id));
  const secondaryActions = actions.filter(action => !action.id || !primaryActionIds.has(action.id));
  const featuredActions = primaryActions.length > 0 ? primaryActions : actions.slice(0, 3);
  const moreActions = primaryActions.length > 0 ? secondaryActions : actions.slice(3);
  const isEn = Boolean(i18n.language?.startsWith('en'));

  return (
    <div className="quick-action-stack">
      <div className="quick-action-grid quick-action-primary" data-quick-action-priority="primary">
        {featuredActions.map(action => <QuickActionButton key={action.id || action.label} action={action} />)}
      </div>

      {moreActions.length > 0 && (
        <details className="quick-action-more">
          <summary className="quick-action-more-summary">
            <span>{isEn ? 'More actions' : '更多操作'}</span>
            <span className="quick-action-more-count">{moreActions.length}</span>
            <ChevronDown className="quick-action-more-chevron h-4 w-4" aria-hidden="true" />
          </summary>
          <div className="quick-action-grid quick-action-secondary" data-quick-action-priority="secondary">
            {moreActions.map(action => <QuickActionButton key={action.id || action.label} action={action} />)}
          </div>
        </details>
      )}
    </div>
  );
}
