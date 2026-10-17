import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const MIGRATION = '20261017081435_aquarium_water_parameters.sql';
export const EXPECTED_MIGRATION_SHA256 = 'dd6808b313ac3b1889238a8810926cb3d243953bef61532daf83bd599f76e8ef';
export const REQUIRED_ORDER = [
  'apply_database_migration',
  'verify_columns_and_constraints',
  'deploy_runtime_that_reads_ph_and_hardness_dgh',
];

const migrationPath = join(root, 'supabase', 'migrations', MIGRATION);
const sha256 = value => createHash('sha256').update(value).digest('hex');

export const validateLocalMigration = () => {
  const sql = readFileSync(migrationPath, 'utf8');
  const fingerprint = sha256(sql);
  if (fingerprint !== EXPECTED_MIGRATION_SHA256) {
    throw new Error(`water-parameter migration fingerprint drift: ${fingerprint}`);
  }
  const required = [
    /add column if not exists ph numeric\(4, 2\)/i,
    /add column if not exists hardness_dgh numeric\(6, 2\)/i,
    /ph is null or \(ph >= 0 and ph <= 14\)/i,
    /hardness_dgh is null or \(hardness_dgh >= 0 and hardness_dgh <= 100\)/i,
  ];
  for (const pattern of required) {
    if (!pattern.test(sql)) throw new Error(`migration contract missing: ${pattern}`);
  }
  if (/\bdrop\s+(table|column)\b|\btruncate\b|\bdelete\s+from\b/i.test(sql)) {
    throw new Error('water-parameter migration must remain additive and non-destructive');
  }

  const api = readFileSync(join(root, 'apps', 'api', 'src', 'routes', 'aquariums.ts'), 'utf8');
  const repository = readFileSync(join(root, 'src', 'services', 'repository', 'api-aquaguide.repository.ts'), 'utf8');
  if ((api.match(/target_temperature_c,ph,hardness_dgh/g) || []).length < 2) {
    throw new Error('runtime compatibility reads new columns but API query contract is incomplete');
  }
  if (!/ph: aquarium\.ph[\s\S]{0,180}: null/.test(repository) || !/hardnessDgh: aquarium\.hardnessDgh[\s\S]{0,220}: null/.test(repository)) {
    throw new Error('repository must support explicit NULL clears for pH/GH');
  }
  return { migration: MIGRATION, fingerprint, requiredOrder: REQUIRED_ORDER };
};

export const buildLivePreflightSql = () => `select
  exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='aquariums' and column_name='ph'
  ) as ph_exists,
  exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='aquariums' and column_name='hardness_dgh'
  ) as hardness_dgh_exists,
  exists (
    select 1 from pg_constraint
    where conname='aquariums_ph_range_check'
      and conrelid='public.aquariums'::regclass
  ) as ph_constraint_exists,
  exists (
    select 1 from pg_constraint
    where conname='aquariums_hardness_dgh_range_check'
      and conrelid='public.aquariums'::regclass
  ) as hardness_constraint_exists,
  exists (
    select 1 from supabase_migrations.schema_migrations
    where version='20261017081435'
  ) as migration_recorded;`;

export const validateLivePreflight = live => {
  const ready = live?.ph_exists === true
    && live?.hardness_dgh_exists === true
    && live?.ph_constraint_exists === true
    && live?.hardness_constraint_exists === true
    && live?.migration_recorded === true;
  return {
    readyForRuntimeDeploy: ready,
    phase: ready ? 'MIGRATION_READY' : 'MIGRATION_REQUIRED',
    blockers: ready ? [] : [
      !live?.ph_exists ? 'missing_ph_column' : null,
      !live?.hardness_dgh_exists ? 'missing_hardness_dgh_column' : null,
      !live?.ph_constraint_exists ? 'missing_ph_constraint' : null,
      !live?.hardness_constraint_exists ? 'missing_hardness_constraint' : null,
      !live?.migration_recorded ? 'migration_history_missing' : null,
    ].filter(Boolean),
    requiredOrder: REQUIRED_ORDER,
  };
};

const runLivePreflight = () => {
  const result = spawnSync('supabase', [
    'db', 'query', '--linked', '--output-format', 'json', buildLivePreflightSql(),
  ], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.status !== 0) {
    throw new Error(`Supabase live preflight failed: ${result.stderr || result.stdout}`);
  }
  const rows = JSON.parse(result.stdout);
  if (!Array.isArray(rows) || rows.length !== 1) throw new Error('Unexpected Supabase preflight response');
  return rows[0];
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const local = validateLocalMigration();
  if (!process.argv.includes('--live')) {
    console.log(JSON.stringify({
      mode: 'plan_only',
      ...local,
      liveProductionReadPerformed: false,
      next: 'Run with --live only when a read-only linked Production preflight is authorized.',
    }, null, 2));
  } else {
    const live = runLivePreflight();
    const result = validateLivePreflight(live);
    console.log(JSON.stringify({ mode: 'live_read_only', ...local, live, ...result }, null, 2));
    if (!result.readyForRuntimeDeploy) process.exitCode = 2;
  }
}
