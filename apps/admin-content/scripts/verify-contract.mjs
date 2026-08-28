import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const repoRoot = path.resolve(appRoot, '../..');

const [appSource, batchSource, supabaseSource, migrationSource, envExample, reviewEnvExample, catalogRaw, groupsRaw] = await Promise.all([
  readFile(path.join(appRoot, 'src/App.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/BatchSeoEditor.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/supabase.js'), 'utf8'),
  readFile(path.join(repoRoot, 'supabase/migrations/202608280001_species_seo_admin.sql'), 'utf8'),
  readFile(path.join(appRoot, '.env.example'), 'utf8'),
  readFile(path.join(appRoot, '.env.review.example'), 'utf8'),
  readFile(path.join(appRoot, 'src/catalog.generated.json'), 'utf8'),
  readFile(path.join(appRoot, 'src/species-groups.generated.json'), 'utf8'),
]);

const catalog = JSON.parse(catalogRaw);
const groupData = JSON.parse(groupsRaw);
const groupedMembers = groupData.groups.flatMap((group) => group.members);
assert.ok(catalog.length > 0, 'Admin catalog must not be empty');
assert.equal(new Set(catalog.map((item) => item.catalog_key)).size, catalog.length, 'catalog_key values must be unique');
assert.equal(groupedMembers.length, catalog.length, 'Every catalog record must belong to exactly one base group');
assert.equal(new Set(groupedMembers.map((item) => item.catalog_key)).size, catalog.length, 'Grouped members must remain unique');
assert.ok(groupData.groups.some((group) => group.member_count > 1), 'Group model must expose batch candidates');
assert.ok(catalog.every((item) => item.id === item.catalog_key), 'Catalog key must remain the stable Species id');
assert.equal(groupData.stats.catalog_count, catalog.length, 'Group stats must match catalog size');
assert.equal(groupData.stats.base_group_count, groupData.groups.length, 'Group count stats must remain accurate');
assert.ok(groupData.stats.batch_candidate_groups > 0, 'Batch candidate groups must be tracked');
assert.ok(groupData.stats.explicit_variant_members > 0, 'Explicit variants must be tracked');

assert.match(appSource, /from\('user_roles'\)/, 'Admin must verify user_roles');
assert.match(appSource, /from\('species_seo'\)/, 'Admin must read species_seo');
assert.doesNotMatch(appSource, /from\('species'\)/, 'Admin must not depend on the empty Supabase species table');
assert.match(appSource, /SpeciesGroupSidebar/, 'Admin must render grouped Species navigation');
assert.match(appSource, /BatchSeoEditor/, 'Admin must expose batch SEO editor');
assert.match(appSource, /VITE_ADMIN_REVIEW_MODE/, 'Review mode must be explicit and build-time controlled');
assert.match(appSource, /if \(readOnly\)/, 'Single save path must fail closed in review mode');
assert.match(appSource, /disabled=\{saving \|\| readOnly\}/, 'Single save button must be disabled in review mode');

assert.match(batchSource, /group\.category_conflict/, 'Category-conflict groups must block bulk writes');
assert.match(batchSource, /publishedSelected\.length/, 'Published rows must block unsafe batch overwrite');
assert.match(batchSource, /status: 'draft'/, 'Batch SEO must write drafts only');
assert.match(batchSource, /onConflict: 'catalog_key,locale'/, 'Batch upsert must use stable catalog key + locale');
assert.match(reviewEnvExample, /^VITE_ADMIN_REVIEW_MODE=true$/m, 'Review environment must opt into read-only mode');
assert.doesNotMatch(supabaseSource, /import\.meta\.env\.(?:VITE_)?SUPABASE_SERVICE_ROLE_KEY/, 'Service role must never be read by browser app');
assert.doesNotMatch(envExample, /^(?:VITE_)?SUPABASE_SERVICE_ROLE_KEY\s*=/m, 'Service role must never be configured in browser app');

assert.match(migrationSource, /catalog_key text not null/);
assert.match(migrationSource, /locale text not null default 'zh-CN'/);
assert.match(migrationSource, /unique \(catalog_key, locale\)/);
assert.match(migrationSource, /enable row level security/);
assert.match(migrationSource, /grant select on public\.user_roles to authenticated/);
assert.match(migrationSource, /public\.is_admin\(\)/);
assert.match(migrationSource, /species_seo_admin_insert/);
assert.match(migrationSource, /species_seo_admin_update/);
assert.match(migrationSource, /species_seo_admin_delete/);

console.log(
  `Admin Content contract verified: ${catalog.length} catalog entries, ` +
  `${groupData.groups.length} base groups, ${groupData.stats.batch_candidate_groups} batch groups, auth/RLS protected`,
);
