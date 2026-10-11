import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence.ts';

export const PRODUCTION_PROJECT_REF = 'ydiygvhuqpogmqlcvgob';

export const START_MIGRATION_COUNT = 55;
export const START_LATEST_VERSION = '20261011020543';
export const START_REVIEWED_PROFILES = 42;
export const START_REVIEWED_PAIR_RULES = 21;
export const START_REVIEWED_STAGE_RISKS = 1;
export const START_REVIEWED_EVIDENCE = 77;

export const TARGET_MIGRATION_COUNT = 59;
export const TARGET_LATEST_VERSION = '20261011170000';
export const TARGET_REVIEWED_PROFILES = 52;
export const TARGET_REVIEWED_PAIR_RULES = 21;
export const TARGET_REVIEWED_STAGE_RISKS = 1;
export const TARGET_REVIEWED_EVIDENCE = 98;

export const CONFIRM_TOKEN = 'EXECUTE_4_COMPATIBILITY_BATCH_MIGRATIONS';
export const EXPECTED_CHAIN_FINGERPRINT = '68fe64bf9815573cc6435c039dc444b6ef312d14a52e1df7c1a3127650469aab';
export const HELD_MIGRATION = '202610090001_compatibility_gold_ram_rhodeus_profile_owner.sql';
export const PREREQUISITE_MIGRATIONS = [];
export const COMPATIBILITY_MIGRATIONS = [
  '20261011111500_compatibility_chindongo_socolofi_authority.sql',
  '20261011124500_compatibility_opsariichthys_bidens_authority.sql',
  '20261011162500_compatibility_pseudorasbora_parva_authority.sql',
  '20261011170000_compatibility_next_wave_freshwater_batch_authority.sql',
];
export const MIGRATIONS = [...COMPATIBILITY_MIGRATIONS];

const root = resolve(import.meta.dirname, '..');
const migrationsDir = join(root, 'supabase', 'migrations');
const q = value => `'${String(value).replaceAll("'", "''")}'`;
const sqlTextArray = values => `ARRAY[${values.map(q).join(',')}]::text[]`;
const sha256 = value => createHash('sha256').update(value).digest('hex');

export const getAuthorityKeys = () => {
  const audit = getCompatibilityEvidenceAudit();
  return {
    profiles: audit.reviewedProfiles.map(item => item.speciesId).sort(),
    pairRules: audit.reviewedPairRules.map(item => [...item.speciesIds].sort().join('__')).sort(),
    stageRisks: audit.reviewedStageRiskProfiles.map(item => `${item.speciesId}:${item.riskType}`).sort(),
  };
};

export const calculateChainFingerprint = () => sha256(
  MIGRATIONS.map(name => {
    const content = readFileSync(join(migrationsDir, name));
    return `${name}\0${sha256(content)}`;
  }).join('\n'),
);

const expectedTransitions = [
  { name: COMPATIBILITY_MIGRATIONS[0], preProfiles: 42, postProfiles: 43, preEvidence: 77, postEvidence: 79 },
  { name: COMPATIBILITY_MIGRATIONS[1], preProfiles: 43, postProfiles: 44, preEvidence: 79, postEvidence: 82 },
  { name: COMPATIBILITY_MIGRATIONS[2], preProfiles: 44, postProfiles: 45, preEvidence: 82, postEvidence: 85 },
  { name: COMPATIBILITY_MIGRATIONS[3], preProfiles: 45, postProfiles: 52, preEvidence: 85, postEvidence: 98 },
];

