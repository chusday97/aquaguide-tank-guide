import { ArrowLeft, CheckSquare, ClipboardCheck, Download, FileArchive, HeartPulse, Link2, PartyPopper, Share2 } from 'lucide-react';
import type { ExportArtifactContent } from './ExportArtifactDialog';

export type ExportCenterItem = {
  id: string;
  title: string;
  description: string;
  content?: ExportArtifactContent;
  unavailableReason?: string;
  icon: 'health' | 'diagnosis' | 'plan' | 'checklist' | 'archive' | 'milestone';
};

const icons = {
  health: HeartPulse,
  diagnosis: ClipboardCheck,
  plan: CheckSquare,
  checklist: CheckSquare,
  archive: FileArchive,
  milestone: PartyPopper,
};

const showBuilding = (feature: 'image-export' | 'sharing') => {
  window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature } }));
};

export function AquariumExportCenter({ items, isEn, onBack }: {
  items: ExportCenterItem[];
  isEn: boolean;
  onBack: () => void;
  onPreview: (content: ExportArtifactContent) => void;
  onCreateShare: () => void;
  isCreatingShare: boolean;
  shareUrl?: string;
  onCopyShare: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-[1080px] pb-24">
      <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-black text-emerald-800 hover:bg-emerald-50"><ArrowLeft className="h-4 w-4" />{isEn ? 'Back to aquarium' : '返回我的鱼缸'}</button>
      <header className="mt-2 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-slate-500 shadow-none sm:p-7">
        <span className="inline-flex rounded-full bg-slate-200/70 px-2.5 py-1 text-[10px] font-black text-slate-500">{isEn ? 'COMING SOON' : '功能建设中'}</span>
        <h1 className="mt-3 text-2xl font-black text-slate-600 sm:text-3xl">{isEn ? 'Export & share' : '导出与分享'}</h1>
        <p className="mt-2 text-sm font-semibold text-slate-400">{isEn ? 'Image export and share controls are being completed.' : '图片导出与分享功能正在完善。'}</p>
      </header>
      <section className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => {
          const Icon = icons[item.icon];
          return (
            <article key={item.id} className="flex min-w-0 flex-col rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-slate-400 shadow-none">
              <span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-slate-100 text-slate-400"><Icon className="h-5 w-5" /></span>
              <h2 className="mt-3 text-base font-black text-slate-600">{item.title}</h2>
              <p className="mt-1 flex-1 text-xs font-semibold leading-5 text-slate-400">{item.description}</p>
              <button type="button" onClick={() => showBuilding('image-export')} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-black text-slate-400 shadow-none"><Download className="h-4 w-4" />{isEn ? 'Image export · Coming soon' : '图片导出 · 建设中'}</button>
            </article>
          );
        })}
      </section>
      <section className="mt-4 flex min-w-0 flex-col gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5 text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><div className="flex items-center gap-2 text-base font-black text-slate-600"><Share2 className="h-5 w-5" />{isEn ? 'Report sharing' : '报告分享'}</div><p className="mt-1 text-xs font-semibold leading-5 text-slate-400">{isEn ? 'Share links and privacy controls are being completed.' : '分享链接与隐私管理正在完善。'}</p></div>
        <button type="button" onClick={() => showBuilding('sharing')} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-5 text-sm font-black text-slate-400 shadow-none"><Link2 className="h-4 w-4" />{isEn ? 'Sharing · Coming soon' : '分享 · 建设中'}</button>
      </section>
    </main>
  );
}
