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
import {
  START as FAST_LANE_WAVE1_START,
} from './compatibility-fast-lane-production-patch-guard.mjs';
import {
  START as FAST_LANE_WAVE2_START,
  TARGET as FAST_LANE_WAVE2_TARGET,
} from './compatibility-fast-lane-wave2-production-patch-guard.mjs';
import {
  START as FAST_LANE_WAVE3_START,
  TARGET as FAST_LANE_WAVE3_TARGET,
} from './compatibility-fast-lane-wave3-production-patch-guard.mjs';
import {
  START as FAST_LANE_WAVE4_START,
  TARGET as FAST_LANE_WAVE4_TARGET,
} from './compatibility-fast-lane-wave4-production-patch-guard.mjs';

const stateFor = point => ({
  migration_count: point.migrationCount,
  latest_version: point.latestVersion,
  content_publications_exists: true,
  species: 486,
  feeding: 486,
  care: 41,
  care_steps: 128,
  content_publications: 527,
  species_assets: 0,
  care_assets: 0,
  profiles: point.profiles,
  pair_rules: point.pairRules,
  evidence: point.evidence,
  stage_risks: point.stageRisks,
  authority_state_exists: true,
  stage_risks_exists: true,
});

assert.equal(CURRENT_PRODUCTION_MIGRATION_COUNT, FAST_LANE_WAVE4_START.migrationCount);
assert.equal(CURRENT_PRODUCTION_LATEST_VERSION, FAST_LANE_WAVE4_START.latestVersion);
assert.equal(TARGET_PRODUCTION_MIGRATION_COUNT, FAST_LANE_WAVE4_TARGET.migrationCount);
assert.equal(TARGET_PRODUCTION_LATEST_VERSION, FAST_LANE_WAVE4_TARGET.latestVersion);
assert.deepEqual(FAST_LANE_WAVE2_TARGET, FAST_LANE_WAVE3_START, 'wave2 target must exactly equal wave3 start');
assert.deepEqual(FAST_LANE_WAVE3_TARGET, FAST_LANE_WAVE4_START, 'wave3 target must exactly equal wave4 start');

const wave1Start = stateFor(FAST_LANE_WAVE1_START);
assert.equal(classifyState(wave1Start), 'READY_FOR_FAST_LANE_WAVE1_MIGRATION');

const current = stateFor(FAST_LANE_WAVE2_START);
assert.equal(classifyState(current), 'READY_FOR_FAST_LANE_WAVE2_MIGRATION');

const wave3Start = stateFor(FAST_LANE_WAVE3_START);
assert.equal(classifyState(wave3Start), 'READY_FOR_FAST_LANE_WAVE3_MIGRATION');

const wave4Start = stateFor(FAST_LANE_WAVE4_START);
assert.equal(classifyState(wave4Start), 'READY_FOR_FAST_LANE_WAVE4_MIGRATION');

const post = stateFor(FAST_LANE_WAVE4_TARGET);
assert.equal(classifyState(post), 'VERIFY_POST_MIGRATION');
assert.equal(classifyState({ ...current, migration_count: current.migration_count - 1 }), 'BLOCKED_STATE_DRIFT');
assert.equal(classifyState({ ...current, profiles: 100 }), 'BLOCKED_STATE_DRIFT');
assert.equal(classifyState({ ...post, evidence: FAST_LANE_WAVE4_TARGET.evidence - 1 }), 'BLOCKED_STATE_DRIFT');

const keys = getAuthorityKeys();
const detail = {
  profile_keys: keys.profiles,
  pair_keys: keys.pairRules,
  stage_risk_keys: keys.stageRisks,
  reviewed_evidence: FAST_LANE_WAVE4_TARGET.evidence,
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
  reviewed_evidence: FAST_LANE_WAVE4_TARGET.evidence - 1,
  tiger_guppy: { ...detail.tiger_guppy, verdict: 'caution' },
});
assert.equal(bad.ready, false);
assert.ok(bad.blockers.includes('reviewed_evidence:188/189'));
assert.ok(bad.blockers.includes('tiger_guppy_verdict:caution'));

console.log('Compatibility Production post-migration verifier contract PASS: 65/177 -> wave1, 66/180 -> wave2, 67/181 -> wave3, 68/184 -> wave4, 69/189 -> final verification.');
