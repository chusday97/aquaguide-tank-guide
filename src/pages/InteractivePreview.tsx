import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { fishData } from '../data/fishData';
import { SpeciesSceneAtlas } from '../components/interactive/SpeciesSceneAtlas';
import { KnowledgeSceneExplorer } from '../components/interactive/KnowledgeSceneExplorer';

export default function InteractivePreview() {
  const navigate = useNavigate();
  const openSpecies = (id: string) => navigate(`/encyclopedia?species=${encodeURIComponent(id)}&source=interactive-preview`);
  const openCare = (id: string) => navigate(`/care?topic=${encodeURIComponent(id)}&source=interactive-preview`);

  return (
    <main className="min-h-[100dvh] bg-[#dfe8e5] px-4 py-5 text-ink md:px-8 md:py-8">
      <header className="mx-auto mb-5 flex max-w-[1440px] items-center justify-between gap-4">
        <button type="button" onClick={() => navigate('/aquarium')} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-xs font-black text-emerald-800 shadow-sm"><ArrowLeft className="h-4 w-4" />返回正式鱼缸</button>
        <span className="text-[11px] font-black tracking-[0.12em] text-ink/45">INTERNAL · FORMAL COMPONENT PREVIEW</span>
      </header>
      <div className="mx-auto grid max-w-[1440px] gap-5">
        <section>
          <div className="mb-2 flex items-center justify-between gap-3 px-1"><div><p className="text-[11px] font-black tracking-[0.1em] text-emerald-700">FORMAL COMPONENT</p><h1 className="font-serif text-3xl font-black">互动图鉴</h1></div><button type="button" onClick={() => navigate('/encyclopedia')} className="inline-flex min-h-11 items-center gap-1 text-xs font-black text-emerald-800">打开正式页面<ExternalLink className="h-4 w-4" /></button></div>
          <SpeciesSceneAtlas species={fishData.slice(0, 6)} getDisplayName={fish => fish.name} onSelect={fish => openSpecies(fish.id)} onBrowseList={() => navigate('/encyclopedia?mode=browse')} onIdentify={() => navigate('/identify')} />
        </section>
        <section>
          <div className="mb-2 flex items-center justify-between gap-3 px-1"><div><p className="text-[11px] font-black tracking-[0.1em] text-emerald-700">FORMAL COMPONENT</p><h2 className="font-serif text-3xl font-black">互动养护</h2></div><button type="button" onClick={() => navigate('/care')} className="inline-flex min-h-11 items-center gap-1 text-xs font-black text-emerald-800">打开正式页面<ExternalLink className="h-4 w-4" /></button></div>
          <KnowledgeSceneExplorer onOpenTopic={(topicId) => openCare(topicId)} onBrowseList={() => navigate('/care?mode=browse')} />
        </section>
      </div>
    </main>
  );
}
