import { AlertTriangle, CalendarDays, Check, CheckCircle2, ChevronDown, Clock3, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { TagPill, type TagPillTone } from './TagPill';

export type AquariumStatusLevel = 'normal' | 'needs_attention' | 'urgent' | 'insufficient_data';

export type DailyActionType =
  | 'urgent_recovery'
  | 'current_state_review'
  | 'care_plan'
  | 'water_change'
  | 'daily_check'
  | 'life_stage_observation'
  | 'routine';

export type DailyAquariumStatus = {
  pendingTaskCount: number;
  maintenanceStatus: 'normal' | 'due' | 'overdue';
  knownRiskLevel: 'none_recorded' | 'low' | 'medium' | 'high';
  dataStatus: 'sufficient' | 'partial' | 'insufficient';
  missingData: string[];
};

export type TaskTrigger = {
  type:
    | 'maintenance_overdue'
    | 'maintenance_due'
    | 'user_reported_abnormality'
    | 'missing_important_data'
    | 'new_species_added'
    | 'scheduled_task';
  source:
    | 'water_change_record'
    | 'maintenance_schedule'
    | 'user_observation'
    | 'water_quality_record'
    | 'aquarium_stock';
  value?: Record<string, string | number | boolean>;
};

export type DailyActionTask = {
  id: string;
  actionType: DailyActionType;
  title: string;
  priority: 'normal' | 'medium' | 'high';
  reason: string;
  evidence: string;
  primaryLabel?: string;
  targetId?: string;
  trigger: TaskTrigger;
};

export type DailyActionViewModel = {
  level: AquariumStatusLevel;
  label: string;
  sourceLabel: string;
  status: DailyAquariumStatus;
  task: DailyActionTask;
  reasoning: string[];
};

export type CarePlanSummaryItem = {
  id: string;
  title: string;
  dateLabel: string;
  detail: string;
  status: 'overdue' | 'today' | 'upcoming';
};

export type CarePlanSummaryViewModel = {
  activeCount: number;
  dueCount: number;
  overdueCount: number;
  visibleItems: CarePlanSummaryItem[];
};

type StatusSummaryCardProps = {
  action: DailyActionViewModel;
  carePlan: CarePlanSummaryViewModel;
  showCarePlan: boolean;
  onPrimaryAction: () => void;
  onToggleCarePlan: () => void;
  onOpenCarePlan: (id: string) => void;
  onCompleteCarePlan: (id: string) => void;
  onRescheduleCarePlan: (id: string) => void;
  onDeleteCarePlan: (id: string) => void;
  onBrowseCare: () => void;
};

const levelTone: Record<AquariumStatusLevel, TagPillTone> = {
  normal: 'normal',
  needs_attention: 'warning',
  urgent: 'danger',
  insufficient_data: 'info',
};

const levelStyles: Record<AquariumStatusLevel, string> = {
  normal: 'border-emerald-100/80 bg-[linear-gradient(145deg,#ffffff,#f2faf5)] text-emerald-700',
  needs_attention: 'border-amber-100/80 bg-[linear-gradient(145deg,#ffffff,#fffaf0)] text-amber-700',
  urgent: 'border-red-100/80 bg-[linear-gradient(145deg,#ffffff,#fff5f5)] text-red-600',
  insufficient_data: 'border-sky-100/80 bg-[linear-gradient(145deg,#ffffff,#f4faff)] text-sky-700',
};

export function StatusSummaryCard({
  action,
  carePlan,
  showCarePlan,
  onPrimaryAction,
  onToggleCarePlan,
  onOpenCarePlan,
  onCompleteCarePlan,
  onRescheduleCarePlan,
  onDeleteCarePlan,
  onBrowseCare,
}: StatusSummaryCardProps) {
  const { t } = useTranslation();
  const Icon = action.level === 'normal' ? CheckCircle2 : AlertTriangle;
  const hasPrimaryAction = Boolean(action.task.primaryLabel);
  const careItems = showCarePlan ? carePlan.visibleItems : [];
  const careSummary = carePlan.overdueCount > 0
    ? t('aquarium.carePlanOverdueCount', { count: carePlan.overdueCount })
    : carePlan.dueCount > 0
      ? t('aquarium.carePlanDueCount', { count: carePlan.dueCount })
      : carePlan.activeCount > 0
        ? t('aquarium.carePlanActiveCount', { count: carePlan.activeCount })
        : t('aquarium.carePlanEmpty');
  const careStatusStyle = {
    overdue: 'bg-red-50 text-red-700',
    today: 'bg-amber-50 text-amber-800',
    upcoming: 'bg-sky-50 text-sky-700',
  } as const;
  const careStatusLabel = {
    overdue: t('aquarium.carePlanOverdue'),
    today: t('aquarium.carePlanToday'),
    upcoming: t('aquarium.carePlanUpcoming'),
  } as const;

  return (
    <section
      className={`status-summary-card flex min-h-0 flex-col border ${levelStyles[action.level]}`}
      data-daily-action={action.task.actionType}
    >
      <div className="status-summary-heading flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="type-meta text-ink/56">{t('aquarium.todayAction')}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TagPill tone={levelTone[action.level]}>{action.label}</TagPill>
            <span className="type-meta text-ink/40">{action.sourceLabel}</span>
          </div>
        </div>
        <div className="status-summary-icon flex shrink-0 items-center justify-center rounded-[14px] bg-white/88 shadow-[0_3px_14px_rgba(18,56,45,0.06)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="status-summary-task mt-4">
        <h2 className="type-section-title text-ink">{action.task.title}</h2>
        <p className="type-body mt-2 text-ink/58">{action.task.reason}</p>
        {action.level === 'urgent' && action.reasoning.length > 0 && (
          <div className="mt-3 rounded-[14px] border border-red-100 bg-red-50/70 p-3" aria-live="polite">
            <ul className="grid gap-2">
              {action.reasoning.slice(0, 2).map(reason => (
                <li key={reason} className="type-meta flex gap-2 text-ink/58">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {hasPrimaryAction && (
        <Button
          type="button"
          onClick={onPrimaryAction}
          className="status-primary-action mt-4 bg-emerald-800 text-white shadow-none hover:bg-emerald-900"
        >
          {action.task.primaryLabel}
        </Button>
      )}

      {carePlan.activeCount === 0 ? (
        <div id="care-plan" className="care-plan-empty-strip mt-4 flex min-h-12 items-center gap-3 text-ink">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700">
            <CalendarDays className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="type-card-title block text-ink">{t('aquarium.carePlan')}</span>
            <span className="type-meta mt-0.5 block text-ink/45">{careSummary}</span>
          </span>
          <button
            type="button"
            onClick={onBrowseCare}
            className="care-plan-empty-action shrink-0 rounded-full px-2.5 py-2 text-[11px] font-black text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            {t('aquarium.browseCare')}
          </button>
        </div>
      ) : (
        <section id="care-plan" className="mt-4 text-ink">
          <button
            type="button"
            onClick={onToggleCarePlan}
            aria-expanded={showCarePlan}
            data-disclosure-purpose="care_plan_details"
            className="flex min-h-12 w-full items-center justify-between gap-3 rounded-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-emerald-50 text-emerald-700">
                <CalendarDays className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="type-card-title block text-ink">{t('aquarium.carePlan')}</span>
                <span className="type-meta mt-0.5 block text-ink/45">{careSummary}</span>
              </span>
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-ink/42 transition-transform duration-200 ${showCarePlan ? 'rotate-180' : ''}`} />
          </button>

          {showCarePlan && (
            <div className="mt-3 grid gap-2.5" data-care-plan-details>
              {careItems.map(item => (
                <article key={item.id} data-care-plan-visible className="care-plan-item border border-border/60 bg-white/88">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="type-card-title text-ink">{item.title}</div>
                      <div className="type-meta mt-1 text-ink/44">{item.dateLabel} · {item.detail}</div>
                    </div>
                    <span className={`type-meta shrink-0 rounded-full px-2 py-1 ${careStatusStyle[item.status]}`}>
                      {careStatusLabel[item.status]}
                    </span>
                  </div>
                  <div className="care-plan-action-row mt-3">
                    <button type="button" onClick={() => onOpenCarePlan(item.id)} className="care-plan-primary-action bg-emerald-700 text-white">
                      {t('aquarium.viewGuide')}
                    </button>
                    <button type="button" onClick={() => onCompleteCarePlan(item.id)} className="care-plan-secondary-action inline-flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700">
                      <Check className="h-3.5 w-3.5" />{t('aquarium.complete')}
                    </button>
                    <button type="button" onClick={() => onRescheduleCarePlan(item.id)} className="care-plan-tertiary-action inline-flex items-center justify-center gap-1 text-ink/52 hover:bg-bg">
                      <Clock3 className="h-3.5 w-3.5" />{t('aquarium.reschedule')}
                    </button>
                    <button type="button" onClick={() => onDeleteCarePlan(item.id)} className="care-plan-tertiary-action inline-flex items-center justify-center gap-1 text-red-500 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />{t('aquarium.delete')}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}
