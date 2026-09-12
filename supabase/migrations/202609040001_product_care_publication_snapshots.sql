begin;

create table if not exists public.content_publications (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null check (resource_type in ('species', 'care')),
  resource_id uuid not null,
  catalog_key text not null,
  snapshot jsonb not null,
  source_version integer not null check (source_version > 0),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resource_type, resource_id),
  unique (resource_type, catalog_key)
);

alter table public.content_publications enable row level security;
grant select on public.content_publications to anon, authenticated;
revoke insert, update, delete on public.content_publications from anon, authenticated;

drop policy if exists content_publications_public_select on public.content_publications;
create policy content_publications_public_select
  on public.content_publications
  for select
  using (true);

create or replace function public.publish_content_snapshot(
  p_resource_type text,
  p_resource_id uuid,
  p_expected_version integer,
  p_snapshot jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_catalog_key text;
  v_new_version integer;
  v_published_at timestamptz := now();
begin
  if p_snapshot is null then
    raise exception 'publication_snapshot_required';
  end if;

  if p_resource_type = 'species' then
    update public.species
      set status = 'published', published_at = v_published_at
      where id = p_resource_id and version = p_expected_version
      returning catalog_key, version into v_catalog_key, v_new_version;
  elsif p_resource_type = 'care' then
    update public.care_articles
      set status = 'published', published_at = v_published_at
      where id = p_resource_id and version = p_expected_version
      returning catalog_key, version into v_catalog_key, v_new_version;
  else
    raise exception 'unsupported_content_resource_type';
  end if;

  if v_catalog_key is null then
    raise exception 'content_missing_or_version_conflict';
  end if;

  insert into public.content_publications (
    resource_type, resource_id, catalog_key, snapshot, source_version, published_at
  ) values (
    p_resource_type, p_resource_id, v_catalog_key, p_snapshot, v_new_version, v_published_at
  )
  on conflict (resource_type, resource_id) do update
    set catalog_key = excluded.catalog_key,
        snapshot = excluded.snapshot,
        source_version = excluded.source_version,
        published_at = excluded.published_at,
        updated_at = now();

  return v_new_version;
end;
$$;

create or replace function public.archive_content_snapshot(
  p_resource_type text,
  p_resource_id uuid,
  p_expected_version integer
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_version integer;
begin
  if p_resource_type = 'species' then
    update public.species
      set status = 'archived', published_at = null
      where id = p_resource_id and version = p_expected_version
      returning version into v_new_version;
  elsif p_resource_type = 'care' then
    update public.care_articles
      set status = 'archived', published_at = null
      where id = p_resource_id and version = p_expected_version
      returning version into v_new_version;
  else
    raise exception 'unsupported_content_resource_type';
  end if;

  if v_new_version is null then
    raise exception 'content_missing_or_version_conflict';
  end if;

  delete from public.content_publications
    where resource_type = p_resource_type and resource_id = p_resource_id;

  return v_new_version;
end;
$$;

revoke all on function public.publish_content_snapshot(text, uuid, integer, jsonb) from public, anon, authenticated;
revoke all on function public.archive_content_snapshot(text, uuid, integer) from public, anon, authenticated;
grant execute on function public.publish_content_snapshot(text, uuid, integer, jsonb) to service_role;
grant execute on function public.archive_content_snapshot(text, uuid, integer) to service_role;

commit;
