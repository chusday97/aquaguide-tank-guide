import assert from 'node:assert/strict';
import type { Fish } from '../src/types';
import type { SpeciesAdminInput } from '../src/services/admin/content-admin.service';
import { runCompatibilityRegression } from '../src/services/admin/compatibility-impact.service';

const before: SpeciesAdminInput = {
  catalogKey: 'sp_impact_test', name: 'Impact Test Fish', scientificName: 'Testus impactus', category: '小型鱼',
  difficulty: 'Easy', waterTemperatureText: '22-26°C', phLevelText: '6.5-7.5', waterChangeCycleDays: 7,
  description: 'Compatibility regression fixture.', diet: 'Omnivore', tankSizeText: '至少 30 升',
  temperament: 'Peaceful', sizeClass: 'Small', housingMode: '适合混养', isCustom: false, searchTerms: [],
};
const after: SpeciesAdminInput = { ...before, waterTemperatureText: '10-12°C' };
const counterpart: Fish = {
  id: 'sp_counterpart_test', name: 'Counterpart', scientificName: 'Testus counterpart', category: '小型鱼', image: '',
  difficulty: 'Easy', waterTemperature: '24-28°C', phLevel: '6.5-7.5', waterChangeCycle: 7,
  description: 'Fixture', diet: 'Omnivore', tankSize: '至少 30 升', temperament: 'Peaceful', size: 'Small', housingMode: '适合混养',
};

const result = runCompatibilityRegression(before, after, [counterpart]);
assert.equal(result.cohortSize, 1);
assert.equal(result.changedPairs, 1);
assert.equal(result.statusChangedPairs, 1);
assert.equal(result.changes[0]?.speciesId, counterpart.id);
assert.equal(result.changes[0]?.afterStatus, 'not_recommended');
assert.ok(result.changes[0]?.afterRuleCodes.includes('temperature_no_overlap'));

const ruleOnlyAfter: SpeciesAdminInput = { ...before, phLevelText: '9-10' };
const ruleOnly = runCompatibilityRegression(before, ruleOnlyAfter, [counterpart]);
assert.equal(ruleOnly.changedPairs, 1);
assert.equal(ruleOnly.statusChangedPairs, 0);
assert.equal(ruleOnly.ruleChangedPairs, 1);
assert.equal(ruleOnly.changes[0]?.statusChanged, false);
assert.ok(ruleOnly.changes[0]?.afterRuleCodes.includes('ph_range_gap'));
console.log('admin compatibility impact: before/after engine regression detects status and rule-only changes');
