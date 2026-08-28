begin;

-- Safe, data-free readiness probe for non-production publishing verification.
-- It exposes only whether the expected Species SEO schema pieces exist.
create or replace function public.species_seo_release_gate_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'schema_version', 6,
    'species_seo_ready', to_regclass('public.species_seo') is not null,
    'group_seo_ready', to_regclass('public.species_seo_groups') is not null,
    'revision_history_ready', to_regclass('public.content_revisions') is not null,
    'restore_rpc_ready', to_regprocedure('public.restore_species_seo_revision(uuid)') is not null,
    'localized_name_ready', exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'species_seo' and column_name = 'localized_name'
    ),
    'index_strategy_ready', exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'species_seo' and column_name = 'index_strategy'
    )
  );
$$;

revoke all on function public.species_seo_release_gate_status() from public;
grant execute on function public.species_seo_release_gate_status() to anon, authenticated;

commit;
