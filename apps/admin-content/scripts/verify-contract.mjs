import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const repoRoot = path.resolve(appRoot, '../..');

const [appSource, supabaseSource, migrationSource, envExample, catalogRaw] = await Promise.all([
  readFile(path.join(appRoot, 'src/App.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/supabase.js'), 'utf8'),
  readFile(path.join(repoRoot, 'supabase/migrations/202608280001_species_seo_admin.sql'), 'utf8'),
  readFile(path.join(appRoot, '.env.example'), 'utf8'),
  readFile(path.join(appRoot, 'src/catalog.generated.json'), 'utf8'),
]);

const catalog = JSON.parse(catalogRaw);
assert.ok(catalog.length > 0, 'Admin catalog must not be empty');
assert.equal(new Set(catalog.map((item) => item.catalog_key)).size, catalog.length, 'catalog_key values must be unique');
assert.ok(catalog.every((item) => item.id === item.catalog_key), 'V0 catalog key must match the current stable Species id');

assert.match(appSource, /from\('user_roles'\)/, 'Admin must verify user_roles');
assert.match(appSource, /from\('species_seo'\)/, 'Admin must read/write species_seo');
assert.doesNotMatch(appSource, /from\('species'\)/, 'Admin V0 must not depend on the currently empty Supabase species table');
assert.match(appSource, /onConflict: 'catalog_key,locale'/, 'SEO upsert must use catalog_key + locale');

assert.doesNotMatch(supabaseSource, /import\.meta\.env\.(?:VITE_)?SUPABASE_SERVICE_ROLE_KEY/, 'service role key must never be read by the browser app');
assert.doesNotMatch(envExample, /^(?:VITE_)?SUPABASE_SERVICE_ROLE_KEY\s*=/m, 'service role key must never be configured in the browser app');

assert.match(migrationSource, /catalog_key text not null/);
assert.match(migrationSource, /locale text not null default 'zh-CN'/);
assert.match(migrationSource, /unique \(catalog_key, locale\)/);
assert.match(migrationSource, /enable row level security/);
assert.match(migrationSource, /public\.is_admin\(\)/);
assert.match(migrationSource, /species_seo_admin_insert/);
assert.match(migrationSource, /species_seo_admin_update/);
assert.match(migrationSource, /species_seo_admin_delete/);

console.log(`Admin Content contract verified: ${catalog.length} catalog entries, admin auth, RLS, no service-role exposure`);
