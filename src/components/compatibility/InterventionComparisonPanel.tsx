import { AlertTriangle, ArrowRight, CheckCircle2, CircleHelp, Info, ShieldAlert, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Aquarium } from '../../types';
import type { ConflictEdge } from '../../lib/communityConflictGraph';
import type { RuleMappedActionOption } from '../../lib/conflictActionEngine';
import type { InterventionChoiceOption } from '../../lib/interventionChoiceModel';
import {
  buildRelocationConfirmationEntrypoint,
  type RelocationConfirmationEntrypointBlockReason,
  type RelocationConfirmationLaunchCandidate,
} from '../../lib/relocationConfirmationEntrypoint';
import type {
  TankDecisionDestinationEvaluation,
  TankDecisionSupportResult,
} from '../../lib/tankDecisionSupportOrchestrator';

export type InterventionComparisonPanelProps = {
  open: boolean;
  result: TankDecisionSupportResult;
  sourceAquarium?: Aquarium;
  isEn?: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenRelocationConfirmation?: (candidate: RelocationConfirmationLaunchCandidate) => void;
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

const entrypointBlockLabel = (
  reason: RelocationConfirmationEntrypointBlockReason,
  isEn: boolean,
) => {
  const labels: Record<RelocationConfirmationEntrypointBlockReason, [string, string]> = {
    formal_intervention_not_allowed: ['当前群落资料不足，不能进入正式迁移确认。', 'The current community is not complete enough for formal relocation confirmation.'],
    formal_option_not_found: ['当前方案已变化，请重新查看调整比较。', 'This formal option is no longer present. Review the intervention comparison again.'],
    source_aquarium_mismatch: ['当前源鱼缸状态与这份方案不一致，请刷新后重试。', 'The source aquarium does not match this decision snapshot. Refresh before continuing.'],
    resolved_subject_not_found: ['当前方案无法重新定位到已确认物种。', 'The formal subject can no longer be resolved to verified livestock.'],
    multiple_source_records: ['该物种分布在多条事实记录中，当前单记录迁移还不能完整执行这个方案。', 'This species spans multiple factual records; the current single-record mutation cannot execute the whole option.'],
    source_record_not_found: ['对应的事实记录已变化，请重新计算方案。', 'The factual source record changed. Recompute the intervention first.'],
    source_record_quantity_mismatch: ['当前事实数量与方案数量不一致，请重新计算方案。', 'The factual source quantity no longer matches the formal option quantity.'],
    source_batch_missing: ['当前记录没有可确认的事实批次，暂不能直接执行迁移。', 'The source record has no explicit factual batch, so direct relocation is unavailable.'],
    multiple_positive_source_batches: ['该物种需要跨多个批次处理，当前不能把单批次迁移当作完整方案执行。', 'The whole subject spans multiple batches; a single-batch move cannot represent the complete option.'],
    source_batch_quantity_mismatch: ['当前批次数量与完整方案数量不一致，暂不能直接执行。', 'The source batch quantity does not match the whole formal option.'],
    destination_not_in_formal_result: ['该目标缸不属于当前正式去向评估。', 'This destination is not part of the current formal destination evaluation.'],
    destination_not_compatible_by_current_evidence: ['当前目标缸不是可直接进入确认的状态。', 'This destination is not currently eligible to open direct confirmation.'],
  };
  return labels[reason][isEn ? 1 : 0];
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

function DestinationList({
  destination,
  option,
  result,
  sourceAquarium,
  isEn,
  onOpenRelocationConfirmation,
}: {
  destination?: TankDecisionDestinationEvaluation;
  option: InterventionChoiceOption;
  result: TankDecisionSupportResult;
  sourceAquarium?: Aquarium;
  isEn: boolean;
  onOpenRelocationConfirmation?: (candidate: RelocationConfirmationLaunchCandidate) => void;
}) {
  if (!destination) return null;
  if (destination.destinations.status === 'no_existing_destination') {
    return <div className="mt-3 rounded-[14px] border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-bold text-ink/58">{isEn ? 'No other supplied aquarium can be evaluated as a destination.' : '当前提供的鱼缸中没有其他可评估的目标缸。'}</div>;
  }

  return (
    <div className="mt-3 grid gap-2" data-relocation-destinations={destination.subjectSpeciesId}>
      <div className="text-[10px] font-black text-ink/48">{isEn ? 'Existing tank destinations' : '现有鱼缸去向评估'}</div>
      {destination.destinations.evaluations.map(item => {
        const entrypoint = sourceAquarium
          ? buildRelocationConfirmationEntrypoint({
              result,
              sourceAquarium,
              optionId: option.id,
              destinationAquariumId: item.aquariumId,
            })
          : null;
        const canOpenConfirmation = Boolean(
          onOpenRelocationConfirmation && entrypoint?.status === 'eligible',
        );
        const sourceScopeBlocked = item.status === 'compatible_by_current_evidence'
          && entrypoint?.status === 'blocked'
          && entrypoint.reason !== 'destination_not_compatible_by_current_evidence';

        return (
          <div key={item.aquariumId} className="rounded-[13px] border border-border bg-white px-3 py-2.5" data-relocation-destination-card={item.aquariumId}>
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

            {sourceScopeBlocked && entrypoint?.status === 'blocked' && (
              <div className="mt-2 rounded-[11px] border border-slate-200 bg-slate-50 px-2.5 py-2 text-[9px] font-bold leading-relaxed text-ink/55" data-relocation-entrypoint-blocked={entrypoint.reason}>
                {entrypointBlockLabel(entrypoint.reason, isEn)}
              </div>
            )}

            {canOpenConfirmation && entrypoint?.status === 'eligible' && (
              <button
                type="button"
                onClick={() => onOpenRelocationConfirmation?.(entrypoint.candidate)}
                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-[11px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-800 transition hover:bg-emerald-100"
                data-open-relocation-confirmation={item.aquariumId}
              >
                <span>{isEn ? 'Open relocation confirmation' : '进入迁移确认'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {canOpenConfirmation && (
              <p className="mt-1.5 text-[9px] font-bold leading-relaxed text-ink/38" data-relocation-opener-not-authorization="true">
                {isEn
                  ? 'This only opens confirmation. The source and destination will be reloaded and re-evaluated again before any move.'
                  : '这里只会进入确认。真正迁移前仍会重新读取源缸/目标缸并重新评估，当前卡片不是执行授权。'}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChoiceCard({
  option,
  destination,
  result,
  sourceAquarium,
  isEn,
  onOpenRelocationConfirmation,
}: {
  option: InterventionChoiceOption;
  destination?: TankDecisionDestinationEvaluation;
  result: TankDecisionSupportResult;
  sourceAquarium?: Aquarium;
  isEn: boolean;
  onOpenRelocationConfirmation?: (candidate: RelocationConfirmationLaunchCandidate) => void;
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
      <DestinationList
        destination={destination}
        option={option}
        result={result}
        sourceAquarium={sourceAquarium}
        isEn={isEn}
        onOpenRelocationConfirmation={onOpenRelocationConfirmation}
      />
    </article>
  );
}

export function InterventionComparisonPanel({
  open,
  result,
  sourceAquarium,
  isEn = false,
  onOpenChange,
  onOpenRelocationConfirmation,
}: InterventionComparisonPanelProps) {
  const graph = result.knownSubsetActionPlan.graph;
  const blockers = graph.edges.filter(edge => edge.outcome === 'blocker');
  const formalChoices = result.formalChoiceComparison?.options || [];
  const nodeNameById = new Map(graph.nodes.map(node => [node.speciesId, node.name]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] w-[95vw] max-w-[760px] flex-col overflow-hidden rounded-[24px] border-border bg-bg p-0" data-intervention-panel-mutation-free="true">
        <DialogHeader className="shrink-0 border-b border-border/70 bg-white px-5 py-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-ink/52"><ShieldAlert className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-[0.14em]">{isEn ? 'Current community intervention' : '当前群落调整比较'}</span></div>
              <DialogTitle className="mt-1 text-xl font-black text-ink">{isEn ? 'What changes would actually reduce current conflicts?' : '哪些调整真的会减少当前冲突？'}</DialogTitle>
              <DialogDescription className="mt-1 text-[12px] font-medium leading-relaxed text-ink/55">{isEn ? 'Each option recomputes the remaining community. Eligible destinations may open a separate confirmation step, but this panel never moves livestock itself.' : '每个方案都会重新计算调整后的剩余群落。符合入口条件的目标缸可以进入独立确认步骤，但这个面板本身不会移动或删除任何生物。'}</DialogDescription>
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
              <div className="mt-3 grid gap-3">
                {formalChoices.map(option => (
                  <ChoiceCard
                    key={option.id}
                    option={option}
                    destination={result.relocationDestinations.find(item => item.subjectSpeciesId === option.subjectSpeciesId)}
                    result={result}
                    sourceAquarium={sourceAquarium}
                    isEn={isEn}
                    onOpenRelocationConfirmation={onOpenRelocationConfirmation}
                  />
                ))}
              </div>
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
