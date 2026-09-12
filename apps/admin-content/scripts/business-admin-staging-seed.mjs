import { validateStagingSupabaseConfig } from './staging-publishing-config.mjs';

export function resolveBusinessAdminStagingSeedConfig(env = process.env) {
  const validated = validateStagingSupabaseConfig({
    supabaseUrl: env.STAGING_SUPABASE_URL,
    secretKey: env.STAGING_SUPABASE_SECRET_KEY,
    expectedProjectRef: env.STAGING_SUPABASE_PROJECT_REF,
    productionProjectRef: env.PRODUCTION_SUPABASE_PROJECT_REF,
  });
  return {
    targetProjectRef: validated.actualProjectRef,
    childEnv: {
      ...env,
      SUPABASE_URL: validated.supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: env.STAGING_SUPABASE_SECRET_KEY,
    },
  };
}

export function buildBusinessAdminStagingImportArgs({ commit = false } = {}) {
  return [
    '--import', 'tsx', 'scripts/content-import/import-catalog.ts',
    '--metadata-only',
    ...(commit ? ['--commit'] : []),
  ];
}

export function buildBusinessAdminStagingCompatibilityArgs({ commit = false } = {}) {
  return [
    '--import', 'tsx', 'scripts/content-import/seed-staging-compatibility.ts',
    ...(commit ? ['--commit'] : []),
  ];
}
