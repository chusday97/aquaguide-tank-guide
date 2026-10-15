import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  compatibilityFastLaneWave4AuthorityPatch,
  compatibilityFastLaneWave4FieldReviews,
  compatibilityFastLaneWave4Sources,
} from '../src/data/compatibilityAuthorityPatches/fast-lane-wave4-20261014';
import { getApprovedCatalogFieldReviews, getCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import { fishData } from '../src/data/fishData';
import { getKnowledgeEvidenceCeiling } from '../src/data/knowledgeEvidenceCeilings';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';
import {
  buildCompatibilityCoreFieldCoverage,
  buildCompatibilityFastLaneResearchPackets,
} from '../src/services/compatibility/compatibility-field-coverage.service';

const patch = compatibilityUnifiedNextWave.authorityPatches.find(item => item.patchId === compatibilityFastLaneWave4AuthorityPatch.patchId);
assert.ok(patch);
assert.deepEqual(patch.speciesIds, ['sp_0105', 'sp_0468', 'sp_0198']);
assert.equal(patch.authorityOwner, compatibilityFastLaneWave4AuthorityPatch.authorityOwner);
assert.equal(patch.migrationOwner, compatibilityFastLaneWave4AuthorityPatch.migrationOwner);

const migration = readFileSync(patch.migrationOwner, 'utf8');
const priorMigration = readFileSync('supabase/migrations/20261014152500_compatibility_fast_lane_wave3_authority_patch.sql', 'utf8');
for (const source of Object.values(compatibilityFastLaneWave4Sources)) {
  assert.equal(priorMigration.includes(source.id), false, 'wave3 migration must remain immutable: ' + source.id);
  assert.equal(resolveKnowledgeSources([source.id])[0]?.id, source.id, 'wave4 source must resolve globally: ' + source.id);
  assert.match(migration, new RegExp(source.id));
}
assert.match(migration, /expected 184 reviewed evidence sources/);
assert.match(migration, /expected 189 reviewed evidence sources/);
assert.match(migration, /conflicting Channa numeric-minimum evidence must not be linked as Profile authority/);
assert.match(migration, /commit;\s*$/);

const bichirTerritoriality = getApprovedCatalogFieldReviews('sp_0105').find(item => item.field === 'territoriality');
assert.deepEqual(bichirTerritoriality?.proposedValue, { traits: ['conspecific_territoriality'] });
const bichir = getReviewedCompatibilityProfile('sp_0105');
assert.ok(bichir);
assert.ok(bichir.behaviorTraits.includes('conspecific_territoriality'));
assert.equal(bichir.behaviorTraits.includes('territorial'), false, 'conspecific evidence must not become generic territoriality');
assert.ok(bichir.citations.some(item => item.id === compatibilityFastLaneWave4Sources.ornateBichirAquaticArts.id));
assert.ok(bichir.citations.some(item => item.id === compatibilityFastLaneWave4Sources.ornateBichirWetWebMedia.id));

const harlequinTerritoriality = getApprovedCatalogFieldReviews('sp_0468').find(item => item.field === 'territoriality');
assert.deepEqual(harlequinTerritoriality?.proposedValue, { traits: [] });
const harlequin = getReviewedCompatibilityProfile('sp_0468');
assert.ok(harlequin);
assert.equal(harlequin.behaviorTraits.some(trait => /territor/i.test(trait)), false);
assert.ok(harlequin.citations.some(item => item.id === compatibilityFastLaneWave4Sources.harlequinHydroHabitats.id));

const channaTankReviews = getCatalogFieldReviews('sp_0198').filter(item => item.field === 'tank_size');
assert.ok(channaTankReviews.some(item => item.resolution === 'unknown' && item.citationIds.includes(compatibilityFastLaneWave4Sources.channaDiplogrammaBAqua.id)));
assert.equal(getApprovedCatalogFieldReviews('sp_0198').some(item => item.field === 'tank_size'), false, 'conflicting numeric minimum must remain unsupported');
const channaCeiling = getKnowledgeEvidenceCeiling('sp_0198', 'space');
assert.equal(channaCeiling?.code, 'species_space_minimum_conflicted');
assert.equal(channaCeiling?.researchDisposition, 'terminal_unknown_hold');

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, 'missing catalog fish ' + id);
  return fish;
};
const pair = (existingId: string, candidateId: string) => evaluateTankCompatibility({
  scope: 'species_only',
  existingSpecies: [{ species: byId(existingId), record: { quantity: 1 } }],
  candidateSpecies: byId(candidateId),
  candidateQuantity: 1,
});

const sameBichir = pair('sp_0105', 'sp_0105');
assert.equal(sameBichir.status, 'caution');
assert.ok(sameBichir.warningRules.some(rule => rule.code === 'territorial_conflict'));

const bichirVsOther = pair('sp_0105', 'sp_0017');
assert.equal(bichirVsOther.status, 'compatible');
assert.equal(bichirVsOther.warningRules.some(rule => rule.code === 'territorial_pressure_context'), false, 'conspecific territoriality must not leak into interspecific pressure');

const coverage = buildCompatibilityCoreFieldCoverage();
const row = (id: string) => coverage.rows.find(item => item.speciesId === id);
assert.equal(row('sp_0105')?.authoritativeFieldCount, 8);
assert.equal(row('sp_0105')?.genericOnboardingReady, true);
assert.equal(row('sp_0468')?.authoritativeFieldCount, 8);
assert.equal(row('sp_0468')?.genericOnboardingReady, true);
assert.equal(row('sp_0198')?.authoritativeFieldCount, 7);
assert.equal(row('sp_0198')?.fields.tank_size.status, 'reviewed_unknown');
assert.equal(row('sp_0198')?.fields.tank_size.disposition, 'terminal_hold');
assert.equal(row('sp_0198')?.fields.tank_size.reasonCode, 'species_space_minimum_conflicted');
const currentFastLane = buildCompatibilityFastLaneResearchPackets();
assert.equal(
  currentFastLane.some(packet => ['sp_0105', 'sp_0468', 'sp_0198'].includes(packet.speciesId)),
  false,
  'Wave4 species must stay closed/terminal even when later reviewed waves add new Fast Lane candidates',
);
assert.equal(compatibilityFastLaneWave4FieldReviews.length, 3);

console.log('Compatibility Fast Lane wave4 authority PASS: Wave4 closures remain closed/terminal while later reviewed waves may add new Fast Lane candidates.');
