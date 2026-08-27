begin;

-- Branch-only proposal for the isolated Species SEO Admin V0.
-- Do not apply to Production until the admin branch is reviewed and explicitly approved.
-- Product/catalog truth remains in src/data/fishData.ts for V0; SEO rows bind to its stable catalog key.

create table if not exists public.species_seo (
  id uuid primary key default gen_random_uuid(),
  catalog_key text not null,
  locale text not null default 'zh-CN',
  seo_title text not null default '',
  meta_description text not null default '',
  h1 text not null default '',
  intro text not null default '',
  image_alt text not null default '',
  canonical_path text not null default '',
  focus_keyword text not null default '',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0),
  unique (catalog_key, locale)
);

create trigger species_seo_set_updated_at
  before update on public.species_seo
  for each row execute function public.set_updated_at_and_version();

alter table public.species_seo enable row level security;

grant select on public.species_seo to anon, authenticated;
grant insert, update, delete on public.species_seo to authenticated;

create policy species_seo_public_select on public.species_seo
for select using (
  (status = 'published' and deleted_at is null)
  or public.is_admin()
);

create policy species_seo_admin_insert on public.species_seo
for insert with check (public.is_admin());

create policy species_seo_admin_update on public.species_seo
for update using (public.is_admin()) with check (public.is_admin());

create policy species_seo_admin_delete on public.species_seo
for delete using (public.is_admin());

commit;
