import { ArrowRight, ClipboardCheck, Fish, ListPlus, Sparkles } from 'lucide-react';
import type { Aquarium, Fish as FishType } from '../../types';
import { ResilientImage } from '../common/ResilientImage';
import { getSpeciesImageClass, getSpeciesVisualSources } from '../../lib/speciesVisual';
import type { DailyActionViewModel } from '../product/StatusSummaryCard';
import type { CarePlanSummaryViewModel } from '../product/StatusSummaryCard';

type Props = {
  aquarium: Aquarium;
  species: FishType[];
  action: DailyActionViewModel;
  carePlan: CarePlanSummaryViewModel;
  isEn?: boolean;
  onPrimaryAction: () => void;
  onOpenLivestock: () => void;
  onOpenDiscovery: () => void;
};

export function InteractiveAquariumHero({ aquarium, species, action, carePlan, isEn = false, onPrimaryAction, onOpenLivestock, onOpenDiscovery }: Props) {
  const preview = species.slice(0, 3);
  const title = aquarium.name;
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-emerald-100 bg-[linear-gradient(145deg,#e7f8f7_0%,#dff1e9_46%,#f6f8e8_100%)] p-4 shadow-[0_20px_52px_rgba(17,94,75,.12)] md:p-6">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[54%] bg-[radial-gradient(ellipse_at_50%_110%,rgba(37,120,98,.28),transparent_72%)]" />
      <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)] lg:items-stretch">
        <div className="relative min-h-[270px] overflow-hidden rounded-[24px] border border-white/75 bg-[linear-gradient(180deg,rgba(236,253,252,.88),rgba(125,198,190,.5))] p-4">
          <div aria-hidden="true" className="absolute inset-x-7 top-7 h-16 rounded-[50%] border border-white/80 bg-white/22" />
          <div className="relative flex items-start justify-between gap-3"><div><span className="text-[11px] font-black uppercase tracking-[.16em] text-emerald-800">{isEn ? 'Your aquarium' : '我的鱼缸'}</span><h1 className="mt-1 font-serif text-[30px] font-bold leading-tight text-ink">{title}</h1></div><button type="button" data-interactive-livestock onClick={onOpenLivestock} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/90 bg-white/86 px-3 text-[11px] font-black text-emerald-800 shadow-sm hover:bg-white"><Fish className="h-4 w-4" />{isEn ? `${aquarium.fishes.length} species` : `${aquarium.fishes.length} 种生物`}</button></div>
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-center gap-2 sm:gap-5">
            {preview.length ? preview.map((fish, index) => <div key={fish.id} className={`relative h-[112px] w-[112px] ${index === 1 ? '-translate-y-5' : ''}`}><ResilientImage src={getSpeciesVisualSources(fish).detail} alt={fish.name} className={`h-full w-full object-contain drop-shadow-[0_16px_16px_rgba(22,78,65,.22)] ${getSpeciesImageClass(fish)}`} /></div>) : <div className="mb-4 text-center text-sm font-bold text-emerald-950/55">{isEn ? 'Add what is already in your aquarium.' : '先记录现实中已经在缸里的生物。'}</div>}
          </div>
        </div>
        <div className="flex min-w-0 flex-col rounded-[24px] border border-white/80 bg-white/86 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[.14em] text-emerald-700"><Sparkles className="h-4 w-4" />{isEn ? 'Today’s next move' : '今天先做这件事'}</div>
          <h2 className="mt-3 font-serif text-[24px] font-bold leading-tight text-ink">{action.task.title}</h2>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink/62">{action.task.reason}</p>
          {action.level === 'urgent' && action.reasoning[0] && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-bold leading-relaxed text-red-700">{action.reasoning[0]}</p>}
          {action.task.primaryLabel ? <button type="button" data-interactive-primary onClick={onPrimaryAction} className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 text-sm font-black text-white shadow-sm transition hover:bg-emerald-900"><ClipboardCheck className="h-4 w-4" />{action.task.primaryLabel}<ArrowRight className="h-4 w-4" /></button> : <div className="mt-auto rounded-full bg-emerald-50 px-4 py-3 text-center text-xs font-black text-emerald-800">{isEn ? 'No action is required right now.' : '现在没有必须处理的事项。'}</div>}
          {carePlan.activeCount > 0 && <div className="mt-2 rounded-[14px] bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-900">{isEn ? `${carePlan.activeCount} care plan${carePlan.activeCount > 1 ? 's' : ''} active` : `还有 ${carePlan.activeCount} 项养护计划`}</div>}
          <button type="button" onClick={onOpenDiscovery} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 text-xs font-black text-emerald-800 hover:bg-emerald-100"><ListPlus className="h-4 w-4" />{isEn ? 'Discover a species' : '看看今日推荐'}</button>
        </div>
      </div>
    </section>
  );
}
