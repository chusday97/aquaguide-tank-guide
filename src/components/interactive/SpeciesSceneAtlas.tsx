import { ArrowRight, Camera, Compass, List, Search, Sparkles } from 'lucide-react';
import type { Fish } from '../../types';
import { ResilientImage } from '../common/ResilientImage';
import { getSpeciesImageClass, getSpeciesImageSurfaceClass, getSpeciesVisualSources } from '../../lib/speciesVisual';

type Props = {
  species: Fish[];
  isEn?: boolean;
  getDisplayName: (fish: Fish) => string;
  onSelect: (fish: Fish) => void;
  onBrowseList: () => void;
  onIdentify: () => void;
};

export function SpeciesSceneAtlas({ species, isEn = false, getDisplayName, onSelect, onBrowseList, onIdentify }: Props) {
  const items = species.slice(0, 6);
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-emerald-100 bg-[linear-gradient(155deg,#e9fbfa_0%,#d6efe9_44%,#edf7e7_100%)] p-4 shadow-[0_20px_50px_rgba(20,94,76,.12)] md:p-7">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[52%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(26,122,96,.28),transparent_72%)]" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[.18em] text-emerald-700"><Compass className="h-4 w-4" />{isEn ? 'Interactive atlas' : '互动图鉴'}</div>
          <h1 className="mt-2 font-serif text-[30px] font-bold leading-[1.05] text-ink md:text-[46px]">{isEn ? 'Find a fish that catches your eye.' : '先从一条让你心动的鱼开始。'}</h1>
          <p className="mt-3 max-w-xl text-[14px] font-medium leading-relaxed text-ink/65">{isEn ? 'Tap a fish to see feeding, environment and a compatibility preview for your current aquarium.' : '点击鱼了解喂养、环境与当前鱼缸的混养预览；需要时再切回传统浏览。'}</p>
        </div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={onBrowseList} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 text-xs font-black text-emerald-800 shadow-sm hover:bg-emerald-50"><List className="h-4 w-4" />{isEn ? 'Browse list' : '传统浏览'}</button><button type="button" onClick={onIdentify} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 text-xs font-black text-emerald-800 shadow-sm hover:bg-emerald-50"><Camera className="h-4 w-4" />{isEn ? 'Identify' : '拍照识别'}</button></div>
      </div>

      <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((fish, index) => (
          <button key={fish.id} type="button" onClick={() => onSelect(fish)} className={`group relative min-h-[184px] overflow-hidden rounded-[24px] border border-white/80 p-3 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${index === 0 ? 'sm:col-span-2 sm:min-h-[250px]' : ''} ${getSpeciesImageSurfaceClass(fish)}`}>
            <ResilientImage src={getSpeciesVisualSources(fish).detail} alt={fish.name} className={`absolute inset-2 h-[68%] w-[calc(100%-16px)] object-contain transition duration-300 group-hover:scale-105 ${getSpeciesImageClass(fish)}`} loading={index > 1 ? 'lazy' : 'eager'} />
            <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2"><span><span className="block text-[14px] font-black text-ink">{getDisplayName(fish)}</span><span className="mt-0.5 block text-[10px] font-bold text-ink/54">{fish.scientificName}</span></span><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white shadow-sm"><ArrowRight className="h-4 w-4" /></span></span>
          </button>
        ))}
      </div>
      <div className="relative mt-4 flex items-center gap-2 text-[12px] font-bold text-emerald-900/70"><Sparkles className="h-4 w-4 text-amber-500" />{isEn ? 'The scene is a discovery path, not a recommendation ranking.' : '这是探索入口，不把它伪装成推荐排序。'}</div>
    </section>
  );
}
