import { AlertTriangle, CheckCircle2, CircleHelp, Info, ShieldAlert, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ConflictEdge } from '../../lib/communityConflictGraph';
import type { RuleMappedActionOption } from '../../lib/conflictActionEngine';
import type { InterventionChoiceOption } from '../../lib/interventionChoiceModel';
import type { TankDecisionDestinationEvaluation, TankDecisionSupportResult } from '../../lib/tankDecisionSupportOrchestrator';

export type InterventionComparisonPanelProps = {
  open: boolean;
  result: TankDecisionSupportResult;
  isEn?: boolean;
  onOpenChange: (open: boolean) => void;
};

const relationLabel = (relation: ConflictEdge['relation'], isEn: boolean) => {
  const labels: Record<ConflictEdge['relation'], [string, string]> = {
    predation: ['捕食 / 吞食', 'Predation'],
    aggression: ['攻击冲突', 'Aggression'],
    fin_nipping: ['追鳍 / 啄咬', 'Fin nipping'],
    territorial: ['领地冲突', 'Territorial conflict'],
    water_type: ['水体类型', 'Water type'],
    temperature: ['温度条件', 'Temperature'],
    water_parameters: ['水质参数', 'Water parameters'],
    group_size: ['群体数量', 'Group size'],
    behavior_evidence: ['行为证据', 'Behavior evidence'],
    other: ['其他条件', 'Other condition'],
  };
  return labels[relation][isEn ? 1 : 0];
};

const actionLabel = (action: RuleMappedActionOption['action'], isEn: boolean) => {
  const labels: Record<RuleMappedActionOption['action'], [string, string]> = {
    adjust_environment: ['调整环境条件', 'Adjust environment'],
    adjust_quantity: ['调整数量 / 群体规模', 'Adjust quantity / group size'],
    collect_more_data: ['先补充资料', 'Collect more information'],
    monitor: ['继续观察', 'Monitor'],
  };
  return labels[action][isEn ? 1 : 0];
};

const destinationLabel = (
  status: TankDecisionDestinationEvaluation['destinations']['evaluations'][number]['status'],
  isEn: boolean,
) => {
  const labels = {
    compatible_by_current_evidence: ['基于当前证据可考虑', 'Can be considered on current evidence'],
    conditional: ['有条件候选', 'Conditional destination'],
    insufficient_data: ['资料不足，暂不能确认', 'Insufficient data'],
    not_recommended: ['当前不建议', 'Not recommended'],
  } as const;
  return labels[status][isEn ? 1 : 0];
};

function ConflictRow({
  edge,
  sourceName,
  targetName,
  isEn,
}: {
  edge: ConflictEdge;
  sourceName: string;
  targetName: string;
  isEn: boolean;
}) {
  return (
    <article className="rounded-[16px] border border-red-100 bg-red-50/75 p-3" data-conflict-edge-id={edge.id}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.12em] text-red-700/70">{relationLabel(edge.relation, isEn)}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[13px] font-black text-red-950">
            <span>{sourceName}</span>
            <span aria-label={edge.direction === 'mutual' ? (isEn ? 'mutual relationship' : '双向关系') : (isEn ? 'directed relationship' : '单向关系')}>{edge.direction === 'mutual' ? '↔' : '→'}</span>
            <span>{targetName}</span>
          </div>
          <p className="mt-1.5 text-[11px] font-bold leading-relaxed text-red-900/72">{edge.evidence}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[9px] font-black text-red-700 shadow-sm">{edge.severity.toUpperCase()}</span>
      </div>
      <p className="mt-2 text-[9px] font-bold text-red-800/55">
        {isEn ? `Basis: ${edge.basis} · Confidence: ${edge.confidence}` : `依据：${edge.basis} · 置信度：${edge.confidence}`}
      </p>
    </article>
  );
}

