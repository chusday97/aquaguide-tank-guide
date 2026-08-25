import type { TankCompatibilityResult, TankCompatibilityRule } from '../../lib/tankCompatibilityEngine';

export type CompatibilityEvidenceStatus = 'reviewed' | 'mixed' | 'pending';

export type CompatibilityEvidenceItem = {
  code: string;
  label: string;
  text: string;
  status: 'ok' | 'warning' | 'danger' | 'info';
  reviewStatus: TankCompatibilityRule['reviewStatus'];
  confidence: TankCompatibilityRule['confidence'];
  citationCount: number;
};

export type CompatibilityEvidencePresentation = {
  items: CompatibilityEvidenceItem[];
  sourceStatus: CompatibilityEvidenceStatus;
  reviewedCount: number;
  pendingCount: number;
  citationCount: number;
};

const ruleGroups: Array<{ rules: keyof Pick<TankCompatibilityResult, 'blockingRules' | 'warningRules' | 'missingData' | 'passedRules'>; status: CompatibilityEvidenceItem['status'] }> = [
  { rules: 'blockingRules', status: 'danger' },
  { rules: 'warningRules', status: 'warning' },
  { rules: 'missingData', status: 'info' },
  { rules: 'passedRules', status: 'ok' },
];

const uniqueRules = (rules: TankCompatibilityRule[]) => {
  const seen = new Set<string>();
  return rules.filter(rule => {
    const key = `${rule.code}::${rule.title}::${rule.evidence}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Adapts the compatibility engine's structured result for detail-page display.
 * The component may format these items, but must not derive a verdict from
 * species free text or from environment metric heuristics.
 */
export const buildCompatibilityEvidencePresentation = (
  result: TankCompatibilityResult | null | undefined,
  limit = 3,
): CompatibilityEvidencePresentation => {
  if (!result) {
    return { items: [], sourceStatus: 'pending', reviewedCount: 0, pendingCount: 0, citationCount: 0 };
  }

  const rules = uniqueRules(ruleGroups.flatMap(group => result[group.rules]));
  const displayRules = rules.filter(rule => rule.reviewStatus !== 'rejected');
  const items = displayRules.map((rule, index) => ({
    code: rule.code,
    label: rule.title,
    text: rule.evidence || rule.title,
    status: ruleGroups.find(group => result[group.rules].includes(rule))?.status || 'info',
    reviewStatus: rule.reviewStatus,
    confidence: rule.confidence,
    citationCount: rule.citations.length,
    order: index,
  }))
    .sort((a, b) => a.order - b.order)
    .slice(0, Math.max(0, limit))
    .map(({ order: _order, ...item }) => item);

  const reviewedCount = rules.filter(rule => rule.reviewStatus === 'reviewed').length;
  const pendingCount = rules.length - reviewedCount;
  const sourceStatus: CompatibilityEvidenceStatus = rules.length === 0 || pendingCount === rules.length
    ? 'pending'
    : pendingCount > 0
      ? 'mixed'
      : 'reviewed';

  return {
    items,
    sourceStatus,
    reviewedCount,
    pendingCount,
    citationCount: displayRules.reduce((count, rule) => count + rule.citations.length, 0),
  };
};
