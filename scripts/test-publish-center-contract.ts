import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getRelatedReleaseEvents, releaseEventAuthorityHref } from '../src/services/admin/release-coordination';
import { classifyReleaseTableRead, combineReleaseTableStates } from '../apps/api/src/release-source-readiness';

const root = resolve(import.meta.dirname, '..');
const contract = readFileSync(resolve(root, 'packages/contracts/src/release-audit.ts'), 'utf8');
const apiRoute = readFileSync(resolve(root, 'apps/api/src/routes/admin-releases.ts'), 'utf8');
const service = readFileSync(resolve(root, 'src/services/admin/publish-center.service.ts'), 'utf8');
const page = readFileSync(resolve(root, 'src/pages/PublishCenter.tsx'), 'utf8');
const adminRoute = readFileSync(resolve(root, 'apps/api/src/routes/admin.ts'), 'utf8');
const auditMigration = readFileSync(resolve(root, 'supabase/migrations/202609050003_content_publication_audit_history.sql'), 'utf8');

assert.match(contract, /ReleaseAuthority = 'product_care' \| 'compatibility' \| 'seo'/);
assert.match(contract, /ReleaseSourceAvailability = 'ready' \| 'partial' \| 'auth_required' \| 'forbidden' \| 'schema_not_ready' \| 'unavailable'/);
assert.match(contract, /ReleaseHistoryCoverage = 'not_available' \| 'current_only' \| 'revision_history' \| 'activity_history'/);
assert.match(contract, /interface ReleaseEventDto/);
assert.match(contract, /ReleaseStage = 'diff' \| 'impact' \| 'preview' \| 'review' \| 'staging' \| 'production'/);
assert.match(contract, /ReleaseCapabilityState = 'available' \| 'partial' \| 'locked' \| 'not_applicable'/);
assert.match(contract, /interface ReleaseCapabilityDto/);
assert.match(contract, /ReleasePermissionAction = 'read_history'/);
assert.match(contract, /interface ReleasePermissionDto/);
assert.match(apiRoute, /adminReleasesRouter\.get\('\/'/);
assert.match(apiRoute, /content_publications/);
assert.match(apiRoute, /content_publication_events/);
assert.match(apiRoute, /publicationAuditUnavailable/);
assert.match(apiRoute, /publicationAuditReady \? 'revision_history' : 'current_only'/);
assert.match(apiRoute, /species_compatibility_profile_revisions/);
assert.match(apiRoute, /species_pair_compatibility_rule_revisions/);
assert.match(apiRoute, /schema_not_ready/);
assert.match(apiRoute, /not_available/);
assert.equal(classifyReleaseTableRead({ code: '42P01', message: 'relation does not exist' }, ['content_publications']), 'schema_not_ready');
assert.equal(classifyReleaseTableRead({ code: 'PGRST205', message: 'table not in schema cache' }, ['species_compatibility_profile_revisions']), 'schema_not_ready');
assert.equal(classifyReleaseTableRead({ code: '08006', message: 'connection failure' }, ['content_publications']), 'unavailable');
assert.equal(combineReleaseTableStates(['schema_not_ready', 'schema_not_ready']), 'schema_not_ready');
assert.equal(combineReleaseTableStates(['ready', 'schema_not_ready']), 'partial');
assert.match(apiRoute, /historyCoverage: 'current_only'/);
assert.match(apiRoute, /historyCoverage: 'revision_history'/);
assert.doesNotMatch(apiRoute, /\.insert\(|\.update\(|\.upsert\(|\.delete\(|\.rpc\(/, 'Business release feed must be read-only.');
assert.match(auditMigration, /create table if not exists public\.content_publication_events/);
assert.match(auditMigration, /event_type text not null check \(event_type in \('baseline','published','archived'\)\)/);
assert.match(auditMigration, /actor_id uuid references auth\.users/);
assert.match(auditMigration, /publish_content_snapshot_audited/);
assert.match(auditMigration, /archive_content_snapshot_audited/);
assert.match(auditMigration, /from public\.content_publications/);
assert.match(adminRoute, /publish_content_snapshot_audited/);
assert.match(adminRoute, /archive_content_snapshot_audited/);
assert.match(adminRoute, /auditedPublicationRpcUnavailable/);
assert.match(adminRoute, /publish_content_snapshot'/, 'Admin API must retain legacy publish fallback during migration rollout.');
assert.match(adminRoute, /archive_content_snapshot'/, 'Admin API must retain legacy archive fallback during migration rollout.');
assert.match(service, /action: 'select'/);
assert.match(service, /admin_activity_log/);
assert.match(service, /content_revisions/);
assert.match(service, /import_batches/);
assert.match(service, /loadLocalBusinessReleaseFeed/);
assert.match(service, /localBusinessAdminStore\.getReleaseEvents/);
assert.match(service, /localCompatibilityAdminStore\.getReleaseEvents/);
assert.match(service, /Local Mode 不能发布 Production/);
assert.doesNotMatch(service, /action: '(?:insert|update|upsert|delete|rpc)'/, 'SEO release adapter must be read-only.');
assert.match(page, /只读发布审计/);
assert.match(page, /不创建新的写入口/);
assert.match(page, /Product\/Care 与 Compatibility 由 Business API \/ Supabase 管理/);
assert.match(page, /DEV Local Mode/);
assert.match(page, /Production authority 保持锁定/);
assert.match(page, /SEO 使用独立 Repo Admin/);
assert.match(page, /publish-center-readiness/);
assert.match(page, /历史覆盖缺口/);
assert.match(page, /尚未启用/);
assert.match(page, /schemaNotReady/);
assert.match(page, /历史覆盖缺口/);
assert.match(page, /存在 current-only 来源/);
assert.match(page, /publish-center-event-detail/);
assert.match(page, /publish-center-capability-matrix/);
assert.match(page, /publish-center-permission-boundary/);
assert.match(page, /publish-center-related-evidence/);
assert.match(page, /publish-center-release-boundary/);
assert.match(page, /发布边界详情/);
assert.match(page, /这些是安全参考，不是当前发布动作/);
assert.doesNotMatch(page, /border-amber-200 bg-amber-50/, 'Publish Center informational states must not use Amber; Amber is reserved for human decisions.');
assert.equal(page.indexOf('publish-center-timeline') < page.indexOf('publish-center-release-boundary'), true, 'Release timeline must appear before low-frequency capability/permission reference details.');
assert.match(page, /这不是依赖判断，也不表示必须同步发布/);
assert.match(apiRoute, /businessPermissions/);
assert.match(service, /seoPermissions/);
assert.match(page, /Diff → Impact → Preview → Review → Staging → Production/);
assert.match(page, /只读审计详情，不提供发布或回滚动作/);
assert.doesNotMatch(page, /publishProfileRevision|publishPairRuleRevision|publishRepoStaging/);

const selectedEvent = { id: 'product-1', authority: 'product_care', domain: 'product', eventType: 'published', status: 'published', title: 'Product', resourceKey: 'sp_0436', occurredAt: '2026-09-05T06:00:00Z' } as const;
const related = getRelatedReleaseEvents([
  selectedEvent,
  { id: 'product-2', authority: 'product_care', domain: 'product', eventType: 'published', status: 'published', title: 'same authority', resourceKey: 'sp_0436', occurredAt: '2026-09-05T05:50:00Z' },
  { id: 'compat-1', authority: 'compatibility', domain: 'compatibility_pair', eventType: 'pair', status: 'published', title: 'pair', resourceKey: 'sp_0436__sp_0439', occurredAt: '2026-09-05T05:40:00Z' },
  { id: 'seo-batch-1', authority: 'seo', domain: 'seo_batch', eventType: 'batch', status: 'staging_published', title: 'batch', resourceKey: 'batch-1', occurredAt: '2026-09-05T05:30:00Z', metadata: { catalogKeys: ['sp_0436', 'sp_0001'] } },
  { id: 'seo-other', authority: 'seo', domain: 'seo_page', eventType: 'revision', status: 'approved', title: 'other', resourceKey: 'sp_0002', occurredAt: '2026-09-05T05:20:00Z' },
] as any, selectedEvent as any);
assert.deepEqual(related.map(item => item.id), ['compat-1', 'seo-batch-1'], 'coordination must use explicit catalog keys and exclude same-authority/unrelated records');
assert.equal(releaseEventAuthorityHref({ ...selectedEvent, metadata: { resourceId: 'species-uuid-1' } } as any), '/admin/product-content?type=species&id=species-uuid-1', 'Product release detail must deep-link to the exact Product record when resourceId is available.');
assert.equal(releaseEventAuthorityHref({ id: 'care-1', authority: 'product_care', domain: 'care', eventType: 'published', status: 'published', title: 'Care', resourceKey: 'guide-a', occurredAt: selectedEvent.occurredAt, metadata: { resourceId: 'care-uuid-1' } } as any), '/admin/product-content?type=care&id=care-uuid-1', 'Care release detail must deep-link to the exact Care record.');
assert.equal(releaseEventAuthorityHref({ id: 'compat-profile:rev-profile-1', authority: 'compatibility', domain: 'compatibility_profile', eventType: 'profile_revision', status: 'approved', title: 'Profile', resourceKey: 'sp_0436', occurredAt: selectedEvent.occurredAt, sourceRef: 'species_compatibility_profile_revisions:rev-profile-1' } as any), '/admin/compatibility?kind=profile&revision=rev-profile-1', 'Compatibility Profile release detail must deep-link to the exact revision.');
assert.equal(releaseEventAuthorityHref({ id: 'compat-pair:rev-pair-1', authority: 'compatibility', domain: 'compatibility_pair', eventType: 'pair_rule_revision', status: 'approved', title: 'Pair', resourceKey: 'sp_0436__sp_0439', occurredAt: selectedEvent.occurredAt, sourceRef: 'local:compat-pair:rev-pair-1:4' } as any), '/admin/compatibility?kind=pair&revision=rev-pair-1', 'Local Compatibility Pair release detail must deep-link to the exact revision.');
assert.equal(releaseEventAuthorityHref({ id: 'seo-revision:1', authority: 'seo', domain: 'seo_page', eventType: 'revision_updated', status: 'approved', title: 'SEO', resourceKey: 'sp_0436', locale: 'en', occurredAt: selectedEvent.occurredAt } as any), '/admin/seo/?species=sp_0436&locale=en', 'Species SEO page revision must deep-link to the exact locale editor.');
assert.equal(releaseEventAuthorityHref({ id: 'seo-batch:1', authority: 'seo', domain: 'seo_batch', eventType: 'import_batch', status: 'staging_published', title: 'Batch', resourceKey: 'batch-1', occurredAt: selectedEvent.occurredAt } as any), '/admin/seo/', 'SEO batch events must fall back to the authority home because they do not identify one page.');

console.log('publish center contract: multi-authority read-only aggregation + detail/readiness PASS');
