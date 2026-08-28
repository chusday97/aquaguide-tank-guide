-- Branch-only proposal for Species SEO indexing strategy.
-- Do not apply to Production until public Species routes and generator are reviewed.

alter table public.species_seo
  add column if not exists index_strategy text not null default 'noindex',
  add column if not exists canonical_catalog_key text not null default '';

alter table public.species_seo
  drop constraint if exists species_seo_index_strategy_check;

alter table public.species_seo
  add constraint species_seo_index_strategy_check
  check (index_strategy in ('noindex', 'index', 'canonical_to_sibling'));
