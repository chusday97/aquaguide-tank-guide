import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, List, Search, Waves } from 'lucide-react';
import type { CareTopic } from '../../data/careTopicsData';
import { runtimeCareTopicsData } from '../../data/runtimeContentCatalog';
import { getLatestCareGuide, type LatestCareGuide } from '../../data/latestCareGuideCatalog';
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

type ProblemCover = {
  problem: KnowledgeObservation;
  title: string;
  summary: string;
  imageUrl: string;
  latestGuide?: LatestCareGuide;
  legacyTopic?: CareTopic;
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

const urgencyLabel = (problem: KnowledgeObservation, isEn: boolean) => {
  if (problem.urgency === 'urgent') return isEn ? 'Priority' : '优先处理';
  if (problem.urgency === 'watch') return isEn ? 'Watch' : '需要观察';
  return isEn ? 'Routine' : '日常';
};

export function KnowledgeSceneExplorer({ isEn = false, onOpenTopic, onBrowseList }: Props) {
  const [selectedLayerId, setSelectedLayerId] = useState<KnowledgeObjectId | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedLayer = useMemo(
    () => careLayers.find(layer => layer.id === selectedLayerId) || null,
    [selectedLayerId]
  );

  const allProblems = useMemo(
    () => selectedLayer ? getKnowledgeObservations(selectedLayer.id) : [],
    [selectedLayer]
  );

  const coverItems = useMemo<ProblemCover[]>(() => {
    if (!selectedLayer) return [];
    return allProblems.map<ProblemCover | null>(problem => {
      const latestGuide = getLatestCareGuide(problem.latestCareGuideId);
      if (latestGuide) {
        return {
          problem,
          latestGuide,
          title: isEn ? latestGuide.titleEn : latestGuide.title,
          summary: isEn ? latestGuide.conditionEn : latestGuide.condition,
          imageUrl: latestGuide.coverUrl || latestGuide.imageUrl,
        };
      }
      const legacyTopic = getProblemTopics(selectedLayer, problem)[0];
      if (!legacyTopic) return null;
      const visual = getCareVisualSources(legacyTopic.imageUrl);
      return {
        problem,
        legacyTopic,
        title: legacyTopic.title,
        summary: legacyTopic.summary,
        imageUrl: visual.detail || legacyTopic.imageUrl,
      };
    }).filter((item): item is ProblemCover => item !== null);
  }, [selectedLayer, allProblems, isEn]);

  const filteredCovers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return coverItems;
    return coverItems.filter(item => {
      const haystack = [
        item.title,
        item.summary,
        item.problem.label,
        item.problem.labelEn,
        item.problem.searchQuery,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [coverItems, searchTerm]);

  const selectedCover = useMemo(
    () => coverItems.find(item => item.problem.id === selectedProblemId) || null,
    [coverItems, selectedProblemId]
  );

  const copy = isEn ? {
    eyebrow: 'Interactive care guide',
    title: 'Start from the aquarium, then choose a cover.',
    subtitle: 'Each cover represents one problem. Open it to see the full step-by-step guide.',
    browse: 'Browse all guides',
    chooseLayer: 'Choose an aquarium layer',
    chooseLayerBody: 'Tap a hotspot on the tank to see the matching problem covers.',
    coverTitle: 'Problem covers',
    coverBody: 'Each cover is one care problem. Choose the one that matches what you see.',
    searchPlaceholder: 'Search this layer',
    noResult: 'No matching care cover in this layer.',
    back: 'Back to covers',
    condition: 'What you may be seeing',
    step: 'Step',
    how: 'What to do',
    why: 'Why this matters',
    avoid: 'Avoid',
    openLegacy: 'Open full guide',
  } : {
    eyebrow: '互动养护指南',
    title: '从鱼缸位置开始，再直接选问题封面。',
    subtitle: '一张封面就是一个问题；点击后进入完整步骤，不再二次选择问题。',
    browse: '浏览全部指南',
    chooseLayer: '先选择鱼缸里的位置',
    chooseLayerBody: '点击左侧鱼缸中的生态层，右边会直接出现这一层对应的问题封面。',
    coverTitle: '这一层的问题',
    coverBody: '每张封面代表一个问题，直接点击最像你当前情况的那一张。',
    searchPlaceholder: '搜索这一层的问题',
    noResult: '这一层没有匹配的养护卡。',
    back: '返回问题封面',
    condition: '你可能看到的是',
    step: '步骤',
    how: '怎么做',
    why: '为什么',
    avoid: '避免这样做',
    openLegacy: '打开完整指南',
  };

  const selectLayer = (layer: CareLayer) => {
    setSelectedLayerId(layer.id);
    setSelectedProblemId(null);
    setSearchTerm('');
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

      <div className="interactive-care-workspace interactive-care-workspace--covers">
        <div className="interactive-care-layer-column interactive-care-layer-column--photo">
          <div className="interactive-care-aquarium-photo" aria-label={isEn ? 'Aquarium ecosystem navigation' : '鱼缸生态层导航'}>
            <img
              src="/responsive/care/scheme_tetra_planted-960.webp"
              alt={isEn ? 'Planted aquarium used as an ecosystem layer navigator' : '用于选择生态层的水草鱼缸'}
              className="interactive-care-aquarium-photo-image"
              loading="eager"
              decoding="async"
            />
            <div className="interactive-care-aquarium-photo-shade" aria-hidden="true" />
            {careLayers.map(layer => (
              <button
                key={layer.id}
                type="button"
                aria-pressed={selectedLayerId === layer.id}
                onClick={() => selectLayer(layer)}
                className={`interactive-care-layer-hotspot ${layer.className} ${selectedLayerId === layer.id ? 'is-selected' : ''}`}
              >
                <strong>{isEn ? layer.en : layer.zh}</strong>
                <span>{isEn ? layer.hintEn : layer.hintZh}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="interactive-care-guide-panel interactive-care-guide-panel--library" aria-live="polite">
          {!selectedLayer && (
            <div className="interactive-care-guide-empty">
              <BookOpen className="h-6 w-6" />
              <strong>{copy.chooseLayer}</strong>
              <p>{copy.chooseLayerBody}</p>
            </div>
          )}

          {selectedLayer && !selectedCover && (
            <div className="interactive-care-cover-library">
              <div className="interactive-care-cover-library-head">
                <div>
                  <span>{isEn ? selectedLayer.en : selectedLayer.zh}</span>
                  <h3>{copy.coverTitle}</h3>
                  <p>{copy.coverBody}</p>
                </div>
                <form className="interactive-care-cover-search" role="search" onSubmit={(event) => event.preventDefault()}>
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={copy.searchPlaceholder}
                    aria-label={copy.searchPlaceholder}
                  />
                </form>
              </div>

              {filteredCovers.length > 0 ? (
                <div className="interactive-care-cover-grid">
                  {filteredCovers.map(item => (
                    <button
                      key={item.problem.id}
                      type="button"
                      className="interactive-care-cover-card"
                      onClick={() => setSelectedProblemId(item.problem.id)}
                      aria-label={item.title}
                    >
                      <ResilientImage
                        src={item.imageUrl}
                        alt={item.title}
                        className="interactive-care-cover-image"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className={`interactive-care-cover-urgency is-${item.problem.urgency}`}>{urgencyLabel(item.problem, isEn)}</span>
                      <strong>{item.title}</strong>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="interactive-care-cover-empty">{copy.noResult}</div>
              )}
            </div>
          )}

          {selectedLayer && selectedCover && (
            <article className="interactive-care-detail-view">
              <div className="interactive-care-detail-toolbar">
                <button type="button" className="interactive-care-detail-back" onClick={() => setSelectedProblemId(null)}>
                  <ArrowLeft className="h-4 w-4" />{copy.back}
                </button>
                <span>{isEn ? selectedLayer.en : selectedLayer.zh}</span>
              </div>

              <header className="interactive-care-detail-hero">
                <div>
                  <span>{copy.condition}</span>
                  <h3>{selectedCover.title}</h3>
                  <p>{selectedCover.summary}</p>
                </div>
                <ResilientImage
                  src={selectedCover.imageUrl}
                  alt={selectedCover.title}
                  className="interactive-care-detail-cover"
                  loading="eager"
                  decoding="async"
                />
              </header>

              {selectedCover.latestGuide ? (
                <div className="interactive-care-detail-steps">
                  {selectedCover.latestGuide.steps.map(step => (
                    <section className="interactive-care-detail-step" key={step.step}>
                      <div className="interactive-care-detail-step-image-wrap">
                        <ResilientImage
                          src={step.imageUrl}
                          alt={isEn ? step.titleEn : step.title}
                          className="interactive-care-detail-step-image"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="interactive-care-detail-step-copy">
                        <span>{copy.step} {step.step}</span>
                        <h4>{isEn ? step.titleEn : step.title}</h4>
                        <dl>
                          <div><dt>{copy.how}</dt><dd>{isEn ? step.howEn : step.how}</dd></div>
                          <div><dt>{copy.why}</dt><dd>{isEn ? step.whyEn : step.why}</dd></div>
                        </dl>
                      </div>
                    </section>
                  ))}
                  {selectedCover.latestGuide.avoid && (
                    <aside className="interactive-care-detail-avoid">
                      <strong>{copy.avoid}</strong>
                      <p>{isEn ? selectedCover.latestGuide.avoidEn : selectedCover.latestGuide.avoid}</p>
                    </aside>
                  )}
                </div>
              ) : (
                <div className="interactive-care-detail-legacy">
                  <p>{selectedCover.summary}</p>
                  {selectedCover.legacyTopic && (
                    <button type="button" className="interactive-care-open-guide" onClick={() => onOpenTopic(selectedCover.legacyTopic!.id, `knowledge-layer-${selectedLayer.id}-${selectedCover.problem.id}`)}>
                      {copy.openLegacy}<BookOpen className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </article>
          )}
        </aside>
      </div>
    </section>
  );
}
