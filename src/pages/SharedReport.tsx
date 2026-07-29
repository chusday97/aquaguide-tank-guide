import { useEffect, useMemo, useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SanitizedAquariumReport } from '../../packages/contracts/src/share-reports';
import { ExportArtifactDialog, type ExportArtifactContent } from '../components/export/ExportArtifactDialog';
import { getPublicAquariumShareReport } from '../services/share/aquarium-share-report.service';

export default function SharedReportPage() {
  const { token = '' } = useParams();
  const { i18n } = useTranslation();
  const isEn = i18n.language !== 'zh-CN';
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
      const message = reason instanceof Error ? reason.message : '';
      setError(isEn
        ? message.includes('撤销')
          ? 'This report link has been revoked.'
          : message.includes('过期')
            ? 'This report link has expired.'
            : message.includes('无效')
              ? 'This report link is invalid.'
              : 'The report is temporarily unavailable.'
        : message || '报告暂时无法读取。');
      setStatus('error');
    });
    return () => { active = false; };
  }, [isEn, token]);

  const exportContent = useMemo<ExportArtifactContent | null>(() => report ? ({
    eyebrow: isEn ? 'Privacy-safe aquarium report' : '脱敏鱼缸报告',
    title: isEn ? 'My aquarium report' : '我的鱼缸报告',
    summary: isEn ? `${report.health.status} · health score ${report.health.score}` : `${report.health.status} · 健康评分 ${report.health.score}`,
    metric: String(report.health.score),
    sections: [
      { title: isEn ? 'Main evidence' : '主要依据', items: report.health.reasons, tone: report.health.score >= 80 ? 'success' : 'warning' },
      { title: isEn ? 'Environment' : '环境概况', items: [
        report.environment.waterType || (isEn ? 'Water type not recorded' : '未记录水体'),
        report.environment.volumeLiters ? `${isEn ? 'About' : '约'} ${report.environment.volumeLiters} L` : (isEn ? 'Volume not recorded' : '未记录容量'),
        report.environment.targetTemperatureC != null ? `${report.environment.targetTemperatureC}℃` : (isEn ? 'Target temperature not recorded' : '未记录目标温度'),
        ...report.environment.equipment,
      ] },
      { title: isEn ? 'Species' : '物种汇总', items: report.species.map(item => `${item.name} × ${item.quantity}`) },
      { title: isEn ? 'Weekly care' : '本周养护', items: report.weeklyCarePlan.map(item => `${item.dayLabel} · ${item.title} · ${item.status === 'completed' ? (isEn ? 'Done' : '已完成') : item.status === 'overdue' ? (isEn ? 'Overdue' : '逾期') : (isEn ? 'Pending' : '待完成')}`) },
    ],
    fileName: `AquaGuide-${isEn ? 'aquarium-report' : '我的鱼缸报告'}-${new Date(report.generatedAt).toISOString().slice(0, 10)}.png`,
    disclaimer: report.disclaimer,
  }) : null, [isEn, report]);

  return (
    <main className="min-h-[100dvh] bg-[#e3ece8] px-4 py-8 text-ink">
      <div className="mx-auto w-full max-w-3xl">
        <header className="rounded-[28px] bg-gradient-to-br from-emerald-950 to-emerald-700 p-6 text-white shadow-xl md:p-8">
          <ShieldCheck className="h-10 w-10" />
          <h1 className="mt-4 text-3xl font-black">{isEn ? 'My aquarium report' : '我的鱼缸报告'}</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/70">{isEn ? 'Identity, custom aquarium names, free text and internal record IDs are hidden.' : '报告已隐藏用户身份、自定义鱼缸名称、自由描述与内部记录 ID。'}</p>
        </header>
        {status === 'loading' && <div className="mt-4 rounded-[24px] bg-white p-8 text-center text-sm font-bold text-ink/55">{isEn ? 'Loading the report securely…' : '正在安全读取报告…'}</div>}
        {status === 'error' && <div role="alert" className="mt-4 rounded-[24px] bg-white p-8 text-center"><div className="text-lg font-black">{isEn ? 'Report unavailable' : '报告不可用'}</div><p className="mt-2 text-sm font-semibold text-ink/55">{error}</p></div>}
        {status === 'ready' && report && (
          <section className="mt-4 grid gap-4 rounded-[28px] bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><div className="text-sm font-black text-emerald-700">{isEn ? 'Health score' : '健康评分'}</div><div className="mt-1 text-4xl font-black">{report.health.score}</div></div>
              <button type="button" onClick={() => setIsExportOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-black text-white"><Download className="h-4 w-4" />{isEn ? 'Download report' : '下载脱敏报告'}</button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <section className="rounded-2xl bg-bg p-4"><h2 className="font-black">{isEn ? 'Status and next step' : '状态与下一步'}</h2><p className="mt-2 text-sm font-semibold leading-6 text-ink/65">{report.health.status} · {report.health.nextAction || (isEn ? 'Continue routine observation' : '继续日常观察')}</p></section>
              <section className="rounded-2xl bg-bg p-4"><h2 className="font-black">{isEn ? 'Species' : '物种汇总'}</h2><p className="mt-2 text-sm font-semibold leading-6 text-ink/65">{report.species.map(item => `${item.name} × ${item.quantity}`).join(' · ') || (isEn ? 'No species recorded' : '未记录物种')}</p></section>
            </div>
            <p className="border-t border-border pt-4 text-xs font-semibold leading-5 text-ink/45">{report.disclaimer}<br />{isEn ? 'Valid until' : '有效期至'} {new Date(report.expiresAt).toLocaleString(isEn ? 'en' : 'zh-CN')}</p>
          </section>
        )}
      </div>
      <ExportArtifactDialog open={isExportOpen} onOpenChange={setIsExportOpen} content={exportContent} isEn={isEn} />
    </main>
  );
}
