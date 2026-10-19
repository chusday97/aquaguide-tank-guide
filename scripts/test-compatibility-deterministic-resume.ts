import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  retryCompatibilityDeterministicExtractionFromResume,
  researchCompatibilitySpeciesWithResume,
  buildCompatibilityResearchProviderConfig,
  type CompatibilityResearchResumeBundle,
} from '../apps/api/src/compatibility-species-research-provider';

const fixtureConfig = {
  ...buildCompatibilityResearchProviderConfig({}),
  apiKey: 'test-key',
  baseUrl: 'https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
  model: 'qwen-test',
  timeoutMs: 1000,
  maxSearchCandidates: 4,
  maxVerifiedSources: 2,
  maxSourceChars: 8000,
};
const url = 'https://www.fishipedia.fr/fr/poissons/testus-exactus';
const html = `<html><body><h1>Testus exactus</h1><p>Testus exactus est un poisson vivant en eau douce.</p><p>Température 22 - 26 °C pH (acidité) 7.2 - 7.8 Volume min 200 litres territorialité Non</p>${'exact-taxon husbandry context '.repeat(80)}</body></html>`;
let providerCalls = 0;
const sourceOnly = await researchCompatibilitySpeciesWithResume({
  catalogKey: 'sp_deterministic_fixture', scientificName: 'Testus exactus', targetFields: ['water','temperature','ph','tank_size','territoriality'],
}, {
  config: fixtureConfig,
  skipAiExtraction: true,
  skipModelDiscovery: true,
  fetchImpl: async input => {
    const target = String(input);
    if (target.includes('maas.aliyuncs.com')) { providerCalls += 1; throw new Error('must not call provider'); }
    if (target === url) return new Response(html, { status: 200, headers: { 'content-type': 'text/html' } });
    return new Response('not found', { status: 404 });
  },
});
assert.equal(providerCalls, 0);
const packet = await retryCompatibilityDeterministicExtractionFromResume(sourceOnly.resumeBundle);
assert.equal(packet.diagnostics?.extractionStatus, 'transport_unavailable');
assert.deepEqual(Object.fromEntries(packet.claims.map(claim => [claim.field, claim.proposedValue])), {
  water: 'freshwater',
  temperature: { min: 22, max: 26 },
  ph: { min: 7.2, max: 7.8 },
  tank_size: { liters: 200, lengthCm: null },
  territoriality: { traits: [] },
});
assert.match(packet.claims.find(claim => claim.field === 'territoriality')?.note || '', /non-territorial/i);

const snapshot = (
  url: string,
  title: string,
  publisher: string,
  sourceType: 'curated_husbandry' | 'university' | 'professional_association',
  text: string,
) => ({
  url,
  title,
  publisher,
  sourceType,
  text,
  contentSha256: createHash('sha256').update(text).digest('hex'),
});

const seriouslyText = `Testus exactus Quick facts Max size 60 mm SL Aquarium size 45 × 30 cm Temp 17–28 °C pH 7.0–8.5 Hardness 8–30 dGH. ${'exact taxon context '.repeat(80)}`;
const adwText = `Testus exactus Habitat Testus exactus mainly occupies fresh inland waters and wetlands in temperate regions. Habitat Regions temperate freshwater. ${'exact taxon context '.repeat(80)}`;
const fallbackBundle: CompatibilityResearchResumeBundle = {
  providerId: 'fixture',
  catalogKey: 'fallback_fixture',
  commonName: 'Fallback fixture',
  scientificName: 'Testus exactus',
  targetFields: ['water', 'temperature', 'ph'],
  documents: [
    snapshot('https://www.seriouslyfish.com/species/testus-exactus', 'Testus exactus', 'Seriously Fish', 'curated_husbandry', seriouslyText),
    snapshot('https://animaldiversity.org/accounts/Testus_exactus', 'Testus exactus', 'Animal Diversity Web, University of Michigan', 'university', adwText),
  ],
};
const fallbackPacket = await retryCompatibilityDeterministicExtractionFromResume(fallbackBundle);
assert.deepEqual(Object.fromEntries(fallbackPacket.claims.map(claim => [claim.field, claim.proposedValue])), {
  water: 'freshwater',
  temperature: { min: 17, max: 28 },
  ph: { min: 7, max: 8.5 },
}, 'trusted fallback sources may fill explicit candidate fields without model extraction');

const fishipediaSnapshot = sourceOnly.resumeBundle.documents.find(document => document.publisher === 'Fishipedia');
assert.ok(fishipediaSnapshot);
const precedenceBundle: CompatibilityResearchResumeBundle = {
  ...fallbackBundle,
  targetFields: ['temperature', 'ph'],
  documents: [fishipediaSnapshot, fallbackBundle.documents[0]],
};
const precedencePacket = await retryCompatibilityDeterministicExtractionFromResume(precedenceBundle);
assert.deepEqual(Object.fromEntries(precedencePacket.claims.map(claim => [claim.field, claim.proposedValue])), {
  temperature: { min: 22, max: 26 },
  ph: { min: 7.2, max: 7.8 },
}, 'Fishipedia explicit labels must outrank Seriously Fish fallback ranges instead of creating conflicts');

const multiEnvironmentText = `Testus exactus Environment: Freshwater; brackish; benthopelagic. ${'exact taxon ecology context '.repeat(80)}`;
const multiEnvironmentBundle: CompatibilityResearchResumeBundle = {
  ...fallbackBundle,
  targetFields: ['water'],
  documents: [
    snapshot(
      'https://www.fishbase.se/summary/Testus-exactus.html',
      'Testus exactus summary',
      'FishBase',
      'professional_association',
      multiEnvironmentText,
    ),
  ],
};
const multiEnvironmentPacket = await retryCompatibilityDeterministicExtractionFromResume(multiEnvironmentBundle);
assert.deepEqual(
  multiEnvironmentPacket.claims,
  [],
  'an exact-taxon source that explicitly supports both freshwater and brackish must stay unresolved under the current single-value water contract',
);

const raw = readFileSync('evaluation/product/compatibility-deterministic-resume-review.v1.json', 'utf8');
const report = JSON.parse(raw);
assert.equal(report.resumableJobs, 9);
assert.equal(report.modelCalls, 0);
assert.equal(report.writesAuthority, false);
assert.equal(report.repeatedIdentityLookup, false);
assert.equal(report.repeatedSourceDiscovery, false);
assert.equal(report.repeatedSourceFetch, false);
assert.ok(report.deterministicSupportedFields > 0);
assert.ok(report.modelOrManualRequiredFields > 0);
assert.equal(raw.includes('"text"'), false);
assert.equal(raw.includes('apiKey'), false);
console.log(`Compatibility deterministic resume PASS: ${report.deterministicSupportedFields}/${report.targetFields} target fields resolve from cached explicit evidence with zero provider/refetch calls; ${report.modelOrManualRequiredFields} stay fail-closed for model/manual review.`);
