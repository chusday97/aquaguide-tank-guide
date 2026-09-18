begin;

alter table public.species
  add column if not exists water_type text not null default 'unknown';

alter table public.species
  drop constraint if exists species_water_type_check;

alter table public.species
  add constraint species_water_type_check
  check (water_type in ('freshwater', 'saltwater', 'brackish', 'unknown'));

create table if not exists public.species_reference_links (
  species_id uuid not null references public.species(id) on delete cascade,
  source_id uuid not null references public.evidence_sources(id) on delete restrict,
  field_group text not null check (field_group in ('identity', 'habitat', 'care')),
  review_status text not null default 'draft' check (review_status in ('draft', 'reviewed', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0),
  primary key (species_id, source_id, field_group)
);

create table if not exists public.catalog_releases (
  id uuid primary key default gen_random_uuid(),
  version_key text not null unique,
  schema_version integer not null check (schema_version > 0),
  checksum_sha256 text not null check (checksum_sha256 ~ '^[0-9a-fA-F]{64}$'),
  storage_bucket text not null default 'catalog-public',
  storage_path text not null unique,
  species_count integer not null check (species_count >= 0),
  reviewed_profile_count integer not null check (reviewed_profile_count >= 0),
  reviewed_pair_rule_count integer not null check (reviewed_pair_rule_count >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0)
);

create or replace function public.prevent_published_catalog_release_mutation()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'published' then
    raise exception 'published catalog releases are immutable';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists catalog_releases_immutable on public.catalog_releases;
create trigger catalog_releases_immutable
  before update or delete on public.catalog_releases
  for each row execute function public.prevent_published_catalog_release_mutation();

alter table public.species_reference_links enable row level security;
alter table public.catalog_releases enable row level security;

drop policy if exists species_reference_links_public_select on public.species_reference_links;
create policy species_reference_links_public_select on public.species_reference_links for select using (
  (review_status = 'reviewed' and deleted_at is null
   and exists (select 1 from public.species s where s.id = species_id and s.status = 'published' and s.deleted_at is null)
   and exists (select 1 from public.evidence_sources e where e.id = source_id and e.review_status = 'reviewed' and e.deleted_at is null))
  or public.is_admin()
);

drop policy if exists species_reference_links_admin_insert on public.species_reference_links;
create policy species_reference_links_admin_insert on public.species_reference_links for insert with check (public.is_admin());
drop policy if exists species_reference_links_admin_update on public.species_reference_links;
create policy species_reference_links_admin_update on public.species_reference_links for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists species_reference_links_admin_delete on public.species_reference_links;
create policy species_reference_links_admin_delete on public.species_reference_links for delete using (public.is_admin());

drop policy if exists catalog_releases_public_select on public.catalog_releases;
create policy catalog_releases_public_select on public.catalog_releases for select using (
  (status = 'published' and deleted_at is null) or public.is_admin()
);
drop policy if exists catalog_releases_admin_insert on public.catalog_releases;
create policy catalog_releases_admin_insert on public.catalog_releases for insert with check (public.is_admin());
drop policy if exists catalog_releases_admin_update on public.catalog_releases;
create policy catalog_releases_admin_update on public.catalog_releases for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists catalog_releases_admin_delete on public.catalog_releases;
create policy catalog_releases_admin_delete on public.catalog_releases for delete using (public.is_admin());

-- Data API exposure is explicit: published content is publicly readable, while
-- mutations remain subject to the administrator-only RLS policies above.
grant select on table public.species_reference_links to anon, authenticated, service_role;
grant insert, update, delete on table public.species_reference_links to authenticated, service_role;
grant select on table public.catalog_releases to anon, authenticated, service_role;
grant insert, update, delete on table public.catalog_releases to authenticated, service_role;
revoke insert, update, delete, truncate, references, trigger on table public.species_reference_links from anon;
revoke truncate, references, trigger on table public.species_reference_links from authenticated;
revoke references, trigger on table public.species_reference_links from service_role;
revoke insert, update, delete, truncate, references, trigger on table public.catalog_releases from anon;
revoke truncate, references, trigger on table public.catalog_releases from authenticated;
revoke references, trigger on table public.catalog_releases from service_role;

-- Trigger helpers are not part of the public Data API surface.
revoke all on function public.prevent_published_catalog_release_mutation() from public, anon, authenticated, service_role;

drop trigger if exists species_reference_links_set_updated_at on public.species_reference_links;
create trigger species_reference_links_set_updated_at
  before update on public.species_reference_links
  for each row execute function public.set_updated_at_and_version();
drop trigger if exists catalog_releases_set_updated_at on public.catalog_releases;
create trigger catalog_releases_set_updated_at
  before update on public.catalog_releases
  for each row execute function public.set_updated_at_and_version();

commit;
