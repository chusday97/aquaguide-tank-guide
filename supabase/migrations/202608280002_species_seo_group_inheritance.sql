begin;

-- Branch-only Base Species SEO inheritance layer.
-- Product/catalog truth remains in the repository; this table stores editorial shared content only.
create table if not exists public.species_seo_groups (
  id uuid primary key default gen_random_uuid(),
  group_key text not null,
  locale text not null default 'zh-CN',
  seo_title_template text not null default '{{name}}怎么养？水温、pH、混养与饲养指南',
  meta_description_template text not null default '了解{{name}}（{{base_species}}）的水温、pH、鱼缸环境、混养与日常饲养重点。',
  h1_template text not null default '{{name}}饲养指南',
  shared_intro text not null default '',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0),
  unique (group_key, locale)
);

create trigger species_seo_groups_set_updated_at
  before update on public.species_seo_groups
  for each row execute function public.set_updated_at_and_version();

alter table public.species_seo_groups enable row level security;

grant select on public.species_seo_groups to anon, authenticated;
grant insert, update, delete on public.species_seo_groups to authenticated;

create policy species_seo_groups_public_select on public.species_seo_groups
for select using (
  (status = 'published' and deleted_at is null)
  or public.is_admin()
);

create policy species_seo_groups_admin_insert on public.species_seo_groups
for insert with check (public.is_admin());

create policy species_seo_groups_admin_update on public.species_seo_groups
for update using (public.is_admin()) with check (public.is_admin());

create policy species_seo_groups_admin_delete on public.species_seo_groups
for delete using (public.is_admin());

commit;
