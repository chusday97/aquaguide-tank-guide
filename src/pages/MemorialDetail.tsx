import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, ClipboardPenLine, HeartHandshake, RotateCcw, Save } from 'lucide-react';
import { useParams } from 'react-router-dom';
import i18n from '../i18n';
import { ResilientImage } from '../components/common/ResilientImage';
import { useToast } from '../components/common/ToastProvider';
import { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';
import { fishData } from '../data/fishData';
import { getSpeciesImageClass, getSpeciesVisualSources } from '../lib/speciesVisual';
import type { MemorialItem } from '../modules/collection/collection.types';
import { getCollectionSnapshot, subscribeToCollection } from '../services/collection/collection.service';
import { getCurrentAquaGuideRepository } from '../services/repository/repository-provider';

type MemorialDraft = {
  date: string;
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
  observation: record.observation || '',
  reason: record.reason || '',
  improvement: record.improvement || '',
});

const sameDraft = (left: MemorialDraft, right: MemorialDraft) => (
  left.date === right.date
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
  const [draft, setDraft] = useState<MemorialDraft | null>(() => (record ? createDraft(record) : null));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const firstFieldRef = useRef<HTMLTextAreaElement | null>(null);

  const fish = useMemo(() => fishData.find(item => item.id === record?.fishId), [record?.fishId]);
  const initialDraft = useMemo(() => (record ? createDraft(record) : null), [record]);
  const dirty = Boolean(editing && draft && initialDraft && !sameDraft(draft, initialDraft));

  useEffect(() => subscribeToCollection(() => {
    const next = getCollectionSnapshot().memorials.find(item => item.id === recordId) || null;
    setRecord(next);
    if (next && !dirty) setDraft(createDraft(next));
  }), [dirty, recordId]);

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

  useEffect(() => registerNavigationGuard(dirty
    ? () => window.confirm(isEn ? 'Your reflection has unsaved changes. Leave this page?' : '复盘内容还没有保存，确定离开吗？')
    : null), [dirty, isEn, registerNavigationGuard]);

  const updateDraft = (field: keyof MemorialDraft, value: string) => {
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
    if (dirty && !window.confirm(isEn ? 'Discard these unsaved changes?' : '放弃尚未保存的修改吗？')) return;
    if (record) setDraft(createDraft(record));
    setEditing(false);
    setError('');
  };

  const saveReflection = async () => {
    if (!record || !draft || saving) return;
    if (!draft.date) {
      setError(isEn ? 'Choose the date of this record.' : '请选择记录日期。');
      return;
    }
    if (!draft.observation.trim() && !draft.reason.trim() && !draft.improvement.trim()) {
      setError(isEn ? 'Add at least one observation, possible reason, or improvement.' : '请至少填写当时现象、可能原因或后续改进中的一项。');
      firstFieldRef.current?.focus();
      return;
    }

    setSaving(true);
    setError('');
    try {
      const repository = await getCurrentAquaGuideRepository();
      const saved = await repository.updateMemorial({
        id: record.id,
        date: draft.date,
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

  if (!record) {
    return (
      <main className="page-frame mx-auto w-full max-w-[980px] pb-24">
        <button type="button" onClick={() => navigateToRoute('/collection/memorial')} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-black text-emerald-800 hover:bg-emerald-50">
          <ArrowLeft className="h-4 w-4" />{isEn ? 'Back to Memorials' : '返回生命纪念'}
        </button>
        <section className="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-14 text-center">
          <HeartHandshake className="mx-auto h-9 w-9 text-ink/20" />
          <h1 className="mt-4 text-xl font-black text-ink">{isEn ? 'This record is unavailable' : '没有找到这条生命纪念'}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-ink/50">{isEn ? 'It may have been removed. Return to the memorial list to view the records that are still available.' : '它可能已经被移除。返回生命纪念列表可以查看现有记录。'}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-frame mx-auto w-full max-w-[1080px] pb-24">
      <button type="button" onClick={() => navigateToRoute('/collection/memorial')} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-black text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
        <ArrowLeft className="h-4 w-4" />{isEn ? 'Back to Memorials' : '返回生命纪念'}
      </button>

      <article data-memorial-detail={record.id} className="mt-2 overflow-hidden rounded-[28px] border border-white/85 bg-white shadow-[0_18px_50px_rgba(42,58,51,0.09)]">
        <div className="grid min-w-0 lg:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.12fr)]">
          <section className="relative min-h-[300px] overflow-hidden bg-[radial-gradient(circle_at_50%_25%,#eff8f4_0%,#e4eee9_56%,#d8e3dd_100%)] p-5 sm:p-7 lg:min-h-[640px]">
            <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3 sm:inset-x-7 sm:top-7">
              <span className="rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-[11px] font-black text-slate-600 shadow-sm">
                {record.reason?.trim() ? (isEn ? 'Reflection recorded' : '已完成复盘') : (isEn ? 'Reflection needed' : '待补充复盘')}
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
                <h2 className="mt-2 text-[22px] font-black text-ink">{isEn ? 'Keep what you learned' : '把这次经验留下来'}</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-ink/50">{isEn ? 'Record what you observed, a possible cause, and one change for next time.' : '记录看到的现象、可能原因，以及下次准备改变的一件事。'}</p>
              </div>
              {!editing && (
                <button type="button" onClick={startEditing} className="min-h-11 shrink-0 rounded-full border border-emerald-200 px-4 text-xs font-black text-emerald-800 hover:bg-emerald-50">
                  {record.reason?.trim() ? (isEn ? 'Edit' : '编辑复盘') : (isEn ? 'Add reflection' : '补充复盘')}
                </button>
              )}
            </div>

            {editing && draft ? (
              <div className="mt-6 grid gap-4">
                <label className="grid gap-1.5 text-xs font-black text-ink/65">
                  {isEn ? 'Record date' : '记录日期'}
                  <input type="date" value={draft.date} onChange={event => updateDraft('date', event.target.value)} className="min-h-11 rounded-[14px] border border-slate-200 bg-white px-3 text-sm font-bold text-ink outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                </label>
                <label className="grid gap-1.5 text-xs font-black text-ink/65">
                  {isEn ? 'What did you observe?' : '当时看到什么'}
                  <textarea ref={firstFieldRef} value={draft.observation} onChange={event => updateDraft('observation', event.target.value)} rows={3} placeholder={isEn ? 'For example: stopped eating and stayed near the bottom' : '例如：拒食、趴底，活动量明显减少'} className="resize-y rounded-[14px] border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold leading-6 text-ink outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                </label>
                <label className="grid gap-1.5 text-xs font-black text-ink/65">
                  {isEn ? 'Possible cause' : '可能原因'}
                  <textarea value={draft.reason} onChange={event => updateDraft('reason', event.target.value)} rows={3} placeholder={isEn ? 'Write a possibility, not a definite diagnosis' : '写下可能性，不需要把它当成确定诊断'} className="resize-y rounded-[14px] border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold leading-6 text-ink outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                </label>
                <label className="grid gap-1.5 text-xs font-black text-ink/65">
                  {isEn ? 'What will you change next time?' : '以后准备怎么做'}
                  <textarea value={draft.improvement} onChange={event => updateDraft('improvement', event.target.value)} rows={3} placeholder={isEn ? 'For example: acclimate longer and observe before feeding' : '例如：延长过水时间，入缸后先观察再喂食'} className="resize-y rounded-[14px] border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold leading-6 text-ink outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                </label>
                {error && <p role="alert" className="rounded-[14px] bg-rose-50 px-3 py-2 text-xs font-bold leading-5 text-rose-700">{error}</p>}
                <div className="sticky bottom-3 grid grid-cols-2 gap-2 rounded-[18px] border border-white/80 bg-white/92 p-2 shadow-[0_12px_32px_rgba(15,23,42,0.1)] backdrop-blur">
                  <button type="button" onClick={cancelEditing} disabled={saving} className="min-h-11 rounded-full border border-slate-200 text-sm font-black text-ink/65 disabled:opacity-50">{isEn ? 'Cancel' : '取消'}</button>
                  <button type="button" onClick={() => void saveReflection()} disabled={saving || !dirty} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45">
                    <Save className="h-4 w-4" />{saving ? (isEn ? 'Saving…' : '保存中…') : (isEn ? 'Save reflection' : '保存复盘')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-3">
                {[
                  { label: isEn ? 'What happened' : '当时现象', value: record.observation, fallback: isEn ? 'No observation recorded yet.' : '还没有记录当时看到的现象。' },
                  { label: isEn ? 'Possible cause' : '可能原因', value: record.reason, fallback: isEn ? 'No possible cause recorded yet.' : '还没有记录可能原因。' },
                  { label: isEn ? 'Next improvement' : '后续改进', value: record.improvement, fallback: isEn ? 'No improvement recorded yet.' : '还没有记录下次准备怎么做。' },
                ].map(item => (
                  <section key={item.label} className={`rounded-[18px] border p-4 ${item.value?.trim() ? 'border-slate-100 bg-slate-50/70' : 'border-dashed border-slate-200 bg-white'}`}>
                    <h3 className="text-[11px] font-black text-ink/42">{item.label}</h3>
                    <p className={`mt-2 text-sm font-semibold leading-6 ${item.value?.trim() ? 'text-ink/72' : 'text-ink/38'}`}>{item.value?.trim() || item.fallback}</p>
                  </section>
                ))}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-50 px-4 text-xs font-black text-emerald-800">
                    <Check className="h-4 w-4" />{isEn ? 'Reflection supports future care decisions' : '复盘用于改进后续养护'}
                  </span>
                  {fish && (
                    <button type="button" onClick={() => navigateToRoute(`/aquarium?action=add-species&species=${encodeURIComponent(fish.id)}`)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-xs font-black text-ink/60 hover:bg-slate-50">
                      <RotateCcw className="h-4 w-4" />{isEn ? 'Add again' : '再次加入'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </article>
    </main>
  );
}
