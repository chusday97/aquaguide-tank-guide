import { Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export type ExportSection = {
  title: string;
  items: string[];
  tone?: 'default' | 'warning' | 'success';
};

export type ExportArtifactContent = {
  title: string;
  eyebrow: string;
  summary: string;
  metric?: string;
  sections: ExportSection[];
  fileName: string;
  disclaimer: string;
};

export function ExportArtifactDialog({
  open,
  onOpenChange,
  content,
  isEn = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ExportArtifactContent | null;
  isEn?: boolean;
}) {
  if (!content) return null;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] w-[94vw] max-w-[760px] flex-col overflow-hidden rounded-[24px] bg-[#eef3f0] p-0">
        <DialogHeader className="border-b border-white bg-white px-5 py-4 text-left">
          <DialogTitle className="text-lg font-black text-slate-600">{isEn ? 'Image export · Coming soon' : '图片导出 · 建设中'}</DialogTitle>
          <DialogDescription>{isEn ? 'Image saving is being completed.' : '图片保存功能正在完善。'}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto p-4">
          <div data-export-artifact className="mx-auto w-full max-w-[680px] rounded-[28px] border-2 border-[#173e33] bg-white p-8 text-[#10231b]">
            <div className="text-[12px] font-black uppercase tracking-[0.2em] text-[#17634b]">AquaGuide · {content.eyebrow}</div>
            <div className="mt-4 flex items-end justify-between gap-4 border-b-2 border-[#b8c7bf] pb-5">
              <div className="min-w-0">
                <h2 className="text-[30px] font-black leading-tight">{content.title}</h2>
                <p className="mt-2 text-[14px] font-bold leading-6 text-[#314a40]">{content.summary}</p>
              </div>
              {content.metric && <div className="shrink-0 text-[46px] font-black text-emerald-800">{content.metric}</div>}
            </div>
            <div className="mt-5 grid gap-4">
              {content.sections.map(section => (
                <section key={section.title} className={`rounded-[20px] border p-4 ${
                  section.tone === 'warning' ? 'border-amber-200 bg-amber-50' :
                    section.tone === 'success' ? 'border-emerald-200 bg-emerald-50' :
                      'border-[#b8c7bf] bg-[#f3f7f5]'
                }`}>
                  <h3 className="text-[15px] font-black">{section.title}</h3>
                  <div className="mt-2 grid gap-2">
                    {section.items.length ? section.items.map(item => <div key={item} className="text-[13px] font-bold leading-6 text-[#253d33]">• {item}</div>) : <div className="text-[13px] font-bold text-[#4e6259]">—</div>}
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-6 border-t-2 border-[#b8c7bf] pt-4 text-[11px] font-bold leading-5 text-[#40564c]">
              {content.disclaimer}<br />{new Date().toLocaleString(isEn ? 'en' : 'zh-CN')}
            </div>
          </div>
        </div>
        <div className="border-t border-white bg-white p-4">
          <Button type="button" onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'image-export' } }))} className="min-h-11 w-full rounded-full border border-slate-200 bg-slate-100 font-black text-slate-400 shadow-none hover:bg-slate-100">
            <Download className="mr-2 h-4 w-4" />
            {isEn ? 'Image export · Coming soon' : '图片导出 · 建设中'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
