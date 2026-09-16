import { useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, List, Waves } from 'lucide-react';
import type { CareTopic } from '../../data/careTopicsData';
import { runtimeCareTopicsData } from '../../data/runtimeContentCatalog';
import { getCareVisualSources } from '../../lib/careVisual';
import { ResilientImage } from '../common/ResilientImage';
import { getKnowledgeObservations, type KnowledgeObjectId, type KnowledgeObservation } from './knowledgeJourney';

type Props = {
  isEn?: boolean;
  onOpenTopic: (topicId: string, sourceId: string) => void;
  onBrowseList: (query?: string) => void;
};

type CareLayer = {
  id: KnowledgeObjectId;
  zh: string;
  en: string;
  hintZh: string;
  hintEn: string;
  className: string;
  topicIds: string[];
  searchQuery: string;
};

const careLayers: CareLayer[] = [
  { id: 'water_surface', zh: '水面', en: 'Surface', hintZh: '泡沫 · 油膜 · 浮头', hintEn: 'Foam · film · gasping', className: 'is-surface', topicIds: ['qa_gen_003', 'qa_gen_020', 'guide_water_deteriorate'], searchQuery: '水面 油膜 浮头' },
  { id: 'water_body', zh: '水体', en: 'Water', hintZh: '浑浊 · 氨氮 · 温差', hintEn: 'Cloudiness · ammonia · temperature', className: 'is-water', topicIds: ['qa_gen_001', 'qa_gen_002', 'qa_gen_006'], searchQuery: '水质 浑浊 氨 亚硝酸盐' },
  { id: 'livestock', zh: '缸内生物', en: 'Livestock', hintZh: '追咬 · 混养 · 拥挤', hintEn: 'Chasing · stocking · crowding', className: 'is-life', topicIds: ['qa_gen_008', 'qa_gen_007', 'qa_gen_010'], searchQuery: '追咬 混养 拥挤' },
  { id: 'plants_equipment', zh: '水草与灯光', en: 'Plants & light', hintZh: '藻类 · 融叶 · 光照', hintEn: 'Algae · melting · light', className: 'is-plants', topicIds: ['qa_gen_017', 'qa_gen_018', 'qa_gen_019'], searchQuery: '水草 藻类 光照' },
  { id: 'substrate', zh: '底床', en: 'Substrate', hintZh: '残饵 · 清洁 · 有机物', hintEn: 'Waste · cleaning · organics', className: 'is-substrate', topicIds: ['qa_gen_015', 'qa_gen_014', 'guide_water_deteriorate'], searchQuery: '底床 残饵 清洁' },
  { id: 'filter', zh: '过滤系统', en: 'Filtration', hintZh: '滤材 · 流量 · 增氧', hintEn: 'Media · flow · aeration', className: 'is-filter', topicIds: ['qa_gen_016', 'qa_gen_026', 'qa_gen_027'], searchQuery: '过滤器 滤材 增氧' },
];
const getProblemTopics = (layer: CareLayer, problem: KnowledgeObservation): CareTopic[] => {
  const byId = new Map(runtimeCareTopicsData.map(topic => [topic.id, topic]));
  const ids = [problem.topicId, ...layer.topicIds].filter((id): id is string => Boolean(id));
  return Array.from(new Set(ids)).map(id => byId.get(id)).filter((topic): topic is CareTopic => Boolean(topic));
};

const getUrgencyTone = (topic: CareTopic): 'priority' | 'soon' | 'routine' => {
  const urgency = String(topic.urgency).trim().toLowerCase();
  if (urgency.includes('高优先级') || urgency.includes('high priority') || urgency.includes('urgent')) return 'priority';
  if (urgency.includes('尽快处理') || urgency.includes('review soon') || urgency.includes('asap')) return 'soon';
  return 'routine';
};

const getStatusLabel = (topic: CareTopic, isEn: boolean) => {
  const tone = getUrgencyTone(topic);
  if (isEn) return tone === 'priority' ? 'Priority' : tone === 'soon' ? 'Review soon' : 'Routine';
  return tone === 'priority' ? '高优先级' : tone === 'soon' ? '尽快处理' : '日常';
};

