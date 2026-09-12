import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, Loader2, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  seoPageRegistryService,
  speciesSeoAdminHref,
  summarizeSeoRegistry,
  type SeoHealthIssueCode,
  type SeoHealthSeverity,
  type SeoPageRegistryEntry,
  type SeoPageRegistrySnapshot,
  type SeoPageType,
} from '../services/admin/seo-page-registry.service';

const typeLabel: Record<SeoPageType, string> = {
  species: 'Species', care: 'Care', compatibility: 'Compatibility',
  product_feature: 'Product Feature', guide: 'Guide', category: 'Category',
};

const stateLabel: Record<SeoPageRegistryEntry['editorialState'], string> = {
  not_started: '未开始', editing: '编辑中', ready_for_review: '待审核', approved: '已批准',
  source_not_published: 'Care 源内容尚未发布', unknown: '状态待读取',
};

const availabilityLabel = { ready: '可读取', auth_required: '需要独立登录', unavailable: '暂不可用' } as const;
const healthLabel = { healthy: '健康', attention: '需要完善', blocked: '阻断', unknown: '待确认' } as const;
const healthIssueLabel: Record<SeoHealthIssueCode, string> = {
  missing_meta_title: '缺少 Meta Title，需要补充',
  missing_meta_description: '缺少 Meta Description，需要补充',
  missing_h1: '缺少 H1，需要补充',
  missing_bilingual_pair: '中英文版本尚未配对完成',
  canonical_conflict: 'Canonical 指向无效或冲突',
  missing_editorial_review: 'SEO 修改尚未完成人工审核',
  source_not_published: 'Care 源内容尚未发布',
  source_not_snapshot: 'Care 仍使用旧发布来源，需生成 Published 快照',
  source_drift: 'Care 源内容已更新，需要重新审核 SEO',
  index_strategy_unknown: '尚未读取 Index 策略',
  source_state_unknown: '来源权限或状态尚未就绪',
};
const localeLabel = { 'zh-CN': '中文', en: 'English' } as const;

