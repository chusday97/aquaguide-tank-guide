import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const PRODUCTION_PROJECT_REF = 'ydiygvhuqpogmqlcvgob';
export const CONFIRM_TOKEN = 'EXECUTE_CHRYSIPTERA_CYANEA_CONTENT_REPUBLISH_20261016';
export const SOURCE_ID = 'a156f685-3dc9-439f-90ce-9d74eb4a9b60';
export const START = {
  migrationCount: 71,
  latestVersion: '20261016184500',
  profiles: 109,
  evidence: 202,
  contentPublications: 527,
  sourceVersion: 1,
  publicationVersion: 1,
};
export const TARGET = {
  migrationCount: 71,
  latestVersion: '20261016184500',
  profiles: 109,
  evidence: 202,
  contentPublications: 527,
  sourceVersion: 3,
  publicationVersion: 3,
};

const run = (cmd, args) => execFileSync(cmd, args, {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
}).trim();

export const buildRepublishSql = ({ finalize = 'rollback' } = {}) => {
  if (!['commit', 'rollback'].includes(finalize)) throw new Error('Unsupported finalizer: ' + finalize);
  return `begin;

do $precheck$
declare
  v_source_count integer;
  v_publication_count integer;
begin
  if (select count(*) from supabase_migrations.schema_migrations) <> 71
     or (select max(version) from supabase_migrations.schema_migrations) <> '20261016184500' then
    raise exception 'PRECHECK: migration authority drift';
  end if;
  if (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 109
     or (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 202 then
    raise exception 'PRECHECK: Compatibility authority drift';
  end if;
  if (select count(*) from public.content_publications) <> 527 then
    raise exception 'PRECHECK: publication count drift';
  end if;
  select count(*) into v_source_count
  from public.species
  where id='${SOURCE_ID}'::uuid
    and catalog_key='sp_0187'
    and version=1
    and status='published'
    and water_temperature_min_c=24
    and water_temperature_max_c=28
    and ph_min=8.1
    and ph_max=8.4
    and min_tank_liters=64
    and water_temperature_text='24-28°C'
    and ph_level_text='8.1-8.4'
    and tank_size_text='至少 64 升'
    and deleted_at is null;
  if v_source_count <> 1 then raise exception 'PRECHECK: sp_0187 source baseline drift'; end if;

  select count(*) into v_publication_count
  from public.content_publications
  where resource_type='species'
    and resource_id='${SOURCE_ID}'::uuid
    and catalog_key='sp_0187'
    and source_version=1
    and (snapshot->'zh-CN'->>'minTankLiters')::numeric=64
    and snapshot->'zh-CN'->>'waterTemperatureText'='24-28°C'
    and snapshot->'zh-CN'->>'phLevelText'='8.1-8.4'
    and (snapshot->'en'->>'minTankLiters')::numeric=64
    and snapshot->'en'->>'waterTemperatureText'='24-28°C'
    and snapshot->'en'->>'phLevelText'='8.1-8.4';
  if v_publication_count <> 1 then raise exception 'PRECHECK: sp_0187 publication baseline drift'; end if;

  if exists (select 1 from public.species_translations where species_id='${SOURCE_ID}'::uuid and deleted_at is null) then
    raise exception 'PRECHECK: unexpected sp_0187 translation override';
  end if;
  if (select count(*) from public.species s join public.species_compatibility_profiles p on p.species_id=s.id
      where s.catalog_key='sp_0187' and p.review_status='reviewed' and p.deleted_at is null
        and p.version=2
        and p.required_facts=ARRAY['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation']::text[]
        and p.predation_targets=ARRAY['fish_fry']::text[]) <> 1 then
    raise exception 'PRECHECK: sp_0187 Compatibility profile not reconciled';
  end if;
end
$precheck$;

do $republish$
declare
  v_snapshot jsonb;
  v_compatibility jsonb;
  v_draft_updated_at timestamptz;
  v_published_version integer;
  v_locale text;
begin
  select snapshot into v_snapshot
  from public.content_publications
  where resource_type='species' and resource_id='${SOURCE_ID}'::uuid
  for update;

  update public.species
  set water_temperature_min_c=22,
      water_temperature_max_c=26,
      water_temperature_text='22-26°C',
      ph_min=8.2,
      ph_max=8.4,
      ph_level_text='8.2-8.4',
      min_tank_liters=200,
      tank_size_text='至少 200 升',
      status='draft'
  where id='${SOURCE_ID}'::uuid and version=1 and status='published'
  returning updated_at into v_draft_updated_at;
  if v_draft_updated_at is null then raise exception 'REPUBLISH: source update/version transition failed'; end if;

  select jsonb_build_object(
    'behaviorTraits', to_jsonb(p.behavior_traits),
    'predationTargets', to_jsonb(p.predation_targets),
    'confidence', p.confidence::text,
    'reviewStatus', p.review_status::text,
    'citations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id,
        'title', e.title,
        'publisher', e.publisher,
        'url', e.url,
        'sourceType', e.source_type,
        'reviewStatus', e.review_status
      ) order by e.source_key)
      from public.species_compatibility_profile_sources l
      join public.evidence_sources e on e.id=l.source_id
      where l.profile_id=p.id and e.review_status='reviewed' and e.deleted_at is null
    ), '[]'::jsonb)
  ) || case when p.minimum_group_size is null then '{}'::jsonb
            else jsonb_build_object('minimumGroupSize', p.minimum_group_size) end
  into v_compatibility
  from public.species_compatibility_profiles p
  where p.species_id='${SOURCE_ID}'::uuid and p.review_status='reviewed' and p.deleted_at is null;

  if jsonb_array_length(v_compatibility->'citations') <> 4 then
    raise exception 'REPUBLISH: expected 4 reviewed Compatibility citations';
  end if;

  foreach v_locale in array ARRAY['zh-CN','en'] loop
    v_snapshot := jsonb_set(v_snapshot, ARRAY[v_locale,'waterTemperatureMinC'], '22'::jsonb, true);
    v_snapshot := jsonb_set(v_snapshot, ARRAY[v_locale,'waterTemperatureMaxC'], '26'::jsonb, true);
    v_snapshot := jsonb_set(v_snapshot, ARRAY[v_locale,'waterTemperatureText'], to_jsonb('22-26°C'::text), true);
    v_snapshot := jsonb_set(v_snapshot, ARRAY[v_locale,'phMin'], '8.2'::jsonb, true);
    v_snapshot := jsonb_set(v_snapshot, ARRAY[v_locale,'phMax'], '8.4'::jsonb, true);
    v_snapshot := jsonb_set(v_snapshot, ARRAY[v_locale,'phLevelText'], to_jsonb('8.2-8.4'::text), true);
    v_snapshot := jsonb_set(v_snapshot, ARRAY[v_locale,'minTankLiters'], '200'::jsonb, true);
    v_snapshot := jsonb_set(v_snapshot, ARRAY[v_locale,'tankSizeText'], to_jsonb('至少 200 升'::text), true);
    v_snapshot := jsonb_set(v_snapshot, ARRAY[v_locale,'updatedAt'], to_jsonb(v_draft_updated_at), true);
    v_snapshot := jsonb_set(v_snapshot, ARRAY[v_locale,'compatibilityProfile'], v_compatibility, true);
  end loop;

  select public.publish_content_snapshot('species','${SOURCE_ID}'::uuid,2,v_snapshot)
  into v_published_version;
  if v_published_version <> 3 then raise exception 'REPUBLISH: expected published version 3, got %', v_published_version; end if;
end
$republish$;

do $postcheck$
begin
  if (select count(*) from supabase_migrations.schema_migrations) <> 71
     or (select max(version) from supabase_migrations.schema_migrations) <> '20261016184500' then
    raise exception 'POSTCHECK: migration authority changed';
  end if;
  if (select count(*) from public.content_publications) <> 527
     or (select count(*) from public.species_compatibility_profiles where review_status='reviewed' and deleted_at is null) <> 109
     or (select count(*) from public.evidence_sources where review_status='reviewed' and deleted_at is null) <> 202 then
    raise exception 'POSTCHECK: unrelated authority count changed';
  end if;
  if (select count(*) from public.species
      where id='${SOURCE_ID}'::uuid and catalog_key='sp_0187' and version=3 and status='published'
        and water_temperature_min_c=22 and water_temperature_max_c=26
        and water_temperature_text='22-26°C'
        and ph_min=8.2 and ph_max=8.4 and ph_level_text='8.2-8.4'
        and min_tank_liters=200 and tank_size_text='至少 200 升'
        and deleted_at is null) <> 1 then
    raise exception 'POSTCHECK: sp_0187 source content mismatch';
  end if;
  if (select count(*) from public.content_publications
      where resource_type='species' and resource_id='${SOURCE_ID}'::uuid and source_version=3
        and (snapshot->'zh-CN'->>'minTankLiters')::numeric=200
        and snapshot->'zh-CN'->>'waterTemperatureText'='22-26°C'
        and snapshot->'zh-CN'->>'phLevelText'='8.2-8.4'
        and jsonb_array_length(snapshot->'zh-CN'->'compatibilityProfile'->'citations')=4
        and snapshot->'zh-CN'->'compatibilityProfile'->'predationTargets'='[\"fish_fry\"]'::jsonb
        and (snapshot->'en'->>'minTankLiters')::numeric=200
        and snapshot->'en'->>'waterTemperatureText'='22-26°C'
        and snapshot->'en'->>'phLevelText'='8.2-8.4'
        and jsonb_array_length(snapshot->'en'->'compatibilityProfile'->'citations')=4) <> 1 then
    raise exception 'POSTCHECK: sp_0187 publication snapshot mismatch';
  end if;
end
$postcheck$;

${finalize};
`;
};

