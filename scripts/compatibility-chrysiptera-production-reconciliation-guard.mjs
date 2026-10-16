import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const MIGRATION = '20261016184500_compatibility_chrysiptera_cyanea_authority_reconciliation.sql';
export const PRODUCTION_PROJECT_REF = 'ydiygvhuqpogmqlcvgob';
export const CONFIRM_TOKEN = 'EXECUTE_CHRYSIPTERA_CYANEA_AUTHORITY_RECONCILIATION_20261016';
export const START = { migrationCount: 70, latestVersion: '20261015211500', profiles: 109, pairRules: 21, stageRisks: 1, evidence: 200 };
export const TARGET = { migrationCount: 71, latestVersion: '20261016184500', profiles: 109, pairRules: 21, stageRisks: 1, evidence: 202 };

const migrationPath = join(root, 'supabase', 'migrations', MIGRATION);
const migrationVersion = MIGRATION.split('_')[0];
const migrationName = MIGRATION.replace(/^\d+_/, '').replace(/\.sql$/, '');
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const q = value => "'" + String(value).replaceAll("'", "''") + "'";
const stripEmbeddedTransaction = sql => sql
  .replace(/(^|\n)\s*begin;\s*(?=\n)/i, '$1')
  .replace(/\n\s*commit;\s*$/i, '')
  .trim();

export const validateLocalPatch = () => {
  const sql = readFileSync(migrationPath, 'utf8');
  const fingerprint = createHash('sha256').update(sql).digest('hex');
  for (const expected of [
    'expected 109 reviewed Compatibility profiles',
    'expected 200 reviewed evidence sources',
    'expected 202 reviewed evidence sources',
    'sp_0187',
    'fish_fry',
    'research-wave21-fishipedia-chrysiptera-cyanea',
    'fishbase-chrysiptera-cyanea-diet-wave22',
    "'water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation'",
    'Product/Care authority drift',
    'unrelated Product/Care data changed',
  ]) if (!sql.includes(expected)) throw new Error('Chrysiptera migration missing authority marker: ' + expected);
  if (/update\s+public\.content_publications/i.test(sql) || /delete\s+from\s+public\.content_publications/i.test(sql)) {
    throw new Error('Compatibility reconciliation must not mutate immutable content_publications.');
  }
  return { sql, fingerprint };
};

export const buildPatchBundleSql = ({ finalize = 'commit' } = {}) => {
  if (!['commit', 'rollback'].includes(finalize)) throw new Error('Unsupported bundle finalizer: ' + finalize);
  const { sql } = validateLocalPatch();
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
    stripEmbeddedTransaction(sql),
    `insert into supabase_migrations.schema_migrations(version,statements,name,created_by)
values (${q(migrationVersion)},ARRAY[${q('guarded:' + MIGRATION)}]::text[],${q(migrationName)},'aqua-chrysiptera-authority-reconciliation-guard');`,
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
  if (!Array.isArray(rows) || rows.length !== 1) throw new Error('Unexpected Production reconciliation preflight response.');
  return rows[0];
};

export const validateLivePreflight = live => {
  const expected = {
    migration_count: START.migrationCount, latest_version: START.latestVersion,
    species: 486, feeding: 486, care: 41, care_steps: 128, content_publications: 527,
    profiles: START.profiles, pair_rules: START.pairRules, stage_risks: START.stageRisks, evidence: START.evidence,
  };
  const drift = Object.entries(expected).filter(([key, value]) => live[key] !== value);
  if (drift.length) throw new Error('Production Chrysiptera reconciliation preflight drift: ' + drift.map(([key, value]) => `${key}=${live[key]} expected=${value}`).join(', '));
  return expected;
};

export const validateProductionRuntimeParity = () => {
  const critical = [
    'src/data/compatibilityAuthorityPatches/index.ts',
    'src/data/compatibilityAuthorityPatches/research-coverage-wave23-20261016.ts',
    'src/data/compatibilityAuthorityPatches/research-coverage-wave21-20261015.ts',
    'src/data/compatibilityAuthorityPatches/predation-wave22-20261015.ts',
    'src/data/catalogFieldReviews.ts',
    'src/data/compatibilityEvidence.ts',
    'src/lib/tankCompatibilityEngine.ts',
    'packages/domain-rules/src/compatibility.ts',
    'apps/api/src/compatibility-authority.ts',
  ];
  const changedFiles = run('git', ['diff', '--name-only', 'origin/release/production..origin/main', '--', ...critical]).split(/\r?\n/).filter(Boolean);
  return { runtimeCompatible: changedFiles.length === 0, changedFiles };
};

const readLinkedProjectRef = () => readFileSync(join(root, 'supabase', '.temp', 'project-ref'), 'utf8').trim();
const assertClean = () => { if (run('git', ['status', '--porcelain'])) throw new Error('Production reconciliation commit requires a clean worktree.'); };
const assertCommitGitState = () => {
  assertClean();
  const branch = run('git', ['branch', '--show-current']);
  const head = run('git', ['rev-parse', 'HEAD']);
  const originMain = run('git', ['rev-parse', 'origin/main']);
  const release = run('git', ['rev-parse', 'origin/release/production']);
  if (branch !== 'main' || head !== originMain || head !== release) throw new Error('Production reconciliation requires main == origin/main == origin/release/production.');
  return { branch, head };
};

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
  const plan = {
    mode: commit ? 'commit-requested' : simulate ? 'simulate-requested' : 'dry-run',
    projectRef: linkedRef, migration: MIGRATION, fingerprint, startState: live, targetState: TARGET,
    productionRuntime: runtime,
    blockers: runtime.runtimeCompatible ? [] : ['production_runtime_not_aligned_with_origin_main'],
    mutationAuthorized: false,
  };
  if (!commit && !simulate) { console.log(JSON.stringify(plan, null, 2)); process.exit(0); }
  const dir = mkdtempSync(join(tmpdir(), 'aqua-chrysiptera-reconcile-'));
  const file = join(dir, 'bundle.sql');
  try {
    writeFileSync(file, buildPatchBundleSql({ finalize: simulate ? 'rollback' : 'commit' }));
    if (commit) {
      if (!runtime.runtimeCompatible) throw new Error('Commit denied: Production runtime is not aligned with origin/main.');
      if (process.env.AQUAGUIDE_CHRYSIPTERA_RECONCILIATION_CONFIRM !== CONFIRM_TOKEN) throw new Error('Commit denied: set AQUAGUIDE_CHRYSIPTERA_RECONCILIATION_CONFIRM=' + CONFIRM_TOKEN);
      const gitState = assertCommitGitState();
      run('supabase', ['db', 'query', '--linked', '--file', file]);
      console.log(JSON.stringify({ ...plan, mode: 'committed', blockers: [], gitState, mutationAuthorized: true }, null, 2));
    } else {
      run('supabase', ['db', 'query', '--linked', '--file', file]);
      console.log(JSON.stringify({ ...plan, mode: 'simulated-rollback', mutationAuthorized: false }, null, 2));
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
