import type { ReleaseCapabilityDto, ReleaseEventDto, ReleaseFeedDto, ReleasePermissionDto, ReleaseSourceStatusDto } from '../../../packages/contracts/src';
import { apiRequest, AquaGuideApiError } from '../api/api-client';
import { isLocalBusinessAdminMode, localBusinessAdminStore } from './local-business-admin.store';
import { localCompatibilityAdminStore } from './local-compatibility-admin.store';

type RepoResult<T> = { data: T | null; error?: { message?: string } | null };
type SeoActivityRow = Record<string, any>;
type SeoRevisionRow = Record<string, any>;
type SeoImportBatchRow = Record<string, any>;

const repoRequest = async <T>(path: string, options: RequestInit = {}) => {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => null);
  return { response, payload } as { response: Response; payload: T | null };
};

const repoSelect = async <T>(table: string, orderColumn: string, limit = 100): Promise<T[]> => {
  const { response, payload } = await repoRequest<RepoResult<T[]>>('/api/admin-content/query', {
    method: 'POST',
    body: JSON.stringify({ action: 'select', table, filters: [], order: { column: orderColumn, ascending: false }, limit }),
  });
  if (!response.ok || payload?.error) throw new Error(payload?.error?.message || `Repo ${table} read failed.`);
  return payload?.data || [];
};

const timeOf = (row: Record<string, any>) => row.published_at || row.reviewed_at || row.updated_at || row.created_at || new Date(0).toISOString();
const seoActivityEvent = (row: SeoActivityRow): ReleaseEventDto => ({
  id: `seo-activity:${row.id}`,
  authority: 'seo',
  domain: row.kind === 'bulk_import' || row.kind === 'staging_publish' ? 'seo_batch' : 'seo_admin',
  eventType: row.kind || 'admin_activity',
  status: row.status || 'success',
  title: row.title || 'SEO 后台操作',
  detail: row.detail || '',
  resourceKey: row.resource_key || undefined,
  locale: row.locale || undefined,
  actor: row.actor || undefined,
  occurredAt: row.created_at,
  sourceRef: `admin_activity_log:${row.id}`,
  metadata: { affectedCount: row.affected_count || 0, ...(row.metadata || {}) },
});

const seoRevisionEvent = (row: SeoRevisionRow): ReleaseEventDto => ({
  id: `seo-revision:${row.id}`,
  authority: 'seo',
  domain: row.resource_type === 'species_seo_group' ? 'seo_base' : 'seo_page',
  eventType: `revision_${row.operation || 'updated'}`,
  status: row.snapshot?.review_state || row.snapshot?.status || 'draft',
  title: row.operation === 'rollback' ? 'SEO 历史版本已恢复' : 'SEO revision 已记录',
  detail: `${row.resource_key || ''}${row.locale ? ` · ${row.locale}` : ''}`,
  resourceKey: row.resource_key || undefined,
  locale: row.locale || undefined,
  version: Number(row.version) || undefined,
  occurredAt: row.created_at,
  sourceRef: `content_revisions:${row.id}`,
  metadata: { operation: row.operation, sourceRevisionId: row.source_revision_id || undefined },
});
const seoBatchEvent = (row: SeoImportBatchRow): ReleaseEventDto => ({
  id: `seo-batch:${row.batch_id}`,
  authority: 'seo', domain: 'seo_batch', eventType: 'import_batch', status: row.status || 'unknown',
  title: row.status === 'staging_published' ? 'SEO Staging batch 已发布' : 'SEO import batch',
  detail: `${row.batch_id || ''}${row.filename ? ` · ${row.filename}` : ''}`,
  resourceKey: row.batch_id || undefined,
  locale: row.locale || undefined,
  occurredAt: timeOf(row), sourceRef: `import_batches:${row.batch_id}`,
  metadata: {
    source: row.source, pageCount: row.page_count || 0, baseCreatedCount: row.base_created_count || 0,
    stagingCommitSha: row.staging_commit_sha || undefined, stagingBranch: row.staging_branch || undefined,
    catalogKeys: row.catalog_keys || [], groupKeys: row.group_keys || [],
  },
});



