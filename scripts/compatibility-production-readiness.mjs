import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence.ts';
import {
  PRODUCTION_PROJECT_REF,
  readLinkedProjectRef,
} from './compatibility-production-migration-guard.mjs';
import {
  readState,
  readDetailedState,
} from './compatibility-production-post-migration-verifier.mjs';

const audit = getCompatibilityEvidenceAudit();
const expected = {
  profiles: audit.reviewedProfiles.length,
  pairRules: audit.reviewedPairRules.length,
  stageRisks: audit.reviewedStageRiskProfiles.length,
};

const envInt = (name, fallback = 0) => {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) ? value : fallback;
};
const envBool = name => ['1','true','yes'].includes(String(process.env[name] || '').toLowerCase());

export const buildReadiness = live => {
  const blockers = [];
  if (!live.schemaV3) blockers.push('compatibility_schema_v3_not_ready');
  if (live.profiles !== expected.profiles) blockers.push(`reviewed_profiles:${live.profiles}/${expected.profiles}`);
  if (live.pairRules !== expected.pairRules) blockers.push(`reviewed_pair_rules:${live.pairRules}/${expected.pairRules}`);
  if (live.stageRisks !== expected.stageRisks) blockers.push(`reviewed_stage_risks:${live.stageRisks}/${expected.stageRisks}`);
  if (live.evidenceSources <= 0) blockers.push('reviewed_evidence_sources_missing');

  return {
    phase: blockers.length ? 'BLOCKED_COMPATIBILITY_DB' : 'READY_COMPATIBILITY_DB',
    expected,
    live,
    blockers,
    mutationAuthorized: false,
  };
};

export const readLiveFromEnv = () => ({
  schemaV3: envBool('AQUAGUIDE_COMPAT_SCHEMA_V3'),
  profiles: envInt('AQUAGUIDE_COMPAT_REVIEWED_PROFILES'),
  pairRules: envInt('AQUAGUIDE_COMPAT_REVIEWED_PAIR_RULES'),
  stageRisks: envInt('AQUAGUIDE_COMPAT_REVIEWED_STAGE_RISKS'),
  evidenceSources: envInt('AQUAGUIDE_COMPAT_EVIDENCE_SOURCES'),
  source: 'env',
});

export const readLiveFromProduction = () => {
  const linkedRef = readLinkedProjectRef();
  if (linkedRef !== PRODUCTION_PROJECT_REF) {
    throw new Error(`Linked Supabase ref mismatch: ${linkedRef}`);
  }
  const state = readState();
  const detail = state.stage_risks_exists && state.authority_state_exists
    ? readDetailedState()
    : { profile_keys: [], pair_keys: [], stage_risk_keys: [], reviewed_evidence: 0 };

  return {
    schemaV3: Boolean(
      state.content_publications_exists
      && state.authority_state_exists
      && state.stage_risks_exists
    ),
    profiles: detail.profile_keys.length,
    pairRules: detail.pair_keys.length,
    stageRisks: detail.stage_risk_keys.length,
    evidenceSources: detail.reviewed_evidence || 0,
    migrationCount: state.migration_count,
    latestVersion: state.latest_version,
    source: 'production_db',
    projectRef: linkedRef,
  };
};

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const live = process.env.AQUAGUIDE_COMPAT_READINESS_SOURCE === 'env'
    ? readLiveFromEnv()
    : readLiveFromProduction();
  console.log(JSON.stringify(buildReadiness(live), null, 2));
}
