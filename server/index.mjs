import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './api-app.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || process.env.API_PORT || 8787);
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use((await import('express')).default.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  app.listen(port, () => {
    console.log(`AquaGuide API server running at http://localhost:${port}`);
  });
}

export default app;
