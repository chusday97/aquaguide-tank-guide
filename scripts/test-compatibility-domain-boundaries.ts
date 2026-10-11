import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import {
  compatibilityDomainBoundaries,
  getCompatibilityDomainBoundary,
} from '../src/data/compatibilityDomainBoundaries';

const ids = [
  'sp_0006','sp_0035','sp_0430','sp_0457','sp_0007','sp_0008','sp_0009',
  'sp_0318','sp_0319','sp_0321','sp_0322','sp_0323','sp_0325',
  'sp_0379','sp_0382','sp_0384',
].sort();

assert.deepEqual(Object.keys(compatibilityDomainBoundaries).sort(), ids);
for (const speciesId of ids) {
  const fish = fishData.find(item => item.id === speciesId);
  assert.ok(fish, 'domain hold must resolve catalog object: ' + speciesId);
  const boundary = getCompatibilityDomainBoundary(speciesId);
  assert.ok(boundary, 'domain hold must exist: ' + speciesId);
  assert.equal(boundary.code, 'life_type_not_supported_by_fish_compatibility_domain');
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
  assert.ok(boundary.sourceIds.length > 0);
  assert.equal(getReviewedCompatibilityProfile(speciesId), undefined, 'non-fish domain hold must not receive fish Compatibility Profile: ' + speciesId);
}
console.log('Compatibility domain boundaries PASS: 16 non-fish catalog objects stay explicit terminal holds outside the fish-profile runtime.');
