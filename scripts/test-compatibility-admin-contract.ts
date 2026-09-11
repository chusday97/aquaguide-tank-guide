import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { compatibilityPairRuleRevisionInputSchema, compatibilityProfileRevisionInputSchema, compatibilityProfileRevisionUpdateSchema, compatibilityRevisionReviewMutationSchema } from '../packages/contracts/src';

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
  assert.ok((profile.requiredFacts || []).length > 0, `v3 profile needs required facts: ${profile.speciesId}`);
}

assert.ok(audit.reviewedStageRiskProfiles.length > 0, 'Compatibility v3 must keep explicit reviewed Stage Risk evidence');
for (const rule of audit.reviewedStageRiskProfiles) {
  assert.equal(rule.reviewStatus, 'reviewed');
  assert.ok(rule.citations.length > 0, `Stage Risk needs dedicated evidence: ${rule.speciesId}`);
  assert.ok(rule.citations.every(source => source.reviewStatus === 'reviewed'));
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
    requiredFacts: [...(profile.requiredFacts || [])],
    ...(profile.stockingGuidance ? { stockingGuidance: profile.stockingGuidance } : {}),
    stageRiskRules: audit.reviewedStageRiskProfiles.filter(rule => rule.speciesId === profile.speciesId).map(rule => ({
      ruleKey: `${rule.speciesId}:${rule.riskType}`, youngerStages: [...rule.youngerStages], olderStages: [...rule.olderStages],
      verdict: rule.verdict, riskType: rule.riskType, reason: rule.reason, mitigation: [...rule.mitigation], basis: rule.basis,
      confidence: rule.confidence,
      citations: rule.citations.map(source => ({ sourceKey: source.id, title: source.title, publisher: source.publisher, url: source.url, sourceType: source.sourceType, reviewStatus: source.reviewStatus })),
    })),
  });
  assert.equal(parsed.success, true, `reviewed profile must be clonable into a safe revision: ${profile.speciesId}`);
}

const duplicateFactsProfile = audit.reviewedProfiles[0];
assert.ok(duplicateFactsProfile, 'one reviewed Profile fixture is required for v3 set checks');
assert.equal(compatibilityProfileRevisionInputSchema.safeParse({
  catalogKey: duplicateFactsProfile.speciesId,
  behaviorTraits: duplicateFactsProfile.behaviorTraits,
  minimumGroupSize: duplicateFactsProfile.minimumGroupSize ?? null,
  predationTargets: duplicateFactsProfile.predationTargets,
  confidence: duplicateFactsProfile.confidence,
  citations: duplicateFactsProfile.citations.map(source => ({ sourceKey: source.id, title: source.title, publisher: source.publisher, url: source.url, sourceType: source.sourceType, reviewStatus: source.reviewStatus })),
  requiredFacts: ['water', 'water'], stageRiskRules: [],
}).success, false, 'CREATE must reject duplicate requiredFacts.');
assert.equal(compatibilityProfileRevisionUpdateSchema.safeParse({ version: 1, requiredFacts: ['water', 'water'] }).success, false, 'PATCH must reject duplicate requiredFacts.');
const profileCitation = duplicateFactsProfile.citations[0];
assert.ok(profileCitation, 'Profile uniqueness fixture needs evidence');
const duplicateCitation = { sourceKey: profileCitation.id, title: profileCitation.title, publisher: profileCitation.publisher, url: profileCitation.url, sourceType: profileCitation.sourceType, reviewStatus: profileCitation.reviewStatus };
assert.equal(compatibilityProfileRevisionUpdateSchema.safeParse({ version: 1, citations: [duplicateCitation, duplicateCitation] }).success, false, 'PATCH must reject duplicate Profile citation source keys.');
const stageRiskSample = audit.reviewedStageRiskProfiles[0];
assert.ok(stageRiskSample, 'one reviewed Stage Risk fixture is required for v3 uniqueness checks');
const stageRiskCitation = stageRiskSample.citations[0];
assert.ok(stageRiskCitation, 'Stage Risk uniqueness fixture needs evidence');
const stageRiskDraft = {
  ruleKey: `${stageRiskSample.speciesId}:${stageRiskSample.riskType}`,
  youngerStages: [...stageRiskSample.youngerStages], olderStages: [...stageRiskSample.olderStages],
  verdict: stageRiskSample.verdict, riskType: stageRiskSample.riskType, reason: stageRiskSample.reason,
  mitigation: [...stageRiskSample.mitigation], basis: stageRiskSample.basis, confidence: stageRiskSample.confidence,
  citations: [{ sourceKey: stageRiskCitation.id, title: stageRiskCitation.title, publisher: stageRiskCitation.publisher, url: stageRiskCitation.url, sourceType: stageRiskCitation.sourceType, reviewStatus: stageRiskCitation.reviewStatus }],
};
assert.equal(compatibilityProfileRevisionUpdateSchema.safeParse({ version: 1, stageRiskRules: [{ ...stageRiskDraft, youngerStages: [stageRiskDraft.youngerStages[0], stageRiskDraft.youngerStages[0]] }] }).success, false, 'PATCH must reject duplicate younger life stages.');
assert.equal(compatibilityProfileRevisionUpdateSchema.safeParse({ version: 1, stageRiskRules: [stageRiskDraft, { ...stageRiskDraft }] }).success, false, 'PATCH must reject duplicate Stage Risk rule keys.');

