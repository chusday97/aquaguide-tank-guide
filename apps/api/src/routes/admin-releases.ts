import { Router } from 'express';
import type { ReleaseEventDto, ReleaseFeedDto, ReleasePermissionDto } from '../../../../packages/contracts/src';
import { asyncRoute, sendData } from '../http';
import { getAdminSupabase } from '../supabase';
import { throwDatabaseError } from '../data-utils';

const eventTime = (row: Record<string, any>) => row.published_at || row.reviewed_at || row.updated_at || row.created_at || new Date(0).toISOString();

const publicationAuditUnavailable = (error: { code?: string; message?: string } | null) => (
  ['42P01', 'PGRST205'].includes(String(error?.code || ''))
  || /content_publication_events/i.test(String(error?.message || ''))
    && /not found|does not exist|schema cache/i.test(String(error?.message || ''))
);
const publicationEventTitle = (resourceType: string, eventType: string) => {
  const domain = resourceType === 'care' ? 'Care' : 'Product';
  if (eventType === 'archived') return `${domain} 已归档`;
  if (eventType === 'baseline') return `${domain} 历史基线`;
  return `${domain} 发布版本`;
};

const compatibilityTitle = (status: string, kind: 'Profile' | 'Pair Rule') => {
  if (status === 'published') return `${kind} reviewed version 已发布`;
  if (status === 'approved') return `${kind} revision 已批准`;
  if (status === 'rejected') return `${kind} revision 已驳回`;
  if (status === 'pending_review') return `${kind} revision 待审核`;
  if (status === 'superseded') return `${kind} revision 已被替代`;
  return `${kind} Draft revision`;
};


const businessCapabilities = [
  { authority: 'product_care', stage: 'diff', state: 'available', label: 'Diff', detail: 'Draft vs Published field Diff is available.' },
  { authority: 'product_care', stage: 'impact', state: 'available', label: 'Impact', detail: 'Change Impact Preview classifies direct vs review-only consumers.' },
  { authority: 'product_care', stage: 'preview', state: 'available', label: 'Preview', detail: 'Decision-critical Product fields expose Published vs ready-to-publish preview.' },
  { authority: 'product_care', stage: 'review', state: 'partial', label: 'Review', detail: 'Admin publish confirmation exists; there is no separate reviewer role gate yet.' },
  { authority: 'product_care', stage: 'staging', state: 'not_applicable', label: 'Staging', detail: 'Product/Care currently has no separate Staging publication authority.' },
  { authority: 'product_care', stage: 'production', state: 'locked', label: 'Production', detail: 'Production remains explicitly locked in this project phase.' },
  { authority: 'compatibility', stage: 'diff', state: 'available', label: 'Diff', detail: 'Revision vs reviewed baseline structural Diff is available.' },
  { authority: 'compatibility', stage: 'impact', state: 'available', label: 'Impact', detail: 'Server structural impact and full engine regression reports are required.' },
  { authority: 'compatibility', stage: 'preview', state: 'available', label: 'Preview', detail: 'Before/after engine outcomes are visible in the Compatibility Admin review flow.' },
  { authority: 'compatibility', stage: 'review', state: 'available', label: 'Review', detail: 'Explicit human Approve/Reject is required before reviewed publish.' },
  { authority: 'compatibility', stage: 'staging', state: 'not_applicable', label: 'Staging', detail: 'Compatibility reviewed authority currently has no separate Staging layer.' },
  { authority: 'compatibility', stage: 'production', state: 'locked', label: 'Production', detail: 'Versioned publish code exists, but live Compatibility migrations remain unapplied.' },
] as const;


