const AQUAGUIDE_VERCEL_API_ORIGIN = 'https://aqua-tank-guide.vercel.app';
const AQUAGUIDE_CUSTOM_PRODUCTION_HOST = 'aquaguide.chusday.dpdns.org';

type ApiOriginContext = {
  explicitBaseUrl?: string;
  hostname?: string;
};

const runtimeApiBaseUrl = () => {
  const env = (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env;
  return env?.VITE_API_BASE_URL?.trim() || '';
};

const runtimeHostname = () => (
  typeof window !== 'undefined' ? window.location.hostname : ''
);

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');

export const resolveApiBaseUrl = (context: ApiOriginContext = {}) => {
  const explicitBaseUrl = normalizeBaseUrl(context.explicitBaseUrl ?? runtimeApiBaseUrl());
  if (explicitBaseUrl) return explicitBaseUrl;

  const hostname = context.hostname ?? runtimeHostname();
  if (hostname === AQUAGUIDE_CUSTOM_PRODUCTION_HOST) return AQUAGUIDE_VERCEL_API_ORIGIN;

  return '';
};

export const resolveApiV1Url = (path: string, context: ApiOriginContext = {}) => {
  const normalizedPath = path.startsWith('/api/v1')
    ? path
    : '/api/v1' + (path.startsWith('/') ? path : '/' + path);

  if (normalizedPath === '/api/v1/local-admin' || normalizedPath.startsWith('/api/v1/local-admin/')) {
    return normalizedPath;
  }

  const baseUrl = resolveApiBaseUrl(context);
  return baseUrl ? baseUrl + normalizedPath : normalizedPath;
};
