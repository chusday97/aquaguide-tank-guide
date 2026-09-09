import { validateStagingSupabaseConfig } from './staging-publishing-config.mjs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateStagingAdminIdentity({ userId, expectedEmail }) {
  const normalizedUserId = String(userId || '').trim();
  const normalizedEmail = String(expectedEmail || '').trim().toLowerCase();
  if (!UUID_RE.test(normalizedUserId)) throw new Error('STAGING_ADMIN_USER_ID must be a valid UUID for an existing Staging Auth user.');
  if (!normalizedEmail || !normalizedEmail.includes('@')) throw new Error('STAGING_ADMIN_EXPECTED_EMAIL is required to verify the target Auth identity.');
  return { userId: normalizedUserId, expectedEmail: normalizedEmail };
}

export function validateStagingAdminProvisionConfig(env = process.env) {
  const staging = validateStagingSupabaseConfig({
    supabaseUrl: env.STAGING_SUPABASE_URL,
    secretKey: env.STAGING_SUPABASE_SECRET_KEY,
    expectedProjectRef: env.STAGING_SUPABASE_PROJECT_REF,
    productionProjectRef: env.PRODUCTION_SUPABASE_PROJECT_REF,
  });
  return { ...staging, ...validateStagingAdminIdentity({
    userId: env.STAGING_ADMIN_USER_ID,
    expectedEmail: env.STAGING_ADMIN_EXPECTED_EMAIL,
  }) };
}

export function assertAuthIdentityMatches(user, target) {
  if (!user || user.id !== target.userId) throw new Error('Staging Auth user lookup did not return the requested user ID.');
  const actualEmail = String(user.email || '').trim().toLowerCase();
  if (actualEmail !== target.expectedEmail) throw new Error('Staging Auth user email does not match STAGING_ADMIN_EXPECTED_EMAIL. Refusing role promotion.');
  return true;
}
