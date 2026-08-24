import { Router } from 'express';
import {
  feedbackCreateSchema,
  feedbackStatusUpdateSchema,
  uuidSchema,
} from '../../../../packages/contracts/src/index.js';
import { camelize, throwDatabaseError } from '../data-utils.js';
import { FeedbackRateLimiter } from '../feedback-rate-limit.js';
import { ApiError, asyncRoute, sendData } from '../http.js';
import { getAdminSupabase } from '../supabase.js';
import { sendFeedbackEmail } from '../email/feedback-email.js';

const HOUR_MS = 60 * 60 * 1000;
const MAX_SUBMISSIONS_PER_HOUR = 5;
const feedbackRateLimiter = new FeedbackRateLimiter({
  windowMs: HOUR_MS,
  maxSubmissions: MAX_SUBMISSIONS_PER_HOUR,
  maxKeys: 10_000,
});

const checkSubmissionRate = (key: string) => {
  if (!feedbackRateLimiter.check(key)) {
    throw new ApiError(429, 'RATE_LIMITED', '提交次数较多，请稍后再试。');
  }
};

const optionalUserId = async (authorization?: string) => {
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) return undefined;
  const client = getAdminSupabase();
  const { data, error } = await client.auth.getUser(match[1].trim());
  if (error || !data.user) throw new ApiError(401, 'AUTH_REQUIRED', '登录状态已失效，请重新登录。');
  return data.user.id;
};

export const feedbackRouter = Router();

feedbackRouter.post('/feedback', asyncRoute(async (request, response) => {
  const parsed = feedbackCreateSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', '请检查反馈内容。', parsed.error.flatten());
  }
  const userId = await optionalUserId(request.header('authorization'));
  checkSubmissionRate(userId || request.ip || 'anonymous');
  const client = getAdminSupabase();
  const { data, error } = await client
    .from('feedback_submissions')
    .insert({
      owner_id: userId || null,
      category: parsed.data.category,
      message: parsed.data.message,
      page_path: parsed.data.pagePath,
      locale: parsed.data.locale,
      app_version: parsed.data.appVersion,
      device_layout: parsed.data.deviceLayout,
    })
    .select('id,status,created_at')
    .single();
  if (error || !data) throwDatabaseError(error, '反馈暂时没有提交成功，请稍后重试。');
  const delivery = await sendFeedbackEmail({
    feedbackId: data.id,
    category: parsed.data.category,
    message: parsed.data.message,
    pagePath: parsed.data.pagePath,
    locale: parsed.data.locale,
    appVersion: parsed.data.appVersion,
    deviceLayout: parsed.data.deviceLayout,
  });
  const deliveryUpdate = delivery.status === 'sent'
    ? { email_delivery_status: 'sent', email_delivery_id: delivery.deliveryId, email_delivery_error: null, emailed_at: delivery.emailedAt }
    : delivery.status === 'failed'
      ? { email_delivery_status: 'failed', email_delivery_error: delivery.error, emailed_at: null }
      : { email_delivery_status: 'not_configured', email_delivery_error: null, emailed_at: null };
  const { data: updated, error: updateError } = await client
    .from('feedback_submissions')
    .update(deliveryUpdate)
    .eq('id', data.id)
    .select('id,status,created_at,email_delivery_status')
    .single();
  if (updateError || !updated) {
    return sendData(request, response, camelize({ ...data, email_delivery_status: delivery.status }), 201);
  }
  return sendData(request, response, camelize(updated), 201);
}));

export const adminFeedbackRouter = Router();

adminFeedbackRouter.get('/feedback', asyncRoute(async (request, response) => {
  const limit = Math.min(100, Math.max(1, Number(request.query.limit) || 30));
  const status = typeof request.query.status === 'string' ? request.query.status : undefined;
  const cursor = typeof request.query.cursor === 'string' ? request.query.cursor : undefined;
  if (status && !['new', 'reviewed', 'closed'].includes(status)) {
    throw new ApiError(400, 'VALIDATION_ERROR', '反馈状态无效。');
  }
  let query = getAdminSupabase()
    .from('feedback_submissions')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit + 1);
  if (status) query = query.eq('status', status);
  if (cursor) query = query.lt('created_at', cursor);
  const { data, error } = await query;
  if (error) throwDatabaseError(error, '反馈列表暂时无法加载。');
  const records = data || [];
  const hasMore = records.length > limit;
  const items = records.slice(0, limit);
  return sendData(request, response, {
    items: camelize(items),
    nextCursor: hasMore ? items.at(-1)?.created_at : undefined,
  });
}));

adminFeedbackRouter.patch('/feedback/:id/status', asyncRoute(async (request, response) => {
  const id = uuidSchema.safeParse(request.params.id);
  const parsed = feedbackStatusUpdateSchema.safeParse(request.body);
  if (!id.success || !parsed.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', '反馈状态更新无效。');
  }
  const client = getAdminSupabase();
  const { data: current, error: currentError } = await client
    .from('feedback_submissions')
    .select('id,version')
    .eq('id', id.data)
    .is('deleted_at', null)
    .maybeSingle();
  if (currentError) throwDatabaseError(currentError, '暂时无法读取反馈。');
  if (!current) throw new ApiError(404, 'NOT_FOUND', '没有找到这条反馈。');
  const { data, error } = await client
    .from('feedback_submissions')
    .update({ status: parsed.data.status })
    .eq('id', id.data)
    .eq('version', current.version)
    .select('*')
    .maybeSingle();
  if (error) throwDatabaseError(error, '反馈状态没有更新成功。');
  if (!data) throw new ApiError(409, 'VERSION_CONFLICT', '反馈状态已在其他位置更新，请刷新后重试。');
  return sendData(request, response, camelize(data));
}));
