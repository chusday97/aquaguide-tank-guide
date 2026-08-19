import { Check, ChevronRight, Circle, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspaceNavigation } from '../layout/WorkspaceNavigationProvider';
import { subscribeToFavorites } from '../../services/favorites/favorites.service';
import { subscribeToAppState } from '../../services/storage/local-app-state';
import {
  dismissOnboardingTaskCard,
  getOnboardingState,
  getOnboardingTaskProgress,
  getOnboardingTasks,
  syncOnboardingCompletion,
} from '../../services/onboarding/onboarding.service';

export function OnboardingTaskCard({ variant = 'page' }: { variant?: 'page' | 'sidebar' }) {
  const { t } = useTranslation();
  const { navigateToRoute } = useWorkspaceNavigation();
  const [, setRevision] = useState(0);
  const onboarding = getOnboardingState();
  const progress = getOnboardingTaskProgress();

  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    const unsubscribeState = subscribeToAppState(refresh);
    const unsubscribeFavorites = subscribeToFavorites(refresh);
    return () => { unsubscribeState(); unsubscribeFavorites(); };
  }, []);

  useEffect(() => {
    if (progress.complete) syncOnboardingCompletion();
  }, [progress.complete]);

  const tasks = useMemo(() => getOnboardingTasks(onboarding?.goal ?? 'build_tank', progress).map(task => ({ ...task, label: t(task.labelKey) })), [onboarding?.goal, progress, t]);
  const nextTask = tasks.find(task => !task.done);

  if (!onboarding || onboarding.taskCardDismissed) return null;

  const isSidebar = variant === 'sidebar';
  const progressPercent = progress.totalCount > 0 ? progress.completedCount / progress.totalCount * 100 : 0;

  if (!isSidebar) {
    return (
      <section
        className="aquarium-onboarding aquarium-onboarding-strip order-[1] min-w-0 rounded-[16px] border border-emerald-100/80 bg-white/88 p-2.5 text-ink shadow-[0_6px_18px_rgba(18,79,61,0.045)] md:order-none"
        aria-labelledby="onboarding-task-title"
        data-onboarding-compact
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black tabular-nums text-emerald-800">
            {progress.completedCount} / {progress.totalCount}
          </span>

          {nextTask ? (
            <button
              type="button"
              onClick={() => navigateToRoute(nextTask.route)}
              className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-2 rounded-[12px] px-2.5 py-1.5 text-left transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span className="min-w-0">
                <span id="onboarding-task-title" className="block truncate text-[12px] font-black leading-tight text-ink">
                  {progress.complete ? t('onboarding.completeTitle') : t('onboarding.taskTitle')}
                </span>
                <span className="mt-1 block truncate text-[10px] font-semibold leading-tight text-emerald-800">
                  {nextTask.label}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-emerald-700" />
            </button>
          ) : (
            <div className="min-w-0 flex-1 px-2 py-1">
              <h2 id="onboarding-task-title" className="truncate text-[12px] font-black leading-tight text-ink">{t('onboarding.completeTitle')}</h2>
              <p className="mt-1 truncate text-[10px] font-semibold text-ink/45">{t('onboarding.completeSubtitle')}</p>
            </div>
          )}

          <button
            type="button"
            onClick={dismissOnboardingTaskCard}
            aria-label={t('onboarding.dismiss')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-ink/32 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-emerald-100" aria-hidden="true">
          <div className="h-full rounded-full bg-emerald-600 transition-[width] duration-200" style={{ width: `${progressPercent}%` }} />
        </div>

        <details data-disclosure-purpose="secondary_evidence" className="mt-0.5 min-w-0">
          <summary className="w-fit cursor-pointer select-none rounded-full px-2 py-1.5 text-[10px] font-bold text-ink/45 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            {t('onboarding.showSteps')}
          </summary>
          <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
            {tasks.map(task => (
              <div key={task.label} className={`flex min-w-0 items-center gap-2 rounded-[12px] px-2.5 py-2 ${task.done ? 'bg-emerald-50 text-emerald-900' : 'bg-[#F4F3EE] text-ink/55'}`}>
                {task.done ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
                <span className="min-w-0 text-[11px] font-black leading-4">{task.label}</span>
              </div>
            ))}
          </div>
        </details>
      </section>
    );
  }

  return (
    <section
      className="aquarium-onboarding aquarium-onboarding-sidebar mt-3 min-w-0 rounded-[18px] border border-emerald-100 bg-white/80 p-3 text-ink shadow-sm"
      aria-labelledby="onboarding-sidebar-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black tabular-nums text-emerald-700">
              {progress.completedCount} / {progress.totalCount}
            </span>
            <h2 id="onboarding-sidebar-title" className="min-w-0 text-[13px] font-black leading-tight">
              {progress.complete ? t('onboarding.completeTitle') : t('onboarding.taskTitle')}
            </h2>
          </div>
          <p className="mt-1 text-[10px] font-semibold leading-4 text-ink/45">
            {progress.complete ? t('onboarding.completeSubtitle') : t('onboarding.taskSubtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={dismissOnboardingTaskCard}
          aria-label={t('onboarding.dismiss')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-ink/38 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-emerald-100" aria-hidden="true">
        <div className="h-full rounded-full bg-emerald-600 transition-[width] duration-200" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="mt-2 grid gap-2">
        {nextTask && (
          <button
            type="button"
            onClick={() => navigateToRoute(nextTask.route)}
            className="inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-[12px] bg-emerald-700 px-3 text-xs font-black text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span className="min-w-0 break-words text-left">{nextTask.label}</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        )}
        <details data-disclosure-purpose="secondary_evidence" className="min-w-0">
          <summary className="cursor-pointer select-none rounded-full px-3 py-2 text-[11px] font-black text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            {t('onboarding.showSteps')}
          </summary>
          <div className="mt-2 grid gap-2">
            {tasks.map(task => (
              <div key={task.label} className={`flex min-w-0 items-center gap-2 rounded-[14px] px-3 py-2.5 ${task.done ? 'bg-emerald-50 text-emerald-900' : 'bg-[#F4F3EE] text-ink/55'}`}>
                {task.done ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="h-4 w-4 shrink-0" />}
                <span className="min-w-0 text-xs font-black leading-5">{task.label}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
