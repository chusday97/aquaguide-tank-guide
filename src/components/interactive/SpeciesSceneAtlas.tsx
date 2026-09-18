import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowRight, Camera, Compass, List, RefreshCw, Sparkles, Droplets, Thermometer, ShieldCheck, HeartHandshake, Gauge, Maximize2 } from 'lucide-react';
import type { Fish } from '../../types';
import { ResilientImage } from '../common/ResilientImage';
import { getSpeciesImageClass, getSpeciesVisualSources } from '../../lib/speciesVisual';
import { getDifficultyLabel, getSizeLabel, getTemperamentLabel } from '../../modules/species/species.service';

type Props = {
  species: Fish[];
  isEn?: boolean;
  selectedFishId?: string | null;
  getDisplayName: (fish: Fish) => string;
  onSelect: (fish: Fish) => void;
  onBrowseList: () => void;
  onIdentify: () => void;
  onRefreshDiscoveries?: () => void;
  onRestartDiscoveries?: () => void;
  discoveryBatch?: { size: number; seenCount: number; complete: boolean; index: number };
};

const creaturePositions = [
  { left: '8%', top: '15%', width: '22%', delay: '-.5s' },
  { left: '38%', top: '8%', width: '18%', delay: '-1.8s' },
  { left: '68%', top: '18%', width: '19%', delay: '-3.1s' },
  { left: '22%', top: '34%', width: '16%', delay: '-2.5s' },
  { left: '52%', top: '36%', width: '15%', delay: '-.9s' },
  { left: '76%', top: '8%', width: '14%', delay: '-4s' },
] as const;

