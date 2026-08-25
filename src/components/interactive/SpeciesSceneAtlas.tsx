import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowRight, Camera, Compass, List, RefreshCw, Sparkles } from 'lucide-react';
import type { Fish } from '../../types';
import { ResilientImage } from '../common/ResilientImage';
import { getSpeciesImageClass, getSpeciesVisualSources } from '../../lib/speciesVisual';

type Props = {
  species: Fish[];
  isEn?: boolean;
  getDisplayName: (fish: Fish) => string;
  onSelect: (fish: Fish) => void;
  onBrowseList: () => void;
  onIdentify: () => void;
  onRefreshDiscoveries?: () => void;
  onRestartDiscoveries?: () => void;
  discoveryBatch?: { size: number; seenCount: number; complete: boolean; index: number };
};

const creaturePositions = [
  { left: '10%', top: '31%', width: '23%', delay: '-.5s' },
  { left: '40%', top: '16%', width: '18%', delay: '-1.8s' },
  { left: '69%', top: '39%', width: '20%', delay: '-3.1s' },
  { left: '27%', top: '58%', width: '15%', delay: '-2.5s' },
  { left: '57%', top: '60%', width: '14%', delay: '-.9s' },
  { left: '78%', top: '19%', width: '13%', delay: '-4s' },
] as const;

export function SpeciesSceneAtlas({ species, isEn = false, getDisplayName, onSelect, onBrowseList, onIdentify, onRefreshDiscoveries, onRestartDiscoveries, discoveryBatch }: Props) {
  const items = species.slice(0, creaturePositions.length);
  const [selected, setSelected] = useState<Fish | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [discoveryBatch?.index]);

  const selectCreature = (fish: Fish) => {
    setSelected(fish);
  };

  return (
    <section className="interactive-tank-shell" aria-label={isEn ? 'Interactive species aquarium' : '互动物种鱼缸'}>
      <div className="interactive-tank-copy">
        <div className="interactive-tank-eyebrow"><Compass className="h-4 w-4" />{isEn ? 'Interactive atlas' : '互动图鉴'}</div>
        <h1>{isEn ? 'Choose a fish that catches your eye.' : '点一条正在游动的生物。'}</h1>
        <p>{isEn ? 'Choose one in the aquarium first. Its complete profile opens only when you ask for it.' : '先点选你感兴趣的生物；确认后再打开完整档案。'}</p>
      </div>
      <div className="interactive-tank-tools">
        {onRefreshDiscoveries && (
          <button type="button" onClick={discoveryBatch?.complete ? onRestartDiscoveries : onRefreshDiscoveries} className="interactive-tank-tool" aria-label={discoveryBatch?.complete ? (isEn ? 'Restart today\'s discoveries' : '重新开始今天的探索') : (isEn ? 'Show a new group of discoveries' : '换一批物种')}>
            <RefreshCw className="h-4 w-4" />{discoveryBatch?.complete ? (isEn ? 'Restart' : '重新开始') : (isEn ? 'New group' : '换一批')}
          </button>
        )}
        <button type="button" onClick={onBrowseList} className="interactive-tank-tool"><List className="h-4 w-4" />{isEn ? 'Browse list' : '传统浏览'}</button>
        <button type="button" onClick={onIdentify} className="interactive-tank-tool"><Camera className="h-4 w-4" />{isEn ? 'Identify' : '拍照识别'}</button>
      </div>

      <div className={`interactive-tank-stage ${selected ? 'has-selection' : ''}`}>
        <span aria-hidden="true" className="interactive-tank-surface" />
        <span aria-hidden="true" className="interactive-tank-plant plant-left" />
        <span aria-hidden="true" className="interactive-tank-plant plant-left-short" />
        <span aria-hidden="true" className="interactive-tank-plant plant-right" />
        <span aria-hidden="true" className="interactive-tank-plant plant-right-short" />
        <span aria-hidden="true" className="interactive-tank-rock rock-left" />
        <span aria-hidden="true" className="interactive-tank-rock rock-right" />
        <p className="interactive-tank-prompt">{isEn ? 'Select one swimming creature' : '选择一个正在游动的生物'}</p>
        {items.map((fish, index) => {
          const position = creaturePositions[index];
          const isSelected = selected?.id === fish.id;
          return (
            <button
              key={fish.id}
              type="button"
              data-scene-node={index}
              aria-pressed={isSelected}
              onClick={() => selectCreature(fish)}
              className={`interactive-tank-creature ${isSelected ? 'is-selected' : ''}`}
              style={{ left: position.left, top: position.top, width: position.width, '--scene-delay': position.delay } as CSSProperties}
            >
              <ResilientImage
                src={getSpeciesVisualSources(fish).texture}
                alt={getDisplayName(fish)}
                className={`h-full w-full object-contain ${getSpeciesImageClass(fish)}`}
                loading={index > 2 ? 'lazy' : 'eager'}
              />
              <span className="interactive-tank-creature-label">{getDisplayName(fish)}</span>
            </button>
          );
        })}
        {discoveryBatch?.complete && <p className="interactive-tank-complete" role="status">{isEn ? 'You have explored every available creature today. Restart to browse them again.' : '今天可探索的物种已全部看完；点击“重新开始”后可以再次浏览。'}</p>}
      </div>

      <div className={`interactive-tank-dock ${selected ? 'is-visible' : ''}`} aria-live="polite">
        {selected && <>
          <div className="interactive-tank-dock-image">
            <ResilientImage src={getSpeciesVisualSources(selected).texture} alt="" className={`h-full w-full object-contain ${getSpeciesImageClass(selected)}`} />
          </div>
          <div className="min-w-0"><span className="interactive-tank-dock-kicker">{isEn ? 'You selected' : '你正在观察'}</span><h2>{getDisplayName(selected)}</h2><p>{isEn ? 'See feeding, environment, and compatibility before deciding what to do next.' : '先看喂养、环境与混养关系，再决定下一步。'}</p></div>
          <button type="button" onClick={() => onSelect(selected)} className="interactive-tank-primary">{isEn ? 'View species profile' : '查看物种档案'}<ArrowRight className="h-4 w-4" /></button>
        </>}
      </div>
      <p className="interactive-tank-note"><Sparkles className="h-4 w-4 text-amber-500" />{discoveryBatch ? (isEn ? `This group: ${discoveryBatch.size} · Seen today: ${discoveryBatch.seenCount}` : `本批 ${discoveryBatch.size} 种 · 今天已浏览 ${discoveryBatch.seenCount} 种`) : (isEn ? 'This scene helps discovery; it is not a recommendation ranking.' : '这是发现兴趣的入口，不是推荐排序。')}</p>
    </section>
  );
}
