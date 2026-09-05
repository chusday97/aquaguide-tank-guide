import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getRelatedReleaseEvents } from '../src/services/admin/release-coordination';

const root = resolve(import.meta.dirname, '..');
const contract = readFileSync(resolve(root, 'packages/contracts/src/release-audit.ts'), 'utf8');
const apiRoute = readFileSync(resolve(root, 'apps/api/src/routes/admin-releases.ts'), 'utf8');
const service = readFileSync(resolve(root, 'src/services/admin/publish-center.service.ts'), 'utf8');
const page = readFileSync(resolve(root, 'src/pages/PublishCenter.tsx'), 'utf8');
const adminRoute = readFileSync(resolve(root, 'apps/api/src/routes/admin.ts'), 'utf8');
const auditMigration = readFileSync(resolve(root, 'supabase/migrations/202609050003_content_publication_audit_history.sql'), 'utf8');

assert.match(contract, /ReleaseAuthority = 'product_care' \| 'compatibility' \| 'seo'/);
assert.match(contract, /ReleaseHistoryCoverage = 'current_only' \| 'revision_history' \| 'activity_history'/);
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
assert.doesNotMatch(service, /action: '(?:insert|update|upsert|delete|rpc)'/, 'SEO release adapter must be read-only.');
assert.match(page, /Publish Center 只聚合已有发布权威/);
assert.match(page, /Product\/Care 与 Compatibility 继续由 Business API \/ Supabase 管理/);
assert.match(page, /SEO 继续由独立 Repo Admin 管理/);
assert.match(page, /publish-center-readiness/);
assert.match(page, /历史覆盖缺口/);
assert.match(page, /Product\/Care 当前只有 current Published snapshot/);
assert.match(page, /publish-center-event-detail/);
assert.match(page, /publish-center-capability-matrix/);
assert.match(page, /publish-center-permission-boundary/);
assert.match(page, /publish-center-related-evidence/);
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

console.log('publish center contract: multi-authority read-only aggregation + detail/readiness PASS');
