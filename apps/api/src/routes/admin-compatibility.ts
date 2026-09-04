import { Router } from 'express';
import {
  compatibilityProfileRevisionInputSchema,
  compatibilityProfileRevisionStatusMutationSchema,
  compatibilityProfileRevisionUpdateSchema,
  uuidSchema,
} from '../../../../packages/contracts/src/index';
import type { AuthenticatedRequest } from '../auth';
import {
  beginIdempotentWrite,
  camelize,
  finishIdempotentWrite,
  snakeize,
  throwDatabaseError,
} from '../data-utils';
import { ApiError, asyncRoute, sendData } from '../http';
import { getAdminSupabase } from '../supabase';

const activeRevisionStatuses = ['draft', 'pending_review', 'approved'];
const reviewedCitationsOnly = (citations: Array<{ reviewStatus: string }>) => (
  citations.length > 0 && citations.every(source => source.reviewStatus === 'reviewed')
);

const parseRevisionId = (value: string) => {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', 'Compatibility revision 标识无效。');
  return parsed.data;
};

const loadRevision = async (id: string) => {
  const client = getAdminSupabase();
  const { data, error } = await client
    .from('species_compatibility_profile_revisions')
    .select('*,species!inner(catalog_key,name,scientific_name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throwDatabaseError(error, 'Compatibility revision 暂时无法读取。');
  if (!data) throw new ApiError(404, 'NOT_FOUND', '没有找到 Compatibility revision。');
  return data;
};

export const adminCompatibilityRouter = Router();

adminCompatibilityRouter.get('/profile-revisions', asyncRoute(async (request, response) => {
  const client = getAdminSupabase();
  const [revisionResult, baselineResult] = await Promise.all([
    client.from('species_compatibility_profile_revisions')
      .select('*,species!inner(catalog_key,name,scientific_name)')
      .order('updated_at', { ascending: false })
      .limit(100),
    client.from('species_compatibility_profiles')
      .select('species!inner(catalog_key)')
      .eq('review_status', 'reviewed')
      .is('deleted_at', null),
  ]);
  if (revisionResult.error) throwDatabaseError(revisionResult.error, 'Compatibility Draft revisions 暂时无法加载。');
  if (baselineResult.error) throwDatabaseError(baselineResult.error, 'Compatibility reviewed DB baseline 暂时无法核对。');
  const writableCatalogKeys = (baselineResult.data || []).map(row => (row.species as unknown as { catalog_key: string }).catalog_key);
  return sendData(request, response, { revisions: camelize(revisionResult.data || []), writableCatalogKeys });
}));

adminCompatibilityRouter.post('/profile-revisions', asyncRoute(async (request, response) => {
  const parsed = compatibilityProfileRevisionInputSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', 'Compatibility Profile Draft 无效。', parsed.error.flatten());
  if (!reviewedCitationsOnly(parsed.data.citations)) {
    throw new ApiError(400, 'VALIDATION_ERROR', '第一轮 Compatibility Draft 只能继承已审核证据。');
  }
  const idempotency = await beginIdempotentWrite(request);
  if (idempotency.replay?.resourceId) {
    const replay = await loadRevision(idempotency.replay.resourceId);
    return sendData(request, response, camelize(replay), idempotency.replay.responseStatus);
  }

  const client = getAdminSupabase();
  const { data: species, error: speciesError } = await client
    .from('species')
    .select('id,catalog_key,name,scientific_name')
    .eq('catalog_key', parsed.data.catalogKey)
    .is('deleted_at', null)
    .maybeSingle();
  if (speciesError) throwDatabaseError(speciesError, '暂时无法解析物种身份。');
  if (!species) throw new ApiError(404, 'NOT_FOUND', '没有找到对应的 Product species。');

  const { data: baseline, error: baselineError } = await client
    .from('species_compatibility_profiles')
    .select('id,version,review_status')
    .eq('species_id', species.id)
    .eq('review_status', 'reviewed')
    .is('deleted_at', null)
    .maybeSingle();
  if (baselineError) throwDatabaseError(baselineError, '暂时无法读取 reviewed Compatibility Profile。');
  if (!baseline) {
    throw new ApiError(409, 'MIGRATION_REJECTED', '当前物种尚无 reviewed Compatibility Profile，不能直接创建 revision。');
  }

  const { data: active, error: activeError } = await client
    .from('species_compatibility_profile_revisions')
    .select('id,status,version')
    .eq('species_id', species.id)
    .in('status', activeRevisionStatuses)
    .maybeSingle();
  if (activeError) throwDatabaseError(activeError, '暂时无法核对现有 Compatibility Draft。');
  if (active) throw new ApiError(409, 'DUPLICATE_RESOURCE', '这个物种已经有进行中的 Compatibility revision。', { revisionId: active.id, status: active.status });

  const { data: latest, error: latestError } = await client
    .from('species_compatibility_profile_revisions')
    .select('revision_number')
    .eq('species_id', species.id)
    .order('revision_number', { ascending: false })
    .limit(1);
  if (latestError) throwDatabaseError(latestError, '暂时无法计算 Compatibility revision 版本。');
  const revisionNumber = Number(latest?.[0]?.revision_number || 0) + 1;

  const actor = (request as AuthenticatedRequest).authUser.id;
  const { catalogKey: _catalogKey, citations, ...draft } = parsed.data;
  const { data, error } = await client
    .from('species_compatibility_profile_revisions')
    .insert({
      species_id: species.id,
      revision_number: revisionNumber,
      base_profile_version: baseline.version,
      ...snakeize(draft),
      citation_snapshots: citations,
      status: 'draft',
      created_by: actor,
    })
    .select('*,species!inner(catalog_key,name,scientific_name)')
    .single();
  if (error || !data) throwDatabaseError(error, 'Compatibility Profile Draft 没有保存成功。');
  await finishIdempotentWrite(request, idempotency, 'compatibility_profile_revision', data.id, 201);
  return sendData(request, response, camelize(data), 201);
}));

adminCompatibilityRouter.patch('/profile-revisions/:id', asyncRoute(async (request, response) => {
  const id = parseRevisionId(request.params.id);
  const parsed = compatibilityProfileRevisionUpdateSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', 'Compatibility Profile Draft 更新无效。', parsed.error.flatten());
  if (parsed.data.citations && !reviewedCitationsOnly(parsed.data.citations)) {
    throw new ApiError(400, 'VALIDATION_ERROR', '第一轮 Compatibility Draft 只能继承已审核证据。');
  }

  const current = await loadRevision(id);
  if (current.status !== 'draft') {
    throw new ApiError(409, 'VERSION_CONFLICT', '只有 Draft Compatibility revision 可以继续编辑。', { status: current.status });
  }
  if (current.version !== parsed.data.version) {
    throw new ApiError(409, 'VERSION_CONFLICT', '这条 Compatibility Draft 已在其他位置更新。', { currentVersion: current.version });
  }

  const { version, citations, ...updates } = parsed.data;
  const client = getAdminSupabase();
  const payload = {
    ...snakeize(updates),
    ...(citations ? { citation_snapshots: citations } : {}),
  };
  const { data, error } = await client
    .from('species_compatibility_profile_revisions')
    .update(payload)
    .eq('id', id)
    .eq('version', version)
    .eq('status', 'draft')
    .select('*,species!inner(catalog_key,name,scientific_name)')
    .maybeSingle();
  if (error) throwDatabaseError(error, 'Compatibility Profile Draft 没有更新成功。');
  if (!data) throw new ApiError(409, 'VERSION_CONFLICT', 'Compatibility Draft 已发生变化，请刷新后重试。');
  return sendData(request, response, camelize(data));
}));

adminCompatibilityRouter.post('/profile-revisions/:id/submit', asyncRoute(async (request, response) => {
  const id = parseRevisionId(request.params.id);
  const parsed = compatibilityProfileRevisionStatusMutationSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', 'Compatibility revision 版本无效。');
  const current = await loadRevision(id);
  if (current.status !== 'draft') {
    throw new ApiError(409, 'VERSION_CONFLICT', '只有 Draft Compatibility revision 可以提交审核。', { status: current.status });
  }
  if (current.version !== parsed.data.version) {
    throw new ApiError(409, 'VERSION_CONFLICT', '这条 Compatibility Draft 已在其他位置更新。', { currentVersion: current.version });
  }
  const citations = Array.isArray(current.citation_snapshots) ? current.citation_snapshots : [];
  if (!reviewedCitationsOnly(citations)) {
    throw new ApiError(409, 'MIGRATION_REJECTED', '提交审核前必须保留至少一项 reviewed evidence。');
  }

  const client = getAdminSupabase();
  const { data, error } = await client
    .from('species_compatibility_profile_revisions')
    .update({ status: 'pending_review' })
    .eq('id', id)
    .eq('version', parsed.data.version)
    .eq('status', 'draft')
    .select('*,species!inner(catalog_key,name,scientific_name)')
    .maybeSingle();
  if (error) throwDatabaseError(error, 'Compatibility revision 没有成功提交审核。');
  if (!data) throw new ApiError(409, 'VERSION_CONFLICT', 'Compatibility Draft 已发生变化，请刷新后重试。');
  return sendData(request, response, camelize(data));
}));