const businessPermissions = (identity?: string): ReleasePermissionDto[] => [
  { authority: 'product_care', identity, role: 'admin', action: 'read_history', state: 'allowed', detail: 'Authenticated Business Admin may read current Product/Care publication state.' },
  { authority: 'product_care', identity, role: 'admin', action: 'edit_draft', state: 'allowed', detail: 'Business Admin may edit Product/Care Drafts.' },
  { authority: 'product_care', identity, role: 'admin', action: 'review', state: 'allowed', detail: 'Current admin role can confirm release; there is no separate reviewer role yet.' },
  { authority: 'product_care', identity, role: 'admin', action: 'publish_staging', state: 'not_applicable', detail: 'No separate Product/Care Staging authority exists.' },
  { authority: 'product_care', identity, role: 'admin', action: 'publish_reviewed', state: 'not_applicable', detail: 'Product/Care uses Published snapshots rather than Compatibility reviewed authority.' },
  { authority: 'product_care', identity, role: 'admin', action: 'publish_production', state: 'locked', detail: 'Production remains locked by project policy.' },
  { authority: 'compatibility', identity, role: 'admin', action: 'read_history', state: 'allowed', detail: 'Authenticated Business Admin may read Compatibility revision history.' },
  { authority: 'compatibility', identity, role: 'admin', action: 'edit_draft', state: 'allowed', detail: 'Admin may edit isolated Compatibility revisions.' },
  { authority: 'compatibility', identity, role: 'admin', action: 'review', state: 'allowed', detail: 'Admin currently performs explicit Approve/Reject; reviewer role is not separated yet.' },
  { authority: 'compatibility', identity, role: 'admin', action: 'publish_staging', state: 'not_applicable', detail: 'No separate Compatibility Staging layer exists.' },
  { authority: 'compatibility', identity, role: 'admin', action: 'publish_reviewed', state: 'locked', detail: 'Versioned publish code exists, but live Compatibility migrations remain unapplied.' },
  { authority: 'compatibility', identity, role: 'admin', action: 'publish_production', state: 'locked', detail: 'Production remains locked by project policy.' },
];

export const adminReleasesRouter = Router();

