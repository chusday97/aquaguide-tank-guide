import type { Aquarium, Fish } from '../../types';
import type { CurrentTankStateEvidence } from './tank-state-evidence.service';
import {
  listCurrentReviewedDirectConflicts,
  summarizeTankInterventionSequence,
} from './tank-intervention-evidence.service';
import { getExactCatalogDuplicateCanonicalId } from '../../data/catalogDuplicateAliases';

export type CurrentTankRiskItem = {
  group: '容量风险' | '水质参数冲突' | '混养风险' | '信息不足';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  detail: string;
  nextStep: string;
  subjects: Array<{ id: string; name: string; quantity: number }>;
  actionSteps: string[];
  avoidActions: string[];
  primaryAction: 'open_roster' | 'open_settings' | 'open_daily_check';
  primaryLabel: string;
};

export type TankInterventionDecisionSummary = {
  judgment: string;
  reason: string;
  adjustment: string;
  interventionOutcome: CurrentTankStateEvidence['interventionEffects'][number]['outcome'] | 'sequence';
  targetRisk?: {
    category: NonNullable<CurrentTankStateEvidence['interventions'][number]['targetRisk']>['category'];
    label: string;
    reviewedRiskType: string;
  };
  reviewedDirectConflictScope: 'only_current_reviewed_direct_conflict' | 'one_of_multiple_current_reviewed_direct_conflicts' | 'unknown';
  remainingReviewedDirectRisks: Array<{
    speciesIds: [string, string];
    speciesNames: [string, string];
    verdict: 'caution' | 'not_recommended';
    category: NonNullable<CurrentTankStateEvidence['interventions'][number]['targetRisk']>['category'];
    label: string;
    reviewedRiskType: string;
  }>;
};

const stockedSubjects = (aquarium: Aquarium, speciesCatalog: Fish[]) => {
  const byCanonicalId = new Map<string, { id: string; name: string; quantity: number }>();
  aquarium.fishes.forEach(record => {
    const canonicalId = getExactCatalogDuplicateCanonicalId(record.fishId);
    const species = speciesCatalog.find(item => item.id === canonicalId)
      || speciesCatalog.find(item => item.id === record.fishId);
    if (!species) return;
    const existing = byCanonicalId.get(canonicalId);
    const quantity = Math.max(1, record.quantity || 1);
    if (existing) existing.quantity += quantity;
    else byCanonicalId.set(canonicalId, { id: canonicalId, name: species.name, quantity });
  });
  return [...byCanonicalId.values()];
};

const recoveryProgressText = (result: CurrentTankStateEvidence['result']) => {
  const recovery = result.recovery;
  if (!recovery) return null;
  if (recovery.phase === 'confirmed') return `本次异常已完成 ${recovery.confirmations}/${recovery.targetConfirmations} 次恢复确认。`;
  return `恢复确认已完成 ${recovery.confirmations}/${recovery.targetConfirmations} 次，还差 ${recovery.remainingConfirmations} 次。`;
};

const latestInterventionEffect = (evidence: CurrentTankStateEvidence) => (
  [...evidence.interventionEffects]
    .sort((left, right) => Date.parse(right.intervention.performedAt) - Date.parse(left.intervention.performedAt))[0] || null
);

const speciesName = (id: string, speciesCatalog: Fish[]) => speciesCatalog.find(item => item.id === id)?.name || id;

const interventionObjectText = (
  intervention: CurrentTankStateEvidence['interventions'][number],
  speciesCatalog: Fish[],
) => {
  const targets = (intervention.targets || []).map(target => (
    `${speciesName(target.speciesId, speciesCatalog)}${target.quantity ? ` ${target.quantity}只` : ''}`
  ));
  const conflict = (intervention.conflictSpeciesIds || []).map(id => speciesName(id, speciesCatalog));
  const parts = [
    targets.length > 0 ? `对象：${targets.join('、')}` : '',
    conflict.length > 0 ? `关联冲突：${conflict.join(' × ')}${intervention.conflictPairSource === 'reviewed_pair_rule' ? '（依据已审核直接配对规则自动关联）' : ''}` : '',
    intervention.targetRisk ? `针对风险：${intervention.targetRisk.label}` : '',
    intervention.targetRisk ? `已审核原因：${intervention.targetRisk.reason}` : '',
    intervention.recordedReason ? `记录原因：${intervention.recordedReason}` : '',
  ].filter(Boolean);
  return parts.length > 0 ? `${intervention.label}（${parts.join('；')}）` : intervention.label;
};

