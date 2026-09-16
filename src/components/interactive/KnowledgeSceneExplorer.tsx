import { useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, List, Search, Waves } from 'lucide-react';
import type { CareTopic } from '../../data/careTopicsData';
import { runtimeCareTopicsData } from '../../data/runtimeContentCatalog';
import { getLatestCareGuide } from '../../data/latestCareGuideCatalog';
import { getCareVisualSources } from '../../lib/careVisual';
import { ResilientImage } from '../common/ResilientImage';
import { getKnowledgeObservations, getKnowledgeProblemGroups, type KnowledgeObjectId, type KnowledgeObservation, type KnowledgeProblemGroupId } from './knowledgeJourney';

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

type GuideCarouselItem = {
  id: string;
  title: string;
  imageUrl: string;
  label: string;
  summary: string;
  detail?: string;
  topicId?: string;
};

const careLayers: CareLayer[] = [
  { id: 'water_surface', zh: '水面', en: 'Surface', hintZh: '泡沫 · 油膜 · 浮头', hintEn: 'Foam · film · gasping', className: 'is-surface', topicIds: ['qa_gen_003', 'qa_gen_020', 'guide_water_deteriorate'], searchQuery: '水面 油膜 浮头' },
  { id: 'water_body', zh: '水体', en: 'Water', hintZh: '浑浊 · 氨氮 · 温差', hintEn: 'Cloudiness · ammonia · temperature', className: 'is-water', topicIds: ['qa_gen_001', 'qa_gen_002', 'qa_gen_006'], searchQuery: '水质 浑浊 氨 亚硝酸盐' },
  { id: 'livestock', zh: '缸内生物', en: 'Livestock', hintZh: '呼吸 · 体表 · 行为 · 繁殖', hintEn: 'Breathing · body · behavior · breeding', className: 'is-life', topicIds: ['qa_gen_008', 'qa_gen_007', 'qa_gen_010'], searchQuery: '鱼体异常 行为 繁殖 鱼苗' },
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
  const [selectedProblemGroupId, setSelectedProblemGroupId] = useState<KnowledgeProblemGroupId | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [guideIndex, setGuideIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const touchStartY = useRef<number | null>(null);
  const hoverLock = useRef(false);
  const hoverUnlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedLayer = useMemo(
    () => careLayers.find(layer => layer.id === selectedLayerId) || null,
    [selectedLayerId]
  );
  const allProblems = useMemo(() => selectedLayer ? getKnowledgeObservations(selectedLayer.id) : [], [selectedLayer]);
  const problemGroups = useMemo(() => selectedLayer ? getKnowledgeProblemGroups(selectedLayer.id) : [], [selectedLayer]);
  const problems = useMemo(
    () => problemGroups.length === 0 ? allProblems : selectedProblemGroupId ? allProblems.filter(problem => problem.groupId === selectedProblemGroupId) : [],
    [allProblems, problemGroups, selectedProblemGroupId]
  );
  const selectedProblem = useMemo(
    () => allProblems.find(problem => problem.id === selectedProblemId) || null,
    [allProblems, selectedProblemId]
  );
  const latestGuide = useMemo(
    () => getLatestCareGuide(selectedProblem?.latestCareGuideId),
    [selectedProblem]
  );
  const legacyGuides = useMemo(
    () => selectedLayer && selectedProblem && !latestGuide ? getProblemTopics(selectedLayer, selectedProblem) : [],
    [selectedLayer, selectedProblem, latestGuide]
  );
  const carouselItems = useMemo<GuideCarouselItem[]>(() => {
    if (latestGuide) {
      const cover: GuideCarouselItem = {
        id: `${latestGuide.id}:cover`,
        title: isEn ? latestGuide.titleEn : latestGuide.title,
        imageUrl: latestGuide.coverUrl || latestGuide.imageUrl,
        label: isEn ? 'Guide overview' : '指南概览',
        summary: isEn ? latestGuide.conditionEn : latestGuide.condition,
      };
      const steps = latestGuide.steps.map((step) => ({
        id: `${latestGuide.id}:step-${step.step}`,
        title: isEn ? step.titleEn : step.title,
        imageUrl: step.imageUrl,
        label: isEn ? `Step ${step.step} of ${latestGuide.steps.length}` : `第 ${step.step} 步 / 共 ${latestGuide.steps.length} 步`,
        summary: isEn ? step.howEn : step.how,
        detail: isEn ? step.whyEn : step.why,
      }));
      return [cover, ...steps];
    }
    return legacyGuides.map((topic) => {
      const visual = getCareVisualSources(topic.imageUrl);
      return {
        id: topic.id,
        title: topic.title,
        imageUrl: visual.detail || topic.imageUrl,
        label: getStatusLabel(topic, isEn),
        summary: topic.summary,
        topicId: topic.id,
      };
    });
  }, [latestGuide, legacyGuides, isEn]);
  const activeGuide = carouselItems[guideIndex] || null;

  const selectLayer = (layer: CareLayer) => {
    setSelectedLayerId(layer.id);
    setSelectedProblemGroupId(null);
    setSelectedProblemId(null);
    setGuideIndex(0);
  };

  const selectProblemGroup = (groupId: KnowledgeProblemGroupId) => {
    setSelectedProblemGroupId(groupId);
    setSelectedProblemId(null);
    setGuideIndex(0);
  };

  const selectProblem = (problem: KnowledgeObservation) => {
    setSelectedProblemId(problem.id);
    setGuideIndex(0);
  };

  const stepGuide = (delta: number) => {
    if (carouselItems.length < 2) return;
    setGuideIndex(current => (current + delta + carouselItems.length) % carouselItems.length);
  };

  const openActiveGuide = () => {
    if (!activeGuide || !selectedLayer || !selectedProblem) {
      if (selectedLayer) onBrowseList(selectedLayer.searchQuery);
      return;
    }
    if (latestGuide) {
      if (guideIndex < carouselItems.length - 1) {
        setGuideIndex((current) => current + 1);
      } else {
        onBrowseList(isEn ? latestGuide.titleEn : latestGuide.title);
      }
      return;
    }
    if (activeGuide.topicId) onOpenTopic(activeGuide.topicId, `knowledge-layer-${selectedLayer.id}-${selectedProblem.id}`);
  };
  const copy = isEn
    ? {
        eyebrow: 'Interactive care guide',
        title: 'Choose a layer, then choose the problem.',
        subtitle: 'The aquarium layers narrow the context. A problem choice comes before any guide.',
        browse: 'Browse all guides',
        problems: 'Possible problems',
        problemTypes: 'What kind of issue?',
        chooseGroup: 'Choose an issue type first',
        chooseGroupBody: 'Start with the type of sign you notice, then pick the closest visible problem.',
        identify: 'What problem is this?',
        related: 'Related care guides',
        chooseLayer: 'Choose an aquarium layer',
        chooseLayerBody: 'Then select the problem you actually see. Guides stay hidden until the problem is chosen.',
        chooseProblem: 'Choose one visible problem',
        chooseProblemBody: 'The problem summary and matching care guides will appear here.',
        open: 'Open guide',
        nextStep: 'Next step',
        avoid: 'Avoid',
        searchPlaceholder: 'Search care problems',
      }
    : {
        eyebrow: '互动养护指南',
        title: '先选生态层，再选你看到的问题。',
        subtitle: '生态层只负责缩小范围；用户确认“是什么问题”以后，右侧才出现对应养护指南。',
        browse: '浏览全部指南',
        problems: '这一层可能的问题',
        problemTypes: '先看哪一类异常',
        chooseGroup: '先选择问题类型',
        chooseGroupBody: '先判断更像呼吸、体表、游姿行为、体况，还是繁殖鱼苗问题，再选具体症状。',
        identify: '这是什么问题',
        related: '相关养护指南',
        chooseLayer: '先点击一个生态层',
        chooseLayerBody: '再选择这一层里你实际看到的问题；问题未确认前，不直接给指南。',
        chooseProblem: '再选择一个具体问题',
        chooseProblemBody: '右侧会先解释问题是什么，再显示对应养护指南。',
        open: '打开指南',
        nextStep: '下一步',
        avoid: '避免这样做',
        searchPlaceholder: '搜索问题或养护指南',
      };

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartY.current = event.changedTouches[0]?.clientY ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
    const delta = endY - touchStartY.current;
    touchStartY.current = null;
    if (Math.abs(delta) > 42) stepGuide(delta < 0 ? 1 : -1);
  };

  const holdHoverSelection = () => {
    hoverLock.current = true;
    if (hoverUnlockTimer.current) clearTimeout(hoverUnlockTimer.current);
    hoverUnlockTimer.current = setTimeout(() => { hoverLock.current = false; }, 320);
  };

  const selectGuideFromHover = (index: number) => {
    if (index === guideIndex || hoverLock.current) return;
    holdHoverSelection();
    setGuideIndex(index);
  };

  const onGuideWheel = (event: React.WheelEvent) => {
    if (carouselItems.length < 2 || Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    holdHoverSelection();
    stepGuide(event.deltaY > 0 ? 1 : -1);
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchTerm.trim();
    onBrowseList(query || undefined);
  };

  return (
    <section className="interactive-care-scene interactive-care-ecosystem" aria-label={isEn ? 'Interactive aquarium care guide' : '互动鱼缸养护指南'}>
      <header className="interactive-care-toolbar">
        <div>
          <div className="interactive-tank-eyebrow"><Waves className="h-4 w-4" />{copy.eyebrow}</div>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <div className="interactive-care-toolbar-actions">
          <form className="interactive-care-search" role="search" onSubmit={submitSearch}>
            <Search className="h-4 w-4" aria-hidden="true" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
            />
          </form>
          <button type="button" onClick={() => onBrowseList()} className="interactive-care-browse-all"><List className="h-4 w-4" />{copy.browse}</button>
        </div>
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

            {selectedLayer && (
              <div className={`interactive-care-layer-issue-menu is-${selectedLayer.id}`} aria-live="polite">
                <div className="interactive-care-layer-issue-head">
                  <span>{copy.problems}</span>
                  <strong>{isEn ? selectedLayer.en : selectedLayer.zh}</strong>
                </div>
                {problemGroups.length > 0 && (
                  <div className="interactive-care-layer-groups" aria-label={copy.problemTypes}>
                    {problemGroups.map(group => (
                      <button
                        key={group.id}
                        type="button"
                        aria-pressed={selectedProblemGroupId === group.id}
                        onClick={() => selectProblemGroup(group.id)}
                        className={selectedProblemGroupId === group.id ? 'is-selected' : ''}
                      >
                        {isEn ? group.labelEn : group.label}
                      </button>
                    ))}
                  </div>
                )}
                {(problemGroups.length === 0 || selectedProblemGroupId) && (
                  <div className="interactive-care-layer-problems">
                    {problems.map(problem => (
                      <button
                        key={problem.id}
                        type="button"
                        aria-pressed={selectedProblemId === problem.id}
                        onClick={() => selectProblem(problem)}
                        className={selectedProblemId === problem.id ? 'is-selected' : ''}
                      >
                        {isEn ? (problem.labelEn || problem.label) : problem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
              <strong>{problemGroups.length > 0 && !selectedProblemGroupId ? copy.chooseGroup : copy.chooseProblem}</strong>
              <p>{problemGroups.length > 0 && !selectedProblemGroupId ? copy.chooseGroupBody : copy.chooseProblemBody}</p>
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
                <p>{latestGuide ? (isEn ? latestGuide.conditionEn : latestGuide.condition) : activeGuide.summary}</p>
                <div className="interactive-care-problem-keywords">
                  {selectedProblem.searchQuery.split(/\s+/).filter(Boolean).slice(0, 4).map(keyword => <span key={keyword}>{keyword}</span>)}
                </div>
              </section>

              <div className="interactive-care-carousel-head">
                <div>
                  <span>{copy.related}</span>
                  <h4>{activeGuide.title}</h4>
                </div>
                <span className="interactive-care-carousel-count">{guideIndex + 1} / {carouselItems.length}</span>
              </div>

              <div
                className="interactive-care-guide-wheel"
                onWheel={onGuideWheel}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                aria-label={isEn ? 'Vertical care guide carousel' : '纵向养护卡轮播'}
              >
                <div className="interactive-care-wheel-viewport">
                  {carouselItems.map((guide, index) => {
                    const distance = index - guideIndex;
                    const visibleDistance = Math.max(-2, Math.min(2, distance));
                    const absDistance = Math.abs(distance);
                    return (
                      <button
                        key={guide.id}
                        type="button"
                        className={`interactive-care-wheel-card ${index === guideIndex ? 'is-active' : ''} ${absDistance > 2 ? 'is-hidden' : ''}`}
                        style={{
                          transform: `translateY(calc(-50% + ${visibleDistance * 104}px)) scale(${index === guideIndex ? 1 : absDistance === 1 ? .88 : .78}) rotateX(${visibleDistance * -7}deg)`,
                          opacity: absDistance > 2 ? 0 : index === guideIndex ? 1 : absDistance === 1 ? .72 : .36,
                          zIndex: 10 - Math.min(absDistance, 9),
                        }}
                        aria-current={index === guideIndex ? 'true' : undefined}
                        aria-label={guide.title}
                        onMouseEnter={() => selectGuideFromHover(index)}
                        onFocus={() => setGuideIndex(index)}
                        onClick={() => setGuideIndex(index)}
                      >
                        <ResilientImage
                          src={guide.imageUrl}
                          sizes="(max-width: 767px) calc(100vw - 88px), 380px"
                          alt={guide.title}
                          className="interactive-care-wheel-image"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="interactive-care-wheel-label">{guide.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="interactive-care-wheel-controls">
                  <button type="button" aria-label={isEn ? 'Previous card' : '上一张卡'} onClick={() => stepGuide(-1)} disabled={carouselItems.length < 2}><ChevronUp className="h-4 w-4" /></button>
                  <button type="button" aria-label={isEn ? 'Next card' : '下一张卡'} onClick={() => stepGuide(1)} disabled={carouselItems.length < 2}><ChevronDown className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="interactive-care-guide-copy">
                <span>{activeGuide.label}</span>
                <p>{activeGuide.summary}</p>
                {activeGuide.detail && <p className="interactive-care-guide-why">{activeGuide.detail}</p>}
                {latestGuide && latestGuide.avoid && (
                  <p className="interactive-care-guide-avoid"><strong>{copy.avoid}：</strong>{isEn ? latestGuide.avoidEn : latestGuide.avoid}</p>
                )}
              </div>

              <div className="interactive-care-guide-actions">
                <div className="interactive-care-carousel-dots" aria-label={isEn ? 'Guide carousel position' : '指南轮播位置'}>
                  {carouselItems.map((guide, index) => (
                    <button key={guide.id} type="button" aria-label={isEn ? `Guide ${index + 1}` : `第 ${index + 1} 张养护卡`} aria-current={index === guideIndex ? 'true' : undefined} onClick={() => setGuideIndex(index)} />
                  ))}
                </div>
                <button type="button" className="interactive-care-open-guide" onClick={openActiveGuide}>{latestGuide ? (guideIndex < carouselItems.length - 1 ? copy.nextStep : copy.browse) : copy.open}<BookOpen className="h-4 w-4" /></button>
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