adminReleasesRouter.get('/', asyncRoute(async (request, response) => {
  const limit = Math.max(20, Math.min(200, Number(request.query.limit) || 100));
  const client = getAdminSupabase();
  const [publicationAuditResult, publicationResult, profileResult, pairResult] = await Promise.all([
    client.from('content_publication_events')
      .select('id,resource_type,resource_id,catalog_key,event_type,source_version,actor_id,occurred_at,metadata')
      .order('occurred_at', { ascending: false }).limit(limit),
    client.from('content_publications')
      .select('id,resource_type,resource_id,catalog_key,source_version,published_at,updated_at')
      .order('published_at', { ascending: false }).limit(limit),
    client.from('species_compatibility_profile_revisions')
      .select('id,species_id,revision_number,base_profile_version,status,version,created_at,updated_at,reviewed_at,published_at,reviewed_by')
      .order('updated_at', { ascending: false }).limit(limit),
    client.from('species_pair_compatibility_rule_revisions')
      .select('id,species_a_id,species_b_id,revision_number,base_rule_version,status,version,created_at,updated_at,reviewed_at,published_at,reviewed_by')
      .order('updated_at', { ascending: false }).limit(limit),
  ]);
  if (publicationResult.error) throwDatabaseError(publicationResult.error, 'Product/Care 当前发布状态暂时无法加载。');
  const publicationAuditReady = !publicationAuditResult.error;
  const publicationAuditFallbackReason = publicationAuditResult.error
    ? publicationAuditUnavailable(publicationAuditResult.error)
      ? 'audit_migration_unapplied'
      : 'audit_history_unavailable'
    : undefined;
  if (profileResult.error) throwDatabaseError(profileResult.error, 'Compatibility Profile revision 暂时无法加载。');
  if (pairResult.error) throwDatabaseError(pairResult.error, 'Compatibility Pair Rule revision 暂时无法加载。');

  const speciesIds = Array.from(new Set([
    ...(profileResult.data || []).map(row => row.species_id),
    ...(pairResult.data || []).flatMap(row => [row.species_a_id, row.species_b_id]),
  ]));
  const speciesResult = speciesIds.length
    ? await client.from('species').select('id,catalog_key,name,scientific_name').in('id', speciesIds)
    : { data: [], error: null };
  if (speciesResult.error) throwDatabaseError(speciesResult.error, 'Compatibility 物种身份暂时无法解析。');
  const speciesById = new Map((speciesResult.data || []).map(row => [row.id, row]));

  const publicationEvents: ReleaseEventDto[] = publicationAuditReady
    ? (publicationAuditResult.data || []).map(row => ({
        id: `product-care-audit:${row.id}`,
        authority: 'product_care' as const,
        domain: row.resource_type === 'care' ? 'care' as const : 'product' as const,
        eventType: `publication_${row.event_type}`,
        status: row.event_type,
        title: publicationEventTitle(row.resource_type, row.event_type),
        detail: `${row.catalog_key} · source v${row.source_version}`,
        resourceKey: row.catalog_key, version: row.source_version,
        actor: row.actor_id || undefined,
        occurredAt: row.occurred_at,
        sourceRef: `content_publication_events:${row.id}`,
        metadata: { resourceId: row.resource_id, historyCoverage: 'revision_history', ...(row.metadata || {}) },
      }))
    : (publicationResult.data || []).map(row => ({
        id: `product-care:${row.id}`,
        authority: 'product_care' as const,
        domain: row.resource_type === 'care' ? 'care' as const : 'product' as const,
        eventType: 'published_snapshot', status: 'published',
        title: row.resource_type === 'care' ? 'Care 发布版本' : 'Product 发布版本',
        detail: `${row.catalog_key} · source v${row.source_version}`,
        resourceKey: row.catalog_key, version: row.source_version,
        occurredAt: row.published_at, sourceRef: `content_publications:${row.id}`,
        metadata: { resourceId: row.resource_id, historyCoverage: 'current_only', fallbackReason: publicationAuditFallbackReason },
      }));
  const profileEvents: ReleaseEventDto[] = (profileResult.data || []).map(row => {
    const species = speciesById.get(row.species_id);
    return {
      id: `compat-profile:${row.id}`,
      authority: 'compatibility', domain: 'compatibility_profile',
      eventType: 'profile_revision', status: row.status,
      title: compatibilityTitle(row.status, 'Profile'),
      detail: `${species?.name || species?.catalog_key || row.species_id} · revision #${row.revision_number}`,
      resourceKey: species?.catalog_key || row.species_id,
      version: row.version, actor: row.reviewed_by || undefined,
      occurredAt: eventTime(row), sourceRef: `species_compatibility_profile_revisions:${row.id}`,
      metadata: { revisionNumber: row.revision_number, baseVersion: row.base_profile_version },
    };
  });

  const pairEvents: ReleaseEventDto[] = (pairResult.data || []).map(row => {
    const left = speciesById.get(row.species_a_id);
    const right = speciesById.get(row.species_b_id);
    const pairKey = [left?.catalog_key || row.species_a_id, right?.catalog_key || row.species_b_id].sort().join('__');
    return {
      id: `compat-pair:${row.id}`,
      authority: 'compatibility', domain: 'compatibility_pair',
      eventType: 'pair_rule_revision', status: row.status,
      title: compatibilityTitle(row.status, 'Pair Rule'),
      detail: `${left?.name || left?.catalog_key || row.species_a_id} × ${right?.name || right?.catalog_key || row.species_b_id} · revision #${row.revision_number}`,
      resourceKey: pairKey, version: row.version, actor: row.reviewed_by || undefined,
      occurredAt: eventTime(row), sourceRef: `species_pair_compatibility_rule_revisions:${row.id}`,
      metadata: { revisionNumber: row.revision_number, baseVersion: row.base_rule_version },
    };
  });
  const events = [...publicationEvents, ...profileEvents, ...pairEvents]
    .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt))
    .slice(0, limit);
  const feed: ReleaseFeedDto = {
    events,
    sources: [
      {
        authority: 'product_care', availability: 'ready', coverage: publicationAuditReady ? 'revision_history' : 'current_only',
        label: 'Product / Care publication',
        detail: publicationAuditReady
          ? 'Append-only publication audit history：baseline / publish / archive，包含版本、时间与可用 actor。'
          : `content_publications 当前版本回退；完整 audit history ${publicationAuditFallbackReason === 'audit_migration_unapplied' ? 'migration 尚未应用' : '暂不可读取'}。`,
      },
      {
        authority: 'compatibility', availability: 'ready', coverage: 'revision_history',
        label: 'Compatibility revisions',
        detail: 'Profile / Pair Rule revision 状态、审核与 versioned publish 历史。',
      },
    ],
    capabilities: businessCapabilities.map(item => ({ ...item })),
    permissions: businessPermissions((request as any).authUser?.email),
  };
  return sendData(request, response, feed);
}));