const migration = readFileSync('supabase/migrations/202609040002_compatibility_profile_revisions.sql', 'utf8');
assert.match(migration, /create table public\.species_compatibility_profile_revisions/);
assert.match(migration, /one_active_revision_idx/);
assert.match(migration, /citation_snapshots jsonb/);
assert.match(migration, /enable row level security/);
assert.match(migration, /set_updated_at_and_version/);


for (const rule of audit.reviewedPairRules) {
  const parsed = compatibilityPairRuleRevisionInputSchema.safeParse({
    catalogKeyA: rule.speciesIds[0], catalogKeyB: rule.speciesIds[1], verdict: rule.verdict,
    riskType: rule.riskType, reason: rule.reason, mitigation: rule.mitigation,
    basis: rule.basis, confidence: rule.confidence,
    citations: rule.citations.map(source => ({ sourceKey: source.id, title: source.title, publisher: source.publisher, url: source.url, sourceType: source.sourceType, reviewStatus: source.reviewStatus })),
  });
  assert.equal(parsed.success, true, `reviewed Pair Rule must be clonable into a safe revision: ${rule.speciesIds.join('__')}`);
}
assert.equal(compatibilityPairRuleRevisionInputSchema.safeParse({
  catalogKeyA: 'sp_0431', catalogKeyB: 'sp_0431', verdict: 'caution', riskType: 'invalid_self_pair', reason: 'invalid',
  mitigation: [], basis: 'rule_inference', confidence: 'low', citations: [{ sourceKey: 'x', title: 'x', publisher: 'x', url: 'https://example.com', sourceType: 'peer_reviewed', reviewStatus: 'reviewed' }],
}).success, false, 'Pair Rule revision must reject same-species pairs');

assert.equal(compatibilityRevisionReviewMutationSchema.safeParse({ version: 2, decision: 'approve' }).success, true);
assert.equal(compatibilityRevisionReviewMutationSchema.safeParse({ version: 2, decision: 'reject' }).success, false, 'reject must require a human review note');
assert.equal(compatibilityRevisionReviewMutationSchema.safeParse({ version: 2, decision: 'reject', note: '证据不足，需要补充来源。' }).success, true);

const reviewMigration = readFileSync('supabase/migrations/202609040004_compatibility_revision_review_gate.sql', 'utf8');
assert.match(reviewMigration, /impact_report jsonb/);
assert.match(reviewMigration, /impact_checked_at timestamptz/);
assert.match(reviewMigration, /review_note text/);