function DestinationList({ destination, isEn }: { destination?: TankDecisionDestinationEvaluation; isEn: boolean }) {
  if (!destination) return null;
  if (destination.destinations.status === 'no_existing_destination') {
    return <div className="mt-3 rounded-[14px] border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-bold text-ink/58">{isEn ? 'No other supplied aquarium can be evaluated as a destination.' : '当前提供的鱼缸中没有其他可评估的目标缸。'}</div>;
  }
  return (
    <div className="mt-3 grid gap-2" data-relocation-destinations={destination.subjectSpeciesId}>
      <div className="text-[10px] font-black text-ink/48">{isEn ? 'Existing tank destinations' : '现有鱼缸去向评估'}</div>
      {destination.destinations.evaluations.map(item => (
        <div key={item.aquariumId} className="rounded-[13px] border border-border bg-white px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-black text-ink">{item.aquariumName}</div>
              <div className="mt-0.5 text-[10px] font-bold text-ink/48">{destinationLabel(item.status, isEn)}</div>
            </div>
            {item.status === 'compatible_by_current_evidence'
              ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              : item.status === 'not_recommended'
                ? <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
                : <CircleHelp className="h-4 w-4 shrink-0 text-amber-600" />}
          </div>
          <p className="mt-1.5 text-[10px] font-medium leading-relaxed text-ink/58">{item.compatibility.summary}</p>
          {item.failClosedForUnresolvedResidents && <p className="mt-1 text-[9px] font-bold text-sky-700">{isEn ? 'This destination has unresolved residents, so it cannot be formally confirmed yet.' : '该目标缸还有身份未确认的生物，因此暂不能正式确认去向。'}</p>}
        </div>
      ))}
    </div>
  );
}

