import { useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Droplets, Fish, Leaf, Search, Sparkles, Waves, Wind } from 'lucide-react';
import type { KnowledgeObjectId } from '../../types';
import { buildKnowledgeJourney, getKnowledgeObservations, type KnowledgeObservation } from '../../modules/knowledge/knowledgeJourney';

type SceneObject = { id: KnowledgeObjectId; title: string; hint: string; icon: typeof Droplets; tone: string };
const sceneObjects: SceneObject[] = [
  { id: 'water_surface', title: '水面', hint: '泡沫、油膜、浮头', icon: Waves, tone: 'bg-sky-100 text-sky-700' },
  { id: 'water_body', title: '水体', hint: '发白、发绿、浑浊', icon: Droplets, tone: 'bg-cyan-100 text-cyan-700' },
  { id: 'livestock', title: '缸内生物', hint: '拒食、躲藏、追咬', icon: Fish, tone: 'bg-amber-100 text-amber-800' },
  { id: 'filter', title: '过滤', hint: '水流、噪音、停转', icon: Wind, tone: 'bg-slate-100 text-slate-700' },
  { id: 'substrate', title: '底床', hint: '残饵、污物、异味', icon: Sparkles, tone: 'bg-orange-100 text-orange-700' },
  { id: 'plants_equipment', title: '水草与设备', hint: '黄叶、灯光、加热', icon: Leaf, tone: 'bg-emerald-100 text-emerald-700' },
];

type Props = {
  isEn?: boolean;
  onOpenTopic: (topicId: string, sourceId: string) => void;
  onBrowseList: (query?: string) => void;
  contextFacts?: Array<{ label: string; value: string; status: 'confirmed' | 'unknown' }>;
};

