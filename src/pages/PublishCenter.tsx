import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock3, Database, Loader2, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ReleaseAuthority, ReleaseEventDto, ReleaseFeedDto, ReleaseSourceStatusDto } from '../../packages/contracts/src';
import { publishCenterService } from '../services/admin/publish-center.service';

const authorityLabel: Record<ReleaseAuthority, string> = {
  product_care: 'Product / Care', compatibility: 'Compatibility', seo: 'SEO',
};
const authorityIcon = { product_care: Database, compatibility: ShieldCheck, seo: Search } as const;
const availabilityLabel = { ready: '可读取', auth_required: '需要登录', unavailable: '暂不可用' } as const;
const coverageLabel = { current_only: '当前版本', revision_history: 'Revision 历史', activity_history: 'Activity / Revision 历史' } as const;

const sourceClass = (source: ReleaseSourceStatusDto) => source.availability === 'ready'
  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
  : source.availability === 'auth_required'
    ? 'border-amber-200 bg-amber-50 text-amber-950'
    : 'border-slate-200 bg-slate-50 text-slate-700';

const formatTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false });
};
export default function PublishCenter() {
  const navigate = useNavigate();
  const [feed, setFeed] = useState<ReleaseFeedDto>({ events: [], sources: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | ReleaseAuthority>('all');

  const load = async () => {
    setLoading(true); setError('');
    try {
      setFeed(await publishCenterService.load(160));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '发布记录暂时无法读取。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);
  const events = useMemo(() => filter === 'all' ? feed.events : feed.events.filter(item => item.authority === filter), [feed.events, filter]);
  const sourceByAuthority = useMemo(() => new Map(feed.sources.map(item => [item.authority, item])), [feed.sources]);

  return (
    <div className="min-h-[100dvh] bg-[#e8efec] p-3 text-ink md:p-6">
      <div className="mx-auto max-w-[1280px]">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/80 bg-white px-4 py-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="返回管理后台" onClick={() => navigate('/admin/content')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border hover:bg-bg"><ArrowLeft className="h-5 w-5" /></button>
            <div className="min-w-0"><div className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Release Audit</div><h1 className="truncate text-xl font-black">Unified Publish Center</h1></div>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading} className="flex h-10 items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 text-sm font-black text-emerald-800 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />刷新</button>
        </header>
        <section className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-950">
          Publish Center 只聚合已有发布权威，不创建新的写入口。Product/Care 与 Compatibility 继续由 Business API / Supabase 管理；SEO 继续由独立 Repo Admin 管理。
        </section>

        <section data-testid="publish-center-source-status" className="mt-4 grid gap-3 md:grid-cols-3">
          {(['product_care', 'compatibility', 'seo'] as ReleaseAuthority[]).map(authority => {
            const source = sourceByAuthority.get(authority);
            const Icon = authorityIcon[authority];
            return (
              <article key={authority} className={`rounded-[20px] border p-4 ${source ? sourceClass(source) : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80"><Icon className="h-5 w-5" /></div><div className="min-w-0"><div className="text-sm font-black">{authorityLabel[authority]}</div><div className="mt-1 text-xs font-bold opacity-70">{source ? `${availabilityLabel[source.availability]} · ${coverageLabel[source.coverage]}` : '读取中'}</div></div></div>
                {source?.detail && <p className="mt-3 text-xs font-semibold leading-5 opacity-75">{source.detail}</p>}
                {authority === 'seo' && source?.availability === 'auth_required' && <a href="/admin/seo/" className="mt-3 inline-flex text-xs font-black underline">登录 SEO Admin →</a>}
              </article>
            );
          })}
        </section>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {([['all', '全部'], ['product_care', 'Product / Care'], ['compatibility', 'Compatibility'], ['seo', 'SEO']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${filter === value ? 'bg-ink text-white' : 'border border-slate-200 bg-white text-ink/60'}`}>{label}</button>)}
        </div>
        <section className="mt-4 rounded-[24px] border border-white/80 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[0.14em] text-ink/40">Unified timeline</div><h2 className="mt-1 text-lg font-black">发布 / 审核 / Revision 记录</h2></div><div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-ink/55">{events.length} 条</div></div>
          {error && <div role="alert" className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
          {loading && <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-bold text-ink/45"><Loader2 className="h-5 w-5 animate-spin" />读取 release sources…</div>}
          {!loading && !events.length && <div className="mt-4 rounded-[18px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm font-bold text-ink/40">当前筛选没有可显示的发布记录。</div>}
          {!loading && events.length > 0 && <div data-testid="publish-center-timeline" className="mt-4 grid gap-3">
            {events.map(event => <ReleaseEventCard key={event.id} event={event} />)}
          </div>}
        </section>
      </div>
    </div>
  );
}

function ReleaseEventCard({ event }: { event: ReleaseEventDto }) {
  const Icon = authorityIcon[event.authority];
  return (
    <article className="min-w-0 rounded-[18px] border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink/55 shadow-sm"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-black uppercase tracking-[0.1em] text-ink/40">{authorityLabel[event.authority]}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-ink/55">{event.status}</span></div><h3 className="mt-1 text-sm font-black text-ink">{event.title}</h3>{event.detail && <p className="mt-1 break-words text-xs font-semibold leading-5 text-ink/55">{event.detail}</p>}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-200/70 pt-3 text-[11px] font-bold text-ink/40"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{formatTime(event.occurredAt)}</span>{event.resourceKey && <span>{event.resourceKey}</span>}{event.version ? <span>v{event.version}</span> : null}{event.actor && <span>{event.actor}</span>}</div>
    </article>
  );
}
