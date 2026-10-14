import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

export const PRODUCTION_PROJECT_REF = 'ydiygvhuqpogmqlcvgob';
export const MIGRATION = '20261014152500_compatibility_fast_lane_wave3_authority_patch.sql';
export const EXPECTED_MIGRATION_SHA256 = '0f94ab17d3835fb683a3df1078e585f836c90b6412c5b99bd14a756a2eed4575';
export const CONFIRM_TOKEN = 'EXECUTE_COMPATIBILITY_FAST_LANE_WAVE3_PATCH_20261014';

export const START = {
  migrationCount: 67,
  latestVersion: '20261014143000',
  profiles: 101,
  pairRules: 21,
  stageRisks: 1,
  evidence: 181,
};
export const TARGET = {
  migrationCount: 68,
  latestVersion: '20261014152500',
  profiles: 101,
  pairRules: 21,
  stageRisks: 1,
  evidence: 184,
};

const root = resolve(import.meta.dirname, '..');
const migrationPath = join(root, 'supabase', 'migrations', MIGRATION);
const q = value => "'" + String(value).replaceAll("'", "''") + "'";
const sha256 = value => createHash('sha256').update(value).digest('hex');
const migrationVersion = MIGRATION.split('_', 1)[0];
const migrationName = MIGRATION.replace(/^\d+_/, '').replace(/\.sql$/, '');

const run = (cmd, args, options = {}) => {
  const result = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', ...options });
  if (result.status !== 0) throw new Error(cmd + ' ' + args.join(' ') + ' failed: ' + (result.stderr || result.stdout));
  return result.stdout.trim();
};

const stripEmbeddedTransaction = sql => {
  const lines = sql.split(/\r?\n/);
  const begins = lines.map((line, index) => line.trim().toLowerCase() === 'begin;' ? index : -1).filter(index => index >= 0);
  const commits = lines.map((line, index) => line.trim().toLowerCase() === 'commit;' ? index : -1).filter(index => index >= 0);
  if (begins.length !== 1 || commits.length !== 1) throw new Error('Fast Lane wave3 migration must contain exactly one BEGIN/COMMIT pair.');
  const removed = new Set([...begins, ...commits]);
  return lines.filter((_, index) => !removed.has(index)).join('\n').trim();
};

export const validateLocalPatch = () => {
  const sql = readFileSync(migrationPath, 'utf8');
  const fingerprint = sha256(sql);
  if (fingerprint !== EXPECTED_MIGRATION_SHA256) throw new Error('Fast Lane wave3 migration fingerprint drifted: ' + fingerprint);
  for (const expected of [
    'expected 101 reviewed Compatibility profiles',
    'expected 181 reviewed evidence sources',
    'expected 184 reviewed evidence sources',
    'sp_0054',
    'sp_0012',
    'sp_0103',
    'sp_0104',
    'sp_0116',
    'sp_0283',
    'sinica-fishdb-hemichromis-bimaculatus-diet',
    'fischwissen-puntius-titteya-territoriality',
    'myfish-scleropages-formosus-territoriality',
  ]) {
    if (!sql.includes(expected)) throw new Error('Fast Lane wave3 migration missing authority marker: ' + expected);
  }
  return { sql, fingerprint };
};

