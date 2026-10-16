import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  retryCompatibilityDeterministicExtractionFromResume,
  researchCompatibilitySpeciesWithResume,
  buildCompatibilityResearchProviderConfig,
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
  catalogKey: 'sp_deterministic_fixture', scientificName: 'Testus exactus', targetFields: ['temperature','ph','tank_size','territoriality'],
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
  temperature: { min: 22, max: 26 },
  ph: { min: 7.2, max: 7.8 },
  tank_size: { liters: 200, lengthCm: null },
  territoriality: { traits: [] },
});
assert.match(packet.claims.find(claim => claim.field === 'territoriality')?.note || '', /non-territorial/i);

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
