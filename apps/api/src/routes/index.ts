import { Router } from 'express';
import { apiConfig, isBusinessDatabaseConfigured } from '../config';
import { sendData } from '../http';
import { contentRouter } from './content';
import { aquariumsRouter } from './aquariums';
import { userRecordsRouter } from './user-records';
import { adminRouter } from './admin';
import { profileRouter } from './profile';
import { speciesAiRouter } from './species-ai';
import { compatibilityAiRouter } from './compatibility-ai';
import { feedbackRouter } from './feedback';
import { shareReportsRouter } from './share-reports';
import { catalogRouter } from './catalog';

export const v1Router = Router();

v1Router.get('/business-health', (request, response) => {
  const runtimeOidcAvailable = apiConfig.aiFallbackUseVercelOidc
    && Boolean(request.header('x-vercel-oidc-token'));
  return sendData(request, response, {
    ok: true,
    databaseConfigured: isBusinessDatabaseConfigured(),
    architecture: 'web-api-supabase',
    compatibilityAi: {
      primaryModel: apiConfig.aiModel,
      primaryConfigured: Boolean(apiConfig.aiApiKey),
      fallbackModel: apiConfig.aiFallbackModel || null,
      fallbackConfigured: Boolean((apiConfig.aiFallbackApiKey || runtimeOidcAvailable) && apiConfig.aiFallbackModel),
      fallbackUsesVercelOidc: apiConfig.aiFallbackUseVercelOidc,
    },
  });
});

v1Router.use(contentRouter);
v1Router.use(catalogRouter);
v1Router.use(profileRouter);
v1Router.use(aquariumsRouter);
v1Router.use(userRecordsRouter);
v1Router.use(speciesAiRouter);
v1Router.use(compatibilityAiRouter);
v1Router.use(feedbackRouter);
v1Router.use(shareReportsRouter);
v1Router.use('/admin', adminRouter);