const seoPermissions = (authenticated: boolean, identity?: string): ReleasePermissionDto[] => {
  const gated = (action: ReleasePermissionDto['action'], allowedDetail: string): ReleasePermissionDto => ({
    authority: 'seo', identity, role: authenticated ? 'repo-admin' : 'repo-admin', action,
    state: authenticated ? 'allowed' : 'separate_auth',
    detail: authenticated ? allowedDetail : 'Requires independent SEO Repo Admin session.',
  });
  return [
    gated('read_history', 'Repo Admin may read SEO revision/activity/import history.'),
    gated('edit_draft', 'Repo Admin may edit SEO Draft content.'),
    gated('review', 'Repo Admin may submit/approve editorial review.'),
    gated('publish_staging', 'Repo Admin may publish batch-scoped Controlled Staging when readiness is green.'),
    { authority: 'seo', identity, role: 'repo-admin', action: 'publish_reviewed', state: 'not_applicable', detail: 'SEO does not use Compatibility reviewed-authority semantics.' },
    { authority: 'seo', identity, role: 'repo-admin', action: 'publish_production', state: 'locked', detail: 'Production SEO publish remains separately locked.' },
  ];
};

const seoCapabilities: ReleaseCapabilityDto[] = [
  { authority: 'seo', stage: 'diff', state: 'available', label: 'Diff', detail: 'CSV preflight and page/base field Diff are available.' },
  { authority: 'seo', stage: 'impact', state: 'partial', label: 'Impact', detail: 'Readiness and source/data blockers are available; cross-domain impact remains separate.' },
  { authority: 'seo', stage: 'preview', state: 'available', label: 'Preview', detail: 'Controlled page/Google/mobile preview and hosted Staging verification are available.' },
  { authority: 'seo', stage: 'review', state: 'available', label: 'Review', detail: 'Explicit editorial submit/approve gates exist for page and Base content.' },
  { authority: 'seo', stage: 'staging', state: 'available', label: 'Staging', detail: 'Batch-scoped controlled Staging publish is implemented.' },
  { authority: 'seo', stage: 'production', state: 'locked', label: 'Production', detail: 'Production SEO publish remains separately locked.' },
];

const seoSource = (availability: ReleaseSourceStatusDto['availability'], detail: string): ReleaseSourceStatusDto => ({
  authority: 'seo', availability, coverage: 'activity_history', label: 'Species SEO Repo Admin', detail,
});

const localBusinessCapabilities: ReleaseCapabilityDto[] = [
  { authority: 'product_care', stage: 'diff', state: 'available', label: 'Diff', detail: 'Local Draft 与 Published Snapshot 可直接比较。' },
  { authority: 'product_care', stage: 'impact', state: 'available', label: 'Impact', detail: 'Local Change Impact Preview 与 Compatibility simulation 可用。' },
  { authority: 'product_care', stage: 'preview', state: 'available', label: 'Preview', detail: 'Local Published Snapshot 与待发布内容可预览。' },
  { authority: 'product_care', stage: 'review', state: 'partial', label: 'Review', detail: 'Local 模式保留发布确认，但没有独立 reviewer 身份。' },
  { authority: 'product_care', stage: 'staging', state: 'not_applicable', label: 'Staging', detail: 'Local Product/Care 没有独立 Staging 层。' },
  { authority: 'product_care', stage: 'production', state: 'locked', label: 'Production', detail: 'Local Mode 不能发布 Production。' },
  { authority: 'compatibility', stage: 'diff', state: 'available', label: 'Diff', detail: 'Local revision 与 reviewed baseline Diff 可用。' },
  { authority: 'compatibility', stage: 'impact', state: 'available', label: 'Impact', detail: 'Local structural Impact 与真实 engine Regression 可用。' },
  { authority: 'compatibility', stage: 'preview', state: 'available', label: 'Preview', detail: 'Local before/after regression outcome 可用。' },
  { authority: 'compatibility', stage: 'review', state: 'available', label: 'Review', detail: 'Local human Approve/Reject gate 可用。' },
  { authority: 'compatibility', stage: 'staging', state: 'not_applicable', label: 'Staging', detail: 'Local Compatibility 没有独立 Staging 层。' },
  { authority: 'compatibility', stage: 'production', state: 'locked', label: 'Production', detail: 'Local reviewed publish 只更新开发 runtime，不是 Production 发布。' },
];