const pairMigration = readFileSync('supabase/migrations/202609040003_compatibility_pair_rule_revisions.sql', 'utf8');
assert.match(pairMigration, /create table public\.species_pair_compatibility_rule_revisions/);
assert.match(pairMigration, /one_active_revision_idx/);
assert.match(pairMigration, /check \(species_a_id < species_b_id\)/);
assert.match(pairMigration, /citation_snapshots jsonb/);
assert.match(pairMigration, /enable row level security/);
assert.match(pairMigration, /set_updated_at_and_version/);


const reconciliationMigration = readFileSync('supabase/migrations/202609050001_compatibility_reviewed_baseline_reconciliation.sql', 'utf8');
assert.match(reconciliationMigration, /add column if not exists source_key text/);
assert.match(reconciliationMigration, /evidence_resolution jsonb/);
assert.match(reconciliationMigration, /compatibility_baseline_reconciliation_gate/, 'empty non-Production environments must be able to skip canonical baseline data reconciliation.');
assert.match(reconciliationMigration, /Compatibility canonical baseline is partial or not fully published/, 'partial or unpublished canonical baseline must fail closed.');
assert.match(reconciliationMigration, /existing_count = 0/, 'only a truly absent canonical baseline may skip reconciliation.');
const canonicalBaselineKeys = ['sp_0021','sp_0049','sp_0224','sp_0431','sp_0432','sp_0434','sp_0435','sp_0436','sp_0439','sp_0451','sp_0475'];
for (const catalogKey of canonicalBaselineKeys) assert.equal(reconciliationMigration.includes(`'${catalogKey}'`), true, `baseline gate must include ${catalogKey}`);
const skippedDriftGuards = reconciliationMigration.match(/if not exists \(select 1 from pg_temp\.compatibility_baseline_reconciliation_gate where mode='skip'\) then/g) || [];
assert.equal(skippedDriftGuards.length, audit.reviewedProfiles.length + audit.reviewedPairRules.length, 'every data-dependent drift assertion must honor the empty-baseline skip gate.');
const reviewedSourceKeys = new Set([
  ...audit.reviewedProfiles.flatMap(profile => profile.citations.map(source => source.id)),
  ...audit.reviewedPairRules.flatMap(rule => rule.citations.map(source => source.id)),
]);
for (const sourceKey of reviewedSourceKeys) assert.equal(reconciliationMigration.includes(sourceKey), true, `reconciliation migration must include source key: ${sourceKey}`);
for (const profile of audit.reviewedProfiles) assert.match(reconciliationMigration, new RegExp(profile.speciesId));
for (const rule of audit.reviewedPairRules) for (const speciesId of rule.speciesIds) assert.equal(reconciliationMigration.includes(speciesId), true, `reconciliation migration must include pair species: ${speciesId}`);