const reviewedDirectConflictCoverage = (
  evidence: CurrentTankStateEvidence,
  intervention: CurrentTankStateEvidence['interventions'][number],
  speciesCatalog: Fish[],
) => {
  const current = listCurrentReviewedDirectConflicts(evidence.compatibilityDecision);
  const targetIds = intervention.conflictSpeciesIds || [];
  const targetKey = targetIds.length === 2 ? [...targetIds].sort().join('::') : null;
  if (!targetKey || !intervention.targetRisk) {
    return {
      scope: 'unknown' as const,
      remaining: [],
      text: '',
    };
  }
  const remaining = current.filter(item => [...item.speciesIds].sort().join('::') !== targetKey);
  const normalized = remaining.map(item => ({
    speciesIds: item.speciesIds,
    speciesNames: item.speciesIds.map(id => speciesName(id, speciesCatalog)) as [string, string],
    verdict: item.verdict,
    category: item.risk.category,
    label: item.risk.label,
    reviewedRiskType: item.risk.reviewedRiskType,
  }));
  if (remaining.length === 0) {
    return {
      scope: 'only_current_reviewed_direct_conflict' as const,
      remaining: normalized,
      text: '当前没有发现另一组独立的高置信已审核直接配对冲突；这仍不等于整缸不存在其他推导风险、参数风险或未来复发。',
    };
  }
  const labels = normalized.map(item => `${item.speciesNames.join(' × ')}（${item.label}）`).join('；');
  return {
    scope: 'one_of_multiple_current_reviewed_direct_conflicts' as const,
    remaining: normalized,
    text: `这次措施只覆盖当前一部分已审核直接冲突；整缸仍有 ${remaining.length} 组独立风险未覆盖：${labels}。`,
  };
};

export const buildTankInterventionDecisionSummary = (
  evidence: CurrentTankStateEvidence,
  speciesCatalog: Fish[],
): TankInterventionDecisionSummary | null => {
  const sequence = summarizeTankInterventionSequence(evidence.interventionEffects);
  const latest = latestInterventionEffect(evidence);
  if (!latest) return null;
  const risk = latest.intervention.targetRisk;
  const riskReason = risk ? `针对「${risk.label}」的已审核依据：${risk.reason}` : '';
  const reviewedMitigation = risk?.mitigation?.[0] ? `已审核调整建议：${risk.mitigation[0]}` : '';
  const coverage = reviewedDirectConflictCoverage(evidence, latest.intervention, speciesCatalog);

  if (sequence) {
    const baseJudgment = sequence.pattern === 'escalated_then_improved'
      ? '前一措施未控制，后续措施后伴随改善'
      : sequence.pattern === 'relapsed_after_improvement'
        ? '曾改善后复发'
        : '连续多个措施仍未控制住问题';
    const judgment = coverage.scope === 'one_of_multiple_current_reviewed_direct_conflicts'
      ? `${baseJudgment}，但整缸仍有其他已审核直接冲突`
      : baseJudgment;
    return {
      judgment,
      reason: [sequence.summary, riskReason, coverage.text].filter(Boolean).join(' '),
      adjustment: [sequence.nextStep, reviewedMitigation, coverage.scope === 'one_of_multiple_current_reviewed_direct_conflicts' ? '继续逐项处理剩余 reviewed direct 冲突，不要把局部改善当成整缸安全。' : ''].filter(Boolean).join(' '),
      interventionOutcome: 'sequence',
      targetRisk: risk ? { category: risk.category, label: risk.label, reviewedRiskType: risk.reviewedRiskType } : undefined,
      reviewedDirectConflictScope: coverage.scope,
      remainingReviewedDirectRisks: coverage.remaining,
    };
  }

  const baseJudgment = latest.outcome === 'improved_after_action'
    ? '措施后伴随改善'
    : latest.outcome === 'problem_persisted_after_action'
      ? '措施后问题仍持续'
      : latest.outcome === 'mixed_after_action'
        ? '措施后结果混合'
        : '措施效果证据不足';
  const judgment = latest.outcome === 'improved_after_action'
    && coverage.scope === 'one_of_multiple_current_reviewed_direct_conflicts'
    ? '目标风险措施后伴随改善，但整缸仍有其他已审核直接冲突'
    : baseJudgment;
  const adjustment = latest.outcome === 'improved_after_action'
    ? `暂时保留「${interventionObjectText(latest.intervention, speciesCatalog)}」，继续结构化复查；异常复发时重新升级处理。`
    : latest.outcome === 'problem_persisted_after_action'
      ? `不要继续只依赖「${interventionObjectText(latest.intervention, speciesCatalog)}」；重新核对异常并升级处理。`
      : latest.outcome === 'mixed_after_action'
        ? '保持其他条件尽量稳定并继续复查，当前不要把该措施视为已经稳定解决问题。'
        : '先补足至少 2 次与措施对象相关的结构化复查，再评价措施效果。';
  return {
    judgment,
    reason: [latest.summary, riskReason, coverage.text].filter(Boolean).join(' '),
    adjustment: [adjustment, reviewedMitigation, coverage.scope === 'one_of_multiple_current_reviewed_direct_conflicts' ? '继续逐项处理剩余 reviewed direct 冲突，不要把局部改善当成整缸安全。' : ''].filter(Boolean).join(' '),
    interventionOutcome: latest.outcome,
    targetRisk: risk ? { category: risk.category, label: risk.label, reviewedRiskType: risk.reviewedRiskType } : undefined,
    reviewedDirectConflictScope: coverage.scope,
    remainingReviewedDirectRisks: coverage.remaining,
  };
};

