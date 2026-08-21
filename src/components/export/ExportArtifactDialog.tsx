import { useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { downloadArtifactContentAsPng, safeExportFileName } from '../../services/export/png-export.service';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  if (!content) return null;

  const download = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setError('');
    try {
      await downloadArtifactContentAsPng(content, safeExportFileName(content.fileName), isEn ? 'en' : 'zh-CN');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : (isEn ? 'Download failed.' : '图片下载失败，请稍后重试。'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isDownloading && onOpenChange(next)}>
      <DialogContent surface="media" className="flex max-h-[90dvh] w-[94vw] max-w-[760px] flex-col overflow-hidden rounded-[24px] bg-[#eef3f0] p-0">
        <DialogHeader className="border-b border-white bg-white px-5 py-4 text-left">
          <DialogTitle className="text-lg font-black">{isEn ? 'Download image' : '下载图片'}</DialogTitle>
          <DialogDescription>{isEn ? 'Preview the privacy-safe card before saving.' : '保存前可预览本次生成的记录卡。'}</DialogDescription>
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
                    {content.sections.length && section.items.length ? section.items.map(item => <div key={item} className="text-[13px] font-bold leading-6 text-[#253d33]">• {item}</div>) : <div className="text-[13px] font-bold text-[#4e6259]">—</div>}
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-6 border-t-2 border-[#b8c7bf] pt-4 text-[11px] font-bold leading-5 text-[#40564c]">
              {content.disclaimer}<br />{new Date().toLocaleString(isEn ? 'en' : 'zh-CN')}
            </div>
          </div>
          {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        </div>
        <div className="border-t border-white bg-white p-4">
          <Button type="button" onClick={() => void download()} disabled={isDownloading} className="min-h-11 w-full rounded-full font-black">
            {isDownloading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isDownloading ? (isEn ? 'Generating…' : '正在生成…') : (isEn ? 'Save PNG' : '保存 PNG')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
