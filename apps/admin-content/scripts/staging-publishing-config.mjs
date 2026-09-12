const PRODUCTION_SITE_HOSTS = new Set(['aqua-tank-guide.vercel.app']);

export function extractSupabaseProjectRef(value) {
  if (!value) throw new Error('STAGING_SUPABASE_URL is required.');
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('STAGING_SUPABASE_URL must be a valid URL.'); }
  const match = parsed.hostname.match(/^([a-z0-9]+)\.supabase\.co$/i);
  if (!match) throw new Error('Staging Supabase must use a hosted *.supabase.co project URL.');
  return match[1];
}

function decodeJwtRole(value) {
  if (!value || !value.includes('.')) return '';
  try {
    const payload = value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const normalized = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(normalized, 'base64').toString('utf8')).role || '';
  } catch { return ''; }
}

export function validateServerSupabaseKey(value) {
  if (!value) throw new Error('STAGING_SUPABASE_SECRET_KEY is required for server-side publication export.');
  if (value.startsWith('sb_secret_')) return value;
  if (decodeJwtRole(value) === 'service_role') return value;
  throw new Error('Staging publication export requires a Supabase secret key or legacy service_role key; publishable/anon keys are refused.');
}


export function parseStagingCatalogKeys(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split(',');
  const keys = [...new Set(raw.map((item) => String(item).trim()).filter(Boolean))];
  if (keys.length === 0) throw new Error('STAGING_CATALOG_KEYS is required; staging release must use an explicit Species allowlist.');
  if (keys.length > 20) throw new Error('STAGING_CATALOG_KEYS may contain at most 20 Species per staging release.');
  const invalid = keys.filter((key) => !/^sp_[a-z0-9_-]+$/i.test(key));
  if (invalid.length) throw new Error(`Invalid staging catalog key(s): ${invalid.join(', ')}`);
  return keys;
}

export function validateStagingSupabaseConfig({ supabaseUrl, secretKey, expectedProjectRef, productionProjectRef }) {
  validateServerSupabaseKey(secretKey);
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
