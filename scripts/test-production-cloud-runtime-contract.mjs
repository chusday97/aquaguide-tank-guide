import fs from 'node:fs';

const adapterPath = 'api/v1/[...path].ts';
const adapter = fs.readFileSync(adapterPath, 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');
const apiConfig = fs.readFileSync('apps/api/src/config.ts', 'utf8');
const apiApp = fs.readFileSync('apps/api/src/app.ts', 'utf8');

const requireMarker = (source, marker, message) => {
  if (!source.includes(marker)) throw new Error(message || `Missing marker: ${marker}`);
};

requireMarker(adapter, "import { createApiApp } from '../../apps/api/src/app';", 'Vercel V1 catch-all must reuse the canonical Express API app.');
requireMarker(adapter, 'export default app;', 'Vercel V1 catch-all must default-export the Express app.');
if (/\.listen\s*\(/.test(adapter)) {
  throw new Error('Vercel adapter must not start its own listener.');
}

requireMarker(apiApp, "legacyApp.use('/api/v1', requestIdMiddleware, v1Router, notFoundHandler);", 'Canonical API app must mount the V1 router under /api/v1.');

for (const key of [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SHARE_TOKEN_SECRET',
  'WEB_BASE_URL',
]) {
  requireMarker(envExample, `${key}=`, `.env.example must document ${key}.`);
}

if (/VITE_SUPABASE_SERVICE_ROLE_KEY/.test(envExample)) {
  throw new Error('Service-role credentials must never be exposed through a VITE_* variable.');
}

requireMarker(apiConfig, "process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL", 'Backend must resolve the Supabase project URL.');
requireMarker(apiConfig, "process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY", 'Backend must resolve the Supabase anon key.');
requireMarker(apiConfig, "process.env.SUPABASE_SERVICE_ROLE_KEY", 'Backend must keep service-role access server-side.');

console.log('Production Cloud Runtime contract passed: full /api/v1 Vercel adapter + canonical Express app + documented public/server Supabase env boundary.');
