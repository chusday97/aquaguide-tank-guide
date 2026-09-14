import { useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, List, Waves } from 'lucide-react';
import type { CareTopic } from '../../data/careTopicsData';
import { runtimeCareTopicsData } from '../../data/runtimeContentCatalog';
import { getCareVisualSources } from '../../lib/careVisual';
import { ResilientImage } from '../common/ResilientImage';
import type { KnowledgeObjectId } from './knowledgeJourney';

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
const getLayerTopics = (layer: CareLayer): CareTopic[] => {
  const byId = new Map(runtimeCareTopicsData.map(topic => [topic.id, topic]));
  return layer.topicIds.map(id => byId.get(id)).filter((topic): topic is CareTopic => Boolean(topic));
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
  const [guideIndex, setGuideIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const selectedLayer = useMemo(
    () => careLayers.find(layer => layer.id === selectedLayerId) || null,
    [selectedLayerId]
  );
  const guides = useMemo(() => selectedLayer ? getLayerTopics(selectedLayer) : [], [selectedLayer]);
  const activeGuide = guides[guideIndex] || null;
  const visual = activeGuide ? getCareVisualSources(activeGuide.imageUrl) : null;

  const selectLayer = (layer: CareLayer) => {
    setSelectedLayerId(layer.id);
    setGuideIndex(0);
  };

  const stepGuide = (delta: number) => {
    if (guides.length < 2) return;
    setGuideIndex(current => (current + delta + guides.length) % guides.length);
  };

  const openActiveGuide = () => {
    if (activeGuide && selectedLayer) {
      onOpenTopic(activeGuide.id, `knowledge-layer-${selectedLayer.id}`);
      return;
    }
    if (selectedLayer) onBrowseList(selectedLayer.searchQuery);
  };
  const copy = isEn
    ? {
        eyebrow: 'Interactive care guide',
        title: 'Find the problem by aquarium layer.',
        description: 'Choose the layer you are observing, then browse the most relevant care guides without leaving the aquarium context.',
        browse: 'Browse all guides',
        emptyTitle: 'Choose one aquarium layer',
        emptyBody: 'Its most relevant care guides will appear here as a swipeable carousel.',
        guides: 'Care guides',
        open: 'Open guide',
      }
    : {
        eyebrow: '互动养护指南',
        title: '从鱼缸生态层找到问题。',
        description: '先点你正在观察的层级，再左右浏览这一层最常见的养护问题；生态剖面只负责找入口，正式指南继续使用现有养护内容。',
        browse: '浏览全部指南',
        emptyTitle: '点击一个生态层',
        emptyBody: '这里会出现这一层对应的养护问题指南轮播，你不用离开当前鱼缸视角。',
        guides: '问题指南',
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
      <aside className="interactive-care-ecosystem-intro">
        <div className="interactive-tank-eyebrow"><Waves className="h-4 w-4" />{copy.eyebrow}</div>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
        <button type="button" onClick={() => onBrowseList()} className="interactive-care-browse-all"><List className="h-4 w-4" />{copy.browse}</button>
      </aside>

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

      <aside className="interactive-care-guide-panel" aria-live="polite">
        {!selectedLayer && (
          <div className="interactive-care-guide-empty">
            <BookOpen className="h-6 w-6" />
            <strong>{copy.emptyTitle}</strong>
            <p>{copy.emptyBody}</p>
          </div>
        )}

        {selectedLayer && activeGuide && (
          <div className="interactive-care-carousel">
            <div className="interactive-care-carousel-head">
              <div>
                <span>{copy.guides}</span>
                <h3>{isEn ? selectedLayer.en : selectedLayer.zh}{isEn ? ' · Common issues' : ' · 常见问题'}</h3>
              </div>
              <span className="interactive-care-carousel-count">{guideIndex + 1} / {guides.length}</span>
            </div>

            <div className="interactive-care-guide-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <ResilientImage
                src={visual?.detail || activeGuide.imageUrl}
                srcSet={visual ? `${visual.thumbnail} 480w, ${visual.detail} 960w` : undefined}
                sizes="(max-width: 767px) calc(100vw - 64px), 420px"
                alt={activeGuide.title}
                className="interactive-care-guide-image"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="interactive-care-guide-copy">
              <span className={getUrgencyTone(activeGuide) === 'priority' ? 'is-priority' : ''}>{getStatusLabel(activeGuide, isEn)}</span>
              <h4>{activeGuide.title}</h4>
              <p>{activeGuide.summary}</p>
              <div className="interactive-care-carousel-dots" aria-label={isEn ? 'Guide carousel position' : '指南轮播位置'}>
                {guides.map((guide, index) => (
                  <button
                    key={guide.id}
                    type="button"
                    aria-label={isEn ? `Guide ${index + 1}` : `第 ${index + 1} 条指南`}
                    aria-current={index === guideIndex ? 'true' : undefined}
                    onClick={() => setGuideIndex(index)}
                  />
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

        {selectedLayer && !activeGuide && (
          <div className="interactive-care-guide-empty">
            <BookOpen className="h-6 w-6" />
            <strong>{isEn ? 'No reviewed guide is available for this layer yet.' : '这一层暂时没有可用指南'}</strong>
            <button type="button" onClick={() => onBrowseList(selectedLayer.searchQuery)} className="interactive-care-open-guide">{copy.browse}</button>
          </div>
        )}
      </aside>
    </section>
  );
}
