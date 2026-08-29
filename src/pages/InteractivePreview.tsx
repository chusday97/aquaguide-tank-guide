import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { Aquarium } from '../types';
import { fishData } from '../data/fishData';
import { ThreeAquarium } from '../components/ThreeAquarium';
import { SpeciesSceneAtlas } from '../components/interactive/SpeciesSceneAtlas';
import { KnowledgeSceneExplorer } from '../components/interactive/KnowledgeSceneExplorer';
import CollectionHub from './CollectionHub';

const buildDemoAquarium = (): Aquarium => ({
  id: 'interactive-preview-tank',
  name: '预览生态缸',
  startedAt: '2026-08-01',
  startedAtSource: 'created',
  dimensions: { length: '900', width: '450', height: '500' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '水草灯' },
  plants: [],
  hardscape: [],
  fishes: fishData.slice(0, 3).map((fish, index) => ({ id: `preview-${fish.id}`, fishId: fish.id, quantity: index + 1, entryDate: '2026-08-01' })),
});

export default function InteractivePreview() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const demoAquarium = useMemo(buildDemoAquarium, []);
  const requestedModule = searchParams.get('module');
  const module = requestedModule === 'encyclopedia' || requestedModule === 'care' || requestedModule === 'collection' ? requestedModule : 'aquarium';
  const openSpecies = (id: string) => navigate(`/encyclopedia?species=${encodeURIComponent(id)}&source=interactive-preview`);
  const openCare = (id: string) => navigate(`/care?topic=${encodeURIComponent(id)}&source=interactive-preview`);
  const setModule = (nextModule: typeof module) => setSearchParams({ module: nextModule });

  const moduleMeta = {
    aquarium: { label: '鱼缸舞台', eyebrow: 'FORMAL COMPONENT', title: '全幅 3D 舞台' },
    encyclopedia: { label: '互动图鉴', eyebrow: 'FORMAL COMPONENT', title: '互动图鉴＋详情' },
    care: { label: '互动养护', eyebrow: 'FORMAL COMPONENT', title: '互动养护＋行动' },
    collection: { label: '水族册', eyebrow: 'FORMAL COMPONENT', title: '水族册场景' },
  } as const;
  const activeMeta = moduleMeta[module];

  return (
    <main data-workspace-layout="standalone" className="interactive-preview-shell min-h-[100dvh] bg-[#dfe8e5] px-4 py-5 text-ink md:px-8 md:py-8" data-preview-module={module} data-preview-ready="true">
      <header className="mx-auto mb-4 flex max-w-[1440px] items-center justify-between gap-4">
        <button type="button" onClick={() => navigate('/aquarium')} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-xs font-black text-emerald-800 shadow-sm"><ArrowLeft className="h-4 w-4" />返回正式鱼缸</button>
        <div data-preview-metadata className="text-right text-[10px] font-black tracking-[0.08em] text-ink/45">
          <span className="block">{__AQUAGUIDE_PREVIEW_METADATA__.branch} · {__AQUAGUIDE_PREVIEW_METADATA__.sha}</span>
          <span className="mt-1 block tracking-normal">seed: {__AQUAGUIDE_PREVIEW_METADATA__.seed} · built: {__AQUAGUIDE_PREVIEW_METADATA__.builtAt}</span>
        </div>
      </header>
      <nav className="mx-auto mb-4 flex max-w-[1440px] flex-wrap items-center gap-2 rounded-[22px] border border-white/70 bg-white/60 p-2 shadow-sm backdrop-blur-xl" aria-label="预览模块切换">
        {(Object.keys(moduleMeta) as Array<keyof typeof moduleMeta>).map(item => (
          <button key={item} type="button" aria-pressed={module === item} onClick={() => setModule(item)} className={`min-h-10 rounded-full px-4 text-xs font-black transition-colors ${module === item ? 'bg-emerald-800 text-white shadow-sm' : 'text-emerald-900/65 hover:bg-white/75'}`}>{moduleMeta[item].label}</button>
        ))}
      </nav>
      <section className="mx-auto max-w-[1440px]" aria-label={`${activeMeta.label}预览`}>
        <div className="mb-3 flex items-center justify-between gap-3 px-1"><div><p className="text-[11px] font-black tracking-[0.1em] text-emerald-700">{activeMeta.eyebrow}</p><h1 className="font-serif text-3xl font-black">{activeMeta.title}</h1></div><button type="button" onClick={() => navigate(module === 'aquarium' ? '/aquarium' : module === 'encyclopedia' ? '/encyclopedia' : module === 'care' ? '/care' : '/collection')} className="inline-flex min-h-11 items-center gap-1 text-xs font-black text-emerald-800">打开正式页面<ExternalLink className="h-4 w-4" /></button></div>
        {module === 'aquarium' && <div className="relative h-[min(72dvh,720px)] overflow-hidden rounded-[28px] border border-white/80 bg-[#eaf5f1] shadow-sm">
            <ThreeAquarium aquarium={demoAquarium} framing="stage-cover" />
            <div className="pointer-events-none absolute left-6 top-6 max-w-[42ch] md:left-10 md:top-10"><p className="text-[11px] font-black tracking-[0.16em] text-emerald-950/60">MY AQUARIUM · PREVIEW</p><h2 className="mt-2 font-serif text-[clamp(28px,4vw,52px)] font-semibold leading-none text-emerald-950">今天先完成一次观察</h2><p className="mt-3 text-sm font-bold leading-relaxed text-emerald-950/65">鱼缸内部应填满舞台；操作只覆盖边缘，不遮挡主要生物。</p></div>
            <div className="absolute right-5 top-5 w-[min(390px,34%)] rounded-[24px] bg-white/94 p-5 shadow-lg"><p className="text-[11px] font-black text-amber-700">今日行动</p><h3 className="mt-3 font-serif text-2xl font-bold text-emerald-950">完成今天的鱼缸检查</h3><button type="button" onClick={() => navigate('/aquarium?action=daily-check')} className="mt-5 min-h-12 w-full rounded-full bg-emerald-800 px-4 text-sm font-black text-white">开始今日检查</button></div>
          </div>}
        {module === 'encyclopedia' && <SpeciesSceneAtlas species={fishData.slice(0, 6)} getDisplayName={fish => fish.name} onSelect={fish => openSpecies(fish.id)} onBrowseList={() => navigate('/encyclopedia?mode=browse')} onIdentify={() => navigate('/identify')} />}
        {module === 'care' && <KnowledgeSceneExplorer onOpenTopic={(topicId) => openCare(topicId)} onBrowseList={() => navigate('/care?mode=browse')} />}
        {module === 'collection' && <CollectionHub />}
      </section>
    </main>
  );
}
