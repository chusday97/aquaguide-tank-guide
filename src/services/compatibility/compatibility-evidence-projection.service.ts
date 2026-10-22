import type { EvidenceSourceDto } from '../../../packages/contracts/src';
import type { CompatibilityDecision } from '../../modules/knowledge/knowledge.types';
import type { TankCompatibilityRule } from '../../lib/tankCompatibilityEngine';
import type { CompatibilityAssessmentMode } from './compatibility-action.service';
import { buildCompatibilityDeterministicReasonEntries } from './compatibility-readable-copy.service';

export type CompatibilityGroundedEvidenceItem = {
  text: string;
  ruleCodes: string[];
  citations?: EvidenceSourceDto[];
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

export const alignCompatibilityGroundedReasonsToMain = (
  mainReasons: string[],
  items: CompatibilityGroundedEvidenceItem[],
  limit = 3,
): CompatibilityGroundedEvidenceItem[] | null => {
  const used = new Set<number>();
  const aligned: CompatibilityGroundedEvidenceItem[] = [];
  for (const reason of mainReasons) {
    const normalized = reason.trim();
    const index = items.findIndex((item, itemIndex) => (
      !used.has(itemIndex) && item.text.trim() === normalized
    ));
    if (index < 0) return null;
    used.add(index);
    aligned.push(items[index]);
  }
  for (let index = 0; index < items.length && aligned.length < limit; index += 1) {
    if (used.has(index)) continue;
    aligned.push(items[index]);
  }
  return aligned.slice(0, limit);
};

export const buildDeterministicCompatibilityEvidenceReasons = (
  decision: CompatibilityDecision,
  limit = 3,
  assessmentMode: CompatibilityAssessmentMode = 'planned_addition',
): CompatibilityGroundedEvidenceItem[] => (
  buildCompatibilityDeterministicReasonEntries(decision, assessmentMode)
    .map(entry => ({
      text: entry.text,
      ruleCodes: entry.ruleCodes,
      citations: reviewedCitationsForCodes(decision, entry.ruleCodes),
    }))
    .filter(item => item.text.trim())
    .slice(0, limit)
);
