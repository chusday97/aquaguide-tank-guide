import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveEffectiveSeo } from '../src/seoInheritance.js';
import { extractTemplateTokens, validateProtectedTokens } from '../api/_translation-core.js';
import { buildSpeciesSeoRouteMeta, speciesPublicPath } from '../src/seoRouteContract.js';
import { assessDataReview, assessPublishReadiness, buildAdminWorkflowOverview, buildControlledPreviewSnapshot, categoryIssueKey, getIndexReviewBlockReason } from '../src/publishReadiness.js';
import { EDITOR_ELEMENT_REGISTRY } from '../src/editorElementRegistry.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const repoRoot = path.resolve(appRoot, '../..');

const [appSource, batchSource, baseSource, reviewSource, readinessSource, workflowOverviewSource, controlledPreviewSource, publicPreviewSource, liveFrontendPreviewSource, editorToolDrawerSource, stylesSource, appLanguageSource, productTruthLoaderSource, historySource, translationSource, translationApiSource, supabaseSource, migrationSource, groupMigrationSource, localeMigrationSource, routeMigrationSource, historyMigrationSource, releaseGateMigrationSource, publishReadinessMigrationSource, envExample, reviewEnvExample, catalogRaw, groupsRaw] = await Promise.all([
  readFile(path.join(appRoot, 'src/App.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/BatchSeoEditor.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/BaseSpeciesSeoEditor.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/DataReviewPanel.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/PublishReadinessPanel.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/WorkflowOverview.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'scripts/build-controlled-preview.mjs'), 'utf8'),
  readFile(path.join(appRoot, 'src/PublicSpeciesPreview.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/LiveFrontendPreview.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/EditorToolDrawer.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/styles.css'), 'utf8'),
  readFile(path.join(appRoot, 'src/AppLanguage.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/productTruthLoader.js'), 'utf8'),
  readFile(path.join(appRoot, 'src/RevisionHistoryPanel.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'src/TranslationPanel.jsx'), 'utf8'),
  readFile(path.join(appRoot, 'api/translate.js'), 'utf8'),
  readFile(path.join(appRoot, 'src/supabase.js'), 'utf8'),
  readFile(path.join(repoRoot, 'supabase/migrations/202608280001_species_seo_admin.sql'), 'utf8'),
  readFile(path.join(repoRoot, 'supabase/migrations/202608280002_species_seo_group_inheritance.sql'), 'utf8'),
  readFile(path.join(repoRoot, 'supabase/migrations/202608280003_species_seo_localized_name.sql'), 'utf8'),
  readFile(path.join(repoRoot, 'supabase/migrations/202608280004_species_seo_index_strategy.sql'), 'utf8'),
  readFile(path.join(repoRoot, 'supabase/migrations/202608280005_species_seo_revision_history.sql'), 'utf8'),
  readFile(path.join(repoRoot, 'supabase/migrations/202608280006_species_seo_release_gate_probe.sql'), 'utf8'),
  readFile(path.join(repoRoot, 'supabase/migrations/202608280007_species_seo_publish_readiness.sql'), 'utf8'),
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
assert.ok(catalog.some((item) => item.water_temperature && item.ph_level && item.tank_size), 'Admin catalog must expose preview Product Truth without making it editable');
assert.equal(groupData.stats.catalog_count, catalog.length, 'Group stats must match catalog size');
assert.equal(groupData.stats.base_group_count, groupData.groups.length, 'Group count stats must remain accurate');
assert.ok(groupData.stats.batch_candidate_groups > 0, 'Batch candidate groups must be tracked');
assert.ok(groupData.stats.explicit_variant_members > 0, 'Explicit variants must be tracked');
assert.ok(groupData.stats.category_conflict_groups > 0, 'Category conflicts must remain visible for review');
assert.ok(groupData.stats.exact_duplicate_records > 0, 'Duplicate candidates must remain visible for review');
assert.ok(groupData.groups.some((group) => group.duplicate_sets?.length), 'Duplicate review sets must include peer keys');
const emptyWorkflowOverview = buildAdminWorkflowOverview({ species: catalog, groups: groupData.groups, seoRows: {}, groupSeoRows: {}, reviewRows: {} });
assert.equal(emptyWorkflowOverview.dataReview.total, 33, 'Workflow overview must preserve 5 category + 28 duplicate review issues');
assert.equal(emptyWorkflowOverview.dataReview.pending, 33, 'Unreviewed source issues must begin Pending');
assert.equal(emptyWorkflowOverview.locales['zh-CN'].blocked, catalog.length, 'Missing Chinese editorial rows must block all Species');
assert.equal(emptyWorkflowOverview.locales.en.blocked, catalog.length, 'Missing English editorial rows must block all Species');

assert.match(appSource, /from\('user_roles'\)/, 'Admin must verify user_roles');
assert.match(appSource, /from\('species_seo'\)/, 'Admin must read species_seo');
assert.match(appSource, /from\('species_seo_groups'\)/, 'Admin must read Base Species SEO groups');
assert.doesNotMatch(appSource, /from\('species'\)/, 'Admin must not depend on the empty Supabase species table');
assert.match(appSource, /SpeciesGroupSidebar/, 'Admin must render grouped Species navigation');
assert.match(appSource, /BatchSeoEditor/, 'Admin must expose batch SEO editor');
assert.match(appSource, /BaseSpeciesSeoEditor/, 'Admin must expose Base Species inheritance editor');
assert.match(appSource, /DataReviewPanel/, 'Admin must expose source-data review workflow');
assert.match(appSource, /PublishReadinessPanel/, 'Admin must expose explicit publish readiness');
assert.match(appSource, /WorkflowOverview/, 'Admin must expose queue-level workflow overview');
assert.match(workflowOverviewSource, /Data Review/, 'Workflow overview must include Data Review counts');
assert.match(workflowOverviewSource, /Publish-ready/, 'Workflow overview must expose publish-ready counts');
assert.match(appSource, /workflowGroupKeys/, 'Workflow filters must constrain the Species sidebar');
assert.match(readinessSource, /导出 Preview Snapshot/, 'Publish-ready UI must expose controlled Preview Snapshot export');
assert.match(controlledPreviewSource, /noindex,nofollow/, 'Controlled Preview pages must force noindex,nofollow');
assert.match(controlledPreviewSource, /Disallow: \//, 'Controlled Preview root must disallow crawlers');
assert.match(controlledPreviewSource, /refuses deployable output directory/, 'Controlled Preview must reject deployable public/dist output');
assert.doesNotMatch(controlledPreviewSource, /sitemap-species\.xml/, 'Controlled Preview wrapper must not emit the release sitemap');
assert.match(readinessSource, /Publish-ready/, 'Readiness UI must distinguish Preview Publish readiness from Production publication');
assert.match(appSource, /TranslationPanel/, 'Admin must expose bilingual translation workflow');
assert.match(appSource, /LiveFrontendPreview/, 'Admin must expose a persistent live frontend Species preview');
assert.match(appSource, /EditorToolDrawer/, 'Secondary editor tools must use the dedicated drawer surface');
assert.doesNotMatch(appSource, /<details className="studio-tool-disclosure/, 'Secondary tools must not regress to large inline disclosures');
assert.match(editorToolDrawerSource, /Escape/, 'Tool drawer must support keyboard dismissal');
assert.match(editorToolDrawerSource, /editor-tool-drawer-backdrop/, 'Tool drawer must support explicit backdrop dismissal');
assert.match(editorToolDrawerSource, /aria-modal="false"/, 'Tool drawer must keep the live Preview interactive rather than acting as a blocking modal');
assert.match(stylesSource, /editor-tool-drawer-layer[\s\S]*grid-column:\s*2;\s*grid-row:\s*1/, 'Tool drawer must overlay only the editor grid cell');
assert.match(stylesSource, /studio-workspace > \.live-preview-pane \{ grid-column:\s*3;/, 'Live Preview must remain in its own grid column while tools are open');
assert.doesNotMatch(appSource, /<option value="archived">/, 'Species Variant lifecycle UI must expose Draft/Published only');
assert.doesNotMatch(baseSource, /<option value="archived">/, 'Base Species lifecycle UI must expose Draft/Published only');
assert.match(appSource, /app-language-switch/, 'Admin must expose one global interface-language switch');
assert.match(appSource, /contentLocale/, 'Content locale must remain a separate editorial state');
assert.match(appSource, /appLocale/, 'Interface locale must remain separate from content locale');
assert.match(appLanguageSource, /aquaguide-admin-app-locale/, 'Interface locale must persist across refreshes');
assert.match(appLanguageSource, /document\.documentElement\.lang/, 'Global interface locale must update document language');
assert.match(productTruthLoaderSource, /import\('\.\/catalog\.generated\.json'\)/, 'Product Truth preview data must remain lazy-loaded');
assert.ok(groupedMembers.every((item) => !('image' in item) && !('water_temperature' in item) && !('ph_level' in item)), 'Species group projection must not duplicate Product Truth preview fields');
assert.match(appSource, /onLivePreviewChange/, 'Variant edits must stream unsaved changes into the live frontend preview');
assert.deepEqual(
  ['localizedName', 'h1', 'intro', 'imageAlt', 'seoTitle', 'metaDescription'].filter((key) => !EDITOR_ELEMENT_REGISTRY[key]),
  [],
  'Preview inspector must preserve the six core editable element mappings',
);
assert.equal(EDITOR_ELEMENT_REGISTRY.temperature.readOnly, true, 'Product Truth temperature must stay inspectable but read-only');
assert.match(appSource, /selectedInspectorElement/, 'Admin must keep one shared inspector selection across editor and preview');
assert.match(appSource, /data-editor-field/, 'Variant editor fields must expose stable inspector targets');
assert.match(appSource, /renderInheritedOverrideField/, 'Variant editor must use explicit inherited/custom field presentation');
assert.match(appSource, /Use Base value|使用 Base 值/, 'Variant overrides must expose a return-to-Base action');
assert.match(appSource, /data-editor-override/, 'Override inputs must remain separately addressable after inherited-state disclosure');
assert.match(baseSource, /data-base-editor-field/, 'Base editor fields must expose stable inspector targets');
assert.match(liveFrontendPreviewSource, /data-preview-element/, 'Live preview elements must expose stable inspector targets');
assert.match(liveFrontendPreviewSource, /scrollIntoView/, 'Preview selection must scroll mapped elements into view');
assert.match(liveFrontendPreviewSource, /Product Truth · 只读/, 'Preview inspector must explain Product Truth read-only elements');
assert.match(liveFrontendPreviewSource, /elementEditPath/, 'Preview inspector must explain where the selected element is edited');
assert.match(liveFrontendPreviewSource, /editorScope/, 'Inspector edit paths must distinguish Base and current-page editing context');
assert.match(liveFrontendPreviewSource, /\['page', 'google', 'mobile'\]/, 'Live preview must preserve Page, Google and Mobile modes');
assert.match(liveFrontendPreviewSource, /preview\.previewOnly/, 'Live preview must render the localized noindex safety label');
assert.match(appLanguageSource, /Noindex/, 'Global UI language dictionary must preserve the Preview noindex safety label');
assert.match(publicPreviewSource, /hreflang=zh-CN/, 'Public preview must expose hreflang pair evidence');
assert.match(appSource, /RevisionHistoryPanel/, 'Admin must expose Base and Variant revision history');
assert.match(historySource, /from\('content_revisions'\)/, 'History UI must read database-backed revisions');
assert.match(historySource, /restore_species_seo_revision/, 'History UI must use the guarded rollback RPC');
assert.match(historySource, /armedId/, 'Rollback must require an explicit second click rather than one-click destructive restore');
assert.match(appSource, /index_strategy: form\.indexStrategy/, 'Variant SEO must persist explicit index strategy');
assert.match(appSource, /Species 发布仍锁定/, 'Species publish must remain locked until rollback and staging gates are verified');
assert.match(appSource, /isPublicSpeciesPublishingEnabled = false/, 'Variant publish gate must remain fail-closed after generator verification');
assert.match(baseSource, /Species 发布仍锁定/, 'Base Species publish must remain locked until rollback and staging gates are verified');
assert.match(baseSource, /isPublicSpeciesPublishingEnabled = false/, 'Base publish gate must remain fail-closed after generator verification');
assert.match(appSource, /CONTENT_LOCALES/, 'Admin must expose an explicit content-locale switcher');
assert.match(appSource, /seoRowKey\(row\.catalog_key, row\.locale\)/, 'Localized Variant rows must not collide in client state');
assert.match(appSource, /groupSeoRowKey\(row\.group_key, row\.locale\)/, 'Localized Base rows must not collide in client state');
assert.match(appSource, /VITE_ADMIN_REVIEW_MODE/, 'Review mode must be explicit and build-time controlled');
assert.match(appSource, /if \(readOnly\)/, 'Single save path must fail closed in review mode');
assert.match(appSource, /disabled=\{saving \|\| readOnly/, 'Single save button must be disabled in review mode');

assert.match(batchSource, /assessDataReview/, 'Bulk writes must consume persisted data-review decisions');
assert.match(batchSource, /publishedSelected\.length/, 'Published rows must block unsafe batch overwrite');
assert.match(batchSource, /status: 'draft'/, 'Batch SEO must write drafts only');
assert.match(batchSource, /resolveEffectiveSeo/, 'Batch preview must resolve Base inheritance rather than copy flat content');
assert.doesNotMatch(batchSource, /seo_title:\s*applySeoTemplate/, 'Batch write must not duplicate Base title into every Variant');
assert.match(batchSource, /onConflict: 'catalog_key,locale'/, 'Batch upsert must use stable catalog key + locale');
assert.match(baseSource, /from\('species_seo_groups'\)/, 'Base editor must persist group SEO separately');
assert.match(baseSource, /Publish Readiness/, 'Base editor must defer publication blocking to explicit readiness instead of preventing Draft editing');
assert.match(reviewSource, /duplicate_sets/, 'Review panel must expose duplicate evidence sets');
assert.match(reviewSource, /category_conflict/, 'Review panel must expose category conflicts');
assert.match(reviewSource, /species_data_reviews/, 'Review decisions must persist separately from Product Truth');
assert.match(reviewSource, /duplicate_records/, 'Duplicate review must support an explicit canonical decision');
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
assert.match(routeMigrationSource, /index_strategy text not null default 'noindex'/);
assert.match(routeMigrationSource, /canonical_catalog_key text not null default ''/);
assert.match(routeMigrationSource, /canonical_to_sibling/);
assert.match(historyMigrationSource, /create table if not exists public\.content_revisions/);
assert.match(historyMigrationSource, /enable row level security/);
assert.match(historyMigrationSource, /content_revisions_admin_select/);
assert.match(historyMigrationSource, /restore_species_seo_revision/);
assert.match(historyMigrationSource, /security definer/);
assert.match(historyMigrationSource, /status = 'draft'/, 'Rollback must never republish content automatically');
assert.match(historyMigrationSource, /revision_operation', 'rollback'/, 'Rollback events must be identifiable in history');
assert.match(releaseGateMigrationSource, /species_seo_release_gate_status/);
assert.match(releaseGateMigrationSource, /schema_version', 6/);
assert.match(releaseGateMigrationSource, /revision_history_ready/);
assert.match(releaseGateMigrationSource, /restore_rpc_ready/);
assert.match(releaseGateMigrationSource, /grant execute on function public\.species_seo_release_gate_status\(\) to anon, authenticated/);
assert.match(publishReadinessMigrationSource, /schema_version', 7/);
assert.match(publishReadinessMigrationSource, /create table if not exists public\.species_data_reviews/);
assert.match(publishReadinessMigrationSource, /review_state text not null default 'editing'/);
assert.match(publishReadinessMigrationSource, /ready_for_review/);
assert.match(publishReadinessMigrationSource, /species_seo_public_review_resolutions/);
assert.match(publishReadinessMigrationSource, /new\.review_state := 'editing'/, 'Content changes and rollback must invalidate approval');
assert.match(publishReadinessMigrationSource, /species_data_reviews_admin_update/);

const neoGroup = groupData.groups.find((group) => group.base_scientific_name === 'Neocaridina davidi');
assert.ok(neoGroup?.member_count > 2, 'Neocaridina group must remain a real inheritance fixture');
const yellowShrimp = neoGroup.members.find((member) => member.name === '黄金米虾');
assert.ok(yellowShrimp, 'Inheritance fixture must include 黄金米虾');
const routeEnglish = speciesPublicPath(yellowShrimp, neoGroup, 'en');
const routeChinese = speciesPublicPath(yellowShrimp, neoGroup, 'zh-CN');
assert.equal(routeEnglish, `/species/neocaridina-davidi/${yellowShrimp.catalog_key.replaceAll('_', '-')}.html`, 'English Species route must be deterministic and stable');
assert.equal(routeChinese, `/zh${routeEnglish}`, 'Chinese Species route must reuse the existing /zh locale pattern');
const noindexMeta = buildSpeciesSeoRouteMeta({ member: yellowShrimp, group: neoGroup, locale: 'en' });
assert.equal(noindexMeta.robots, 'noindex,follow', 'Species SEO records must fail closed to noindex by default');
const sibling = neoGroup.members.find((member) => member.catalog_key !== yellowShrimp.catalog_key);
const canonicalMeta = buildSpeciesSeoRouteMeta({ member: yellowShrimp, group: neoGroup, locale: 'zh-CN', indexStrategy: 'canonical_to_sibling', canonicalCatalogKey: sibling.catalog_key });
assert.equal(canonicalMeta.canonicalPath, speciesPublicPath(sibling, neoGroup, 'zh-CN'), 'Canonical target must stay inside the same Base Species group');
assert.equal(canonicalMeta.alternates['x-default'], speciesPublicPath(sibling, neoGroup, 'en'), 'x-default must follow the existing English-default SEO pattern');

const duplicateSet = neoGroup.duplicate_sets?.find((set) => set.member_ids.includes('sp_0001')) || neoGroup.duplicate_sets?.[0];
if (duplicateSet) {
  const pendingReview = assessDataReview(neoGroup, {});
  assert.equal(pendingReview.ready, false, 'Unresolved duplicate/category evidence must keep data review blocked');
  const duplicateMember = neoGroup.members.find((member) => duplicateSet.member_ids.includes(member.catalog_key));
  assert.match(getIndexReviewBlockReason({ species: duplicateMember, group: neoGroup, indexStrategy: 'index', canonicalCatalogKey: '', reviewRows: {} }), /疑似重复/, 'Unresolved duplicate must block independent Index');
  const reviewRows = {};
  if (neoGroup.category_conflict) reviewRows[categoryIssueKey(neoGroup)] = { decision: 'accepted_as_is' };
  for (const set of neoGroup.duplicate_sets || []) reviewRows[set.duplicate_set_key] = { decision: 'distinct_records' };
  assert.equal(assessDataReview(neoGroup, reviewRows).ready, true, 'Explicit human decisions must resolve data-review blockers');
  assert.equal(getIndexReviewBlockReason({ species: duplicateMember, group: neoGroup, indexStrategy: 'index', canonicalCatalogKey: '', reviewRows }), '', 'Distinct-record decision must unblock independent Index');
  const canonicalReviewRows = { ...reviewRows, [duplicateSet.duplicate_set_key]: { decision: 'duplicate_records', canonical_catalog_key: duplicateSet.member_ids[0] } };
  const nonCanonical = neoGroup.members.find((member) => duplicateSet.member_ids.includes(member.catalog_key) && member.catalog_key !== duplicateSet.member_ids[0]);
  if (nonCanonical) assert.match(getIndexReviewBlockReason({ species: nonCanonical, group: neoGroup, indexStrategy: 'index', canonicalCatalogKey: '', reviewRows: canonicalReviewRows }), /不能独立 Index/, 'Confirmed duplicate non-canonical must stay blocked from independent Index');
}

const cleanGroup = groupData.groups.find((group) => !group.category_conflict && !group.duplicate_count);
const cleanMember = cleanGroup.members[0];
const readinessFixture = assessPublishReadiness({
  species: cleanMember, group: cleanGroup, locale: 'en',
  groupRow: { locale: 'en', review_state: 'approved', seo_title_template: '{{name}} Care Guide', meta_description_template: '{{name}} care guide.', h1_template: '{{name}} Care Guide', shared_intro: 'Shared care intro.' },
  variantRow: { locale: 'en', localized_name: 'Reviewed Species', image_alt: 'Reviewed Species', review_state: 'approved', index_strategy: 'noindex' },
  counterpartGroupRow: { review_state: 'approved' }, counterpartVariantRow: { review_state: 'approved' }, reviewRows: {},
});
assert.equal(readinessFixture.state, 'publish_ready', 'Complete approved noindex content should be Preview Publish-ready');
const oneReadyOverview = buildAdminWorkflowOverview({
  species: [cleanMember], groups: [cleanGroup],
  seoRows: { [`${cleanMember.catalog_key}::en`]: { catalog_key: cleanMember.catalog_key, locale: 'en', localized_name: 'Reviewed Species', image_alt: 'Reviewed Species', review_state: 'approved', index_strategy: 'noindex' } },
  groupSeoRows: { [`${cleanGroup.group_key}::en`]: { group_key: cleanGroup.group_key, locale: 'en', review_state: 'approved', seo_title_template: '{{name}} Care Guide', meta_description_template: '{{name}} care guide.', h1_template: '{{name}} Care Guide', shared_intro: 'Shared care intro.' } },
  reviewRows: {},
});
assert.equal(oneReadyOverview.locales.en.publish_ready, 1, 'Workflow overview must count a complete Approved Species as Publish-ready');
assert.deepEqual(oneReadyOverview.locales.en.memberIdsByState.publish_ready, [cleanMember.id]);
const previewSnapshot = buildControlledPreviewSnapshot({
  species: cleanMember, group: cleanGroup,
  variantRows: [{ catalog_key: cleanMember.catalog_key, locale: 'zh-CN', status: 'draft', review_state: 'approved', reviewed_by: 'should-not-export' }],
  groupRows: [{ group_key: cleanGroup.group_key, locale: 'zh-CN', status: 'draft', review_state: 'approved', reviewed_by: 'should-not-export' }],
  reviewRows: { [categoryIssueKey(cleanGroup)]: { issue_key: categoryIssueKey(cleanGroup), issue_type: 'category_conflict', group_key: cleanGroup.group_key, decision: 'accepted_as_is', notes: 'private', reviewed_by: 'private-user' } },
});
assert.equal(previewSnapshot.environment, 'preview');
assert.equal(previewSnapshot.delivery_mode, 'controlled_preview');
assert.deepEqual(previewSnapshot.selected_catalog_keys, [cleanMember.catalog_key]);
assert.ok(!('reviewed_by' in previewSnapshot.species_seo[0]), 'Preview snapshot must strip reviewer identity');
assert.ok(!('notes' in (previewSnapshot.data_review_resolutions[0] || {})), 'Preview snapshot must strip Data Review notes');

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
