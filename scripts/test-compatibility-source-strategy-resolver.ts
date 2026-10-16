import assert from 'node:assert/strict';
import { classifyCompatibilityTrustedSourceUrl } from '../apps/api/src/compatibility-species-research-provider';
import {
  buildCompatibilitySpecializedSourceRoutes,
  hasExhaustedCompatibilitySpecializedRoutes,
} from '../src/services/compatibility/source-strategy-resolver.service';

const predation = buildCompatibilitySpecializedSourceRoutes(['predation']);
assert.deepEqual(
  predation.map(route => route.id),
  ['predation_peer_reviewed_diet', 'predation_government_ecology', 'predation_university_ecology'],
);
assert.ok(predation[0]?.domainHints.includes('pubmed.ncbi.nlm.nih.gov'));
assert.equal(buildCompatibilitySpecializedSourceRoutes(['predation'], ['predation_peer_reviewed_diet']).length, 2);
assert.equal(hasExhaustedCompatibilitySpecializedRoutes(['predation'], predation.map(route => route.id)), true);
assert.equal(hasExhaustedCompatibilitySpecializedRoutes(['predation'], []), false);

const temperature = buildCompatibilitySpecializedSourceRoutes(['temperature']);
assert.deepEqual(
  temperature.map(route => route.id),
  ['temperature_institutional_husbandry', 'temperature_peer_reviewed_husbandry'],
);
assert.equal(hasExhaustedCompatibilitySpecializedRoutes(
  ['temperature'],
  temperature.map(route => route.id),
), true);
assert.equal(hasExhaustedCompatibilitySpecializedRoutes(['temperature'], []), false);

const phAndTank = buildCompatibilitySpecializedSourceRoutes(['ph', 'tank_size']);
assert.deepEqual(
  phAndTank.map(route => route.id),
  ['ph_institutional_husbandry', 'ph_peer_reviewed_husbandry', 'tank_size_institutional_husbandry'],
);

assert.deepEqual(classifyCompatibilityTrustedSourceUrl('https://pubmed.ncbi.nlm.nih.gov/12345/'), {
  sourceType: 'peer_reviewed',
  publisher: 'PubMed / NCBI',
});
assert.equal(classifyCompatibilityTrustedSourceUrl('https://pubmed.ncbi.nlm.nih.gov/?term=Hypancistrus+inspector+diet'), null, 'PubMed search result pages are discovery surfaces, not peer-reviewed evidence documents');
assert.equal(classifyCompatibilityTrustedSourceUrl('https://pmc.ncbi.nlm.nih.gov/?term=fish+diet'), null, 'PMC search pages must not count as evidence documents');
assert.deepEqual(classifyCompatibilityTrustedSourceUrl('https://pmc.ncbi.nlm.nih.gov/articles/PMC1234567/'), {
  sourceType: 'peer_reviewed',
  publisher: 'PubMed Central / NCBI',
});
assert.deepEqual(classifyCompatibilityTrustedSourceUrl('https://jstage.jst.go.jp/article/example/1/1/_article'), {
  sourceType: 'peer_reviewed',
  publisher: 'J-STAGE',
});
assert.equal(classifyCompatibilityTrustedSourceUrl('https://random-shop.example/fish'), null);

console.log('Compatibility source-strategy resolver PASS: field-specific routes are deterministic, exhaustible, and peer-reviewed landing pages are trusted only on explicit domains.');
