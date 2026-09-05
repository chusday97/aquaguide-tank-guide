begin;

-- Branch-only editorial approval + source-data review layer.
-- Approval is separate from publication status; Product Truth remains repository-owned.
alter table public.species_seo
  add column if not exists review_state text not null default 'editing'
    check (review_state in ('editing', 'ready_for_review', 'approved')),
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

alter table public.species_seo_groups
  add column if not exists review_state text not null default 'editing'
    check (review_state in ('editing', 'ready_for_review', 'approved')),
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

create table if not exists public.species_data_reviews (
  issue_key text primary key,
  issue_type text not null check (issue_type in ('category_conflict', 'duplicate_set')),
  group_key text not null,
  decision text not null,
  canonical_catalog_key text not null default '',
  notes text not null default '',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0),
  check (
    (issue_type = 'category_conflict' and decision in ('accepted_as_is', 'source_correction_required') and canonical_catalog_key = '')
    or
    (issue_type = 'duplicate_set' and decision in ('distinct_records', 'duplicate_records'))
  ),
  check (decision <> 'duplicate_records' or length(trim(canonical_catalog_key)) > 0)
);
create or replace function public.set_species_editorial_review_metadata()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_content_changed boolean := false;
begin
  -- New content always starts in Editing; approval must be a later explicit action.
  if tg_op = 'INSERT' then
    new.review_state := 'editing';
    new.reviewed_by := null;
    new.reviewed_at := null;
    return new;
  end if;

  -- Read fields only from the trigger table's own row type.
  if tg_table_name = 'species_seo' then
    v_content_changed := old.localized_name is distinct from new.localized_name or old.seo_title is distinct from new.seo_title or
      old.meta_description is distinct from new.meta_description or old.h1 is distinct from new.h1 or
      old.intro is distinct from new.intro or old.image_alt is distinct from new.image_alt or
      old.canonical_path is distinct from new.canonical_path or old.focus_keyword is distinct from new.focus_keyword or
      old.index_strategy is distinct from new.index_strategy or old.canonical_catalog_key is distinct from new.canonical_catalog_key;
  elsif tg_table_name = 'species_seo_groups' then
    v_content_changed := old.seo_title_template is distinct from new.seo_title_template or
      old.meta_description_template is distinct from new.meta_description_template or
      old.h1_template is distinct from new.h1_template or old.shared_intro is distinct from new.shared_intro;
  else
    raise exception 'Unsupported editorial review table: %', tg_table_name;
  end if;

  if v_content_changed then
    new.review_state := 'editing'; new.reviewed_by := null; new.reviewed_at := null;
  elsif new.review_state = 'approved' and old.review_state is distinct from 'approved' then
    new.reviewed_by := auth.uid(); new.reviewed_at := now();
  elsif new.review_state <> 'approved' then
    new.reviewed_by := null; new.reviewed_at := null;
  end if;
  return new;
end;
$$;

create trigger species_seo_review_metadata
  before insert or update on public.species_seo
  for each row execute function public.set_species_editorial_review_metadata();

create trigger species_seo_groups_review_metadata
  before insert or update on public.species_seo_groups
  for each row execute function public.set_species_editorial_review_metadata();
create or replace function public.set_species_data_review_metadata()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.reviewed_by := auth.uid();
  new.reviewed_at := now();
  return new;
end;
$$;

create trigger species_data_reviews_set_updated_at
  before update on public.species_data_reviews
  for each row execute function public.set_updated_at_and_version();

create trigger species_data_reviews_set_actor
  before insert or update on public.species_data_reviews
  for each row execute function public.set_species_data_review_metadata();

alter table public.species_data_reviews enable row level security;
grant select, insert, update, delete on public.species_data_reviews to authenticated;

create policy species_data_reviews_admin_select on public.species_data_reviews
for select using (public.is_admin());
create policy species_data_reviews_admin_insert on public.species_data_reviews
for insert with check (public.is_admin());
create policy species_data_reviews_admin_update on public.species_data_reviews
for update using (public.is_admin()) with check (public.is_admin());
create policy species_data_reviews_admin_delete on public.species_data_reviews
for delete using (public.is_admin());

