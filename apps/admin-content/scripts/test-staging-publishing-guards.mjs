import assert from 'node:assert/strict';
import { extractSupabaseProjectRef, parseStagingCatalogKeys, validateServerSupabaseKey, validateStagingSiteUrl, validateStagingSupabaseConfig } from './staging-publishing-config.mjs';

const serviceRoleJwt = `x.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.x`;
const anonJwt = `x.${Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url')}.x`;

assert.equal(extractSupabaseProjectRef('https://stagingref.supabase.co'), 'stagingref');
assert.throws(() => extractSupabaseProjectRef('http://127.0.0.1:54321'), /hosted \*\.supabase\.co/);
assert.equal(validateServerSupabaseKey('sb_secret_test'), 'sb_secret_test');
assert.equal(validateServerSupabaseKey(serviceRoleJwt), serviceRoleJwt);
assert.throws(() => validateServerSupabaseKey('sb_publishable_test'), /secret key or legacy service_role/);
assert.throws(() => validateServerSupabaseKey(anonJwt), /secret key or legacy service_role/);
assert.deepEqual(parseStagingCatalogKeys('sp_0030, sp_0031,sp_0030'), ['sp_0030', 'sp_0031']);
assert.throws(() => parseStagingCatalogKeys(''), /explicit Species allowlist/);
assert.throws(() => parseStagingCatalogKeys('angelfish'), /Invalid staging catalog key/);
assert.throws(() => parseStagingCatalogKeys(Array.from({ length: 21 }, (_, index) => `sp_${String(index).padStart(4, '0')}`)), /at most 20/);

const valid = validateStagingSupabaseConfig({
  supabaseUrl: 'https://stagingref.supabase.co',
  secretKey: 'sb_secret_test',
  expectedProjectRef: 'stagingref',
  productionProjectRef: 'productionref',
});
assert.equal(valid.actualProjectRef, 'stagingref');

assert.throws(() => validateStagingSupabaseConfig({
  supabaseUrl: 'https://productionref.supabase.co',
  secretKey: 'sb_secret_test',
  expectedProjectRef: 'productionref',
  productionProjectRef: 'productionref',
}), /Production Supabase project/);

assert.throws(() => validateStagingSupabaseConfig({
  supabaseUrl: 'https://stagingref.supabase.co',
  secretKey: 'sb_secret_test',
  expectedProjectRef: 'wrongref',
  productionProjectRef: 'productionref',
}), /project ref mismatch/);

assert.throws(() => validateStagingSupabaseConfig({
  supabaseUrl: 'https://stagingref.supabase.co',
  secretKey: 'sb_publishable_test',
  expectedProjectRef: 'stagingref',
  productionProjectRef: 'productionref',
}), /secret key or legacy service_role/);

assert.equal(validateStagingSiteUrl('https://admin-content-preview.example.com/', 'https://aqua-tank-guide.vercel.app'), 'https://admin-content-preview.example.com');
assert.throws(() => validateStagingSiteUrl('https://aqua-tank-guide.vercel.app', 'https://aqua-tank-guide.vercel.app'), /Production public site/);
assert.throws(() => validateStagingSiteUrl('http://preview.example.com', 'https://aqua-tank-guide.vercel.app'), /must use HTTPS/);
assert.throws(() => validateStagingSiteUrl('', 'https://aqua-tank-guide.vercel.app'), /required/);
assert.throws(() => validateStagingSiteUrl('https://preview.example.com', ''), /PRODUCTION_PUBLIC_SITE_URL/);

console.log('Staging publishing guards verified: server-only Supabase key, explicit staging DB/site identity, Production deny-list enforced');
