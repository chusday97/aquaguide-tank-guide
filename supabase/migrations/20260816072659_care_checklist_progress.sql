begin;

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
