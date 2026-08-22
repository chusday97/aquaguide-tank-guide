import { lazy, Suspense, useMemo, useState } from 'react';
import { ChevronRight, Info, Shuffle, X } from 'lucide-react';
import type { Aquarium, Fish } from '../types';
import { getLifeType, isSaltwaterSpecies } from '../modules/species/species.service';
import { deriveSpeciesGroups, findGroupForSpecies, getVariantLabel } from '../lib/speciesGrouping';
import { getSpeciesDisplayImage, getSpeciesImageClass, getSpeciesImageSurfaceClass } from '../lib/speciesVisual';
import { ResilientImage } from './common/ResilientImage';

const ThreeAquarium = lazy(() => import('./ThreeAquarium').then(module => ({ default: module.ThreeAquarium })));

type InteractiveSpeciesAtlasProps = {
  species: Fish[];
  isEn?: boolean;
  onBrowse: () => void;
  onOpenCompatibility?: (fish: Fish) => void;
};

const buildDiscoveryTank = (species: Fish[]): { aquarium: Aquarium; speciesIds: string[] } => {
  const candidates = species.filter(fish => (
    getLifeType(fish) === 'fish'
    && !isSaltwaterSpecies(fish)
    && Boolean(fish.image)
    && !fish.isCustom
  ));
  const groupedRepresentatives = deriveSpeciesGroups(candidates).map(group => group.representativeSpecies);
  const anchor = groupedRepresentatives[Math.floor(Math.random() * Math.max(1, groupedRepresentatives.length))];
  const shuffled = [...candidates].filter(fish => fish.id !== anchor?.id).sort(() => Math.random() - 0.5);
  const selected = anchor ? [anchor, ...shuffled.slice(0, 5)] : shuffled.slice(0, 6);
  const now = new Date().toISOString();
  return {
    speciesIds: selected.map(fish => fish.id),
    aquarium: {
      id: 'interactive-atlas-discovery',
      name: 'Interactive Atlas',
      fishes: selected.map((fish, index) => ({
        id: `interactive-${index}-${fish.id}`,
        fishId: fish.id,
        quantity: 1,
        entryDate: now,
      })),
      dimensions: { length: '80', width: '40', height: '40' },
      waterType: 'Freshwater',
      targetTemperature: '25',
      substrate: '河沙',
      plants: [],
      hardscape: [],
      equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
    },
  };
};

const difficultyLabel = (fish: Fish, isEn: boolean) => {
  if (fish.difficulty === 'Easy') return isEn ? 'Easy' : '极易';
  if (fish.difficulty === 'Medium') return isEn ? 'Intermediate' : '中等';
  return isEn ? 'Advanced' : '较难';
};

