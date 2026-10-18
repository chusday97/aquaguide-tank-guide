import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { evaluateTankCompatibility } from '../src/services/compatibility/compatibility.service';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import type { CompatibilityDecision } from '../src/modules/knowledge/knowledge.types';
import { buildBeginnerCompatibilityAction } from '../src/services/compatibility/compatibility-action.service';
import { buildCompatibilityDecisionPlan } from '../src/services/compatibility/compatibility-decision-plan.service';
import type { Aquarium } from '../src/types';

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, `missing catalog fish ${id}`);
  return fish;
};

const quantityFor = (id: string) => Math.max(1, getReviewedCompatibilityProfile(id)?.minimumGroupSize || 1);

const fullTank: Aquarium = {
  id: 'compatibility-release-badcase-tank',
  name: 'Compatibility release badcase tank',
  fishes: [],
  dimensions: { length: '120', width: '50', height: '40' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const largeTank: Aquarium = {
  ...fullTank,
  id: 'compatibility-release-badcase-large-tank',
  dimensions: { length: '300', width: '100', height: '80' },
};

const largeCoolTank: Aquarium = {
  ...largeTank,
  id: 'compatibility-release-badcase-large-cool-tank',
  targetTemperature: '22',
};

const decisionFor = (ids: Array<[string, number]>, tank: Aquarium | null = fullTank) => evaluateCompatibilityDecision({
  tank,
  items: ids.map(([id, quantity], index) => ({
    species: byId(id),
    quantity,
    origin: index === 0 ? 'existing' as const : 'candidate' as const,
  })),
});

const allDeterministicCodes = (decision: CompatibilityDecision) => new Set([
  ...(decision.metadata.domainRuleCodes || []),
  ...decision.blockingRules.map(rule => rule.code),
  ...decision.warningRules.map(rule => rule.code),
  ...decision.missingData.map(rule => rule.code),
  ...decision.passedRules.map(rule => rule.code),
]);

const assertActionContract = (label: string, decision: CompatibilityDecision) => {
  const action = buildBeginnerCompatibilityAction(decision);
  assert.ok(action.immediateAction.trim().length > 0, `${label}: missing immediate action`);
  assert.ok(action.observeAfterAction?.trim().length, `${label}: missing recheck/observation point`);
  assert.ok(action.stopCondition?.trim().length, `${label}: missing stop condition`);
  assert.ok(action.sourceRuleCodes.length > 0, `${label}: missing source rule codes`);
  assert.ok(action.evidenceIds.length > 0, `${label}: missing evidence provenance`);
  const codes = allDeterministicCodes(decision);
  for (const code of action.sourceRuleCodes) {
    assert.ok(codes.has(code), `${label}: action source rule ${code} is not present in deterministic authority`);
  }
  const decisionEvidence = new Set(decision.evidenceIds || []);
  for (const evidenceId of action.evidenceIds) {
    assert.ok(decisionEvidence.has(evidenceId), `${label}: action evidence ${evidenceId} is not present in deterministic evidence`);
  }
  return action;
};

// 1) Normal reviewed case: a safe result must still include a complete action contract.
const compatible = decisionFor([
  ['sp_0010', quantityFor('sp_0010')],
  ['sp_0012', quantityFor('sp_0012')],
]);
assert.equal(compatible.status, 'compatible');
assertActionContract('compatible', compatible);

// 2) Large fish / small fish predation is a hard block, never softened into a caution.
const predation = decisionFor([
  ['sp_0431', 10],
  ['sp_0049', 1],
]);
assert.equal(predation.status, 'not_recommended');
assert.ok(predation.blockingRules.some(rule => rule.code === 'predation_risk'));
const predationAction = assertActionContract('predation hard block', predation);
assert.equal(predationAction.authorityLevel, 'hard_rule');
assert.ok(predationAction.sourceRuleCodes.includes('predation_risk'));
assert.match(predationAction.immediateAction, /不要|先不要|分开|阻断/);

// 3) One-sided territorial pressure remains conditional and has a concrete separation stop condition.
const territory = decisionFor([
  ['sp_0016', 2],
  ['sp_0443', 6],
]);
assert.equal(territory.status, 'caution');
assert.ok(territory.warningRules.some(rule => rule.code === 'territorial_pressure_context'));
const territoryAction = assertActionContract('territorial pressure', territory);
assert.ok(territoryAction.sourceRuleCodes.includes('territorial_pressure_context'));
assert.match(territoryAction.observeAfterAction || '', /追逐|躲藏|进食|分隔/);
assert.match(territoryAction.stopCondition || '', /停止|分隔|重新评估/);

// 4) Breeding-only defense must activate only when the real reproductive context says spawning/guarding.
const breedingResult = evaluateTankCompatibility({
  scope: 'species_only',
  candidateSpecies: byId('sp_0042'),
  existingSpecies: [byId('sp_0434')],
  candidateContext: { lifeStage: 'adult', reproductiveState: 'in_labor_or_spawning', guardingEggsOrFry: true },
});
assert.equal(breedingResult.status, 'caution');
assert.ok(breedingResult.warningRules.some(rule => rule.code === 'breeding_territory_active'));
const breedingAction = assertActionContract('breeding territory', breedingResult as unknown as CompatibilityDecision);
assert.ok(breedingAction.sourceRuleCodes.includes('breeding_territory_active'));
assert.match(breedingAction.primaryReason, /繁殖|领地|护域|护卵|攻击/);

// 5) Missing user/tank information is a legitimate 暂时无法判断 cause and asks for the missing input.
const missingTank = decisionFor([
  ['sp_0010', quantityFor('sp_0010')],
  ['sp_0012', quantityFor('sp_0012')],
], null);
assert.equal(missingTank.status, 'insufficient_data');
assert.ok(missingTank.metadata.domainRuleCodes.includes('tank_missing'));
const missingTankAction = assertActionContract('missing tank input', missingTank);
const missingTankPlan = buildCompatibilityDecisionPlan(missingTank);
assert.equal(missingTankAction.authorityLevel, 'information_required');
assert.ok(missingTankAction.sourceRuleCodes.includes('tank_missing'));
assert.equal(missingTankPlan.unknownReason, 'missing_user_input');
assert.match(missingTankAction.immediateAction, /补齐|鱼缸|再算|再判断/);

const resolvedSpeciesAuthority = decisionFor([
  ['sp_0014', quantityFor('sp_0014')],
  ['sp_0362', quantityFor('sp_0362')],
], largeTank);
assert.equal(resolvedSpeciesAuthority.status, 'compatible');
assert.equal(resolvedSpeciesAuthority.metadata.decisionReadiness, 'reviewed');
assert.equal(resolvedSpeciesAuthority.metadata.domainRuleCodes.includes('water_type_unknown'), false);
const resolvedSpeciesAuthorityPlan = buildCompatibilityDecisionPlan(resolvedSpeciesAuthority);
assert.equal(resolvedSpeciesAuthorityPlan.unknownReason, null);
assert.equal(
  resolvedSpeciesAuthorityPlan.nextSteps.some(step => /不要加入|水体需求不一致|分缸/.test(step)),
  false,
  'a compatible reviewed decision must never inherit conflict-remediation copy from passed rules',
);

// 6a) A manageable evidence ceiling should preserve a usable caution verdict instead of collapsing to 暂时无法判断.
const softEvidenceCeiling = decisionFor([
  ['sp_0010', quantityFor('sp_0010')],
  ['sp_0467', 6],
], largeTank);
assert.equal(softEvidenceCeiling.status, 'caution');
assert.equal(softEvidenceCeiling.metadata.decisionReadiness, 'partial');
assert.ok(softEvidenceCeiling.metadata.domainRuleCodes.includes('species_evidence_ceiling'));
const softEvidenceAction = assertActionContract('soft evidence ceiling', softEvidenceCeiling);
assert.equal(softEvidenceAction.authorityLevel, 'risk_management');
assert.ok(softEvidenceAction.sourceRuleCodes.includes('species_evidence_ceiling'));
assert.match(softEvidenceAction.primaryReason, /证据|公开|保守/);
assert.match(softEvidenceAction.immediateAction, /保守|不要|证据|安全余量/);

// 6b) A decision-critical public-evidence ceiling must still say the limitation is the evidence, not user configuration.
const hardEvidenceCeiling = decisionFor([
  ['sp_0010', quantityFor('sp_0010')],
  ['sp_0039', 6],
], largeCoolTank);
assert.equal(hardEvidenceCeiling.status, 'insufficient_data');
assert.equal(hardEvidenceCeiling.metadata.decisionReadiness, 'unknown');
assert.ok(hardEvidenceCeiling.metadata.domainRuleCodes.includes('species_public_evidence_insufficient'));
const evidenceAction = assertActionContract('hard public evidence ceiling', hardEvidenceCeiling);
const hardEvidencePlan = buildCompatibilityDecisionPlan(hardEvidenceCeiling);
assert.ok(evidenceAction.sourceRuleCodes.includes('species_public_evidence_insufficient'));
assert.equal(hardEvidencePlan.unknownReason, 'public_evidence_insufficient');
assert.match(evidenceAction.headline, /公开资料|可靠公开/);
assert.match(evidenceAction.primaryReason, /可靠公开|来源|风险边界/);
assert.match(evidenceAction.immediateAction, /不是你少填|可靠公开来源不足/);

// 7) A real unresolved catalog identity must make identity the action authority, not a secondary missing field.
const unresolvedIdentity = decisionFor([
  ['sp_0010', quantityFor('sp_0010')],
  ['sp_0474', 6],
], largeTank);
assert.equal(unresolvedIdentity.status, 'insufficient_data');
assert.ok(unresolvedIdentity.metadata.domainRuleCodes.includes('species_identity_unresolved'));
const identityAction = assertActionContract('unresolved identity', unresolvedIdentity);
const unresolvedIdentityPlan = buildCompatibilityDecisionPlan(unresolvedIdentity);
assert.ok(identityAction.sourceRuleCodes.includes('species_identity_unresolved'));
assert.equal(unresolvedIdentityPlan.unknownReason, 'unresolved_identity');
assert.match(identityAction.headline, /具体物种|身份/);
assert.match(identityAction.primaryReason, /身份|物种|品系/);
assert.match(identityAction.observeAfterAction || '', /确认|重新/);

// 8) Whole-tank aggregation must evaluate all unordered pairs and keep a hard block dominant.
const multiSpecies = evaluateCompatibilityDecision({
  tank: fullTank,
  items: [
    { species: byId('sp_0049'), quantity: 1 },
    { species: byId('sp_0431'), quantity: 10 },
    { species: byId('sp_0443'), quantity: 6 },
  ],
});
assert.equal(multiSpecies.pairResults.length, 3);
assert.equal(multiSpecies.status, 'not_recommended');
assert.ok(multiSpecies.blockingRules.some(rule => rule.code === 'predation_risk'));
assertActionContract('multi-species aggregate', multiSpecies);

// 9) Duplicate rows for the same species must normalize to the same biological decision.
const duplicateMerged = decisionFor([
  ['sp_0431', 8],
  ['sp_0443', 6],
]);
const duplicateSplit = evaluateCompatibilityDecision({
  tank: fullTank,
  items: [
    { species: byId('sp_0431'), quantity: 4 },
    { species: byId('sp_0431'), quantity: 4 },
    { species: byId('sp_0443'), quantity: 6 },
  ],
});
assert.equal(duplicateSplit.status, duplicateMerged.status);
assert.deepEqual(
  duplicateSplit.pairResults.map(pair => pair.pairId),
  duplicateMerged.pairResults.map(pair => pair.pairId),
);

// 10) A user adjustment must be able to improve an adjustable verdict without hiding real hard blocks.
const loadItems = ['sp_0012', 'sp_0431', 'sp_0443'];
const overloaded = evaluateCompatibilityDecision({
  tank: { ...fullTank, dimensions: { length: '60', width: '30', height: '35' }, targetTemperature: '24' },
  items: loadItems.map(id => ({ species: byId(id), quantity: 12 })),
});
assert.equal(overloaded.status, 'caution');
assert.ok(overloaded.warningRules.some(rule => rule.code === 'bioload_over_limit'));
const adjusted = evaluateCompatibilityDecision({
  tank: { ...fullTank, dimensions: { length: '60', width: '30', height: '35' }, targetTemperature: '24' },
  items: loadItems.map(id => ({ species: byId(id), quantity: 8 })),
});
assert.equal(adjusted.status, 'compatible');
assert.ok(adjusted.warningRules.every(rule => !rule.code.includes('bioload')));

// Unknown results in this release acceptance are limited to explicit missing input, identity, or decision-critical public-evidence ceiling causes.
for (const [label, decision, allowed] of [
  ['missing input', missingTank, ['tank_missing']],
  ['identity', unresolvedIdentity, ['species_identity_unresolved']],
  ['hard public evidence', hardEvidenceCeiling, ['species_public_evidence_insufficient']],
] as const) {
  assert.equal(decision.status, 'insufficient_data', `${label}: expected unavailable result`);
  assert.ok(allowed.some(code => decision.metadata.domainRuleCodes.includes(code)), `${label}: unavailable result lacks an allowed reason`);
}

console.log('Compatibility release badcase acceptance PASS: launch scenarios cover hard blocks, territorial/breeding risk, user-input/identity/evidence unknown boundaries, resolved reviewed authority, multi-species aggregation, duplicate normalization, adjustment recovery, and sourced action contracts with recheck + stop conditions.');
