import type { CompatibilityRegressionResult } from '../../services/admin/compatibility-impact.service';

const statusLabel = {
  compatible: '适合',
  caution: '谨慎',
  insufficient_data: '信息不足',
  not_recommended: '不建议',
} as const;

const statusClass = {
  compatible: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  caution: 'border-amber-200 bg-amber-50 text-amber-800',
  insufficient_data: 'border-slate-200 bg-slate-50 text-slate-700',
  not_recommended: 'border-red-200 bg-red-50 text-red-800',
} as const;

function StatusBadge({ value }: { value: keyof typeof statusLabel }) {
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${statusClass[value]}`}>{statusLabel[value]}</span>;
}

export default function CompatibilityRegressionPreview({ result }: { result: CompatibilityRegressionResult }) {
  const hasChanges = result.changedPairs > 0;
  return (
    <section data-testid="compatibility-regression-preview" className={`mb-5 rounded-[18px] border p-4 ${hasChanges ? 'border-amber-200 bg-amber-50/45' : 'border-emerald-200 bg-emerald-50/45'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-sm font-black">Compatibility 回归（模拟）</div>
          <p className="mt-1 text-xs font-bold leading-5 text-ink/50">使用当前物种级 Compatibility engine，对比已发布 Product 数据与草稿数据；不会写入 Compatibility 规则。</p>
        </div>        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${hasChanges ? 'border-amber-200 bg-white text-amber-800' : 'border-emerald-200 bg-white text-emerald-800'}`}>
          {hasChanges ? `${result.changedPairs} 个组合有变化` : '未发现组合变化'}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-[12px] border border-border bg-white px-2 py-2"><div className="text-[10px] font-black text-ink/40">对比组合</div><div className="mt-1 text-sm font-black">{result.cohortSize}</div></div>
        <div className="rounded-[12px] border border-border bg-white px-2 py-2"><div className="text-[10px] font-black text-ink/40">状态变化</div><div className="mt-1 text-sm font-black">{result.statusChangedPairs}</div></div>
        <div className="rounded-[12px] border border-border bg-white px-2 py-2"><div className="text-[10px] font-black text-ink/40">规则原因变化</div><div className="mt-1 text-sm font-black">{result.ruleChangedPairs}</div></div>
      </div>
      {hasChanges ? (
        <div className="mt-3 grid gap-2">{result.changes.map(change => (
          <div key={change.speciesId} className="min-w-0 rounded-[12px] border border-border bg-white px-3 py-2.5">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <div className="min-w-0 truncate text-xs font-black">{change.speciesName}</div>
              <div className="flex items-center gap-1.5"><StatusBadge value={change.beforeStatus} /><span className="text-[10px] font-black text-ink/35">→</span><StatusBadge value={change.afterStatus} /></div>
            </div>
            {!change.statusChanged && <div className="mt-1 text-[10px] font-bold text-ink/45">总体状态不变，但触发的规则/缺失信息发生变化。</div>}
          </div>
        ))}</div>
      ) : <div className="mt-3 rounded-[12px] border border-emerald-200 bg-white px-3 py-3 text-xs font-bold leading-5 text-emerald-800">在当前静态 Compatibility cohort 中，没有发现这次 Product 修改会改变物种级判断结果或规则原因。</div>}
      {result.truncated && <p className="mt-2 text-[10px] font-bold text-ink/45">仅展示优先级最高的 {result.changes.length} 个变化组合；完整计数以上方统计为准。</p>}
      <p className="mt-3 text-[11px] font-bold leading-5 text-ink/50">这是发布前回归信号，不是新的 Compatibility 结论。正式规则仍需独立 Evidence / Review / Version 流程。</p>
    </section>
  );
}
