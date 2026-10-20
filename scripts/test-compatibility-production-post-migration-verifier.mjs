import assert from 'node:assert/strict';
import { getCompatibilityProductionMaterializedAuthority } from './compatibility-production-materialized-authority.ts';
import {
  CURRENT_PRODUCTION_LATEST_VERSION,
  CURRENT_PRODUCTION_MIGRATION_COUNT,
  TARGET_PRODUCTION_LATEST_VERSION,
  TARGET_PRODUCTION_MIGRATION_COUNT,
  classifyState,
  validateDetailedState,
} from './compatibility-production-post-migration-verifier.mjs';
import {
  getAuthorityKeys,
  START_MIGRATION_COUNT, START_LATEST_VERSION, START_REVIEWED_PROFILES, START_REVIEWED_PAIR_RULES, START_REVIEWED_EVIDENCE, START_REVIEWED_STAGE_RISKS,
  TARGET_MIGRATION_COUNT, TARGET_LATEST_VERSION, TARGET_REVIEWED_PROFILES, TARGET_REVIEWED_PAIR_RULES, TARGET_REVIEWED_EVIDENCE, TARGET_REVIEWED_STAGE_RISKS,
} from './compatibility-production-migration-guard.mjs';
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
import {
  START as CHRYSIPTERA_RECONCILIATION_START,
  TARGET as CHRYSIPTERA_RECONCILIATION_TARGET,
} from './compatibility-chrysiptera-production-reconciliation-guard.mjs';
import {
  START as REVIEWED_AUTHORITY_RECONCILIATION_START,
  TARGET as REVIEWED_AUTHORITY_RECONCILIATION_TARGET,
} from './compatibility-reviewed-authority-production-reconciliation-guard.mjs';

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

assert.equal(CURRENT_PRODUCTION_MIGRATION_COUNT, REVIEWED_AUTHORITY_RECONCILIATION_START.migrationCount);
assert.equal(CURRENT_PRODUCTION_LATEST_VERSION, REVIEWED_AUTHORITY_RECONCILIATION_START.latestVersion);
assert.equal(TARGET_PRODUCTION_MIGRATION_COUNT, REVIEWED_AUTHORITY_RECONCILIATION_TARGET.migrationCount);
assert.equal(TARGET_PRODUCTION_LATEST_VERSION, REVIEWED_AUTHORITY_RECONCILIATION_TARGET.latestVersion);
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

const reconciliationStart = stateFor({ migrationCount: START_MIGRATION_COUNT, latestVersion: START_LATEST_VERSION, profiles: START_REVIEWED_PROFILES, pairRules: START_REVIEWED_PAIR_RULES, evidence: START_REVIEWED_EVIDENCE, stageRisks: START_REVIEWED_STAGE_RISKS });
assert.equal(classifyState(reconciliationStart), 'READY_FOR_FULL_CHAIN_MIGRATION');
const post = stateFor({ migrationCount: TARGET_MIGRATION_COUNT, latestVersion: TARGET_LATEST_VERSION, profiles: TARGET_REVIEWED_PROFILES, pairRules: TARGET_REVIEWED_PAIR_RULES, evidence: TARGET_REVIEWED_EVIDENCE, stageRisks: TARGET_REVIEWED_STAGE_RISKS });
assert.equal(classifyState(post), 'READY_FOR_CHRYSIPTERA_RECONCILIATION');
const chrysipteraStart = stateFor(CHRYSIPTERA_RECONCILIATION_START);
assert.equal(classifyState(chrysipteraStart), 'READY_FOR_CHRYSIPTERA_RECONCILIATION');
const reviewedAuthorityStart = stateFor(REVIEWED_AUTHORITY_RECONCILIATION_START);
assert.equal(classifyState(reviewedAuthorityStart), 'READY_FOR_REVIEWED_AUTHORITY_RECONCILIATION');
const currentProduction = stateFor(REVIEWED_AUTHORITY_RECONCILIATION_TARGET);
assert.equal(classifyState(currentProduction), 'VERIFY_CURRENT_PRODUCTION');
assert.equal(classifyState({ ...current, migration_count: current.migration_count - 1 }), 'BLOCKED_STATE_DRIFT');
assert.equal(classifyState({ ...current, profiles: 100 }), 'BLOCKED_STATE_DRIFT');
assert.equal(classifyState({ ...currentProduction, evidence: REVIEWED_AUTHORITY_RECONCILIATION_TARGET.evidence - 1 }), 'BLOCKED_STATE_DRIFT');

const baselineKeys = getAuthorityKeys();
const materialized = getCompatibilityProductionMaterializedAuthority();
const keys = { ...baselineKeys, profiles: materialized.profiles.map(item => item.speciesId).sort() };
const detail = {
  profile_keys: keys.profiles,
  pair_keys: keys.pairRules,
  stage_risk_keys: keys.stageRisks,
  reviewed_evidence: REVIEWED_AUTHORITY_RECONCILIATION_TARGET.evidence,
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

assert.equal(validateDetailedState(currentProduction, detail).ready, true);
const bad = validateDetailedState(currentProduction, {
  ...detail,
  reviewed_evidence: REVIEWED_AUTHORITY_RECONCILIATION_TARGET.evidence - 1,
  tiger_guppy: { ...detail.tiger_guppy, verdict: 'caution' },
});
assert.equal(bad.ready, false);
assert.ok(bad.blockers.includes('reviewed_evidence:278/279'));
assert.ok(bad.blockers.includes('tiger_guppy_verdict:caution'));

console.log('Compatibility Production post-migration verifier contract PASS: historical migration states remain recognized, 72/109/202 requires reviewed-authority reconciliation, and 73/131/279 is the current Production verification target.');
