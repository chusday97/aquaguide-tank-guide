import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, List, Search, Waves } from 'lucide-react';
import { getLatestCareGuide, latestCareGuides, type LatestCareGuide } from '../../data/latestCareGuideCatalog';
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
  layer: CareLayer | null;
  title: string;
  summary: string;
  imageUrl: string;
  latestGuide: LatestCareGuide;
};

const careLayers: CareLayer[] = [
  { id: 'water_surface', zh: '水面', en: 'Surface', hintZh: '泡沫 · 油膜 · 浮头', hintEn: 'Foam · film · gasping', className: 'is-surface', topicIds: ['qa_gen_003', 'qa_gen_020', 'guide_water_deteriorate'], searchQuery: '水面 油膜 浮头' },
  { id: 'water_body', zh: '水体', en: 'Water', hintZh: '浑浊 · 氨氮 · 温差', hintEn: 'Cloudiness · ammonia · temperature', className: 'is-water', topicIds: ['qa_gen_001', 'qa_gen_002', 'qa_gen_006'], searchQuery: '水质 浑浊 氨 亚硝酸盐' },
  { id: 'livestock', zh: '缸内生物', en: 'Livestock', hintZh: '呼吸 · 体表 · 行为 · 繁殖', hintEn: 'Breathing · body · behavior · breeding', className: 'is-life', topicIds: ['qa_gen_008', 'qa_gen_007', 'qa_gen_010'], searchQuery: '鱼体异常 行为 繁殖 鱼苗' },
  { id: 'plants_equipment', zh: '水草与灯光', en: 'Plants & light', hintZh: '藻类 · 融叶 · 光照', hintEn: 'Algae · melting · light', className: 'is-plants', topicIds: ['qa_gen_017', 'qa_gen_018', 'qa_gen_019'], searchQuery: '水草 藻类 光照' },
  { id: 'substrate', zh: '底床', en: 'Substrate', hintZh: '残饵 · 清洁 · 有机物', hintEn: 'Waste · cleaning · organics', className: 'is-substrate', topicIds: ['qa_gen_015', 'qa_gen_014', 'guide_water_deteriorate'], searchQuery: '底床 残饵 清洁' },
  { id: 'filter', zh: '过滤系统', en: 'Filtration', hintZh: '滤材 · 流量 · 增氧', hintEn: 'Media · flow · aeration', className: 'is-filter', topicIds: ['qa_gen_016', 'qa_gen_026', 'qa_gen_027'], searchQuery: '过滤器 滤材 增氧' },
];

