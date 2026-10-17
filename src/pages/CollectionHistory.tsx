import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, ChevronRight, Fish, History as HistoryIcon, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fishData } from '../data/fishData';
import type { KeepingHistoryEvent, KeepingHistorySnapshot } from '../modules/collection/collection.types';
import { loadCurrentKeepingHistory, subscribeToCollection } from '../services/collection/collection.service';

type HistoryPayload = {
  source: 'local' | 'cloud';
  history: KeepingHistorySnapshot;
};

const eventLabels: Record<string, { zh: string; en: string }> = {
  aquarium_created: { zh: '建立鱼缸', en: 'Aquarium created' },
  species_added: { zh: '加入生物', en: 'Livestock added' },
  species_removed: { zh: '移出生物', en: 'Livestock removed' },
  feeding: { zh: '喂食记录', en: 'Feeding' },
  water_change: { zh: '换水记录', en: 'Water change' },
  observation: { zh: '观察记录', en: 'Observation' },
  daily_check: { zh: '每日检查', en: 'Daily check' },
  diagnosis: { zh: '问题记录', en: 'Issue recorded' },
  care_reminder_completed: { zh: '养护完成', en: 'Care completed' },
  life_stage_updated: { zh: '生长状态更新', en: 'Life stage updated' },
  memorial: { zh: '生命纪念', en: 'Memorial' },
  compatibility_decision: { zh: '混养判断', en: 'Compatibility decision' },
};

const eventIcon = (event: KeepingHistoryEvent) => {
  if (event.eventType === 'compatibility_decision') return ShieldCheck;
  if (event.eventType === 'species_added' || event.eventType === 'species_removed' || event.eventType === 'life_stage_updated') return Fish;
  return Activity;
};

