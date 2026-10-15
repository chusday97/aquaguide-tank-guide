import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import {
  buildCompatibilityDecisionPlan,
  buildCompatibilityResolutionTargets,
} from '../src/services/compatibility/compatibility-decision-plan.service';
import { getCompatibilityRuleFamily } from '../src/services/compatibility/compatibility-action.service';
import type { Aquarium } from '../src/types';

const byId = (id: string) => {
  const value = fishData.find(item => item.id === id);
  assert.ok(value, 'missing fixture species ' + id);
  return value;
};

const tankAt = (temperature: string): Aquarium => ({
  id: 'post-action-resolution-' + temperature,
  name: 'Post action resolution',
  fishes: [],
  dimensions: { length: '200', width: '70', height: '60' },
  waterType: 'Freshwater',
  targetTemperature: temperature,
});

const statusRank = {
  compatible: 0,
  caution: 1,
  insufficient_data: 2,
  not_recommended: 3,
} as const;

const assertImproved = (
  before: ReturnType<typeof evaluateCompatibilityDecision>,
  after: ReturnType<typeof evaluateCompatibilityDecision>,
  label: string,
) => {
  assert.ok(
    statusRank[after.status] < statusRank[before.status],
    label + ': expected deterministic status improvement',
  );
};

const emittedFamilies = (decision: ReturnType<typeof evaluateCompatibilityDecision>) => new Set([
  ...decision.blockingRules.map(rule => getCompatibilityRuleFamily(rule.code)),
  ...decision.warningRules.map(rule => getCompatibilityRuleFamily(rule.code)),
  ...decision.missingData.map(rule => getCompatibilityRuleFamily(rule.code)),
]);

const assertTargetsFollowSurfacedAuthority = (
  decision: ReturnType<typeof evaluateCompatibilityDecision>,
  mode: 'planned_addition' | 'current_tank',
) => {
  const plan = buildCompatibilityDecisionPlan(decision, mode);
  assert.deepEqual(
    plan.resolutionTargets.map(target => target.riskFamily),
    plan.evidence.sourceRuleCodes.map(getCompatibilityRuleFamily),
    'resolution targets must track the same surfaced deterministic risk families',
  );
  assert.deepEqual(
    buildCompatibilityResolutionTargets(decision, mode),
    plan.resolutionTargets,
    'standalone target helper and decision plan must stay identical',
  );
};

const zebrafish = byId('sp_0435');

// 1) Reviewed group-size target: 7 -> 8 must actually clear the warning.
const zebra7 = evaluateCompatibilityDecision({
  tank: tankAt('23'),
  items: [{ species: zebrafish, quantity: 7, origin: 'candidate' }],
});
const zebra7Plan = buildCompatibilityDecisionPlan(zebra7, 'planned_addition');
assert.equal(zebra7.status, 'caution');
assertTargetsFollowSurfacedAuthority(zebra7, 'planned_addition');
assert.equal(zebra7Plan.resolutionTargets.length, 1);
assert.equal(zebra7Plan.resolutionTargets[0]?.riskFamily, 'group_size');
assert.equal(zebra7Plan.resolutionTargets[0]?.resolutionMode, 'parameter_recheck');
assert.deepEqual(zebra7Plan.resolutionTargets[0]?.speciesIds, [zebrafish.id]);
assert.match(zebra7Plan.resolutionTargets[0]?.criterion || '', /斑马鱼/);
assert.match(zebra7Plan.resolutionTargets[0]?.criterion || '', /至少 8/);

const zebra8 = evaluateCompatibilityDecision({
  tank: tankAt('23'),
  items: [{ species: zebrafish, quantity: 8, origin: 'candidate' }],
});
assertImproved(zebra7, zebra8, 'group size 7 -> 8');
assert.equal(zebra8.status, 'compatible');
assert.equal(emittedFamilies(zebra8).has('group_size'), false);
assert.deepEqual(buildCompatibilityDecisionPlan(zebra8).resolutionTargets, []);

// 2) Tank target-temperature mismatch is adjustable, not a structural no-overlap.
const zebra25 = evaluateCompatibilityDecision({
  tank: tankAt('25'),
  items: [{ species: zebrafish, quantity: 8, origin: 'candidate' }],
});
const zebra25Plan = buildCompatibilityDecisionPlan(zebra25, 'planned_addition');
assert.equal(zebra25.status, 'not_recommended');
assertTargetsFollowSurfacedAuthority(zebra25, 'planned_addition');
assert.equal(zebra25Plan.resolutionTargets[0]?.riskFamily, 'temperature');
assert.equal(zebra25Plan.resolutionTargets[0]?.resolutionMode, 'parameter_recheck');
assert.deepEqual(zebra25Plan.resolutionTargets[0]?.speciesIds, [zebrafish.id]);
assert.match(zebra25Plan.resolutionTargets[0]?.criterion || '', /斑马鱼/);
assert.match(zebra25Plan.resolutionTargets[0]?.criterion || '', /tank_temperature_conflict/);

