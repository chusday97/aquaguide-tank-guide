begin;

-- Branch-only proposal for the isolated Species SEO Admin V0.
-- Do not apply to Production until the admin branch is reviewed and explicitly approved.

create table if not exists public.species_seo (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null unique references public.species(id) on delete cascade,
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
  version integer not null default 1 check (version > 0)
);

create trigger species_seo_set_updated_at
  before update on public.species_seo
  for each row execute function public.set_updated_at_and_version();

alter table public.species_seo enable row level security;

grant select on public.species_seo to anon, authenticated;
grant insert, update, delete on public.species_seo to authenticated;

create policy species_seo_public_select on public.species_seo
for select using (
  (
    status = 'published'
    and deleted_at is null
    and exists (
      select 1 from public.species s
      where s.id = species_id
        and s.status = 'published'
        and s.deleted_at is null
    )
  )
  or public.is_admin()
);

create policy species_seo_admin_insert on public.species_seo
for insert with check (public.is_admin());

create policy species_seo_admin_update on public.species_seo
for update using (public.is_admin()) with check (public.is_admin());

create policy species_seo_admin_delete on public.species_seo
for delete using (public.is_admin());

commit;
