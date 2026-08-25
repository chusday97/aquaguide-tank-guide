import fs from 'node:fs';

const adapterPath = 'api/v1/[...path].ts';
const adapter = fs.readFileSync(adapterPath, 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');
const apiApp = fs.readFileSync('apps/api/src/app.ts', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

const requireMarker = (source, marker, message) => {
  if (!source.includes(marker)) throw new Error(message || `Missing marker: ${marker}`);
};

requireMarker(adapter, "import { createApiApp } from '../../apps/api/src/app.js';", 'Vercel V1 catch-all must reuse the canonical Express API app.');
requireMarker(adapter, 'export default app;', 'Vercel V1 catch-all must default-export the Express app.');
if (/\.listen\s*\(/.test(adapter)) throw new Error('Vercel adapter must not start its own listener.');
requireMarker(apiApp, "app.use('/api/v1', requestIdMiddleware, v1Router, notFoundHandler);", 'Canonical API app must mount the V1 router under /api/v1.');
requireMarker(apiApp, "app.post(['/api/ai/chat', '/api/v1/ai/chat']", 'Canonical API app must preserve both AI chat compatibility paths.');
requireMarker(apiApp, 'text: { configured: textConfigured', 'Health must expose structured text capability status.');
requireMarker(apiApp, "mode: visionConfigured ? 'model' : 'manual_confirmation'", 'Health must expose structured vision capability status.');

const rewrites = Array.isArray(vercel.rewrites) ? vercel.rewrites : [];
const apiRootRewriteIndex = rewrites.findIndex(route => route?.source === '/api/v1' && route?.destination === '/api/v1/[...path]');
const apiRewriteIndex = rewrites.findIndex(route => route?.source === '/api/v1/:path*' && route?.destination === '/api/v1/[...path]');
const spaRewriteIndex = rewrites.findIndex(route => route?.source === '/(.*)' && route?.destination === '/index.html');
if (apiRootRewriteIndex < 0) throw new Error('vercel.json must route the /api/v1 namespace root to the V1 catch-all function.');
if (apiRewriteIndex < 0) throw new Error('vercel.json must route /api/v1/:path* to the V1 catch-all function.');
if (spaRewriteIndex < 0) throw new Error('vercel.json must retain the SPA deep-link fallback.');
if (apiRootRewriteIndex >= spaRewriteIndex) throw new Error('The /api/v1 root rewrite must precede the SPA catch-all.');
if (apiRewriteIndex >= spaRewriteIndex) throw new Error('The /api/v1 rewrite must precede the SPA catch-all.');

for (const key of [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SHARE_TOKEN_SECRET',
  'WEB_BASE_URL',
]) requireMarker(envExample, `${key}=`, `.env.example must document ${key}.`);

if (/VITE_SUPABASE_SERVICE_ROLE_KEY/.test(envExample)) throw new Error('Service-role credentials must never use a VITE_* variable.');

console.log('Production Cloud Runtime contract passed: V1 routing precedes SPA fallback, canonical Express app is reused, and public/server env boundaries are documented.');
