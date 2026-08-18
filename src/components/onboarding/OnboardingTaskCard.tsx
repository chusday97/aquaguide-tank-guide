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

  return (
    <section
      className={isSidebar
        ? 'aquarium-onboarding aquarium-onboarding-sidebar mt-3 min-w-0 rounded-[18px] border border-emerald-100 bg-white/80 p-3 text-ink shadow-sm'
        : 'aquarium-onboarding aquarium-onboarding-strip order-[1] min-w-0 rounded-[18px] border border-emerald-100/80 bg-white/82 p-3 text-ink shadow-[0_8px_24px_rgba(18,79,61,0.055)] md:order-none'}
      aria-labelledby={isSidebar ? 'onboarding-sidebar-title' : 'onboarding-task-title'}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black tabular-nums ${isSidebar ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-50 text-emerald-800'}`}>
              {progress.completedCount} / {progress.totalCount}
            </span>
            <h2 id={isSidebar ? 'onboarding-sidebar-title' : 'onboarding-task-title'} className={`${isSidebar ? 'text-[13px]' : 'text-[14px]'} min-w-0 font-black leading-tight`}>
              {progress.complete ? t('onboarding.completeTitle') : t('onboarding.taskTitle')}
            </h2>
          </div>
          <p className={`${isSidebar ? 'mt-1 text-[10px] leading-4 text-ink/45' : 'mt-1.5 text-[11px] leading-[1.55] text-ink/48'} font-semibold`}>
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
        <div className="h-full rounded-full bg-emerald-600 transition-[width] duration-200" style={{ width: `${progress.completedCount / progress.totalCount * 100}%` }} />
      </div>

      <div className={`${isSidebar ? 'mt-2 grid' : 'mt-2.5 flex flex-wrap items-center'} gap-2`}>
        {nextTask && (
          <button
            type="button"
            onClick={() => navigateToRoute(nextTask.route)}
            className={`${isSidebar ? 'w-full' : 'min-w-0 flex-1 sm:flex-none'} inline-flex min-h-10 items-center justify-between gap-2 rounded-[12px] bg-emerald-700 px-3 text-xs font-black text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400`}
          >
            <span className="min-w-0 break-words text-left">{nextTask.label}</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        )}
        <details data-disclosure-purpose="secondary_evidence" className={`${isSidebar ? 'min-w-0' : 'shrink-0'}`}>
          <summary className="cursor-pointer select-none rounded-full px-3 py-2 text-[11px] font-black text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            {t('onboarding.showSteps')}
          </summary>
          <div className={`mt-2 grid gap-2 ${isSidebar ? '' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
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
