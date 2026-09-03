import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveEffectiveSeo } from '../src/seoInheritance.js';
import { extractTemplateTokens, validateProtectedTokens } from '../api/_translation-core.js';
import { buildSpeciesSeoRouteMeta, speciesPublicPath } from '../src/seoRouteContract.js';
import { assessDataReview, assessPublishReadiness, buildAdminWorkflowOverview, buildControlledPreviewSnapshot, categoryIssueKey, getIndexReviewBlockReason, getResolvedDuplicateSeoPolicy, summarizeDataReviewIssues } from '../src/publishReadiness.js';
import { EDITOR_ELEMENT_REGISTRY } from '../src/editorElementRegistry.js';
import { inspectEditorialContent } from '../src/contentHygiene.js';
import { inspectSourceIdentity } from '../src/sourceIdentity.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const repoRoot = path.resolve(appRoot, '../..');

const [appSource, batchSource, baseSource, reviewSource, readinessSource, workflowOverviewSource, controlledPreviewSource, publicPreviewSource, liveFrontendPreviewSource, editorToolDrawerSource, stylesSource, appLanguageSource, productTruthLoaderSource, historySource, translationSource, translationApiSource, adminBackendSource, envExample, reviewEnvExample, catalogRaw, groupsRaw] = await Promise.all([
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
  readFile(path.join(appRoot, 'src/adminBackend.js'), 'utf8'),
  readFile(path.join(appRoot, '.env.example'), 'utf8'),
  readFile(path.join(appRoot, '.env.review.example'), 'utf8'),
  readFile(path.join(appRoot, 'src/catalog.generated.json'), 'utf8'),
  readFile(path.join(appRoot, 'src/species-groups.generated.json'), 'utf8'),
]);


const [repoBackendClientSource, repoAuthSource, repoStoreSource, repoGithubSource, repoSessionApiSource, repoQueryApiSource, repoPublishApiSource, repoHealthApiSource] = await Promise.all([
  readFile(path.join(appRoot, 'src/repoBackendClient.js'), 'utf8'),
  readFile(path.join(repoRoot, 'server/admin-repo/auth.mjs'), 'utf8'),
  readFile(path.join(repoRoot, 'server/admin-repo/store.mjs'), 'utf8'),
  readFile(path.join(repoRoot, 'server/admin-repo/github.mjs'), 'utf8'),
  readFile(path.join(repoRoot, 'api/admin-content/session.js'), 'utf8'),
  readFile(path.join(repoRoot, 'api/admin-content/query.js'), 'utf8'),
  readFile(path.join(repoRoot, 'api/admin-content/publish-staging.js'), 'utf8'),
  readFile(path.join(repoRoot, 'api/admin-content/health.js'), 'utf8'),
]);

const publicGeneratorSource = await readFile(path.join(appRoot, 'scripts/generate-public-species.mjs'), 'utf8');
const sidebarSource = await readFile(path.join(appRoot, 'src/SpeciesGroupSidebar.jsx'), 'utf8');
const bulkImportSource = await readFile(path.join(appRoot, 'src/BulkImportPanel.jsx'), 'utf8');
const bulkDuplicateSource = await readFile(path.join(appRoot, 'src/BulkDuplicateReviewPanel.jsx'), 'utf8');
const duplicateComparisonSource = await readFile(path.join(appRoot, 'src/DuplicateCandidateComparison.jsx'), 'utf8');
const duplicateEvidenceSource = await readFile(path.join(appRoot, 'src/duplicateReviewEvidence.js'), 'utf8');
const bulkEditorialSource = await readFile(path.join(appRoot, 'src/BulkEditorialReviewPanel.jsx'), 'utf8');
const speciesPagePresentationSource = await readFile(path.join(appRoot, 'src/speciesPagePresentation.js'), 'utf8');
const activityCenterSource = await readFile(path.join(appRoot, 'src/ActivityCenter.jsx'), 'utf8');
const adminNoticeSource = await readFile(path.join(appRoot, 'src/AdminNoticeViewport.jsx'), 'utf8');
const mainSource = await readFile(path.join(appRoot, 'src/main.jsx'), 'utf8');

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
const initialSeoPageCandidates = catalog.length - groupData.stats.exact_duplicate_records;
assert.equal(emptyWorkflowOverview.locales['zh-CN'].blocked, initialSeoPageCandidates, 'Missing Chinese editorial rows must block every current SEO page candidate, excluding folded duplicate source rows');
assert.equal(emptyWorkflowOverview.locales.en.blocked, initialSeoPageCandidates, 'Missing English editorial rows must block every current SEO page candidate, excluding folded duplicate source rows');
for (const locale of ['zh-CN', 'en']) {
  const blockedActionTotal = Object.values(emptyWorkflowOverview.locales[locale].blockedNextActions).reduce((sum, item) => sum + item.count, 0);
  assert.equal(blockedActionTotal, emptyWorkflowOverview.locales[locale].blocked, 'Blocked next-action queues must be mutually exclusive and sum exactly to the blocked total');
  assert.ok(emptyWorkflowOverview.locales[locale].blockedNextActions.data_review.count > 0, 'Unresolved source evidence must become a concrete Data Review next action');
  assert.ok(emptyWorkflowOverview.locales[locale].blockedNextActions.content.count > 0, 'Missing editorial rows must become a concrete content-completion next action');
}
assert.equal(emptyWorkflowOverview.contentHygiene.total, 0, 'Empty editorial state must not invent content-hygiene tasks');
assert.equal(emptyWorkflowOverview.contentHygiene.byLocale['zh-CN'].count, 0);
assert.equal(emptyWorkflowOverview.contentHygiene.byLocale.en.count, 0);

