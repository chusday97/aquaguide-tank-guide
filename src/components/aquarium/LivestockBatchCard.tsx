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
import { ArrowLeft, Baby, CircleHelp, Egg, Fish as FishIcon, GitBranch, GitMerge, HeartPulse, Pencil, Plus, Trash2, Waves, X } from 'lucide-react';
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
  mergeSpeciesBatches,
} from '../../services/aquarium/species-batches.service';

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
  const [splitSource, setSplitSource] = useState<AquariumSpeciesBatch | null>(null);
  const [splitQuantity, setSplitQuantity] = useState(1);
  const [splitLifeStage, setSplitLifeStage] = useState<LifeStage>('adult');
  const [splitReproductiveState, setSplitReproductiveState] = useState<ReproductiveState>('normal');
  const [pendingDelete, setPendingDelete] = useState<AquariumSpeciesBatch | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null);
  const pendingHistoryDeltaRef = useRef<number | null>(null);
  const restoringHistoryRef = useRef(false);
  const allowHistoryNavigationRef = useRef(false);
  const navigationGuardCleanupRef = useRef<(() => void) | null>(null);
  const [error, setError] = useState('');
  const { navigateToRoute, registerNavigationGuard } = useWorkspaceNavigation();

  useEffect(() => {
    if (isEditing) setDraft(record);
  }, [isEditing, record]);
  const batches = useMemo(() => normalizeSpeciesBatches(draft), [draft]);
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

  const update = (batchId: string, patch: Partial<Pick<AquariumSpeciesBatch, 'quantity' | 'entryDate' | 'lifeStage' | 'reproductiveState'>>) => {
    setDraft(current => updateSpeciesBatch(current, batchId, patch));
    setError('');
  };

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

  const confirmSplit = () => {
    if (!splitSource) return;
    try {
      setDraft(current => splitSpeciesBatch(current, splitSource.id, {
        quantity: splitQuantity,
        lifeStage: splitLifeStage,
        reproductiveState: reproductiveApplicable ? splitReproductiveState : 'not_applicable',
      }));
      setSplitSource(null);
      setError('');
    } catch (splitError) {
      setError(messageFor(splitError, 'livestock.splitFailed'));
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

  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(record);
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

            <div className="grid gap-3 px-3 py-4 md:px-5">
              {batches.map((batch, index) => (
                <section key={batch.id} className="rounded-[22px] border border-border/80 bg-white p-3 shadow-sm md:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-black text-ink"><Baby className="h-4 w-4 text-emerald-700" />{t('livestock.groupTitle', { index: index + 1 })}</div>
                      <div className="mt-1 text-[10px] font-bold text-ink/42">{batch.quantity} {isEn ? 'animals' : '条/只'} · {batch.entryDate.slice(0, 10)}</div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1">
                      {batch.quantity > 1 && (
                        <button type="button" onClick={() => { setSplitSource(batch); setSplitQuantity(1); }} className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-xs font-black text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                          <GitBranch className="h-4 w-4" />{t('livestock.split')}
                        </button>
                      )}
                      {index > 0 && batches[index - 1].lifeStage === batch.lifeStage && batches[index - 1].reproductiveState === batch.reproductiveState && (
                        <button type="button" onClick={() => { setDraft(current => mergeSpeciesBatches(current, batches[index - 1].id, batch.id)); setError(''); }} className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-xs font-black text-sky-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
                          <GitMerge className="h-4 w-4" />{t('livestock.mergePrevious')}
                        </button>
                      )}
                      <button type="button" onClick={() => setPendingDelete(batch)} aria-label={t('livestock.deleteGroupLabel', { index: index + 1 })} className="flex h-11 w-11 items-center justify-center rounded-full text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-xs font-black text-ink/55">{t('livestock.quantity')}<input aria-label={t('livestock.quantity')} type="number" min={1} value={batch.quantity} onChange={event => update(batch.id, { quantity: Math.max(1, Number(event.target.value) || 1) })} className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-ink" /></label>
                      <label className="text-xs font-black text-ink/55">{t('livestock.entryDate')}<input aria-label={t('livestock.entryDate')} type="date" required value={batch.entryDate.slice(0, 10)} onChange={event => { if (event.target.value) update(batch.id, { entryDate: new Date(`${event.target.value}T00:00:00`).toISOString() }); }} className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-ink" /></label>
                    </div>
                    <StateChoiceGroup
                      label={t('livestock.lifeStageLabel')}
                      value={batch.lifeStage}
                      options={lifeStageChoices}
                      onChange={value => update(batch.id, { lifeStage: value })}
                    />
                    {reproductiveApplicable && (
                      <StateChoiceGroup
                        label={t('livestock.reproductiveStateLabel')}
                        value={batch.reproductiveState === 'not_applicable' ? 'unknown' : batch.reproductiveState}
                        options={reproductiveChoices}
                        onChange={value => update(batch.id, { reproductiveState: value })}
                        compact
                      />
                    )}
                  </div>
                </section>
              ))}

              {splitSource && (
                <section className="rounded-[22px] border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><h3 className="text-sm font-black text-amber-950">{t('livestock.splitTitle')}</h3><p className="mt-1 text-xs font-semibold text-amber-900/60">{t('livestock.currentGroup', { count: splitSource.quantity })}</p></div>
                    <button type="button" onClick={() => setSplitSource(null)} className="flex h-11 w-11 items-center justify-center rounded-full text-amber-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" aria-label={t('common.close')}><X className="h-4 w-4" /></button>
                  </div>
                  <label className="mt-3 block text-xs font-black text-amber-950/70">{t('livestock.moveQuantity')}<input aria-label={t('livestock.moveQuantity')} type="number" min={1} max={Math.max(1, splitSource.quantity - 1)} value={splitQuantity} onChange={event => setSplitQuantity(Number(event.target.value) || 1)} className="mt-1 h-11 w-full rounded-xl border border-amber-200 bg-white px-3" /></label>
                  <div className="mt-4">
                    <StateChoiceGroup<LifeStage> label={t('livestock.lifeStageLabel')} value={splitLifeStage} options={lifeStageChoices} onChange={setSplitLifeStage} />
                  </div>
                  {reproductiveApplicable && (
                    <div className="mt-4">
                      <StateChoiceGroup<ReproductiveState> label={t('livestock.reproductiveStateLabel')} value={splitReproductiveState} options={reproductiveChoices} onChange={setSplitReproductiveState} compact />
                    </div>
                  )}
                  <button type="button" onClick={confirmSplit} className="mt-4 min-h-11 rounded-full bg-amber-900 px-4 text-sm font-black text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"><Plus className="mr-1 inline h-4 w-4" />{t('livestock.confirmSplit')}</button>
                </section>
              )}

              {hasUnsavedChanges && (
                <div className="rounded-[18px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold leading-5 text-emerald-900" aria-live="polite">
                  <strong>{t('livestock.changeSummary')}</strong>
                  <span className="ml-1">{summarize(draft, t)}</span>
                </div>
              )}
              {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
            </div>

            <footer className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-white/95 px-4 py-3 backdrop-blur md:px-5">
              <button type="button" onClick={requestClose} disabled={isSaving} className="min-h-11 rounded-full border border-border px-4 text-sm font-black text-ink/60 disabled:opacity-50">{t('livestock.cancel')}</button>
              <button type="button" onClick={() => void save()} disabled={isSaving || !hasUnsavedChanges} className="min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50">{isSaving ? t('livestock.saving') : t('livestock.saveChanges')}</button>
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
