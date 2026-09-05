import { getRepoBackendHealth, publishRepoStaging, repoBackendClient } from './repoBackendClient.js';

export const adminContentClient = repoBackendClient;
export const isRepoBackend = true;
export const isAdminBackendConfigured = true;
export { getRepoBackendHealth, publishRepoStaging };
