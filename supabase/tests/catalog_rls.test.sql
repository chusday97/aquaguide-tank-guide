begin;

select plan(19);

select ok(to_regclass('public.catalog_releases') is not null, 'catalog_releases table exists');
select ok(to_regclass('public.species_reference_links') is not null, 'species_reference_links table exists');
select ok(exists (
  select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'species' and column_name = 'water_type'
), 'species.water_type column exists');
select ok(exists (
  select 1 from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public' and t.relname = 'catalog_releases' and c.conname = 'catalog_releases_version_key_key'
), 'catalog release version key is unique');
select ok(exists (
  select 1 from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public' and t.relname = 'species_reference_links' and c.contype = 'p'
), 'species reference links have a primary key');
select ok((select relrowsecurity from pg_class where oid = 'public.catalog_releases'::regclass), 'catalog releases have RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.species_reference_links'::regclass), 'species reference links have RLS enabled');
select is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'catalog_releases'), 4, 'catalog releases expose four policies');
select is((select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'species_reference_links'), 4, 'species reference links expose four policies');
select ok(has_table_privilege('anon', 'public.catalog_releases', 'SELECT'), 'anon can reach catalog release reads');
select ok(not has_table_privilege('anon', 'public.catalog_releases', 'INSERT'), 'anon cannot reach catalog release writes');
select ok(has_table_privilege('authenticated', 'public.catalog_releases', 'INSERT'), 'authenticated reaches admin-gated catalog writes');
select ok(not has_function_privilege('anon', 'public.prevent_published_catalog_release_mutation()', 'EXECUTE'), 'trigger helper is not publicly executable');

insert into public.catalog_releases (
  version_key, schema_version, checksum_sha256, storage_path,
  species_count, reviewed_profile_count, reviewed_pair_rule_count,
  status, published_at
) values
  ('test-published', 1, repeat('a', 64), 'releases/test-published/catalog.snapshot.json', 1, 0, 0, 'published', now()),
  ('test-draft', 1, repeat('b', 64), 'releases/test-draft/catalog.snapshot.json', 1, 0, 0, 'draft', null);

set local role anon;
select is((select count(*)::integer from public.catalog_releases), 1, 'anon sees only published catalog releases');
reset role;

select throws_ok(
  $$update public.catalog_releases set checksum_sha256 = repeat('c', 64) where version_key = 'test-published'$$,
  'P0001',
  'published catalog releases are immutable',
  'published catalog release updates are blocked'
);
select throws_ok(
  $$delete from public.catalog_releases where version_key = 'test-published'$$,
  'P0001',
  'published catalog releases are immutable',
  'published catalog release deletes are blocked'
);

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
values (
  '10000000-0000-4000-8000-000000000098', 'authenticated', 'authenticated', 'catalog-user@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false, false
);
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000098', true);
select throws_ok(
  $$insert into public.catalog_releases (
    version_key, schema_version, checksum_sha256, storage_path,
    species_count, reviewed_profile_count, reviewed_pair_rule_count,
    status
  ) values ('test-user-draft', 1, repeat('e', 64), 'releases/test-user-draft/catalog.snapshot.json', 0, 0, 0, 'draft')$$,
  '42501',
  'new row violates row-level security policy for table "catalog_releases"',
  'ordinary authenticated users cannot write catalog drafts'
);
reset role;

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
values (
  '10000000-0000-4000-8000-000000000099', 'authenticated', 'authenticated', 'catalog-admin@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false, false
);
update public.user_roles set role = 'admin' where user_id = '10000000-0000-4000-8000-000000000099';

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000099', true);
select lives_ok($$insert into public.catalog_releases (
  version_key, schema_version, checksum_sha256, storage_path,
  species_count, reviewed_profile_count, reviewed_pair_rule_count,
  status
) values ('test-admin-draft', 1, repeat('d', 64), 'releases/test-admin-draft/catalog.snapshot.json', 0, 0, 0, 'draft')$$, 'admin can insert a draft catalog release');
reset role;
select is((select count(*)::integer from public.catalog_releases where version_key = 'test-admin-draft'), 1, 'admin draft catalog release is persisted');

select * from finish();
rollback;
