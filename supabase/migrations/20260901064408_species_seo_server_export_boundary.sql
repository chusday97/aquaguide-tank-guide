begin;

-- Hosted publication export is a server-only boundary.
-- Public readers may only see rows that are both Published and Approved.
drop policy if exists species_seo_public_select on public.species_seo;
create policy species_seo_public_select on public.species_seo
for select using (
  (status = 'published' and review_state = 'approved' and deleted_at is null)
  or public.is_admin()
);

drop policy if exists species_seo_groups_public_select on public.species_seo_groups;
create policy species_seo_groups_public_select on public.species_seo_groups
for select using (
  (status = 'published' and review_state = 'approved' and deleted_at is null)
  or public.is_admin()
);

-- New Supabase projects no longer auto-grant Data API table access.
grant select on table public.species_seo to service_role;
grant select on table public.species_seo_groups to service_role;
grant select on table public.species_data_reviews to service_role;

-- Data Review decisions are release inputs, not a public browser API.
revoke execute on function public.species_seo_public_review_resolutions() from anon, authenticated;
grant execute on function public.species_seo_public_review_resolutions() to service_role;


create or replace function public.species_seo_release_gate_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'schema_version', 8,
    'species_seo_ready', to_regclass('public.species_seo') is not null,
    'group_seo_ready', to_regclass('public.species_seo_groups') is not null,
    'revision_history_ready', to_regclass('public.content_revisions') is not null,
    'data_review_ready', to_regclass('public.species_data_reviews') is not null,
    'data_review_resolution_rpc_ready', to_regprocedure('public.species_seo_public_review_resolutions()') is not null,
    'restore_rpc_ready', to_regprocedure('public.restore_species_seo_revision(uuid)') is not null,
    'localized_name_ready', exists (select 1 from information_schema.columns where table_schema='public' and table_name='species_seo' and column_name='localized_name'),
    'index_strategy_ready', exists (select 1 from information_schema.columns where table_schema='public' and table_name='species_seo' and column_name='index_strategy'),
    'editorial_review_ready', exists (select 1 from information_schema.columns where table_schema='public' and table_name='species_seo' and column_name='review_state')
      and exists (select 1 from information_schema.columns where table_schema='public' and table_name='species_seo_groups' and column_name='review_state'),
    'server_export_ready',
      has_table_privilege('service_role', 'public.species_seo', 'select')
      and has_table_privilege('service_role', 'public.species_seo_groups', 'select')
      and has_table_privilege('service_role', 'public.species_data_reviews', 'select')
      and has_function_privilege('service_role', 'public.species_seo_public_review_resolutions()', 'execute')
      and not has_function_privilege('anon', 'public.species_seo_public_review_resolutions()', 'execute')
      and not has_function_privilege('authenticated', 'public.species_seo_public_review_resolutions()', 'execute')
  );
$$;
revoke all on function public.species_seo_release_gate_status() from public;
grant execute on function public.species_seo_release_gate_status() to anon, authenticated, service_role;

commit;