export function KnowledgeSceneExplorer({ isEn = false, onOpenTopic, onBrowseList }: Props) {
  const [selectedLayerId, setSelectedLayerId] = useState<KnowledgeObjectId | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [guideIndex, setGuideIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const selectedLayer = useMemo(
    () => careLayers.find(layer => layer.id === selectedLayerId) || null,
    [selectedLayerId]
  );
  const problems = useMemo(() => selectedLayer ? getKnowledgeObservations(selectedLayer.id) : [], [selectedLayer]);
  const selectedProblem = useMemo(
    () => problems.find(problem => problem.id === selectedProblemId) || null,
    [problems, selectedProblemId]
  );
  const guides = useMemo(
    () => selectedLayer && selectedProblem ? getProblemTopics(selectedLayer, selectedProblem) : [],
    [selectedLayer, selectedProblem]
  );
  const activeGuide = guides[guideIndex] || null;
  const visual = activeGuide ? getCareVisualSources(activeGuide.imageUrl) : null;

  const selectLayer = (layer: CareLayer) => {
    setSelectedLayerId(layer.id);
    setSelectedProblemId(null);
    setGuideIndex(0);
  };

  const selectProblem = (problem: KnowledgeObservation) => {
    setSelectedProblemId(problem.id);
    setGuideIndex(0);
  };

  const stepGuide = (delta: number) => {
    if (guides.length < 2) return;
    setGuideIndex(current => (current + delta + guides.length) % guides.length);
  };

  const openActiveGuide = () => {
    if (activeGuide && selectedLayer && selectedProblem) {
      onOpenTopic(activeGuide.id, `knowledge-layer-${selectedLayer.id}-${selectedProblem.id}`);
      return;
    }
    if (selectedLayer) onBrowseList(selectedLayer.searchQuery);
  };
  const copy = isEn
    ? {
        eyebrow: 'Interactive care guide',
        title: 'Choose a layer, then choose the problem.',
        subtitle: 'The aquarium layers narrow the context. A problem choice comes before any guide.',
        browse: 'Browse all guides',
        problems: 'Possible problems',
        identify: 'What problem is this?',
        related: 'Related care guides',
        chooseLayer: 'Choose an aquarium layer',
        chooseLayerBody: 'Then select the problem you actually see. Guides stay hidden until the problem is chosen.',
        chooseProblem: 'Choose one visible problem',
        chooseProblemBody: 'The problem summary and matching care guides will appear here.',
        open: 'Open guide',
      }
    : {
        eyebrow: '互动养护指南',
        title: '先选生态层，再选你看到的问题。',
        subtitle: '生态层只负责缩小范围；用户确认“是什么问题”以后，右侧才出现对应养护指南。',
        browse: '浏览全部指南',
        problems: '这一层可能的问题',
        identify: '这是什么问题',
        related: '相关养护指南',
        chooseLayer: '先点击一个生态层',
        chooseLayerBody: '再选择这一层里你实际看到的问题；问题未确认前，不直接给指南。',
        chooseProblem: '再选择一个具体问题',
        chooseProblemBody: '右侧会先解释问题是什么，再显示对应养护指南。',
        open: '打开指南',
      };

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 45) stepGuide(delta < 0 ? 1 : -1);
  };

  return (
    <section className="interactive-care-scene interactive-care-ecosystem" aria-label={isEn ? 'Interactive aquarium care guide' : '互动鱼缸养护指南'}>
      <header className="interactive-care-toolbar">
        <div>
          <div className="interactive-tank-eyebrow"><Waves className="h-4 w-4" />{copy.eyebrow}</div>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <button type="button" onClick={() => onBrowseList()} className="interactive-care-browse-all"><List className="h-4 w-4" />{copy.browse}</button>
      </header>

      <div className="interactive-care-workspace">
        <div className="interactive-care-layer-column">
          <div className="interactive-care-ecosystem-map" aria-label={isEn ? 'Aquarium ecosystem layers' : '鱼缸生态层级'}>
            {careLayers.filter(layer => layer.id !== 'filter').map(layer => (
              <button
                key={layer.id}
                type="button"
                aria-pressed={selectedLayerId === layer.id}
                onClick={() => selectLayer(layer)}
                className={`interactive-care-layer ${layer.className} ${selectedLayerId === layer.id ? 'is-selected' : ''}`}
              >
                <strong>{isEn ? layer.en : layer.zh}</strong>
                <span>{isEn ? layer.hintEn : layer.hintZh}</span>
              </button>
            ))}
            {(() => {
              const filterLayer = careLayers.find(layer => layer.id === 'filter')!;
              return (
                <button
                  type="button"
                  aria-pressed={selectedLayerId === filterLayer.id}
                  onClick={() => selectLayer(filterLayer)}
                  className={`interactive-care-filter-layer ${selectedLayerId === filterLayer.id ? 'is-selected' : ''}`}
                >
                  {isEn ? filterLayer.en : filterLayer.zh}
                </button>
              );
            })()}
          </div>

          <div className={`interactive-care-problem-panel ${selectedLayer ? 'is-active' : ''}`} aria-live="polite">
            {!selectedLayer ? (
              <div className="interactive-care-problem-empty">
                <strong>{copy.chooseLayer}</strong>
                <span>{copy.chooseLayerBody}</span>
              </div>
            ) : (
              <>
                <div className="interactive-care-problem-head">
                  <div>
                    <span>{copy.problems}</span>
                    <strong>{isEn ? selectedLayer.en : selectedLayer.zh}</strong>
                  </div>
                  <span>{problems.length}</span>
                </div>
                <div className="interactive-care-problem-grid">
                  {problems.map(problem => (
                    <button
                      key={problem.id}
                      type="button"
                      aria-pressed={selectedProblemId === problem.id}
                      onClick={() => selectProblem(problem)}
                      className={selectedProblemId === problem.id ? 'is-selected' : ''}
                    >
                      <span>{isEn ? (problem.labelEn || problem.label) : problem.label}</span>
                      <small>{problem.urgency === 'urgent' ? (isEn ? 'Priority' : '优先处理') : problem.urgency === 'watch' ? (isEn ? 'Watch' : '需要观察') : (isEn ? 'Routine' : '日常')}</small>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="interactive-care-guide-panel" aria-live="polite">
          {!selectedLayer && (
            <div className="interactive-care-guide-empty">
              <BookOpen className="h-6 w-6" />
              <strong>{copy.chooseLayer}</strong>
              <p>{copy.chooseLayerBody}</p>
            </div>
          )}

          {selectedLayer && !selectedProblem && (
            <div className="interactive-care-guide-empty">
              <BookOpen className="h-6 w-6" />
              <strong>{copy.chooseProblem}</strong>
              <p>{copy.chooseProblemBody}</p>
            </div>
          )}

          {selectedLayer && selectedProblem && activeGuide && (
            <div className="interactive-care-carousel">
              <section className="interactive-care-problem-identify">
                <div className="interactive-care-section-label">{copy.identify}</div>
                <div className="interactive-care-problem-title-row">
                  <h3>{isEn ? (selectedProblem.labelEn || selectedProblem.label) : selectedProblem.label}</h3>
                  <span className={`interactive-care-problem-urgency is-${selectedProblem.urgency}`}>
                    {selectedProblem.urgency === 'urgent' ? (isEn ? 'Priority' : '优先处理') : selectedProblem.urgency === 'watch' ? (isEn ? 'Watch' : '需要观察') : (isEn ? 'Routine' : '日常')}
                  </span>
                </div>
                <p>{activeGuide.summary}</p>
                <div className="interactive-care-problem-keywords">
                  {selectedProblem.searchQuery.split(/\s+/).filter(Boolean).slice(0, 4).map(keyword => <span key={keyword}>{keyword}</span>)}
                </div>
              </section>

              <div className="interactive-care-carousel-head">
                <div>
                  <span>{copy.related}</span>
                  <h4>{activeGuide.title}</h4>
                </div>
                <span className="interactive-care-carousel-count">{guideIndex + 1} / {guides.length}</span>
              </div>

              <div className="interactive-care-guide-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                <ResilientImage
                  src={visual?.detail || activeGuide.imageUrl}
                  srcSet={visual ? `${visual.thumbnail} 480w, ${visual.detail} 960w` : undefined}
                  sizes="(max-width: 767px) calc(100vw - 64px), 480px"
                  alt={activeGuide.title}
                  className="interactive-care-guide-image"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="interactive-care-guide-copy">
                <span className={getUrgencyTone(activeGuide) === 'priority' ? 'is-priority' : ''}>{getStatusLabel(activeGuide, isEn)}</span>
                <p>{activeGuide.summary}</p>
                <div className="interactive-care-carousel-dots" aria-label={isEn ? 'Guide carousel position' : '指南轮播位置'}>
                  {guides.map((guide, index) => (
                    <button key={guide.id} type="button" aria-label={isEn ? `Guide ${index + 1}` : `第 ${index + 1} 条指南`} aria-current={index === guideIndex ? 'true' : undefined} onClick={() => setGuideIndex(index)} />
                  ))}
                </div>
              </div>

              <div className="interactive-care-guide-actions">
                <div className="interactive-care-guide-arrows">
                  <button type="button" aria-label={isEn ? 'Previous guide' : '上一条指南'} onClick={() => stepGuide(-1)} disabled={guides.length < 2}><ChevronLeft className="h-4 w-4" /></button>
                  <button type="button" aria-label={isEn ? 'Next guide' : '下一条指南'} onClick={() => stepGuide(1)} disabled={guides.length < 2}><ChevronRight className="h-4 w-4" /></button>
                </div>
                <button type="button" className="interactive-care-open-guide" onClick={openActiveGuide}>{copy.open}<BookOpen className="h-4 w-4" /></button>
              </div>
            </div>
          )}

          {selectedLayer && selectedProblem && !activeGuide && (
            <div className="interactive-care-guide-empty">
              <BookOpen className="h-6 w-6" />
              <strong>{isEn ? 'No reviewed guide is available for this problem yet.' : '这个问题暂时没有可用指南'}</strong>
              <button type="button" onClick={() => onBrowseList(selectedProblem.searchQuery)} className="interactive-care-open-guide">{copy.browse}</button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
