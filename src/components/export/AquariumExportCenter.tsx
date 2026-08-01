import { ArrowLeft, CheckSquare, ClipboardCheck, Copy, Download, FileArchive, HeartPulse, Link2, PartyPopper, Share2 } from 'lucide-react';
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

export function AquariumExportCenter({
  items,
  isEn,
  onBack,
  onPreview,
  onCreateShare,
  isCreatingShare,
  shareUrl,
  onCopyShare,
}: {
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
      <header className="mt-2 rounded-[24px] border border-white/80 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-700">AquaGuide</p>
        <h1 className="mt-2 text-2xl font-black text-ink sm:text-3xl">{isEn ? 'Export & share' : '导出与分享'}</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-ink/50">{isEn ? 'Choose a record, preview the privacy-safe image, then save it. Share links hide private notes.' : '选择要保存的记录，预览脱敏图片后下载；分享链接会隐藏私人记录。'}</p>
      </header>
      <section className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => {
          const Icon = icons[item.icon];
          return (
            <article key={item.id} className="flex min-w-0 flex-col rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-emerald-50 text-emerald-800"><Icon className="h-5 w-5" /></span>
              <h2 className="mt-3 text-base font-black text-ink">{item.title}</h2>
              <p className="mt-1 flex-1 text-xs font-semibold leading-5 text-ink/48">{item.unavailableReason || item.description}</p>
              <button type="button" disabled={!item.content} onClick={() => item.content && onPreview(item.content)} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"><Download className="h-4 w-4" />{item.content ? (isEn ? 'Preview & download' : '预览并下载') : (isEn ? 'Not available yet' : '暂不可生成')}</button>
            </article>
          );
        })}
      </section>
      <section className="mt-4 flex min-w-0 flex-col gap-4 rounded-[22px] border border-emerald-100 bg-emerald-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><div className="flex items-center gap-2 text-base font-black"><Share2 className="h-5 w-5" />{isEn ? 'Privacy-safe report link' : '脱敏鱼缸报告链接'}</div><p className="mt-1 text-xs font-semibold leading-5 text-white/65">{isEn ? 'Available for seven days and can be revoked from Settings.' : '链接有效 7 天，可在设置中随时撤销。'}</p></div>
        <button type="button" disabled={isCreatingShare} onClick={onCreateShare} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-emerald-900 disabled:opacity-50"><Link2 className="h-4 w-4" />{isCreatingShare ? (isEn ? 'Creating…' : '生成中…') : (isEn ? 'Create report link' : '生成报告链接')}</button>
      </section>
      {shareUrl && <section className="mt-3 rounded-[18px] border border-emerald-100 bg-white p-4"><div className="text-xs font-black text-ink">{isEn ? 'New report link' : '新生成的报告链接'}</div><div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row"><a href={shareUrl} target="_blank" rel="noreferrer" className="min-w-0 flex-1 break-all rounded-xl bg-slate-50 px-3 py-3 text-xs font-bold text-emerald-800 underline">{shareUrl}</a><button type="button" onClick={onCopyShare} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-emerald-200 px-4 text-xs font-black text-emerald-800"><Copy className="h-4 w-4" />{isEn ? 'Copy link' : '复制链接'}</button></div></section>}
    </main>
  );
}
