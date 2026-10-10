import { spawnSync } from 'node:child_process';

const run = env => {
  const result = spawnSync(
    process.execPath,
    ['--import','tsx','scripts/compatibility-production-readiness.mjs'],
    {
      env: {
        ...process.env,
        AQUAGUIDE_COMPAT_READINESS_SOURCE: 'env',
        ...env,
      },
      encoding: 'utf8',
    },
  );
  if (result.status !== 0) throw new Error(result.stderr || 'readiness failed');
  return JSON.parse(result.stdout);
};

const blocked = run({
  AQUAGUIDE_COMPAT_SCHEMA_V3:'false',
  AQUAGUIDE_COMPAT_REVIEWED_PROFILES:'0',
  AQUAGUIDE_COMPAT_REVIEWED_PAIR_RULES:'0',
  AQUAGUIDE_COMPAT_REVIEWED_STAGE_RISKS:'0',
  AQUAGUIDE_COMPAT_EVIDENCE_SOURCES:'0',
});
if (blocked.phase !== 'BLOCKED_COMPATIBILITY_DB'
  || blocked.expected.profiles <= 0
  || blocked.expected.pairRules <= 0
  || blocked.expected.stageRisks <= 0
  || blocked.live.source !== 'env') {
  throw new Error('blocked readiness mismatch');
}

const ready = run({
  AQUAGUIDE_COMPAT_SCHEMA_V3:'true',
  AQUAGUIDE_COMPAT_REVIEWED_PROFILES:String(blocked.expected.profiles),
  AQUAGUIDE_COMPAT_REVIEWED_PAIR_RULES:String(blocked.expected.pairRules),
  AQUAGUIDE_COMPAT_REVIEWED_STAGE_RISKS:String(blocked.expected.stageRisks),
  AQUAGUIDE_COMPAT_EVIDENCE_SOURCES:'1',
});
if (ready.phase !== 'READY_COMPATIBILITY_DB'
  || ready.blockers.length !== 0
  || ready.mutationAuthorized !== false
  || ready.live.source !== 'env') {
  throw new Error('ready readiness mismatch');
}

console.log('compatibility production readiness verified: env harness + live-db default contract');
