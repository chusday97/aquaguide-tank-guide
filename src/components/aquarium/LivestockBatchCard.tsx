import { englishTranslations } from '../../i18n/localizeData';
import { autoTranslations } from '../../i18n/localizeDataAuto';

const getSpeciesNameLocalized = (species: any, isEn = false): string => {
  if (!species) return '';
  if (!isEn) return species.name || '';
  if (species.scientificName) return species.scientificName;
  const id = species.id || '';
  if (autoTranslations[id]?.name) return autoTranslations[id].name;
  if (englishTranslations[id]?.name) return englishTranslations[id].name;
  return species.name || '';
};
import { ArrowLeft, Baby, Check, CircleHelp, Egg, Fish as FishIcon, HeartPulse, Pencil, Trash2, Waves } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { AquariumFish, AquariumSpeciesBatch, Fish, LifeStage, ReproductiveState } from '../../types';
import { getSpeciesDisplayImage, getSpeciesImageClass } from '../../lib/speciesVisual';
import { useWorkspaceNavigation } from '../layout/WorkspaceNavigationProvider';
import {
  deleteSpeciesBatch,
  normalizeSpeciesBatches,
  splitSpeciesBatch,
  summarizeSpeciesBatches,
  updateSpeciesBatch,
  getSpeciesBatchObservation,
} from '../../services/aquarium/species-batches.service';
import { QuantityStepper } from '../forms/QuantityStepper';
import { QuickDatePicker } from '../forms/QuickDatePicker';

type Props = {
  fish: Fish;
  record: AquariumFish;
  reproductiveApplicable: boolean;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onOpenDetail: () => void;
  onSave: (record: AquariumFish | null) => void | Promise<void>;
};

const lifeStageOptions: LifeStage[] = ['unknown', 'juvenile', 'adult'];

const reproductiveOptions: ReproductiveState[] = ['unknown', 'normal', 'pregnant_or_gravid', 'in_labor_or_spawning', 'postpartum_recovery'];

const summarize = (record: AquariumFish, t: TFunction) => {
  const summary = summarizeSpeciesBatches(record);
  const parts = [t('livestock.summaryTotal', { count: summary.total })];
  if (summary.juvenile) parts.push(t('livestock.summaryJuvenile', { count: summary.juvenile }));
  if (summary.adult) parts.push(t('livestock.summaryAdult', { count: summary.adult }));
  if (summary.pregnant) parts.push(t('livestock.summaryPregnant', { count: summary.pregnant }));
  if (summary.spawning) parts.push(t('livestock.summarySpawning', { count: summary.spawning }));
  if (summary.recovery) parts.push(t('livestock.summaryRecovery', { count: summary.recovery }));
  if (summary.unknown === summary.total) parts.push(t('livestock.summaryUnknown'));
  return parts.join(' · ');
};

function StateChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  compact = false,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string; icon?: ReactNode }>;
  onChange: (value: T) => void;
  compact?: boolean;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-xs font-black text-ink/55">{label}</legend>
      <div role="radiogroup" aria-label={label} className={compact ? 'mt-2 flex flex-wrap gap-2' : 'mt-2 grid grid-cols-3 gap-2'}>
        {options.map(option => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={compact
                ? `min-h-11 rounded-full border px-3 text-xs font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${selected ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-border bg-white text-ink/62 hover:border-emerald-200 hover:bg-emerald-50'}`
                : `flex min-h-[72px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-2 text-center text-xs font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${selected ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm' : 'border-border bg-white text-ink/62 hover:border-emerald-200 hover:bg-emerald-50'}`}
            >
              {option.icon && <span className="flex h-7 w-7 items-center justify-center" aria-hidden="true">{option.icon}</span>}
              <span className="min-w-0 [overflow-wrap:anywhere]">{option.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function LivestockBatchCard({
  fish,
  record,
  reproductiveApplicable,
  isEditing,
  onEditingChange,
  onDirtyChange,
  onOpenDetail,
  onSave,
}: Props) {
  const { t, i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const [draft, setDraft] = useState(record);
  const [taskStep, setTaskStep] = useState<1 | 2 | 3>(1);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [targetQuantity, setTargetQuantity] = useState(1);
  const [targetEntryDate, setTargetEntryDate] = useState('');
  const [targetLifeStage, setTargetLifeStage] = useState<LifeStage>('unknown');
  const [targetReproductiveState, setTargetReproductiveState] = useState<ReproductiveState>('unknown');
  const [pendingDelete, setPendingDelete] = useState<AquariumSpeciesBatch | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null);
  const pendingHistoryDeltaRef = useRef<number | null>(null);
  const restoringHistoryRef = useRef(false);
  const allowHistoryNavigationRef = useRef(false);
  const navigationGuardCleanupRef = useRef<(() => void) | null>(null);
  const wasEditingRef = useRef(false);
  const [error, setError] = useState('');
  const { navigateToRoute, registerNavigationGuard } = useWorkspaceNavigation();

  const initializeTask = (nextRecord: AquariumFish) => {
    const firstBatch = normalizeSpeciesBatches(nextRecord)[0];
    setDraft(nextRecord);
    setTaskStep(1);
    setSelectedBatchId(firstBatch?.id || '');
    setTargetQuantity(firstBatch?.quantity || 1);
    setTargetEntryDate(firstBatch?.entryDate.slice(0, 10) || new Date().toISOString().slice(0, 10));
    setTargetLifeStage(firstBatch?.lifeStage || 'unknown');
    setTargetReproductiveState(firstBatch?.reproductiveState === 'not_applicable' ? 'unknown' : firstBatch?.reproductiveState || 'unknown');
  };

  useEffect(() => {
    if (isEditing && !wasEditingRef.current) initializeTask(record);
    wasEditingRef.current = isEditing;
  }, [isEditing, record]);
  const batches = useMemo(() => normalizeSpeciesBatches(draft), [draft]);
  const sourceBatches = useMemo(() => normalizeSpeciesBatches(record), [record]);
  const selectedSourceBatch = sourceBatches.find(batch => batch.id === selectedBatchId) || sourceBatches[0];
  const observation = getSpeciesBatchObservation(record, isEn);
  const lifeStageChoices: Array<{ value: LifeStage; label: string; icon: ReactNode }> = lifeStageOptions.map(option => ({
    value: option,
    label: t(`livestock.lifeStage.${option}`),
    icon: option === 'unknown'
      ? <CircleHelp className="h-5 w-5" />
      : option === 'juvenile'
        ? <Baby className="h-5 w-5" />
        : <FishIcon className="h-5 w-5" />,
  }));
  const reproductiveChoices: Array<{ value: ReproductiveState; label: string; icon: ReactNode }> = reproductiveOptions.map(option => ({
    value: option,
    label: t(`livestock.reproductiveState.${option}`),
    icon: option === 'unknown'
      ? <CircleHelp className="h-4 w-4" />
      : option === 'normal'
        ? <Waves className="h-4 w-4" />
        : option === 'pregnant_or_gravid'
          ? <Egg className="h-4 w-4" />
          : <HeartPulse className="h-4 w-4" />,
  }));
  const messageFor = (caught: unknown, fallbackKey: string) => (
    isEn ? t(fallbackKey) : (caught instanceof Error ? caught.message : t(fallbackKey))
  );

  const save = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      await onSave(reproductiveApplicable ? draft : {
        ...draft,
        batches: normalizeSpeciesBatches(draft).map(batch => ({ ...batch, reproductiveState: 'not_applicable' as const })),
      });
      onEditingChange(false);
    } catch (saveError) {
      setError(messageFor(saveError, 'livestock.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const selectBatch = (batch: AquariumSpeciesBatch) => {
    setSelectedBatchId(batch.id);
    setTargetQuantity(batch.quantity);
    setTargetEntryDate(batch.entryDate.slice(0, 10));
    setTargetLifeStage(batch.lifeStage);
    setTargetReproductiveState(batch.reproductiveState === 'not_applicable' ? 'unknown' : batch.reproductiveState);
    setError('');
  };

  const prepareReview = () => {
    if (!selectedSourceBatch) return;
    try {
      const entryDate = new Date(`${targetEntryDate}T00:00:00`).toISOString();
      const reproductiveState = reproductiveApplicable ? targetReproductiveState : 'not_applicable';
      const next = targetQuantity < selectedSourceBatch.quantity
        ? splitSpeciesBatch(record, selectedSourceBatch.id, {
          quantity: targetQuantity,
          entryDate,
          lifeStage: targetLifeStage,
          reproductiveState,
        })
        : updateSpeciesBatch(record, selectedSourceBatch.id, {
          entryDate,
          lifeStage: targetLifeStage,
          reproductiveState,
        });
      setDraft(next);
      setTaskStep(3);
      setError('');
    } catch (reviewError) {
      setError(messageFor(reviewError, 'livestock.saveFailed'));
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    const next = deleteSpeciesBatch(draft, pendingDelete.id);
    if (next) {
      setIsDeleting(true);
      setError('');
      try {
        await onSave(next);
        setDraft(next);
        setPendingDelete(null);
      } catch (saveError) {
        setError(messageFor(saveError, 'livestock.deleteFailed'));
      } finally {
        setIsDeleting(false);
      }
      return;
    }
    setIsDeleting(true);
    try {
      await onSave(null);
      setPendingDelete(null);
      onEditingChange(false);
    } catch (saveError) {
      setError(messageFor(saveError, 'livestock.removeFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  const hasPendingSelection = Boolean(selectedSourceBatch) && (
    targetQuantity !== selectedSourceBatch.quantity
    || targetEntryDate !== selectedSourceBatch.entryDate.slice(0, 10)
    || targetLifeStage !== selectedSourceBatch.lifeStage
    || (reproductiveApplicable && targetReproductiveState !== selectedSourceBatch.reproductiveState)
  );
  const hasUnsavedChanges = hasPendingSelection || JSON.stringify(draft) !== JSON.stringify(record);
  useEffect(() => {
    onDirtyChange?.(isEditing && hasUnsavedChanges);
    return () => onDirtyChange?.(false);
  }, [hasUnsavedChanges, isEditing, onDirtyChange]);

  const requestClose = () => {
    if (hasUnsavedChanges) {
      setPendingNavigationPath(null);
      setIsDiscardConfirmOpen(true);
      return;
    }
    onEditingChange(false);
  };

  useEffect(() => {
    if (!isEditing || !hasUnsavedChanges) return;
    const unregister = registerNavigationGuard(path => {
      setPendingNavigationPath(path);
      setIsDiscardConfirmOpen(true);
      return false;
    });
    navigationGuardCleanupRef.current = unregister;
    return () => {
      unregister();
      if (navigationGuardCleanupRef.current === unregister) navigationGuardCleanupRef.current = null;
    };
  }, [hasUnsavedChanges, isEditing, registerNavigationGuard]);

  useEffect(() => {
    if (!isEditing || !hasUnsavedChanges) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setPendingNavigationPath(null);
      setIsDiscardConfirmOpen(true);
    };
    window.addEventListener('keydown', handleEscape, true);
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, [hasUnsavedChanges, isEditing]);

  useEffect(() => {
    if (!isEditing || !hasUnsavedChanges) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isEditing]);

  useEffect(() => {
    if (!isEditing || !hasUnsavedChanges) return;
    const originIndex = Number(window.history.state?.idx);
    const handlePopState = (event: PopStateEvent) => {
      if (allowHistoryNavigationRef.current) {
        allowHistoryNavigationRef.current = false;
        return;
      }
      if (restoringHistoryRef.current) {
        restoringHistoryRef.current = false;
        return;
      }
      const targetIndex = Number(event.state?.idx);
      if (!Number.isFinite(originIndex) || !Number.isFinite(targetIndex) || originIndex === targetIndex) return;
      const delta = targetIndex - originIndex;
      pendingHistoryDeltaRef.current = delta;
      setPendingNavigationPath('__history__');
      setIsDiscardConfirmOpen(true);
      restoringHistoryRef.current = true;
      window.history.go(-delta);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasUnsavedChanges, isEditing]);

  const discardAndContinue = () => {
    const target = pendingNavigationPath;
    const historyDelta = pendingHistoryDeltaRef.current;
    navigationGuardCleanupRef.current?.();
    navigationGuardCleanupRef.current = null;
    setIsDiscardConfirmOpen(false);
    setPendingNavigationPath(null);
    pendingHistoryDeltaRef.current = null;
    setDraft(record);
    onEditingChange(false);
    if (target === '__history__' && historyDelta) {
      allowHistoryNavigationRef.current = true;
      window.history.go(historyDelta);
      return;
    }
    if (target) {
      navigateToRoute(target);
    }
  };

  const continueEditing = () => {
    setPendingNavigationPath(null);
    pendingHistoryDeltaRef.current = null;
    setIsDiscardConfirmOpen(false);
  };

  return (
    <>
      <article className={`min-w-0 rounded-[20px] border border-emerald-100 bg-white shadow-sm ${isEditing ? 'col-span-full overflow-hidden' : 'col-span-1 p-3 lg:col-span-2'}`}>
        {!isEditing ? (
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={onOpenDetail} className="flex h-20 w-24 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label={t('livestock.openProfile', { name: fish.name })}>
              <img src={getSpeciesDisplayImage(fish)} alt={fish.name} className={`h-[88%] w-[88%] object-contain ${getSpeciesImageClass(fish)}`} />
            </button>
            <div className="min-w-0 flex-1 pr-10">
              <h3 className="truncate text-sm font-black text-ink">{getSpeciesNameLocalized(fish, isEn)}</h3>
              <p className="mt-1 text-[11px] font-bold leading-5 text-ink/48">{summarize(record, t)}</p>
              {observation && <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-4 text-amber-700">{t('livestock.observePrefix')}{observation}</p>}
              <button type="button" onClick={() => onEditingChange(true)} className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-emerald-50 px-3 text-xs font-black text-emerald-800 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                <Pencil className="h-3.5 w-3.5" />{t('livestock.manageGroups')}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#FBFAF6]">
            <header className="border-b border-border bg-white px-4 py-4 md:px-5">
              <button type="button" onClick={requestClose} disabled={isSaving} className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-xs font-black text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50">
                <ArrowLeft className="h-4 w-4" />
                {t('livestock.backToList')}
              </button>
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-16 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                  <img src={getSpeciesDisplayImage(fish)} alt="" className={`h-[88%] w-[88%] object-contain ${getSpeciesImageClass(fish)}`} />
                </span>
                <span className="min-w-0">
                  <h2 className="text-lg font-black text-ink">{t('livestock.manageTitle', { name: getSpeciesNameLocalized(fish, isEn) })}</h2>
                  <p className="mt-1 text-xs font-semibold leading-5 text-ink/52">{t('livestock.manageDescription')}</p>
                </span>
              </div>
            </header>

            <div className="grid gap-4 px-3 py-4 md:px-5" data-livestock-state-task data-task-step={taskStep}>
              <ol className="grid grid-cols-3 gap-2" aria-label={isEn ? 'Livestock state steps' : '体态调整步骤'}>
                {[
                  isEn ? 'Choose group' : '选择数量',
                  isEn ? 'Choose state' : '选择体态',
                  isEn ? 'Review' : '核对保存',
                ].map((label, index) => {
                  const step = (index + 1) as 1 | 2 | 3;
                  const active = step === taskStep;
                  const complete = step < taskStep;
                  return (
                    <li key={label} className={`rounded-2xl px-2 py-2.5 text-center text-[11px] font-black ${active ? 'bg-emerald-700 text-white shadow-sm' : complete ? 'bg-emerald-50 text-emerald-800' : 'bg-white text-ink/38'}`}>
                      <span className="mr-1">{complete ? <Check className="inline h-3.5 w-3.5" /> : step}</span>{label}
                    </li>
                  );
                })}
              </ol>

              {taskStep === 1 && selectedSourceBatch && (
                <section className="rounded-[22px] border border-border/80 bg-white p-4 shadow-sm">
                  <h3 className="text-base font-black text-ink">{isEn ? 'Which animals are changing?' : '这次要调整哪一组？'}</h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-ink/50">{isEn ? 'Choose the group and number. The remaining animals keep their current state automatically.' : '选择批次和本次调整数量；其余生物会自动保留原体态，不需要理解“拆分批次”。'}</p>
                  {sourceBatches.length > 1 && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={isEn ? 'Choose group' : '选择批次'}>
                      {sourceBatches.map((batch, index) => (
                        <button key={batch.id} type="button" role="radio" aria-checked={batch.id === selectedSourceBatch.id} onClick={() => selectBatch(batch)} className={`min-h-14 rounded-2xl border px-3 py-2 text-left text-xs font-black ${batch.id === selectedSourceBatch.id ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-border bg-white text-ink/55 hover:bg-bg'}`}>
                          {t('livestock.groupTitle', { index: index + 1 })}<span className="mt-1 block text-[10px] font-semibold opacity-65">{batch.quantity} {isEn ? 'animals' : '条/只'} · {batch.entryDate.slice(0, 10)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1.5 text-xs font-black text-ink/55">
                      <span>{isEn ? 'Number to update' : '本次调整数量'}</span>
                      <QuantityStepper label={isEn ? 'Number to update' : '本次调整数量'} min={1} max={selectedSourceBatch.quantity} value={targetQuantity} onChange={value => { onDirtyChange?.(true); setTargetQuantity(value); }} />
                    </div>
                    <QuickDatePicker value={targetEntryDate} onChange={value => { onDirtyChange?.(true); setTargetEntryDate(value); }} isEn={isEn} />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-bg px-3 py-3 text-xs font-semibold text-ink/58">
                    <span>{targetQuantity < selectedSourceBatch.quantity
                      ? (isEn ? `${targetQuantity} will change; ${selectedSourceBatch.quantity - targetQuantity} keep their current state.` : `调整 ${targetQuantity} 只/条，其余 ${selectedSourceBatch.quantity - targetQuantity} 只/条保留原体态。`)
                      : (isEn ? 'The whole group will use the new state.' : '这一整组都会更新为新体态。')}</span>
                    <button type="button" onClick={() => setPendingDelete(selectedSourceBatch)} aria-label={t('livestock.deleteGroupLabel', { index: sourceBatches.findIndex(batch => batch.id === selectedSourceBatch.id) + 1 })} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </section>
              )}

              {taskStep === 2 && selectedSourceBatch && (
                <section className="rounded-[22px] border border-border/80 bg-white p-4 shadow-sm">
                  <h3 className="text-base font-black text-ink">{isEn ? `Set the state for ${targetQuantity}` : `为这 ${targetQuantity} 只/条选择体态`}</h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-ink/50">{isEn ? 'State changes create observation reminders, but do not diagnose disease or change compatibility.' : '体态只会生成观察提醒，不会自动判病，也不会改变混养结论。'}</p>
                  <div className="mt-4">
                    <StateChoiceGroup<LifeStage> label={t('livestock.lifeStageLabel')} value={targetLifeStage} options={lifeStageChoices} onChange={value => { onDirtyChange?.(true); setTargetLifeStage(value); }} />
                  </div>
                  {reproductiveApplicable && (
                    <div className="mt-5">
                      <StateChoiceGroup<ReproductiveState> label={t('livestock.reproductiveStateLabel')} value={targetReproductiveState} options={reproductiveChoices} onChange={value => { onDirtyChange?.(true); setTargetReproductiveState(value); }} compact />
                    </div>
                  )}
                </section>
              )}

              {taskStep === 3 && (
                <section className="rounded-[22px] border border-emerald-200 bg-white p-4 shadow-sm">
                  <h3 className="text-base font-black text-ink">{isEn ? 'Review before saving' : '保存前核对'}</h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl bg-bg px-3 py-3">
                      <div className="text-[10px] font-black uppercase tracking-wide text-ink/40">{isEn ? 'Before' : '修改前'}</div>
                      <p className="mt-1 text-xs font-bold leading-5 text-ink/65">{summarize(record, t)}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-3 py-3">
                      <div className="text-[10px] font-black uppercase tracking-wide text-emerald-700">{isEn ? 'After' : '修改后'}</div>
                      <p className="mt-1 text-xs font-black leading-5 text-emerald-900">{summarize(draft, t)}</p>
                    </div>
                  </div>
                  <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-3 text-xs font-semibold leading-5 text-amber-900">{targetQuantity < (selectedSourceBatch?.quantity || 0)
                    ? (isEn ? 'Only the selected number changes. The rest stay in their original group.' : '只修改所选数量，其余生物仍保留在原组。')
                    : (isEn ? 'This updates the entire selected group.' : '本次会更新所选整组。')}</p>
                </section>
              )}

              {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
            </div>

            <footer className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-border bg-white/95 px-4 py-3 backdrop-blur md:px-5">
              <button type="button" onClick={taskStep === 1 ? requestClose : () => { if (taskStep === 3) setDraft(record); setTaskStep(previous => previous === 3 ? 2 : 1); }} disabled={isSaving} className="min-h-11 rounded-full border border-border px-4 text-sm font-black text-ink/60 disabled:opacity-50">{taskStep === 1 ? t('livestock.cancel') : (isEn ? 'Previous' : '上一步')}</button>
              {taskStep === 1 ? (
                <button type="button" onClick={() => setTaskStep(2)} className="min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white">{isEn ? 'Next: choose state' : '下一步：选择体态'}</button>
              ) : taskStep === 2 ? (
                <button type="button" onClick={prepareReview} disabled={!hasPendingSelection} className="min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50">{isEn ? 'Review changes' : '核对修改'}</button>
              ) : (
                <button type="button" onClick={() => void save()} disabled={isSaving || JSON.stringify(draft) === JSON.stringify(record)} className="min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50">{isSaving ? t('livestock.saving') : t('livestock.saveChanges')}</button>
              )}
            </footer>
          </div>
        )}
      </article>

      <Dialog open={Boolean(pendingDelete)} onOpenChange={next => { if (!next && !isDeleting) setPendingDelete(null); }}>
        <DialogContent showCloseButton={false} className="max-w-md rounded-[26px]">
          <DialogHeader><DialogTitle>{t('livestock.deleteTitle')}</DialogTitle><DialogDescription>{batches.length === 1 ? t('livestock.deleteLastDescription', { name: fish.name }) : t('livestock.deleteDescription', { count: pendingDelete?.quantity ?? 0 })}</DialogDescription></DialogHeader>
          {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
          <DialogFooter><button type="button" onClick={() => setPendingDelete(null)} disabled={isDeleting} className="min-h-11 rounded-2xl border border-border px-4 text-sm font-black disabled:opacity-50">{t('livestock.keep')}</button><button type="button" onClick={() => void confirmDelete()} disabled={isDeleting} className="min-h-11 rounded-2xl bg-rose-600 px-4 text-sm font-black text-white disabled:opacity-60">{isDeleting ? t('livestock.removing') : t('livestock.deleteGroup')}</button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDiscardConfirmOpen} onOpenChange={next => { setIsDiscardConfirmOpen(next); if (!next) setPendingNavigationPath(null); }}>
        <DialogContent showCloseButton={false} className="max-w-md rounded-[26px]">
          <DialogHeader><DialogTitle>{t('livestock.discardTitle')}</DialogTitle><DialogDescription>{t('livestock.discardDescription')}</DialogDescription></DialogHeader>
          <DialogFooter><button type="button" onClick={continueEditing} className="min-h-11 rounded-2xl border border-border px-4 text-sm font-black">{t('livestock.continueEditing')}</button><button type="button" onClick={discardAndContinue} className="min-h-11 rounded-2xl bg-rose-600 px-4 text-sm font-black text-white">{t('livestock.discard')}</button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
