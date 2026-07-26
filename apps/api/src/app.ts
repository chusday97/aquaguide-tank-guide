import legacyApp from '../../../server/index.mjs';
import { apiErrorHandler, notFoundHandler, requestIdMiddleware } from './http';
import { v1Router } from './routes/index';

let configured = false;

export const createApiApp = () => {
  if (!configured) {
    const trustProxyHops = Math.max(0, Number.parseInt(process.env.TRUST_PROXY_HOPS || '1', 10) || 0);
    legacyApp.set('trust proxy', trustProxyHops);
    legacyApp.use('/api/v1', requestIdMiddleware, v1Router, notFoundHandler);
    legacyApp.use(apiErrorHandler);
    configured = true;
  }
  return legacyApp;
};
