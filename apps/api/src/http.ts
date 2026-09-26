import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';
import type { ApiErrorCode, ApiFailure, ApiSuccess } from '../../../packages/contracts/src/index';

export type ApiRequest = Request & { requestId?: string };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}


const DEFAULT_CORS_ORIGINS = new Set([
  'https://aquaguide.chusday.dpdns.org',
  'https://aqua-tank-guide.vercel.app',
]);

const corsOrigins = () => {
  const configured = (process.env.API_CORS_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_CORS_ORIGINS, ...configured]);
};

const CORS_ALLOW_HEADERS = [
  'Accept',
  'Authorization',
  'Content-Type',
  'Idempotency-Key',
  'X-AquaGuide-Locale',
  'X-Request-Id',
].join(', ');

const CORS_ALLOW_METHODS = 'GET,HEAD,POST,PATCH,PUT,DELETE,OPTIONS';

export const businessCorsMiddleware: RequestHandler = (request, response, next) => {
  const origin = request.header('origin')?.trim();
  if (!origin) return next();

  if (!corsOrigins().has(origin)) {
    if (request.method === 'OPTIONS') return response.sendStatus(403);
    return next();
  }

  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Vary', 'Origin');
  response.setHeader('Access-Control-Allow-Methods', CORS_ALLOW_METHODS);
  response.setHeader('Access-Control-Allow-Headers', CORS_ALLOW_HEADERS);
  response.setHeader('Access-Control-Max-Age', '600');

  if (request.method === 'OPTIONS') return response.sendStatus(204);
  return next();
};

export const requestIdMiddleware: RequestHandler = (request, response, next) => {
  const requestId = request.header('x-request-id')?.trim() || randomUUID();
  (request as ApiRequest).requestId = requestId;
  response.setHeader('x-request-id', requestId);
  next();
};

export const sendData = <T>(request: ApiRequest, response: Response, data: T, status = 200) => {
  const payload: ApiSuccess<T> = { data, requestId: request.requestId || randomUUID() };
  return response.status(status).json(payload);
};

export const asyncRoute = (
  handler: (request: ApiRequest, response: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler => (request, response, next) => {
  Promise.resolve(handler(request as ApiRequest, response, next)).catch(next);
};

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new ApiError(404, 'NOT_FOUND', `没有找到接口 ${request.method} ${request.path}`));
};

export const apiErrorHandler = (
  error: unknown,
  request: ApiRequest,
  response: Response,
  _next: NextFunction,
) => {
  const bodyParserError = error && typeof error === 'object'
    ? error as { type?: string; status?: number }
    : undefined;
  const apiError = error instanceof ApiError
    ? error
    : bodyParserError?.type === 'entity.too.large' || bodyParserError?.status === 413
      ? new ApiError(413, 'PAYLOAD_TOO_LARGE', '图片不能超过 10MB。')
      : new ApiError(500, 'INTERNAL_ERROR', '服务暂时不可用，请稍后重试。');

  const payload: ApiFailure = {
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details === undefined ? {} : { details: apiError.details }),
    },
    requestId: request.requestId || randomUUID(),
  };

  return response.status(apiError.status).json(payload);
};
