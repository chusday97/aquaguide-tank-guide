-- Branch-only bilingual content extension for Admin V0.
-- Do not apply to Production until the bilingual workflow is reviewed.

begin;

alter table public.species_seo
  add column if not exists localized_name text not null default '';

comment on column public.species_seo.localized_name is
  'Locale-specific common/display name used by editorial SEO templates. Product Truth name remains in the catalog.';

commit;
