import { createClient } from '@supabase/supabase-js';
import { getCompatibilityEvidenceAudit } from '../../src/data/compatibilityEvidence';
import { validateStagingSupabaseConfig } from '../../apps/admin-content/scripts/staging-publishing-config.mjs';

const args = new Set(process.argv.slice(2));
const allowed = new Set(['--commit']);
const unknown = [...args].filter(arg => !allowed.has(arg));
if (unknown.length) throw new Error(`Unsupported Compatibility staging seed option(s): ${unknown.join(', ')}`);
const commit = args.has('--commit');

const config = validateStagingSupabaseConfig({
  supabaseUrl: process.env.STAGING_SUPABASE_URL,
  secretKey: process.env.STAGING_SUPABASE_SECRET_KEY,
  expectedProjectRef: process.env.STAGING_SUPABASE_PROJECT_REF,
  productionProjectRef: process.env.PRODUCTION_SUPABASE_PROJECT_REF,
});
const audit = getCompatibilityEvidenceAudit();
const sources = new Map(audit.reviewedProfiles.concat([]).flatMap(profile => profile.citations).map(source => [source.id, source]));
for (const rule of audit.reviewedPairRules) for (const source of rule.citations) sources.set(source.id, source);
const requiredSpecies = [...new Set([
  ...audit.reviewedProfiles.map(profile => profile.speciesId),
  ...audit.reviewedPairRules.flatMap(rule => rule.speciesIds),
])].sort();

console.log(JSON.stringify({
  mode: commit ? 'commit' : 'dry-run',
  target_project_ref: config.actualProjectRef,
  reviewed_evidence: sources.size,
  reviewed_profiles: audit.reviewedProfiles.length,
  reviewed_pair_rules: audit.reviewedPairRules.length,
  required_species: requiredSpecies,
}, null, 2));
if (!commit) process.exit(0);