const localBusinessPermissions: ReleasePermissionDto[] = [
  { authority: 'product_care', role: 'local-dev', action: 'read_history', state: 'allowed', detail: 'DEV Local Mode 可读取本地 Product/Care 发布历史。' },
  { authority: 'product_care', role: 'local-dev', action: 'edit_draft', state: 'allowed', detail: 'DEV Local Mode 可编辑 Product/Care Draft。' },
  { authority: 'product_care', role: 'local-dev', action: 'review', state: 'allowed', detail: 'DEV Local Mode 可执行显式发布确认。' },
  { authority: 'product_care', role: 'local-dev', action: 'publish_staging', state: 'not_applicable', detail: 'Local Product/Care 无独立 Staging。' },
  { authority: 'product_care', role: 'local-dev', action: 'publish_reviewed', state: 'not_applicable', detail: 'Product/Care 使用 Published Snapshot。' },
  { authority: 'product_care', role: 'local-dev', action: 'publish_production', state: 'locked', detail: 'Local Mode 禁止 Production publish。' },
  { authority: 'compatibility', role: 'local-dev', action: 'read_history', state: 'allowed', detail: 'DEV Local Mode 可读取 Compatibility revision history。' },
  { authority: 'compatibility', role: 'local-dev', action: 'edit_draft', state: 'allowed', detail: 'DEV Local Mode 可编辑 Compatibility revision。' },
  { authority: 'compatibility', role: 'local-dev', action: 'review', state: 'allowed', detail: 'DEV Local Mode 可执行 human Approve/Reject。' },
  { authority: 'compatibility', role: 'local-dev', action: 'publish_staging', state: 'not_applicable', detail: 'Local Compatibility 无独立 Staging。' },
  { authority: 'compatibility', role: 'local-dev', action: 'publish_reviewed', state: 'allowed', detail: 'Local reviewed publish 只更新开发 runtime bootstrap。' },
  { authority: 'compatibility', role: 'local-dev', action: 'publish_production', state: 'locked', detail: 'Local Mode 禁止 Production publish。' },
];

const loadLocalBusinessReleaseFeed = async (limit: number): Promise<ReleaseFeedDto> => {
  const [productCareEvents, compatibilityEvents] = await Promise.all([
    localBusinessAdminStore.getReleaseEvents(),
    localCompatibilityAdminStore.getReleaseEvents(),
  ]);
  return {
    events: [...productCareEvents, ...compatibilityEvents]
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
      .slice(0, limit),
    sources: [
      { authority: 'product_care', availability: 'ready', coverage: 'revision_history', label: 'Product / Care Local authority', detail: 'Local publish/archive history 从当前本地 store 启用后持续记录；来自浏览器持久化 Published Snapshot authority，不依赖 Supabase。' },
      { authority: 'compatibility', availability: 'ready', coverage: 'revision_history', label: 'Compatibility Local revisions', detail: 'Local submit/review/publish history 从当前本地 store 启用后持续记录；来自 Compatibility revision store，reviewed publish 只更新开发 runtime。' },
    ],
    capabilities: localBusinessCapabilities,
    permissions: localBusinessPermissions,
  };
};

