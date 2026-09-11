import { useState, type CSSProperties } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Droplets, Fish, Leaf, List, Sparkles, Waves, Wind } from 'lucide-react';
import { fishData } from '../../data/fishData';
import type { KnowledgeObjectId } from './knowledgeJourney';
import { ResilientImage } from '../common/ResilientImage';
import { getSpeciesImageClass, getSpeciesVisualSources } from '../../lib/speciesVisual';
import { buildKnowledgeJourney, getKnowledgeObservations, type KnowledgeObservation } from './knowledgeJourney';

type SceneObject = { id: KnowledgeObjectId; title: string; hint: string; icon: typeof Droplets; tone: string; left: string; top: string };
const sceneObjects: SceneObject[] = [
  { id: 'water_surface', title: '水面', hint: '泡沫、油膜、浮头', icon: Waves, tone: 'text-sky-700', left: '34%', top: '19%' },
  { id: 'water_body', title: '水体', hint: '发白、发绿、浑浊', icon: Droplets, tone: 'text-cyan-700', left: '17%', top: '47%' },
  { id: 'livestock', title: '缸内生物', hint: '拒食、躲藏、追咬', icon: Fish, tone: 'text-amber-800', left: '53%', top: '48%' },
  { id: 'filter', title: '过滤', hint: '水流、噪音、停转', icon: Wind, tone: 'text-slate-700', left: '82%', top: '34%' },
  { id: 'substrate', title: '底床', hint: '残饵、污物、异味', icon: Sparkles, tone: 'text-orange-700', left: '39%', top: '75%' },
  { id: 'plants_equipment', title: '水草与设备', hint: '黄叶、灯光、加热', icon: Leaf, tone: 'text-emerald-700', left: '70%', top: '70%' },
];
const creaturePositions = [
  { left: '9%', top: '32%', width: '21%', delay: '-.9s' },
  { left: '47%', top: '27%', width: '17%', delay: '-2.1s' },
  { left: '64%', top: '54%', width: '15%', delay: '-3.2s' },
] as const;

type Props = {
  isEn?: boolean;
  onOpenTopic: (topicId: string, sourceId: string) => void;
  onBrowseList: (query?: string) => void;
};

