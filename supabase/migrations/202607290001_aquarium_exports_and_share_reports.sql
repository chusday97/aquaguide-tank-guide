begin;

alter table public.aquariums
  add column if not exists started_at date,
  add column if not exists started_at_source text,
  add column if not exists started_at_confirmed_at timestamptz;

alter table public.aquariums
  add constraint aquariums_started_at_source_check
  check (started_at_source is null or started_at_source in ('created', 'inferred', 'user'));

update public.aquariums aquarium
set
  started_at = coalesce(
    aquarium.started_at,
    (select min(species.entry_date) from public.aquarium_species species where species.aquarium_id = aquarium.id),
    aquarium.created_at::date
  ),
  started_at_source = coalesce(aquarium.started_at_source, 'inferred');

alter table public.aquariums
  alter column started_at set default current_date,
  alter column started_at set not null,
  alter column started_at_source set default 'created',
  alter column started_at_source set not null;

create table public.aquarium_share_reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  aquarium_id uuid not null references public.aquariums(id) on delete cascade,
  snapshot_version integer not null default 1 check (snapshot_version = 1),
  snapshot jsonb not null,
  token_hash text not null unique check (char_length(token_hash) = 64),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0)
);

create index aquarium_share_reports_owner_idx
  on public.aquarium_share_reports(owner_id, created_at desc)
  where deleted_at is null;

create index aquarium_share_reports_token_idx
  on public.aquarium_share_reports(token_hash)
  where deleted_at is null;

create trigger aquarium_share_reports_set_updated_at
  before update on public.aquarium_share_reports
  for each row execute function public.set_updated_at_and_version();

alter table public.aquarium_share_reports enable row level security;

create policy aquarium_share_reports_owner_select
on public.aquarium_share_reports for select
using (owner_id = auth.uid());

create policy aquarium_share_reports_owner_insert
on public.aquarium_share_reports for insert
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.aquariums aquarium
    where aquarium.id = aquarium_id
      and aquarium.owner_id = auth.uid()
      and aquarium.deleted_at is null
  )
);

create policy aquarium_share_reports_owner_update
on public.aquarium_share_reports for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

commit;
