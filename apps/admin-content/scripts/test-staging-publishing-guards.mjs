import assert from 'node:assert/strict';
import { extractSupabaseProjectRef, validateStagingSiteUrl, validateStagingSupabaseConfig } from './staging-publishing-config.mjs';

assert.equal(extractSupabaseProjectRef('https://stagingref.supabase.co'), 'stagingref');
assert.throws(() => extractSupabaseProjectRef('http://127.0.0.1:54321'), /hosted \*\.supabase\.co/);

const valid = validateStagingSupabaseConfig({
  supabaseUrl: 'https://stagingref.supabase.co',
  publishableKey: 'sb_publishable_test',
  expectedProjectRef: 'stagingref',
  productionProjectRef: 'productionref',
});
assert.equal(valid.actualProjectRef, 'stagingref');

assert.throws(() => validateStagingSupabaseConfig({
  supabaseUrl: 'https://productionref.supabase.co',
  publishableKey: 'sb_publishable_test',
  expectedProjectRef: 'productionref',
  productionProjectRef: 'productionref',
}), /Production Supabase project/);

assert.throws(() => validateStagingSupabaseConfig({
  supabaseUrl: 'https://stagingref.supabase.co',
  publishableKey: 'sb_publishable_test',
  expectedProjectRef: 'wrongref',
  productionProjectRef: 'productionref',
}), /project ref mismatch/);

assert.equal(validateStagingSiteUrl('https://admin-content-preview.example.com/', 'https://aqua-tank-guide.vercel.app'), 'https://admin-content-preview.example.com');
assert.throws(() => validateStagingSiteUrl('https://aqua-tank-guide.vercel.app', 'https://aqua-tank-guide.vercel.app'), /Production public site/);
assert.throws(() => validateStagingSiteUrl('http://preview.example.com', 'https://aqua-tank-guide.vercel.app'), /must use HTTPS/);
assert.throws(() => validateStagingSiteUrl('', 'https://aqua-tank-guide.vercel.app'), /required/);

assert.throws(() => validateStagingSiteUrl('https://preview.example.com', ''), /PRODUCTION_PUBLIC_SITE_URL/);

console.log('Staging publishing guards verified: explicit staging DB/site identity, Production deny-list enforced');
