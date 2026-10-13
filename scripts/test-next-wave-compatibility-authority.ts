import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import './test-next-wave-marine-01';
import './test-next-wave-freshwater-01';
import './test-next-wave-freshwater-02';
import './test-next-wave-freshwater-03';
import './test-next-wave-freshwater-04';

import { compatibilityReleasedSpeciesIds, compatibilityUnifiedNextWave } from '../src/data/compatibilityNextWaveBatch';
import { getCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getCompatibilityDomainBoundary } from '../src/data/compatibilityDomainBoundaries';
import { getKnowledgeEvidenceCeiling } from '../src/data/knowledgeEvidenceCeilings';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';

const gapQueue = JSON.parse(readFileSync('docs/compatibility_knowledge_gap_queue.json', 'utf8'));
const coverage = JSON.parse(readFileSync('docs/compatibility_knowledge_coverage.json', 'utf8'));

const assertUnique = (values: readonly string[], label: string) => {
  assert.equal(new Set(values).size, values.length, label + ' must not contain duplicates');
};

assert.equal(compatibilityUnifiedNextWave.policy.progression, 'batch_only');
assert.equal(compatibilityUnifiedNextWave.policy.validation, 'single_manifest_single_release_gate');
assert.equal(compatibilityUnifiedNextWave.policy.pendingBehavior, 'fail_closed');

assertUnique(compatibilityReleasedSpeciesIds, 'released Compatibility species');
assertUnique(compatibilityUnifiedNextWave.activeQueueSpeciesIds, 'active next-wave queue');
assertUnique(compatibilityUnifiedNextWave.identityBoundaryHoldSpeciesIds, 'identity-boundary holds');
assertUnique(compatibilityUnifiedNextWave.domainBoundaryHoldSpeciesIds, 'compatibility-domain holds');

for (const batch of compatibilityUnifiedNextWave.releasedBatches) {
  const migrationOwner = 'migrationOwner' in batch ? batch.migrationOwner : undefined;
  const authorityOwner = 'authorityOwner' in batch ? batch.authorityOwner : undefined;
  const ownerPath = authorityOwner ?? migrationOwner;
  assert.ok(ownerPath, batch.batchId + ' must declare a source-controlled authority owner');
  const owner = readFileSync(ownerPath, 'utf8');
  const migration = migrationOwner ? readFileSync(migrationOwner, 'utf8') : owner;
  for (const member of batch.members) {
    assert.equal(
      owner.includes(member.speciesId),
      true,
      batch.batchId + ' authority owner must include ' + member.speciesId,
    );

    const fish = fishData.find(item => item.id === member.speciesId);
    assert.ok(fish, 'released catalog species missing: ' + member.speciesId);
    const identityBoundary = getCatalogIdentityBoundary(member.speciesId);
    const domainBoundary = getCompatibilityDomainBoundary(member.speciesId);
    const evidenceCeiling = getKnowledgeEvidenceCeiling(member.speciesId);
    if (!identityBoundary && !domainBoundary && !evidenceCeiling) {
      assert.ok(
        getReviewedSpeciesKnowledgeForFish(fish),
        'released species without a fail-closed boundary must resolve runtime Species Knowledge: ' + member.speciesId,
      );
    }

    const profile = getReviewedCompatibilityProfile(member.speciesId);
    if (member.expectProfile) {
      assert.ok(migrationOwner, batch.batchId + ' Profile release must declare a DB migration owner');
      assert.ok(profile, 'released species must resolve reviewed Compatibility Profile: ' + member.speciesId);
      for (const source of profile.citations) {
        assert.equal(
          migration.includes(source.id),
          true,
          batch.batchId + ' migration owner must include Profile source ' + source.id,
        );
      }
    } else {
      assert.equal(profile, undefined, 'explicit hold species must remain without direct Compatibility Profile: ' + member.speciesId);
      if (identityBoundary) {
        assert.equal(identityBoundary.researchDisposition, 'terminal_unknown_hold');
      } else if (domainBoundary) {
        assert.equal(domainBoundary.researchDisposition, 'terminal_unknown_hold');
      } else {
        const evidenceCeilingField = 'evidenceCeilingField' in member ? member.evidenceCeilingField : undefined;
        assert.ok(evidenceCeilingField, 'profile hold must declare an evidence ceiling field: ' + member.speciesId);
        assert.ok(
          getKnowledgeEvidenceCeiling(member.speciesId, evidenceCeilingField),
          'profile hold must retain an explicit reviewed evidence ceiling: ' + member.speciesId,
        );
      }
    }

    if (batch.requireReviewedCatalogFields && !identityBoundary && !domainBoundary) {
      const fieldReviews = getCatalogFieldReviews(member.speciesId);
      assert.equal(
        fieldReviews.some(review => review.status === 'reviewed'),
        true,
        'review-generation batch species must retain reviewed catalog field authority: ' + member.speciesId,
      );
    }
  }
}