export default function SeoOperations() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<SeoPageRegistrySnapshot>({ entries: [], sources: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'species' | 'care'>('all');
  const [healthFilter, setHealthFilter] = useState<'all' | SeoHealthSeverity>('all');
  const [viewMode, setViewMode] = useState<'priority' | 'all'>('priority');
  const [visibleLimit, setVisibleLimit] = useState(50);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      setSnapshot(await seoPageRegistryService.load());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'SEO 页面索引暂时无法读取。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const summary = useMemo(() => summarizeSeoRegistry(snapshot.entries), [snapshot.entries]);
  const entries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return snapshot.entries.filter(entry => {
      if (filter !== 'all' && entry.pageType !== filter) return false;
      if (healthFilter !== 'all' && entry.health.severity !== healthFilter) return false;
      if (!normalized && healthFilter === 'all' && viewMode === 'priority' && !['blocked', 'attention'].includes(entry.health.severity)) return false;
      if (!normalized) return true;
      return [entry.label, entry.secondaryLabel, entry.sourceKey, entry.locale]
        .filter(Boolean).some(value => String(value).toLowerCase().includes(normalized));
    });
  }, [filter, healthFilter, query, snapshot.entries, viewMode]);

  useEffect(() => { setVisibleLimit(50); }, [filter, healthFilter, query, viewMode]);

  const selectHealth = (severity: SeoHealthSeverity) => {
    if (healthFilter === severity) {
      setHealthFilter('all');
      setViewMode('priority');
      return;
    }
    setViewMode('all');
    setHealthFilter(severity);
  };

  const openEditor = (entry: SeoPageRegistryEntry) => {
    if (entry.editorHref.startsWith('/admin/product-content')) navigate(entry.editorHref);
    else window.location.assign(entry.editorHref);
  };

  return (
    <div className="min-h-[100dvh] bg-[#edf1ef] p-3 text-ink md:p-6">
      <div className="mx-auto max-w-[1320px]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="返回管理后台" onClick={() => navigate('/admin/content')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">SEO Operations</div>
              <h1 className="truncate text-2xl font-black">全站 SEO 页面</h1>
              <p className="mt-1 text-xs font-semibold text-ink/45">Registry 是只读索引层；Species 与 Care 仍回到各自 authority 编辑和发布。</p>
            </div>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-ink/65 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />刷新
          </button>
        </header>

        <section className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-slate-200 bg-slate-200 lg:grid-cols-4">
          <Stat label="SEO 页面候选" value={String(summary.total)} detail="按语言分别登记；不等于已发布" />
          <Stat label="Species" value={String(summary.byType.species || 0)} detail="现有 Species SEO authority" />
          <Stat label="Care" value={String(summary.byType.care || 0)} detail="Published Care 下游 SEO" />
          <Stat label="优先处理 / 来源待读取" value={`${summary.healthCounts.blocked + summary.healthCounts.attention} / ${summary.healthCounts.unknown}`} detail="来源不可读与真实 SEO 问题分开统计" />
        </section>

        <section className="mt-4 border border-slate-200 bg-white px-4 py-4">
          <div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/35">运营队列</div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            <QueueItem label="待审核" value={String(summary.byState.ready_for_review || 0)} />
            <QueueItem label="编辑中" value={String(summary.byState.editing || 0)} />
            <QueueItem label="源内容未就绪" value={String(summary.byState.source_not_published || 0)} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
            <QueueItem label="阻断" value={String(summary.healthCounts.blocked || 0)} active={healthFilter === 'blocked'} onClick={() => selectHealth('blocked')} />
            <QueueItem label="需要完善" value={String(summary.healthCounts.attention || 0)} active={healthFilter === 'attention'} onClick={() => selectHealth('attention')} />
            <QueueItem label="来源待读取" value={String(summary.healthCounts.unknown || 0)} active={healthFilter === 'unknown'} onClick={() => selectHealth('unknown')} />
            <QueueItem label="健康" value={String(summary.healthCounts.healthy || 0)} active={healthFilter === 'healthy'} onClick={() => selectHealth('healthy')} />
          </div>
          <p className="mt-3 text-xs font-semibold leading-5 text-ink/45">默认只展示真实可行动的阻断与待完善页面；来源权限或服务不可用时单独归入“来源待读取”，不会伪装成 SEO 待办。</p>
          {healthFilter !== 'all' && <button type="button" onClick={() => { setHealthFilter('all'); setViewMode('priority'); }} className="mt-3 text-xs font-black text-emerald-800 underline">返回优先处理队列</button>}
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          {snapshot.sources.map(source => (
            <article key={source.key} className="border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm font-black">{source.label}</strong>
                <span className="text-[11px] font-black text-ink/50">{availabilityLabel[source.availability]}</span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-5 text-ink/45">{source.detail}</p>
              {source.key === 'species' && source.availability === 'auth_required' && (
                <a href={speciesSeoAdminHref} className="mt-2 inline-flex text-xs font-black text-emerald-800 underline">登录 Species SEO →</a>
              )}
            </article>
          ))}
        </section>

        <section className="mt-4 border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
            <button type="button" aria-pressed={viewMode === 'priority' && healthFilter === 'all'} onClick={() => { setViewMode('priority'); setHealthFilter('all'); }} className={`h-9 rounded-lg px-3 text-xs font-black ${viewMode === 'priority' && healthFilter === 'all' ? 'bg-ink text-white' : 'border border-slate-200 bg-white text-ink/55'}`}>优先处理</button>
            <button type="button" aria-pressed={viewMode === 'all' && healthFilter === 'all'} onClick={() => { setViewMode('all'); setHealthFilter('all'); }} className={`h-9 rounded-lg px-3 text-xs font-black ${viewMode === 'all' && healthFilter === 'all' ? 'bg-ink text-white' : 'border border-slate-200 bg-white text-ink/55'}`}>全部页面</button>
            <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
            {([['all', '全部类型'], ['species', 'Species'], ['care', 'Care']] as const).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`h-9 rounded-lg px-3 text-xs font-black ${filter === value ? 'bg-ink text-white' : 'border border-slate-200 bg-white text-ink/55'}`}>{label}</button>
            ))}
            <label className="ml-auto flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 sm:max-w-[360px]">
              <Search className="h-4 w-4 text-ink/35" />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索页面、catalog key…" className="h-9 min-w-0 flex-1 bg-transparent text-xs font-bold outline-none" />
            </label>
          </div>

          {error && <div role="alert" className="border-b border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div>}
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-sm font-bold text-ink/40"><Loader2 className="h-5 w-5 animate-spin" />读取 SEO page registry…</div>
          ) : entries.length === 0 ? (
            <div className="px-4 py-10 text-center">
              {viewMode === 'priority' && healthFilter === 'all' && summary.healthCounts.unknown > 0 ? (
                <>
                  <div className="text-sm font-black text-ink/65">当前没有可读取的优先处理项</div>
                  <p className="mx-auto mt-2 max-w-[560px] text-xs font-semibold leading-5 text-ink/45">还有 {summary.healthCounts.unknown} 个页面的来源权限或状态尚未就绪。它们不会被误算为健康，也不会混进真实 SEO 待办。</p>
                  <button type="button" onClick={() => selectHealth('unknown')} className="mt-3 text-xs font-black text-emerald-800 underline">查看来源待读取页面 →</button>
                </>
              ) : (
                <div className="text-sm font-bold text-ink/40">当前筛选没有页面。</div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {entries.slice(0, visibleLimit).map(entry => (
                <button key={entry.pageKey} type="button" onClick={() => openEditor(entry)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 text-left hover:bg-slate-50 md:grid-cols-[100px_minmax(0,1fr)_80px_110px_110px_minmax(150px,220px)_auto] md:items-center">
                  <span className="hidden text-[11px] font-black uppercase tracking-[0.08em] text-ink/35 md:block">{typeLabel[entry.pageType]}</span>
                  <span className="min-w-0"><strong className="block truncate text-sm font-black">{entry.label}</strong><small className="mt-0.5 block truncate text-[11px] font-semibold text-ink/40">{entry.secondaryLabel || entry.sourceKey}</small><small className="mt-1 block text-[11px] font-bold text-ink/45 md:hidden">{healthLabel[entry.health.severity]}{entry.health.issues.length ? ` · ${entry.health.issues.slice(0, 2).map(issue => healthIssueLabel[issue]).join(' · ')}` : ''}</small></span>
                  <span className="hidden text-xs font-bold text-ink/50 md:block">{localeLabel[entry.locale]}</span>
                  <span className="hidden text-xs font-bold text-ink/50 md:block">{stateLabel[entry.editorialState]}</span>
                  <span className="hidden text-[11px] font-bold text-ink/40 md:block">{entry.indexStrategy}</span>
                  <span className="hidden min-w-0 md:block" title={entry.health.issues.map(issue => healthIssueLabel[issue]).join(' · ')}><strong className="block text-xs font-black text-ink/65">{healthLabel[entry.health.severity]}</strong><small className="mt-0.5 block truncate text-[11px] font-semibold text-ink/40">{entry.health.issues.length ? entry.health.issues.slice(0, 2).map(issue => healthIssueLabel[issue]).join(' · ') : '没有发现当前健康问题'}</small></span>
                  <span className="flex items-center gap-1 text-xs font-black text-emerald-800">编辑 <ExternalLink className="h-3.5 w-3.5" /></span>
                </button>
              ))}
            </div>
          )}
          {!loading && entries.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs font-semibold text-ink/40"><span>已显示 {Math.min(visibleLimit, entries.length)} / {entries.length} 条</span>{entries.length > visibleLimit && <button type="button" onClick={() => setVisibleLimit(value => value + 50)} className="font-black text-emerald-800 underline">继续显示 50 条</button>}</div>}
        </section>

        <section className="mt-4 border border-dashed border-slate-300 bg-white px-4 py-4">
          <div className="text-[11px] font-black uppercase tracking-[0.1em] text-ink/35">Next page types</div>
          <p className="mt-1 text-sm font-bold text-ink/65">Compatibility · Product Feature · Guide · Category</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-ink/45">当前只建立 Registry 类型位，不伪造这些页面的数据或发布状态；后续按真实 authority 逐类接入。</p>
        </section>
      </div>
    </div>
  );
}

function QueueItem({ label, value, active = false, onClick }: { label: string; value: string; active?: boolean; onClick?: () => void }) {
  if (!onClick) return <div className="border border-slate-100 px-3 py-2"><div className="text-xs font-black text-ink/45">{label}</div><div className="mt-1 text-xl font-black">{value}</div></div>;
  return <button type="button" aria-pressed={active} onClick={onClick} className={`border px-3 py-2 text-left ${active ? 'border-emerald-700 bg-emerald-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}><div className="text-xs font-black text-ink/45">{label}</div><div className="mt-1 text-xl font-black">{value}</div></button>;
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="bg-white px-4 py-4">
      <div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/35">{label}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
      <p className="mt-1 text-xs font-semibold text-ink/40">{detail}</p>
    </article>
  );
}
