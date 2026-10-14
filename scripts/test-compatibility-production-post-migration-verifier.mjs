import assert from 'node:assert/strict';
import {
  CURRENT_PRODUCTION_LATEST_VERSION,
  CURRENT_PRODUCTION_MIGRATION_COUNT,
  TARGET_PRODUCTION_LATEST_VERSION,
  TARGET_PRODUCTION_MIGRATION_COUNT,
  classifyState,
  validateDetailedState,
} from './compatibility-production-post-migration-verifier.mjs';
import { getAuthorityKeys } from './compatibility-production-migration-guard.mjs';

const current = {
  migration_count: CURRENT_PRODUCTION_MIGRATION_COUNT,
  latest_version: CURRENT_PRODUCTION_LATEST_VERSION,
  content_publications_exists: true,
  species: 486,
  feeding: 486,
  care: 41,
  care_steps: 128,
  content_publications: 527,
  species_assets: 0,
  care_assets: 0,
  profiles: 63,
  pair_rules: 21,
  evidence: 116,
  stage_risks: 1,
  authority_state_exists: true,
  stage_risks_exists: true,
};
assert.equal(classifyState(current), 'READY_FOR_INCREMENTAL_MIGRATION');

const post = {
  ...current,
  migration_count: TARGET_PRODUCTION_MIGRATION_COUNT,
  latest_version: TARGET_PRODUCTION_LATEST_VERSION,
  profiles: 101,
  evidence: 177,
};
assert.equal(classifyState(post), 'VERIFY_POST_MIGRATION');
assert.equal(classifyState({ ...current, migration_count: 61 }), 'BLOCKED_STATE_DRIFT');
assert.equal(classifyState({ ...current, profiles: 64 }), 'BLOCKED_STATE_DRIFT');
assert.equal(classifyState({ ...post, evidence: 176 }), 'BLOCKED_STATE_DRIFT');

const keys = getAuthorityKeys();
const detail = {
  profile_keys: keys.profiles,
  pair_keys: keys.pairRules,
  stage_risk_keys: keys.stageRisks,
  reviewed_evidence: 177,
  authority_singleton: 1,
  tiger_guppy: {
    verdict: 'not_recommended',
    risk_type: 'fin_nipping_long_fin_conflict',
    reason: '孔雀鱼与虎皮鱼存在直接追鳍和长鳍冲突。',
    basis: 'pair_rule',
    confidence: 'high',
    source_keys: ['seriouslyfish-poecilia-reticulata', 'seriouslyfish-puntigrus-tetrazona'],
  },
  guppy_stage_risk: {
    rule_key: 'sp_0436:conspecific_fry_predation',
    verdict: 'not_recommended',
    risk_type: 'conspecific_fry_predation',
    younger_stages: ['fry'],
    older_stages: ['adult'],
    reason: '成鱼可能捕食同种幼鱼。',
    source_keys: ['guppy-cannibalism-refuge-study', 'guppy-fry-yield-cannibalism-study'],
  },
};

assert.equal(validateDetailedState(post, detail).ready, true);
const bad = validateDetailedState(post, {
  ...detail,
  reviewed_evidence: 176,
  tiger_guppy: { ...detail.tiger_guppy, verdict: 'caution' },
});
assert.equal(bad.ready, false);
assert.ok(bad.blockers.includes('reviewed_evidence:176/177'));
assert.ok(bad.blockers.includes('tiger_guppy_verdict:caution'));

console.log('Compatibility Production post-migration verifier contract PASS: current 60/63/116 state, target 65/101/177 state, exact authority/evidence validation.');
