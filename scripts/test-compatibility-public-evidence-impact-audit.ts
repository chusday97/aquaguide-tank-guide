import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const audit = JSON.parse(readFileSync('docs/compatibility_public_evidence_impact_audit.json', 'utf8'));
const decisionAudit = JSON.parse(readFileSync('docs/compatibility_decision_audit.json', 'utf8'));
const summary = audit.summary;

assert.equal(
  summary.attributedPublicEvidencePairs,
  decisionAudit.unknownReasons.public_evidence_insufficient,
  'public-evidence attribution must reconcile exactly to the canonical decision audit',
);
assert.equal(summary.decisionAuditPublicEvidencePairs, decisionAudit.unknownReasons.public_evidence_insufficient);
assert.equal(summary.exactDecisionAuditParity, true);
assert.equal(summary.unattributedPairs, 0, 'every public-evidence UNKNOWN pair must have an explicit hard-fact blocker');
assert.equal(summary.nonTerminalAttributionPairs, 0, 'current public-evidence UNKNOWNs must be backed by source-controlled terminal/domain evidence boundaries');
assert.equal(audit.unattributedPairIds.length, 0);
assert.equal(audit.nonTerminalAttributionPairIds.length, 0);
assert.match(summary.pairIdDigest, /^[a-f0-9]{64}$/, 'compact audit must retain a deterministic digest of the fully validated pair set');
assert.equal(
  summary.singleFactUnlockablePairs + summary.multiFactBlockedPairs,
  summary.attributedPublicEvidencePairs,
);
assert.equal(
  summary.singleSpeciesBlockedPairs + summary.multiSpeciesBlockedPairs,
  summary.attributedPublicEvidencePairs,
);
assert.equal(
  summary.terminalByCurrentEvidenceStrategyPairs,
  summary.attributedPublicEvidencePairs,
  'all attributed public-evidence UNKNOWNs should be terminal under the current evidence strategy',
);
assert.equal(decisionAudit.unknownReasons.system_gap, 0);

const fieldPairTotal = audit.byField.reduce((sum: number, row: { pairCount: number }) => sum + row.pairCount, 0);
assert.ok(fieldPairTotal >= summary.attributedPublicEvidencePairs, 'multi-fact pairs may appear under multiple fields, but field coverage cannot undercount all pairs');
assert.deepEqual(
  audit.byField.map((row: { field: string }) => row.field).sort(),
  ['adult_size', 'temperature', 'water'],
);

console.log('Compatibility public-evidence impact audit PASS:', JSON.stringify({
  pairs: summary.attributedPublicEvidencePairs,
  singleFactUnlockablePairs: summary.singleFactUnlockablePairs,
  multiFactBlockedPairs: summary.multiFactBlockedPairs,
  byField: audit.byField.map((row: { field: string; pairCount: number; singleFactUnlockablePairs: number }) => ({
    field: row.field,
    pairs: row.pairCount,
    singleFactUnlockablePairs: row.singleFactUnlockablePairs,
  })),
  topTargets: audit.topSingleFactUnlockTargets.slice(0, 10).map((row: { speciesId: string; singleFactUnlockablePairs: number }) => ({
    speciesId: row.speciesId,
    singleFactUnlockablePairs: row.singleFactUnlockablePairs,
  })),
}));
