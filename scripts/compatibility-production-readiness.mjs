import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence.ts';

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
const live = {
  schemaV3: envBool('AQUAGUIDE_COMPAT_SCHEMA_V3'),
  profiles: envInt('AQUAGUIDE_COMPAT_REVIEWED_PROFILES'),
  pairRules: envInt('AQUAGUIDE_COMPAT_REVIEWED_PAIR_RULES'),
  stageRisks: envInt('AQUAGUIDE_COMPAT_REVIEWED_STAGE_RISKS'),
  evidenceSources: envInt('AQUAGUIDE_COMPAT_EVIDENCE_SOURCES'),
};
const blockers = [];
if (!live.schemaV3) blockers.push('compatibility_schema_v3_not_ready');
if (live.profiles !== expected.profiles) blockers.push(`reviewed_profiles:${live.profiles}/${expected.profiles}`);
if (live.pairRules !== expected.pairRules) blockers.push(`reviewed_pair_rules:${live.pairRules}/${expected.pairRules}`);
if (live.stageRisks !== expected.stageRisks) blockers.push(`reviewed_stage_risks:${live.stageRisks}/${expected.stageRisks}`);
if (live.evidenceSources <= 0) blockers.push('reviewed_evidence_sources_missing');
const result = {
  phase: blockers.length ? 'BLOCKED_COMPATIBILITY_DB' : 'READY_COMPATIBILITY_DB',
  expected,
  live,
  blockers,
  mutationAuthorized: false,
};
console.log(JSON.stringify(result, null, 2));