export function SpeciesSceneAtlas({ species, isEn = false, selectedFishId, getDisplayName, onSelect, onBrowseList, onIdentify, onRefreshDiscoveries, onRestartDiscoveries, discoveryBatch }: Props) {
  const items = species.slice(0, creaturePositions.length);
  const [internalSelected, setInternalSelected] = useState<Fish | null>(null);

  useEffect(() => {
    setInternalSelected(null);
  }, [discoveryBatch?.index]);

  const selected = (selectedFishId ? species.find(f => f.id === selectedFishId) : null) || internalSelected;

  const selectCreature = (fish: Fish) => {
    setInternalSelected(fish);
    onSelect(fish);
  };

  return (
    <div className="interactive-tank-page-wrap">
      {/* 移出框外的顶部文字与操作按钮 */}
      <header className="interactive-tank-external-header">
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
      </header>

      {/* 铺满页面的独立鱼缸主体 */}
      <section className="interactive-tank-shell interactive-tank-shell--full" aria-label={isEn ? 'Interactive species aquarium' : '互动物种鱼缸'}>
        <div className={`interactive-tank-stage ${selected ? 'has-selection' : ''}`}>
          <span aria-hidden="true" className="interactive-tank-surface" />
          <span aria-hidden="true" className="interactive-tank-plant plant-left" />
          <span aria-hidden="true" className="interactive-tank-plant plant-left-short" />
          <span aria-hidden="true" className="interactive-tank-plant plant-right" />
          <span aria-hidden="true" className="interactive-tank-plant plant-right-short" />
          <span aria-hidden="true" className="interactive-tank-rock rock-left" />
          <span aria-hidden="true" className="interactive-tank-rock rock-right" />
          {!selected && <p className="interactive-tank-prompt">{isEn ? 'Select one swimming creature' : '选择一个正在游动的生物'}</p>}
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
                  loadingSurface="transparent"
                  className={`h-full w-full object-contain ${getSpeciesImageClass(fish)}`}
                  loading={index > 2 ? 'lazy' : 'eager'}
                />
                <span className="interactive-tank-creature-label">{getDisplayName(fish)}</span>
              </button>
            );
          })}
          {discoveryBatch?.complete && <p className="interactive-tank-complete" role="status">{isEn ? 'You have explored every available creature today. Restart to browse them again.' : '今天可探索的物种已全部看完；点击“重新开始”后可以再次浏览。'}</p>}

          {/* 加高的咖啡色底床区域：直接在底床上展示物种基础信息与档案标签 */}
          <div className="interactive-tank-substrate-bed" aria-live="polite">
            {selected ? (
              <div className="interactive-tank-substrate-content">
                <div className="interactive-tank-substrate-top">
                  <div className="interactive-tank-substrate-identity">
                    <div className="interactive-tank-substrate-avatar">
                      <ResilientImage src={getSpeciesVisualSources(selected).texture} alt="" loadingSurface="transparent" className={`h-full w-full object-contain ${getSpeciesImageClass(selected)}`} />
                    </div>
                    <div>
                      <div className="interactive-tank-substrate-eyebrow">{isEn ? 'You are observing' : '你正在观察'}</div>
                      <h3 className="interactive-tank-substrate-name">{getDisplayName(selected)}</h3>
                      <p className="interactive-tank-substrate-sub">{selected.scientificName || selected.category}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelect(selected)}
                    className="interactive-tank-substrate-btn"
                    aria-label={isEn ? 'View species profile' : '查看物种档案'}
                  >
                    <span>{isEn ? 'View species profile' : '查看物种档案'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* 6 个主要基础信息指标卡 */}
                <div className="interactive-tank-metrics-grid">
                  <div className="interactive-tank-metric-chip">
                    <Thermometer className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="interactive-tank-metric-label">{isEn ? 'Temp' : '适宜水温'}</span>
                    <strong className="interactive-tank-metric-val">{selected.waterTemperature || '22-28°C'}</strong>
                  </div>

                  <div className="interactive-tank-metric-chip">
                    <Droplets className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span className="interactive-tank-metric-label">{isEn ? 'pH' : '酸碱度'}</span>
                    <strong className="interactive-tank-metric-val">{selected.phLevel || '6.5-7.5'}</strong>
                  </div>

                  <div className="interactive-tank-metric-chip">
                    <Maximize2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span className="interactive-tank-metric-label">{isEn ? 'Tank size' : '建议缸长'}</span>
                    <strong className="interactive-tank-metric-val">{selected.tankSize || '40cm+'}</strong>
                  </div>

                  <div className="interactive-tank-metric-chip">
                    <HeartHandshake className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                    <span className="interactive-tank-metric-label">{isEn ? 'Temperament' : '性格特征'}</span>
                    <strong className="interactive-tank-metric-val">{getTemperamentLabel(selected)}</strong>
                  </div>

                  <div className="interactive-tank-metric-chip">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                    <span className="interactive-tank-metric-label">{isEn ? 'Housing' : '混养方式'}</span>
                    <strong className="interactive-tank-metric-val">{selected.housingMode || '适合混养'}</strong>
                  </div>

                  <div className="interactive-tank-metric-chip">
                    <Gauge className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                    <span className="interactive-tank-metric-label">{isEn ? 'Difficulty' : '饲养难度'}</span>
                    <strong className="interactive-tank-metric-val">{getDifficultyLabel(selected)}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="interactive-tank-substrate-idle">
                <span className="interactive-tank-substrate-idle-hint">
                  {isEn ? 'Click any swimming fish above to inspect its parameters on the substrate' : '点击上方水体中游动的任意鱼类，在此处查看水温、酸碱、缸体等 6 项主要数据'}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="interactive-tank-note">
        <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
        <span>{discoveryBatch ? (isEn ? `This group: ${discoveryBatch.size} · Seen today: ${discoveryBatch.seenCount}` : `本批 ${discoveryBatch.size} 种 · 今天已浏览 ${discoveryBatch.seenCount} 种`) : (isEn ? 'This scene helps discovery; it is not a recommendation ranking.' : '这是发现兴趣的入口，不是推荐排序。')}</span>
      </footer>
    </div>
  );
}
