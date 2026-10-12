import { Router } from 'express';
import { compatibilityAiReasoningRequestSchema } from '../../../../packages/contracts/src/index';
import { requestCompatibilityReasoning, ProviderError } from '../ai/provider';
import { apiConfig } from '../config';
import { ApiError, asyncRoute, sendData } from '../http';

const rateBuckets = new Map<string, { startedAt: number; count: number }>();

const checkRateLimit = (ip?: string) => {
  const key = ip || 'unknown';
  const now = Date.now();
  if (rateBuckets.size > 500) {
    for (const [bucketKey, bucket] of rateBuckets) {
      if (now - bucket.startedAt >= 60_000) rateBuckets.delete(bucketKey);
    }
  }
  const current = rateBuckets.get(key);
  if (!current || now - current.startedAt >= 60_000) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return;
  }
  if (current.count >= 20) throw new ApiError(429, 'RATE_LIMITED', '兼容性 AI 请求过于频繁，请稍后再试。');
  current.count += 1;
};

const providerApiError = (error: ProviderError) => (
  error.reason === 'timeout'
    ? new ApiError(504, 'DEPENDENCY_UNAVAILABLE', '兼容性 AI 响应超时。')
    : new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '兼容性 AI 暂时不可用。')
);

export const compatibilityAiRouter = Router();

compatibilityAiRouter.post('/ai/compatibility-reason', asyncRoute(async (request, response) => {
  checkRateLimit(request.ip);
  const parsed = compatibilityAiReasoningRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', '兼容性 AI 输入无效。', parsed.error.flatten());
  }

  try {
    const runtimeOidcToken = apiConfig.aiFallbackUseVercelOidc
      ? request.header('x-vercel-oidc-token') || undefined
      : undefined;
    const { payload, modelName } = await requestCompatibilityReasoning(parsed.data, {
      fallbackApiKey: runtimeOidcToken,
    });
    return sendData(request, response, {
      ...payload,
      provenance: {
        mode: 'ai_assisted' as const,
        model: modelName,
        authorityVersion: parsed.data.authorityVersion,
        speciesIds: parsed.data.species.map(item => item.speciesId),
      },
    });
  } catch (error) {
    if (error instanceof ProviderError) {
      console.warn('Compatibility AI provider failure', {
        requestId: request.requestId,
        reason: error.reason,
        statusCode: error.statusCode,
        model: apiConfig.aiModel,
      });
      throw providerApiError(error);
    }
    throw error;
  }
}));