const loadSeoReleaseFeed = async (limit = 100): Promise<ReleaseFeedDto> => {
  const session = await repoRequest<{ configured?: boolean; session?: { user?: { email?: string } } | null }>('/api/admin-content/session', { method: 'GET' });
  if (!session.response.ok || !session.payload?.session) {
    return { events: [], sources: [seoSource('auth_required', 'SEO Repo Admin 使用独立 cookie；登录 /admin/seo 后可在这里读取 revision/activity。')], capabilities: seoCapabilities, permissions: seoPermissions(false) };
  }
  try {
    const [activity, revisions, batches] = await Promise.all([
      repoSelect<SeoActivityRow>('admin_activity_log', 'created_at', limit),
      repoSelect<SeoRevisionRow>('content_revisions', 'created_at', limit),
      repoSelect<SeoImportBatchRow>('import_batches', 'updated_at', Math.min(limit, 100)),
    ]);
    const events = [...activity.map(seoActivityEvent), ...revisions.map(seoRevisionEvent), ...batches.map(seoBatchEvent)]
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)).slice(0, limit);
    return { events, sources: [seoSource('ready', 'Repo revision/activity/import/Staging 历史只读聚合；写 authority 仍留在 SEO Admin。')], capabilities: seoCapabilities, permissions: seoPermissions(true, session.payload?.session?.user?.email) };
  } catch (error) {
    return { events: [], sources: [seoSource('unavailable', error instanceof Error ? error.message : 'SEO Repo release history 暂时不可读取。')], capabilities: seoCapabilities, permissions: seoPermissions(false) };
  }
};
export const publishCenterService = {
  async load(limit = 120): Promise<ReleaseFeedDto> {
    const [business, seo] = await Promise.allSettled([
      isLocalBusinessAdminMode
        ? loadLocalBusinessReleaseFeed(limit)
        : apiRequest<ReleaseFeedDto>(`/admin/releases?limit=${Math.max(20, Math.min(200, limit))}`),
      loadSeoReleaseFeed(limit),
    ]);
    const businessFailureAvailability = business.status === 'rejected' && business.reason instanceof AquaGuideApiError
      ? business.reason.code === 'AUTH_REQUIRED' ? 'auth_required'
        : business.reason.code === 'FORBIDDEN' ? 'forbidden' : 'unavailable'
      : 'unavailable';
    const businessFeed: ReleaseFeedDto = business.status === 'fulfilled'
      ? business.value
      : {
          events: [],
          sources: [
            { authority: 'product_care', availability: businessFailureAvailability, coverage: 'not_available', label: 'Product / Care publication', detail: businessFailureAvailability === 'auth_required' ? '需要 Business Admin 安全会话后才能读取 Product / Care 发布 authority。' : businessFailureAvailability === 'forbidden' ? '当前账号没有 Product / Care 发布 authority 读取权限。' : 'Business Admin release feed 暂时不可读取。' },
            { authority: 'compatibility', availability: businessFailureAvailability, coverage: 'not_available', label: 'Compatibility revisions', detail: businessFailureAvailability === 'auth_required' ? '需要 Business Admin 安全会话后才能读取 Compatibility revision authority。' : businessFailureAvailability === 'forbidden' ? '当前账号没有 Compatibility revision authority 读取权限。' : 'Business Admin release feed 暂时不可读取。' },
          ],
          capabilities: [],
          permissions: [],
        };
    const seoFeed = seo.status === 'fulfilled' ? seo.value : { events: [], sources: [seoSource('unavailable', 'SEO Repo release feed 暂时不可读取。')], capabilities: seoCapabilities, permissions: seoPermissions(false) };
    return {
      events: [...businessFeed.events, ...seoFeed.events]
        .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
        .slice(0, limit),
      sources: [...businessFeed.sources, ...seoFeed.sources],
      capabilities: [...(businessFeed.capabilities || []), ...(seoFeed.capabilities || [])],
      permissions: [...(businessFeed.permissions || []), ...(seoFeed.permissions || [])],
    };
  },
};