const compatibilityUi = readFileSync('src/pages/CompatibilityAdmin.tsx', 'utf8');
assert.doesNotMatch(compatibilityUi, /(?:indigo|violet|sky)-/, 'Compatibility Admin must not split Profile/Pair into separate blue/purple visual authorities.');
assert.match(compatibilityUi, /pending_review: 'border-amber-200 bg-amber-50 text-amber-800'/, 'Pending human review must use decision-Amber.');
assert.match(compatibilityUi, /bg-amber-600[\s\S]{0,180}批准 revision（不发布）/, 'Profile human approval must use decision-Amber.');
assert.match(compatibilityUi, /bg-amber-600[\s\S]{0,180}批准 Pair revision（不发布）/, 'Pair human approval must use decision-Amber.');
assert.match(compatibilityUi, /bg-emerald-700[\s\S]{0,180}发布 reviewed version/, 'Reviewed runtime publish must retain the Green publish action.');
assert.match(compatibilityUi, /bg-emerald-700[\s\S]{0,180}发布 Pair reviewed version/, 'Pair reviewed runtime publish must retain the Green publish action.');
assert.match(compatibilityUi, /profile-regression-report[^>]*border-slate-200 bg-slate-50/, 'Profile regression evidence is neutral reference, not a separate color authority.');
assert.match(compatibilityUi, /pair-regression-report[^>]*border-slate-200 bg-slate-50/, 'Pair regression evidence is neutral reference, not a separate color authority.');
assert.match(compatibilityUi, /profile-publish-gate-recheck[\s\S]*重新检查发布资格/, 'Approved Profile with a runtime alignment blocker must expose an executable publish-gate recheck.');
assert.match(compatibilityUi, /pair-publish-gate-recheck[\s\S]*重新检查发布资格/, 'Approved Pair with a runtime alignment blocker must expose an executable publish-gate recheck.');
assert.match(compatibilityUi, /recheckRuntimePublishGate[\s\S]*refreshReviewedAuthority/, 'Publish-gate recheck must refresh the reviewed runtime authority instead of mutating the revision.');
assert.match(compatibilityUi, /data-testid="profile-v3-authority"/, 'Profile editor must expose the Compatibility v3 authority being reviewed.');
assert.match(compatibilityUi, /data-testid="profile-stage-risk-rule"/, 'Profile editor must show Profile-owned Stage Risk rules instead of hiding them in transport state.');
assert.match(compatibilityUi, /Required Facts/, 'Profile editor must expose required decision facts to the human reviewer.');
assert.match(compatibilityUi, /独立 Stage Risk Evidence/, 'Stage Risk evidence must remain visibly separate from ordinary Profile evidence.');
assert.match(compatibilityUi, /stageRiskRules: draftForm\.stageRiskRules/, 'Saving a Profile Draft must persist the visible Stage Risk edits.');
assert.match(compatibilityUi, /requiredFacts: draftForm\.requiredFacts/, 'Saving a Profile Draft must persist required-fact edits.');
assert.match(compatibilityUi, /data-testid="profile-review-check-repair"/, 'Incomplete Profile review artifacts must expose one explicit repair action.');
assert.match(compatibilityUi, /data-testid="pair-review-check-repair"/, 'Incomplete Pair review artifacts must expose one explicit repair action.');
assert.match(compatibilityUi, /profileReviewArtifactsReady/, 'Profile approval and publish UI must share the full Impact\/Regression\/Evidence readiness gate.');
assert.match(compatibilityUi, /pairReviewArtifactsReady/, 'Pair approval and publish UI must share the full Impact\/Regression\/Evidence readiness gate.');
assert.match(compatibilityUi, /当前旧批准会撤销并回到待审核，必须重新人工批准/, 'Repair UI must disclose that stale approval is revoked.');