export function KnowledgeSceneExplorer({ isEn = false, onOpenTopic, onBrowseList }: Props) {
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<KnowledgeObservation | null>(null);
  const selectedJourney = selectedObject && selectedObservation ? buildKnowledgeJourney(selectedObject.id, selectedObservation) : null;
  const urgent = selectedJourney?.urgency === 'urgent';
  const copy = isEn
    ? { eyebrow: 'Scene guide', title: 'Point to what looks unusual.', description: 'Choose a place in the aquarium, then choose the visible sign. We give one relevant next step.', browse: 'Browse all guides', reset: 'Choose another area', source: 'Source review pending' }
    : { eyebrow: '场景找问题', title: '点你看到异常的位置。', description: '先点鱼缸里的位置，再点具体表现；系统只给一条相关的下一步。', browse: '传统浏览全部指南', reset: '重新选择位置', source: '来源待专项复核' };

  const chooseObject = (object: SceneObject) => {
    setSelectedObject(object);
    setSelectedObservation(null);
  };

  const openJourney = () => {
    if (!selectedJourney || !selectedObservation) return;
    if (selectedJourney.relatedArticleIds[0]) {
      onOpenTopic(selectedJourney.relatedArticleIds[0], `knowledge-scene-${selectedJourney.id}`);
      return;
    }
    onBrowseList(selectedObservation.searchQuery);
  };

  return (
    <section className="interactive-tank-shell interactive-care-scene" aria-label={isEn ? 'Interactive aquarium care guide' : '互动鱼缸养护指南'}>
      <div className="interactive-tank-copy">
        <div className="interactive-tank-eyebrow"><Waves className="h-4 w-4" />{copy.eyebrow}</div>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </div>
      <button type="button" onClick={() => onBrowseList()} className="interactive-tank-tool interactive-tank-list"><List className="h-4 w-4" />{copy.browse}</button>

      <div className={`interactive-tank-stage interactive-care-stage ${selectedObject ? 'has-selection' : ''}`}>
        <span aria-hidden="true" className="interactive-tank-surface" />
        <span aria-hidden="true" className="interactive-tank-plant plant-left" />
        <span aria-hidden="true" className="interactive-tank-plant plant-left-short" />
        <span aria-hidden="true" className="interactive-tank-plant plant-right" />
        <span aria-hidden="true" className="interactive-tank-rock rock-left" />
        <span aria-hidden="true" className="interactive-tank-rock rock-right" />
        <span aria-hidden="true" className="interactive-care-filter" />
        {fishData.slice(0, creaturePositions.length).map((fish, index) => {
          const position = creaturePositions[index];
          return <span key={fish.id} aria-hidden="true" className="interactive-tank-creature interactive-tank-decorative" style={{ left: position.left, top: position.top, width: position.width, '--scene-delay': position.delay } as CSSProperties}><ResilientImage src={getSpeciesVisualSources(fish).texture} alt="" loadingSurface="transparent" className={`h-full w-full object-contain ${getSpeciesImageClass(fish)}`} /></span>;
        })}
        {!selectedObject && <p className="interactive-tank-prompt">{isEn ? 'Choose the place where you noticed it' : '选择你注意到异常的位置'}</p>}
        {sceneObjects.map((object) => {
          const Icon = object.icon;
          const selected = selectedObject?.id === object.id;
          return <button key={object.id} type="button" aria-label={isEn ? `${translateTitle(object.id)}: ${translateHint(object.id)}` : `${object.title}：${object.hint}`} aria-pressed={selected} onClick={() => chooseObject(object)} className={`interactive-care-hotspot ${selected ? 'is-selected' : ''}`} style={{ left: object.left, top: object.top }}><span className={object.tone}><Icon className="h-5 w-5" /></span><span className="interactive-care-hotspot-label"><b>{isEn ? translateTitle(object.id) : object.title}</b><small>{isEn ? translateHint(object.id) : object.hint}</small></span></button>;
        })}
      </div>

      <div className={`interactive-tank-dock interactive-care-dock ${selectedObject ? 'is-visible' : ''}`} aria-live="polite">
        {selectedObject && !selectedObservation && <>
          <button type="button" onClick={() => setSelectedObject(null)} className="interactive-dock-back"><ArrowLeft className="h-4 w-4" />{copy.reset}</button>
          <div className="interactive-care-question"><span>{isEn ? 'One more choice' : '再确认一个现象'}</span><h3>{isEn ? translateTitle(selectedObject.id) : selectedObject.title}</h3></div>
          <div className="interactive-care-options">{getKnowledgeObservations(selectedObject.id).map(observation => <button key={observation.id} type="button" onClick={() => setSelectedObservation(observation)}>{getObservationLabel(observation, isEn)}<small>{observation.urgency === 'urgent' ? (isEn ? 'Priority sign' : '优先处理') : (isEn ? 'Continue safely' : '继续安全排查')}</small></button>)}</div>
        </>}
        {selectedObject && selectedObservation && selectedJourney && <>
          <button type="button" onClick={() => setSelectedObservation(null)} className="interactive-dock-back"><ArrowLeft className="h-4 w-4" />{isEn ? 'Change the sign' : '重新选择现象'}</button>
          <div className={`interactive-care-result ${urgent ? 'is-urgent' : ''}`}><span>{urgent ? (isEn ? 'Priority observation' : '优先观察项') : (isEn ? 'Your next step' : '接下来这样做')}</span><h3>{getObservationLabel(selectedObservation, isEn)}</h3><p>{urgent ? (isEn ? 'Open the safe priority guide before making broader changes.' : '先打开安全优先指引，再决定是否做更大调整。') : (isEn ? 'Open the matching guide and follow only the steps that apply.' : '打开对应指南，只执行与当前现象相关的步骤。')}</p></div>
          <button type="button" onClick={openJourney} className="interactive-tank-primary">{selectedJourney.relatedArticleIds[0] ? (urgent ? (isEn ? 'Open priority guide' : '打开优先处理指引') : (isEn ? 'Open matching guide' : '查看对应指南')) : (isEn ? 'Search matching guides' : '搜索相关指南')}<ArrowRight className="h-4 w-4" /></button>
          <span className="interactive-care-source"><AlertTriangle className="h-3.5 w-3.5" />{copy.source}</span>
        </>}
      </div>
    </section>
  );
}

function translateTitle(id: KnowledgeObjectId) { return ({ water_surface: 'Surface', water_body: 'Water', livestock: 'Livestock', filter: 'Filter', substrate: 'Substrate', plants_equipment: 'Plants & gear' } as const)[id]; }
function translateHint(id: KnowledgeObjectId) { return ({ water_surface: 'Foam, film, gasping', water_body: 'Cloudy, green, smell', livestock: 'Refusal, hiding, chasing', filter: 'Flow, noise, stopped', substrate: 'Waste, debris, odour', plants_equipment: 'Leaves, light, heater' } as const)[id]; }
function getObservationLabel(observation: KnowledgeObservation, isEn: boolean) {
  if (!isEn) return observation.label;
  return ({ oil_film: 'Oil film or persistent surface foam', gasping: 'Fish are gasping or breathing fast', cloudy: 'Water is cloudy, milky, or green', odor: 'There is a noticeable odour', behavior: 'Refusal to eat, hiding, or chasing', flow: 'Filter flow is weak or stopped', noise: 'The filter is making unusual noise', debris: 'There is heavy debris or leftover food', plants: 'Plants are yellowing or melting', heater: 'Light, heater, or aeration looks abnormal' } as Record<string, string>)[observation.id] || observation.label;
}
