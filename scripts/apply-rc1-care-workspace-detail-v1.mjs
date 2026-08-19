import fs from 'node:fs';

const path = 'src/pages/CareEncyclopedia.tsx';
let source = fs.readFileSync(path, 'utf8');

const replaceExact = (before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  source = source.replace(before, after);
};

replaceExact(
  "import { AlertTriangle, Baby, Check, ChevronDown, ChevronRight, Copy, Droplets, ExternalLink, Fish, Heart, HelpCircle, Loader2, Maximize2, Search, Settings, Stethoscope, Waves } from 'lucide-react';",
  "import { AlertTriangle, ArrowLeft, Baby, Check, ChevronDown, ChevronRight, Copy, Droplets, ExternalLink, Fish, Heart, HelpCircle, Loader2, Maximize2, Search, Settings, Stethoscope, Waves } from 'lucide-react';",
  'Add workspace detail back icon',
);

replaceExact(
`  activeAquarium,
}: {
  topic: CareTopic;`,
`  activeAquarium,
  embedded = false,
}: {
  topic: CareTopic;`,
  'Accept embedded Care detail mode',
);

replaceExact(
`  activeAquarium: Aquarium | null;
}) {`,
`  activeAquarium: Aquarium | null;
  embedded?: boolean;
}) {`,
  'Type embedded Care detail mode',
);

replaceExact(
`  return (
    <div className="flex max-h-[88vh] flex-col bg-white">
      <div ref={scrollRef} className="app-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden">`,
`  return (
    <div className={embedded ? 'flex min-h-0 flex-col bg-white' : 'flex max-h-[88vh] flex-col bg-white'}>
      <div
        ref={scrollRef}
        className={embedded
          ? 'app-scrollbar-hidden min-h-0 max-h-[calc(100dvh-170px)] flex-1 overflow-y-auto overflow-x-hidden md:max-h-[calc(100dvh-150px)]'
          : 'app-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden'}
      >`,
  'Make Care detail compatible with workspace embedding',
);

replaceExact(
`    <div className="page-frame-wide care-workspace-shell min-w-0 overflow-x-hidden">
      <div className="care-workspace-grid flex min-w-0 flex-col gap-3 pb-4 md:pb-8">
      <section className="px-1 py-1 md:hidden">`,
`    <div className="page-frame-wide care-workspace-shell min-w-0 overflow-x-hidden">
      <div className="care-workspace-grid flex min-w-0 flex-col gap-3 pb-4 md:pb-8">
      <div data-care-browse-surface className={selectedTopic ? 'hidden' : 'contents'}>
      <section className="px-1 py-1 md:hidden">`,
  'Wrap Care browse surface so route/detail context stays mounted',
);

const oldDetailBlock = `      <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && closeCareDetail()}>
        <AdaptiveDetailContent>
          {selectedTopic && (
            <CareArticleDetail
              key={selectedTopic.id}
              topic={selectedTopic}
              scrollRef={detailScrollRef}
              checkedActions={checkedActions}
              favorite={Boolean(favorites[selectedTopic.id])}
              onToggleAction={(value) => toggleValue(value, setCheckedActions)}
              onToggleFavorite={(source) => toggleFavorite(selectedTopic, source)}
              onOpenShare={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))}
              onOpenCareCard={() => setShareTopic(selectedTopic)}
              onPreview={() => openPreview(selectedTopic)}
              onSelectRelated={(topic) => openCareDetail(topic.id, undefined, false)}
              onOpenCollection={() => navigateToRoute(taskRoutes.collection.care)}
              onRestoreActions={setCheckedActions}
              activeAquarium={activeAquarium}
            />
          )}
        </AdaptiveDetailContent>
      </Dialog>`;

const newDetailBlock = `      </div>

      {selectedTopic && (
        <section
          data-care-workspace-detail
          className="min-w-0 overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-sm"
        >
          <div className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-3 border-b border-border/70 bg-white/95 px-3 py-2 backdrop-blur md:px-4">
            <button
              type="button"
              data-care-detail-back
              onClick={closeCareDetail}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-black text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {isEn ? 'Back to Care' : '返回养护'}
            </button>
            <div className="min-w-0 truncate text-[11px] font-bold text-ink/40">
              {isEn ? 'Care detail' : '养护详情'}
            </div>
          </div>
          <CareArticleDetail
            key={selectedTopic.id}
            topic={selectedTopic}
            scrollRef={detailScrollRef}
            checkedActions={checkedActions}
            favorite={Boolean(favorites[selectedTopic.id])}
            onToggleAction={(value) => toggleValue(value, setCheckedActions)}
            onToggleFavorite={(source) => toggleFavorite(selectedTopic, source)}
            onOpenShare={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))}
            onOpenCareCard={() => setShareTopic(selectedTopic)}
            onPreview={() => openPreview(selectedTopic)}
            onSelectRelated={(topic) => openCareDetail(topic.id, undefined, false)}
            onOpenCollection={() => navigateToRoute(taskRoutes.collection.care)}
            onRestoreActions={setCheckedActions}
            activeAquarium={activeAquarium}
            embedded
          />
        </section>
      )}`;

replaceExact(oldDetailBlock, newDetailBlock, 'Replace Care article Dialog with workspace detail surface');

fs.writeFileSync(path, source);
console.log('Applied RC1 Care workspace detail migration: long-form article browsing no longer owns a Dialog.');
