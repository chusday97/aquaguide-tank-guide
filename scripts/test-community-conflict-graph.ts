import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Fish } from '../src/types';
import { buildCommunityConflictGraph } from '../src/lib/communityConflictGraph';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing catalog fixture ${id}`);
  return species;
};

const predator = byId('sp_0049');
const neon = byId('sp_0431');
const cardinal = byId('sp_0432');
const territorialCichlid = byId('sp_0021');
const tigerBarb = byId('sp_0439');

const predationGraph = buildCommunityConflictGraph([
  { species: predator, quantity: 1 },
  { species: neon, quantity: 5 },
]);
assert.equal(predationGraph.summary.evaluatedPairCount, 1);
assert.equal(predationGraph.status, 'blocker');
const predation = predationGraph.edges.find(edge => edge.relation === 'predation');
assert.ok(predation, 'reviewed predator + small fish must create a predation edge');
assert.equal(predation.sourceSpeciesId, predator.id);
assert.equal(predation.targetSpeciesId, neon.id);
assert.equal(predation.direction, 'one_way');
assert.equal(predation.outcome, 'blocker');
assert.equal(predation.fixability, 'relocation');
assert.equal(predation.severity, 'high');
assert.equal(predation.confidence, 'medium');
assert.ok(predation.citations.length > 0, 'predation edge must preserve reviewed citations');

const behaviorGraph = buildCommunityConflictGraph([
  { species: territorialCichlid, quantity: 1 },
  { species: tigerBarb, quantity: 6 },
]);
const behaviorConflict = behaviorGraph.edges.find(edge => edge.ruleCode === 'pair_rule_behavior_and_territory_conflict');
assert.ok(behaviorConflict, 'reviewed pair blocker must become an explicit graph edge');
assert.equal(behaviorConflict.relation, 'aggression');
assert.equal(behaviorConflict.direction, 'mutual');
assert.equal(behaviorConflict.fixability, 'relocation');
assert.deepEqual(new Set(behaviorConflict.affectedSpeciesIds), new Set([territorialCichlid.id, tigerBarb.id]));

const groupWindowGraph = buildCommunityConflictGraph([
  { species: neon, quantity: 5 },
  { species: cardinal, quantity: 5 },
]);
const groupWindow = groupWindowGraph.edges.find(edge => edge.ruleCode === 'pair_rule_group_size_and_shared_water_window');
assert.ok(groupWindow, 'reviewed caution pair must remain a warning edge');
assert.equal(groupWindow.outcome, 'warning');
assert.equal(groupWindow.relation, 'group_size');
assert.equal(groupWindow.fixability, 'quantity_adjustment');
assert.equal(groupWindow.direction, 'mutual');

const syntheticBase: Fish = {
  id: 'synthetic-a',
  name: 'Synthetic A',
  scientificName: 'Testus alpha',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-26°C',
  phLevel: '6.5-7.5',
  waterChangeCycle: 7,
  description: '淡水测试物种',
  diet: '杂食',
  tankSize: '至少 30 升',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
};
const syntheticB: Fish = {
  ...syntheticBase,
  id: 'synthetic-b',
  name: 'Synthetic B',
  scientificName: 'Testus beta',
};
const unknownBehaviorGraph = buildCommunityConflictGraph([
  { species: syntheticBase, quantity: 2 },
  { species: syntheticB, quantity: 2 },
]);
assert.equal(unknownBehaviorGraph.status, 'insufficient_data');
const behaviorGap = unknownBehaviorGraph.evidenceGaps.find(edge => edge.relation === 'behavior_evidence');
assert.ok(behaviorGap, 'missing reviewed behavior must be represented as an evidence-gap edge');
assert.equal(behaviorGap.outcome, 'missing_evidence');
assert.equal(behaviorGap.fixability, 'more_data');
assert.equal(behaviorGap.direction, 'mutual');

const duplicateGraph = buildCommunityConflictGraph([
  { species: neon, quantity: 2 },
  { species: neon, quantity: 3 },
  { species: cardinal, quantity: 5 },
]);
assert.equal(duplicateGraph.nodes.find(node => node.speciesId === neon.id)?.quantity, 5, 'same species records must aggregate before pair evaluation');
assert.equal(duplicateGraph.summary.evaluatedPairCount, 1, 'duplicate same-species records must not create self-conflict edges');

console.log('community conflict graph passed: directional predation, mutual behavior conflicts, warning/fixability mapping, evidence gaps, and pair dedupe are explicit');
