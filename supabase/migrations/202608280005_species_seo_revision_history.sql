begin;

-- Branch-only audit/history layer for Species SEO content.
-- Rollback always restores content as Draft; it can never republish content by itself.
create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null check (resource_type in ('species_seo', 'species_seo_group')),
  resource_key text not null,
  locale text not null,
  version integer not null check (version > 0),
  operation text not null check (operation in ('insert', 'update', 'delete', 'rollback')),
  snapshot jsonb not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  source_revision_id uuid references public.content_revisions(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists content_revisions_lookup_idx
  on public.content_revisions(resource_type, resource_key, locale, created_at desc);

alter table public.content_revisions enable row level security;
grant select on public.content_revisions to authenticated;

create policy content_revisions_admin_select on public.content_revisions
for select using (public.is_admin());

create or replace function public.record_species_seo_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_snapshot jsonb;
  v_resource_type text;
  v_resource_key text;
  v_locale text;
  v_version integer;
  v_operation text;
  v_source_revision_text text;
  v_source_revision_id uuid;
begin
  if tg_op = 'DELETE' then
    v_snapshot := to_jsonb(old);
    v_version := old.version;
    v_locale := old.locale;
    if tg_table_name = 'species_seo' then
      v_resource_type := 'species_seo';
      v_resource_key := old.catalog_key;
    elsif tg_table_name = 'species_seo_groups' then
      v_resource_type := 'species_seo_group';
      v_resource_key := old.group_key;
    else
      raise exception 'Unsupported revision source table: %', tg_table_name;
    end if;
  else
    v_snapshot := to_jsonb(new);
    v_version := new.version;
    v_locale := new.locale;
    if tg_table_name = 'species_seo' then
      v_resource_type := 'species_seo';
      v_resource_key := new.catalog_key;
    elsif tg_table_name = 'species_seo_groups' then
      v_resource_type := 'species_seo_group';
      v_resource_key := new.group_key;
    else
      raise exception 'Unsupported revision source table: %', tg_table_name;
    end if;
  end if;

  v_operation := coalesce(nullif(current_setting('aquaguide.revision_operation', true), ''), lower(tg_op));
  v_source_revision_text := nullif(current_setting('aquaguide.source_revision_id', true), '');
  if v_source_revision_text is not null then
    v_source_revision_id := v_source_revision_text::uuid;
  end if;

  insert into public.content_revisions (
    resource_type, resource_key, locale, version, operation, snapshot, actor_user_id, source_revision_id
  ) values (
    v_resource_type, v_resource_key, v_locale, v_version, v_operation, v_snapshot, auth.uid(), v_source_revision_id
  );

  return null;
end;
$$;

create trigger species_seo_record_revision
  after insert or update or delete on public.species_seo
  for each row execute function public.record_species_seo_revision();

create trigger species_seo_groups_record_revision
  after insert or update or delete on public.species_seo_groups
  for each row execute function public.record_species_seo_revision();

create or replace function public.restore_species_seo_revision(p_revision_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_revision public.content_revisions%rowtype;
  v_snapshot jsonb;
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin role required' using errcode = '42501';
  end if;

  select * into v_revision
  from public.content_revisions
  where id = p_revision_id;

  if not found then
    raise exception 'Revision not found' using errcode = 'P0002';
  end if;

  v_snapshot := v_revision.snapshot;
  perform set_config('aquaguide.revision_operation', 'rollback', true);
  perform set_config('aquaguide.source_revision_id', v_revision.id::text, true);

  if v_revision.resource_type = 'species_seo' then
    insert into public.species_seo (
      catalog_key, locale, localized_name, seo_title, meta_description, h1, intro, image_alt,
      canonical_path, focus_keyword, index_strategy, canonical_catalog_key, status, published_at, deleted_at
    ) values (
      v_revision.resource_key, v_revision.locale, coalesce(v_snapshot ->> 'localized_name', ''),
      coalesce(v_snapshot ->> 'seo_title', ''), coalesce(v_snapshot ->> 'meta_description', ''),
      coalesce(v_snapshot ->> 'h1', ''), coalesce(v_snapshot ->> 'intro', ''),
      coalesce(v_snapshot ->> 'image_alt', ''), coalesce(v_snapshot ->> 'canonical_path', ''),
      coalesce(v_snapshot ->> 'focus_keyword', ''), coalesce(v_snapshot ->> 'index_strategy', 'noindex'),
      coalesce(v_snapshot ->> 'canonical_catalog_key', ''), 'draft', null, null
    )
    on conflict (catalog_key, locale) do update set
      localized_name = excluded.localized_name,
      seo_title = excluded.seo_title,
      meta_description = excluded.meta_description,
      h1 = excluded.h1,
      intro = excluded.intro,
      image_alt = excluded.image_alt,
      canonical_path = excluded.canonical_path,
      focus_keyword = excluded.focus_keyword,
      index_strategy = excluded.index_strategy,
      canonical_catalog_key = excluded.canonical_catalog_key,
      status = 'draft',
      published_at = null,
      deleted_at = null
    returning to_jsonb(species_seo.*) into v_result;
  elsif v_revision.resource_type = 'species_seo_group' then
    insert into public.species_seo_groups (
      group_key, locale, seo_title_template, meta_description_template, h1_template,
      shared_intro, status, published_at, deleted_at
    ) values (
      v_revision.resource_key, v_revision.locale, coalesce(v_snapshot ->> 'seo_title_template', ''),
      coalesce(v_snapshot ->> 'meta_description_template', ''), coalesce(v_snapshot ->> 'h1_template', ''),
      coalesce(v_snapshot ->> 'shared_intro', ''), 'draft', null, null
    )
    on conflict (group_key, locale) do update set
      seo_title_template = excluded.seo_title_template,
      meta_description_template = excluded.meta_description_template,
      h1_template = excluded.h1_template,
      shared_intro = excluded.shared_intro,
      status = 'draft',
      published_at = null,
      deleted_at = null
    returning to_jsonb(species_seo_groups.*) into v_result;
  else
    raise exception 'Unsupported revision resource type: %', v_revision.resource_type;
  end if;

  return v_result;
end;
$$;

revoke all on function public.restore_species_seo_revision(uuid) from public;
grant execute on function public.restore_species_seo_revision(uuid) to authenticated;

commit;
