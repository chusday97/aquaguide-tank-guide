import { Check, ChevronRight, Circle, Download, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspaceNavigation } from '../layout/WorkspaceNavigationProvider';
import { subscribeToFavorites } from '../../services/favorites/favorites.service';
import { subscribeToAppState } from '../../services/storage/local-app-state';
import {
  dismissOnboardingTaskCard,
  getOnboardingState,
  getOnboardingTaskProgress,
  syncOnboardingCompletion,
} from '../../services/onboarding/onboarding.service';
import { taskRoutes } from '../../services/navigation/task-routes';
import { ExportArtifactDialog } from '../export/ExportArtifactDialog';
import { buildStarterChecklistArtifact } from '../../services/export/aquarium-artifact.service';

export function OnboardingTaskCard({ variant = 'page' }: { variant?: 'page' | 'sidebar' }) {
  const { t } = useTranslation();
  const { navigateToRoute } = useWorkspaceNavigation();
  const [, setRevision] = useState(0);
  const [isExportOpen, setIsExportOpen] = useState(false);
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

  const tasks = useMemo(() => [
    { done: progress.aquariumReady, label: t('onboarding.taskTank'), route: taskRoutes.aquarium.setup('onboarding') },
    { done: progress.speciesViewed, label: t('onboarding.taskViewSpecies'), route: '/encyclopedia?difficulty=Easy&source=onboarding' },
    { done: progress.speciesChosen, label: t('onboarding.taskChooseSpecies'), route: '/encyclopedia?difficulty=Easy&source=onboarding' },
    { done: progress.dailyCheckDone, label: t('onboarding.taskCheck'), route: `${taskRoutes.aquarium.dailyCheck}&source=onboarding` },
  ], [progress, t]);
  const nextTask = tasks.find(task => !task.done);
  const isEn = document.documentElement.lang.startsWith('en');
  const exportContent = buildStarterChecklistArtifact({ labels: tasks.map(task => task.label), states: tasks.map(task => task.done), isEn });

  if (!onboarding || onboarding.taskCardDismissed) return null;

  const isSidebar = variant === 'sidebar';

  return (
    <section
      className={isSidebar
        ? 'aquarium-onboarding aquarium-onboarding-sidebar mt-3 min-w-0 rounded-[18px] border border-emerald-100 bg-white/80 p-3 text-ink shadow-sm'
        : 'aquarium-onboarding order-[1] min-w-0 rounded-[22px] border border-emerald-100 bg-gradient-to-r from-emerald-950 to-emerald-800 p-4 text-white shadow-[0_18px_44px_rgba(18,79,61,0.16)] md:order-none'}
      aria-labelledby={isSidebar ? 'onboarding-sidebar-title' : 'onboarding-task-title'}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`text-[10px] font-black uppercase tracking-[0.18em] ${isSidebar ? 'text-emerald-700/60' : 'text-emerald-200'}`}>{progress.completedCount} / 4</div>
          <h2 id={isSidebar ? 'onboarding-sidebar-title' : 'onboarding-task-title'} className={`${isSidebar ? 'mt-0.5 text-[13px]' : 'mt-1 text-lg'} font-black`}>{progress.complete ? t('onboarding.completeTitle') : t('onboarding.taskTitle')}</h2>
          <p className={`${isSidebar ? 'mt-0.5 text-[10px] leading-4 text-ink/45' : 'mt-1 text-xs leading-5 text-white/62'} font-semibold`}>{progress.complete ? t('onboarding.completeSubtitle') : t('onboarding.taskSubtitle')}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={() => setIsExportOpen(true)} aria-label={isEn ? 'Download starter checklist' : '下载新手开缸清单'} className={`flex h-11 w-11 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 ${isSidebar ? 'bg-emerald-50 text-emerald-800 focus-visible:ring-emerald-400' : 'bg-white/10 text-white focus-visible:ring-white'}`}><Download className="h-4 w-4" /></button>
          <button type="button" onClick={dismissOnboardingTaskCard} aria-label={t('onboarding.dismiss')} className={`flex h-11 w-11 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 ${isSidebar ? 'bg-emerald-50 text-ink/45 hover:text-emerald-800 focus-visible:ring-emerald-400' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white focus-visible:ring-white'}`}><X className="h-4 w-4" /></button>
        </div>
      </div>
      <div className={`mt-3 h-1.5 overflow-hidden rounded-full ${isSidebar ? 'bg-emerald-100' : 'bg-white/12'}`} aria-hidden="true">
        <div className={`h-full rounded-full transition-[width] duration-200 ${isSidebar ? 'bg-emerald-600' : 'bg-emerald-300'}`} style={{ width: `${progress.completedCount * 25}%` }} />
      </div>
      <div className={`${isSidebar ? 'mt-2 grid' : 'mt-3 flex flex-wrap items-center'} gap-2`}>
        {nextTask && (
          <button type="button" onClick={() => navigateToRoute(nextTask.route)} className={`inline-flex min-h-10 min-w-0 items-center justify-between gap-2 rounded-2xl px-3 text-xs font-black shadow-sm focus-visible:outline-none focus-visible:ring-2 ${isSidebar ? 'w-full bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-400' : 'bg-white text-emerald-900 hover:bg-emerald-50 focus-visible:ring-white'}`}>
            <span className="min-w-0 break-words text-left">{nextTask.label}</span><ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        )}
        <details data-disclosure-purpose="secondary_evidence" className="min-w-0 flex-1">
          <summary className={`cursor-pointer select-none rounded-full px-3 py-2 text-[11px] font-black focus-visible:outline-none focus-visible:ring-2 ${isSidebar ? 'mx-auto w-fit text-emerald-800 hover:bg-emerald-50 focus-visible:ring-emerald-400' : 'ml-auto w-fit text-white/70 hover:bg-white/10 focus-visible:ring-white'}`}>
            {t('onboarding.showSteps')}
          </summary>
          <div className={`mt-2 grid gap-2 ${isSidebar ? '' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
            {tasks.map(task => (
              <div key={task.label} className={`flex min-w-0 items-center gap-2 rounded-2xl px-3 py-2.5 ${isSidebar ? (task.done ? 'bg-emerald-50 text-emerald-900' : 'bg-[#F4F3EE] text-ink/55') : (task.done ? 'bg-emerald-400/15 text-emerald-50' : 'bg-white/8 text-white/64')}`}>
                {task.done ? <Check className={`h-4 w-4 shrink-0 ${isSidebar ? 'text-emerald-600' : 'text-emerald-300'}`} /> : <Circle className="h-4 w-4 shrink-0" />}
                <span className="min-w-0 text-xs font-black leading-5">{task.label}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
      <ExportArtifactDialog open={isExportOpen} onOpenChange={setIsExportOpen} content={exportContent} isEn={isEn} />
    </section>
  );
}