const client = createClient(config.supabaseUrl, process.env.STAGING_SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const sameArray = (left: unknown[] | null | undefined, right: unknown[]) => JSON.stringify(left || []) === JSON.stringify(right);
const fail = (message: string): never => { throw new Error(message); };

const { data: evidenceRows, error: evidenceError } = await client.from('evidence_sources')
  .select('id,source_key,title,publisher,url,source_type,review_status,deleted_at')
  .in('source_key', [...sources.keys()]).is('deleted_at', null);
if (evidenceError) fail(`读取 Staging Evidence 失败：${evidenceError.message}`);
const evidenceByKey = new Map((evidenceRows || []).map(row => [row.source_key, row]));
for (const [sourceKey, source] of sources) {
  const row = evidenceByKey.get(sourceKey);
  if (!row) fail(`缺少 canonical Evidence ${sourceKey}；请先完成 Staging migration。`);
  if (row.title !== source.title || row.publisher !== source.publisher || row.url !== source.url || row.source_type !== source.sourceType || row.review_status !== 'reviewed') {
    fail(`Canonical Evidence drift: ${sourceKey}`);
  }
}

const { data: speciesRows, error: speciesError } = await client.from('species')
  .select('id,catalog_key,status,deleted_at').in('catalog_key', requiredSpecies).is('deleted_at', null);
if (speciesError) fail(`读取 Staging Species 失败：${speciesError.message}`);
const speciesByKey = new Map((speciesRows || []).map(row => [row.catalog_key, row]));
for (const catalogKey of requiredSpecies) {
  const row = speciesByKey.get(catalogKey);
  if (!row) fail(`缺少 Compatibility canonical Species ${catalogKey}；请先运行 Species/Care staging seed。`);
  if (row.status !== 'published') fail(`Compatibility canonical Species 尚未 Published: ${catalogKey}`);
}

const speciesIds = requiredSpecies.map(key => speciesByKey.get(key)!.id);
const { data: existingProfiles, error: profileReadError } = await client.from('species_compatibility_profiles')
  .select('id,species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,deleted_at')
  .in('species_id', speciesIds).is('deleted_at', null);
if (profileReadError) fail(`读取 Compatibility Profile 失败：${profileReadError.message}`);
const profileBySpecies = new Map((existingProfiles || []).map(row => [row.species_id, row]));
const reviewedAt = new Date().toISOString();
for (const profile of audit.reviewedProfiles) {
  const speciesId = speciesByKey.get(profile.speciesId)!.id;
  let row = profileBySpecies.get(speciesId);
  if (row) {
    if (!sameArray(row.behavior_traits, profile.behaviorTraits) || row.minimum_group_size !== (profile.minimumGroupSize ?? null) || !sameArray(row.predation_targets, profile.predationTargets) || row.confidence !== profile.confidence || row.review_status !== 'reviewed') {
      fail(`Compatibility Profile drift: ${profile.speciesId}`);
    }
  } else {
    const { data, error } = await client.from('species_compatibility_profiles').insert({
      species_id: speciesId,
      behavior_traits: profile.behaviorTraits,
      minimum_group_size: profile.minimumGroupSize ?? null,
      predation_targets: profile.predationTargets,
      confidence: profile.confidence,
      review_status: 'reviewed', reviewed_at: reviewedAt,
    }).select('id,species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,deleted_at').single();
    if (error || !data) fail(`写入 Compatibility Profile ${profile.speciesId} 失败：${error?.message || 'unknown'}`);
    row = data;
    profileBySpecies.set(speciesId, row);
  }
  const expectedSourceIds = profile.citations.map(source => evidenceByKey.get(source.id)!.id).sort();
  const { data: links, error: linksError } = await client.from('species_compatibility_profile_sources').select('source_id').eq('profile_id', row.id);
  if (linksError) fail(`读取 Profile Evidence links 失败：${linksError.message}`);
  const currentSourceIds = (links || []).map(link => link.source_id).sort();
  const extras = currentSourceIds.filter(id => !expectedSourceIds.includes(id));
  if (extras.length) fail(`Compatibility Profile Evidence drift: ${profile.speciesId}`);
  const missing = expectedSourceIds.filter(id => !currentSourceIds.includes(id));
  if (missing.length) {
    const { error } = await client.from('species_compatibility_profile_sources').insert(missing.map(source_id => ({ profile_id: row.id, source_id })));
    if (error) fail(`写入 Profile Evidence links 失败：${error.message}`);
  }
}

const expectedPairKeys = new Map(audit.reviewedPairRules.map(rule => {
  const ids = rule.speciesIds.map(key => speciesByKey.get(key)!.id).sort();
  return [`${ids[0]}__${ids[1]}`, { rule, speciesAId: ids[0], speciesBId: ids[1] }];
}));
const { data: existingPairs, error: pairReadError } = await client.from('species_pair_compatibility_rules')
  .select('id,species_a_id,species_b_id,verdict,risk_type,reason,mitigation,basis,confidence,review_status,deleted_at')
  .in('species_a_id', speciesIds).in('species_b_id', speciesIds).is('deleted_at', null);
if (pairReadError) fail(`读取 Compatibility Pair Rule 失败：${pairReadError.message}`);
const pairByKey = new Map((existingPairs || []).map(row => [`${row.species_a_id}__${row.species_b_id}`, row]));
for (const [pairKey, expected] of expectedPairKeys) {
  const { rule, speciesAId, speciesBId } = expected;
  let row = pairByKey.get(pairKey);
  if (row) {
    if (row.verdict !== rule.verdict || row.risk_type !== rule.riskType || row.reason !== rule.reason || !sameArray(row.mitigation, rule.mitigation) || row.basis !== rule.basis || row.confidence !== rule.confidence || row.review_status !== 'reviewed') {
      fail(`Compatibility Pair Rule drift: ${rule.speciesIds.join('__')}`);
    }
  } else {
    const { data, error } = await client.from('species_pair_compatibility_rules').insert({
      species_a_id: speciesAId, species_b_id: speciesBId,
      verdict: rule.verdict, risk_type: rule.riskType, reason: rule.reason,
      mitigation: rule.mitigation, basis: rule.basis, confidence: rule.confidence,
      review_status: 'reviewed', reviewed_at: reviewedAt,
    }).select('id,species_a_id,species_b_id,verdict,risk_type,reason,mitigation,basis,confidence,review_status,deleted_at').single();
    if (error || !data) fail(`写入 Compatibility Pair Rule ${rule.speciesIds.join('__')} 失败：${error?.message || 'unknown'}`);
    row = data;
    pairByKey.set(pairKey, row);
  }
  const expectedSourceIds = rule.citations.map(source => evidenceByKey.get(source.id)!.id).sort();
  const { data: links, error: linksError } = await client.from('species_pair_compatibility_rule_sources').select('source_id').eq('pair_rule_id', row.id);
  if (linksError) fail(`读取 Pair Evidence links 失败：${linksError.message}`);
  const currentSourceIds = (links || []).map(link => link.source_id).sort();
  const extras = currentSourceIds.filter(id => !expectedSourceIds.includes(id));
  if (extras.length) fail(`Compatibility Pair Evidence drift: ${rule.speciesIds.join('__')}`);
  const missing = expectedSourceIds.filter(id => !currentSourceIds.includes(id));
  if (missing.length) {
    const { error } = await client.from('species_pair_compatibility_rule_sources').insert(missing.map(source_id => ({ pair_rule_id: row.id, source_id })));
    if (error) fail(`写入 Pair Evidence links 失败：${error.message}`);
  }
}

console.log(JSON.stringify({ status: 'seeded', reviewed_profiles: audit.reviewedProfiles.length, reviewed_pair_rules: audit.reviewedPairRules.length }, null, 2));