const zebra23 = evaluateCompatibilityDecision({
  tank: tankAt('23'),
  items: [{ species: zebrafish, quantity: 8, origin: 'candidate' }],
});
assertImproved(zebra25, zebra23, 'temperature 25 -> 23');
assert.equal(zebra23.status, 'compatible');
assert.equal(emittedFamilies(zebra23).has('temperature'), false);

// 3) Water-type hard block only clears when the conflicting species stop sharing a tank.
const neon = byId('sp_0431');
const lionfish = byId('sp_0453');
const neonLionfish = evaluateCompatibilityDecision({
  tank: tankAt('25'),
  items: [
    { species: neon, quantity: 8, origin: 'existing' },
    { species: lionfish, quantity: 1, origin: 'candidate' },
  ],
});
const neonLionfishPlan = buildCompatibilityDecisionPlan(neonLionfish, 'planned_addition');
assert.equal(neonLionfish.status, 'not_recommended');
assertTargetsFollowSurfacedAuthority(neonLionfish, 'planned_addition');
assert.equal(neonLionfishPlan.resolutionTargets[0]?.riskFamily, 'water_type');
assert.equal(neonLionfishPlan.resolutionTargets[0]?.resolutionMode, 'deterministic_clearance');
assert.deepEqual(
  new Set(neonLionfishPlan.resolutionTargets[0]?.speciesIds),
  new Set([neon.id, lionfish.id]),
);
assert.match(neonLionfishPlan.resolutionTargets[0]?.criterion || '', /不再共享同一水体|分缸|替换/);

const neonOnly = evaluateCompatibilityDecision({
  tank: tankAt('25'),
  items: [{ species: neon, quantity: 8, origin: 'existing' }],
});
assertImproved(neonLionfish, neonOnly, 'remove water-type conflict');
assert.equal(neonOnly.status, 'compatible');
assert.equal(emittedFamilies(neonOnly).has('water_type'), false);
assert.equal(emittedFamilies(neonOnly).has('predation'), false);

// 4) Direct predation conflict clears structurally by separating/removing the pair.
const oscar = byId('sp_0451');
const oscarZebra = evaluateCompatibilityDecision({
  tank: tankAt('23'),
  items: [
    { species: oscar, quantity: 1, origin: 'existing' },
    { species: zebrafish, quantity: 8, origin: 'candidate' },
  ],
});
const oscarZebraPlan = buildCompatibilityDecisionPlan(oscarZebra, 'planned_addition');
assert.equal(oscarZebra.status, 'not_recommended');
assertTargetsFollowSurfacedAuthority(oscarZebra, 'planned_addition');
assert.equal(oscarZebraPlan.resolutionTargets[0]?.riskFamily, 'predation');
assert.equal(oscarZebraPlan.resolutionTargets[0]?.resolutionMode, 'deterministic_clearance');
assert.deepEqual(
  new Set(oscarZebraPlan.resolutionTargets[0]?.speciesIds),
  new Set([oscar.id, zebrafish.id]),
);
assert.match(oscarZebraPlan.resolutionTargets[0]?.criterion || '', /不再直接接触|分隔|替换/);

const oscarOnly = evaluateCompatibilityDecision({
  tank: tankAt('23'),
  items: [{ species: oscar, quantity: 1, origin: 'existing' }],
});
assertImproved(oscarZebra, oscarOnly, 'remove direct predation pair');
assert.equal(oscarOnly.status, 'compatible');
assert.equal(emittedFamilies(oscarOnly).has('predation'), false);

// 5) Behavioral vulnerability must never be presented as deterministically cleared.
const currentCaution = evaluateCompatibilityDecision({
  tank: tankAt('25'),
  items: [
    { species: byId('sp_0114'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0469'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0013'), quantity: 1, origin: 'existing' },
    { species: neon, quantity: 10, origin: 'existing' },
  ],
});
const currentCautionPlan = buildCompatibilityDecisionPlan(currentCaution, 'current_tank');
assert.equal(currentCaution.status, 'caution');
assertTargetsFollowSurfacedAuthority(currentCaution, 'current_tank');
assert.equal(currentCautionPlan.resolutionTargets[0]?.riskFamily, 'predation');
assert.equal(currentCautionPlan.resolutionTargets[0]?.resolutionMode, 'behavioral_recheck');
assert.match(currentCautionPlan.resolutionTargets[0]?.criterion || '', /实际追食|躲藏|受伤|进食/);
assert.match(currentCautionPlan.resolutionTargets[0]?.criterion || '', /不能预先宣告风险已解除/);
assert.doesNotMatch(
  currentCautionPlan.resolutionTargets[0]?.criterion || '',
  /重新评估后.*必须消失|确认风险已解除|视为风险已解除/,
);

// Compatible decisions should not manufacture work for the user.
assert.deepEqual(buildCompatibilityResolutionTargets(zebra23), []);

console.log('Compatibility post-action resolution PASS: measurable adjustments clear real emitted risks in before/after simulations, structural hard blocks require separation/replacement, behavioral cautions remain recheck-only, and resolution targets stay aligned with surfaced authority.');
