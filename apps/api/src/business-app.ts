import express from 'express';
import { apiErrorHandler, notFoundHandler, requestIdMiddleware } from './http';
import { v1Router } from './routes/index';

export const createBusinessApiApp = () => {
  const app = express();
  const trustProxyHops = Math.max(0, Number.parseInt(process.env.TRUST_PROXY_HOPS || '0', 10) || 0);
  app.set('trust proxy', trustProxyHops);
  app.use(express.json({ limit: '3mb' }));
  app.use('/api/v1', requestIdMiddleware, v1Router, notFoundHandler);
  app.use(apiErrorHandler);
  return app;
};
