import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { compatibilityProfileRevisionInputSchema } from '../packages/contracts/src';

const audit = getCompatibilityEvidenceAudit();
const speciesIds = new Set(fishData.map(item => item.id));

assert.equal(audit.reviewedProfiles.length, 7, 'current reviewed behavior-profile baseline must remain explicit');
assert.equal(audit.reviewedPairRules.length, 4, 'current reviewed pair-rule baseline must remain explicit');
assert.deepEqual(new Set(audit.reviewedSpeciesIds), new Set(audit.reviewedProfiles.map(profile => profile.speciesId)));

for (const profile of audit.reviewedProfiles) {
  assert.equal(profile.reviewStatus, 'reviewed');
  assert.ok(speciesIds.has(profile.speciesId), `profile species must exist: ${profile.speciesId}`);
  assert.ok(profile.behaviorTraits.length > 0, `profile needs reviewed behavior traits: ${profile.speciesId}`);
  assert.ok(profile.citations.length > 0, `profile needs evidence: ${profile.speciesId}`);
  assert.ok(profile.citations.every(source => source.reviewStatus === 'reviewed'));
}

for (const rule of audit.reviewedPairRules) {
  assert.equal(rule.reviewStatus, 'reviewed');
  assert.notEqual(rule.speciesIds[0], rule.speciesIds[1]);
  assert.ok(rule.speciesIds.every(id => speciesIds.has(id)), `pair species must exist: ${rule.speciesIds.join('__')}`);
  assert.ok(rule.reason.trim().length > 0);
  assert.ok(rule.citations.length > 0);
  assert.ok(rule.citations.every(source => source.reviewStatus === 'reviewed'));
}


for (const profile of audit.reviewedProfiles) {
  const parsed = compatibilityProfileRevisionInputSchema.safeParse({
    catalogKey: profile.speciesId,
    behaviorTraits: profile.behaviorTraits,
    minimumGroupSize: profile.minimumGroupSize ?? null,
    predationTargets: profile.predationTargets,
    confidence: profile.confidence,
    citations: profile.citations.map(source => ({ sourceKey: source.id, title: source.title, publisher: source.publisher, url: source.url, sourceType: source.sourceType, reviewStatus: source.reviewStatus })),
  });
  assert.equal(parsed.success, true, `reviewed profile must be clonable into a safe revision: ${profile.speciesId}`);
}

const migration = readFileSync('supabase/migrations/202609040002_compatibility_profile_revisions.sql', 'utf8');
assert.match(migration, /create table public\.species_compatibility_profile_revisions/);
assert.match(migration, /one_active_revision_idx/);
assert.match(migration, /citation_snapshots jsonb/);
assert.match(migration, /enable row level security/);
assert.match(migration, /set_updated_at_and_version/);

const routeSource = readFileSync('apps/api/src/routes/admin-compatibility.ts', 'utf8');
assert.match(routeSource, /species_compatibility_profiles[\s\S]*review_status[\s\S]*reviewed/);
assert.match(routeSource, /species_compatibility_profile_revisions[\s\S]*pending_review/);
assert.doesNotMatch(routeSource, /from\('species_compatibility_profiles'\)[\s\S]{0,120}\.update\(/, 'Draft API must never mutate reviewed profile authority');
assert.doesNotMatch(routeSource, /profile-revisions\/:id\/publish/, 'reviewed publish is intentionally unavailable in this round');

console.log(`compatibility admin contract: ${audit.reviewedProfiles.length} reviewed profiles / ${audit.reviewedPairRules.length} reviewed pair rules, all evidence-linked`);