function ChoiceCard({
  option,
  destination,
  isEn,
}: {
  option: InterventionChoiceOption;
  destination?: TankDecisionDestinationEvaluation;
  isEn: boolean;
}) {
  return (
    <article className={`rounded-[18px] border p-4 ${option.strongestSingleChange ? 'border-emerald-200 bg-emerald-50/70' : 'border-border bg-white'}`} data-intervention-choice-id={option.id}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.12em] text-ink/42">{isEn ? 'Counterfactual option' : '反事实方案'}</div>
          <h4 className="mt-1 text-[14px] font-black text-ink">{isEn ? `If ${option.subjectName} leaves this tank` : `如果 ${option.subjectName} 离开当前鱼缸`}</h4>
        </div>
        {option.strongestSingleChange && <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-emerald-700 shadow-sm">{isEn ? 'Largest single-step blocker reduction' : '单步减少阻断最多'}</span>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          [isEn ? 'Quantity affected' : '涉及数量', option.quantity, 'text-ink'],
          [isEn ? 'Blockers resolved' : '解决阻断', option.resolvesBlockerCount, 'text-emerald-700'],
          [isEn ? 'Blockers remaining' : '剩余阻断', option.remainingBlockerCount, 'text-red-700'],
          [isEn ? 'Evidence mode' : '依据方式', isEn ? 'Recomputed' : '移出后重算', 'text-ink'],
        ].map(([label, value, valueClass]) => (
          <div key={String(label)} className="rounded-[12px] bg-white/85 p-2.5">
            <div className="text-[9px] font-black text-ink/42">{label}</div>
            <div className={`mt-0.5 text-[13px] font-black ${valueClass}`}>{value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] font-bold leading-relaxed text-ink/55">{isEn ? 'This is a comparison result, not an instruction to remove this animal. Keeper preference and rehoming feasibility are not encoded here.' : '这是方案比较结果，不是要求你移出该生物。系统没有替你编码偏好、个体价值或送养难度。'}</p>
      <DestinationList destination={destination} isEn={isEn} />
    </article>
  );
}

export function InterventionComparisonPanel({ open, result, isEn = false, onOpenChange }: InterventionComparisonPanelProps) {
  const graph = result.knownSubsetActionPlan.graph;
  const blockers = graph.edges.filter(edge => edge.outcome === 'blocker');
  const formalChoices = result.formalChoiceComparison?.options || [];
  const nodeNameById = new Map(graph.nodes.map(node => [node.speciesId, node.name]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] w-[95vw] max-w-[760px] flex-col overflow-hidden rounded-[24px] border-border bg-bg p-0" data-intervention-panel-readonly="true">
        <DialogHeader className="shrink-0 border-b border-border/70 bg-white px-5 py-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-ink/52"><ShieldAlert className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-[0.14em]">{isEn ? 'Current community intervention' : '当前群落调整比较'}</span></div>
              <DialogTitle className="mt-1 text-xl font-black text-ink">{isEn ? 'What changes would actually reduce current conflicts?' : '哪些调整真的会减少当前冲突？'}</DialogTitle>
              <DialogDescription className="mt-1 text-[12px] font-medium leading-relaxed text-ink/55">{isEn ? 'Each option recomputes the remaining community. This panel is read-only and never moves livestock automatically.' : '每个方案都会重新计算调整后的剩余群落。这个面板只做比较，不会自动移动或删除任何生物。'}</DialogDescription>
            </div>
            <button type="button" aria-label={isEn ? 'Close intervention comparison' : '关闭调整比较'} onClick={() => onOpenChange(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-bg text-ink/55"><X className="h-4 w-4" /></button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {result.certainty === 'partial_known_community' && (
            <section className="rounded-[18px] border border-sky-200 bg-sky-50 p-4" data-partial-known-community>
              <div className="flex items-start gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" /><div><h3 className="text-[13px] font-black text-sky-950">{isEn ? 'Only the known subset can be analyzed' : '当前只能分析已确认的群落部分'}</h3><p className="mt-1 text-[11px] font-bold leading-relaxed text-sky-900/70">{isEn ? `${result.context.unresolvedCurrentSpeciesIds.length} current resident(s) are unresolved. Known conflicts remain visible, but formal keep-A/keep-B and destination conclusions are disabled.` : `当前还有 ${result.context.unresolvedCurrentSpeciesIds.length} 条/组生物身份未确认。已知冲突仍会显示，但不会生成正式的保留 A / 保留 B 或目标缸结论。`}</p></div></div>
            </section>
          )}

          <section className="mt-4">
            <div className="text-[10px] font-black uppercase tracking-[0.12em] text-ink/42">{isEn ? 'Blocking relationships' : '当前阻断关系'}</div>
            <h3 className="mt-1 text-[16px] font-black text-ink">{isEn ? `${blockers.length} known blocker(s)` : `已知 ${blockers.length} 条阻断关系`}</h3>
            {blockers.length > 0 ? <div className="mt-3 grid gap-2">{blockers.map(edge => <ConflictRow key={edge.id} edge={edge} sourceName={nodeNameById.get(edge.sourceSpeciesId) || edge.sourceSpeciesId} targetName={nodeNameById.get(edge.targetSpeciesId) || edge.targetSpeciesId} isEn={isEn} />)}</div> : <div className="mt-3 rounded-[16px] border border-emerald-100 bg-emerald-50 p-3 text-[11px] font-bold text-emerald-800">{isEn ? 'No explicit blocker is present in the currently known evidence.' : '基于当前已知证据，没有发现明确阻断关系。'}</div>}
          </section>

          {result.formalChoiceComparison && formalChoices.length > 0 && (
            <section className="mt-5" data-formal-intervention-choices>
              <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" /><div><h3 className="text-[15px] font-black text-ink">{isEn ? 'Compare one-species relocation scenarios' : '比较单一物种移出方案'}</h3><p className="mt-0.5 text-[10px] font-bold leading-relaxed text-ink/48">{result.formalChoiceComparison.kind === 'multiple_equal_single_change_options' ? (isEn ? 'Multiple options reduce the same number of blockers. The choice stays with you.' : '有多个方案减少的阻断数量相同，系统不会替你强行选其中一个。') : (isEn ? 'The highlighted option removes the most blocker edges among simulated one-species changes; it is not a command.' : '高亮方案只表示在单次移出一种生物的模拟中减少阻断最多，并不代表必须执行。')}</p></div></div>
              <div className="mt-3 grid gap-3">{formalChoices.map(option => <ChoiceCard key={option.id} option={option} destination={result.relocationDestinations.find(item => item.subjectSpeciesId === option.subjectSpeciesId)} isEn={isEn} />)}</div>
              {!result.destinationSetProvided && <div className="mt-3 rounded-[14px] border border-sky-100 bg-sky-50 px-3 py-2.5 text-[10px] font-bold text-sky-800">{isEn ? 'Other aquarium data was not supplied, so no destination conclusion is shown.' : '当前没有提供其他鱼缸数据，因此这里不会把“未知去向”写成“没有可用鱼缸”。'}</div>}
            </section>
          )}

          {result.knownSubsetActionPlan.conditionActions.length > 0 && (
            <section className="mt-5" data-condition-actions>
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-ink/42">{isEn ? 'Other addressable conditions' : '其他可处理条件'}</div>
              <div className="mt-2 grid gap-2">{result.knownSubsetActionPlan.conditionActions.map(action => <article key={action.id} className="rounded-[15px] border border-border bg-white p-3"><div className="text-[11px] font-black text-ink">{actionLabel(action.action, isEn)} · {action.title}</div><p className="mt-1 text-[10px] font-medium leading-relaxed text-ink/58">{action.rationale}</p><p className="mt-1.5 text-[9px] font-bold text-ink/38">{isEn ? `Rule-mapped · ${action.confidence} confidence` : `规则映射 · ${action.confidence} 置信度`}</p></article>)}</div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
