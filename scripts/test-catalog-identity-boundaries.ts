import assert from 'node:assert/strict';
import { getCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { catalogIdentityBoundaries, getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';

assert.deepEqual(Object.keys(catalogIdentityBoundaries).sort(), ['sp_0002', 'sp_0021', 'sp_0127', 'sp_0428']);

const crystal = getCatalogIdentityBoundary('sp_0002');
assert.equal(crystal?.code, 'trade_name_taxon_ambiguous');
assert.equal(crystal?.resolvedGranularity, 'trade_name_only');
assert.equal(crystal?.researchDisposition, 'terminal_unknown_hold');
assert.ok(crystal?.candidateTaxa.includes('Caridina logemanni'));

const zebra = getCatalogIdentityBoundary('sp_0428');
assert.equal(zebra?.code, 'accepted_taxon_alias_trade_ambiguous');
assert.equal(zebra?.resolvedGranularity, 'accepted_taxon_alias_only');
assert.equal(zebra?.researchDisposition, 'terminal_unknown_hold');
assert.ok(zebra?.candidateTaxa.includes('Vittina natalensis'));

const mini = getCatalogIdentityBoundary('sp_0021');
assert.equal(mini?.code, 'commercial_hybrid_identity_unresolved');
assert.equal(mini?.resolvedGranularity, 'commercial_lineage_only');
assert.equal(mini?.researchDisposition, 'terminal_unknown_hold');
assert.ok(mini?.sourceIds.includes('biology-2026-mini-parrot-taxonomy-boundary'));

const pakistaniLoach = getCatalogIdentityBoundary('sp_0127');
assert.equal(pakistaniLoach?.code, 'trade_name_taxon_ambiguous');
assert.equal(pakistaniLoach?.resolvedGranularity, 'trade_name_only');
assert.equal(pakistaniLoach?.researchDisposition, 'terminal_unknown_hold');
assert.ok(pakistaniLoach?.candidateTaxa.includes('Botia almorhae sensu stricto'));
assert.ok(pakistaniLoach?.candidateTaxa.includes('Botia lohachata'));
assert.ok(pakistaniLoach?.sourceIds.includes('seriouslyfish-botia-almorhae-trade-boundary'));

const koiReview = getCatalogFieldReviews('sp_0258').find(review => review.field === 'identity');
assert.equal(koiReview?.resolution, 'supported');
assert.equal(getCatalogIdentityBoundary('sp_0258'), undefined);

for (const boundary of Object.values(catalogIdentityBoundaries)) {
  assert.ok(boundary.note.length > 20);
  assert.ok(boundary.sourceIds.length > 0);
  assert.ok(boundary.candidateTaxa.length > 0);
}

console.log('catalog identity boundaries passed: unresolved trade identities are granular and Koi Betta identity is reviewed-supported');
