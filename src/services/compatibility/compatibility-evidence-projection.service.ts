import type { EvidenceSourceDto } from '../../../packages/contracts/src';
import type { CompatibilityDecision } from '../../modules/knowledge/knowledge.types';
import type { TankCompatibilityRule } from '../../lib/tankCompatibilityEngine';
import { prioritizeDistinctCompatibilityRules } from './compatibility-action.service';

export type CompatibilityGroundedEvidenceItem = {
  text: string;
  ruleCodes: string[];
  citations?: EvidenceSourceDto[];
};

const relevantRules = (decision: CompatibilityDecision): TankCompatibilityRule[] => {
  if (decision.status === 'not_recommended') return decision.blockingRules;
  if (decision.status === 'caution') return [...decision.warningRules, ...decision.missingData];
  if (decision.status === 'insufficient_data') return decision.missingData;
  return decision.passedRules;
};

const allRules = (decision: CompatibilityDecision): TankCompatibilityRule[] => [
  ...decision.blockingRules,
  ...decision.warningRules,
  ...decision.missingData,
  ...decision.passedRules,
];

const reviewedCitationsForCodes = (
  decision: CompatibilityDecision,
  ruleCodes: string[],
): EvidenceSourceDto[] => {
  const wanted = new Set(ruleCodes);
  const seen = new Set<string>();
  const citations: EvidenceSourceDto[] = [];
  for (const rule of allRules(decision)) {
    if (!wanted.has(rule.code)) continue;
    for (const citation of rule.citations || []) {
      if (citation.reviewStatus !== 'reviewed' || seen.has(citation.id)) continue;
      seen.add(citation.id);
      citations.push(citation);
    }
  }
  return citations;
};

export const enrichCompatibilityGroundedItemsWithCitations = (
  decision: CompatibilityDecision,
  items: CompatibilityGroundedEvidenceItem[],
): CompatibilityGroundedEvidenceItem[] => (
  items.map(item => ({
    ...item,
    citations: reviewedCitationsForCodes(decision, item.ruleCodes),
  }))
);

export const buildDeterministicCompatibilityEvidenceReasons = (
  decision: CompatibilityDecision,
  limit = 3,
): CompatibilityGroundedEvidenceItem[] => (
  prioritizeDistinctCompatibilityRules(relevantRules(decision))
    .map(rule => ({
      text: rule.evidence || rule.title,
      ruleCodes: [rule.code],
      citations: reviewedCitationsForCodes(decision, [rule.code]),
    }))
    .filter(item => item.text.trim())
    .slice(0, limit)
);
