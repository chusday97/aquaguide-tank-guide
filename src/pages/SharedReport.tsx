import { useEffect, useMemo, useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { SanitizedAquariumReport } from '../../packages/contracts/src/share-reports';
import { ExportArtifactDialog, type ExportArtifactContent } from '../components/export/ExportArtifactDialog';
import { getPublicAquariumShareReport } from '../services/share/aquarium-share-report.service';

export default function SharedReportPage() {
  const { token = '' } = useParams();
  const [report, setReport] = useState<SanitizedAquariumReport | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    void getPublicAquariumShareReport(token).then(data => {
      if (!active) return;
      setReport(data);
      setStatus('ready');
    }).catch(reason => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : '报告暂时无法读取。');
      setStatus('error');
    });
    return () => { active = false; };
  }, [token]);

  const exportContent = useMemo<ExportArtifactContent | null>(() => report ? ({
    eyebrow: '脱敏鱼缸报告',
    title: '我的鱼缸报告',
    summary: `${report.health.status} · 健康评分 ${report.health.score}`,
    metric: String(report.health.score),
    sections: [
      { title: '主要依据', items: report.health.reasons, tone: report.health.score >= 80 ? 'success' : 'warning' },
      { title: '环境概况', items: [
        report.environment.waterType || '未记录水体',
        report.environment.volumeLiters ? `约 ${report.environment.volumeLiters} L` : '未记录容量',
        report.environment.targetTemperatureC != null ? `${report.environment.targetTemperatureC}℃` : '未记录目标温度',
        ...report.environment.equipment,
      ] },
      { title: '物种汇总', items: report.species.map(item => `${item.name} × ${item.quantity}`) },
      { title: '本周养护', items: report.weeklyCarePlan.map(item => `${item.dayLabel} · ${item.title} · ${item.status === 'completed' ? '已完成' : item.status === 'overdue' ? '逾期' : '待完成'}`) },
    ],
    fileName: `AquaGuide-我的鱼缸报告-${new Date(report.generatedAt).toISOString().slice(0, 10)}.png`,
    disclaimer: report.disclaimer,
  }) : null, [report]);

  return (
    <main className="min-h-[100dvh] bg-[#e3ece8] px-4 py-8 text-ink">
      <div className="mx-auto w-full max-w-3xl">
        <header className="rounded-[28px] bg-gradient-to-br from-emerald-950 to-emerald-700 p-6 text-white shadow-xl md:p-8">
          <ShieldCheck className="h-10 w-10" />
          <h1 className="mt-4 text-3xl font-black">我的鱼缸报告</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/70">报告已隐藏用户身份、自定义鱼缸名称、自由描述与内部记录 ID。</p>
        </header>
        {status === 'loading' && <div className="mt-4 rounded-[24px] bg-white p-8 text-center text-sm font-bold text-ink/55">正在安全读取报告…</div>}
        {status === 'error' && <div role="alert" className="mt-4 rounded-[24px] bg-white p-8 text-center"><div className="text-lg font-black">报告不可用</div><p className="mt-2 text-sm font-semibold text-ink/55">{error}</p></div>}
        {status === 'ready' && report && (
          <section className="mt-4 grid gap-4 rounded-[28px] bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><div className="text-sm font-black text-emerald-700">健康评分</div><div className="mt-1 text-4xl font-black">{report.health.score}</div></div>
              <button type="button" onClick={() => setIsExportOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-black text-white"><Download className="h-4 w-4" />下载脱敏报告</button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <section className="rounded-2xl bg-bg p-4"><h2 className="font-black">状态与下一步</h2><p className="mt-2 text-sm font-semibold leading-6 text-ink/65">{report.health.status} · {report.health.nextAction || '继续日常观察'}</p></section>
              <section className="rounded-2xl bg-bg p-4"><h2 className="font-black">物种汇总</h2><p className="mt-2 text-sm font-semibold leading-6 text-ink/65">{report.species.map(item => `${item.name} × ${item.quantity}`).join(' · ') || '未记录物种'}</p></section>
            </div>
            <p className="border-t border-border pt-4 text-xs font-semibold leading-5 text-ink/45">{report.disclaimer}<br />有效期至 {new Date(report.expiresAt).toLocaleString('zh-CN')}</p>
          </section>
        )}
      </div>
      <ExportArtifactDialog open={isExportOpen} onOpenChange={setIsExportOpen} content={exportContent} />
    </main>
  );
}
