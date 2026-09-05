import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock3, Database, Loader2, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ReleaseAuthority, ReleaseCapabilityDto, ReleaseEventDto, ReleaseFeedDto, ReleasePermissionDto, ReleaseSourceStatusDto, ReleaseStage } from '../../packages/contracts/src';
import { publishCenterService } from '../services/admin/publish-center.service';
import { getRelatedReleaseEvents } from '../services/admin/release-coordination';

const authorityLabel: Record<ReleaseAuthority, string> = {
  product_care: 'Product / Care', compatibility: 'Compatibility', seo: 'SEO',
};
const authorityAdminHref: Record<ReleaseAuthority, string> = { product_care: '/admin/product-content', compatibility: '/admin/compatibility', seo: '/admin/seo/' };
const authorityIcon = { product_care: Database, compatibility: ShieldCheck, seo: Search } as const;
const availabilityLabel = { ready: '可读取', auth_required: '需要登录', unavailable: '暂不可用' } as const;
const stageLabel: Record<ReleaseStage, string> = { diff: 'Diff', impact: 'Impact', preview: 'Preview', review: 'Review', staging: 'Staging', production: 'Production' };
const capabilityStateLabel = { available: '可用', partial: '部分', locked: '锁定', not_applicable: '不适用' } as const;
const capabilityStateClass = { available: 'border-emerald-200 bg-emerald-50 text-emerald-800', partial: 'border-amber-200 bg-amber-50 text-amber-900', locked: 'border-red-200 bg-red-50 text-red-800', not_applicable: 'border-slate-200 bg-slate-50 text-slate-500' } as const;
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
  const [feed, setFeed] = useState<ReleaseFeedDto>({ events: [], sources: [], capabilities: [], permissions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | ReleaseAuthority>('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const next = await publishCenterService.load(160);
      setFeed(next);
      setSelectedEventId(current => current && next.events.some(item => item.id === current) ? current : next.events[0]?.id || null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '发布记录暂时无法读取。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);
  const events = useMemo(() => filter === 'all' ? feed.events : feed.events.filter(item => item.authority === filter), [feed.events, filter]);
  const sourceByAuthority = useMemo(() => new Map(feed.sources.map(item => [item.authority, item])), [feed.sources]);
  const selectedEvent = events.find(item => item.id === selectedEventId) || events[0] || null;
  const relatedEvents = useMemo(() => selectedEvent ? getRelatedReleaseEvents(feed.events, selectedEvent).slice(0, 8) : [], [feed.events, selectedEvent]);
  const readiness = useMemo(() => ({
    ready: feed.sources.filter(item => item.availability === 'ready').length,
    authRequired: feed.sources.filter(item => item.availability === 'auth_required').length,
    unavailable: feed.sources.filter(item => item.availability === 'unavailable').length,
    currentOnly: feed.sources.filter(item => item.coverage === 'current_only').length,
  }), [feed.sources]);

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

        <section data-testid="publish-center-readiness" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ReadinessStat label="可读取 authority" value={`${readiness.ready}/3`} detail={readiness.ready === 3 ? '三个发布域都可读取' : '缺失源不会阻塞其它 authority'} />
          <ReadinessStat label="需要独立登录" value={String(readiness.authRequired)} detail="目前仅 SEO 使用独立 Repo Admin cookie" />
          <ReadinessStat label="暂不可用" value={String(readiness.unavailable)} detail="不可用源保持 fail-isolated，不影响其它时间线" />
          <ReadinessStat label="历史覆盖缺口" value={String(readiness.currentOnly)} detail={readiness.currentOnly ? "Product/Care 当前只有 current Published snapshot" : "Product/Care append-only publication history 可读取"} />
        </section>

        <ReleaseCapabilityMatrix capabilities={feed.capabilities} sources={sourceByAuthority} />

        <ReleasePermissionBoundary permissions={feed.permissions} />

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {([['all', '全部'], ['product_care', 'Product / Care'], ['compatibility', 'Compatibility'], ['seo', 'SEO']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => { setFilter(value); setSelectedEventId(null); }} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${filter === value ? 'bg-ink text-white' : 'border border-slate-200 bg-white text-ink/60'}`}>{label}</button>)}
        </div>

        {selectedEvent && <ReleaseEventDetail event={selectedEvent} source={sourceByAuthority.get(selectedEvent.authority)} relatedEvents={relatedEvents} />}

        <section className="mt-4 rounded-[24px] border border-white/80 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[0.14em] text-ink/40">Unified timeline</div><h2 className="mt-1 text-lg font-black">发布 / 审核 / Revision 记录</h2></div><div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-ink/55">{events.length} 条</div></div>
          {error && <div role="alert" className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
          {loading && <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-bold text-ink/45"><Loader2 className="h-5 w-5 animate-spin" />读取 release sources…</div>}
          {!loading && !events.length && <div className="mt-4 rounded-[18px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm font-bold text-ink/40">当前筛选没有可显示的发布记录。</div>}
          {!loading && events.length > 0 && <div data-testid="publish-center-timeline" className="mt-4 grid gap-3">
            {events.map(event => <ReleaseEventCard key={event.id} event={event} selected={event.id === selectedEventId} onSelect={() => setSelectedEventId(event.id)} />)}
          </div>}
        </section>
      </div>
    </div>
  );
}



const permissionActionLabel: Record<ReleasePermissionDto['action'], string> = {
  read_history: '读取历史', edit_draft: '编辑 Draft', review: '审核', publish_staging: '发布 Staging', publish_reviewed: '发布 Reviewed', publish_production: '发布 Production',
};
const permissionStateLabel: Record<ReleasePermissionDto['state'], string> = { allowed: '允许', separate_auth: '独立登录', locked: '锁定', not_applicable: '不适用' };
const permissionStateClass: Record<ReleasePermissionDto['state'], string> = {
  allowed: 'border-emerald-200 bg-emerald-50 text-emerald-800', separate_auth: 'border-amber-200 bg-amber-50 text-amber-900', locked: 'border-red-200 bg-red-50 text-red-800', not_applicable: 'border-slate-200 bg-slate-50 text-slate-500',
};

function ReleasePermissionBoundary({ permissions }: { permissions: ReleasePermissionDto[] }) {
  return <section data-testid="publish-center-permission-boundary" className="mt-4 rounded-[24px] border border-white/80 bg-white p-4 shadow-sm md:p-5"><div><div className="text-xs font-black uppercase tracking-[0.14em] text-ink/40">Access boundary</div><h2 className="mt-1 text-lg font-black">当前身份与发布权限</h2><p className="mt-1 text-xs font-semibold leading-5 text-ink/50">这是现有权限事实的只读投影，不会修改 Supabase `user_roles` 或 SEO Repo Admin 认证。</p></div><div className="mt-4 grid gap-3">{(['product_care','compatibility','seo'] as ReleaseAuthority[]).map(authority => { const rows = permissions.filter(item => item.authority === authority); const identity = rows.find(item => item.identity)?.identity; const role = rows[0]?.role || 'unknown'; return <article key={authority} className="rounded-[18px] border border-slate-100 bg-slate-50/60 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm font-black">{authorityLabel[authority]}</strong><span className="text-[11px] font-bold text-ink/45">{identity || '未认证'} · {role}</span></div><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">{rows.map(item => <div key={`${authority}-${item.action}`} className={`rounded-[14px] border px-3 py-2.5 ${permissionStateClass[item.state]}`} title={item.detail}><div className="text-[10px] font-black uppercase tracking-[0.08em] opacity-70">{permissionActionLabel[item.action]}</div><div className="mt-1 text-xs font-black">{permissionStateLabel[item.state]}</div><p className="mt-1 text-[10px] font-semibold leading-4 opacity-75">{item.detail}</p></div>)}</div></article>; })}</div></section>;
}

function ReleaseCapabilityMatrix({ capabilities, sources }: { capabilities: ReleaseCapabilityDto[]; sources: Map<ReleaseAuthority, ReleaseSourceStatusDto> }) {
  const byAuthority = (authority: ReleaseAuthority) => capabilities.filter(item => item.authority === authority);
  return <section data-testid="publish-center-capability-matrix" className="mt-4 rounded-[24px] border border-white/80 bg-white p-4 shadow-sm md:p-5"><div><div className="text-xs font-black uppercase tracking-[0.14em] text-ink/40">Release capability</div><h2 className="mt-1 text-lg font-black">Diff → Impact → Preview → Review → Staging → Production</h2><p className="mt-1 text-xs font-semibold leading-5 text-ink/50">这是当前代码/authority 能力矩阵，不等于 Production 已解锁。来源未登录或不可用时，历史读取状态单独显示在上方。</p></div><div className="mt-4 grid gap-3">{(['product_care','compatibility','seo'] as ReleaseAuthority[]).map(authority => <article key={authority} className="rounded-[18px] border border-slate-100 bg-slate-50/60 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm font-black">{authorityLabel[authority]}</strong><span className="text-[11px] font-bold text-ink/40">{sources.get(authority) ? availabilityLabel[sources.get(authority)!.availability] : '未知'}</span></div><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">{byAuthority(authority).map(item => <CapabilityCell key={`${authority}-${item.stage}`} item={item} />)}</div></article>)}</div></section>;
}

function CapabilityCell({ item }: { item: ReleaseCapabilityDto }) {
  return <div className={`rounded-[14px] border px-3 py-2.5 ${capabilityStateClass[item.state]}`} title={item.detail}><div className="text-[10px] font-black uppercase tracking-[0.08em] opacity-70">{stageLabel[item.stage]}</div><div className="mt-1 text-xs font-black">{capabilityStateLabel[item.state]}</div><p className="mt-1 text-[10px] font-semibold leading-4 opacity-75">{item.detail}</p></div>;
}

function ReadinessStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="rounded-[18px] border border-white/80 bg-white p-4 shadow-sm"><div className="text-[11px] font-black uppercase tracking-[0.1em] text-ink/38">{label}</div><div className="mt-2 text-2xl font-black text-ink">{value}</div><p className="mt-1 text-xs font-semibold leading-5 text-ink/48">{detail}</p></article>;
}

function ReleaseEventDetail({ event, source, relatedEvents }: { event: ReleaseEventDto; source?: ReleaseSourceStatusDto; relatedEvents: ReleaseEventDto[] }) {
  const metadata = Object.entries(event.metadata || {}).filter(([, value]) => value !== undefined && value !== null && value !== '');
  return <section data-testid="publish-center-event-detail" className="mt-4 rounded-[22px] border border-white/80 bg-white p-4 shadow-sm md:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[0.14em] text-ink/40">Release detail</div><h2 className="mt-1 text-lg font-black">{event.title}</h2><p className="mt-1 text-xs font-semibold text-ink/50">只读审计详情，不提供发布或回滚动作。</p></div><a href={authorityAdminHref[event.authority]} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-ink/60">前往 {authorityLabel[event.authority]} authority →</a></div><dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><DetailItem label="发生时间" value={formatTime(event.occurredAt)} /><DetailItem label="资源" value={event.resourceKey || '—'} /><DetailItem label="版本" value={event.version ? `v${event.version}` : '—'} /><DetailItem label="来源覆盖" value={source ? coverageLabel[source.coverage] : '未知'} /><DetailItem label="Event type" value={event.eventType} /><DetailItem label="Actor" value={event.actor || '未记录'} /><DetailItem label="Source ref" value={event.sourceRef || '—'} /><DetailItem label="Locale" value={event.locale || '—'} /></dl>{metadata.length > 0 && <div className="mt-4 border-t border-slate-100 pt-4"><div className="text-[11px] font-black uppercase tracking-[0.1em] text-ink/35">Metadata</div><div className="mt-2 grid gap-2 sm:grid-cols-2">{metadata.slice(0, 12).map(([key, value]) => <DetailItem key={key} label={key} value={typeof value === 'string' ? value : JSON.stringify(value)} />)}</div></div>}<RelatedReleaseEvidence events={relatedEvents} /></section>;
}

function RelatedReleaseEvidence({ events }: { events: ReleaseEventDto[] }) {
  return <div data-testid="publish-center-related-evidence" className="mt-4 border-t border-slate-100 pt-4"><div className="text-[11px] font-black uppercase tracking-[0.1em] text-ink/35">Cross-authority context</div><p className="mt-1 text-xs font-semibold leading-5 text-ink/45">仅按明确 catalog key 关联其它 authority 的记录；这不是依赖判断，也不表示必须同步发布。</p>{events.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{events.map(item => <a key={item.id} href={authorityAdminHref[item.authority]} className="rounded-[14px] border border-slate-100 bg-slate-50 px-3 py-2.5 hover:border-slate-200"><div className="text-[10px] font-black uppercase tracking-[0.08em] text-ink/35">{authorityLabel[item.authority]} · {item.status}</div><div className="mt-1 text-xs font-black text-ink/70">{item.title}</div><div className="mt-1 text-[10px] font-semibold text-ink/45">{item.resourceKey || '—'} · {formatTime(item.occurredAt)}</div></a>)}</div> : <div className="mt-3 rounded-[14px] bg-slate-50 px-3 py-3 text-xs font-semibold text-ink/40">当前没有可按 catalog key 明确关联的其它 authority 记录。</div>}</div>;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-[14px] bg-slate-50 px-3 py-2.5"><dt className="text-[10px] font-black uppercase tracking-[0.08em] text-ink/35">{label}</dt><dd className="mt-1 break-words text-xs font-bold leading-5 text-ink/65">{value}</dd></div>;
}

function ReleaseEventCard({ event, selected, onSelect }: { event: ReleaseEventDto; selected: boolean; onSelect: () => void }) {
  const Icon = authorityIcon[event.authority];
  return <button type="button" onClick={onSelect} aria-pressed={selected} className={`min-w-0 rounded-[18px] border p-4 text-left transition ${selected ? 'border-emerald-300 bg-emerald-50/70 ring-1 ring-emerald-100' : 'border-slate-100 bg-slate-50/60 hover:border-slate-200'}`}><div className="flex min-w-0 items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink/55 shadow-sm"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-black uppercase tracking-[0.1em] text-ink/40">{authorityLabel[event.authority]}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-ink/55">{event.status}</span></div><h3 className="mt-1 text-sm font-black text-ink">{event.title}</h3>{event.detail && <p className="mt-1 break-words text-xs font-semibold leading-5 text-ink/55">{event.detail}</p>}</div></div><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-200/70 pt-3 text-[11px] font-bold text-ink/40"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{formatTime(event.occurredAt)}</span>{event.resourceKey && <span>{event.resourceKey}</span>}{event.version ? <span>v{event.version}</span> : null}{event.actor && <span>{event.actor}</span>}</div></button>;
}
