import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createAuthorityEvidenceProvider, type ReviewedCompatibilityAuthority } from '../apps/api/src/compatibility-authority';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import type { Aquarium, Fish } from '../src/types';

const migration = readFileSync('supabase/migrations/20261022111410_compatibility_field_authority.sql', 'utf8');
const aclMigration = readFileSync('supabase/migrations/20261022111709_compatibility_function_acl_hardening.sql', 'utf8');
const adminRoute = readFileSync('apps/api/src/routes/admin-compatibility.ts', 'utf8');
const authorityLoader = readFileSync('apps/api/src/compatibility-authority.ts', 'utf8');

assert.match(migration, /create table if not exists public\.species_compatibility_field_reviews/i);
assert.match(migration, /create table if not exists public\.species_compatibility_field_review_sources/i);
assert.match(migration, /alter table public\.species_compatibility_field_reviews enable row level security/i);
assert.match(migration, /alter table public\.species_compatibility_field_review_sources enable row level security/i);
assert.match(migration, /revoke all on table public\.species_compatibility_field_reviews from anon, authenticated/i);
assert.match(migration, /grant select, insert, update, delete on table public\.species_compatibility_field_reviews to service_role/i);
assert.match(migration, /create or replace function public\.persist_species_compatibility_field_authority/i);
assert.match(migration, /security invoker/i);
assert.match(migration, /revoke all on function public\.persist_species_compatibility_field_authority[\s\S]*from public, anon, authenticated/i);
assert.match(migration, /grant execute on function public\.persist_species_compatibility_field_authority[\s\S]*to service_role/i);
assert.match(migration, /'draft'/i, 'new catalog object must remain draft');
assert.match(migration, /array\['adult_size','temperature','water'\]::text\[] <@ v_approved_fields/i);
assert.match(migration, /'createsPairRules',false/i);
assert.equal(/insert\s+into\s+public\.species_pair_compatibility_rules/i.test(migration), false);
assert.equal(/insert\s+into\s+public\.species_compatibility_profiles/i.test(migration), false);

assert.match(aclMigration, /revoke all on function public\.bump_compatibility_authority_state\(\)[\s\S]*from public, anon, authenticated/i);
assert.match(aclMigration, /grant execute on function public\.bump_compatibility_authority_state\(\)[\s\S]*to service_role/i);
assert.match(aclMigration, /revoke all on function public\.bump_compatibility_for_evidence_change\(\)[\s\S]*from public, anon, authenticated/i);
assert.match(aclMigration, /revoke all on function public\.bump_compatibility_for_species_publication\(\)[\s\S]*from public, anon, authenticated/i);
assert.match(aclMigration, /publish_compatibility_profile_revision\(uuid,integer\)[\s\S]*to authenticated, service_role/i);
assert.match(aclMigration, /publish_compatibility_pair_rule_revision\(uuid,integer\)[\s\S]*to authenticated, service_role/i);