const buildQuickNotes = (guide: LatestCareGuide, isEn: boolean) => {
  const stepTitles = guide.steps.map(step => isEn ? step.titleEn : step.title);
  const avoidText = isEn ? guide.avoidEn : guide.avoid;
  const avoidNotes = avoidText.split(/[；;。.!！]+/).map(item => item.trim()).filter(Boolean);
  const quantified = stepTitles.filter(item => /\d|%|％|\/|小时|分钟|°|℃/.test(item));
  const ordered = [...quantified, ...avoidNotes, ...stepTitles];
  return Array.from(new Set(ordered)).slice(0, 4);
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
  const coverCarouselRef = useRef<HTMLDivElement | null>(null);

  const selectedLayer = useMemo(
    () => careLayers.find(layer => layer.id === selectedLayerId) || null,
    [selectedLayerId]
  );

  const allProblems = useMemo(
    () => selectedLayer ? getKnowledgeObservations(selectedLayer.id) : [],
    [selectedLayer]
  );

  const allLatestCovers = useMemo<ProblemCover[]>(() => {
    const seen = new Set<string>();
    const items: ProblemCover[] = [];
    for (const layer of careLayers) {
      for (const problem of getKnowledgeObservations(layer.id)) {
        const latestGuide = getLatestCareGuide(problem.latestCareGuideId);
        if (!latestGuide || seen.has(latestGuide.id)) continue;
        seen.add(latestGuide.id);
        items.push({
          problem,
          layer,
          latestGuide,
          title: isEn ? latestGuide.titleEn : latestGuide.title,
          summary: isEn ? latestGuide.conditionEn : latestGuide.condition,
          imageUrl: latestGuide.coverUrl || latestGuide.imageUrl,
        });
      }
    }
    for (const latestGuide of latestCareGuides) {
      if (seen.has(latestGuide.id)) continue;
      items.push({
        problem: {
          id: `global-${latestGuide.id}`,
          label: latestGuide.title,
          labelEn: latestGuide.titleEn,
          urgency: 'routine',
          latestCareGuideId: latestGuide.id,
          searchQuery: `${latestGuide.title} ${latestGuide.titleEn} ${latestGuide.category} ${latestGuide.categoryEn}`,
        },
        layer: null,
        latestGuide,
        title: isEn ? latestGuide.titleEn : latestGuide.title,
        summary: isEn ? latestGuide.conditionEn : latestGuide.condition,
        imageUrl: latestGuide.coverUrl || latestGuide.imageUrl,
      });
    }
    return items;
  }, [isEn]);

  const layerCovers = useMemo(
    () => selectedLayer ? allLatestCovers.filter(item => item.layer?.id === selectedLayer.id) : [],
    [allLatestCovers, selectedLayer]
  );

  const filteredCovers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const source = query ? allLatestCovers : layerCovers;
    if (!query) return source;
    return source.filter(item => {
      const haystack = [
        item.title,
        item.summary,
        item.problem.label,
        item.problem.labelEn,
        item.problem.searchQuery,
        item.layer?.zh,
        item.layer?.en,
        item.latestGuide.category,
        item.latestGuide.categoryEn,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [allLatestCovers, layerCovers, searchTerm]);

  const selectedCover = useMemo(
    () => allLatestCovers.find(item => item.problem.id === selectedProblemId) || null,
    [allLatestCovers, selectedProblemId]
  );

  const copy = isEn ? {
    eyebrow: 'Interactive care guide',
    title: 'Start from the aquarium, then choose a cover.',
    subtitle: 'Each cover represents one problem. Open it to see the full step-by-step guide.',
    browse: 'Browse all guides',
    chooseLayer: 'Choose an aquarium layer',
    chooseLayerBody: 'Tap a hotspot on the tank to see the matching problem covers.',
    coverTitle: 'Problem covers',
    coverBody: 'Each cover is one care problem. Swipe or scroll sideways, then open the closest match.',
    searchPlaceholder: 'Search all care problems',
    noResult: 'No matching hand-drawn care cover found.',
    back: 'Back to covers',
    condition: 'What you may be seeing',
    quickNotes: 'Remember these first',
    step: 'Step',
    how: 'What to do',
    why: 'Why this matters',
    avoid: 'Avoid',
  } : {
    eyebrow: '互动养护指南',
    title: '从鱼缸位置开始，再直接选问题封面。',
    subtitle: '一张封面就是一个问题；点击后进入完整步骤，不再二次选择问题。',
    browse: '浏览全部指南',
    chooseLayer: '先选择鱼缸里的位置',
    chooseLayerBody: '点击左侧鱼缸中的生态层，右边会直接出现这一层对应的问题封面。',
    coverTitle: '这一层的问题',
    coverBody: '每张封面代表一个问题，左右滑动浏览，点击最像当前情况的那一张。',
    searchPlaceholder: '搜索全部养护问题',
    noResult: '没有找到匹配的最新手绘养护卡。',
    back: '返回问题封面',
    condition: '你可能看到的是',
    quickNotes: '先记住',
    step: '步骤',
    how: '怎么做',
    why: '为什么',
    avoid: '避免这样做',
  };

  const selectLayer = (layer: CareLayer) => {
    setSelectedLayerId(layer.id);
    setSelectedProblemId(null);
    setSearchTerm('');
  };

  const scrollCoverCarousel = (direction: -1 | 1) => {
    const viewport = coverCarouselRef.current;
    if (!viewport) return;
    const distance = Math.max(280, viewport.clientWidth * 0.72);
    viewport.scrollBy({ left: direction * distance, behavior: 'smooth' });
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
        <div className="interactive-care-layer-column interactive-care-layer-column--refined">
          <div className="interactive-care-ecosystem-map interactive-care-ecosystem-map--refined" aria-label={isEn ? 'Aquarium ecosystem layers' : '鱼缸生态层级'}>
            <div className="interactive-care-ecosystem-depth" aria-hidden="true" />
            {careLayers.filter(layer => layer.id !== 'filter').map(layer => (
              <button
                key={layer.id}
                type="button"
                aria-pressed={selectedLayerId === layer.id}
                onClick={() => selectLayer(layer)}
                className={`interactive-care-layer interactive-care-layer--refined ${layer.className} ${selectedLayerId === layer.id ? 'is-selected' : ''}`}
              >
                <span className="interactive-care-layer-copy">
                  <strong>{isEn ? layer.en : layer.zh}</strong>
                  <span className="interactive-care-layer-tags">
                    {(isEn ? layer.hintEn : layer.hintZh).split(' · ').map(tag => <span key={tag}>{tag}</span>)}
                  </span>
                </span>
                <span className="interactive-care-layer-index" aria-hidden="true">{String(careLayers.findIndex(item => item.id === layer.id) + 1).padStart(2, '0')}</span>
              </button>
            ))}
            {(() => {
              const filterLayer = careLayers.find(layer => layer.id === 'filter')!;
              return (
                <button
                  type="button"
                  aria-pressed={selectedLayerId === filterLayer.id}
                  onClick={() => selectLayer(filterLayer)}
                  className={`interactive-care-filter-layer interactive-care-filter-layer--refined ${selectedLayerId === filterLayer.id ? 'is-selected' : ''}`}
                >
                  <strong>{isEn ? filterLayer.en : filterLayer.zh}</strong>
                  <span className="interactive-care-filter-tags">
                    {(isEn ? filterLayer.hintEn : filterLayer.hintZh).split(' · ').map(tag => <span key={tag}>{tag}</span>)}
                  </span>
                </button>
              );
            })()}
          </div>
        </div>

        <aside className="interactive-care-guide-panel interactive-care-guide-panel--library" aria-live="polite">
          {!selectedCover && (
            <div className="interactive-care-cover-library">
              <div className="interactive-care-cover-library-head">
                <div>
                  <span>{searchTerm.trim() ? (isEn ? 'All care problems' : '全部养护问题') : selectedLayer ? (isEn ? selectedLayer.en : selectedLayer.zh) : (isEn ? 'All latest guides' : '全部最新指南')}</span>
                  <h3>{copy.coverTitle}</h3>
                  <p>{searchTerm.trim() ? (isEn ? 'Search spans every aquarium layer.' : '搜索会覆盖所有生态层的问题。') : selectedLayer ? copy.coverBody : copy.chooseLayerBody}</p>
                </div>
                <form className="interactive-care-cover-search" role="search" onSubmit={(event) => event.preventDefault()}>
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={copy.searchPlaceholder}
                    aria-label={copy.searchPlaceholder}
                  />
                </form>
              </div>

              {!selectedLayer && !searchTerm.trim() ? (
                <div className="interactive-care-guide-empty interactive-care-guide-empty--inside">
                  <BookOpen className="h-6 w-6" />
                  <strong>{copy.chooseLayer}</strong>
                  <p>{copy.chooseLayerBody}</p>
                </div>
              ) : filteredCovers.length > 0 ? (
                <div className="interactive-care-cover-carousel-shell">
                  <button type="button" className="interactive-care-cover-arrow is-prev" onClick={() => scrollCoverCarousel(-1)} aria-label={isEn ? 'Previous covers' : '上一组封面'}><ChevronLeft className="h-5 w-5" /></button>
                  <div ref={coverCarouselRef} className="interactive-care-cover-carousel" aria-label={isEn ? 'Problem cover carousel' : '问题封面左右轮播'}>
                    <div className="interactive-care-cover-track">
                      {filteredCovers.map(item => (
                        <button
                          key={`${item.layer?.id || 'global'}-${item.problem.id}`}
                          type="button"
                          className="interactive-care-cover-card interactive-care-cover-card--carousel"
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
                          <div className="interactive-care-cover-meta">
                            <span>{item.layer ? (isEn ? item.layer.en : item.layer.zh) : (isEn ? item.latestGuide.categoryEn : item.latestGuide.category)}</span>
                            <strong>{item.title}</strong>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="button" className="interactive-care-cover-arrow is-next" onClick={() => scrollCoverCarousel(1)} aria-label={isEn ? 'Next covers' : '下一组封面'}><ChevronRight className="h-5 w-5" /></button>
                </div>
              ) : (
                <div className="interactive-care-cover-empty">{copy.noResult}</div>
              )}
            </div>
          )}

          {selectedCover && (
            <article className="interactive-care-detail-view">
              <div className="interactive-care-detail-toolbar">
                <button type="button" className="interactive-care-detail-back" onClick={() => setSelectedProblemId(null)}>
                  <ArrowLeft className="h-4 w-4" />{copy.back}
                </button>
                <span>{selectedCover.layer ? (isEn ? selectedCover.layer.en : selectedCover.layer.zh) : (isEn ? selectedCover.latestGuide.categoryEn : selectedCover.latestGuide.category)}</span>
              </div>

              <header className="interactive-care-detail-hero">
                <div>
                  <span>{copy.quickNotes}</span>
                  <h3>{selectedCover.title}</h3>
                  <ul className="interactive-care-detail-quick-notes" aria-label={copy.quickNotes}>
                    {buildQuickNotes(selectedCover.latestGuide, isEn).map((note, index) => (
                      <li key={`${selectedCover.latestGuide.id}-note-${index}`}>
                        <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                        <strong>{note}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
                <ResilientImage
                  src={selectedCover.imageUrl}
                  alt={selectedCover.title}
                  className="interactive-care-detail-cover"
                  loading="eager"
                  decoding="async"
                />
              </header>

              <div className="interactive-care-detail-steps">
                {selectedCover.latestGuide!.steps.map(step => (
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
                {selectedCover.latestGuide!.avoid && (
                  <aside className="interactive-care-detail-avoid">
                    <strong>{copy.avoid}</strong>
                    <p>{isEn ? selectedCover.latestGuide!.avoidEn : selectedCover.latestGuide!.avoid}</p>
                  </aside>
                )}
              </div>
            </article>
          )}
        </aside>
      </div>
    </section>
  );
}
