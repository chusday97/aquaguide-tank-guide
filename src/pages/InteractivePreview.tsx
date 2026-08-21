import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { Aquarium } from '../types';
import { fishData } from '../data/fishData';
import { ThreeAquarium } from '../components/ThreeAquarium';
import { SpeciesSceneAtlas } from '../components/interactive/SpeciesSceneAtlas';
import { KnowledgeSceneExplorer } from '../components/interactive/KnowledgeSceneExplorer';

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
  const demoAquarium = useMemo(buildDemoAquarium, []);
  const openSpecies = (id: string) => navigate(`/encyclopedia?species=${encodeURIComponent(id)}&source=interactive-preview`);
  const openCare = (id: string) => navigate(`/care?topic=${encodeURIComponent(id)}&source=interactive-preview`);

  return (
    <main className="min-h-[100dvh] bg-[#dfe8e5] px-4 py-5 text-ink md:px-8 md:py-8">
      <header className="mx-auto mb-5 flex max-w-[1440px] items-center justify-between gap-4">
        <button type="button" onClick={() => navigate('/aquarium')} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-xs font-black text-emerald-800 shadow-sm"><ArrowLeft className="h-4 w-4" />返回正式鱼缸</button>
        <span className="text-[11px] font-black tracking-[0.12em] text-ink/45">INTERNAL · FORMAL COMPONENT PREVIEW</span>
      </header>
      <div className="mx-auto grid max-w-[1440px] gap-5">
        <section aria-label="全幅 3D 鱼缸首页预览">
          <div className="mb-2 flex items-center justify-between gap-3 px-1"><div><p className="text-[11px] font-black tracking-[0.1em] text-emerald-700">FORMAL COMPONENT</p><h1 className="font-serif text-3xl font-black">全幅 3D 舞台</h1></div><button type="button" onClick={() => navigate('/aquarium')} className="inline-flex min-h-11 items-center gap-1 text-xs font-black text-emerald-800">打开正式页面<ExternalLink className="h-4 w-4" /></button></div>
          <div className="relative h-[min(72dvh,720px)] overflow-hidden rounded-[28px] border border-white/80 bg-[#eaf5f1] shadow-sm">
            <ThreeAquarium aquarium={demoAquarium} framing="stage-cover" />
            <div className="pointer-events-none absolute left-6 top-6 max-w-[42ch] md:left-10 md:top-10"><p className="text-[11px] font-black tracking-[0.16em] text-emerald-950/60">MY AQUARIUM · PREVIEW</p><h2 className="mt-2 font-serif text-[clamp(28px,4vw,52px)] font-semibold leading-none text-emerald-950">今天先完成一次观察</h2><p className="mt-3 text-sm font-bold leading-relaxed text-emerald-950/65">鱼缸内部应填满舞台；操作只覆盖边缘，不遮挡主要生物。</p></div>
            <div className="absolute right-5 top-5 w-[min(390px,34%)] rounded-[24px] bg-white/94 p-5 shadow-lg"><p className="text-[11px] font-black text-amber-700">今日行动</p><h3 className="mt-3 font-serif text-2xl font-bold text-emerald-950">完成今天的鱼缸检查</h3><button type="button" onClick={() => navigate('/aquarium?action=daily-check')} className="mt-5 min-h-12 w-full rounded-full bg-emerald-800 px-4 text-sm font-black text-white">开始今日检查</button></div>
          </div>
        </section>
        <section>
          <div className="mb-2 flex items-center justify-between gap-3 px-1"><div><p className="text-[11px] font-black tracking-[0.1em] text-emerald-700">FORMAL COMPONENT</p><h2 className="font-serif text-3xl font-black">互动图鉴＋双屏详情</h2></div><button type="button" onClick={() => navigate('/encyclopedia')} className="inline-flex min-h-11 items-center gap-1 text-xs font-black text-emerald-800">打开正式页面<ExternalLink className="h-4 w-4" /></button></div>
          <SpeciesSceneAtlas species={fishData.slice(0, 6)} getDisplayName={fish => fish.name} onSelect={fish => openSpecies(fish.id)} onBrowseList={() => navigate('/encyclopedia?mode=browse')} onIdentify={() => navigate('/identify')} />
        </section>
        <section>
          <div className="mb-2 flex items-center justify-between gap-3 px-1"><div><p className="text-[11px] font-black tracking-[0.1em] text-emerald-700">FORMAL COMPONENT</p><h2 className="font-serif text-3xl font-black">互动养护＋行动详情</h2></div><button type="button" onClick={() => navigate('/care')} className="inline-flex min-h-11 items-center gap-1 text-xs font-black text-emerald-800">打开正式页面<ExternalLink className="h-4 w-4" /></button></div>
          <KnowledgeSceneExplorer onOpenTopic={(topicId) => openCare(topicId)} onBrowseList={() => navigate('/care?mode=browse')} />
        </section>
      </div>
    </main>
  );
}
