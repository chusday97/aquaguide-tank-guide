import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import {
  compatibilityDomainBoundaries,
  getCompatibilityDomainBoundary,
} from '../src/data/compatibilityDomainBoundaries';

const ids = [
  'sp_0003','sp_0004','sp_0005','sp_0006','sp_0007','sp_0008','sp_0009','sp_0027','sp_0028','sp_0029','sp_0030','sp_0031','sp_0032','sp_0033','sp_0034','sp_0035','sp_0036','sp_0164','sp_0165','sp_0166','sp_0188','sp_0189','sp_0190','sp_0191','sp_0192','sp_0193','sp_0194','sp_0195','sp_0238','sp_0239','sp_0249','sp_0250','sp_0251','sp_0274','sp_0275','sp_0276','sp_0277','sp_0278','sp_0279','sp_0318','sp_0319','sp_0320','sp_0321','sp_0322','sp_0323','sp_0324','sp_0325','sp_0326','sp_0327','sp_0328','sp_0329','sp_0330','sp_0331','sp_0332','sp_0333','sp_0335','sp_0336','sp_0337','sp_0342','sp_0367','sp_0368','sp_0369','sp_0370','sp_0371','sp_0377','sp_0378','sp_0379','sp_0380','sp_0381','sp_0382','sp_0383','sp_0384','sp_0396','sp_0397','sp_0398','sp_0400','sp_0401','sp_0402','sp_0403','sp_0404','sp_0405','sp_0427','sp_0429','sp_0430','sp_0454','sp_0456','sp_0457','sp_0460','sp_0461','sp_0462','sp_0463','sp_0464','sp_0465','sp_0466','sp_0476'
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
console.log('Compatibility domain boundaries PASS: ' + ids.length + ' non-fish catalog objects stay explicit terminal holds outside the fish-profile runtime.');