export function KnowledgeSceneExplorer({ isEn = false, onOpenTopic, onBrowseList, contextFacts = [] }: Props) {
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<KnowledgeObservation | null>(null);
  const copy = isEn
    ? { eyebrow: 'Scene guide', title: 'What looks unusual?', description: 'Pick where you noticed it, then pick the visible sign. We only show a relevant next step.', browse: 'Browse all guides', back: 'Choose another area', source: 'Source review pending' }
    : { eyebrow: '场景找问题', title: '你先看到了什么？', description: '先点观察到的位置，再点具体表现；系统只给你一条相关的下一步。', browse: '传统浏览全部指南', back: '重新选择位置', source: '来源待专项复核' };

  const showObservation = (item: KnowledgeObservation) => {
    setSelectedObservation(item);
  };

  if (selectedObject && selectedObservation) {
    const journey = buildKnowledgeJourney(selectedObject.id, selectedObservation);
    const urgent = journey.urgency === 'urgent';
    return (
      <section className="rounded-[28px] border border-emerald-100 bg-white p-4 shadow-[0_18px_45px_rgba(22,101,83,.10)] md:p-6" aria-live="polite">
        <button type="button" onClick={() => setSelectedObservation(null)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-xs font-black text-emerald-800 hover:bg-emerald-50"><ArrowLeft className="h-4 w-4" />{copy.back}</button>
        <div className={`mt-3 rounded-[20px] border p-4 ${urgent ? 'border-red-100 bg-red-50' : 'border-emerald-100 bg-emerald-50/70'}`}>
          <div className="text-[11px] font-black uppercase tracking-[.16em] text-emerald-700">{isEn ? 'Observed sign' : '已选现象'}</div>
          <h2 className="mt-2 font-serif text-[25px] font-bold leading-tight text-ink">{getObservationLabel(selectedObservation, isEn)}</h2>
          <p className="mt-2 text-sm font-medium text-ink/62">{urgent ? (isEn ? 'Treat this as a priority observation. Open the safe emergency guide before making broader changes.' : '这是优先观察项。先打开安全应急指引，再决定是否做更大的调整。') : (isEn ? 'We found no direct diagnosis here. Continue through the matching guide or search the exact sign.' : '这里不做自动诊断；继续进入对应指南，或搜索更具体的现象。')}</p>
          {contextFacts.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{contextFacts.map(fact => <span key={fact.label} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-ink/58">{fact.label}：{fact.value}</span>)}</div>}
          <div className="mt-4 flex flex-wrap gap-2">
            {journey.relatedArticleIds[0] ? <button type="button" onClick={() => onOpenTopic(journey.relatedArticleIds[0], `knowledge-scene-${journey.id}`)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-800 px-4 text-xs font-black text-white hover:bg-emerald-900">{urgent ? (isEn ? 'Open priority guide' : '打开优先处理指引') : (isEn ? 'Open matching guide' : '查看对应指南')}<ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={() => onBrowseList(selectedObservation.searchQuery)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-800 px-4 text-xs font-black text-white hover:bg-emerald-900"><Search className="h-4 w-4" />{isEn ? 'Search matching guides' : '搜索相关指南'}</button>}
            <span className="inline-flex min-h-11 items-center rounded-full bg-amber-50 px-3 text-[10px] font-bold text-amber-800">{copy.source}</span>
          </div>
        </div>
      </section>
    );
  }

  if (selectedObject) {
    const Icon = selectedObject.icon;
    return (
      <section className="rounded-[28px] border border-emerald-100 bg-white p-4 shadow-[0_18px_45px_rgba(22,101,83,.10)] md:p-6">
        <button type="button" onClick={() => setSelectedObject(null)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-xs font-black text-emerald-800 hover:bg-emerald-50"><ArrowLeft className="h-4 w-4" />{copy.back}</button>
        <div className="mt-3 flex items-center gap-3"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${selectedObject.tone}`}><Icon className="h-6 w-6" /></span><div><div className="text-[11px] font-black text-emerald-700">{isEn ? 'One more choice' : '再确认一个现象'}</div><h2 className="font-serif text-[25px] font-bold text-ink">{isEn ? translateTitle(selectedObject.id) : selectedObject.title}</h2></div></div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">{getKnowledgeObservations(selectedObject.id).map(item => <button key={item.id} type="button" onClick={() => showObservation(item)} className="min-h-[76px] rounded-[18px] border border-emerald-100 bg-emerald-50/55 px-4 text-left text-sm font-black text-ink transition hover:border-emerald-300 hover:bg-emerald-50">{getObservationLabel(item, isEn)}<span className="mt-1 block text-[11px] font-medium text-ink/55">{item.urgency === 'urgent' ? (isEn ? 'Priority sign' : '优先处理') : (isEn ? 'Continue safely' : '继续安全排查')}</span></button>)}</div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-emerald-100 bg-[linear-gradient(145deg,#f6fffb_0%,#e7f8f6_50%,#f9fcf6_100%)] p-4 shadow-[0_18px_45px_rgba(22,101,83,.10)] md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="max-w-xl"><div className="text-[11px] font-black uppercase tracking-[.16em] text-emerald-700">{copy.eyebrow}</div><h2 className="mt-1 font-serif text-[26px] font-bold leading-tight text-ink md:text-[34px]">{copy.title}</h2><p className="mt-2 text-sm font-medium leading-relaxed text-ink/62">{copy.description}</p></div><button type="button" onClick={() => onBrowseList()} className="min-h-11 rounded-full border border-emerald-200 bg-white px-4 text-xs font-black text-emerald-800 shadow-sm hover:bg-emerald-50">{copy.browse}</button></div>
      <div className="relative mt-5 overflow-hidden rounded-[22px] border border-white/80 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.95),rgba(255,255,255,.42)_42%,rgba(139,211,202,.25)_100%)] p-3 md:p-5"><div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-4 h-20 rounded-[50%] border border-sky-200/70 bg-sky-100/40" /><div className="relative grid grid-cols-2 gap-2 sm:grid-cols-3">{sceneObjects.map(({ id, title, hint, icon: Icon, tone }) => <button key={id} type="button" onClick={() => setSelectedObject(sceneObjects.find(item => item.id === id)!)} className="group min-h-[116px] rounded-[18px] border border-white/85 bg-white/82 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"><span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-5 w-5" /></span><span className="mt-3 block text-[13px] font-black text-ink">{isEn ? translateTitle(id) : title}</span><span className="mt-0.5 block text-[11px] font-medium leading-snug text-ink/52">{isEn ? translateHint(id) : hint}</span></button>)}</div></div>
      <div className="mt-3 flex items-center gap-2 rounded-[16px] bg-amber-50 px-3 py-2 text-[12px] font-bold text-amber-900"><AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />{isEn ? 'Red flags are routed to a priority guide before any broad treatment advice.' : '红旗现象会先进入优先指引，不在这里直接给出大范围处理建议。'}</div>
    </section>
  );
}

function translateTitle(id: KnowledgeObjectId) { return ({ water_surface: 'Surface', water_body: 'Water', livestock: 'Livestock', filter: 'Filter', substrate: 'Substrate', plants_equipment: 'Plants & gear' } as const)[id]; }
function translateHint(id: KnowledgeObjectId) { return ({ water_surface: 'Foam, film, gasping', water_body: 'Cloudy, green, smell', livestock: 'Refusal, hiding, chasing', filter: 'Flow, noise, stopped', substrate: 'Waste, debris, odour', plants_equipment: 'Leaves, light, heater' } as const)[id]; }
function getObservationLabel(observation: KnowledgeObservation, isEn: boolean) {
  if (!isEn) return observation.label;
  return ({
    oil_film: 'Oil film or persistent surface foam', gasping: 'Fish are gasping or breathing fast', cloudy: 'Water is cloudy, milky, or green', odor: 'There is a noticeable odour', behavior: 'Refusal to eat, hiding, or chasing', flow: 'Filter flow is weak or stopped', noise: 'The filter is making unusual noise', debris: 'There is heavy debris or leftover food', plants: 'Plants are yellowing or melting', heater: 'Light, heater, or aeration looks abnormal',
  } as Record<string, string>)[observation.id] || observation.label;
}
