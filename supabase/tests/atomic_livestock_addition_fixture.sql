create role authenticated;
create schema auth;

create table auth.users (
  id uuid primary key
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

drop schema public cascade;
create schema public;
grant usage on schema public to authenticated;

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.aquarium_life_stage as enum ('unknown', 'juvenile', 'adult');
create type public.aquarium_reproductive_state as enum (
  'unknown', 'not_applicable', 'normal', 'pregnant_or_gravid',
  'in_labor_or_spawning', 'postpartum_recovery'
);

create table public.aquariums (
  id uuid primary key,
  owner_id uuid not null references auth.users(id),
  deleted_at timestamptz
);

create table public.species (
  id uuid primary key,
  catalog_key text not null unique,
  status public.content_status not null,
  deleted_at timestamptz
);

create table public.aquarium_species (
  id uuid primary key,
  aquarium_id uuid not null references public.aquariums(id) on delete cascade,
  species_id uuid references public.species(id) on delete set null,
  species_catalog_key text not null,
  quantity integer not null check (quantity > 0),
  entry_date date not null,
  last_water_change_at timestamptz,
  deleted_at timestamptz
);

create unique index aquarium_species_active_key_idx
  on public.aquarium_species(aquarium_id, species_catalog_key)
  where deleted_at is null;

create table public.aquarium_species_batches (
  id uuid primary key,
  aquarium_species_id uuid not null references public.aquarium_species(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  entry_date date not null,
  life_stage public.aquarium_life_stage not null default 'unknown',
  reproductive_state public.aquarium_reproductive_state not null default 'unknown',
  state_updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.idempotency_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null,
  request_method text not null,
  request_path text not null,
  request_hash text not null,
  resource_type text,
  resource_id uuid,
  response_status integer not null,
  expires_at timestamptz not null,
  deleted_at timestamptz,
  unique (owner_id, idempotency_key)
);

create or replace function public.sync_test_batch_quantity()
returns trigger
language plpgsql
as $$
declare
  target_species_id uuid := coalesce(new.aquarium_species_id, old.aquarium_species_id);
begin
  update public.aquarium_species
  set quantity = (
    select coalesce(sum(quantity), 0)::integer
    from public.aquarium_species_batches
    where aquarium_species_id = target_species_id and deleted_at is null
  )
  where id = target_species_id;
  return null;
end;
$$;

create trigger aquarium_species_batches_sync_test_quantity
after insert or update or delete on public.aquarium_species_batches
for each row execute function public.sync_test_batch_quantity();

insert into auth.users (id) values ('10000000-0000-4000-8000-000000000001');
insert into public.aquariums (id, owner_id)
values ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001');
insert into public.species (id, catalog_key, status)
values ('30000000-0000-4000-8000-000000000001', 'sp_0001', 'published');
