import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { CompatibilityDecision, PairCompatibilityResult } from '../src/modules/knowledge/knowledge.types';
import {
  buildCompatibilityBadcaseObservations,
  trackCompatibilityBadcases,
  trackCompatibilityRuntimeBadcase,
} from '../src/services/compatibility/compatibility-observability.service';
import { getSessionEvents, resetSessionEvents } from '../src/services/analytics/session-events.service';

const rawResult = (
  status: 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data',
  options: {
    passed?: string[];
    warning?: string[];
    blocking?: string[];
    missing?: string[];
  } = {},
) => ({
  status,
  riskLevel: status === 'not_recommended' ? 'high' : status === 'insufficient_data' ? 'unknown' : 'medium',
  summary: 'fixture',
  passedRules: (options.passed || []).map(code => ({ code })),
  warningRules: (options.warning || []).map(code => ({ code })),
  blockingRules: (options.blocking || []).map(code => ({ code })),
  missingData: (options.missing || []).map(code => ({ code })),
  suggestions: [],
  metadata: {
    ruleVersion: 'test',
    speciesDataVersion: 'test',
    calculatedAt: '2026-10-23T00:00:00.000Z',
    scope: 'tank',
    intent: 'planned_addition',
    catalogVersion: 'test',
    domainRuleCodes: [
      ...(options.passed || []),
      ...(options.warning || []),
      ...(options.blocking || []),
      ...(options.missing || []),
    ],
    domainStatus: status,
    decisionReadiness: status === 'insufficient_data' ? 'insufficient' : 'reviewed',
    authorityVersion: 'test',
  },
}) as any;

const pair = (
  left: string,
  right: string,
  status: 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data',
  raw: ReturnType<typeof rawResult>,
): PairCompatibilityResult => ({
  pairId: `${left}__${right}`,
  speciesA: { id: left, name: left } as any,
  speciesB: { id: right, name: right } as any,
  quantityA: 1,
  quantityB: 1,
  status,
  secondaryReasons: [],
  passedRelationships: [],
  rawResult: raw,
  adjustable: false,
  actions: [],
});

const unresolvedA = pair(
  'sp_0001',
  'sp_0002',
  'insufficient_data',
  rawResult('insufficient_data', { missing: ['species_identity_unresolved'] }),
);
const unresolvedB = pair(
  'sp_0003',
  'sp_0004',
  'insufficient_data',
  rawResult('insufficient_data', { missing: ['species_identity_unresolved'] }),
);
const evidenceGap = pair(
  'sp_0005',
  'sp_0006',
  'caution',
  rawResult('caution', { warning: ['species_public_evidence_insufficient'] }),
);
const dispositionConflict = pair(
  'sp_0007',
  'sp_0008',
  'caution',
  rawResult('caution', {
    warning: ['synthetic_rule_conflict'],
    missing: ['synthetic_rule_conflict'],
  }),
);

const pairResults = [unresolvedA, unresolvedB, evidenceGap, dispositionConflict];
const aggregateResult = rawResult('insufficient_data', { missing: ['species_identity_unresolved'] });
const decision = {
  status: 'insufficient_data',
  riskLevel: 'unknown',
  summary: 'fixture',
  pairResults,
  blockedReasons: [],
  adjustableReasons: [],
  missingInformation: [],
  passedRules: [],
  warningRules: [],
  blockingRules: [],
  missingData: aggregateResult.missingData,
  suggestions: [],
  aggregateResult,
  metadata: aggregateResult.metadata,
} as CompatibilityDecision;

const observations = buildCompatibilityBadcaseObservations(decision);
const byKind = new Map(observations.map(item => [item.kind, item] as const));
assert.equal(byKind.get('identity_resolution_failed')?.count, 2);
assert.equal(byKind.get('identity_resolution_failed')?.pairKey, undefined, 'multi-pair badcases must aggregate without high-cardinality pair keys');
assert.equal(byKind.get('evidence_gap')?.count, 1);
assert.equal(byKind.get('evidence_gap')?.pairKey, 'sp_0005__sp_0006');
assert.equal(byKind.get('rule_conflict')?.count, 1);

resetSessionEvents();
trackCompatibilityBadcases(decision);
let badcaseEvents = getSessionEvents().filter(event => event.name === 'compatibility_badcase_observed');
assert.equal(badcaseEvents.length, 4, 'bad pairs must collapse by category rather than emit one event per pair');
assert.equal(badcaseEvents.some(event => event.badcaseKind === 'identity_resolution_failed' && event.badcaseCount === 2), true);
assert.equal(badcaseEvents.some(event => event.badcaseKind === 'system_gap'), true);
assert.equal(badcaseEvents.some(event => event.badcaseKind === 'rule_conflict'), true);

trackCompatibilityRuntimeBadcase({
  kind: 'cloud_fallback',
  status: 'caution',
  failureReason: 'remote_assessment_unavailable',
});
trackCompatibilityRuntimeBadcase({
  kind: 'authority_clamp',
  status: 'not_recommended',
  failureReason: 'remote_assessment_rejected',
});
badcaseEvents = getSessionEvents().filter(event => event.name === 'compatibility_badcase_observed');
assert.equal(badcaseEvents.length, 6);
assert.equal(badcaseEvents.some(event => event.badcaseKind === 'cloud_fallback'), true);
assert.equal(badcaseEvents.some(event => event.badcaseKind === 'authority_clamp'), true);

const calculatorSource = readFileSync('src/components/CompatibilityRiskCalculator.tsx', 'utf8');
assert.equal(
  calculatorSource.includes("trackSessionEvent('compatibility_pair_evaluated'"),
  false,
  'the calculator must not emit one analytics event per normal pair',
);
assert.equal(
  calculatorSource.includes('trackCompatibilityBadcases(result.decision)'),
  true,
  'the calculator must emit bounded aggregated badcases instead',
);

console.log('Compatibility observability PASS: pair telemetry is anomaly-only and category-aggregated; cloud fallback and authority clamp are explicitly observable.');