const readLinkedProjectRef = () => readFileSync(join(root, 'supabase', '.temp', 'project-ref'), 'utf8').trim();
const assertCleanAlignedGit = () => {
  const status = run('git', ['status', '--porcelain']);
  if (status) throw new Error('Content republish commit requires a clean worktree.');
  const branch = run('git', ['branch', '--show-current']);
  const head = run('git', ['rev-parse', 'HEAD']);
  const main = run('git', ['rev-parse', 'origin/main']);
  const release = run('git', ['rev-parse', 'origin/release/production']);
  if (branch !== 'main' || head !== main || head !== release) throw new Error('Content republish requires main == origin/main == origin/release/production.');
  return { branch, head };
};

const executeSql = sql => {
  const dir = mkdtempSync(join(tmpdir(), 'aqua-chrysiptera-content-'));
  const file = join(dir, 'republish.sql');
  try {
    writeFileSync(file, sql);
    return run('supabase', ['db', 'query', '--linked', '--file', file]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const isMain = import.meta.url === 'file://' + process.argv[1];
if (isMain) {
  const commit = process.argv.includes('--commit');
  const simulate = process.argv.includes('--simulate');
  if (commit && simulate) throw new Error('Choose exactly one of --commit or --simulate.');
  const projectRef = readLinkedProjectRef();
  if (projectRef !== PRODUCTION_PROJECT_REF) throw new Error('Linked Supabase ref mismatch: ' + projectRef);
  if (!commit && !simulate) {
    console.log(JSON.stringify({ mode: 'dry-run', projectRef, start: START, target: TARGET, mutationAuthorized: false }, null, 2));
    process.exit(0);
  }
  if (commit && process.env.AQUAGUIDE_CHRYSIPTERA_CONTENT_REPUBLISH_CONFIRM !== CONFIRM_TOKEN) {
    throw new Error('Commit denied: set AQUAGUIDE_CHRYSIPTERA_CONTENT_REPUBLISH_CONFIRM=' + CONFIRM_TOKEN);
  }
  const gitState = commit ? assertCleanAlignedGit() : null;
  executeSql(buildRepublishSql({ finalize: simulate ? 'rollback' : 'commit' }));
  console.log(JSON.stringify({
    mode: simulate ? 'simulated-rollback' : 'committed',
    projectRef,
    start: START,
    target: TARGET,
    gitState,
    mutationAuthorized: commit,
  }, null, 2));
}