export const validateLocalChain = () => {
  if (MIGRATIONS.length !== 4 || new Set(MIGRATIONS).size !== MIGRATIONS.length) {
    throw new Error('Incremental Compatibility release must contain exactly four unique migrations.');
  }
  if (MIGRATIONS.includes(HELD_MIGRATION)) throw new Error('Held migration entered incremental release bundle.');

  for (const transition of expectedTransitions) {
    const sql = readFileSync(join(migrationsDir, transition.name), 'utf8');
    for (const [label, value] of [
      ['PRECHECK profile', transition.preProfiles],
      ['POSTCHECK profile', transition.postProfiles],
      ['PRECHECK evidence', transition.preEvidence],
      ['POSTCHECK evidence', transition.postEvidence],
    ]) {
      const prefix = label.startsWith('PRECHECK') ? 'expected' : 'expected';
      const noun = label.includes('profile') ? 'reviewed Compatibility profiles' : 'reviewed evidence sources';
      if (!sql.includes(`${prefix} ${value} ${noun}`)) {
        throw new Error(`${transition.name} missing chained ${label} count ${value}`);
      }
    }
  }

  const fingerprint = calculateChainFingerprint();
  if (fingerprint !== EXPECTED_CHAIN_FINGERPRINT) {
    throw new Error(`Compatibility incremental migration fingerprint drifted: ${fingerprint}`);
  }

  const authority = getAuthorityKeys();
  if (
    authority.profiles.length !== TARGET_REVIEWED_PROFILES
    || authority.pairRules.length !== TARGET_REVIEWED_PAIR_RULES
    || authority.stageRisks.length !== TARGET_REVIEWED_STAGE_RISKS
  ) {
    throw new Error(
      `Static authority drifted: ${authority.profiles.length}/${authority.pairRules.length}/${authority.stageRisks.length}`,
    );
  }

  return { fingerprint, authority };
};

const stripEmbeddedTransaction = (name, sql) => {
  const lines = sql.split(/\r?\n/);
  const beginIndexes = lines.map((line, index) => line.trim().toLowerCase() === 'begin;' ? index : -1).filter(index => index >= 0);
  const commitIndexes = lines.map((line, index) => line.trim().toLowerCase() === 'commit;' ? index : -1).filter(index => index >= 0);
  if (beginIndexes.length === 0 && commitIndexes.length === 0) return sql.trim();
  if (beginIndexes.length !== 1 || commitIndexes.length !== 1) {
    throw new Error(`Expected one embedded BEGIN/COMMIT in ${name}; got ${beginIndexes.length}/${commitIndexes.length}`);
  }
  const removed = new Set([...beginIndexes, ...commitIndexes]);
  const stripped = lines.filter((_, index) => !removed.has(index)).join('\n').trim();
  if (/^\s*(begin|commit);/im.test(stripped)) throw new Error(`Unexpected nested transaction remains in ${name}`);
  return stripped;
};

const migrationVersion = name => name.split('_', 1)[0];
const migrationName = name => name.replace(/^\d+_/, '').replace(/\.sql$/, '');

