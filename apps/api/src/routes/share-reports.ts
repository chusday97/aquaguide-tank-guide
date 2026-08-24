import { createHash, createHmac } from 'node:crypto';
import { Router } from 'express';
import {
  aquariumShareReportCreateSchema,
  sanitizedAquariumReportSchema,
  uuidSchema,
} from '../../../../packages/contracts/src/index.js';
import { requireAuth } from '../auth.js';
import { apiConfig } from '../config.js';
import {
  authenticatedRequest,
  camelize,
  deterministicUuid,
  requireIdempotencyKey,
  throwDatabaseError,
  userClientFor,
} from '../data-utils.js';
import { ApiError, asyncRoute, sendData } from '../http.js';
import { getAdminSupabase } from '../supabase.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export const hashShareToken = (token: string) => createHash('sha256').update(token).digest('hex');

const createShareToken = (ownerId: string, aquariumId: string, idempotencyKey: string) => {
  const secret = apiConfig.shareTokenSecret;
  if (!secret) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '分享服务尚未配置。');
  return createHmac('sha256', secret)
    .update(`${ownerId}:${aquariumId}:${idempotencyKey}`)
    .digest('base64url');
};

const publicReportUrl = (token: string, requestOrigin?: string) => {
  const base = apiConfig.webBaseUrl || requestOrigin || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/report/${token}`;
};

export const shareReportsRouter = Router();

shareReportsRouter.post('/aquariums/:id/share-reports', requireAuth, asyncRoute(async (request, response) => {
  const parsed = aquariumShareReportCreateSchema.safeParse({
    aquariumId: request.params.id,
    snapshot: request.body?.snapshot,
  });
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '分享报告内容无效。', parsed.error.flatten());

  const idempotencyKey = requireIdempotencyKey(request);
  const ownerId = authenticatedRequest(request).authUser.id;
  const client = userClientFor(request);
  const { data: aquarium, error: aquariumError } = await client
    .from('aquariums')
    .select('id')
    .eq('id', parsed.data.aquariumId)
    .is('deleted_at', null)
    .maybeSingle();
  if (aquariumError) throwDatabaseError(aquariumError, '暂时无法核对鱼缸。');
  if (!aquarium) throw new ApiError(404, 'NOT_FOUND', '没有找到这个鱼缸。');

  const generatedAt = new Date();
  const expiresAt = new Date(generatedAt.getTime() + SEVEN_DAYS_MS);
  const token = createShareToken(ownerId, aquarium.id, idempotencyKey);
  const tokenHash = hashShareToken(token);
  const reportId = deterministicUuid(`${ownerId}:share-report:${idempotencyKey}`);
  const snapshot = sanitizedAquariumReportSchema.parse({
    ...parsed.data.snapshot,
    snapshotVersion: 1,
    generatedAt: generatedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });

  const adminClient = getAdminSupabase();
  const { data, error } = await adminClient
    .from('aquarium_share_reports')
    .upsert({
      id: reportId,
      owner_id: ownerId,
      aquarium_id: aquarium.id,
      snapshot_version: 1,
      snapshot,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    }, { onConflict: 'id', ignoreDuplicates: true })
    .select('id,aquarium_id,snapshot_version,created_at,expires_at,revoked_at')
    .maybeSingle();
  if (error) throwDatabaseError(error, '分享报告暂时没有生成成功。');

  const record = data || (await adminClient
    .from('aquarium_share_reports')
    .select('id,aquarium_id,snapshot_version,created_at,expires_at,revoked_at')
    .eq('id', reportId)
    .eq('owner_id', ownerId)
    .maybeSingle()).data;
  if (!record) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '暂时无法读取已生成的分享报告。');

  return sendData(request, response, {
    ...camelize<Record<string, unknown>>(record),
    shareUrl: publicReportUrl(token, request.header('origin')),
  }, data ? 201 : 200);
}));

shareReportsRouter.get('/share-reports', requireAuth, asyncRoute(async (request, response) => {
  const client = userClientFor(request);
  const { data, error } = await client
    .from('aquarium_share_reports')
    .select('id,aquarium_id,snapshot_version,created_at,expires_at,revoked_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throwDatabaseError(error, '分享报告列表暂时无法加载。');
  return sendData(request, response, { items: camelize(data || []) });
}));

shareReportsRouter.delete('/share-reports/:id', requireAuth, asyncRoute(async (request, response) => {
  const id = uuidSchema.safeParse(request.params.id);
  if (!id.success) throw new ApiError(400, 'VALIDATION_ERROR', '分享报告 ID 无效。');
  requireIdempotencyKey(request);
  const ownerId = authenticatedRequest(request).authUser.id;
  const client = getAdminSupabase();
  const { data, error } = await client
    .from('aquarium_share_reports')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id.data)
    .eq('owner_id', ownerId)
    .is('deleted_at', null)
    .is('revoked_at', null)
    .select('id,revoked_at')
    .maybeSingle();
  if (error) throwDatabaseError(error, '分享报告暂时无法撤销。');
  if (!data) {
    const { data: existing } = await client
      .from('aquarium_share_reports')
      .select('id,revoked_at')
      .eq('id', id.data)
      .eq('owner_id', ownerId)
      .is('deleted_at', null)
      .maybeSingle();
    if (!existing) throw new ApiError(404, 'NOT_FOUND', '没有找到这条分享报告。');
    return sendData(request, response, camelize(existing));
  }
  return sendData(request, response, camelize(data));
}));

shareReportsRouter.get('/public/share-reports/:token', asyncRoute(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store, private, max-age=0');
  response.setHeader('Pragma', 'no-cache');
  const token = request.params.token;
  if (!TOKEN_PATTERN.test(token)) throw new ApiError(404, 'NOT_FOUND', '分享链接无效。');
  const { data, error } = await getAdminSupabase()
    .from('aquarium_share_reports')
    .select('snapshot,expires_at,revoked_at,deleted_at')
    .eq('token_hash', hashShareToken(token))
    .maybeSingle();
  if (error) throwDatabaseError(error, '分享报告暂时无法加载。');
  if (!data || data.deleted_at) throw new ApiError(404, 'NOT_FOUND', '分享链接无效。');
  if (data.revoked_at) throw new ApiError(404, 'NOT_FOUND', '分享链接已撤销。');
  if (new Date(data.expires_at).getTime() <= Date.now()) throw new ApiError(404, 'NOT_FOUND', '分享链接已过期。');
  const snapshot = sanitizedAquariumReportSchema.safeParse(data.snapshot);
  if (!snapshot.success) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '分享报告数据暂时无法读取。');
  return sendData(request, response, snapshot.data);
}));