const interventionEffectGuidance = (evidence: CurrentTankStateEvidence, speciesCatalog: Fish[]) => {
  const summary = buildTankInterventionDecisionSummary(evidence, speciesCatalog);
  if (!summary) return null;
  return {
    text: `措施判断：${summary.judgment}。${summary.reason}`,
    next: summary.adjustment,
  };
};

export const getCurrentTankRiskLevel = (evidence: CurrentTankStateEvidence | null) => {
  const state = evidence?.result.state;
  if (state === 'urgent') return 'high' as const;
  if (state === 'intervene') return 'medium' as const;
  if (state === 'watch') return 'low' as const;
  return 'none_recorded' as const;
};

export const getCurrentTankRiskCount = (evidence: CurrentTankStateEvidence | null) => (
  ['urgent', 'intervene', 'watch'].includes(evidence?.result.state || '') ? 1 : 0
);

export const buildCurrentTankRiskItems = ({
  aquarium,
  speciesCatalog,
  evidence,
}: {
  aquarium: Aquarium;
  speciesCatalog: Fish[];
  evidence: CurrentTankStateEvidence | null;
}): CurrentTankRiskItem[] => {
  if (!evidence) return [];
  const { result, hardConstraints } = evidence;
  const subjects = stockedSubjects(aquarium, speciesCatalog);
  const interventionGuidance = interventionEffectGuidance(evidence, speciesCatalog);

  if (hardConstraints.length > 0) {
    const hasWaterTypeConflict = hardConstraints.some(item => ['water_type_mismatch', 'species_water_type_conflict'].includes(item.code));
    return [{
      group: '水质参数冲突',
      severity: 'danger',
      title: hasWaterTypeConflict ? '当前存在不可折中的水体条件冲突' : '当前水温条件无法同时满足缸内物种',
      detail: result.reasons[0] || result.summary,
      nextStep: hasWaterTypeConflict
        ? '优先把互斥水体需求拆分到不同稳定环境。'
        : '不要靠折中水温长期硬混；优先调整组合，或把适温区间不重叠的物种分到独立稳定环境。',
      subjects,
      actionSteps: hasWaterTypeConflict
        ? ['停止继续加入生物。', '确认哪些生物需要淡水、海水等互斥条件。', '准备稳定环境后再完成分缸，并更新缸内记录。']
        : ['停止继续加入生物。', '核对各物种已审核适温区间与当前目标水温。', '优先调整物种组合或分缸，不要用单一折中温度长期硬撑。'],
      avoidActions: hasWaterTypeConflict
        ? ['不要用同一水体折中互斥条件', '不要快速来回调整盐度或其他关键参数', '不要放生']
        : ['不要突然大幅升降温', '不要用一次“看起来正常”覆盖长期温度冲突', '不要放生'],
      primaryAction: 'open_roster',
      primaryLabel: '查看缸内生物',
    }];
  }

  if (result.state === 'urgent') {
    const respiratory = result.activeSignals.includes('respiratory_distress');
    const deaths = result.activeSignals.includes('multiple_deaths');
    const severeInjury = result.activeSignals.includes('severe_injury');
    return [{
      group: '混养风险',
      severity: 'danger',
      title: respiratory ? '出现呼吸急促 / 浮头，先处理供氧与水质' : deaths ? '出现连续或多只死亡，立即停止继续加鱼' : severeInjury ? '出现严重受伤，需要立即隔离并稳定环境' : '当前观察到需要优先处理的异常',
      detail: result.reasons[0] || result.summary,
      nextStep: `${respiratory
        ? '先提高水面扰动和供氧，并立即检查过滤、水温和关键水质；不要先把问题归因于混养。'
        : deaths
          ? '暂停新增和非必要操作，先核对水温、过滤、供氧与关键水质，再判断是否同时存在混养冲突。'
          : severeInjury
            ? '先把持续受攻击或严重受伤个体稳定隔离，再检查伤情和冲突来源。'
            : '先处理当前异常，再根据复查结果决定是否调整组合。'}${result.recovery && result.recovery.confirmations > 0 ? ` ${recoveryProgressText(result)}` : ''}${interventionGuidance ? ` ${interventionGuidance.text} ${interventionGuidance.next}` : ''}`,
      subjects,
      actionSteps: respiratory
        ? ['立即加强曝气或水面扰动，并确认过滤仍在正常运行。', '检查水温及可用的氨/亚硝酸盐等关键水质信息。', '在呼吸恢复前暂停继续加鱼，并记录 30–60 分钟后的变化。']
        : deaths
          ? ['立即停止继续加入生物和非必要的大幅调整。', '检查过滤、供氧、水温和关键水质，并记录死亡时间与受影响物种。', '若仍持续死亡，优先保全未受影响个体并继续排查共同环境原因。']
          : severeInjury
            ? ['先隔离持续受攻击或严重受伤个体到稳定环境。', '检查伤口、鳍条、游姿和呼吸，并减少继续追咬机会。', '稳定后再判断是否需要永久分缸或调整组合。']
            : ['先按当前异常的确定性处理建议行动。', '记录处理后的呼吸、活动、进食或伤情变化。', '异常未缓解时继续复查，不要只依据物种标签做决定。'],
      avoidActions: ['不要把理论混养风险当成唯一病因', '不要无证据盲目下药', '不要在未准备稳定环境时仓促转移全部生物'],
      primaryAction: 'open_daily_check',
      primaryLabel: '查看当前检查',
    }];
  }

  if (result.state === 'intervene') {
    const injury = result.activeSignals.includes('injury');
    const behaviorPressure = result.activeSignals.includes('persistent_chasing')
      && (result.activeSignals.includes('hiding_pressure') || result.activeSignals.includes('feeding_exclusion'));
    return [{
      group: '混养风险',
      severity: 'danger',
      title: injury ? '已经出现受伤，当前组合需要调整' : behaviorPressure ? '追咬已造成持续压力，当前组合需要调整' : '当前异常已支持进行调整',
      detail: result.reasons[0] || result.summary,
      nextStep: `${injury
        ? '先阻断继续受伤：确认攻击者和受伤个体，必要时立即隔离；稳定后再决定是否永久分缸。'
        : '先降低追咬压力：确认攻击者与受压个体，增加有效遮挡；仍持续时改为稳定隔离或分缸。'}${result.recovery && result.recovery.confirmations > 0 ? ` ${recoveryProgressText(result)}` : ''}${interventionGuidance ? ` ${interventionGuidance.text} ${interventionGuidance.next}` : ''}`,
      subjects,
      actionSteps: injury
        ? ['确认攻击者、受伤个体和伤情是否仍在加重。', '若仍持续追咬，先做稳定隔离；同时维持清洁、稳定水质并观察伤口。', '停止新增生物，待 2–3 次复查无继续受伤后再评估组合。']
        : ['确认攻击者、被追逐个体以及冲突发生的区域和频率。', '增加有效躲避和视线遮挡；若仍持续追咬或影响进食，进行稳定隔离或分缸。', '调整后连续记录 2–3 次观察，确认追咬、躲藏和进食是否恢复。'],
      avoidActions: ['不要仅因为 Aggressive 标签直接移鱼', '不要把增加过滤当成领地冲突的解决方案', '不要放生'],
      primaryAction: 'open_roster',
      primaryLabel: '查看缸内生物',
    }];
  }

  if (result.state === 'watch') {
    const recovering = result.matchedRules.includes('AQ-STATE-010');
    const needsRecheck = result.matchedRules.includes('AQ-STATE-011');
    const recoveryConfirmedButPriorRemains = result.recovery?.phase === 'confirmed'
      && result.matchedRules.includes('AQ-STATE-009');
    const confirmingRecovery = result.recovery?.phase === 'confirming';
    return [{
      group: '混养风险',
      severity: 'warning',
      title: recoveryConfirmedButPriorRemains
        ? '本次异常已恢复，但组合本身仍需观察'
        : recovering
          ? '异常已有缓解，继续完成恢复确认'
          : needsRecheck
            ? '之前有重复异常，先确认现在是否仍在发生'
            : confirmingRecovery
              ? '当前异常尚未形成持续证据，继续确认'
              : '当前建议继续观察',
      detail: result.summary,
      nextStep: recoveryConfirmedButPriorRemains
        ? `${recoveryProgressText(result)} 这只代表本次异常已经恢复；由于组合仍有已审核的高风险背景，继续观察，不等于混养风险消失。${interventionGuidance ? ` ${interventionGuidance.text} ${interventionGuidance.next}` : ''}`
        : recovering
          ? `${recoveryProgressText(result)} 保持当前已经奏效的调整；完成下一次正常复查后再判断是否结束本次恢复观察。若异常再次出现，立即重新升级处理。${interventionGuidance ? ` ${interventionGuidance.text} ${interventionGuidance.next}` : ''}`
          : needsRecheck
            ? `完成一次当前状态复查；只有确认追咬、躲藏或摄食压力仍在持续时，才重新升级到干预。${interventionGuidance ? ` ${interventionGuidance.text} ${interventionGuidance.next}` : ''}`
            : confirmingRecovery
              ? `${recoveryProgressText(result)} 在达到当前确认门槛前，不把这次异常视为已经恢复。${interventionGuidance ? ` ${interventionGuidance.text} ${interventionGuidance.next}` : ''}`
              : `${result.observationTargets.length > 0 ? `重点观察：${result.observationTargets.slice(0, 3).join('、')}。` : '补充一次当前鱼缸检查，再决定是否需要调整。'}${interventionGuidance ? ` ${interventionGuidance.text} ${interventionGuidance.next}` : ''}`,
      subjects,
      actionSteps: recovering
        ? ['不要因为一次恢复正常就立即撤销已经奏效的隔离、遮挡或供氧调整。', '继续记录呼吸、追逐、躲藏、进食和伤情是否保持正常。', '如果相同异常再次出现，按当前异常级别重新处理。']
        : needsRecheck
          ? ['记录当前是否仍有持续追逐、躲藏、摄食受压或新伤。', '若当前没有异常，继续完成后续复查，不把 1–2 周前的事件当成当前冲突。', '若异常复发，按最新结构化观察重新升级处理。']
          : ['完成一次当前状态检查。', '记录追逐、躲藏、摄食和伤情是否真实发生。', '只有异常持续或相互印证时再升级处理。'],
      avoidActions: recovering
        ? ['不要把一次正常复查当成永久恢复', '不要立即重新增加生物或撤掉必要隔离', '不要忽略原有静态混养风险']
        : needsRecheck
          ? ['不要因为旧记录继续无限期保持红色干预', '不要把没有近期证据当成已经恢复', '不要忽略静态高风险配对']
          : ['不要把理论风险直接当成当前冲突', '不要仅因推荐缸容差距立即移鱼或换缸', '不要制造没有观察依据的精确负载结论'],
      primaryAction: 'open_daily_check',
      primaryLabel: '记录当前状态',
    }];
  }

  return [];
};
