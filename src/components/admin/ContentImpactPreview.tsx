import type { ContentImpactKind, ContentImpactResult } from '../../services/admin/content-impact.service';
import { contentImpactLabels } from '../../services/admin/content-impact.service';

const kindClass: Record<ContentImpactKind, string> = {
  display_only: 'border-slate-200 bg-slate-50 text-slate-700',
  decision_critical_product: 'border-amber-200 bg-amber-50 text-amber-800',
  care_workflow: 'border-sky-200 bg-sky-50 text-sky-800',
  compatibility_rule: 'border-violet-200 bg-violet-50 text-violet-800',
  seo_only: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

const formatValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) {
    const text = value.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join('；');
    return text || '—';
  }
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return text.length > 96 ? `${text.slice(0, 93)}…` : text;
};

export default function ContentImpactPreview({ impact, saved = false, savedLabel, compact = false }: {
  impact: ContentImpactResult | null;
  saved?: boolean;
  savedLabel?: string;
  compact?: boolean;
}) {
  if (!impact?.changes.length) {
    return compact ? null : (
      <section data-testid="content-impact-preview" className="mb-4 rounded-[18px] border border-dashed border-border bg-bg/55 px-4 py-3">
        <div className="text-sm font-black">变更影响预览</div>
        <p className="mt-1 text-xs font-bold leading-5 text-ink/48">修改已存在内容后，这里会显示字段分类、直接更新的页面，以及需要单独复核但不会被自动改写的模块。</p>
      </section>
    );
  }

  const direct = impact.directConsumers.map(id => contentImpactLabels.consumers[id]);
  const review = impact.reviewConsumers.map(id => contentImpactLabels.consumers[id]);
  return (
    <section data-testid="content-impact-preview" className={`${compact ? 'mt-3' : 'mb-5'} rounded-[18px] border border-amber-200 bg-[#fffaf0] p-4`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-sm font-black">变更影响预览</div>
          <p className="mt-1 text-xs font-bold text-ink/48">{saved ? (savedLabel || '最近一次保存的字段变更') : '当前尚未保存的字段变更'} · {impact.changes.length} 项</p>
        </div>
        {impact.highestKind && <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${kindClass[impact.highestKind]}`}>{contentImpactLabels.kinds[impact.highestKind]}</span>}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-[14px] bg-white/80 px-3 py-2.5">
          <div className="text-[11px] font-black text-emerald-700">发布后直接更新</div>
          <div className="mt-1 text-xs font-bold text-ink/65">{direct.length ? direct.join(' · ') : '无'}</div>
        </div>
        <div className="rounded-[14px] bg-white/80 px-3 py-2.5">
          <div className="text-[11px] font-black text-amber-700">需单独复核</div>
          <div className="mt-1 text-xs font-bold text-ink/65">{review.length ? review.join(' · ') : '无'}</div>
        </div>
      </div>

      {!compact && <div className="mt-3 grid gap-2">{impact.changes.map(change => (
        <div key={change.field} data-impact-field={change.field} className="rounded-[14px] border border-white bg-white/75 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-black">{change.label}</span><span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${kindClass[change.kind]}`}>{contentImpactLabels.kinds[change.kind]}</span></div>
          <div className="mt-1.5 grid gap-1 text-[11px] font-bold text-ink/55 sm:grid-cols-[1fr_auto_1fr]"><span className="break-words">{formatValue(change.before)}</span><span aria-hidden="true">→</span><span className="break-words text-ink/80">{formatValue(change.after)}</span></div>
        </div>
      ))}</div>}

      {review.length > 0 && <p className="mt-3 text-[11px] font-bold leading-5 text-amber-900/70">“需单独复核”表示当前发布不会自动改写该独立 authority；例如 Compatibility 规则与 SEO 内容仍需在各自流程中确认。</p>}
    </section>
  );
}