export default function CollectionHistory() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const [data, setData] = useState<HistoryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        setError('');
        const next = await loadCurrentKeepingHistory();
        if (!cancelled) setData({ source: next.source, history: next.history });
      } catch {
        if (!cancelled) setError(isEn ? 'Your keeping history could not be loaded.' : '养鱼履历暂时无法加载。');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const onFocus = () => void refresh();
    void refresh();
    window.addEventListener('focus', onFocus);
    const unsubscribe = subscribeToCollection(onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      unsubscribe();
    };
  }, [isEn]);

  const speciesById = useMemo(() => new Map(fishData.map(fish => [fish.id, fish])), []);

  const speciesLabel = (speciesId: string) => {
    const species = speciesById.get(speciesId);
    if (species) return isEn ? (species.scientificName || species.name) : species.name;
    return isEn ? 'Recorded species' : '已记录物种';
  };

  const formatDate = (value: string, withTime = false) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(isEn ? 'en-US' : 'zh-CN', withTime
      ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  };

  const history = data?.history;
  const currentCount = history?.currentSpeciesIds.length || 0;
  const everCount = history?.speciesEverKeptIds.length || 0;
  const eventCount = history?.events.length || 0;

  return (
    <div data-workspace-layout="standard" className="page-frame-wide mx-auto w-full pb-24">
      <header className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/collection')}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-black text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEn ? 'My Collection' : '我的水族册'}
        </button>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
              <HistoryIcon className="h-4 w-4" />
              {isEn ? 'Keeping history' : '个人养鱼履历'}
            </div>
            <h1 className="mt-2 text-[30px] font-bold text-ink md:text-[42px]">
              {isEn ? 'Your aquarium story' : '你养过什么，发生过什么'}
            </h1>
            <p className="mt-2 max-w-[720px] text-[13px] font-semibold leading-6 text-ink/56">
              {isEn
                ? 'A read-only history derived from your aquarium records. Current livestock, past species and real events stay connected without inventing missing facts.'
                : '这里不是另一套需要手动维护的数据。它从你的鱼缸记录里整理出当前在养、曾经养过和真实发生过的事件；缺失的信息不会被猜出来。'}
            </p>
          </div>
          {data && (
            <span className="hidden shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700 sm:inline-flex">
              {data.source === 'cloud' ? (isEn ? 'Cloud records' : '云端记录') : (isEn ? 'Local records' : '本地记录')}
            </span>
          )}
        </div>
      </header>

      {loading && (
        <div className="rounded-[28px] border border-black/5 bg-white p-8 text-center text-sm font-bold text-ink/45 shadow-sm">
          {isEn ? 'Loading your history…' : '正在整理你的养鱼履历…'}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-[28px] border border-rose-100 bg-rose-50 p-8 text-center">
          <p className="text-sm font-black text-rose-700">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-black text-rose-700 shadow-sm">
            {isEn ? 'Try again' : '重新加载'}
          </button>
        </div>
      )}

      {!loading && !error && history && (
        <div className="space-y-6">
          <section className="grid gap-3 sm:grid-cols-3" aria-label={isEn ? 'Keeping history summary' : '养鱼履历概览'}>
            {[
              [isEn ? 'Keeping now' : '当前在养', currentCount, isEn ? 'species' : '种'],
              [isEn ? 'Kept over time' : '曾经养过', everCount, isEn ? 'species' : '种'],
              [isEn ? 'Recorded events' : '历史事件', eventCount, isEn ? 'events' : '条'],
            ].map(([label, value, unit]) => (
              <div key={String(label)} className="rounded-[24px] border border-emerald-100/80 bg-white p-5 shadow-sm">
                <div className="text-[11px] font-black uppercase tracking-[0.12em] text-ink/42">{label}</div>
                <div className="mt-2 flex items-end gap-2">
                  <strong className="text-[30px] font-black leading-none text-ink">{value}</strong>
                  <span className="text-xs font-bold text-ink/42">{unit}</span>
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-[30px] border border-black/5 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center gap-2">
              <Fish className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-black text-ink">{isEn ? 'Currently keeping' : '当前在养'}</h2>
            </div>
            {history.activeCohorts.length === 0 ? (
              <p className="mt-5 rounded-[20px] bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-ink/45">
                {isEn ? 'No current livestock records yet.' : '目前还没有在养生物记录。'}
              </p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {history.activeCohorts.map(cohort => (
                  <div key={cohort.id} className="rounded-[22px] border border-emerald-100/70 bg-emerald-50/45 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[15px] font-black text-ink">{speciesLabel(cohort.speciesId)}</div>
                        <div className="mt-1 text-[11px] font-bold text-ink/45">{cohort.aquariumName}</div>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-emerald-800">{cohort.quantity} {isEn ? 'animals' : '只/条'}</span>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-ink/50">
                      {isEn ? 'Since ' : '入缸于 '}{formatDate(cohort.entryDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[30px] border border-black/5 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-black text-ink">{isEn ? 'Timeline' : '养殖时间线'}</h2>
            </div>
            {history.events.length === 0 ? (
              <p className="mt-5 rounded-[20px] bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-ink/45">
                {isEn ? 'Your real aquarium events will appear here as you use AquaGuide.' : '当你开始记录入缸、观察、养护和纪念后，真实事件会沉淀在这里。'}
              </p>
            ) : (
              <div className="mt-5 space-y-2">
                {history.events.map(event => {
                  const EventIcon = eventIcon(event);
                  const knownSpecies = event.speciesIds.map(speciesLabel);
                  const typeLabel = eventLabels[event.eventType]?.[isEn ? 'en' : 'zh'] || event.title;
                  return (
                    <article key={event.id} className="flex gap-3 rounded-[22px] border border-black/5 bg-slate-50/70 p-4">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                        <EventIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <div className="text-[13px] font-black text-ink">{typeLabel}</div>
                          <time className="text-[10px] font-bold text-ink/40">{formatDate(event.occurredAt, true)}</time>
                        </div>
                        {(event.label || event.aquariumName || knownSpecies.length > 0) && (
                          <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[11px] font-semibold leading-5 text-ink/50">
                            {event.label && <span>{event.label}</span>}
                            {event.aquariumName && <span>· {event.aquariumName}</span>}
                            {knownSpecies.length > 0 && <span>· {knownSpecies.join('、')}</span>}
                          </div>
                        )}
                        {event.isInferred && (
                          <div className="mt-2 text-[10px] font-bold text-ink/32">
                            {isEn ? 'Derived from the current recorded aquarium state' : '由当前已记录的鱼缸状态推导'}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <button
            type="button"
            onClick={() => navigate('/aquarium')}
            className="flex w-full items-center justify-between rounded-[24px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-left transition hover:bg-emerald-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span>
              <span className="block text-sm font-black text-emerald-900">{isEn ? 'Continue recording in My Aquarium' : '回到我的鱼缸继续记录'}</span>
              <span className="mt-1 block text-[11px] font-semibold text-emerald-900/55">{isEn ? 'New real events will be reflected here.' : '新的真实事件会继续沉淀到这份履历里。'}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-emerald-700" />
          </button>
        </div>
      )}
    </div>
  );
}
