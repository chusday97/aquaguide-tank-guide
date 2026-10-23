import type { CompatibilityDecision, PairCompatibilityResult } from '../../modules/knowledge/knowledge.types';
import {
  trackSessionEvent,
  type AnalyticsCompatibilityBadcaseKind,
  type AnalyticsCompatibilityUnknownReason,
} from '../analytics/session-events.service';
import { getCompatibilityDataLimitationReason } from './compatibility-decision-plan.service';

export type CompatibilityBadcaseObservation = {
  kind: AnalyticsCompatibilityBadcaseKind;
  count: number;
  status: CompatibilityDecision['status'];
  unknownReason?: AnalyticsCompatibilityUnknownReason;
  pairKey?: string;
};

const kindForUnknownReason = (
  reason: AnalyticsCompatibilityUnknownReason,
): AnalyticsCompatibilityBadcaseKind => {
  if (reason === 'unresolved_identity') return 'identity_resolution_failed';
  if (reason === 'public_evidence_insufficient' || reason === 'missing_species_fact') return 'evidence_gap';
  if (reason === 'missing_user_input') return 'user_input_gap';
  return 'system_gap';
};

const dispositionCodeSets = (pair: PairCompatibilityResult) => [
  new Set(pair.rawResult.passedRules.map(rule => rule.code)),
  new Set(pair.rawResult.warningRules.map(rule => rule.code)),
  new Set(pair.rawResult.blockingRules.map(rule => rule.code)),
  new Set(pair.rawResult.missingData.map(rule => rule.code)),
];

const hasRuleDispositionConflict = (pair: PairCompatibilityResult) => {
  const seen = new Set<string>();
  for (const codes of dispositionCodeSets(pair)) {
    for (const code of codes) {
      if (seen.has(code)) return true;
      seen.add(code);
    }
  }
  return false;
};

const canonicalPairKey = (pair: PairCompatibilityResult) => (
  [pair.speciesA.id, pair.speciesB.id].sort().join('__')
);

export const buildCompatibilityBadcaseObservations = (
  decision: CompatibilityDecision,
): CompatibilityBadcaseObservation[] => {
  const grouped = new Map<string, CompatibilityBadcaseObservation & { pairKeys: Set<string> }>();

  const add = (
    kind: AnalyticsCompatibilityBadcaseKind,
    pair: PairCompatibilityResult | null,
    unknownReason?: AnalyticsCompatibilityUnknownReason,
  ) => {
    const key = `${kind}:${unknownReason || ''}`;
    const pairKey = pair ? canonicalPairKey(pair) : undefined;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
      if (pairKey) existing.pairKeys.add(pairKey);
      return;
    }
    grouped.set(key, {
      kind,
      count: 1,
      status: pair?.status || decision.status,
      unknownReason,
      pairKey,
      pairKeys: new Set(pairKey ? [pairKey] : []),
    });
  };

  for (const pair of decision.pairResults) {
    const unknownReason = getCompatibilityDataLimitationReason(pair.rawResult) || undefined;
    if (unknownReason) add(kindForUnknownReason(unknownReason), pair, unknownReason);
    if (hasRuleDispositionConflict(pair)) add('rule_conflict', pair);
  }

  if (decision.pairResults.length === 0 && decision.status === 'insufficient_data') {
    const unknownReason = getCompatibilityDataLimitationReason(decision.aggregateResult) || 'system_gap';
    add(kindForUnknownReason(unknownReason), null, unknownReason);
  }

  return [...grouped.values()]
    .map(({ pairKeys, ...observation }) => ({
      ...observation,
      pairKey: pairKeys.size === 1 ? [...pairKeys][0] : undefined,
    }))
    .sort((left, right) => left.kind.localeCompare(right.kind));
};

export const trackCompatibilityBadcases = (decision: CompatibilityDecision) => {
  const observations = buildCompatibilityBadcaseObservations(decision);
  observations.forEach(observation => {
    trackSessionEvent('compatibility_badcase_observed', {
      action: 'observe_badcase',
      status: observation.status,
      entry: 'full_compatibility',
      source: 'rules',
      pairKey: observation.pairKey,
      unknownReason: observation.unknownReason,
      badcaseKind: observation.kind,
      badcaseCount: observation.count,
    });
  });
  return observations;
};

export const trackCompatibilityRuntimeBadcase = (input: {
  kind: Extract<AnalyticsCompatibilityBadcaseKind, 'cloud_fallback' | 'authority_clamp'>;
  status: CompatibilityDecision['status'];
  failureReason: 'repository_mode_unavailable' | 'remote_assessment_unavailable' | 'remote_assessment_rejected';
}) => trackSessionEvent('compatibility_badcase_observed', {
  action: 'observe_runtime_badcase',
  status: input.status,
  entry: 'compatibility_assessment',
  source: 'fallback',
  failureReason: input.failureReason,
  badcaseKind: input.kind,
  badcaseCount: 1,
});
