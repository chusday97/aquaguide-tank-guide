import { createApiApp } from './app.js';
import { apiConfig } from './config.js';

const app = createApiApp();

app.listen(apiConfig.port, () => {
  console.log(`AquaGuide API server running at http://localhost:${apiConfig.port}`);
});