assert.match(adminRoute, /post\('\/onboarding\/approve-fields'/);
assert.match(adminRoute, /createGbifSpeciesIdentityResolver\(\)\.resolve\(species\.scientificName\)/);
assert.match(adminRoute, /assessCompatibilitySpeciesResearchPacket\(packet\)/);
assert.match(adminRoute, /buildReviewedCompatibilityFieldAuthority\(assessment/);
assert.match(adminRoute, /persist_species_compatibility_field_authority/);
assert.match(adminRoute, /p_species:\s*snakeize\(species\)/);
assert.match(adminRoute, /writesPairRules:\s*false/);
assert.match(adminRoute, /publishesSpecies:\s*false/);

assert.match(authorityLoader, /from\('species_compatibility_field_reviews'\)/);
assert.match(authorityLoader, /\.eq\('status', 'published'\)/, 'user runtime must only resolve published species');
assert.match(authorityLoader, /getReviewedSpeciesFact:\s*species => fieldAuthorities\.get\(species\.id\)\?\.fact/);
assert.match(authorityLoader, /getReviewedFieldCitations:/);

const citation = {
  id: 'field-source-water',
  title: 'Reviewed freshwater source',
  publisher: 'Fixture University',
  url: 'https://example.invalid/field-water',
  sourceType: 'university' as const,
  reviewStatus: 'reviewed' as const,
  version: 1,
};

const authority: ReviewedCompatibilityAuthority = {
  profiles: [],
  pairRules: [],
  fieldAuthorities: [{
    catalogKey: 'runtime-field-fish',
    approvedFields: ['water', 'temperature', 'adult_size'],
    fact: {
      id: 'runtime-field-fish',
      waterType: 'freshwater',
      waterTypes: ['freshwater'],
      temperatureMinC: 22,
      temperatureMaxC: 28,
      phMin: null,
      phMax: null,
      minTankLiters: null,
      minTankLengthCm: null,
      reviewed: false,
      compatibilityRequiredFacts: ['water', 'temperature', 'adult_size'],
      compatibilityFactDispositions: {
        water: 'ready',
        temperature: 'ready',
        ph: 'research_pending',
        adult_size: 'ready',
        tank_size: 'research_pending',
        social_behavior: 'research_pending',
        territoriality: 'research_pending',
        predation: 'research_pending',
      },
      compatibilityReviewedFacts: ['water', 'temperature', 'adult_size'],
      adultLengthMinCm: 4,
      adultLengthMaxCm: 7,
      evidenceIds: [citation.id],
      lifeType: 'fish',
      size: 'Small',
    },
    fieldCitations: {
      water: [citation],
      temperature: [citation],
      adult_size: [citation],
    },
    version: 1,
  }],
  authority: 'reviewed-db',
  counts: { profiles: 0, pairRules: 0, fieldAuthoritySpecies: 1, fieldReviews: 3 },
};

const provider = createAuthorityEvidenceProvider(authority, 'field-persistence-test');
assert.equal(provider.getProfile('runtime-field-fish'), undefined);
assert.equal(provider.getPairRule('runtime-field-fish', 'anything'), undefined);
assert.equal(provider.getReviewedSpeciesFact?.({
  id: 'runtime-field-fish',
  name: 'Runtime field fish',
  scientificName: 'Fixtureus runtime',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '',
  waterChangeCycle: 7,
  description: '',
  diet: '杂食',
  tankSize: '',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
  waterType: 'freshwater',
})?.reviewed, false);
assert.equal(provider.getReviewedFieldCitations?.('runtime-field-fish', 'water')?.[0]?.id, citation.id);

const candidate: Fish = {
  id: 'runtime-field-fish',
  name: 'Runtime field fish',
  scientificName: 'Fixtureus runtime',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '',
  waterChangeCycle: 7,
  description: '',
  diet: '杂食',
  tankSize: '',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
  waterType: 'freshwater',
};
const tank: Aquarium = {
  id: 'field-persistence-tank',
  name: 'Field persistence tank',
  fishes: [],
  dimensions: { length: '120', width: '45', height: '45' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const decision = evaluateTankCompatibility({
  tank,
  existingSpecies: [],
  candidateSpecies: candidate,
  evidenceProvider: provider,
});
assert.notEqual(decision.status, 'insufficient_data');
assert.equal(decision.metadata.decisionReadiness, 'partial');
assert.ok(decision.metadata.domainRuleCodes.includes('risk_coverage_partial'));
assert.equal(decision.metadata.domainRuleCodes.includes('reviewed_pair_rule'), false);
assert.ok(decision.evidenceIds?.includes(citation.id));

console.log('PASS persistence migration stores field authority behind RLS and service-role-only SECURITY INVOKER RPC');
console.log('PASS approval API revalidates identity/research and never publishes species or writes pair rules');
console.log('PASS published DB field authority becomes a partial DomainSpeciesFact without a full profile');
console.log('PASS field-level citations reach compatibility results');
