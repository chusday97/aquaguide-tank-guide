import { Router } from 'express';
import { isBusinessDatabaseConfigured } from '../config.js';
import { sendData } from '../http.js';
import { contentRouter } from './content.js';
import { aquariumsRouter } from './aquariums.js';
import { userRecordsRouter } from './user-records.js';
import { adminRouter } from './admin.js';
import { profileRouter } from './profile.js';
import { speciesAiRouter } from './species-ai.js';
import { feedbackRouter } from './feedback.js';
import { shareReportsRouter } from './share-reports.js';

export const v1Router = Router();

v1Router.get('/business-health', (request, response) => sendData(request, response, {
  ok: true,
  databaseConfigured: isBusinessDatabaseConfigured(),
  architecture: 'web-api-supabase',
}));

v1Router.use(contentRouter);
v1Router.use(profileRouter);
v1Router.use(aquariumsRouter);
v1Router.use(userRecordsRouter);
v1Router.use(speciesAiRouter);
v1Router.use(feedbackRouter);
v1Router.use(shareReportsRouter);
v1Router.use('/admin', adminRouter);