assert.match(appSource, /from\('user_roles'\)/, 'Admin must verify user_roles');
assert.match(appSource, /from\('species_seo'\)/, 'Admin must read species_seo');
assert.match(appSource, /from\('species_seo_groups'\)/, 'Admin must read Base Species SEO groups');
assert.doesNotMatch(appSource, /from\('species'\)/, 'Admin must not depend on the empty Supabase species table');
assert.match(appSource, /SpeciesGroupSidebar/, 'Admin must render grouped Species navigation');
assert.match(sidebarSource, /containsActiveVariant/, 'Variant selection must preserve visible parent Base hierarchy context');
assert.match(sidebarSource, /tone-issue/, 'Species workflow filters must visually distinguish Data Review issues');
assert.match(sidebarSource, /tone-review/, 'Species workflow filters must visually distinguish editorial review');
assert.match(sidebarSource, /tone-ready/, 'Species workflow filters must visually distinguish Preview-ready state');
assert.match(sidebarSource, /Base groups[\s\S]*speciesGroupStats\.base_group_count|基础种[\s\S]*speciesGroupStats\.base_group_count/, 'Species navigation must label the Base-group count explicitly');
assert.match(sidebarSource, /seoPageCandidateCount[\s\S]*current SEO page candidates/, 'Sidebar header must expose current SEO page candidates separately from source-record count');
assert.match(sidebarSource, /duplicate_of_catalog_key/, 'Sidebar must collapse source-marked duplicate records instead of presenting them as equal SEO pages');
assert.match(sidebarSource, /summarizeDataReviewIssues/, 'Sidebar issue badges must reflect unresolved review state rather than permanent source evidence.');
assert.match(sidebarSource, /duplicateIssueOpen/, 'Resolved duplicate evidence must stop rendering an actionable duplicate badge.');
assert.match(sidebarSource, /className="variant-review-action"/, 'Duplicate review must render as an explicit action button.');
assert.doesNotMatch(sidebarSource, /<em[^>]*variant-issue-mark[^>]*actionable/, 'Clickable duplicate review must never be rendered as a status-tag element.');
assert.match(stylesSource, /variant-row > \.variant-review-action[\s\S]*border:\s*1px solid/, 'Duplicate review action must keep a visible button border even inside Variant rows.');
assert.match(stylesSource, /count-badge[\s\S]*border-radius:\s*999px/, 'Static count badges must remain visually tag-like rather than action-like.');
assert.match(sidebarSource, /重复记录已合并/, 'Resolved duplicate groups must use completion copy instead of staying visually suspicious.');
assert.match(sidebarSource, /filtered\.length[\s\S]*Base groups/, 'Active workflow filter banner must expose affected Base-group count');
assert.match(sidebarSource, /Base Species groups/, 'Species navigation All count must expose its Base-group unit in hover help');
assert.match(sidebarSource, /pending Data Review issues/, 'Data Review issue count must expose issue units in hover help');
assert.match(sidebarSource, /Data Review · Pending/, 'English workflow filter labels must not regress to mixed-language text');
assert.match(sidebarSource, /workflowFilterLabel/, 'Workflow filter banner labels must be derived at render time rather than cached at click time');
assert.match(sidebarSource, /\[workflowFilter, appLocale\]/, 'Active workflow filter labels must react immediately to global interface-language changes');
assert.match(sidebarSource, /appLocale === 'en' \? 'Preview-ready' : '可预览'/, 'Preview-ready filter labels must remain localized in both interface languages');
assert.doesNotMatch(appSource, /label: 'Data Review · 待处理'/, 'Top workflow actions must not store mixed-language Data Review labels');
assert.match(stylesSource, /species-group\.contains-active \.variant-list[\s\S]*var\(--selection-border\)/, 'Active Variant parent tree guide must use the shared selection token');
assert.match(appSource, /BatchSeoEditor/, 'Admin must expose batch SEO editor');
assert.match(appSource, /BulkImportPanel/, 'Admin must expose template-backed bulk import');
assert.match(appSource, /ActivityCenter/, 'Admin must expose a persistent operation-history surface');
assert.match(bulkImportSource, /import_action/, 'Bulk template must require an explicit per-row import marker');
assert.match(bulkImportSource, /VALID_ACTIONS/, 'Bulk import must ignore unmarked template rows');
assert.match(bulkImportSource, /TEMPLATE_GUIDE/, 'Downloaded import template must explain what every field means.');
assert.match(bulkImportSource, /TEMPLATE_FORMATS/, 'Downloaded import template must explain accepted field formats.');
assert.match(bulkImportSource, /length:\s*20/, 'Downloaded import template must provide a blank working area instead of preloading the full catalog.');
assert.match(bulkImportSource, /示例 1[\s\S]*示例 2[\s\S]*示例 3/, 'Downloaded import template must contain three non-importing examples below the blank area.');
assert.doesNotMatch(bulkImportSource, /for \(const member of species\) \{[\s\S]*link\.download = `aquaguide-species-seo/, 'Template download must not preload every catalog record.');
assert.match(bulkImportSource, /source_name[\s\S]*scientific_name/, 'Bulk template must expose Product Truth identity as reference columns');
assert.match(bulkImportSource, /inspectSourceIdentity/, 'Bulk import must reject rows whose source scientific identity is incomplete before Draft write.');
assert.match(bulkImportSource, /status:\s*'draft'[\s\S]*review_state:\s*'editing'/, 'Bulk import must fail closed to Draft + Editing');
assert.match(bulkImportSource, /buildSpeciesSeoRouteMeta/, 'Bulk import must rebuild route/canonical metadata using the shared route contract');
assert.match(bulkImportSource, /canonical_to_sibling/, 'Bulk import must validate canonical-to-sibling policy');
assert.match(bulkImportSource, /kind:\s*'bulk_import'/, 'Bulk imports must record a named admin activity');
assert.doesNotMatch(bulkImportSource, /from\('species'\)|from\('fishData'/, 'Bulk import must never write Product Truth storage');
assert.doesNotMatch(bulkImportSource, /bulk-import-errors|bulk-import-ready/, 'Bulk import action feedback must not render as persistent inline status boxes');
assert.match(bulkImportSource, /emitAdminNotice/, 'Bulk import validation and client-side blockers must surface as top-right notices');
assert.match(bulkImportSource, /导入变更预览|Import change preview/, 'Bulk import must preview actual field changes before writing');
assert.match(bulkImportSource, /预检查结果|Preflight report/, 'Bulk import must show a persistent preflight report after upload.');
assert.match(bulkImportSource, /errors\.slice\(0, 12\)/, 'Bulk import preflight must expose row-level validation issues instead of only the first Toast error.');
assert.match(bulkImportSource, /disabled=\{saving \|\| !preflight\.ready\}/, 'Bulk import Draft creation must remain disabled until every preflight gate passes.');
assert.match(bulkImportSource, /创建 Draft|Create Draft/, 'Bulk import must distinguish validation/diff from the irreversible Draft creation action.');
assert.match(bulkImportSource, /changedPayloads/, 'Bulk import must skip marked rows that have no actual changes');
assert.match(bulkImportSource, /clearedFields/, 'Bulk import must surface override fields that will be cleared');
assert.match(appSource, /SEO 模板导入/, 'Template import must be exposed as an explicit user-facing action rather than hidden as a generic bulk tool');
assert.match(appSource, /批量审核重复记录/, 'Admin must expose a dedicated bulk duplicate-review entry');
assert.match(bulkDuplicateSource, /resolve_species_duplicate_reviews_bulk/, 'Bulk duplicate review must use one atomic backend operation');
assert.match(bulkDuplicateSource, /全选待审核/, 'Bulk duplicate review must support selecting the pending duplicate queue');
assert.match(bulkDuplicateSource, /确认处理/, 'Bulk duplicate review must require one explicit final confirmation action');
assert.match(bulkDuplicateSource, /recommendedCanonicalKey/, 'Bulk duplicate review must expose a deterministic keep-page recommendation per duplicate set');
assert.match(duplicateComparisonSource, /SEO last edited|SEO 最近编辑/, 'Shared duplicate evidence must expose editorial update time rather than forcing decisions from catalog IDs.');
assert.match(duplicateEvidenceSource, /duplicateCompleteness/, 'Shared duplicate evidence must calculate per-locale SEO completeness.');
assert.match(duplicateComparisonSource, /Preview page|查看 Preview/, 'Shared duplicate evidence must offer an in-context page Preview for every candidate.');
assert.match(duplicateEvidenceSource, /source_primary[\s\S]*approved[\s\S]*completeness[\s\S]*recent_edit/, 'Duplicate recommendation must explain source, approval, completeness and recency evidence in priority order.');
assert.match(bulkDuplicateSource, /暂不处理/, 'Bulk duplicate review must let operators defer an ambiguous candidate without persisting a decision.');
assert.match(reviewSource, /暂不处理/, 'Single-group duplicate review must also allow deferring without a write.');
assert.match(duplicateComparisonSource, /water_temperature[\s\S]*ph_level[\s\S]*tank_size/, 'Shared duplicate evidence must compare core source-data facts.');
assert.match(duplicateComparisonSource, /member\.image/, 'Shared duplicate evidence must show candidate images when available.');
assert.match(bulkDuplicateSource, /loadProductTruthCatalog[\s\S]*catalogByKey/, 'Bulk duplicate review must lazy-load full source facts without bloating the main Admin catalog projection.');
assert.match(reviewSource, /loadProductTruthCatalog[\s\S]*catalogByKey/, 'Single-group duplicate review must lazy-load the same source facts.');
assert.match(bulkDuplicateSource, /DuplicateCandidateComparison/, 'Bulk duplicate review must use the shared comparison component.');
assert.match(reviewSource, /DuplicateCandidateComparison/, 'Single-group Data Review must use the same duplicate comparison component as bulk review.');

assert.doesNotMatch(bulkDuplicateSource, /<em[^>]*>.*处理重复/s, 'Bulk duplicate actions must never be rendered as status-tag elements');
assert.match(appSource, /批量内容审核/, 'Admin must expose a dedicated bulk editorial-review entry after template import.');
assert.match(bulkEditorialSource, /transition_editorial_reviews_bulk/, 'Bulk editorial review must use one atomic backend operation.');
assert.match(bulkEditorialSource, /批量提交审核/, 'Bulk editorial review must support submitting multiple pages for review.');
assert.match(bulkEditorialSource, /批量批准 Preview/, 'Bulk editorial review must support approving multiple pages for Preview.');
assert.match(bulkEditorialSource, /批量退回编辑/, 'Bulk editorial review must support returning multiple pages to Editing.');
assert.match(bulkEditorialSource, /workflowOverview/, 'Bulk editorial candidates must derive from the shared publish-readiness queue.');
assert.doesNotMatch(bulkEditorialSource, /<select[^>]*review|review[^>]*<select/s, 'Bulk editorial review must not regress workflow actions into a state dropdown.');
assert.match(repoStoreSource, /transitionEditorialReviewsBulk/, 'Repo authority must implement atomic bulk editorial transitions.');
assert.match(repoStoreSource, /Approve Preview requires Awaiting Review state/, 'Bulk approval must enforce strict editorial state transitions server-side.');
assert.match(stylesSource, /topbar-content-review-trigger[\s\S]*border:\s*1px solid/, 'Bulk content review must remain visibly styled as an action button.');
assert.match(reviewSource, /emitAdminNotice/, 'Data Review precondition failures must surface as top-right notices');
assert.match(translationSource, /emitAdminNotice/, 'Translation outcomes and blockers must surface as top-right notices');
assert.match(historySource, /emitAdminNotice/, 'Revision load and confirmation feedback must surface as top-right notices');
assert.doesNotMatch(appSource, /save-message|page-error|error-box/, 'Editor and app action feedback must not render as persistent inline status messages');
assert.match(activityCenterSource, /from\('admin_activity_log'\)/, 'Activity Center must load persisted admin operations');
assert.match(repoBackendClientSource, /aquaguide-admin-operation/, 'All browser-side mutations must feed the shared operation notification channel');
assert.match(repoStoreSource, /admin_activity_log/, 'Repo content authority must persist admin operations with Draft history');
assert.match(repoStoreSource, /appendActivity/, 'Repo mutations must append activity in the same private-store transaction');
assert.match(appSource, /assessDataReview\(selectedGroup, nextRows\)\.ready[\s\S]*setActiveTool\(null\)/, 'Resolved Data Review drawers must auto-close only when the current group has no remaining issue');
assert.match(mainSource, /AdminNoticeViewport/, 'The global notice viewport must remain mounted across login and admin screens');
assert.match(adminNoticeSource, /operation-notice-stack/, 'Completed operations must surface a top-right status notice');
assert.match(adminNoticeSource, /aquaguide-admin-operation/, 'The global notice viewport must consume Repo operation events');
assert.match(adminNoticeSource, /aquaguide-admin-notice/, 'Client-side action blockers must share the global notice channel');
assert.match(adminNoticeSource, /setTimeout/, 'Transient notices must auto-dismiss');
assert.match(adminNoticeSource, /operation-notice-close/, 'Notices must remain manually dismissible');
assert.match(appSource, /activityUnread/, 'The top-right activity entry must expose unread operation count');
assert.match(appSource, /BaseSpeciesSeoEditor/, 'Admin must expose Base Species inheritance editor');
assert.match(appSource, /DataReviewPanel/, 'Admin must expose source-data review workflow');
assert.match(appSource, /PublishReadinessPanel/, 'Admin must expose explicit publish readiness');
assert.match(appSource, /WorkflowOverview/, 'Admin must expose queue-level workflow overview');
assert.match(workflowOverviewSource, /workflow-queue-row/, 'Workflow overview must render drawer-safe task rows instead of narrow KPI cards');
assert.match(workflowOverviewSource, /pageCount = overview\.locales/, 'Workflow overview page count must come from current workflow candidates rather than a hard-coded catalog total');
assert.match(workflowOverviewSource, /现在需要处理什么/, 'Chinese workflow overview must use task-oriented localized copy');
assert.match(workflowOverviewSource, /可预览/, 'Workflow overview must localize Preview-ready state in Chinese');
assert.match(workflowOverviewSource, /下一步动作/, 'Blocked pages must expose a next-action breakdown instead of one opaque total');
assert.match(workflowOverviewSource, /清理测试 \/ 验收文案/, 'Workflow overview must surface content hygiene as a concrete blocked-page next action');
assert.match(workflowOverviewSource, /先处理数据问题/, 'Workflow overview must expose Data Review as a blocked-page next action');
assert.match(workflowOverviewSource, /补齐当前语言内容/, 'Workflow overview must expose missing editorial content as a blocked-page next action');
assert.match(workflowOverviewSource, /补齐另一语言/, 'Workflow overview must expose bilingual dependency as a blocked-page next action');
assert.match(workflowOverviewSource, /修正收录 \/ Canonical/, 'Workflow overview must expose SEO-policy repair as a blocked-page next action');
assert.match(sidebarSource, /hygiene-quick-alert/, 'Sidebar must expose a distinct full-width alert for content cleanup tasks when needed');
assert.match(sidebarSource, /contentHygiene/, 'Sidebar hygiene count must come from the shared workflow overview');
assert.match(appSource, /workflowFilter\.type === 'blocked_reason'/, 'Workflow scope must support page-level blocked-reason filters');
assert.match(appSource, /blockedNextActions/, 'Blocked-reason navigation must use the shared mutually-exclusive next-action queues');
assert.match(appSource, /next\.type === 'readiness' \|\| next\.type === 'blocked_reason'/, 'Readiness and next-action navigation must share locale-aware page navigation');
assert.match(appSource, /setContentLocale\(next\.locale\)/, 'Cross-language queue navigation must switch the editor to the selected content locale');
assert.match(stylesSource, /workflow-blocked-breakdown/, 'Blocked next actions must render as a visually nested breakdown rather than equal top-level states');
assert.doesNotMatch(workflowOverviewSource, /Readiness 按 486 条 Species/, 'Workflow overview must not hard-code the legacy 486-species readiness count');
assert.match(stylesSource, /workflow-queue-row[\s\S]*grid-template-columns:\s*minmax\(0,1fr\) auto/, 'Workflow drawer rows must reserve stable space for copy and counts without label squeezing');
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
assert.match(stylesSource, /@media \(max-width: 1320px\)[\s\S]*\.topbar-actions \.admin-email \{ display: none; \}/, 'Responsive topbar must hide admin email before hiding workflow state');
assert.match(stylesSource, /@media \(max-width: 1180px\) and \(min-width: 761px\)[\s\S]*\.topbar-workflow \{ display: flex; \}/, 'Workflow state must remain visible through common laptop widths');
assert.match(stylesSource, /@media \(max-width: 760px\)[\s\S]*\.topbar-workflow \{ display: none; \}/, 'Workflow state may collapse only at the narrow single-column breakpoint');
assert.match(stylesSource, /studio-workspace > \.live-preview-pane \{ grid-column:\s*3;/, 'Live Preview must remain in its own grid column while tools are open');
assert.doesNotMatch(appSource, /<option value="archived">/, 'Species Variant lifecycle UI must expose Draft/Published only');
assert.doesNotMatch(baseSource, /<option value="archived">/, 'Base Species lifecycle UI must expose Draft/Published only');
assert.match(appSource, /app-language-switch/, 'Admin must expose one global interface-language switch');
assert.match(appSource, /contentLocale/, 'Content locale must remain a separate editorial state');
assert.match(appSource, /appLocale/, 'Interface locale must remain separate from content locale');
assert.match(appLanguageSource, /aquaguide-admin-app-locale/, 'Interface locale must persist across refreshes');
assert.match(appLanguageSource, /document\.documentElement\.lang/, 'Global interface locale must update document language');
assert.match(productTruthLoaderSource, /catalog\.generated\.json\?url/, 'Product Truth preview data must remain an external build asset');
assert.match(productTruthLoaderSource, /fetch\(catalogUrl\)/, 'Product Truth preview data must remain lazy-loaded through fetch');
assert.match(productTruthLoaderSource, /catalogPromise = undefined/, 'Transient Product Truth fetch failures must be retryable without reloading the Admin');
assert.match(appSource, /productTruthState[\s\S]*catalogKey/, 'Product Truth state must stay keyed to the selected catalog record');
assert.match(appSource, /productTruthMatchesSelection/, 'Preview must refuse Product Truth rows that do not match the active catalog key');
assert.match(appSource, /productTruthLoading[\s\S]*productTruthError/, 'Product Truth loading and transport failure must remain distinct states');
assert.match(liveFrontendPreviewSource, /Loading…|加载中…/, 'Live Preview must render explicit Product Truth loading state instead of fake missing values');
assert.match(liveFrontendPreviewSource, /Unavailable|数据不可用/, 'Live Preview must distinguish Product Truth transport failure from genuine missing fields');
assert.ok(groupedMembers.every((item) => !('image' in item) && !('water_temperature' in item) && !('ph_level' in item)), 'Species group projection must not duplicate Product Truth preview fields');
assert.match(appSource, /onLivePreviewChange/, 'Variant edits must stream unsaved changes into the live frontend preview');
assert.deepEqual(
  ['localizedName', 'h1', 'intro', 'imageAlt', 'seoTitle', 'metaDescription'].filter((key) => !EDITOR_ELEMENT_REGISTRY[key]),
  [],
  'Preview inspector must preserve the six core editable element mappings',
);
assert.equal(EDITOR_ELEMENT_REGISTRY.temperature.readOnly, true, 'Product Truth temperature must stay inspectable but read-only');
assert.equal(EDITOR_ELEMENT_REGISTRY.imageAlt.assetReadOnly, true, 'Hero image source must stay Product Truth read-only even though alt text is editable');
assert.match(liveFrontendPreviewSource, /Image source read-only|图片资源只读/, 'Image inspector must explain the split between read-only asset and editable alt text');
assert.match(liveFrontendPreviewSource, /getEditorElementLabel\(key, appLocale\)/, 'Inspector edit paths must identify the exact mapped field, not only its section');
assert.match(appSource, /selectedInspectorElement/, 'Admin must keep one shared inspector selection across editor and preview');
assert.match(appSource, /data-editor-field/, 'Variant editor fields must expose stable inspector targets');
assert.match(appSource, /renderInheritedOverrideField/, 'Variant editor must use explicit inherited/custom field presentation');
assert.match(appSource, /editor-status-cluster/, 'Primary editor header must separate publish status from review status');
assert.doesNotMatch(appSource, /editor-statuses[\s\S]*status-pill/, 'Primary editor must not regress to repeated status pills');
assert.match(appSource, /advanced-seo-disclosure/, 'Focus keyword and indexing controls must stay behind Advanced SEO disclosure');
assert.match(appSource, /<textarea rows=\"4\" value=\{form\.intro\}/, 'Variant intro must default to a compact four-row editing surface');
assert.match(appSource, /advanced-seo-disclosure/, 'Low-frequency keyword/index/canonical controls must stay behind Advanced SEO disclosure');
assert.match(appSource, /open=\{Boolean\(indexBlockReason\)\}/, 'Advanced SEO must automatically surface active index/canonical blockers');
assert.match(appSource, /inherited-content-disclosure/, 'Inherited Base intro must remain collapsed by default in Variant editing');
assert.match(appSource, /editor-status-item[\s\S]*Publish status|发布状态/, 'Variant editor must explicitly label publish status');
assert.match(baseSource, /editor-status-cluster/, 'Base editor must separate publish status from review status');
assert.match(appSource, /source === 'preview'[\s\S]*const targetScope = variantOnly \|\| variantOverride \? 'variant' : 'base'[\s\S]*runEditorNavigation\(\(\) => setEditorScope\(targetScope\)\)/, 'Preview-origin Inspector selection must route to the authoritative Base or Variant editor through the unsaved-change guard');
assert.match(liveFrontendPreviewSource, /const baseContext = !variantOnly && !custom/, 'Inspector edit path must identify inherited content as Base-owned regardless of current editor scope');
assert.match(appSource, /content-source-manager/, 'Variant source inheritance must be centralized instead of repeated under every field');
assert.match(appSource, /Use template|改用模板/, 'Variant source manager must expose a plain-language return-to-template action');
assert.match(appSource, /data-editor-override/, 'Override inputs must remain separately addressable after inherited-state disclosure');
assert.match(baseSource, /data-base-editor-field/, 'Base editor fields must expose stable inspector targets');
assert.doesNotMatch(appSource, /footer-state-select review-/, 'Variant workflow must not regress to a field-like review-state select');
assert.doesNotMatch(baseSource, /footer-state-select review-/, 'Base workflow must not regress to a field-like review-state select');
assert.match(appSource, /save\('ready_for_review'\)/, 'Variant workflow must expose an explicit submit-for-review action');
assert.match(appSource, /save\('approved'\)/, 'Variant workflow must expose an explicit approve-preview action');
assert.match(appSource, /onPublishStaging/, 'Approved Variant workflow must expose an explicit Staging publish action');
assert.match(baseSource, /save\('ready_for_review'\)/, 'Base workflow must expose an explicit submit-for-review action');
assert.match(baseSource, /save\('approved'\)/, 'Base workflow must expose an explicit approve-preview action');
assert.match(appSource, /\.update\(\{ review_state: reviewStateOverride \}\)[\s\S]*\.eq\('catalog_key'/, 'Variant review transitions must update review metadata only, not re-upsert content fields');
assert.match(baseSource, /\.update\(\{ review_state: reviewStateOverride \}\)[\s\S]*\.eq\('group_key'/, 'Base review transitions must update review metadata only, not re-upsert template fields');
assert.match(reviewSource, /DuplicateCandidateComparison/, 'Single-group duplicate review must expose the shared comparison evidence before asking for a human conclusion.');
assert.match(reviewSource, /resolve_species_duplicate_review/, 'Duplicate review UI must use one atomic Repo operation.');
assert.match(repoStoreSource, /resolveDuplicateReview/, 'Repo store must resolve review decision and SEO policy in one private-store write.');
assert.match(appSource, /审核进度|Review progress/, 'Variant workflow must label the non-interactive status area as review progress');
assert.match(appSource, /可执行操作|Available actions/, 'Variant workflow must label buttons as available actions');
assert.match(baseSource, /审核进度|Review progress/, 'Base workflow must label the non-interactive status area as review progress');
assert.match(baseSource, /可执行操作|Available actions/, 'Base workflow must label buttons as available actions');
assert.match(baseSource, /审核状态|Review status/, 'Base review status must remain explicitly labeled');
assert.match(appSource, /unsaved-indicator/, 'Variant editing must expose an explicit unsaved-change indicator');
assert.match(baseSource, /unsaved-indicator/, 'Base editing must expose the same unsaved-change indicator');
assert.match(appSource, /beforeunload/, 'Admin must protect dirty editor state from browser refresh or close');
assert.match(appSource, /confirmDiscardUnsaved/, 'Editor navigation must require explicit confirmation before discarding unsaved changes');
assert.match(appSource, /runEditorNavigation/, 'Species, scope and locale navigation must share one unsaved-change guard');
assert.match(appSource, /contentDirty \? <button[\s\S]*保存修改/, 'Variant save action must appear only for actual content changes');
assert.match(baseSource, /contentDirty \? <button[\s\S]*保存基础模板/, 'Base save action must appear only for actual template changes');
assert.match(appSource, /selectedId === id && editorScope === 'variant'/, 'Re-selecting the current Variant must remain a no-op and must not clear dirty state');
assert.match(appSource, /workflowFilter\?\.key === next\.key/, 'Re-selecting the active workflow filter must not discard dirty editor state');
assert.match(liveFrontendPreviewSource, /data-preview-element/, 'Live preview elements must expose stable inspector targets');
assert.match(liveFrontendPreviewSource, /scrollIntoView/, 'Preview selection must scroll mapped elements into view');
assert.match(liveFrontendPreviewSource, /源数据 · 只读/, 'Preview inspector must explain source-data read-only elements');
assert.match(liveFrontendPreviewSource, /is-readonly/, 'Preview inspector must visually distinguish read-only Product Truth elements from editable content');
assert.match(stylesSource, /--selection-strong:/, 'Admin must keep one shared selection color token across navigation, editor and Preview');
assert.match(stylesSource, /--readonly-strong:/, 'Admin must keep a distinct read-only inspector token');
assert.match(stylesSource, /group-header\.active[\s\S]*var\(--selection-strong\)/, 'Base selection must use the shared selection token');
assert.match(stylesSource, /variant-row\.active[\s\S]*var\(--selection-strong\)/, 'Variant selection must use the shared selection token');
assert.match(stylesSource, /preview-inspectable\.is-readonly\.is-selected[\s\S]*var\(--readonly-strong\)/, 'Product Truth selection must use the read-only tone rather than editable green');
assert.match(liveFrontendPreviewSource, /elementEditPath/, 'Preview inspector must explain where the selected element is edited');
assert.match(liveFrontendPreviewSource, /editorScope/, 'Inspector edit paths must distinguish Base and current-page editing context');
assert.match(liveFrontendPreviewSource, /\['page', 'google', 'mobile'\]/, 'Live preview must preserve Page, Google and Mobile modes');
assert.match(liveFrontendPreviewSource, /speciesPagePresentation/, 'Live Page preview must reuse the shared publication presentation rules');
assert.match(publicGeneratorSource, /speciesPagePresentation/, 'Public Species generator must reuse the same publication presentation rules as live Preview');
assert.match(publicGeneratorSource, /staging_release/, 'Generator must preserve a staging-only Approved Draft release mode');
assert.match(publicGeneratorSource, /status === 'draft' && row\.review_state === 'approved'/, 'Staging release must consume Approved Drafts, not Production Published state');
assert.match(speciesPagePresentationSource, /Care reference/, 'Shared Species presentation must define publication-facing fact labels');
assert.doesNotMatch(liveFrontendPreviewSource, /Care essentials|饲养要点|Overview & Care|物种概览与饲养/, 'Live Page preview must not invent sections absent from the static generator');
assert.match(appSource, /compactPreviewOpen/, 'Narrow layouts must preserve access to Preview through an explicit compact state');
assert.match(appSource, /compact-preview-toggle/, 'Narrow layouts must expose a Preview trigger instead of silently hiding Preview');
assert.match(liveFrontendPreviewSource, /compact-open/, 'Live Preview must support the narrow overlay mode');
assert.match(stylesSource, /@media \(max-width: 1180px\)/, 'Three-column layout must stop before the 400px Preview is clipped off-screen');
assert.match(stylesSource, /live-preview-pane\.compact-open/, 'Narrow Preview must have a visible overlay fallback');
assert.match(liveFrontendPreviewSource, /preview\.previewOnly/, 'Live preview must render the localized noindex safety label');
assert.match(appLanguageSource, /Noindex/, 'Global UI language dictionary must preserve the Preview noindex safety label');
assert.match(publicPreviewSource, /hreflang=zh-CN/, 'Public preview must expose hreflang pair evidence');
assert.match(appSource, /RevisionHistoryPanel/, 'Admin must expose Base and Variant revision history');
assert.match(historySource, /from\('content_revisions'\)/, 'History UI must read database-backed revisions');
assert.match(historySource, /restore_species_seo_revision/, 'History UI must use the guarded rollback RPC');
assert.match(historySource, /armedId/, 'Rollback must require an explicit second click rather than one-click destructive restore');
assert.match(appSource, /index_strategy: form\.indexStrategy/, 'Variant SEO must persist explicit index strategy');
assert.match(appSource, /Production 发布未开放/, 'Species publish must remain locked until rollback and staging gates are verified');
assert.match(appSource, /isPublicSpeciesPublishingEnabled = false/, 'Variant publish gate must remain fail-closed after generator verification');
assert.match(baseSource, /Production 发布未开放/, 'Base Species publish must remain locked until rollback and staging gates are verified');
assert.match(baseSource, /isPublicSpeciesPublishingEnabled = false/, 'Base publish gate must remain fail-closed after generator verification');
assert.match(appSource, /CONTENT_LOCALES/, 'Admin must expose an explicit content-locale switcher');
assert.match(appSource, /seoRowKey\(row\.catalog_key, row\.locale\)/, 'Localized Variant rows must not collide in client state');
assert.match(appSource, /groupSeoRowKey\(row\.group_key, row\.locale\)/, 'Localized Base rows must not collide in client state');
assert.match(appSource, /VITE_ADMIN_READ_ONLY_DEMO/, 'Read-only demo mode must be explicit and build-time controlled.');
assert.doesNotMatch(appSource, /VITE_ADMIN_REVIEW_MODE/, 'Normal Vercel Preview must not be conflated with the old read-only review flag.');
assert.match(appSource, /if \(readOnly\)/, 'Single save path must fail closed in review mode');
assert.match(appSource, /Read-only demo[\s\S]*emitAdminNotice/, 'Read-only demo save attempts must explain the block through the global notice layer');

assert.match(batchSource, /assessDataReview/, 'Bulk writes must consume persisted data-review decisions');
assert.match(batchSource, /getResolvedDuplicateSeoPolicy/, 'Batch Draft creation must inherit resolved duplicate canonical policy.');
assert.match(bulkImportSource, /getResolvedDuplicateSeoPolicy/, 'CSV bulk import must preserve resolved duplicate canonical policy.');
assert.match(bulkImportSource, /import_species_seo_bulk/, 'CSV bulk import must use one atomic Repo RPC instead of separate Base/page writes.');
assert.match(bulkImportSource, /defaultGroupSeoForLocale/, 'CSV bulk import must provide safe Base defaults for missing templates.');
assert.match(repoStoreSource, /function importSpeciesSeoBulk/, 'Repo backend must own atomic Species + missing-Base import behavior.');
assert.match(repoStoreSource, /exists[\s\S]*continue;[\s\S]*applyUpsert\(store, 'species_seo_groups'/, 'Bulk import must create missing Base templates without overwriting existing ones.');
assert.match(bulkImportSource, /已完成人工重复复核/, 'CSV validation must reject attempts to contradict a resolved duplicate decision.');
assert.match(appSource, /Locked by the resolved duplicate-review decision|已由人工重复复核结论锁定/, 'Single-page Advanced SEO must lock resolved duplicate canonical policy.');
assert.match(appSource, /Save blocked[\s\S]*保存被阻止[\s\S]*detail:\s*indexBlockReason/, 'Single-page content save must refuse invalid index/canonical state and explain the reason through the notice layer.');
assert.match(batchSource, /publishedSelected\.length/, 'Published rows must block unsafe batch overwrite');
assert.match(batchSource, /status: 'draft'/, 'Batch SEO must write drafts only');
assert.match(batchSource, /resolveEffectiveSeo/, 'Batch preview must resolve Base inheritance rather than copy flat content');
assert.doesNotMatch(batchSource, /seo_title:\s*applySeoTemplate/, 'Batch write must not duplicate Base title into every Variant');
assert.match(batchSource, /onConflict: 'catalog_key,locale'/, 'Batch upsert must use stable catalog key + locale');
assert.match(baseSource, /from\('species_seo_groups'\)/, 'Base editor must persist group SEO separately');
assert.match(baseSource, /Preview readiness|预览发布/, 'Base editor must defer publication blocking to explicit readiness instead of preventing Draft editing');
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
assert.match(reviewEnvExample, /^VITE_ADMIN_READ_ONLY_DEMO=true$/m, 'Read-only demo environment must opt in explicitly');
assert.match(adminBackendSource, /repoBackendClient/, 'Repo-backed Admin client must be the default runtime authority');
assert.doesNotMatch(adminBackendSource, /@supabase\/supabase-js/, 'SEO Admin browser runtime must not import Supabase SDK');
assert.match(repoBackendClientSource, /credentials:\s*'include'/, 'Repo Admin browser requests must use the HttpOnly server session');
assert.doesNotMatch(repoBackendClientSource, /ADMIN_GITHUB_TOKEN|ADMIN_REPO_PASSWORD|ADMIN_REPO_SESSION_SECRET/, 'Browser Repo client must never read server secrets');
assert.match(repoAuthSource, /HttpOnly/, 'Repo Admin session cookie must be HttpOnly');
assert.match(repoAuthSource, /SameSite=Lax/, 'Repo Admin session cookie must use SameSite protection');
assert.match(repoAuthSource, /requireSameOriginMutation/, 'Repo Admin must enforce an explicit same-origin mutation guard in addition to SameSite cookies');
assert.match(repoGithubSource, /ADMIN_GITHUB_TOKEN/, 'GitHub write credential must remain server-side');
assert.match(repoGithubSource, /ADMIN_GITHUB_CONTENT_REPO/, 'Private editorial content repository must be explicit');
assert.match(repoGithubSource, /ADMIN_GITHUB_STAGING_REPO/, 'Public staging repository must be a separate explicit authority');
assert.match(repoGithubSource, /Drafts must never fall back to the public application repository/, 'Missing private content repo must fail closed instead of writing Drafts to AquaGuide');
assert.doesNotMatch(repoGithubSource, /ADMIN_GITHUB_CONTENT_REPO \|\| process\.env\.ADMIN_GITHUB_REPO \|\| appRepo/, 'Private Draft authority must not fall back to the public AquaGuide repo');
assert.match(repoGithubSource, /seo-admin-drafts/, 'Repo content writes must use a dedicated draft branch by default');
assert.match(repoStoreSource, /merged\.status = 'draft'/, 'Repo content writes must fail closed to Draft');
assert.match(repoStoreSource, /review_state = 'editing'/, 'Content edits must invalidate approval in Repo mode');
assert.match(repoSessionApiSource, /setSessionCookie/, 'Repo login endpoint must issue the server-side session cookie');
assert.match(repoQueryApiSource, /requireRepoAdmin/, 'Repo content query endpoint must require Admin session');
assert.match(repoPublishApiSource, /requireRepoAdmin/, 'Staging publish endpoint must require Admin session');
assert.match(repoGithubSource, /probeRepoAccess/, 'Repo backend must expose a sanitized capability probe');
assert.match(repoGithubSource, /contents_write_capable/, 'Repo capability probe must verify Contents write authority');
assert.match(repoHealthApiSource, /repo_access_error/, 'Hosted health must expose a sanitized Repo readiness error code');
assert.match(appSource, /getRepoBackendHealth/, 'Admin must load Repo health before allowing normal login');
assert.match(appSource, /repoBackendBlocked/, 'Admin must fail closed before the editor when Repo authority is incomplete');
assert.match(translationApiSource, /getRequestSession/, 'Translation API must use the same Repo Admin session');
assert.doesNotMatch(translationApiSource, /@supabase\/supabase-js|SUPABASE_ANON_KEY|SUPABASE_URL/, 'Translation API must not depend on Supabase auth in Repo mode');
assert.doesNotMatch(envExample, /VITE_SUPABASE_|SUPABASE_SERVICE_ROLE_KEY/, 'Default Repo Admin browser env must not require Supabase credentials');

assert.match(repoStoreSource, /selectedCatalogKeys\.length > 20/, 'Repo staging publish must retain a hard 20-Species ceiling');
assert.match(repoStoreSource, /status === 'draft'.*review_state === 'approved'/s, 'Repo staging snapshot must consume Approved Draft rows only');
assert.match(repoStoreSource, /selected_catalog_keys/, 'Repo staging snapshot must carry an explicit Species allowlist');
assert.match(repoStoreSource, /Content hygiene blocked review/, 'Repo review updates must reject acceptance/test copy server-side');
assert.match(repoStoreSource, /Staging blocked by test\/acceptance wording/, 'Repo Staging snapshot must reject legacy approved acceptance/test copy');
assert.match(publicGeneratorSource, /content hygiene:/, 'Static Species generator must independently reject acceptance/test copy from snapshots.');
assert.match(appSource, /content-hygiene-warning/, 'Variant editor must surface content-hygiene blockers next to the workflow');
assert.match(appSource, /去基础模板修复/, 'Inherited hygiene blockers must offer a direct path to the Base editor');
assert.match(appSource, /onEditBase/, 'Variant hygiene actions must navigate through the shared Base-editor scope instead of duplicating Base controls');
assert.match(baseSource, /content-hygiene-warning/, 'Base editor must surface content-hygiene blockers next to the workflow');

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
  assert.equal(summarizeDataReviewIssues(neoGroup, canonicalReviewRows).open, neoGroup.category_conflict ? 1 : 0, 'Resolved duplicate evidence must leave only genuinely unresolved issues open.');
  const canonicalMember = neoGroup.members.find((member) => member.catalog_key === duplicateSet.member_ids[0]);
  const duplicatePolicy = getResolvedDuplicateSeoPolicy({ species: canonicalMember, group: neoGroup, reviewRows: canonicalReviewRows });
  assert.equal(duplicatePolicy?.indexStrategy, 'index', 'Resolved duplicate canonical must have an authoritative Index policy.');
  const duplicateSibling = neoGroup.members.find((member) => duplicateSet.member_ids.includes(member.catalog_key) && member.catalog_key !== duplicateSet.member_ids[0]);
  if (duplicateSibling) {
    const siblingPolicy = getResolvedDuplicateSeoPolicy({ species: duplicateSibling, group: neoGroup, reviewRows: canonicalReviewRows });
    assert.equal(siblingPolicy?.indexStrategy, 'canonical_to_sibling');
    assert.equal(siblingPolicy?.canonicalCatalogKey, duplicateSet.member_ids[0]);
  }
  const nonCanonical = neoGroup.members.find((member) => duplicateSet.member_ids.includes(member.catalog_key) && member.catalog_key !== duplicateSet.member_ids[0]);
  if (nonCanonical) assert.match(getIndexReviewBlockReason({ species: nonCanonical, group: neoGroup, indexStrategy: 'index', canonicalCatalogKey: '', reviewRows: canonicalReviewRows }), /不能独立 Index/, 'Confirmed duplicate non-canonical must stay blocked from independent Index');
  const unrelatedMember = neoGroup.members.find((member) => !(neoGroup.duplicate_sets || []).some((set) => set.member_ids.includes(member.catalog_key)));
  if (unrelatedMember && !neoGroup.category_conflict) {
    const unrelatedReadiness = assessPublishReadiness({
      species: unrelatedMember, group: neoGroup, locale: 'en',
      groupRow: { locale: 'en', review_state: 'approved', seo_title_template: '{{name}} Care Guide', meta_description_template: '{{name}} care guide.', h1_template: '{{name}} Care Guide', shared_intro: 'Shared care intro.' },
      variantRow: { locale: 'en', localized_name: 'Unrelated Variant', image_alt: 'Unrelated Variant', review_state: 'approved', index_strategy: 'noindex' },
      counterpartGroupRow: { review_state: 'approved' }, counterpartVariantRow: { review_state: 'approved' }, reviewRows: {},
    });
    assert.equal(unrelatedReadiness.state, 'publish_ready', 'An unresolved duplicate pair must not block unrelated pages in the same Base group');
  }
}

const cleanGroup = groupData.groups.find((group) => !group.category_conflict && !group.duplicate_count && group.members.some((member) => inspectSourceIdentity(member).clean));
const cleanMember = cleanGroup.members.find((member) => inspectSourceIdentity(member).clean);
const readinessFixture = assessPublishReadiness({
  species: cleanMember, group: cleanGroup, locale: 'en',
  groupRow: { locale: 'en', review_state: 'approved', seo_title_template: '{{name}} Care Guide', meta_description_template: '{{name}} care guide.', h1_template: '{{name}} Care Guide', shared_intro: 'Shared care intro.' },
  variantRow: { locale: 'en', localized_name: 'Reviewed Species', image_alt: 'Reviewed Species', review_state: 'approved', index_strategy: 'noindex' },
  counterpartGroupRow: { review_state: 'approved' }, counterpartVariantRow: { review_state: 'approved' }, reviewRows: {},
});
assert.equal(readinessFixture.state, 'publish_ready', 'Complete approved noindex content should be Preview Publish-ready');
const dirtyAcceptance = inspectEditorialContent({ h1: 'Red Cherry Shrimp Care Guide | Dual-Repo Staging' });
assert.equal(dirtyAcceptance.clean, false, 'Acceptance/test copy must be detected before review.');
assert.equal(inspectEditorialContent({ h1: 'Red Cherry Shrimp Care Guide' }).clean, true, 'Normal editorial copy must remain clean.');
assert.equal(inspectEditorialContent({ h1: '极火虾饲养指南｜双仓 Staging 验收' }).clean, false, 'Standalone Chinese acceptance wording must also be blocked.');
const malformedSourceSpecies = catalog.find((item) => item.catalog_key === 'sp_0069');
const malformedSourceGroup = groupData.groups.find((group) => group.members.some((member) => member.catalog_key === 'sp_0069'));
assert.equal(inspectSourceIdentity(malformedSourceSpecies).clean, false, 'Incomplete scientific identity must be detected from real catalog data.');
assert.ok(inspectSourceIdentity(malformedSourceSpecies).issues.some((issue) => issue.code === 'incomplete_suffix'), 'Trailing var. without an epithet must be treated as incomplete source identity.');
const validCultivarSpecies = catalog.find((item) => item.catalog_key === 'sp_0063');
assert.equal(inspectSourceIdentity(validCultivarSpecies).clean, true, 'A completed cultivar identity such as var. Ranchu must remain valid.');
const malformedSourceReadiness = assessPublishReadiness({
  species: malformedSourceSpecies, group: malformedSourceGroup, locale: 'zh-CN',
  groupRow: { locale: 'zh-CN', review_state: 'approved', seo_title_template: '{{name}}饲养指南', meta_description_template: '{{name}}饲养指南。', h1_template: '{{name}}饲养指南', shared_intro: '基础饲养简介。' },
  variantRow: { locale: 'zh-CN', image_alt: '红白锦鲤', review_state: 'approved', index_strategy: 'noindex' },
  counterpartGroupRow: null, counterpartVariantRow: null, reviewRows: {},
});
assert.equal(malformedSourceReadiness.state, 'blocked', 'Incomplete source identity must block Preview readiness even for noindex pages.');
assert.ok(malformedSourceReadiness.blockerCodes.includes('source_data'), 'Incomplete scientific identity must surface as a source-data next action.');
const malformedOverview = buildAdminWorkflowOverview({ species: [malformedSourceSpecies], groups: [malformedSourceGroup], seoRows: {}, groupSeoRows: {}, reviewRows: {} });
assert.equal(malformedOverview.locales['zh-CN'].blockedNextActions.source_data.count, 1, 'Workflow queue must route malformed scientific identity to the source-data repair action.');
const dirtyReadiness = assessPublishReadiness({
  species: cleanMember, group: cleanGroup, locale: 'en',
  groupRow: { locale: 'en', review_state: 'approved', seo_title_template: '{{name}} Care Guide', meta_description_template: '{{name}} care guide.', h1_template: '{{name}} Care Guide', shared_intro: 'Shared care intro.' },
  variantRow: { locale: 'en', localized_name: 'Reviewed Species', image_alt: 'Reviewed Species', h1: 'Reviewed Species Care Guide | Dual-Repo Staging', review_state: 'approved', index_strategy: 'noindex' },
  counterpartGroupRow: { review_state: 'approved' }, counterpartVariantRow: { review_state: 'approved' }, reviewRows: {},
});
assert.equal(dirtyReadiness.state, 'blocked', 'Acceptance/test copy must block Preview readiness even when already Approved.');
assert.ok(dirtyReadiness.blockers.some((item) => /测试|验收|test\/acceptance/i.test(item)), 'Readiness must explain the content-hygiene blocker.');
assert.ok(dirtyReadiness.blockerCodes.includes('hygiene'), 'Structured readiness diagnostics must classify dirty copy without parsing display text');
const dirtyCounterpartReadiness = assessPublishReadiness({
  species: cleanMember, group: cleanGroup, locale: 'en',
  groupRow: { locale: 'en', review_state: 'approved', seo_title_template: '{{name}} Care Guide', meta_description_template: '{{name}} care guide.', h1_template: '{{name}} Care Guide', shared_intro: 'Shared care intro.' },
  variantRow: { locale: 'en', localized_name: 'Reviewed Species', image_alt: 'Reviewed Species', review_state: 'approved', index_strategy: 'index' },
  counterpartGroupRow: { locale: 'zh-CN', review_state: 'approved', seo_title_template: '{{name}}饲养指南', meta_description_template: '{{name}}饲养说明', h1_template: '{{name}}饲养指南', shared_intro: '基础介绍' },
  counterpartVariantRow: { locale: 'zh-CN', image_alt: '测试鱼', h1: '测试鱼饲养指南｜后台真实保存验收', review_state: 'approved', index_strategy: 'index' }, reviewRows: {},
});
assert.equal(dirtyCounterpartReadiness.state, 'blocked', 'An indexable page must also be blocked when its approved counterpart still contains acceptance copy.');
assert.ok(dirtyCounterpartReadiness.blockers.some((item) => /另一语言页面/.test(item)), 'Counterpart hygiene must be visible as a publish blocker.');
assert.ok(dirtyCounterpartReadiness.blockerCodes.includes('bilingual'), 'Counterpart-locale failures must be classified as a bilingual next action');
const oneReadyOverview = buildAdminWorkflowOverview({
  species: [cleanMember], groups: [cleanGroup],
  seoRows: { [`${cleanMember.catalog_key}::en`]: { catalog_key: cleanMember.catalog_key, locale: 'en', localized_name: 'Reviewed Species', image_alt: 'Reviewed Species', review_state: 'approved', index_strategy: 'noindex' } },
  groupSeoRows: { [`${cleanGroup.group_key}::en`]: { group_key: cleanGroup.group_key, locale: 'en', review_state: 'approved', seo_title_template: '{{name}} Care Guide', meta_description_template: '{{name}} care guide.', h1_template: '{{name}} Care Guide', shared_intro: 'Shared care intro.' } },
  reviewRows: {},
});
assert.equal(oneReadyOverview.locales.en.publish_ready, 1, 'Workflow overview must count a complete Approved Species as Publish-ready');
assert.deepEqual(oneReadyOverview.locales.en.memberIdsByState.publish_ready, [cleanMember.id]);
const dirtyWorkflowOverview = buildAdminWorkflowOverview({
  species: [cleanMember], groups: [cleanGroup],
  seoRows: {
    [`${cleanMember.catalog_key}::zh-CN`]: { catalog_key: cleanMember.catalog_key, locale: 'zh-CN', h1: '后台真实保存验收', image_alt: '正常图片说明', review_state: 'editing', index_strategy: 'noindex' },
    [`${cleanMember.catalog_key}::en`]: { catalog_key: cleanMember.catalog_key, locale: 'en', localized_name: 'Reviewed Species', image_alt: 'Reviewed Species', review_state: 'editing', index_strategy: 'noindex' },
  },
  groupSeoRows: {
    [`${cleanGroup.group_key}::zh-CN`]: { group_key: cleanGroup.group_key, locale: 'zh-CN', review_state: 'approved', seo_title_template: '{{name}}饲养指南', meta_description_template: '{{name}}饲养信息。', h1_template: '{{name}}饲养指南', shared_intro: '正常基础简介。' },
    [`${cleanGroup.group_key}::en`]: { group_key: cleanGroup.group_key, locale: 'en', review_state: 'approved', seo_title_template: '{{name}} Care Guide', meta_description_template: '{{name}} care guide.', h1_template: '{{name}} Care Guide', shared_intro: 'Normal shared care intro.' },
  },
  reviewRows: {},
});
assert.equal(dirtyWorkflowOverview.contentHygiene.total, 1, 'One dirty locale page must create exactly one cleanup task');
assert.equal(dirtyWorkflowOverview.contentHygiene.byLocale['zh-CN'].count, 1);
assert.deepEqual(dirtyWorkflowOverview.contentHygiene.byLocale['zh-CN'].memberIds, [cleanMember.id]);
assert.equal(dirtyWorkflowOverview.locales['zh-CN'].blockedNextActions.hygiene.count, 1, 'Dirty current-locale copy must be the primary next action for that blocked page');
assert.deepEqual(dirtyWorkflowOverview.locales['zh-CN'].blockedNextActions.hygiene.memberIds, [cleanMember.id]);
assert.equal(dirtyWorkflowOverview.contentHygiene.byLocale.en.count, 0, 'A clean counterpart locale must not be misclassified as dirty');
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
  `${groupData.groups.length} base groups, ${groupData.stats.batch_candidate_groups} batch groups, Repo auth/content boundaries protected`,
);
