import type { CareSeoProjectionDto } from '../../../packages/contracts/src';

type Props = {
  projection: CareSeoProjectionDto | null;
  loading?: boolean;
};

const factCount = (value: string[]) => value.length ? `${value.length} 项` : '0 项';

export default function CareSeoProjectionPreview({ projection, loading = false }: Props) {
  if (loading) {
    return <section data-testid="care-seo-projection" className="mb-4 rounded-[18px] border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-ink/45">正在读取 Published Care SEO source…</section>;
  }
  if (!projection) {
    return (
      <section data-testid="care-seo-projection" className="mb-4 rounded-[18px] border border-dashed border-slate-200 bg-slate-50 p-4">
        <div className="text-xs font-black uppercase tracking-[0.12em] text-ink/35">Care SEO projection</div>
        <p className="mt-2 text-sm font-bold leading-6 text-ink/50">当前 Care 还没有可用的 Published source。SEO 不会读取 Draft 事实；先完成 Care 发布后才生成 downstream projection。</p>
      </section>
    );
  }

  const { sourceFacts, suggestedEditorial, route } = projection;
  return (
    <section data-testid="care-seo-projection" className="mb-4 rounded-[20px] border border-violet-200 bg-violet-50/55 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.12em] text-violet-700">Care SEO downstream projection</div>
          <h3 className="mt-1 text-base font-black text-ink">仅从 Published Care 生成 SEO 输入</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-black">
          <span className="rounded-full bg-white px-3 py-1.5 text-violet-700">Published v{projection.sourceCareVersion}</span>
          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">Route 未就绪</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ProjectionField label="SEO Title suggestion" value={suggestedEditorial.seoTitle} />
        <ProjectionField label="Meta Description suggestion" value={suggestedEditorial.metaDescription} />
        <ProjectionField label="H1 suggestion" value={suggestedEditorial.h1} />
        <ProjectionField label="Focus keyword suggestion" value={suggestedEditorial.focusKeyword} />
      </div>

      <div className="mt-4 rounded-[16px] border border-white/80 bg-white/80 p-3">
        <div className="text-[11px] font-black uppercase tracking-[0.1em] text-ink/35">Protected Care facts · read only</div>
        <div className="mt-2 grid gap-2 text-xs font-bold text-ink/58 sm:grid-cols-2 lg:grid-cols-4">
          <span>症状：{factCount(sourceFacts.symptoms)}</span>
          <span>立即动作：{factCount(sourceFacts.immediateActions)}</span>
          <span>禁止动作：{factCount(sourceFacts.avoidActions)}</span>
          <span>Evidence：{sourceFacts.evidenceCount}</span>
        </div>
        <p className="mt-2 text-xs font-semibold leading-5 text-ink/48">{sourceFacts.summary}</p>
      </div>

      <div className="mt-4 rounded-[16px] border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-950">
        <div className="font-black">SEO publish 继续锁定 · {route.candidateUrl}</div>
        <ul className="mt-2 grid gap-1">{route.blockers.map(blocker => <li key={blocker}>• {blocker}</li>)}</ul>
      </div>
      <p className="mt-3 text-[11px] font-bold leading-5 text-violet-800/75">
        允许编辑的 downstream 字段仅为：SEO Title、Meta Description、H1、Focus Keyword。Care 的症状、步骤、禁忌、观察、下一步与 Evidence 不会在 SEO 层复制编辑。
      </p>
    </section>
  );
}

function ProjectionField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[14px] bg-white px-3 py-2.5 shadow-sm">
      <div className="text-[10px] font-black uppercase tracking-[0.08em] text-ink/35">{label}</div>
      <div className="mt-1 break-words text-xs font-bold leading-5 text-ink/70">{value || '—'}</div>
    </div>
  );
}