export const buildPatchBundleSql = ({ finalize = 'commit' } = {}) => {
  if (!['commit', 'rollback'].includes(finalize)) throw new Error('Unsupported wave3 bundle finalizer: ' + finalize);
  const { sql } = validateLocalPatch();
  const stripped = stripEmbeddedTransaction(sql);
  return [
    'begin;',
    `do $$ begin
  if (select count(*) from supabase_migrations.schema_migrations) <> ${START.migrationCount} then raise exception 'ABORT: migration count drift'; end if;
  if (select max(version) from supabase_migrations.schema_migrations) <> ${q(START.latestVersion)} then raise exception 'ABORT: latest migration drift'; end if;
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> ${START.profiles} then raise exception 'ABORT: profile baseline drift'; end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> ${START.pairRules} then raise exception 'ABORT: pair baseline drift'; end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> ${START.stageRisks} then raise exception 'ABORT: stage-risk baseline drift'; end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> ${START.evidence} then raise exception 'ABORT: evidence baseline drift'; end if;
end $$;`,
    '-- BEGIN GUARDED FAST LANE WAVE3 PATCH ' + MIGRATION,
    stripped,
    '-- END GUARDED FAST LANE WAVE3 PATCH ' + MIGRATION,
    `insert into supabase_migrations.schema_migrations(version,statements,name,created_by)
values (${q(migrationVersion)},ARRAY[${q('guarded:' + MIGRATION)}]::text[],${q(migrationName)},'aqua-compatibility-fast-lane-wave3-patch-guard');`,
    `do $$ begin
  if (select count(*) from supabase_migrations.schema_migrations) <> ${TARGET.migrationCount} then raise exception 'POSTCHECK: migration history count mismatch'; end if;
  if (select max(version) from supabase_migrations.schema_migrations) <> ${q(TARGET.latestVersion)} then raise exception 'POSTCHECK: latest migration mismatch'; end if;
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> ${TARGET.profiles} then raise exception 'POSTCHECK: profile count mismatch'; end if;
  if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> ${TARGET.pairRules} then raise exception 'POSTCHECK: pair count mismatch'; end if;
  if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> ${TARGET.stageRisks} then raise exception 'POSTCHECK: stage-risk count mismatch'; end if;
  if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> ${TARGET.evidence} then raise exception 'POSTCHECK: evidence count mismatch'; end if;
end $$;`,
    finalize + ';',
    '',
  ].join('\n\n');
};

export const queryLivePreflight = () => {
  const sql = `select
    (select count(*) from supabase_migrations.schema_migrations)::int migration_count,
    (select max(version) from supabase_migrations.schema_migrations) latest_version,
    (select count(*) from public.species where deleted_at is null)::int species,
    (select count(*) from public.species_feeding_profiles where deleted_at is null)::int feeding,
    (select count(*) from public.care_articles where deleted_at is null)::int care,
    (select count(*) from public.care_article_steps where deleted_at is null)::int care_steps,
    (select count(*) from public.content_publications)::int content_publications,
    (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null)::int profiles,
    (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null)::int pair_rules,
    (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null)::int stage_risks,
    (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null)::int evidence;`;
  const rows = JSON.parse(run('supabase', ['db', 'query', '--linked', '--output-format', 'json', sql]));
  if (!Array.isArray(rows) || rows.length !== 1) throw new Error('Unexpected Production wave3 preflight response.');
  return rows[0];
};

export const validateLivePreflight = live => {
  const expected = {
    migration_count: START.migrationCount,
    latest_version: START.latestVersion,
    species: 486,
    feeding: 486,
    care: 41,
    care_steps: 128,
    content_publications: 527,
    profiles: START.profiles,
    pair_rules: START.pairRules,
    stage_risks: START.stageRisks,
    evidence: START.evidence,
  };
  const drift = Object.entries(expected).filter(([key, value]) => live[key] !== value);
  if (drift.length) throw new Error('Production Fast Lane wave3 preflight drift: ' + drift.map(([key, value]) => key + '=' + live[key] + ' expected=' + value).join(', '));
  return expected;
};

export const validateProductionRuntimeParity = () => {
  const critical = [
    'src/data/compatibilityAuthorityPatches/index.ts',
    'src/data/compatibilityAuthorityPatches/fast-lane-wave3-20261014.ts',
    'src/data/catalogFieldReviews.ts',
    'src/data/compatibilityEvidence.ts',
    'src/modules/knowledge/knowledgeSources.ts',
    'src/services/compatibility/compatibility-field-coverage.service.ts',
    'apps/api/src/compatibility-authority.ts',
  ];
  const changedFiles = run('git', ['diff', '--name-only', 'origin/release/production..origin/main', '--', ...critical]).split(/\r?\n/).filter(Boolean);
  return { runtimeCompatible: changedFiles.length === 0, changedFiles };
};