const routeSource = readFileSync('apps/api/src/routes/admin-compatibility.ts', 'utf8');
assert.match(routeSource, /species_compatibility_profiles[\s\S]*review_status[\s\S]*reviewed/);
assert.match(routeSource, /species_compatibility_profile_revisions[\s\S]*pending_review/);
assert.doesNotMatch(routeSource, /from\('species_compatibility_profiles'\)[\s\S]{0,120}\.update\(/, 'Draft API must never mutate reviewed profile authority');
assert.match(routeSource, /profile-revisions\/:id\/publish/);
assert.match(routeSource, /species_pair_compatibility_rule_revisions[\s\S]*pending_review/);
assert.doesNotMatch(routeSource, /from\('species_pair_compatibility_rules'\)[\s\S]{0,160}\.update\(/, 'Pair Draft API must never mutate reviewed Pair Rule authority');
assert.match(routeSource, /pair-rule-revisions\/:id\/publish/);
assert.match(routeSource, /profile-revisions\/:id\/review/);
assert.match(routeSource, /pair-rule-revisions\/:id\/review/);
assert.match(routeSource, /profile-revisions\/:id\/repair-checks/, 'Profile revisions with missing review artifacts need an explicit repair route.');
assert.match(routeSource, /pair-rule-revisions\/:id\/repair-checks/, 'Pair revisions with missing review artifacts need an explicit repair route.');
assert.match(routeSource, /reviewed_by: null[\s\S]{0,120}reviewed_at: null[\s\S]{0,120}review_note: null/, 'Repairing review artifacts must revoke any stale approval before re-review.');
assert.match(routeSource, /Compatibility regression 尚未完成，不能发布/, 'Publish API must fail closed when Regression is missing.');
assert.match(routeSource, /Canonical Profile \/ Stage Risk Evidence 尚未解析完成，不能发布/, 'Publish API must fail closed when Profile or Stage Risk canonical evidence is missing.');
assert.match(routeSource, /buildImpactReport\('profile'/);
assert.match(routeSource, /buildImpactReport\('pair_rule'/);
assert.match(routeSource, /缺少有效 impact report/);
assert.match(routeSource, /resolveReviewedEvidenceSnapshots/);
assert.match(routeSource, /source_key/);
assert.match(routeSource, /evidence_resolution/);
assert.match(routeSource, /Canonical Profile \/ Stage Risk Evidence 尚未解析完成/);
assert.match(routeSource, /buildProfileRevisionRegression/);
assert.match(routeSource, /buildPairRuleRevisionRegression/);
assert.match(routeSource, /regression_report/);
assert.match(routeSource, /Compatibility regression 尚未完成/);

const publishMigration = readFileSync('supabase/migrations/202609050002_compatibility_versioned_publish.sql', 'utf8');
assert.match(publishMigration, /publish_compatibility_profile_revision/);
assert.match(publishMigration, /publish_compatibility_pair_rule_revision/);
assert.match(publishMigration, /revision_not_approved/);
assert.match(publishMigration, /impact_missing/);
assert.match(publishMigration, /regression_report jsonb/);
assert.match(publishMigration, /compatibility_authority_state/);
assert.match(publishMigration, /regression_missing/);
assert.match(publishMigration, /regression_authority/);
assert.match(publishMigration, /regression_baseline/);
assert.match(publishMigration, /version=version\+1/);
assert.match(publishMigration, /compatibility_species_publication_bump_authority/);
assert.match(publishMigration, /compatibility_evidence_bump_authority/);
assert.match(publishMigration, /compatibility_profiles_bump_authority/);
assert.match(publishMigration, /compatibility_pair_rules_bump_authority/);
assert.match(publishMigration, /enable row level security/);
assert.match(publishMigration, /evidence_resolution_missing/);
assert.match(publishMigration, /VERSION_CONFLICT: baseline/);

const v3Migration = readFileSync('supabase/migrations/202609110001_compatibility_v3_profile_authority.sql', 'utf8');
assert.match(v3Migration, /^-- Compatibility v3 Profile authority extension\.[\s\S]*?\nbegin;/, 'v3 migration must run inside an explicit transaction boundary.');
assert.match(v3Migration, /commit;\s*$/, 'v3 migration must commit only after all schema, backfill and RPC changes succeed.');
assert.match(v3Migration, /required_facts text\[\]/, 'v3 Profile authority must persist required facts.');
assert.match(v3Migration, /is_valid_compatibility_stocking_guidance/, 'v3 migration must validate the complete stocking guidance shape at the database boundary.');
assert.match(v3Migration, /PUBLISH_GATE_REJECTED: stocking_guidance_invalid/, 'DB publish must reject malformed stocking guidance even if the Admin API is bypassed.');
assert.match(v3Migration, /profile_citation_duplicate/, 'DB publish must reject duplicate Profile citation source keys explicitly.');
assert.match(v3Migration, /stocking_guidance jsonb/, 'v3 Profile authority must persist stocking guidance.');
assert.match(v3Migration, /species_compatibility_profile_stage_risks/, 'Stage Risk must be Profile-owned reviewed authority.');
assert.match(v3Migration, /species_compatibility_profile_stage_risk_sources/, 'Stage Risk evidence must use an independent canonical link table.');
assert.match(v3Migration, /cardinality\(younger_stages\)>0[\s\S]*unknown[\s\S]*juvenile[\s\S]*adult[\s\S]*fry[\s\S]*subadult/, 'Stage Risk younger stages must be non-empty and DB-enum constrained.');
assert.match(v3Migration, /cardinality\(older_stages\)>0[\s\S]*unknown[\s\S]*juvenile[\s\S]*adult[\s\S]*fry[\s\S]*subadult/, 'Stage Risk older stages must be non-empty and DB-enum constrained.');
assert.match(v3Migration, /stage_risk_sources_public_select[\s\S]*species_compatibility_profiles[\s\S]*s\.status='published'/, 'Stage Risk source links must inherit reviewed Profile + published Species visibility.');
assert.match(v3Migration, /Historical rejected\/published\/superseded revisions remain untouched[\s\S]*r\.status in \('draft','pending_review','approved'\)/, 'v3 snapshot backfill must not rewrite historical revisions.');
assert.match(v3Migration, /stage_risk_evidence_resolution jsonb/, 'Stage Risk revision evidence must be independently resolved.');
assert.match(v3Migration, /status=case when status='approved' then 'pending_review'/, 'v3 migration must revoke stale approvals before re-review.');
assert.match(v3Migration, /guppy-cannibalism-refuge-study/);
assert.match(v3Migration, /guppy-fry-yield-cannibalism-study/);
assert.match(v3Migration, /required_facts_invalid/, 'DB publish must reject missing or invalid Compatibility v3 required facts.');
assert.match(v3Migration, /stage_risk_shape_invalid/, 'DB publish must reject malformed Stage Risk rules.');
assert.match(v3Migration, /stage_risk_rule_key_duplicate/, 'DB publish must reject duplicate Stage Risk rule keys.');
assert.match(v3Migration, /stage_risk_citation_duplicate/, 'DB publish must reject duplicate or blank Stage Risk citation source keys.');
assert.match(v3Migration, /is_unique_text_array/, 'v3 migration must preserve set semantics for requiredFacts and Stage Risk life-stage arrays.');
assert.match(v3Migration, /compatibility_profiles_required_facts_v3_check/, 'Reviewed Profile rows must enforce requiredFacts at the database boundary.');
assert.match(v3Migration, /requiredFacts backfill incomplete for catalog keys/, 'v3 migration must fail with actionable reviewed-Profile diagnostics before installing requiredFacts constraints.');
assert.match(v3Migration, /active Profile revision requiredFacts backfill incomplete/, 'v3 migration must fail with actionable active-revision diagnostics instead of an opaque CHECK violation.');
assert.match(v3Migration, /status in \('rejected','published','superseded'\)[\s\S]*cardinality\(required_facts\)>0/, 'Active revisions must enforce v3 requiredFacts while legacy historical revisions remain readable.');
assert.match(v3Migration, /stage_risk_evidence_resolution_missing/);
assert.match(v3Migration, /VERSION_CONFLICT: stage_risk_evidence/);
assert.match(v3Migration, /delete from public\.species_compatibility_profile_stage_risks where profile_id=v_baseline\.id/);
assert.match(v3Migration, /publish_compatibility_profile_revision/);
assert.match(publishMigration, /VERSION_CONFLICT: evidence/);
assert.match(publishMigration, /for update/);
assert.match(publishMigration, /status='published'/);
assert.match(routeSource, /rpc\('publish_compatibility_profile_revision'/);
assert.match(routeSource, /rpc\('publish_compatibility_pair_rule_revision'/);


console.log(`compatibility admin contract: ${audit.reviewedProfiles.length} reviewed profiles / ${audit.reviewedPairRules.length} reviewed pair rules, all evidence-linked`);
