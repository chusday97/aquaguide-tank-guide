import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock3, Database, Loader2, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  operationsWorkItemService,
  type OperationsHomeSnapshot,
  type OperationsSeverity,
  type OperationsWorkItem,
} from '../services/admin/operations-work-item.service';

const emptySnapshot: OperationsHomeSnapshot = { workItems: [], sources: [], recentEvents: [] };
const authorityLabel = { product_care: 'Product / Care', compatibility: 'Compatibility', seo: 'SEO' } as const;
const severityLabel: Record<OperationsSeverity, string> = {
  blocker: '阻断', decision: '需人工确认', attention: '待处理', ready: '可继续', info: '信息',
};
const severityClass: Record<OperationsSeverity, string> = {
  blocker: 'text-red-700 border-red-500',
  decision: 'text-amber-700 border-amber-500',
  attention: 'text-ink border-slate-400',
  ready: 'text-emerald-700 border-emerald-600',
  info: 'text-ink/60 border-slate-300',
};

export default function AdminHub() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<OperationsHomeSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setSnapshot(await operationsWorkItemService.load()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Operations 工作项暂时无法读取。'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const primaryTask = snapshot.workItems[0] || null;
  const queueItems = snapshot.workItems.slice(primaryTask ? 1 : 0, 12);
  const hiddenTaskCount = Math.max(0, snapshot.workItems.length - (primaryTask ? 1 : 0) - queueItems.length);
  const sourceProblems = useMemo(() => snapshot.sources.filter(source => source.availability !== 'ready'), [snapshot.sources]);

  const open = (href: string) => {
    if (href.startsWith('/admin/')) navigate(href);
    else window.location.assign(href);
  };

  return (
    <div className="min-h-[100dvh] bg-[#edf1ef] p-3 text-ink md:p-6">
      <div className="mx-auto max-w-[1240px]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="返回 AquaGuide" onClick={() => navigate('/aquarium')} className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-200 bg-white hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /></button>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">Aqua Operations Studio</div>
              <h1 className="truncate text-2xl font-black">运营工作台</h1>
              <p className="mt-0.5 text-xs font-semibold text-ink/45">先处理问题，再进入对应 authority；工作台本身不改写 Product、Care、Compatibility 或 SEO。</p>
            </div>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading} className="flex h-10 items-center gap-2 border border-slate-200 bg-white px-3 text-xs font-black text-ink/65 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />刷新任务</button>
        </header>

        {error && <div role="alert" className="mt-3 border-l-4 border-red-500 bg-white px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

        <section data-testid="operations-primary-task" className={`mt-4 border-l-4 bg-white px-4 py-4 md:px-5 ${primaryTask ? severityClass[primaryTask.severity].split(' ')[1] : 'border-slate-300'}`}>
          {loading ? <div className="flex min-h-16 items-center gap-2 text-sm font-bold text-ink/45"><Loader2 className="h-5 w-5 animate-spin" />正在汇总各 authority 当前任务…</div> : primaryTask ? <PrimaryTask item={primaryTask} onOpen={open} /> : <div><div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/35">当前优先任务</div><strong className="mt-1 block text-lg font-black">当前没有可读取的待处理工作项</strong><p className="mt-1 text-xs font-semibold leading-5 text-ink/48">这不等于所有系统都健康；请同时查看下方 authority 读取状态。</p></div>}
        </section>

        <section className="mt-4 border border-slate-200 bg-white" data-testid="operations-work-queue">
          <div className="flex items-end justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div><div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/35">Work queue</div><h2 className="mt-0.5 text-lg font-black">现在需要处理</h2></div>
            <span className="text-xs font-black text-ink/40">{snapshot.workItems.length} 个真实任务</span>
          </div>
          {!loading && queueItems.length === 0 ? <div className="px-4 py-6 text-sm font-semibold text-ink/45">{primaryTask ? '当前只有上方这一条优先任务。' : '当前没有来自已连接 authority 的任务。'}</div> : <div className="divide-y divide-slate-100">{queueItems.map(item => <WorkItemRow key={item.id} item={item} onOpen={open} />)}</div>}
          {!loading && hiddenTaskCount > 0 && <div className="border-t border-slate-100 px-4 py-3 text-xs font-semibold text-ink/45">还有 {hiddenTaskCount} 个任务未在首页展开；进入对应 Authority 查看全量。</div>}
        </section>

        <section className="mt-4 border border-slate-200 bg-white" data-testid="operations-source-status">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-200 px-4 py-3"><div><div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/35">Authority status</div><h2 className="mt-0.5 text-base font-black">数据来源</h2></div>{!loading && sourceProblems.length > 0 && <span className="text-[11px] font-semibold text-ink/45">不可读来源不会生成假 0，也不会阻塞其它 authority</span>}</div>
          <div className="grid md:grid-cols-3">{snapshot.sources.map(source => <div key={source.authority} data-testid={`operations-source-${source.authority}`} className="border-b border-slate-100 px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"><div className="flex items-center justify-between gap-3"><strong className="text-sm font-black">{source.label}</strong><span className={`text-[11px] font-black ${source.availability === 'ready' ? 'text-emerald-700' : 'text-ink/45'}`}>{source.availability === 'ready' ? '可读取' : source.availability === 'partial' ? '部分可读' : source.availability === 'auth_required' ? '需要登录' : source.availability === 'forbidden' ? '权限不足' : '暂不可用'}</span></div><p className="mt-1 text-[11px] font-semibold leading-5 text-ink/45">{source.detail}</p></div>)}</div>
        </section>

        <section className="mt-4 border border-slate-200 bg-white" data-testid="operations-workspaces">
          <div className="border-b border-slate-200 px-4 py-3"><div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/35">Authority workspaces</div><h2 className="mt-0.5 text-lg font-black">进入具体工作区</h2></div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4">
            <WorkspaceLink icon={Database} label="Product / Care" detail="业务事实与养护内容" onClick={() => navigate('/admin/product-content')} />
            <WorkspaceLink icon={ShieldCheck} label="Compatibility" detail="规则、Evidence 与人工审核" onClick={() => navigate('/admin/compatibility')} />
            <WorkspaceLink icon={Search} label="SEO" detail="全站健康与 Species/Care SEO" onClick={() => navigate('/admin/seo-pages')} />
            <WorkspaceLink icon={Clock3} label="Publish" detail="Release readiness 与审计历史" onClick={() => navigate('/admin/publish-center')} />
          </div>
        </section>

        <section className="mt-4 border border-slate-200 bg-white" data-testid="operations-recent-activity">
          <div className="flex items-end justify-between gap-3 border-b border-slate-200 px-4 py-3"><div><div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/35">Recent activity</div><h2 className="mt-0.5 text-lg font-black">最近发布 / 审核动态</h2></div><button type="button" onClick={() => navigate('/admin/publish-center')} className="text-xs font-black text-ink/65 underline">查看全部 →</button></div>
          {snapshot.recentEvents.length ? <div className="divide-y divide-slate-100">{snapshot.recentEvents.slice(0, 5).map(event => <div key={event.id} className="grid gap-1 px-4 py-3 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center"><span className="text-[11px] font-black uppercase tracking-[0.06em] text-ink/35">{authorityLabel[event.authority]}</span><span className="min-w-0"><strong className="block truncate text-sm font-black">{event.title}</strong><small className="block truncate text-[11px] font-semibold text-ink/42">{event.detail || event.resourceKey || event.eventType}</small></span><time className="text-[11px] font-bold text-ink/35">{new Date(event.occurredAt).toLocaleString('zh-CN', { hour12: false })}</time></div>)}</div> : <div className="px-4 py-6 text-sm font-semibold text-ink/45">当前没有可读取的 release history；这不会被当作当前任务状态。</div>}
        </section>
      </div>
    </div>
  );
}

function PrimaryTask({ item, onOpen }: { item: OperationsWorkItem; onOpen: (href: string) => void }) {
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start"><div className="min-w-0"><div className={`text-[11px] font-black uppercase tracking-[0.08em] ${severityClass[item.severity].split(' ')[0]}`}>当前优先任务 · {severityLabel[item.severity]}</div><h2 className="mt-1 text-lg font-black">{item.title}</h2><p className="mt-1 max-w-[760px] text-xs font-semibold leading-5 text-ink/48">{item.detail}</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="border border-slate-100 bg-slate-50 px-3 py-2.5"><div className="text-[10px] font-black uppercase tracking-[0.08em] text-ink/35">当前卡点</div><div className="mt-1 text-xs font-black text-ink/70">{item.gateLabel}</div></div><div className="border border-slate-100 bg-slate-50 px-3 py-2.5"><div className="text-[10px] font-black uppercase tracking-[0.08em] text-ink/35">下一步</div><div className="mt-1 text-xs font-black leading-5 text-ink/70">{item.nextStep}</div></div></div><p className="mt-2 text-[10px] font-semibold leading-4 text-ink/38">{item.verificationNote}</p></div><button type="button" onClick={() => onOpen(item.href)} className={`h-10 border bg-white px-4 text-xs font-black ${severityClass[item.severity]}`}>{item.actionLabel} →</button></div>;
}

function WorkItemRow({ item, onOpen }: { item: OperationsWorkItem; onOpen: (href: string) => void }) {
  return <button type="button" onClick={() => onOpen(item.href)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 text-left hover:bg-slate-50 md:grid-cols-[105px_minmax(0,1fr)_auto] md:items-center"><span className={`hidden border-l-2 pl-2 text-[11px] font-black md:block ${severityClass[item.severity]}`}>{severityLabel[item.severity]}</span><span className="min-w-0"><strong className="block text-sm font-black">{item.title}</strong><small className="mt-0.5 block text-[11px] font-semibold leading-5 text-ink/42">卡点：{item.gateLabel} · 下一步：{item.nextStep}</small><small className={`mt-1 block text-[11px] font-black md:hidden ${severityClass[item.severity].split(' ')[0]}`}>{severityLabel[item.severity]}</small></span><span className="text-xs font-black text-ink/65">{item.actionLabel} →</span></button>;
}

function WorkspaceLink({ icon: Icon, label, detail, onClick }: { icon: typeof Database; label: string; detail: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-[92px] items-center gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 md:border-r xl:border-b-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 bg-white text-ink/55"><Icon className="h-4 w-4" /></span><span className="min-w-0"><strong className="block text-sm font-black">{label}</strong><small className="mt-1 block text-[11px] font-semibold leading-5 text-ink/42">{detail}</small></span></button>;
}