const assertClean = () => {
  const dirty = run('git', ['status', '--porcelain']);
  if (dirty) throw new Error('Fast Lane wave3 guard requires a clean worktree.');
};

const assertCommitGitState = () => {
  assertClean();
  const branch = run('git', ['branch', '--show-current']);
  const head = run('git', ['rev-parse', 'HEAD']);
  const originMain = run('git', ['rev-parse', 'origin/main']);
  const release = run('git', ['rev-parse', 'origin/release/production']);
  if (branch !== 'main') throw new Error('Fast Lane wave3 commit requires main branch.');
  if (head !== originMain) throw new Error('Fast Lane wave3 commit requires HEAD == origin/main.');
  if (head !== release) throw new Error('Fast Lane wave3 commit requires origin/release/production == origin/main.');
  return { branch, head };
};

const readLinkedProjectRef = () => readFileSync(join(root, 'supabase', '.temp', 'project-ref'), 'utf8').trim();

const isMain = import.meta.url === 'file://' + process.argv[1];
if (isMain) {
  const commit = process.argv.includes('--commit');
  const simulate = process.argv.includes('--simulate');
  if (commit && simulate) throw new Error('Choose exactly one of --commit or --simulate.');

  const linkedRef = readLinkedProjectRef();
  if (linkedRef !== PRODUCTION_PROJECT_REF) throw new Error('Linked Supabase ref mismatch: ' + linkedRef);
  const { fingerprint } = validateLocalPatch();
  const live = queryLivePreflight();
  validateLivePreflight(live);
  const runtime = validateProductionRuntimeParity();
  const bundle = buildPatchBundleSql({ finalize: simulate ? 'rollback' : 'commit' });
  const plan = {
    mode: commit ? 'commit-requested' : simulate ? 'simulate-requested' : 'dry-run',
    projectRef: linkedRef,
    migration: MIGRATION,
    fingerprint,
    startState: live,
    targetState: TARGET,
    productionRuntime: runtime,
    blockers: runtime.runtimeCompatible ? [] : ['production_runtime_not_aligned_with_origin_main'],
    atomicBundleBytes: Buffer.byteLength(bundle),
    mutationAuthorized: false,
  };

  if (!commit && !simulate) {
    console.log(JSON.stringify(plan, null, 2));
    process.exit(0);
  }

  assertClean();
  const dir = mkdtempSync(join(tmpdir(), 'aqua-fast-lane-wave3-'));
  const file = join(dir, 'compatibility-fast-lane-wave3-production-patch.sql');

  if (simulate) {
    try {
      writeFileSync(file, bundle);
      run('supabase', ['db', 'query', '--linked', '--file', file]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
    console.log(JSON.stringify({ ...plan, mode: 'simulated-rollback', mutationAuthorized: false }, null, 2));
    process.exit(0);
  }

  if (!runtime.runtimeCompatible) throw new Error('Commit denied: Production runtime is not aligned with origin/main.');
  if (process.env.AQUAGUIDE_COMPATIBILITY_FAST_LANE_WAVE3_CONFIRM !== CONFIRM_TOKEN) {
    throw new Error('Commit denied: set AQUAGUIDE_COMPATIBILITY_FAST_LANE_WAVE3_CONFIRM=' + CONFIRM_TOKEN);
  }
  const gitState = assertCommitGitState();
  try {
    writeFileSync(file, bundle);
    run('supabase', ['db', 'query', '--linked', '--file', file]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log(JSON.stringify({ ...plan, mode: 'committed', gitState, blockers: [], mutationAuthorized: true }, null, 2));
}
