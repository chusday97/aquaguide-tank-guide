import { useEffect, useMemo, useRef, useState } from 'react';
import { ArchiveRestore, ArrowLeft, Clock3, Database, HardDriveDownload, Loader2, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { createLocalAdminBackup, getLocalAdminPersistenceStatus, getLocalAdminSafetySnapshot, isLocalAdminFileMode, restoreLocalAdminBackup, type LocalAdminSafetySnapshot } from '../services/admin/local-file-persistence';
import {
  operationsWorkItemService,
  type OperationsHomeSnapshot,
  type OperationsSeverity,
  type OperationsTaskReturnContext,
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
  const location = useLocation();
  const [snapshot, setSnapshot] = useState<OperationsHomeSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [localSafety, setLocalSafety] = useState<LocalAdminSafetySnapshot | null>(null);
  const [safetyBusy, setSafetyBusy] = useState<'backup' | 'restore' | ''>('');
  const [safetyMessage, setSafetyMessage] = useState('');
  const [returnContext, setReturnContext] = useState<(OperationsTaskReturnContext & { inQueue: boolean }) | null>(null);
  const handledReturnTaskRef = useRef<string | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    try { setSnapshot(await operationsWorkItemService.load()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Operations 工作项暂时无法读取。'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!isLocalAdminFileMode) return;
    void getLocalAdminSafetySnapshot()
      .then(snapshot => setLocalSafety(snapshot))
      .catch(cause => setSafetyMessage(cause instanceof Error ? cause.message : '本地数据安全状态暂时无法读取。'));
  }, []);
  const primaryTask = snapshot.workItems[0] || null;
  const queueItems = snapshot.workItems.slice(primaryTask ? 1 : 0, 12);
  const hiddenTaskCount = Math.max(0, snapshot.workItems.length - (primaryTask ? 1 : 0) - queueItems.length);
  const sourceProblems = useMemo(() => snapshot.sources.filter(source => source.availability !== 'ready'), [snapshot.sources]);
  const authRequired = sourceProblems.some(source => source.availability === 'auth_required');
  const localPersistence = getLocalAdminPersistenceStatus();
  const latestBackup = localSafety?.backups[0] || null;
  const safetyErrorCount = localSafety?.integrity.issues.filter(issue => issue.severity === 'error').length || 0;
  const safetyWarningCount = localSafety?.integrity.issues.filter(issue => issue.severity === 'warning').length || 0;

  const refreshLocalSafety = async () => {
    const next = await getLocalAdminSafetySnapshot();
    setLocalSafety(next);
    return next;
  };
  const createBackup = async () => {
    setSafetyBusy('backup'); setSafetyMessage('');
    try {
      const backup = await createLocalAdminBackup('operations-home-manual');
      await refreshLocalSafety();
      setSafetyMessage(`已备份 · ${new Date(backup.createdAt).toLocaleString('zh-CN', { hour12: false })}`);
    } catch (cause) {
      setSafetyMessage(cause instanceof Error ? cause.message : '本地备份没有完成。');
    } finally { setSafetyBusy(''); }
  };
  const restoreLatestBackup = async () => {
    if (!latestBackup) return;
    const label = new Date(latestBackup.createdAt).toLocaleString('zh-CN', { hour12: false });
    if (!window.confirm(`恢复 ${label} 的本地备份？恢复前会自动保存当前状态，恢复完成后页面会重新载入。`)) return;
    setSafetyBusy('restore'); setSafetyMessage('');
    try {
      await restoreLocalAdminBackup(latestBackup.id);
      window.location.reload();
    } catch (cause) {
      setSafetyMessage(cause instanceof Error ? cause.message : '本地恢复没有完成。');
      setSafetyBusy('');
    }
  };

  const open = (item: OperationsWorkItem) => {
    const operationsReturn: OperationsTaskReturnContext = { taskId: item.id, taskTitle: item.title };
    const usesStandaloneSeoAdmin = item.authority === 'seo' && !item.href.startsWith('/admin/product-content');
    if (item.href.startsWith('/admin/') && !usesStandaloneSeoAdmin) {
      navigate(item.href, { state: { operationsReturn } });
      return;
    }
    const target = new URL(item.href, window.location.href);
    target.searchParams.set('returnTo', `${window.location.origin}/admin/content`);
    target.searchParams.set('returnTask', item.id);
    target.searchParams.set('returnTitle', item.title);
    window.location.assign(target.toString());
  };

  const stateReturnTask = (location.state as { returnedOperationsTask?: OperationsTaskReturnContext } | null)?.returnedOperationsTask || null;
  const queryReturnParams = new URLSearchParams(location.search);
  const queryReturnTaskId = queryReturnParams.get('returnTask');
  const returnedOperationsTask = stateReturnTask || (queryReturnTaskId ? { taskId: queryReturnTaskId, taskTitle: queryReturnParams.get('returnTitle') || '刚才的运营任务' } : null);
  useEffect(() => {
    if (loading || error || !returnedOperationsTask || handledReturnTaskRef.current === returnedOperationsTask.taskId) return;
    handledReturnTaskRef.current = returnedOperationsTask.taskId;
    const inQueue = snapshot.workItems.some(item => item.id === returnedOperationsTask.taskId);
    setReturnContext({ ...returnedOperationsTask, inQueue });
    if (inQueue) {
      window.setTimeout(() => {
        const target = Array.from(document.querySelectorAll<HTMLElement>('[data-work-item-id]'))
          .find(element => element.dataset.workItemId === returnedOperationsTask.taskId);
        target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 0);
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [error, loading, location.pathname, navigate, returnedOperationsTask, snapshot.workItems]);

  return (
    <div className="min-h-[100dvh] bg-[#edf1ef] p-3 text-ink md:p-6">
      <div className="mx-auto max-w-[1240px]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="返回 AquaGuide" onClick={() => navigate('/aquarium')} className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-200 bg-white hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /></button>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">Aqua Operations Studio</div>
              <h1 className="truncate text-2xl font-black">运营工作台</h1>
              <p className="mt-0.5 hidden text-xs font-semibold text-ink/45 sm:block">先处理问题，再进入对应业务模块；工作台本身不改写 Product、Care、Compatibility 或 SEO。</p>
            </div>
          </div>
          <button type="button" aria-label="刷新任务" onClick={() => void load()} disabled={loading} className="flex h-10 items-center justify-center gap-2 border border-slate-200 bg-white px-3 text-xs font-black text-ink/65 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">刷新任务</span></button>
        </header>

        {error && <div role="alert" className="mt-3 border-l-4 border-red-500 bg-white px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

        {returnContext && <div data-testid="operations-return-context" className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-ink/55"><strong className="font-black text-ink/70">{returnContext.inQueue ? '已回到刚才的任务' : '已返回工作台'}</strong><span>{returnContext.taskTitle}</span>{!returnContext.inQueue && <span className="text-ink/40">当前队列未找到这条任务；它可能已完成，或对应来源暂不可读。</span>}</div>}

        <section data-testid="operations-primary-task" data-work-item-id={primaryTask?.id} className={`mt-4 border-l-4 bg-white px-4 py-4 md:px-5 ${primaryTask ? severityClass[primaryTask.severity].split(' ')[1] : sourceProblems.length ? 'border-slate-400' : 'border-emerald-600'} ${primaryTask && returnContext?.inQueue && returnContext.taskId === primaryTask.id ? 'ring-2 ring-inset ring-slate-300' : ''}`}>
          {loading ? <div className="flex min-h-16 items-center gap-2 text-sm font-bold text-ink/45"><Loader2 className="h-5 w-5 animate-spin" />正在汇总各业务模块当前任务…</div> : primaryTask ? <PrimaryTask item={primaryTask} onOpen={open} incompleteSourcesCount={sourceProblems.length} /> : sourceProblems.length ? <SourceRecoveryTask sources={sourceProblems} onLogin={authRequired && isSupabaseConfigured ? () => navigate('/admin/login?next=%2Fadmin%2Fcontent') : undefined} /> : <div><div className="text-[11px] font-black uppercase tracking-[0.08em] text-emerald-700">当前优先任务 · 已清空</div><strong className="mt-1 block text-lg font-black">当前已读取来源没有待处理任务</strong><p className="mt-1 text-xs font-semibold leading-5 text-ink/48">所有业务模块均可读取；需要时可刷新任务获取最新状态。</p></div>}
        </section>

        <section className="mt-4 border border-slate-200 bg-white" data-testid="operations-work-queue">
          <div className="flex items-end justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div><div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/35">Work queue</div><h2 className="mt-0.5 text-lg font-black">现在需要处理</h2></div>
            <span className="text-xs font-black text-ink/40">{sourceProblems.length ? `${snapshot.workItems.length} 个已读取任务 · 来源未完整` : `${snapshot.workItems.length} 个当前任务`}</span>
          </div>
          {!loading && queueItems.length === 0 ? <div className="px-4 py-6 text-sm font-semibold text-ink/45">{primaryTask ? '当前只有上方这一条优先任务。' : sourceProblems.length ? '当前已读取来源没有任务；未读取来源不计为 0。' : '当前没有来自已连接业务模块的任务。'}</div> : <div className="divide-y divide-slate-100">{queueItems.map(item => <WorkItemRow key={item.id} item={item} onOpen={open} highlighted={Boolean(returnContext?.inQueue && returnContext.taskId === item.id)} />)}</div>}
          {!loading && hiddenTaskCount > 0 && <div className="border-t border-slate-100 px-4 py-3 text-xs font-semibold text-ink/45">还有 {hiddenTaskCount} 个任务未在首页展开；进入对应业务模块查看全量。</div>}
        </section>

        <section id="operations-source-status" className="mt-4 scroll-mt-4 border border-slate-200 bg-white" data-testid="operations-source-status">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-200 px-4 py-3"><div><div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/35">Source status</div><h2 className="mt-0.5 text-base font-black">数据来源</h2></div><div className="flex flex-wrap items-center justify-end gap-2">{isLocalAdminFileMode && <span data-testid="operations-local-persistence" title={localPersistence.root || 'Local File root'} className={`border px-2 py-1 text-[11px] font-black ${localPersistence.mode === 'durable' ? 'border-emerald-200 text-emerald-700' : 'border-red-200 text-red-700'}`}>本地保存 · {localPersistence.mode === 'durable' ? '磁盘已持久化' : '持久化异常'}</span>}{!loading && sourceProblems.length > 0 && <span className="text-[11px] font-semibold text-ink/45">不可读来源不会生成假 0，也不会阻塞其它业务模块</span>}</div></div>
          <div className="grid md:grid-cols-3">{snapshot.sources.map(source => <div key={source.authority} data-testid={`operations-source-${source.authority}`} className="border-b border-slate-100 px-3 py-2.5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"><div className="flex items-center justify-between gap-3"><strong className="text-sm font-black">{source.label}</strong><span className={`text-[11px] font-black ${source.availability === 'ready' ? 'text-emerald-700' : 'text-ink/45'}`}>{source.availability === 'ready' ? '可读取' : source.availability === 'partial' ? '部分可读' : source.availability === 'auth_required' ? '需要登录' : source.availability === 'forbidden' ? '权限不足' : source.availability === 'schema_not_ready' ? '尚未启用' : '暂不可用'}</span></div>{source.availability !== 'ready' && <p className="mt-1 text-[11px] font-semibold leading-5 text-ink/45">{source.detail}</p>}</div>)}</div>
          {isLocalAdminFileMode && <div data-testid="operations-local-safety" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><strong className="text-xs font-black">本地数据安全</strong><span data-testid="operations-local-integrity" className={`text-[11px] font-black ${localSafety?.integrity.healthy ? 'text-emerald-700' : localSafety ? 'text-red-700' : 'text-ink/40'}`}>{localSafety ? localSafety.integrity.healthy ? `数据完整${safetyWarningCount ? ` · ${safetyWarningCount} 个提醒` : ''}` : `${safetyErrorCount} 个完整性错误` : '正在检查…'}</span><span className="text-[11px] font-semibold text-ink/40">{latestBackup ? `最近备份 ${new Date(latestBackup.createdAt).toLocaleString('zh-CN', { hour12: false })}` : '尚无备份'}</span></div><p className="mt-1 truncate text-[10px] font-semibold text-ink/35" title={localPersistence.root}>{safetyMessage || localPersistence.root || '.local/aqua-admin'}</p></div><div className="flex shrink-0 gap-2"><button type="button" data-testid="operations-create-backup" onClick={() => void createBackup()} disabled={Boolean(safetyBusy) || !localSafety?.integrity.healthy} className="flex h-9 items-center gap-2 border border-slate-200 bg-white px-3 text-[11px] font-black text-ink/65 disabled:cursor-not-allowed disabled:opacity-40"><HardDriveDownload className="h-3.5 w-3.5" />{safetyBusy === 'backup' ? '备份中…' : '备份当前数据'}</button><button type="button" data-testid="operations-restore-backup" onClick={() => void restoreLatestBackup()} disabled={Boolean(safetyBusy) || !latestBackup} className="flex h-9 items-center gap-2 border border-slate-200 bg-white px-3 text-[11px] font-black text-ink/65 disabled:cursor-not-allowed disabled:opacity-40"><ArchiveRestore className="h-3.5 w-3.5" />{safetyBusy === 'restore' ? '恢复中…' : '恢复最近备份'}</button></div></div>}
        </section>

        <section className="mt-4 border border-slate-200 bg-white" data-testid="operations-workspaces">
          <div className="border-b border-slate-200 px-4 py-3"><div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/35">Authority workspaces</div><h2 className="mt-0.5 text-lg font-black">进入具体工作区</h2></div>
          <div className="grid grid-cols-2 xl:grid-cols-4">
            <WorkspaceLink icon={Database} label="Product / Care" detail="业务事实与养护内容" onClick={() => navigate('/admin/product-content')} />
            <WorkspaceLink icon={ShieldCheck} label="Compatibility" detail="规则、Evidence 与人工审核" onClick={() => navigate('/admin/compatibility')} />
            <WorkspaceLink icon={Search} label="SEO" detail="全站健康与 Species/Care SEO" onClick={() => navigate('/admin/seo-pages')} />
            <WorkspaceLink icon={Clock3} label="Publish" detail="Release readiness 与审计历史" onClick={() => navigate('/admin/publish-center')} />
          </div>
        </section>

        <section className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white px-4 py-3" data-testid="operations-recent-activity">
          <div className="min-w-0"><div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/35">Recent release activity</div>{snapshot.recentEvents[0] ? <div className="mt-1 min-w-0 text-xs font-semibold text-ink/50"><strong className="font-black text-ink/70">{authorityLabel[snapshot.recentEvents[0].authority]} · {snapshot.recentEvents[0].title}</strong><span className="ml-2 hidden text-ink/35 sm:inline">{new Date(snapshot.recentEvents[0].occurredAt).toLocaleString('zh-CN', { hour12: false })}</span></div> : <div className="mt-1 text-xs font-semibold text-ink/40">当前没有可读取的 release history。</div>}</div>
          <button type="button" onClick={() => navigate('/admin/publish-center')} className="shrink-0 text-xs font-black text-ink/65 underline">查看发布历史 →</button>
        </section>
      </div>
    </div>
  );
}

function SourceRecoveryTask({ sources, onLogin }: { sources: OperationsHomeSnapshot['sources']; onLogin?: () => void }) {
  const names = sources.map(source => source.label).join('、');
  const unavailable = sources.filter(source => source.availability === 'unavailable').length;
  const accessIssues = sources.length - unavailable;
  const detail = [
    unavailable ? `${unavailable} 个来源暂不可用` : '',
    accessIssues ? `${accessIssues} 个来源需要登录、授权或补全读取` : '',
  ].filter(Boolean).join('；');
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start"><div className="min-w-0"><div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/55">当前优先任务 · 恢复来源</div><h2 className="mt-1 text-lg font-black">先恢复数据来源，再判断是否真的没有任务</h2><p className="mt-1 max-w-[760px] text-xs font-semibold leading-5 text-ink/48">{names} 当前未完全可读。{detail}；未读取部分不会被算成 0 个任务。</p><div className="mt-3 grid grid-cols-2 gap-2"><div className="border border-slate-100 bg-slate-50 px-3 py-2.5"><div className="text-[10px] font-black uppercase tracking-[0.08em] text-ink/35">当前卡点</div><div className="mt-1 text-xs font-black text-ink/70">{sources.length} 个业务模块来源未完整</div></div><div className="border border-slate-100 bg-slate-50 px-3 py-2.5"><div className="text-[10px] font-black uppercase tracking-[0.08em] text-ink/35">下一步</div><div className="mt-1 text-xs font-black leading-5 text-ink/70">查看具体来源原因；恢复安全会话或服务后刷新任务</div></div></div></div><div className="flex flex-wrap gap-2">{onLogin && <button type="button" onClick={onLogin} className="h-10 bg-ink px-4 text-xs font-black text-white">登录管理员账号 →</button>}<button type="button" onClick={() => document.getElementById('operations-source-status')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="h-10 border border-slate-300 bg-white px-4 text-xs font-black text-ink/70 hover:bg-slate-50">查看数据来源 →</button></div></div>;
}

function PrimaryTask({ item, onOpen, incompleteSourcesCount }: { item: OperationsWorkItem; onOpen: (item: OperationsWorkItem) => void; incompleteSourcesCount: number }) {
  const scopedPriority = incompleteSourcesCount > 0;
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start"><div className="min-w-0"><div className={`text-[11px] font-black uppercase tracking-[0.08em] ${severityClass[item.severity].split(' ')[0]}`}>{scopedPriority ? '当前已读取优先任务' : '当前优先任务'} · {severityLabel[item.severity]}</div><h2 className="mt-1 text-lg font-black">{item.title}</h2><p className="mt-1 max-w-[760px] text-xs font-semibold leading-5 text-ink/48">{item.detail}</p><div className="mt-3 grid grid-cols-2 gap-2"><div className="border border-slate-100 bg-slate-50 px-3 py-2.5"><div className="text-[10px] font-black uppercase tracking-[0.08em] text-ink/35">当前卡点</div><div className="mt-1 text-xs font-black text-ink/70">{item.gateLabel}</div></div><div className="border border-slate-100 bg-slate-50 px-3 py-2.5"><div className="text-[10px] font-black uppercase tracking-[0.08em] text-ink/35">下一步</div><div className="mt-1 text-xs font-black leading-5 text-ink/70">{item.nextStep}</div></div></div><p className="mt-2 text-[10px] font-semibold leading-4 text-ink/38">{item.verificationNote}{scopedPriority ? ` · 另有 ${incompleteSourcesCount} 个数据来源未完整；当前优先级仅基于已读取任务。` : ''}</p></div><button type="button" onClick={() => onOpen(item)} className={`h-10 border bg-white px-4 text-xs font-black ${severityClass[item.severity]}`}>{item.actionLabel} →</button></div>;
}

function WorkItemRow({ item, onOpen, highlighted }: { item: OperationsWorkItem; onOpen: (item: OperationsWorkItem) => void; highlighted: boolean }) {
  return <button type="button" data-work-item-id={item.id} onClick={() => onOpen(item)} className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 text-left hover:bg-slate-50 md:grid-cols-[105px_minmax(0,1fr)_auto] md:items-center ${highlighted ? 'ring-2 ring-inset ring-slate-300' : ''}`}><span className={`hidden border-l-2 pl-2 text-[11px] font-black md:block ${severityClass[item.severity]}`}>{severityLabel[item.severity]}</span><span className="min-w-0"><strong className="block text-sm font-black">{item.title}</strong><small className="mt-0.5 block text-[11px] font-semibold leading-5 text-ink/42">卡点：{item.gateLabel} · 下一步：{item.nextStep}</small><small className={`mt-1 block text-[11px] font-black md:hidden ${severityClass[item.severity].split(' ')[0]}`}>{severityLabel[item.severity]}</small></span><span className="text-xs font-black text-ink/65">{item.actionLabel} →</span></button>;
}

function WorkspaceLink({ icon: Icon, label, detail, onClick }: { icon: typeof Database; label: string; detail: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-[82px] items-center gap-3 border-b border-r border-slate-100 px-3 py-3 text-left hover:bg-slate-50 even:border-r-0 xl:border-b-0 xl:border-r xl:px-4 xl:last:border-r-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 bg-white text-ink/55"><Icon className="h-4 w-4" /></span><span className="min-w-0"><strong className="block text-sm font-black">{label}</strong><small className="mt-1 block text-[11px] font-semibold leading-5 text-ink/42">{detail}</small></span></button>;
}
