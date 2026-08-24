import express from 'express';
import { apiConfig } from './config.js';
import { apiErrorHandler, notFoundHandler, requestIdMiddleware } from './http.js';
import { v1Router } from './routes/index.js';

const isConfiguredApiKey = (apiKey: string | undefined) => Boolean(
  apiKey
  && apiKey !== 'MY_DEEPSEEK_API_KEY'
  && apiKey !== 'MY_AI_API_KEY',
);

export const createApiApp = () => {
  const app = express();
  const trustProxyHops = Math.max(0, Number.parseInt(process.env.TRUST_PROXY_HOPS || '0', 10) || 0);
  app.set('trust proxy', trustProxyHops);

  app.use(express.json({ limit: '3mb' }));

  app.get(['/api/health', '/api/v1/health'], (_request, response) => {
    response.json({
      ok: true,
      provider: 'deepseek',
      aiProvider: 'deepseek',
      model: apiConfig.aiModel,
      configured: isConfiguredApiKey(process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY),
      timeoutMs: apiConfig.aiTimeoutMs,
    });
  });

  app.use('/api/v1', requestIdMiddleware, v1Router, notFoundHandler);
  app.use(apiErrorHandler);
  return app;
};
