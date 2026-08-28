import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveEffectiveSeo } from '../src/seoInheritance.js';
import { extractTemplateTokens, validateProtectedTokens } from '../api/_translation-core.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const repoRoot = path.resolve(appRoot, '../..');

const [appSource, batchSource, baseSource, reviewSource, translationSource, translationApiSource, supabaseSource, migrationSource, groupMigrationSource, localeMigrationSource, envExample, reviewEnvExample, catalogRaw, groupsRaw] = await Promise.all([
  readFile(path.join(appRoot, 'src/App.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/BatchSeoEditor.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/BaseSpeciesSeoEditor.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/DataReviewPanel.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/TranslationPanel.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'api/translate.js'), 'utf8'),
  readFile(path.join(appRoot, 'src/supabase.js'), 'utf8'),
  readFile(path.join(repoRoot, 'supabase/migrations/202608280001_species_seo_admin.sql'), 'utf8'),
  readFile(path.join(repoRoot, 'supabase/migrations/202608280002_species_seo_group_inheritance.sql'), 'utf8'),
  readFile(path.join(repoRoot, 'supabase/migrations/202608280003_species_seo_localized_name.sql'), 'utf8'),
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
assert.ok(groupData.stats.category_conflict_groups > 0, 'Category conflicts must remain visible for review');
assert.ok(groupData.stats.exact_duplicate_records > 0, 'Duplicate candidates must remain visible for review');
assert.ok(groupData.groups.some((group) => group.duplicate_sets?.length), 'Duplicate review sets must include peer keys');

assert.match(appSource, /from\('user_roles'\)/, 'Admin must verify user_roles');
assert.match(appSource, /from\('species_seo'\)/, 'Admin must read species_seo');
assert.match(appSource, /from\('species_seo_groups'\)/, 'Admin must read Base Species SEO groups');
assert.doesNotMatch(appSource, /from\('species'\)/, 'Admin must not depend on the empty Supabase species table');
assert.match(appSource, /SpeciesGroupSidebar/, 'Admin must render grouped Species navigation');
assert.match(appSource, /BatchSeoEditor/, 'Admin must expose batch SEO editor');
assert.match(appSource, /BaseSpeciesSeoEditor/, 'Admin must expose Base Species inheritance editor');
assert.match(appSource, /DataReviewPanel/, 'Admin must expose source-data review evidence');
assert.match(appSource, /TranslationPanel/, 'Admin must expose bilingual translation workflow');
assert.match(appSource, /English 发布暂时锁定/, 'English publish must remain locked until URL/hreflang contract exists');
assert.match(baseSource, /English 发布暂时锁定/, 'Base English publish must remain locked until URL/hreflang contract exists');
assert.match(appSource, /CONTENT_LOCALES/, 'Admin must expose an explicit content-locale switcher');
assert.match(appSource, /seoRowKey\(row\.catalog_key, row\.locale\)/, 'Localized Variant rows must not collide in client state');
assert.match(appSource, /groupSeoRowKey\(row\.group_key, row\.locale\)/, 'Localized Base rows must not collide in client state');
assert.match(appSource, /VITE_ADMIN_REVIEW_MODE/, 'Review mode must be explicit and build-time controlled');
assert.match(appSource, /if \(readOnly\)/, 'Single save path must fail closed in review mode');
assert.match(appSource, /disabled=\{saving \|\| readOnly\}/, 'Single save button must be disabled in review mode');

assert.match(batchSource, /group\.category_conflict/, 'Category-conflict groups must block bulk writes');
assert.match(batchSource, /publishedSelected\.length/, 'Published rows must block unsafe batch overwrite');
assert.match(batchSource, /status: 'draft'/, 'Batch SEO must write drafts only');
assert.match(batchSource, /resolveEffectiveSeo/, 'Batch preview must resolve Base inheritance rather than copy flat content');
assert.doesNotMatch(batchSource, /seo_title:\s*applySeoTemplate/, 'Batch write must not duplicate Base title into every Variant');
assert.match(batchSource, /onConflict: 'catalog_key,locale'/, 'Batch upsert must use stable catalog key + locale');
assert.match(baseSource, /from\('species_seo_groups'\)/, 'Base editor must persist group SEO separately');
assert.match(baseSource, /group\.category_conflict/, 'Base publish must respect source category conflicts');
assert.match(reviewSource, /duplicate_sets/, 'Review panel must expose duplicate evidence sets');
assert.match(reviewSource, /category_conflict/, 'Review panel must expose category conflicts');
assert.match(translationSource, /zh-CN/, 'Translation panel must have an explicit Chinese source locale');
assert.match(translationSource, /locale: 'en'/, 'Translation panel must save an independent English locale');
assert.match(translationSource, /status: 'draft'/, 'AI translation must save as Draft only');
assert.match(translationSource, /targetPublished/, 'Published English rows must not be silently overwritten');
assert.match(translationApiSource, /requireAdmin/, 'Translation API must re-check admin authorization server-side');
assert.match(translationApiSource, /process\.env\.AI_API_KEY|process\.env\.DEEPSEEK_API_KEY/, 'Translation provider key must remain server-side');
assert.doesNotMatch(translationSource, /DEEPSEEK_API_KEY|AI_API_KEY/, 'Browser translation UI must not read provider secrets');
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

assert.match(groupMigrationSource, /create table if not exists public\.species_seo_groups/);
assert.match(groupMigrationSource, /group_key text not null/);
assert.match(groupMigrationSource, /unique \(group_key, locale\)/);
assert.match(groupMigrationSource, /enable row level security/);
assert.match(groupMigrationSource, /species_seo_groups_admin_insert/);
assert.match(groupMigrationSource, /species_seo_groups_admin_update/);
assert.match(groupMigrationSource, /public\.is_admin\(\)/);

assert.match(localeMigrationSource, /add column if not exists localized_name text not null default ''/);

const neoGroup = groupData.groups.find((group) => group.base_scientific_name === 'Neocaridina davidi');
assert.ok(neoGroup?.member_count > 2, 'Neocaridina group must remain a real inheritance fixture');
const yellowShrimp = neoGroup.members.find((member) => member.name === '黄金米虾');
assert.ok(yellowShrimp, 'Inheritance fixture must include 黄金米虾');
const inheritedSeo = resolveEffectiveSeo({ member: yellowShrimp, group: neoGroup, groupRow: null, variantRow: null });
assert.match(inheritedSeo.effective.seoTitle, /黄金米虾/, 'Base template must resolve the Variant display name');
assert.equal(inheritedSeo.override.seoTitle, false, 'Missing Variant value must inherit Base title');
const overriddenSeo = resolveEffectiveSeo({ member: yellowShrimp, group: neoGroup, groupRow: null, variantRow: { seo_title: '黄金米虾专属标题' } });
assert.equal(overriddenSeo.effective.seoTitle, '黄金米虾专属标题', 'Variant Override must win over Base inheritance');
assert.equal(overriddenSeo.override.seoTitle, true, 'Override state must be explicit');

const englishSeo = resolveEffectiveSeo({
  member: yellowShrimp,
  group: neoGroup,
  groupRow: { locale: 'en', seo_title_template: '{{name}} Care Guide', meta_description_template: '{{name}} care.', h1_template: '{{name}} Care Guide' },
  variantRow: { locale: 'en', localized_name: 'Yellow Cherry Shrimp' },
  locale: 'en',
});
assert.equal(englishSeo.effective.seoTitle, 'Yellow Cherry Shrimp Care Guide', 'English localized_name must drive English template rendering');
assert.equal(englishSeo.effective.displayName, 'Yellow Cherry Shrimp', 'Localized editorial name must not mutate Product Truth');
assert.deepEqual(extractTemplateTokens('{{name}} + {{base_species}} + {{name}}'), ['{{base_species}}', '{{name}}']);
assert.deepEqual(validateProtectedTokens('base', { seoTitleTemplate: '{{name}} Guide', metaDescriptionTemplate: '{{name}} {{base_species}}', h1Template: '{{name}}' }, { seoTitleTemplate: '{{name}} Care Guide', metaDescriptionTemplate: '{{name}} ({{base_species}})', h1Template: '{{name}} Care' }), []);
assert.equal(validateProtectedTokens('base', { seoTitleTemplate: '{{name}} Guide' }, { seoTitleTemplate: 'Name Guide' }).length, 1, 'Translation must fail closed when template tokens are lost');

console.log(
  `Admin Content contract verified: ${catalog.length} catalog entries, ` +
  `${groupData.groups.length} base groups, ${groupData.stats.batch_candidate_groups} batch groups, auth/RLS protected`,
);