export function InteractiveSpeciesAtlas({ species, isEn = false, onBrowse, onOpenCompatibility }: InteractiveSpeciesAtlasProps) {
  const [discovery] = useState(() => buildDiscoveryTank(species));
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);
  const [hoveredVariantId, setHoveredVariantId] = useState<string | null>(null);
  const groups = useMemo(() => deriveSpeciesGroups(species), [species]);
  const selectedGroup = selectedFish ? findGroupForSpecies(selectedFish.id, groups) : null;
  const previewFish = selectedGroup?.variants.find(item => item.id === hoveredVariantId) || selectedFish;

  const chooseTankSpecies = (fishId: string | null) => {
    if (!fishId) return;
    const fish = species.find(item => item.id === fishId);
    if (!fish) return;
    setHoveredVariantId(null);
    setSelectedFish(fish);
  };

  const closeKnowledge = () => {
    setHoveredVariantId(null);
    setSelectedFish(null);
  };

  return (
    <section data-interactive-atlas data-state={selectedFish ? 'observing' : 'exploring'} data-selected-species-id={selectedFish?.id || ''} className="overflow-hidden rounded-[30px] border border-emerald-100/80 bg-[#f6faf7] shadow-[0_24px_80px_rgba(33,78,61,0.10)]">
      <div className={`grid min-h-[560px] transition-[grid-template-columns] duration-500 ease-out ${selectedFish ? 'lg:grid-cols-[minmax(0,0.82fr)_minmax(440px,1.18fr)]' : 'grid-cols-1'}`}>
        <div className={`relative min-w-0 overflow-hidden bg-gradient-to-br from-[#dff5ef] via-[#eef8f4] to-[#e7efe9] transition-all duration-500 ${selectedFish ? 'min-h-[360px] lg:min-h-[680px]' : 'min-h-[560px]'}`}>
          <div className="absolute left-5 top-5 z-20 max-w-[620px] pr-20 md:left-7 md:top-7">
            <div className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.14em] text-emerald-800"><Shuffle className="h-4 w-4" />{isEn ? 'INTERACTIVE ATLAS' : '互动图鉴'}</div>
            <h2 className={`mt-3 font-serif font-black leading-[0.95] tracking-tight text-ink transition-all duration-500 ${selectedFish ? 'text-[34px] md:text-[46px]' : 'text-[42px] md:text-[64px]'}`}>{isEn ? 'Pick a living species.' : '点一条正在游动的生物。'}</h2>
            <p className="mt-3 max-w-[520px] text-[13px] font-semibold leading-6 text-ink/52">{isEn ? 'Explore first. Open compatibility only when you decide to compare.' : '先看物种本身；需要比较时，再进入混养计算。'}</p>
          </div>

          <div className={`absolute inset-x-0 bottom-0 transition-all duration-500 ${selectedFish ? 'top-[150px] lg:top-[180px]' : 'top-[160px] md:top-[185px]'}`}>
            <Suspense fallback={<div className="flex h-full items-center justify-center text-xs font-black text-emerald-900/40">{isEn ? 'Loading aquarium…' : '正在加载鱼缸…'}</div>}>
              <ThreeAquarium aquarium={discovery.aquarium} activeSpecies={selectedFish?.id || null} onSpeciesSelect={chooseTankSpecies} />
            </Suspense>
          </div>


          <div className="absolute bottom-5 left-5 z-20 rounded-full bg-white/90 px-3 py-2 text-[11px] font-black text-emerald-800 shadow-sm backdrop-blur md:left-7">
            {isEn ? `${discovery.speciesIds.length} species in this tank` : `本批 ${discovery.speciesIds.length} 种 · 点击鱼查看资料`}
          </div>
          <div className="sr-only" data-interactive-atlas-shortcuts>
            {discovery.speciesIds.map(fishId => {
              const fish = species.find(item => item.id === fishId);
              return fish ? <button key={fishId} type="button" tabIndex={-1} data-atlas-species-shortcut={fishId} onClick={() => chooseTankSpecies(fishId)}>{fish.name}</button> : null;
            })}
          </div>
        </div>

        {selectedFish && previewFish && (
          <aside data-interactive-atlas-knowledge data-preview-species-id={previewFish.id} className="relative min-w-0 animate-in slide-in-from-right-6 fade-in bg-[#fffefa] duration-500">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200/80 bg-[#fffefa]/95 px-5 py-4 backdrop-blur lg:px-7">
              <div>
                <div className="text-[10px] font-black tracking-[0.12em] text-emerald-700">{isEn ? 'SPECIES KNOWLEDGE' : '物种知识'}</div>
                <div className="mt-1 text-[12px] font-semibold text-ink/42">{isEn ? 'Hover a variant to preview · click to keep it' : '划过变种即可预览 · 点击后固定查看'}</div>
              </div>
              <button type="button" onClick={closeKnowledge} className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-ink shadow-sm" aria-label={isEn ? 'Close species detail' : '关闭物种详情'}><X className="h-5 w-5" /></button>
            </div>

            <div className="max-h-[680px] overflow-y-auto px-5 pb-8 pt-5 lg:px-7">
              <div className={`relative flex min-h-[310px] items-center justify-center overflow-visible rounded-[28px] ${getSpeciesImageSurfaceClass(previewFish)} p-8`}>
                <ResilientImage src={getSpeciesDisplayImage(previewFish)} alt={previewFish.name} className={`h-[240px] w-full object-contain transition-all duration-300 ${getSpeciesImageClass(previewFish)}`} />
                {selectedGroup && selectedGroup.variants.length > 1 && (
                  <div data-variant-hover-rail className="absolute -bottom-7 left-1/2 z-20 flex max-w-[92%] -translate-x-1/2 gap-2 overflow-x-auto rounded-full border border-white/90 bg-white/92 p-2 shadow-[0_14px_36px_rgba(15,23,42,0.14)] backdrop-blur">
                    {selectedGroup.variants.map(variant => {
                      const active = previewFish.id === variant.id;
                      return (
                        <button key={variant.id} data-variant-id={variant.id} type="button" onMouseEnter={() => setHoveredVariantId(variant.id)} onMouseLeave={() => setHoveredVariantId(null)} onFocus={() => setHoveredVariantId(variant.id)} onBlur={() => setHoveredVariantId(null)} onClick={() => { setSelectedFish(variant); setHoveredVariantId(null); }} aria-label={`${isEn ? 'Preview' : '预览'} ${variant.name}`} className={`group relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-white transition-all duration-200 ${active ? 'scale-110 border-emerald-400 ring-4 ring-emerald-100' : 'border-stone-200 hover:-translate-y-1 hover:border-emerald-300'}`}>
                          <ResilientImage src={getSpeciesDisplayImage(variant)} alt="" className={`h-11 w-11 object-contain ${getSpeciesImageClass(variant)}`} />
                          <span className="pointer-events-none absolute left-1/2 top-[62px] hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2 py-1 text-[9px] font-black text-white group-hover:block group-focus-visible:block">{getVariantLabel(variant, selectedGroup)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={`${selectedGroup && selectedGroup.variants.length > 1 ? 'mt-12' : 'mt-6'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-black tracking-[0.12em] text-emerald-700">{selectedGroup ? (isEn ? `${selectedGroup.variantCount} VARIANTS` : `当前规格 · 共 ${selectedGroup.variantCount} 个变种`) : (isEn ? 'SPECIES PROFILE' : '当前物种')}</div>
                    <h3 className="mt-2 break-words font-serif text-[32px] font-black italic leading-tight text-ink">{previewFish.name}</h3>
                    <p className="mt-1 break-words text-[13px] font-semibold italic text-ink/42">{previewFish.scientificName}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-black text-amber-700">{difficultyLabel(previewFish, isEn)}</span>
                </div>

                <p className="mt-4 text-[13px] font-semibold leading-6 text-ink/58">{previewFish.description}</p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {[
                    [isEn ? 'Temperature' : '水温', previewFish.waterTemperature],
                    ['pH', previewFish.phLevel],
                    [isEn ? 'Space' : '空间', previewFish.tankSize],
                    [isEn ? 'Water change' : '换水', isEn ? `Every ${previewFish.waterChangeCycle} days` : `约每 ${previewFish.waterChangeCycle} 天`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[16px] bg-stone-50 px-3 py-3">
                      <div className="text-[10px] font-black text-ink/36">{label}</div>
                      <div className="mt-1 break-words text-[12px] font-black leading-5 text-ink/70">{value}</div>
                    </div>
                  ))}
                </div>

                <section className="mt-4 rounded-[18px] border border-amber-100 bg-amber-50/60 p-4">
                  <div className="text-[11px] font-black text-amber-900">{isEn ? 'Feeding' : '喂养'}</div>
                  <p className="mt-1 text-[12px] font-semibold leading-5 text-ink/62">{previewFish.feedingProfile?.recommendedFoods || previewFish.diet}</p>
                </section>

                <section className="mt-3 rounded-[18px] border border-stone-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-[11px] font-black text-ink"><Info className="h-4 w-4 text-emerald-700" />{isEn ? 'Behavior & housing' : '行为与饲养'}</div>
                  <p className="mt-1 text-[12px] font-semibold leading-5 text-ink/58">{previewFish.housingReason || previewFish.housingMode || (isEn ? 'No reviewed housing note yet.' : '当前暂无已审核的饲养备注。')}</p>
                </section>

                {onOpenCompatibility && (
                  <button type="button" onClick={() => onOpenCompatibility(previewFish)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 text-[12px] font-black text-emerald-800 transition hover:bg-emerald-50">
                    {isEn ? 'Compare compatibility' : '需要时再做混养计算'}<ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {!selectedFish && (
        <div data-traditional-browse-guide className="flex flex-col gap-3 border-t border-emerald-100/80 bg-white/82 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-7">
          <div>
            <div className="text-[12px] font-black text-ink">{isEn ? 'Prefer the classic atlas?' : '也可以按传统方式浏览'}</div>
            <p className="mt-1 text-[11px] font-semibold leading-5 text-ink/46">{isEn ? 'Search, filter, and browse the complete species library below.' : '向下进入完整物种目录，用搜索、分类和筛选慢慢找。'}</p>
          </div>
          <button type="button" onClick={onBrowse} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[12px] font-black text-white">{isEn ? 'Browse all species' : '打开全部物种目录'}<ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </section>
  );
}
