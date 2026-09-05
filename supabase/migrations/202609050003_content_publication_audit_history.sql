begin;

create table if not exists public.content_publication_events (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null check (resource_type in ('species','care')),
  resource_id uuid not null,
  catalog_key text not null,
  event_type text not null check (event_type in ('baseline','published','archived')),
  source_version integer not null check (source_version > 0),
  snapshot jsonb,
  actor_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists content_publication_events_resource_idx
  on public.content_publication_events(resource_type,resource_id,occurred_at desc);
create index if not exists content_publication_events_occurred_idx
  on public.content_publication_events(occurred_at desc);

alter table public.content_publication_events enable row level security;
revoke all on public.content_publication_events from anon, authenticated;
grant select on public.content_publication_events to authenticated;
drop policy if exists content_publication_events_admin_select on public.content_publication_events;
create policy content_publication_events_admin_select
  on public.content_publication_events
  for select
  using (public.is_admin());

insert into public.content_publication_events (
  resource_type, resource_id, catalog_key, event_type,
  source_version, snapshot, occurred_at, metadata
)
select
  resource_type, resource_id, catalog_key, 'baseline',
  source_version, snapshot, published_at,
  jsonb_build_object('sourcePublicationId', id, 'backfilled', true)
from public.content_publications;

create or replace function public.publish_content_snapshot_audited(
  p_resource_type text,
  p_resource_id uuid,
  p_expected_version integer,
  p_snapshot jsonb,
  p_actor_id uuid
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_catalog_key text;
  v_new_version integer;
  v_published_at timestamptz := now();
  v_publication_id uuid;
begin
  if p_snapshot is null then raise exception 'publication_snapshot_required'; end if;

  if p_resource_type = 'species' then
    update public.species set status='published', published_at=v_published_at
      where id=p_resource_id and version=p_expected_version
      returning catalog_key,version into v_catalog_key,v_new_version;
  elsif p_resource_type = 'care' then
    update public.care_articles set status='published', published_at=v_published_at
      where id=p_resource_id and version=p_expected_version
      returning catalog_key,version into v_catalog_key,v_new_version;
  else
    raise exception 'unsupported_content_resource_type';
  end if;

  if v_catalog_key is null then raise exception 'content_missing_or_version_conflict'; end if;

  insert into public.content_publications(
    resource_type,resource_id,catalog_key,snapshot,source_version,published_at
  ) values (
    p_resource_type,p_resource_id,v_catalog_key,p_snapshot,v_new_version,v_published_at
  )
  on conflict (resource_type,resource_id) do update set
    catalog_key=excluded.catalog_key,
    snapshot=excluded.snapshot,
    source_version=excluded.source_version,
    published_at=excluded.published_at,
    updated_at=now()
  returning id into v_publication_id;

  insert into public.content_publication_events(
    resource_type,resource_id,catalog_key,event_type,source_version,
    snapshot,actor_id,occurred_at,metadata
  ) values (
    p_resource_type,p_resource_id,v_catalog_key,'published',v_new_version,
    p_snapshot,p_actor_id,v_published_at,
    jsonb_build_object('sourcePublicationId',v_publication_id)
  );

  return v_new_version;
end;
$$;

create or replace function public.archive_content_snapshot_audited(
  p_resource_type text,
  p_resource_id uuid,
  p_expected_version integer,
  p_actor_id uuid
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_catalog_key text;
  v_new_version integer;
  v_previous_snapshot jsonb;
  v_previous_source_version integer;
  v_publication_id uuid;
  v_archived_at timestamptz := now();
begin
  select id,catalog_key,snapshot,source_version
    into v_publication_id,v_catalog_key,v_previous_snapshot,v_previous_source_version
  from public.content_publications
  where resource_type=p_resource_type and resource_id=p_resource_id
  for update;

  if p_resource_type = 'species' then
    update public.species set status='archived', published_at=null
      where id=p_resource_id and version=p_expected_version
      returning catalog_key,version into v_catalog_key,v_new_version;
  elsif p_resource_type = 'care' then
    update public.care_articles set status='archived', published_at=null
      where id=p_resource_id and version=p_expected_version
      returning catalog_key,version into v_catalog_key,v_new_version;
  else
    raise exception 'unsupported_content_resource_type';
  end if;
  if v_new_version is null then raise exception 'content_missing_or_version_conflict'; end if;

  insert into public.content_publication_events(
    resource_type,resource_id,catalog_key,event_type,source_version,
    snapshot,actor_id,occurred_at,metadata
  ) values (
    p_resource_type,p_resource_id,v_catalog_key,'archived',v_new_version,
    v_previous_snapshot,p_actor_id,v_archived_at,
    jsonb_build_object(
      'sourcePublicationId',v_publication_id,
      'previousSourceVersion',v_previous_source_version
    )
  );

  delete from public.content_publications
  where resource_type=p_resource_type and resource_id=p_resource_id;

  return v_new_version;
end;
$$;

revoke all on function public.publish_content_snapshot_audited(text,uuid,integer,jsonb,uuid) from public,anon,authenticated;
revoke all on function public.archive_content_snapshot_audited(text,uuid,integer,uuid) from public,anon,authenticated;
grant execute on function public.publish_content_snapshot_audited(text,uuid,integer,jsonb,uuid) to service_role;
grant execute on function public.archive_content_snapshot_audited(text,uuid,integer,uuid) to service_role;

commit;