-- Rollback intentionally resets editorial approval to editing.
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
  select * into v_revision from public.content_revisions where id = p_revision_id;
  if not found then raise exception 'Revision not found' using errcode = 'P0002'; end if;
  v_snapshot := v_revision.snapshot;
  perform set_config('aquaguide.revision_operation', 'rollback', true);
  perform set_config('aquaguide.source_revision_id', v_revision.id::text, true);
  if v_revision.resource_type = 'species_seo' then
    insert into public.species_seo (
      catalog_key, locale, localized_name, seo_title, meta_description, h1, intro, image_alt,
      canonical_path, focus_keyword, index_strategy, canonical_catalog_key, status, published_at,
      deleted_at, review_state, reviewed_by, reviewed_at
    ) values (
      v_revision.resource_key, v_revision.locale, coalesce(v_snapshot ->> 'localized_name', ''),
      coalesce(v_snapshot ->> 'seo_title', ''), coalesce(v_snapshot ->> 'meta_description', ''),
      coalesce(v_snapshot ->> 'h1', ''), coalesce(v_snapshot ->> 'intro', ''),
      coalesce(v_snapshot ->> 'image_alt', ''), coalesce(v_snapshot ->> 'canonical_path', ''),
      coalesce(v_snapshot ->> 'focus_keyword', ''), coalesce(v_snapshot ->> 'index_strategy', 'noindex'),
      coalesce(v_snapshot ->> 'canonical_catalog_key', ''), 'draft', null, null,
      'editing', null, null
    )
    on conflict (catalog_key, locale) do update set
      localized_name = excluded.localized_name, seo_title = excluded.seo_title,
      meta_description = excluded.meta_description, h1 = excluded.h1, intro = excluded.intro,
      image_alt = excluded.image_alt, canonical_path = excluded.canonical_path,
      focus_keyword = excluded.focus_keyword, index_strategy = excluded.index_strategy,
      canonical_catalog_key = excluded.canonical_catalog_key, status = 'draft', published_at = null,
      deleted_at = null, review_state = 'editing', reviewed_by = null, reviewed_at = null
    returning to_jsonb(species_seo.*) into v_result;
  elsif v_revision.resource_type = 'species_seo_group' then
    insert into public.species_seo_groups (
      group_key, locale, seo_title_template, meta_description_template, h1_template,
      shared_intro, status, published_at, deleted_at, review_state, reviewed_by, reviewed_at
    ) values (
      v_revision.resource_key, v_revision.locale, coalesce(v_snapshot ->> 'seo_title_template', ''),
      coalesce(v_snapshot ->> 'meta_description_template', ''), coalesce(v_snapshot ->> 'h1_template', ''),
      coalesce(v_snapshot ->> 'shared_intro', ''), 'draft', null, null, 'editing', null, null
    )
    on conflict (group_key, locale) do update set
      seo_title_template = excluded.seo_title_template,
      meta_description_template = excluded.meta_description_template,
      h1_template = excluded.h1_template,
      shared_intro = excluded.shared_intro,
      status = 'draft', published_at = null, deleted_at = null,
      review_state = 'editing', reviewed_by = null, reviewed_at = null
    returning to_jsonb(species_seo_groups.*) into v_result;
  else
    raise exception 'Unsupported revision resource type: %', v_revision.resource_type;
  end if;
  return v_result;
end;
$$;

revoke all on function public.restore_species_seo_revision(uuid) from public;
grant execute on function public.restore_species_seo_revision(uuid) to authenticated;
create or replace function public.species_seo_release_gate_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'schema_version', 7,
    'species_seo_ready', to_regclass('public.species_seo') is not null,
    'group_seo_ready', to_regclass('public.species_seo_groups') is not null,
    'revision_history_ready', to_regclass('public.content_revisions') is not null,
    'data_review_ready', to_regclass('public.species_data_reviews') is not null,
    'data_review_resolution_rpc_ready', to_regprocedure('public.species_seo_public_review_resolutions()') is not null,
    'restore_rpc_ready', to_regprocedure('public.restore_species_seo_revision(uuid)') is not null,
    'localized_name_ready', exists (
      select 1 from information_schema.columns where table_schema='public' and table_name='species_seo' and column_name='localized_name'
    ),
    'index_strategy_ready', exists (
      select 1 from information_schema.columns where table_schema='public' and table_name='species_seo' and column_name='index_strategy'
    ),
    'editorial_review_ready', exists (
      select 1 from information_schema.columns where table_schema='public' and table_name='species_seo' and column_name='review_state'
    ) and exists (
      select 1 from information_schema.columns where table_schema='public' and table_name='species_seo_groups' and column_name='review_state'
    )
  );
$$;
revoke all on function public.species_seo_release_gate_status() from public;
grant execute on function public.species_seo_release_gate_status() to anon, authenticated;

create or replace function public.species_seo_public_review_resolutions()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'issue_key', issue_key,
    'issue_type', issue_type,
    'group_key', group_key,
    'decision', decision,
    'canonical_catalog_key', canonical_catalog_key
  ) order by issue_key), '[]'::jsonb)
  from public.species_data_reviews;
$$;

revoke all on function public.species_seo_public_review_resolutions() from public;
grant execute on function public.species_seo_public_review_resolutions() to anon, authenticated;

commit;