const generatedActiveQueue = (gapQueue.next_wave_species_queue || []).map(
  (item: { species_id: string }) => item.species_id,
);
assert.deepEqual(
  generatedActiveQueue,
  [...compatibilityUnifiedNextWave.activeQueueSpeciesIds],
  'generated next-wave queue must exactly match the source-controlled unified batch manifest',
);
assert.equal(coverage.next_wave_species_count, compatibilityUnifiedNextWave.activeQueueSpeciesIds.length);

for (const speciesId of compatibilityUnifiedNextWave.activeQueueSpeciesIds) {
  const fish = fishData.find(item => item.id === speciesId);
  assert.ok(fish, 'active next-wave catalog species missing: ' + speciesId);
  assert.equal(
    getReviewedCompatibilityProfile(speciesId),
    undefined,
    'active next-wave species must remain fail-closed until promoted by a reviewed batch: ' + speciesId,
  );
}


for (const speciesId of compatibilityUnifiedNextWave.identityBoundaryHoldSpeciesIds) {
  assert.equal(
    getReviewedCompatibilityProfile(speciesId),
    undefined,
    'identity-boundary hold must remain without a direct Compatibility Profile: ' + speciesId,
  );
  const boundary = getCatalogIdentityBoundary(speciesId);
  assert.ok(boundary, 'identity-boundary hold must resolve an explicit boundary: ' + speciesId);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}

for (const speciesId of compatibilityUnifiedNextWave.domainBoundaryHoldSpeciesIds) {
  assert.equal(
    getReviewedCompatibilityProfile(speciesId),
    undefined,
    'compatibility-domain hold must remain without a fish Compatibility Profile: ' + speciesId,
  );
  const boundary = getCompatibilityDomainBoundary(speciesId);
  assert.ok(boundary, 'compatibility-domain hold must resolve an explicit boundary: ' + speciesId);
  assert.equal(boundary.researchDisposition, 'terminal_unknown_hold');
}

const generatedTerminalSpecies = (gapQueue.terminal_species_holds || []).map(
  (item: { species_id: string }) => item.species_id,
);
assert.deepEqual(
  new Set(generatedTerminalSpecies),
  new Set(compatibilityUnifiedNextWave.terminalHoldSpeciesIds),
  'terminal species holds must stay explicit and fail-closed',
);

const generatedTerminalPairs = (gapQueue.terminal_pair_holds || []).map(
  (item: { species_a_id: string; species_b_id: string }) =>
    [item.species_a_id, item.species_b_id].sort().join('__'),
);
assert.deepEqual(
  new Set(generatedTerminalPairs),
  new Set(compatibilityUnifiedNextWave.terminalHoldPairKeys),
  'terminal pair holds must stay explicit and fail-closed',
);

assert.equal(coverage.terminal_species_hold_count, compatibilityUnifiedNextWave.terminalHoldSpeciesIds.length);
assert.equal(coverage.terminal_pair_hold_count, compatibilityUnifiedNextWave.terminalHoldPairKeys.length);
assert.equal(coverage.research_actionable_species_count, 0);
assert.equal(coverage.research_actionable_pair_count, 0);

console.log(
  'unified next-wave authority passed: '
  + compatibilityReleasedSpeciesIds.length + ' released batch species / '
  + compatibilityUnifiedNextWave.activeQueueSpeciesIds.length + ' active queued / '
  + compatibilityUnifiedNextWave.terminalHoldSpeciesIds.length + ' terminal species holds',
);
