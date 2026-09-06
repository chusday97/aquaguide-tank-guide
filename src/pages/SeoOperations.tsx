import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, Loader2, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  seoPageRegistryService,
  speciesSeoAdminHref,
  summarizeSeoRegistry,
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
  source_not_published: '源内容未发布', unknown: '状态待读取',
};

const availabilityLabel = { ready: '可读取', auth_required: '需要独立登录', unavailable: '暂不可用' } as const;
const localeLabel = { 'zh-CN': '中文', en: 'English' } as const;

export default function SeoOperations() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<SeoPageRegistrySnapshot>({ entries: [], sources: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'species' | 'care'>('all');
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
      if (!normalized) return true;
      return [entry.label, entry.secondaryLabel, entry.sourceKey, entry.locale]
        .filter(Boolean).some(value => String(value).toLowerCase().includes(normalized));
    });
  }, [filter, query, snapshot.entries]);

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

        <section className="mt-4 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="SEO 页面候选" value={String(summary.total)} detail="按语言分别登记；不等于已发布" />
          <Stat label="Species" value={String(summary.byType.species || 0)} detail="现有 Species SEO authority" />
          <Stat label="Care" value={String(summary.byType.care || 0)} detail="Published Care 下游 SEO" />
          <Stat label="需处理 / 待读取" value={`${summary.needsAttention} / ${summary.byState.unknown || 0}`} detail="未知状态不会被误算成健康" />
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
            {([['all', '全部'], ['species', 'Species'], ['care', 'Care']] as const).map(([value, label]) => (
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
            <div className="px-4 py-12 text-center text-sm font-bold text-ink/40">当前筛选没有页面。</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {entries.slice(0, 300).map(entry => (
                <button key={entry.pageKey} type="button" onClick={() => openEditor(entry)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 text-left hover:bg-slate-50 md:grid-cols-[110px_minmax(0,1fr)_100px_130px_120px_auto] md:items-center">
                  <span className="hidden text-[11px] font-black uppercase tracking-[0.08em] text-ink/35 md:block">{typeLabel[entry.pageType]}</span>
                  <span className="min-w-0"><strong className="block truncate text-sm font-black">{entry.label}</strong><small className="mt-0.5 block truncate text-[11px] font-semibold text-ink/40">{entry.secondaryLabel || entry.sourceKey}</small></span>
                  <span className="hidden text-xs font-bold text-ink/50 md:block">{localeLabel[entry.locale]}</span>
                  <span className="hidden text-xs font-bold text-ink/50 md:block">{stateLabel[entry.editorialState]}</span>
                  <span className="hidden text-[11px] font-bold text-ink/40 md:block">{entry.indexStrategy}</span>
                  <span className="flex items-center gap-1 text-xs font-black text-emerald-800">编辑 <ExternalLink className="h-3.5 w-3.5" /></span>
                </button>
              ))}
            </div>
          )}
          {!loading && entries.length > 300 && <div className="border-t border-slate-100 px-4 py-3 text-xs font-semibold text-ink/40">当前显示前 300 条；请使用类型筛选或搜索缩小范围。</div>}
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

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="bg-white px-4 py-4">
      <div className="text-[11px] font-black uppercase tracking-[0.08em] text-ink/35">{label}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
      <p className="mt-1 text-xs font-semibold text-ink/40">{detail}</p>
    </article>
  );
}