export const buildBundleSql = ({ finalize = 'commit' } = {}) => {
  if (!['commit', 'rollback'].includes(finalize)) throw new Error(`Unsupported bundle finalizer: ${finalize}`);
  const { authority } = validateLocalChain();
  const lines = ['begin;'];

  lines.push(`do $$ begin
 if (select count(*) from supabase_migrations.schema_migrations) <> ${START_MIGRATION_COUNT} then raise exception 'ABORT: migration count drift'; end if;
 if (select max(version) from supabase_migrations.schema_migrations) <> ${q(START_LATEST_VERSION)} then raise exception 'ABORT: latest migration drift'; end if;
 if to_regclass('public.content_publications') is null then raise exception 'ABORT: content_publications missing'; end if;
 if to_regclass('public.compatibility_authority_state') is null then raise exception 'ABORT: compatibility authority state missing'; end if;
 if to_regclass('public.species_compatibility_profile_stage_risks') is null then raise exception 'ABORT: stage risk table missing'; end if;
 if (select count(*) from public.species where deleted_at is null) <> 486 then raise exception 'ABORT: species baseline drift'; end if;
 if (select count(*) from public.species_feeding_profiles where deleted_at is null) <> 486 then raise exception 'ABORT: feeding baseline drift'; end if;
 if (select count(*) from public.care_articles where deleted_at is null) <> 41 then raise exception 'ABORT: care baseline drift'; end if;
 if (select count(*) from public.care_article_steps where deleted_at is null) <> 128 then raise exception 'ABORT: care-step baseline drift'; end if;
 if (select count(*) from public.content_publications) <> 527 then raise exception 'ABORT: content publication baseline drift'; end if;
 if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> ${START_REVIEWED_PROFILES} then raise exception 'ABORT: reviewed profile baseline drift'; end if;
 if (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null) <> ${START_REVIEWED_PAIR_RULES} then raise exception 'ABORT: reviewed pair-rule baseline drift'; end if;
 if (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null) <> ${START_REVIEWED_STAGE_RISKS} then raise exception 'ABORT: reviewed stage-risk baseline drift'; end if;
 if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> ${START_REVIEWED_EVIDENCE} then raise exception 'ABORT: reviewed evidence baseline drift'; end if;
end $$;`);

  for (const name of MIGRATIONS) {
    const sql = stripEmbeddedTransaction(name, readFileSync(join(migrationsDir, name), 'utf8'));
    lines.push(`-- BEGIN GUARDED MIGRATION ${name}\n${sql}\n-- END GUARDED MIGRATION ${name}`);
    lines.push(
      `insert into supabase_migrations.schema_migrations(version,statements,name,created_by) values (${q(migrationVersion(name))},ARRAY[${q(`guarded:${name}`)}]::text[],${q(migrationName(name))},'aqua-compatibility-production-guard');`,
    );
  }

  lines.push(`do $$ declare
 actual_profiles text[];
 actual_pairs text[];
 actual_stage_risks text[];
begin
 select coalesce(array_agg(s.catalog_key order by s.catalog_key),'{}'::text[]) into actual_profiles
 from public.species_compatibility_profiles p
 join public.species s on s.id=p.species_id
 where p.review_status='reviewed' and p.deleted_at is null;
 if actual_profiles <> ${sqlTextArray(authority.profiles)} then raise exception 'POSTCHECK: reviewed profile key set mismatch'; end if;

 select coalesce(array_agg(pair_key order by pair_key),'{}'::text[]) into actual_pairs
 from (
   select least(sa.catalog_key,sb.catalog_key)||'__'||greatest(sa.catalog_key,sb.catalog_key) pair_key
   from public.species_pair_compatibility_rules r
   join public.species sa on sa.id=r.species_a_id
   join public.species sb on sb.id=r.species_b_id
   where r.review_status='reviewed' and r.deleted_at is null
 ) x;
 if actual_pairs <> ${sqlTextArray(authority.pairRules)} then raise exception 'POSTCHECK: reviewed pair key set mismatch'; end if;

 select coalesce(array_agg(s.catalog_key||':'||r.risk_type order by s.catalog_key,r.risk_type),'{}'::text[]) into actual_stage_risks
 from public.species_compatibility_profile_stage_risks r
 join public.species_compatibility_profiles p on p.id=r.profile_id
 join public.species s on s.id=p.species_id
 where r.review_status='reviewed' and r.deleted_at is null;
 if actual_stage_risks <> ${sqlTextArray(authority.stageRisks)} then raise exception 'POSTCHECK: reviewed stage-risk key set mismatch'; end if;

 if (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> ${TARGET_REVIEWED_EVIDENCE} then raise exception 'POSTCHECK: reviewed evidence count mismatch'; end if;
 if (select count(*) from supabase_migrations.schema_migrations) <> ${TARGET_MIGRATION_COUNT} then raise exception 'POSTCHECK: migration history count mismatch'; end if;
 if (select max(version) from supabase_migrations.schema_migrations) <> ${q(TARGET_LATEST_VERSION)} then raise exception 'POSTCHECK: latest migration mismatch'; end if;
 if (select count(*) from public.species where deleted_at is null) <> 486 then raise exception 'POSTCHECK: species changed'; end if;
 if (select count(*) from public.species_feeding_profiles where deleted_at is null) <> 486 then raise exception 'POSTCHECK: feeding changed'; end if;
 if (select count(*) from public.care_articles where deleted_at is null) <> 41 then raise exception 'POSTCHECK: care changed'; end if;
 if (select count(*) from public.care_article_steps where deleted_at is null) <> 128 then raise exception 'POSTCHECK: care steps changed'; end if;
 if (select count(*) from public.content_publications) <> 527 then raise exception 'POSTCHECK: content publications changed'; end if;
end $$;`);

  lines.push(`${finalize};`);
  return `${lines.join('\n\n')}\n`;
};

