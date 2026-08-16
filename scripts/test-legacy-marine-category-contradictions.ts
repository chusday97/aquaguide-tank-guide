import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getSpeciesWaterType } from '../src/modules/species/species.service';
import { getSpeciesWaterEvidence } from '../src/modules/species/speciesWaterEvidence';

const freshwaterCases = [
  { id: 'sp_0057', scientificName: 'Altolamprologus calvus' },
  { id: 'sp_0058', scientificName: 'Neolamprologus multifasciatus' },
  { id: 'sp_0266', scientificName: 'Altolamprologus calvus var. Gold' },
] as const;

for (const expected of freshwaterCases) {
  const species = fishData.find(item => item.id === expected.id);
  assert.ok(species, `missing catalog fixture ${expected.id}`);
  assert.equal(species.scientificName, expected.scientificName);
  assert.notEqual(species.category, '海水鱼', `${expected.id} must not keep the stale marine display category`);
  assert.equal(
    getSpeciesWaterType(species),
    'freshwater',
    `${expected.id} must resolve freshwater even if a future legacy category regression reappears`,
  );
  const evidence = getSpeciesWaterEvidence(species);
  assert.ok(evidence, `${expected.id} must resolve explicit taxon water evidence`);
  assert.equal(evidence.primaryWaterType, 'freshwater');
  assert.equal(evidence.confidence, 'high');
}

const calvusBase = fishData.find(item => item.id === 'sp_0057');
const calvusGold = fishData.find(item => item.id === 'sp_0266');
assert.ok(calvusBase && calvusGold);
assert.deepEqual(
  getSpeciesWaterEvidence(calvusGold),
  getSpeciesWaterEvidence(calvusBase),
  'Altolamprologus calvus var. Gold should inherit the reviewed base-species freshwater evidence',
);

const marineControl = fishData.find(item => item.id === 'sp_0297');
assert.ok(marineControl, 'missing explicit Small marine Pseudochromis control sp_0297');
assert.equal(marineControl.category, '海水鱼');
assert.equal(marineControl.size, 'Small');
assert.match(marineControl.scientificName, /^Pseudochromis\b/i);
assert.equal(getSpeciesWaterType(marineControl), 'saltwater');

console.log(`legacy marine-category contradiction regression passed: freshwater=${freshwaterCases.map(item => item.id).join(',')}; marine-control=${marineControl.id}`);
