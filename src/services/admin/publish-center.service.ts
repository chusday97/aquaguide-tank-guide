import type { ReleaseEventDto, ReleaseFeedDto, ReleaseSourceStatusDto } from '../../../packages/contracts/src';
import { apiRequest } from '../api/api-client';

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

const seoSource = (availability: ReleaseSourceStatusDto['availability'], detail: string): ReleaseSourceStatusDto => ({
  authority: 'seo', availability, coverage: 'activity_history', label: 'Species SEO Repo Admin', detail,
});

const loadSeoReleaseFeed = async (limit = 100): Promise<ReleaseFeedDto> => {
  const session = await repoRequest<{ configured?: boolean; session?: { user?: { email?: string } } | null }>('/api/admin-content/session', { method: 'GET' });
  if (!session.response.ok || !session.payload?.session) {
    return { events: [], sources: [seoSource('auth_required', 'SEO Repo Admin 使用独立 cookie；登录 /admin/seo 后可在这里读取 revision/activity。')] };
  }
  try {
    const [activity, revisions, batches] = await Promise.all([
      repoSelect<SeoActivityRow>('admin_activity_log', 'created_at', limit),
      repoSelect<SeoRevisionRow>('content_revisions', 'created_at', limit),
      repoSelect<SeoImportBatchRow>('import_batches', 'updated_at', Math.min(limit, 100)),
    ]);
    const events = [...activity.map(seoActivityEvent), ...revisions.map(seoRevisionEvent), ...batches.map(seoBatchEvent)]
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)).slice(0, limit);
    return { events, sources: [seoSource('ready', 'Repo revision/activity/import/Staging 历史只读聚合；写 authority 仍留在 SEO Admin。')] };
  } catch (error) {
    return { events: [], sources: [seoSource('unavailable', error instanceof Error ? error.message : 'SEO Repo release history 暂时不可读取。')] };
  }
};
export const publishCenterService = {
  async load(limit = 120): Promise<ReleaseFeedDto> {
    const [business, seo] = await Promise.allSettled([
      apiRequest<ReleaseFeedDto>(`/admin/releases?limit=${Math.max(20, Math.min(200, limit))}`),
      loadSeoReleaseFeed(limit),
    ]);
    const businessFeed: ReleaseFeedDto = business.status === 'fulfilled'
      ? business.value
      : {
          events: [],
          sources: [
            { authority: 'product_care', availability: 'unavailable', coverage: 'current_only', label: 'Product / Care publication', detail: 'Business Admin release feed 暂时不可读取。' },
            { authority: 'compatibility', availability: 'unavailable', coverage: 'revision_history', label: 'Compatibility revisions', detail: 'Business Admin release feed 暂时不可读取。' },
          ],
        };
    const seoFeed = seo.status === 'fulfilled' ? seo.value : { events: [], sources: [seoSource('unavailable', 'SEO Repo release feed 暂时不可读取。')] };
    return {
      events: [...businessFeed.events, ...seoFeed.events]
        .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
        .slice(0, limit),
      sources: [...businessFeed.sources, ...seoFeed.sources],
    };
  },
};
