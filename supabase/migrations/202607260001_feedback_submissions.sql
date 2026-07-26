create type public.feedback_category as enum ('suggestion', 'problem', 'content', 'other');
create type public.feedback_status as enum ('new', 'reviewed', 'closed');

create table public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  category public.feedback_category not null,
  message text not null check (char_length(btrim(message)) between 10 and 2000),
  page_path text not null check (char_length(page_path) between 1 and 500),
  locale public.app_locale not null default 'zh-CN',
  app_version text not null check (char_length(app_version) between 1 and 80),
  device_layout text not null check (device_layout in ('phone', 'desktop')),
  status public.feedback_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0)
);

create index feedback_submissions_status_created_idx
  on public.feedback_submissions (status, created_at desc);

alter table public.feedback_submissions enable row level security;

create policy feedback_admin_select
  on public.feedback_submissions
  for select
  using (public.is_admin());

create policy feedback_admin_update
  on public.feedback_submissions
  for update
  using (public.is_admin())
  with check (public.is_admin());

create trigger feedback_submissions_set_updated_at
before update on public.feedback_submissions
for each row execute function public.set_updated_at_and_version();

comment on table public.feedback_submissions is
  'Low-sensitivity product feedback. Inserts are accepted only through the Express API.';
