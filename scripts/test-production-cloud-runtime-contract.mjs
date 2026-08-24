import fs from 'node:fs';

const adapterPath = 'api/v1/[...path].ts';
const adapter = fs.readFileSync(adapterPath, 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');
const apiConfig = fs.readFileSync('apps/api/src/config.ts', 'utf8');
const apiApp = fs.readFileSync('apps/api/src/app.ts', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

const requireMarker = (source, marker, message) => {
  if (!source.includes(marker)) throw new Error(message || `Missing marker: ${marker}`);
};

requireMarker(adapter, "import { createApiApp } from '../../apps/api/src/app.js';", 'Vercel V1 catch-all must reuse the canonical Express API app through an ESM-safe runtime specifier.');
requireMarker(adapter, 'export default app;', 'Vercel V1 catch-all must default-export the Express app.');
if (/\.listen\s*\(/.test(adapter)) {
  throw new Error('Vercel adapter must not start its own listener.');
}

requireMarker(apiApp, "app.use('/api/v1', requestIdMiddleware, v1Router, notFoundHandler);", 'Canonical API app must mount the V1 router under /api/v1.');

const rewrites = Array.isArray(vercel.rewrites) ? vercel.rewrites : [];
const apiRewriteIndex = rewrites.findIndex(route => route?.source === '/api/v1/:path*' && route?.destination === '/api/v1/[...path]');
const spaRewriteIndex = rewrites.findIndex(route => route?.source === '/(.*)' && route?.destination === '/index.html');
if (apiRewriteIndex < 0) throw new Error('vercel.json must explicitly route /api/v1/:path* to the V1 catch-all function.');
if (spaRewriteIndex < 0) throw new Error('vercel.json must retain the SPA deep-link fallback.');
if (apiRewriteIndex >= spaRewriteIndex) throw new Error('The /api/v1 rewrite must appear before the SPA catch-all so API requests cannot be rewritten to index.html.');

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

console.log('Production Cloud Runtime contract passed: explicit V1 routing before SPA fallback + canonical Express app + documented public/server Supabase env boundary.');
