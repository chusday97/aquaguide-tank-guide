import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, List, Pause, Play, Search, Waves } from 'lucide-react';
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
  const [selectedLayerId, setSelectedLayerId] = useState<KnowledgeObjectId | null>('livestock');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const isHoveredRef = useRef(false);
  const coverCarouselRef = useRef<HTMLDivElement | null>(null);

  const selectedLayer = useMemo(
    () => careLayers.find(layer => layer.id === selectedLayerId) || null,
    [selectedLayerId]
  );

  const allProblems = useMemo(
    () => selectedLayer ? getKnowledgeObservations(selectedLayer.id) : [],
    [selectedLayer]
  );

  // Map of layerId -> guides for that layer
  const layerCoversMap = useMemo(() => {
    const map = new Map<KnowledgeObjectId, ProblemCover[]>();
    for (const layer of careLayers) {
      const layerItems: ProblemCover[] = [];
      const layerSeen = new Set<string>();
      for (const problem of getKnowledgeObservations(layer.id)) {
        const latestGuide = getLatestCareGuide(problem.latestCareGuideId);
        if (!latestGuide || layerSeen.has(latestGuide.id)) continue;
        layerSeen.add(latestGuide.id);
        layerItems.push({
          problem,
          layer,
          latestGuide,
          title: isEn ? latestGuide.titleEn : latestGuide.title,
          summary: isEn ? latestGuide.conditionEn : latestGuide.condition,
          imageUrl: latestGuide.coverUrl || latestGuide.imageUrl,
        });
      }
      map.set(layer.id, layerItems);
    }
    return map;
  }, [isEn]);

  const allLatestCovers = useMemo<ProblemCover[]>(() => {
    const seen = new Set<string>();
    const items: ProblemCover[] = [];
    // Collect from each layer
    for (const layer of careLayers) {
      const covers = layerCoversMap.get(layer.id) || [];
      for (const cover of covers) {
        if (!seen.has(cover.latestGuide.id)) {
          seen.add(cover.latestGuide.id);
          items.push(cover);
        }
      }
    }
    // And add any remaining guides from the 34 catalog
    for (const latestGuide of latestCareGuides) {
      if (seen.has(latestGuide.id)) continue;
      seen.add(latestGuide.id);
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
  }, [isEn, layerCoversMap]);

  const layerCovers = useMemo(
    () => selectedLayer ? (layerCoversMap.get(selectedLayer.id) || []) : allLatestCovers,
    [layerCoversMap, selectedLayer, allLatestCovers]
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
    chooseLayerBody: 'Select a layer on the left to explore possible issues and care guides.',
    coverTitle: 'Problem covers',
    coverBody: 'Each cover is one care problem. Scroll through the wheel, then click to open.',
    searchPlaceholder: 'Search all 34 care problems',
    noResult: 'No matching hand-drawn care cover found.',
    back: 'Back to covers',
    condition: 'What you may be seeing',
    quickNotes: 'Remember these first',
    step: 'Step',
    how: 'What to do',
    why: 'Why this matters',
    avoid: 'Avoid',
    tapToOpen: 'Open care guide',
  } : {
    eyebrow: '互动养护指南',
    title: '从鱼缸位置开始，再直接选问题封面。',
    subtitle: '一张封面就是一个问题；点击后进入完整步骤，不再二次选择问题。',
    browse: '浏览全部指南',
    chooseLayer: '先选择鱼缸里的位置',
    chooseLayerBody: '点击左侧生态剖面，即可浏览该区域常见的所有问题封面。',
    coverTitle: '这一层的问题',
    coverBody: '每张封面代表一个问题。支持滚轮/滑动翻转卡片，点击即可查看实操步骤。',
    searchPlaceholder: '搜索全部 34 个养护问题',
    noResult: '没有找到匹配的最新手绘养护卡。',
    back: '返回问题封面',
    condition: '你可能看到的是',
    quickNotes: '先记住',
    step: '步骤',
    how: '怎么做',
    why: '为什么',
    avoid: '避免这样做',
    tapToOpen: '查看完整养护指南',
  };

  const selectLayer = (layer: CareLayer) => {
    setSelectedLayerId(layer.id);
    setSelectedProblemId(null);
    setSearchTerm('');
    setActiveIndex(0);
    if (coverCarouselRef.current) {
      coverCarouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Synchronize scroll position with active card index for smooth wheel depth
  const handleCarouselScroll = () => {
    const el = coverCarouselRef.current;
    if (!el || filteredCovers.length === 0) return;
    const cards = el.querySelectorAll<HTMLElement>('.interactive-care-cover-card--carousel');
    if (!cards.length) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;
    cards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const dist = Math.abs(center - cardCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });
    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  const scrollCoverCarousel = (direction: -1 | 1) => {
    const viewport = coverCarouselRef.current;
    if (!viewport) return;
    const cards = viewport.querySelectorAll<HTMLElement>('.interactive-care-cover-card--carousel');
    const nextIdx = Math.max(0, Math.min(filteredCovers.length - 1, activeIndex + direction));
    const targetCard = cards[nextIdx];
    if (targetCard) {
      const targetLeft = targetCard.offsetLeft - (viewport.clientWidth - targetCard.clientWidth) / 2;
      viewport.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
      setActiveIndex(nextIdx);
    } else {
      const distance = Math.max(300, viewport.clientWidth * 0.65);
      viewport.scrollBy({ left: direction * distance, behavior: 'smooth' });
    }
  };

  const scrollToCard = (index: number) => {
    const viewport = coverCarouselRef.current;
    if (!viewport) return;
    const cards = viewport.querySelectorAll<HTMLElement>('.interactive-care-cover-card--carousel');
    const targetCard = cards[index];
    if (targetCard) {
      const targetLeft = targetCard.offsetLeft - (viewport.clientWidth - targetCard.clientWidth) / 2;
      viewport.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
      setActiveIndex(index);
    }
  };

  // 自动旋转养护卡轮播：未展开详情且开启自动播放时，每 3.2 秒平滑轮播到下一张，鼠标悬停时自动暂停
  useEffect(() => {
    if (!isAutoPlaying || selectedProblemId || filteredCovers.length <= 1) return;

    const timer = setInterval(() => {
      if (isHoveredRef.current) return;
      setActiveIndex(prev => {
        const next = (prev + 1) % filteredCovers.length;
        const viewport = coverCarouselRef.current;
        if (viewport) {
          const cards = viewport.querySelectorAll<HTMLElement>('.interactive-care-cover-card--carousel');
          const targetCard = cards[next];
          if (targetCard) {
            const targetLeft = targetCard.offsetLeft - (viewport.clientWidth - targetCard.clientWidth) / 2;
            viewport.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
          }
        }
        return next;
      });
    }, 3200);

    return () => clearInterval(timer);
  }, [isAutoPlaying, selectedProblemId, filteredCovers.length]);

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

      <div className={`interactive-care-workspace interactive-care-workspace--covers ${selectedLayer ? `theme-${selectedLayer.id}` : ''}`}>
        <div className="interactive-care-layer-column interactive-care-layer-column--refined">
          <div className="interactive-care-ecosystem-map interactive-care-ecosystem-map--refined" aria-label={isEn ? 'Aquarium ecosystem layers' : '鱼缸生态层级'}>
            <div className="interactive-care-ecosystem-depth" aria-hidden="true" />
            <div className="interactive-care-waterline-shine" aria-hidden="true" />
            {careLayers.filter(layer => layer.id !== 'filter').map(layer => {
              const isSelected = selectedLayerId === layer.id;
              const count = layerCoversMap.get(layer.id)?.length || 0;
              return (
                <button
                  key={layer.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => selectLayer(layer)}
                  className={`interactive-care-layer interactive-care-layer--refined ${layer.className} ${isSelected ? 'is-selected' : ''}`}
                >
                  <span className="interactive-care-layer-copy">
                    <span className="interactive-care-layer-title-row">
                      <strong>{isEn ? layer.en : layer.zh}</strong>
                      <span className="interactive-care-layer-badge">{count}</span>
                    </span>
                    <span className="interactive-care-layer-tags">
                      {(isEn ? layer.hintEn : layer.hintZh).split(' · ').map(tag => <span key={tag}>{tag}</span>)}
                    </span>
                  </span>
                  <span className="interactive-care-layer-index" aria-hidden="true">{String(careLayers.findIndex(item => item.id === layer.id) + 1).padStart(2, '0')}</span>
                </button>
              );
            })}
            {(() => {
              const filterLayer = careLayers.find(layer => layer.id === 'filter')!;
              const isSelected = selectedLayerId === filterLayer.id;
              const count = layerCoversMap.get(filterLayer.id)?.length || 0;
              return (
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => selectLayer(filterLayer)}
                  className={`interactive-care-filter-layer interactive-care-filter-layer--refined ${isSelected ? 'is-selected' : ''}`}
                >
                  <div className="interactive-care-filter-layer-header">
                    <strong>{isEn ? filterLayer.en : filterLayer.zh}</strong>
                    <span className="interactive-care-filter-badge">{count}</span>
                  </div>
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
                <div className="interactive-care-head-titles">
                  <span className="interactive-care-layer-kicker">
                    {searchTerm.trim()
                      ? (isEn ? 'Global search' : '全局问题检索')
                      : selectedLayer
                        ? (isEn ? `Ecosystem · ${selectedLayer.en}` : `鱼缸生态层 · ${selectedLayer.zh}`)
                        : (isEn ? 'All 34 latest guides' : '全部 34 个最新养护指南')}
                  </span>
                  <h3>{searchTerm.trim() ? (isEn ? `Search results (${filteredCovers.length})` : `搜索结果 (${filteredCovers.length})`) : copy.coverTitle}</h3>
                  <p>{searchTerm.trim() ? (isEn ? 'Search spans all 34 hand-drawn guides across every layer.' : '已在全部 34 个生态层问题中实时检索。') : selectedLayer ? copy.coverBody : copy.chooseLayerBody}</p>
                </div>
                <form className="interactive-care-cover-search" role="search" onSubmit={(event) => event.preventDefault()}>
                  <Search className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={copy.searchPlaceholder}
                    aria-label={copy.searchPlaceholder}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-[11px] font-bold text-ink/40 hover:text-ink/80"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </form>
              </div>

              {!selectedLayer && !searchTerm.trim() ? (
                <div className="interactive-care-guide-empty interactive-care-guide-empty--inside">
                  <div className="interactive-care-empty-icon-ring">
                    <BookOpen className="h-7 w-7 text-emerald-700" />
                  </div>
                  <strong>{copy.chooseLayer}</strong>
                  <p>{copy.chooseLayerBody}</p>
                </div>
              ) : filteredCovers.length > 0 ? (
                <div
                  className="interactive-care-cover-carousel-shell"
                  onMouseEnter={() => { isHoveredRef.current = true; }}
                  onMouseLeave={() => { isHoveredRef.current = false; }}
                >
                  <button
                    type="button"
                    className="interactive-care-cover-arrow is-prev"
                    onClick={() => scrollCoverCarousel(-1)}
                    disabled={activeIndex === 0}
                    aria-label={isEn ? 'Previous cover' : '上一张封面'}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div
                    ref={coverCarouselRef}
                    onScroll={handleCarouselScroll}
                    className="interactive-care-cover-carousel"
                    aria-label={isEn ? 'Problem cover wheel carousel' : '问题封面空间轮播'}
                  >
                    <div className="interactive-care-cover-track">
                      {filteredCovers.map((item, idx) => {
                        const isFocused = idx === activeIndex;
                        const diff = idx - activeIndex;
                        const distFromCenter = Math.abs(diff);
                        const sideClass = diff < 0 ? 'is-left' : diff > 0 ? 'is-right' : '';
                        return (
                          <button
                            key={`${item.layer?.id || 'global'}-${item.problem.id}`}
                            type="button"
                            className={`interactive-care-cover-card interactive-care-cover-card--carousel ${isFocused ? 'is-focused' : ''} ${distFromCenter === 1 ? 'is-adjacent' : ''} ${sideClass}`}
                            onClick={() => {
                              if (isFocused) {
                                setSelectedProblemId(item.problem.id);
                              } else {
                                scrollToCard(idx);
                              }
                            }}
                            aria-label={`${item.title} - ${copy.tapToOpen}`}
                          >
                            <div className="interactive-care-cover-img-box">
                              <ResilientImage
                                src={item.imageUrl}
                                alt={item.title}
                                className="interactive-care-cover-image"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="interactive-care-cover-overlay">
                                <span className="interactive-care-cover-action-pill">
                                  {copy.tapToOpen} <ChevronRight className="h-3.5 w-3.5 inline ml-1" />
                                </span>
                              </div>
                            </div>
                            <div className="interactive-care-cover-meta">
                              <div className="interactive-care-cover-meta-top">
                                <span className="interactive-care-cover-tag">
                                  {item.layer ? (isEn ? item.layer.en : item.layer.zh) : (isEn ? item.latestGuide.categoryEn : item.latestGuide.category)}
                                </span>
                                <span className="interactive-care-cover-num">{idx + 1}/{filteredCovers.length}</span>
                              </div>
                              <strong>{item.title}</strong>
                              <p className="interactive-care-cover-condition-preview">{item.summary}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="interactive-care-cover-arrow is-next"
                    onClick={() => scrollCoverCarousel(1)}
                    disabled={activeIndex === filteredCovers.length - 1}
                    aria-label={isEn ? 'Next cover' : '下一张封面'}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <div className="interactive-care-wheel-controls">
                    <div className="interactive-care-wheel-indicators" aria-hidden="true">
                      {filteredCovers.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => scrollToCard(idx)}
                          className={`interactive-care-wheel-dot ${idx === activeIndex ? 'is-active' : ''}`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAutoPlaying(prev => !prev)}
                      className="interactive-care-auto-toggle"
                      aria-label={isAutoPlaying ? (isEn ? 'Pause rotation' : '暂停自动旋转') : (isEn ? 'Play rotation' : '开启自动旋转')}
                      title={isAutoPlaying ? (isEn ? 'Pause rotation' : '暂停自动旋转') : (isEn ? 'Play rotation' : '开启自动旋转')}
                    >
                      {isAutoPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      <span>{isAutoPlaying ? (isEn ? 'Rotating' : '自动轮播中') : (isEn ? 'Paused' : '已暂停')}</span>
                    </button>
                  </div>
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
                <div className="interactive-care-detail-category-badge">
                  <span>{selectedCover.layer ? (isEn ? selectedCover.layer.en : selectedCover.layer.zh) : (isEn ? selectedCover.latestGuide.categoryEn : selectedCover.latestGuide.category)}</span>
                </div>
              </div>

              <header className="interactive-care-detail-hero">
                <div className="interactive-care-detail-hero-body">
                  <div className="interactive-care-section-kicker">{copy.quickNotes}</div>
                  <h3>{selectedCover.title}</h3>
                  <p className="interactive-care-detail-condition-lead">{selectedCover.summary}</p>
                  <ul className="interactive-care-detail-quick-notes" aria-label={copy.quickNotes}>
                    {buildQuickNotes(selectedCover.latestGuide, isEn).map((note, index) => (
                      <li key={`${selectedCover.latestGuide.id}-note-${index}`}>
                        <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                        <strong>{note}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="interactive-care-detail-cover-wrap">
                  <ResilientImage
                    src={selectedCover.imageUrl}
                    alt={selectedCover.title}
                    className="interactive-care-detail-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
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
                      <div className="interactive-care-step-badge">
                        <span>{copy.step} {step.step}</span>
                      </div>
                    </div>
                    <div className="interactive-care-detail-step-copy">
                      <h4>{isEn ? step.titleEn : step.title}</h4>
                      <dl className="interactive-care-step-dl">
                        <div className="interactive-care-step-how">
                          <dt>{copy.how}</dt>
                          <dd>{isEn ? step.howEn : step.how}</dd>
                        </div>
                        <div className="interactive-care-step-why">
                          <dt>{copy.why}</dt>
                          <dd>{isEn ? step.whyEn : step.why}</dd>
                        </div>
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
