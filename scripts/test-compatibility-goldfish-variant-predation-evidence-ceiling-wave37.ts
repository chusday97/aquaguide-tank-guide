import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import {
  compatibilityGoldfishVariantPredationEvidenceCeilingsWave37,
  getKnowledgeEvidenceCeiling,
} from '../src/data/knowledgeEvidenceCeilings';
import { buildReviewedCompatibilityProfileFromCatalogFields } from '../src/data/compatibilityEvidence';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import {
  buildCompatibilityVariantActionableResearchQueue,
  buildCompatibilityVariantExactEvidenceQueue,
} from '../src/services/compatibility/variant-exact-evidence-queue.service';
import { getCompatibilityDataLimitationReason } from '../src/services/compatibility/compatibility-decision-plan.service';
import type { Aquarium } from '../src/types';

const expected = new Map<string, string>([
  ['sp_0063', 'batch26-fishbase-carassius-auratus-ranchu'],
  ['sp_0149', 'batch27-fishbase-carassius-auratus-panda'],
  ['sp_0180', 'batch28-fishbase-carassius-auratus-telescope'],
  ['sp_0348', 'batch30-fishbase-carassius-auratus-tigerhead'],
  ['sp_0349', 'batch30-fishbase-carassius-auratus-calico-ranchu'],
  ['sp_0351', 'batch30-fishbase-carassius-auratus-butterfly-tail'],
  ['sp_0386', 'batch30-fishbase-carassius-auratus-black-moor'],
]);

assert.equal(compatibilityGoldfishVariantPredationEvidenceCeilingsWave37.length, expected.size);

const coverage = buildCompatibilityCoreFieldCoverage();
for (const [speciesId, sourceId] of expected) {
  const ceiling = getKnowledgeEvidenceCeiling(speciesId, 'predation');
  assert.equal(ceiling?.code, 'species_fish_predation_not_established');
  assert.equal(ceiling?.researchDisposition, 'terminal_unknown_hold');
  assert.ok(ceiling?.sourceIds.includes(sourceId), `${speciesId} must retain reviewed exact-object provenance`);
  assert.equal(resolveKnowledgeSources(ceiling?.sourceIds ?? []).length, ceiling?.sourceIds.length, `${speciesId} ceiling provenance must resolve`);

  const row = coverage.rows.find(item => item.speciesId === speciesId);
  assert.equal(row?.fields.predation.status, 'reviewed_unknown');
  assert.equal(row?.fields.predation.disposition, 'terminal_hold');
  assert.equal(row?.fields.predation.authoritySource, 'evidence_ceiling');
  assert.equal(row?.fields.predation.reasonCode, 'species_fish_predation_not_established');
  assert.equal(coverage.backlog.some(item => item.speciesId === speciesId && item.field === 'predation'), false);
  assert.equal(row?.genericOnboardingReady, false);
  assert.equal(buildReviewedCompatibilityProfileFromCatalogFields(speciesId), undefined, `${speciesId} terminal predation ceiling must not fabricate an 8/8 profile`);
}

const ledger = buildCompatibilityVariantExactEvidenceQueue();
const actionable = buildCompatibilityVariantActionableResearchQueue();
assert.equal(ledger.items.filter(item => expected.has(item.speciesId) && item.field === 'predation').length, 7);
assert.equal(actionable.items.filter(item => expected.has(item.speciesId) && item.field === 'predation').length, 0);
assert.equal(actionable.summary.totalResearchSlots, 0);
assert.equal(actionable.summary.auditLedgerSlots, ledger.items.length);
assert.equal(actionable.summary.excludedNonActionableSlots, ledger.items.length);

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, `missing catalog fish ${id}`);
  return fish;
};
const tank: Aquarium = {
  id: 'goldfish-predation-ceiling-badcase',
  name: 'Goldfish predation ceiling badcase',
  fishes: [],
  dimensions: { length: '300', width: '100', height: '80' },
  waterType: 'Freshwater',
  targetTemperature: '22',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

for (const speciesId of expected.keys()) {
  const decision = evaluateCompatibilityDecision({
    tank,
    items: [
      { species: byId('sp_0010'), quantity: 6, origin: 'existing' },
      { species: byId(speciesId), quantity: 1, origin: 'candidate' },
    ],
  });
  assert.notEqual(
    decision.metadata.decisionReadiness === 'reviewed' && decision.status === 'compatible',
    true,
    `${speciesId} must not become reviewed-compatible while exact-variant predation scope is unestablished`,
  );
  assert.ok(
    decision.metadata.domainRuleCodes.includes('species_evidence_ceiling')
      || decision.metadata.domainRuleCodes.includes('species_public_evidence_insufficient'),
    `${speciesId} mixed-tank decision must carry public-evidence limitation provenance`,
  );
  assert.equal(getCompatibilityDataLimitationReason(decision), 'public_evidence_insufficient');
}

assert.ok(compatibilityGoldfishVariantPredationEvidenceCeilingsWave37.every(item => !('targets' in item)));
console.log('Compatibility goldfish variant predation evidence-ceiling Wave37 PASS: seven exact variants leave active research without being declared safe; audit slots remain traceable and mixed-tank decisions retain public-evidence limitation provenance.');
