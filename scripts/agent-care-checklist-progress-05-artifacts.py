from pathlib import Path

MIGRATION = r'''begin;

create table public.care_checklist_progress (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  aquarium_id uuid references public.aquariums(id) on delete cascade,
  topic_id text not null check (length(trim(topic_id)) between 1 and 160),
  title text not null check (length(trim(title)) between 1 and 200),
  action_keys text[] not null default '{}',
  legacy_actions text[] not null default '{}',
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0),
  check (cardinality(action_keys) <= 50),
  check (cardinality(legacy_actions) <= 50),
  check (cardinality(action_keys) > 0 or cardinality(legacy_actions) > 0)
);

create unique index care_checklist_progress_owner_scope_topic_idx
  on public.care_checklist_progress (
    owner_id,
    coalesce(aquarium_id, '00000000-0000-0000-0000-000000000000'::uuid),
    topic_id
  )
  where deleted_at is null;

create index care_checklist_progress_owner_saved_idx
  on public.care_checklist_progress(owner_id, saved_at desc)
  where deleted_at is null;

create trigger care_checklist_progress_updated_at
  before update on public.care_checklist_progress
  for each row execute function public.set_updated_at_and_version();

alter table public.care_checklist_progress enable row level security;

create policy care_checklist_progress_owner_all
  on public.care_checklist_progress
  for all
  to authenticated
  using (
    owner_id = (select auth.uid())
    and (
      aquarium_id is null
      or exists (
        select 1
        from public.aquariums a
        where a.id = aquarium_id
          and a.owner_id = (select auth.uid())
          and a.deleted_at is null
      )
    )
  )
  with check (
    owner_id = (select auth.uid())
    and (
      aquarium_id is null
      or exists (
        select 1
        from public.aquariums a
        where a.id = aquarium_id
          and a.owner_id = (select auth.uid())
          and a.deleted_at is null
      )
    )
  );

commit;
'''
TEST = r'''import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  getCareChecklistActionKey,
  getSavedCareChecklistForContext,
  getSavedCareChecklistRestoredActions,
  type CareSavedChecklist,
} from '../src/services/care/care-activity.service';

const records: CareSavedChecklist[] = [
  { id: 'guide_fry_care', title: 'Global legacy progress', savedAt: '2026-08-15T00:00:00.000Z', actions: ['旧文案动作'] },
  { id: 'guide_fry_care', title: 'Tank A progress', savedAt: '2026-08-16T00:00:00.000Z', actionKeys: [getCareChecklistActionKey('guide_fry_care', 0)], aquariumId: 'tank-a' },
  { id: 'guide_fry_care', title: 'Tank B progress', savedAt: '2026-08-16T01:00:00.000Z', actionKeys: [getCareChecklistActionKey('guide_fry_care', 1)], aquariumId: 'tank-b' },
];

assert.equal(getSavedCareChecklistForContext(records, 'guide_fry_care', 'tank-a')?.actionKeys?.[0], getCareChecklistActionKey('guide_fry_care', 0));
assert.equal(getSavedCareChecklistForContext(records, 'guide_fry_care', 'tank-b')?.actionKeys?.[0], getCareChecklistActionKey('guide_fry_care', 1));
assert.equal(getSavedCareChecklistForContext(records, 'guide_fry_care', 'tank-c')?.actions?.[0], '旧文案动作');
assert.deepEqual(
  getSavedCareChecklistRestoredActions(records[1], 'guide_fry_care', ['English action one', 'English action two']),
  ['English action one'],
  'stable action key must restore the current locale text by position rather than persisted display copy',
);

const carePage = fs.readFileSync('src/pages/CareEncyclopedia.tsx', 'utf8');
const repositoryContract = fs.readFileSync('src/services/repository/aquaguide.repository.ts', 'utf8');
const apiRepository = fs.readFileSync('src/services/repository/api-aquaguide.repository.ts', 'utf8');
const apiRoutes = fs.readFileSync('apps/api/src/routes/user-records.ts', 'utf8');
const contract = fs.readFileSync('packages/contracts/src/business.ts', 'utf8');
const dbTypes = fs.readFileSync('src/types/database.ts', 'utf8');
const migration = fs.readdirSync('supabase/migrations').find(name => name.endsWith('_care_checklist_progress.sql'));
assert.ok(migration, 'care checklist progress migration is missing');
const migrationSql = fs.readFileSync(`supabase/migrations/${migration}`, 'utf8');

for (const snippet of [
  'getCareChecklistProgress(aquariumId?: string)',
  'saveCareChecklistProgress(input: CareChecklistProgressMutation)',
]) assert.ok(repositoryContract.includes(snippet), `repository contract missing ${snippet}`);

for (const snippet of [
  "'/care-checklist-progress'",
  "createIdempotencyKey('care-checklist-progress')",
  'saveCareChecklistProgress(input: CareChecklistProgressMutation)',
]) assert.ok(apiRepository.includes(snippet), `API repository missing ${snippet}`);

for (const snippet of [
  'careChecklistProgressSaveSchema',
  "userRecordsRouter.get('/care-checklist-progress'",
  "userRecordsRouter.put('/care-checklist-progress'",
  'deterministicUuid(`${userId}:care-checklist-progress:${scopeKey}:${parsed.data.topicId}`)',
]) assert.ok(apiRoutes.includes(snippet), `API route missing ${snippet}`);

for (const snippet of [
  'repository.getCareChecklistProgress()',
  'await repository.saveCareChecklistProgress({',
  'const checklistProgress = await repository.getCareChecklistProgress();',
  'setSavedCareChecklists(checklistProgress);',
  'subscribeToCareActivity(syncChecklistProgress)',
  'getSavedCareChecklistForContext(',
  'getSavedCareChecklistRestoredActions(',
  'getCareChecklistActionKey(topic.id, index)',
  'savedChecklist?.aquariumId === activeAquarium.id',
]) assert.ok(carePage.includes(snippet), `Care page missing canonical checklist behavior: ${snippet}`);

const saveFunctionStart = carePage.indexOf('const saveChecklist = async () => {');
const saveFunctionEnd = carePage.indexOf('const handleSecondaryCta', saveFunctionStart);
assert.ok(saveFunctionStart >= 0 && saveFunctionEnd > saveFunctionStart, 'canonical checklist save function missing');
const saveFunction = carePage.slice(saveFunctionStart, saveFunctionEnd);
assert.ok(
  saveFunction.indexOf('await repository.saveCareChecklistProgress({') < saveFunction.indexOf('setSavedCareChecklists(checklistProgress);'),
  'local mirror must not change before canonical save succeeds',
);
assert.ok(!saveFunction.includes('setSavedCareChecklists(next)'), 'legacy local-only checklist save path must be removed');

assert.ok(contract.includes('careChecklistProgressSaveSchema'), 'API contract missing checklist progress schema');
assert.ok(contract.includes('actionKeys:'), 'API contract must persist stable checklist action keys');
assert.ok(contract.includes('legacyActions:'), 'API contract must preserve legacy display-text progress only for migration');
assert.ok(dbTypes.includes('export interface CareChecklistProgressRecord'), 'database type missing checklist progress record');
for (const snippet of [
  'create table public.care_checklist_progress',
  'action_keys text[]',
  'legacy_actions text[]',
  'care_checklist_progress_owner_scope_topic_idx',
  'alter table public.care_checklist_progress enable row level security',
  'create policy care_checklist_progress_owner_all',
]) assert.ok(migrationSql.includes(snippet), `migration missing ${snippet}`);

console.log('Canonical care checklist progress contract passed');
'''

migration = Path("supabase/migrations/20260816072000_care_checklist_progress.sql")
test_path = Path("scripts/test-care-checklist-progress-canonical.ts")
if migration.exists() or test_path.exists():
    raise SystemExit("canonical care checklist progress artifacts already exist")
migration.write_text(MIGRATION)
test_path.write_text(TEST)
print("05-artifacts.py applied")