const run = (cmd, args, options = {}) => {
  const result = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', ...options });
  if (result.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  return result.stdout.trim();
};

export const readLinkedProjectRef = () => readFileSync(join(root, 'supabase', '.temp', 'project-ref'), 'utf8').trim();

export const validateProductionCodeCompatibility = () => {
  const critical = [
    'apps/api/src/routes/content.ts',
    'src/data/compatibilityEvidence.ts',
    'src/services/compatibility/compatibility.service.ts',
    'apps/api/src/compatibility-authority.ts',
  ];
  const changedFiles = run('git', ['diff', '--name-only', 'origin/release/production..origin/main', '--', ...critical])
    .split(/\r?\n/)
    .filter(Boolean);
  const releaseLoader = run('git', ['show', 'origin/release/production:apps/api/src/compatibility-authority.ts']);
  const mainLoader = run('git', ['show', 'origin/main:apps/api/src/compatibility-authority.ts']);
  const loaderCompatible = releaseLoader === mainLoader;
  return {
    releaseBranch: 'origin/release/production',
    runtimeCompatible: changedFiles.length === 0 && loaderCompatible,
    changedFiles,
    loaderCompatible,
    requiredBeforeCommit: 'Production runtime must match origin/main Compatibility authority before DB promotion.',
  };
};

export const assertGitStateForCommit = () => {
  const branch = run('git', ['branch', '--show-current']);
  const head = run('git', ['rev-parse', 'HEAD']);
  const originMain = run('git', ['rev-parse', 'origin/main']);
  const dirty = run('git', ['status', '--porcelain']);
  if (branch !== 'main') throw new Error(`Commit requires main branch; current=${branch}`);
  if (head !== originMain) throw new Error(`Commit requires HEAD == origin/main; ${head} != ${originMain}`);
  if (dirty) throw new Error('Commit requires a clean worktree.');
};

export const assertGitStateForSimulation = () => {
  const dirty = run('git', ['status', '--porcelain']);
  if (dirty) throw new Error('Simulation requires a clean worktree so the executed bundle is reproducible.');
  return { branch: run('git', ['branch', '--show-current']), head: run('git', ['rev-parse', 'HEAD']) };
};

export const queryLivePreflight = () => {
  const sql = `select
    (select count(*) from supabase_migrations.schema_migrations)::int migration_count,
    (select max(version) from supabase_migrations.schema_migrations) latest_version,
    (to_regclass('public.content_publications') is not null) content_publications_exists,
    (select count(*) from public.species where deleted_at is null)::int species,
    (select count(*) from public.species_feeding_profiles where deleted_at is null)::int feeding,
    (select count(*) from public.care_articles where deleted_at is null)::int care,
    (select count(*) from public.care_article_steps where deleted_at is null)::int care_steps,
    (select count(*) from public.content_publications)::int content_publications,
    (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null)::int profiles,
    (select count(*) from public.species_pair_compatibility_rules where review_status='reviewed' and deleted_at is null)::int pair_rules,
    (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null)::int evidence,
    (select count(*) from public.species_compatibility_profile_stage_risks where review_status='reviewed' and deleted_at is null)::int stage_risks,
    (to_regclass('public.compatibility_authority_state') is not null) authority_state_exists,
    (to_regclass('public.species_compatibility_profile_stage_risks') is not null) stage_risks_exists;`;
  const rows = JSON.parse(run('supabase', ['db', 'query', '--linked', '--output-format', 'json', sql]));
  if (!Array.isArray(rows) || rows.length !== 1) throw new Error('Unexpected Supabase preflight response.');
  return rows[0];
};

export const validateLivePreflight = live => {
  const expected = {
    migration_count: START_MIGRATION_COUNT,
    latest_version: START_LATEST_VERSION,
    content_publications_exists: true,
    species: 486,
    feeding: 486,
    care: 41,
    care_steps: 128,
    content_publications: 527,
    profiles: START_REVIEWED_PROFILES,
    pair_rules: START_REVIEWED_PAIR_RULES,
    evidence: START_REVIEWED_EVIDENCE,
    stage_risks: START_REVIEWED_STAGE_RISKS,
    authority_state_exists: true,
    stage_risks_exists: true,
  };
  const drift = Object.entries(expected).filter(([key, value]) => live[key] !== value);
  if (drift.length) {
    throw new Error(`Production preflight drift: ${drift.map(([key, value]) => `${key}=${live[key]} expected=${value}`).join(', ')}`);
  }
  return expected;
};

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const commit = process.argv.includes('--commit');
  const simulate = process.argv.includes('--simulate');
  if (commit && simulate) throw new Error('Choose exactly one of --commit or --simulate.');

  const writeArg = process.argv.find(arg => arg.startsWith('--write-sql='));
  const { fingerprint, authority } = validateLocalChain();
  const productionCodeCompatibility = validateProductionCodeCompatibility();

  const linkedRef = readLinkedProjectRef();
  if (linkedRef !== PRODUCTION_PROJECT_REF) throw new Error(`Linked Supabase ref mismatch: ${linkedRef}`);
  const live = queryLivePreflight();
  validateLivePreflight(live);

  const bundle = buildBundleSql({ finalize: simulate ? 'rollback' : 'commit' });
  const blockers = productionCodeCompatibility.runtimeCompatible
    ? []
    : ['production_runtime_not_aligned_with_origin_main'];
  const plan = {
    mode: commit ? 'commit-requested' : simulate ? 'simulate-requested' : 'dry-run',
    projectRef: linkedRef,
    migrationCount: MIGRATIONS.length,
    compatibilityMigrationCount: COMPATIBILITY_MIGRATIONS.length,
    fingerprint,
    expectedAuthority: {
      profiles: authority.profiles.length,
      pairRules: authority.pairRules.length,
      stageRisks: authority.stageRisks.length,
      evidenceSources: TARGET_REVIEWED_EVIDENCE,
    },
    startState: live,
    targetState: {
      migrationCount: TARGET_MIGRATION_COUNT,
      latestVersion: TARGET_LATEST_VERSION,
      reviewedProfiles: TARGET_REVIEWED_PROFILES,
      reviewedPairRules: TARGET_REVIEWED_PAIR_RULES,
      reviewedStageRisks: TARGET_REVIEWED_STAGE_RISKS,
      reviewedEvidence: TARGET_REVIEWED_EVIDENCE,
    },
    heldMigrationExcluded: HELD_MIGRATION,
    productionCodeCompatibility,
    blockers,
    atomicBundleBytes: Buffer.byteLength(bundle),
    mutationAuthorized: false,
  };

  if (writeArg) {
    const path = writeArg.slice('--write-sql='.length);
    writeFileSync(path, bundle);
    plan.bundlePath = path;
  }

  if (!commit && !simulate) {
    console.log(JSON.stringify(plan, null, 2));
    process.exit(0);
  }

  const dir = mkdtempSync(join(tmpdir(), 'aqua-compat-migrations-'));
  const file = join(dir, 'compatibility-production-bundle.sql');

  if (simulate) {
    const gitState = assertGitStateForSimulation();
    try {
      writeFileSync(file, bundle);
      run('supabase', ['db', 'query', '--linked', '--file', file]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
    console.log(JSON.stringify({ ...plan, mode: 'simulated-rollback', gitState, mutationAuthorized: false }, null, 2));
    process.exit(0);
  }

  if (!productionCodeCompatibility.runtimeCompatible) {
    throw new Error(
      `Commit denied: Production Compatibility runtime is not aligned with origin/main: ${productionCodeCompatibility.changedFiles.join(', ') || 'loader drift'}`,
    );
  }
  if (process.env.AQUAGUIDE_COMPATIBILITY_PRODUCTION_CONFIRM !== CONFIRM_TOKEN) {
    throw new Error(`Commit denied: set AQUAGUIDE_COMPATIBILITY_PRODUCTION_CONFIRM=${CONFIRM_TOKEN}`);
  }
  assertGitStateForCommit();

  try {
    writeFileSync(file, bundle);
    run('supabase', ['db', 'query', '--linked', '--file', file]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log(JSON.stringify({ ...plan, mode: 'committed', blockers: [], mutationAuthorized: true }, null, 2));
}
