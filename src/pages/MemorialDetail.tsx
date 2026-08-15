import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, ClipboardPenLine, HeartHandshake, RotateCcw, Save } from 'lucide-react';
import { useParams } from 'react-router-dom';
import i18n from '../i18n';
import { ResilientImage } from '../components/common/ResilientImage';
import { QuickDatePicker } from '../components/forms/QuickDatePicker';
import { getMemorialCauseLabel, MemorialCauseSelector } from '../components/memorial/MemorialCauseSelector';
import { useToast } from '../components/common/ToastProvider';
import { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fishData } from '../data/fishData';
import { getSpeciesImageClass, getSpeciesVisualSources } from '../lib/speciesVisual';
import type { MemorialItem } from '../modules/collection/collection.types';
import { getCollectionSnapshot, hydrateCollectionMemorials, subscribeToCollection } from '../services/collection/collection.service';
import {
  proceedWithHistoryNavigation,
  registerHistoryNavigationGuard,
} from '../services/navigation/history-navigation-guard.service';
import { getCurrentAquaGuideRepository } from '../services/repository/repository-provider';
import type { MemorialCauseCode } from '../types';

type MemorialDraft = {
  date: string;
  causeCodes: MemorialCauseCode[];
  observation: string;
  reason: string;
  improvement: string;
};

const toDateInputValue = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createDraft = (record: MemorialItem): MemorialDraft => ({
  date: toDateInputValue(record.date),
  causeCodes: record.causeCodes?.length ? record.causeCodes : (record.reason ? ['other'] : []),
  observation: record.observation || '',
  reason: record.reason || '',
  improvement: record.improvement || '',
});

const sameDraft = (left: MemorialDraft, right: MemorialDraft) => (
  left.date === right.date
  && left.causeCodes.join('|') === right.causeCodes.join('|')
  && left.observation === right.observation
  && left.reason === right.reason
  && left.improvement === right.improvement
);

