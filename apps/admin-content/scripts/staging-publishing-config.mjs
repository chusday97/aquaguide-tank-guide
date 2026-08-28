const PRODUCTION_SITE_HOSTS = new Set(['aqua-tank-guide.vercel.app']);

export function extractSupabaseProjectRef(value) {
  if (!value) throw new Error('STAGING_SUPABASE_URL is required.');
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('STAGING_SUPABASE_URL must be a valid URL.'); }
  const match = parsed.hostname.match(/^([a-z0-9]+)\.supabase\.co$/i);
  if (!match) throw new Error('Staging Supabase must use a hosted *.supabase.co project URL.');
  return match[1];
}

export function validateStagingSupabaseConfig({ supabaseUrl, publishableKey, expectedProjectRef, productionProjectRef }) {
  if (!publishableKey) throw new Error('STAGING_SUPABASE_PUBLISHABLE_KEY is required.');
  if (!expectedProjectRef) throw new Error('STAGING_SUPABASE_PROJECT_REF is required.');
  if (!productionProjectRef) throw new Error('PRODUCTION_SUPABASE_PROJECT_REF is required for the production deny-list.');
  const actualProjectRef = extractSupabaseProjectRef(supabaseUrl);
  if (actualProjectRef !== expectedProjectRef) throw new Error(`Staging project ref mismatch: expected ${expectedProjectRef}, got ${actualProjectRef}.`);
  if (actualProjectRef === productionProjectRef) throw new Error('Refusing to use the Production Supabase project as staging.');
  return { supabaseUrl: supabaseUrl.replace(/\/$/, ''), actualProjectRef };
}

export function validateStagingSiteUrl(value, productionSiteUrl) {
  if (!value) throw new Error('STAGING_PUBLIC_SITE_URL is required.');
  if (!productionSiteUrl) throw new Error('PRODUCTION_PUBLIC_SITE_URL is required for the production deny-list.');
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('STAGING_PUBLIC_SITE_URL must be a valid URL.'); }
  if (parsed.protocol !== 'https:') throw new Error('STAGING_PUBLIC_SITE_URL must use HTTPS.');
  let production;
  try { production = new URL(productionSiteUrl); } catch { throw new Error('PRODUCTION_PUBLIC_SITE_URL must be a valid URL.'); }
  if (PRODUCTION_SITE_HOSTS.has(parsed.hostname) || parsed.hostname === production.hostname) {
    throw new Error('Refusing to use the Production public site as staging.');
  }
  if (parsed.username || parsed.password) throw new Error('STAGING_PUBLIC_SITE_URL must not contain credentials.');
  parsed.search = '';
  parsed.hash = '';
  parsed.pathname = parsed.pathname.replace(/\/$/, '');
  return parsed.toString().replace(/\/$/, '');
}