export default function MemorialDetail() {
  const { recordId = '' } = useParams();
  const { showToast } = useToast();
  const { navigateToRoute, registerNavigationGuard } = useWorkspaceNavigation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const [record, setRecord] = useState<MemorialItem | null>(() => (
    getCollectionSnapshot().memorials.find(item => item.id === recordId) || null
  ));
  const [isMemorialHydrating, setIsMemorialHydrating] = useState(true);
  const [draft, setDraft] = useState<MemorialDraft | null>(() => (record ? createDraft(record) : null));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [discardRequest, setDiscardRequest] = useState<{
    kind: 'cancel' | 'navigate' | 'history';
    targetPath?: string;
  } | null>(null);
  const firstFieldRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingHistoryDeltaRef = useRef<number | null>(null);
  const allowNextNavigationRef = useRef(false);

  const fish = useMemo(() => fishData.find(item => item.id === record?.fishId), [record?.fishId]);
  const initialDraft = useMemo(() => (record ? createDraft(record) : null), [record]);
  const dirty = Boolean(editing && draft && initialDraft && !sameDraft(draft, initialDraft));
  const hasReflection = Boolean(record && (
    record.observation?.trim()
    || record.causeCodes?.length
    || record.reason?.trim()
    || record.improvement?.trim()
  ));
  const hasPossibleCause = Boolean(record?.reason?.trim() || record?.causeCodes?.some(code => code !== 'unknown'));

  useEffect(() => subscribeToCollection(() => {
    const next = getCollectionSnapshot().memorials.find(item => item.id === recordId) || null;
    setRecord(next);
    if (next && !dirty) setDraft(createDraft(next));
  }), [dirty, recordId]);

  useEffect(() => {
    let active = true;
    setIsMemorialHydrating(true);
    void hydrateCollectionMemorials()
      .then(snapshot => {
        if (!active) return;
        const next = snapshot.memorials.find(item => item.id === recordId) || null;
        setRecord(next);
        if (next) setDraft(createDraft(next));
      })
      .catch(() => {
        if (active) showToast(isEn ? 'Could not refresh this memorial.' : '这条生命纪念暂时无法从云端刷新。', 'error');
      })
      .finally(() => { if (active) setIsMemorialHydrating(false); });
    return () => { active = false; };
  }, [isEn, recordId, showToast]);

  useEffect(() => {
    if (!editing) return;
    window.requestAnimationFrame(() => firstFieldRef.current?.focus());
  }, [editing]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  useEffect(() => dirty
    ? registerHistoryNavigationGuard(({ delta }) => {
      pendingHistoryDeltaRef.current = delta;
      setDiscardRequest({ kind: 'history' });
    })
    : undefined, [dirty]);

  useEffect(() => registerNavigationGuard(dirty
    ? (targetPath) => {
      if (allowNextNavigationRef.current) {
        allowNextNavigationRef.current = false;
        return true;
      }
      setDiscardRequest({ kind: 'navigate', targetPath });
      return false;
    }
    : null), [dirty, registerNavigationGuard]);

  const updateDraft = <K extends keyof MemorialDraft>(field: K, value: MemorialDraft[K]) => {
    setDraft(current => current ? { ...current, [field]: value } : current);
    setError('');
  };

  const startEditing = () => {
    if (!record) return;
    setDraft(createDraft(record));
    setEditing(true);
    setError('');
  };

  const cancelEditing = () => {
    if (dirty) {
      setDiscardRequest({ kind: 'cancel' });
      return;
    }
    if (record) setDraft(createDraft(record));
    setEditing(false);
    setError('');
  };

  const discardChanges = () => {
    if (!discardRequest) return;
    const request = discardRequest;
    if (record) setDraft(createDraft(record));
    setEditing(false);
    setError('');
    setDiscardRequest(null);
    if (request.kind === 'history') {
      const historyDelta = pendingHistoryDeltaRef.current;
      pendingHistoryDeltaRef.current = null;
      if (historyDelta) proceedWithHistoryNavigation(historyDelta);
      return;
    }
    if (request.kind === 'navigate' && request.targetPath) {
      allowNextNavigationRef.current = true;
      navigateToRoute(request.targetPath);
      return;
    }
  };

  const continueEditing = () => {
    pendingHistoryDeltaRef.current = null;
    setDiscardRequest(null);
  };

  const saveReflection = async () => {
    if (!record || !draft || saving) return;
    if (!draft.date) {
      setError(isEn ? 'Choose the date of this record.' : '请选择记录日期。');
      return;
    }
    if (!draft.observation.trim() && draft.causeCodes.length === 0 && !draft.reason.trim() && !draft.improvement.trim()) {
      setError(isEn ? 'Add at least one observation, possible reason, or improvement.' : '请至少填写当时现象、可能原因或后续改进中的一项。');
      firstFieldRef.current?.focus();
      return;
    }
    if (draft.causeCodes.includes('other') && !draft.reason.trim()) {
      setError(isEn ? 'Add a short note for “Other”.' : '选择“其他”后，请补充自定义原因。');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const repository = await getCurrentAquaGuideRepository();
      const saved = await repository.updateMemorial({
        id: record.id,
        date: draft.date,
        causeCodes: draft.causeCodes,
        observation: draft.observation,
        reason: draft.reason,
        improvement: draft.improvement,
        version: record.version,
      });
      setRecord(saved);
      setDraft(createDraft(saved));
      setEditing(false);
      showToast(isEn ? 'Reflection saved' : '复盘已保存');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : (isEn ? 'Could not save. Try again.' : '暂时无法保存，请重试。'));
    } finally {
      setSaving(false);
    }
  };

  if (isMemorialHydrating && !record) {
    return (
      <main className="page-frame mx-auto w-full max-w-[980px] pb-24">
        <section className="mt-4 rounded-[24px] border border-slate-200 bg-white px-5 py-14 text-center">
          <HeartHandshake className="mx-auto h-9 w-9 animate-pulse text-emerald-700/40" />
          <h1 className="mt-4 text-xl font-black text-ink">{isEn ? 'Loading memorial' : '正在加载生命纪念'}</h1>
        </section>
      </main>
    );
  }

  if (!record) {
    return (
      <main className="page-frame mx-auto w-full max-w-[980px] pb-24">
        <button type="button" onClick={() => navigateToRoute('/collection/memorial')} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-black text-emerald-800 hover:bg-emerald-50">
          <ArrowLeft className="h-4 w-4" />{isEn ? 'Back to Memorials' : '返回生命纪念'}
        </button>
        <section className="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-14 text-center">
          <HeartHandshake className="mx-auto h-9 w-9 text-ink/20" />
          <h1 className="mt-4 text-xl font-black text-ink">{isEn ? 'This record is unavailable' : '没有找到这条生命纪念'}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-ink/50">{isEn ? 'This record is no longer available.' : '这条记录已不可用。'}</p>
        </section>
      </main>
    );
  }

  return (
    <>
    <main className="page-frame mx-auto w-full max-w-[1080px] pb-24">
      <button type="button" onClick={() => navigateToRoute('/collection/memorial')} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-black text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
        <ArrowLeft className="h-4 w-4" />{isEn ? 'Back to Memorials' : '返回生命纪念'}
      </button>

      <article data-memorial-detail={record.id} className="mt-2 overflow-hidden rounded-[28px] border border-white/85 bg-white shadow-[0_18px_50px_rgba(42,58,51,0.09)]">
        <div className="grid min-w-0 lg:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.12fr)]">
          <section className="relative min-h-[300px] overflow-hidden bg-[radial-gradient(circle_at_50%_25%,#eff8f4_0%,#e4eee9_56%,#d8e3dd_100%)] p-5 sm:p-7 lg:min-h-[640px]">
            <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3 sm:inset-x-7 sm:top-7">
              <span className="rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-[11px] font-black text-slate-600 shadow-sm">
                {hasPossibleCause
                  ? (isEn ? 'Reason recorded' : '已记录原因')
                  : hasReflection
                    ? (isEn ? 'Reason not recorded' : '原因待补充')
                    : (isEn ? 'Reflection needed' : '待补充记录')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/70 px-3 py-1.5 text-[11px] font-black text-white">
                <CalendarDays className="h-3.5 w-3.5" />{new Intl.DateTimeFormat(isEn ? 'en' : 'zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(record.date))}
              </span>
            </div>
            <div className="flex h-[250px] items-end justify-center pt-16 sm:h-[320px] lg:h-full lg:min-h-[560px]">
              {fish ? (
                <ResilientImage
                  src={getSpeciesVisualSources(fish).detail}
                  alt={fish.name}
                  className={`h-full max-h-[460px] w-full object-contain p-[8%] opacity-80 grayscale-[35%] ${getSpeciesImageClass(fish)}`}
                />
              ) : <HeartHandshake className="h-20 w-20 text-ink/20" />}
            </div>
            <div className="absolute inset-x-5 bottom-5 rounded-[18px] border border-white/70 bg-white/78 p-4 backdrop-blur-sm sm:inset-x-7 sm:bottom-7">
              <h1 className="text-[24px] font-black tracking-tight text-ink">{fish?.name || (isEn ? 'Life Memorial' : '生命纪念')}</h1>
              {fish?.scientificName && <p className="mt-1 text-xs font-semibold italic text-ink/45">{fish.scientificName}</p>}
            </div>
          </section>

          <section className="min-w-0 p-5 sm:p-7 lg:p-9">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-800">
                  <ClipboardPenLine className="h-4 w-4" />{isEn ? 'Care reflection' : '养护复盘'}
                </div>
                                <p className="mt-1 text-sm font-semibold leading-6 text-ink/50">{isEn ? 'Record what you observed, a possible reason, and what you would change next time.' : '记录当时现象、可能原因和后续改进。'}</p>
              </div>
              {!editing && (
                <button type="button" onClick={startEditing} className="min-h-11 shrink-0 rounded-full border border-emerald-200 px-4 text-xs font-black text-emerald-800 hover:bg-emerald-50">
                  {hasReflection ? (isEn ? 'Edit record' : '编辑记录') : (isEn ? 'Add reflection' : '补充记录')}
                </button>
              )}
            </div>

            {editing && draft ? (
              <div className="mt-6 grid gap-4">
                <QuickDatePicker value={draft.date} onChange={value => updateDraft('date', value)} disabled={saving} isEn={isEn} />
                <label className="grid gap-1.5 text-xs font-black text-ink/65">
                  {isEn ? 'What did you observe?' : '当时看到什么'}
                  <textarea ref={firstFieldRef} value={draft.observation} onChange={event => updateDraft('observation', event.target.value)} rows={3} placeholder={isEn ? 'For example: stopped eating and stayed near the bottom' : '例如：拒食、趴底，活动量明显减少'} className="resize-y rounded-[14px] border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold leading-6 text-ink outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                </label>
                <MemorialCauseSelector value={draft.causeCodes} onChange={value => updateDraft('causeCodes', value)} disabled={saving} isEn={isEn} />
                {(draft.causeCodes.includes('other') || Boolean(draft.reason)) && (
                  <label className="grid gap-1.5 text-xs font-black text-ink/65">
                    {isEn ? 'Other reason' : '其他原因'}
                    <textarea value={draft.reason} onChange={event => updateDraft('reason', event.target.value)} rows={3} placeholder={isEn ? 'Describe the possibility in your own words' : '没有合适选项时，用自己的话补充'} className="resize-y rounded-[14px] border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold leading-6 text-ink outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                  </label>
                )}
                <label className="grid gap-1.5 text-xs font-black text-ink/65">
                  {isEn ? 'What will you change next time?' : '以后准备怎么做'}
                  <textarea value={draft.improvement} onChange={event => updateDraft('improvement', event.target.value)} rows={3} placeholder={isEn ? 'For example: acclimate longer and observe before feeding' : '例如：延长过水时间，入缸后先观察再喂食'} className="resize-y rounded-[14px] border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold leading-6 text-ink outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                </label>
                {error && <p role="alert" className="rounded-[14px] bg-rose-50 px-3 py-2 text-xs font-bold leading-5 text-rose-700">{error}</p>}
                <div className="sticky bottom-3 grid grid-cols-2 gap-2 rounded-[18px] border border-white/80 bg-white/92 p-2 shadow-[0_12px_32px_rgba(15,23,42,0.1)] backdrop-blur">
                  <button type="button" onClick={cancelEditing} disabled={saving} className="min-h-11 rounded-full border border-slate-200 text-sm font-black text-ink/65 disabled:opacity-50">{isEn ? 'Cancel' : '取消'}</button>
                  <button type="button" onClick={() => void saveReflection()} disabled={saving || !dirty} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45">
                    <Save className="h-4 w-4" />{saving ? (isEn ? 'Saving…' : '保存中…') : (isEn ? 'Save' : '保存')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-3">
                {[
                  { label: isEn ? 'What happened' : '当时现象', value: record.observation, fallback: isEn ? 'Not recorded' : '未记录' },
                  { label: isEn ? 'Possible cause' : '可能原因', value: [record.causeCodes?.map(code => getMemorialCauseLabel(code, isEn)).join(' · '), record.reason].filter(Boolean).join('\n'), fallback: isEn ? 'Not recorded' : '未记录' },
                  { label: isEn ? 'Next improvement' : '后续改进', value: record.improvement, fallback: isEn ? 'Not recorded' : '未记录' },
                ].map(item => (
                  <section key={item.label} className={`rounded-[18px] border p-4 ${item.value?.trim() ? 'border-slate-100 bg-slate-50/70' : 'border-dashed border-slate-200 bg-white'}`}>
                    <h3 className="text-[11px] font-black text-ink/42">{item.label}</h3>
                    <p className={`mt-2 whitespace-pre-line text-sm font-semibold leading-6 ${item.value?.trim() ? 'text-ink/72' : 'text-ink/38'}`}>{item.value?.trim() || item.fallback}</p>
                  </section>
                ))}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {fish && (
                    <button type="button" onClick={() => navigateToRoute(`/aquarium?action=add-species&species=${encodeURIComponent(fish.id)}`)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-xs font-black text-ink/60 hover:bg-slate-50">
                      <RotateCcw className="h-4 w-4" />{isEn ? 'Add this species again' : '重新添加该物种'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </article>
    </main>
    <Dialog open={Boolean(discardRequest)} onOpenChange={open => { if (!open) continueEditing(); }}>
      <DialogContent showCloseButton={false} className="max-w-md rounded-[26px]">
        <DialogHeader>
          <DialogTitle>{isEn ? 'Discard unsaved reflection?' : '放弃未保存的复盘吗？'}</DialogTitle>
          <DialogDescription>{isEn ? 'Your latest edits have not been saved.' : '刚才填写的内容还没有保存。'}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button type="button" onClick={continueEditing} className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-black text-ink/65">
            {isEn ? 'Continue editing' : '继续编辑'}
          </button>
          <button type="button" onClick={discardChanges} className="min-h-11 rounded-2xl bg-rose-600 px-4 text-sm font-black text-white">
            {isEn ? 'Discard changes' : '放弃修改'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
