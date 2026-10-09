const EXPECTED_PROJECT_REF_ENV = 'CONTENT_IMPORT_EXPECTED_PROJECT_REF';

export const getSupabaseProjectRef = (rawUrl: string | undefined) => {
  if (!rawUrl) return null;
  try {
    const hostname = new URL(rawUrl).hostname;
    const match = hostname.match(/^([a-z0-9-]+)\.supabase\.co$/i);
    return match?.[1] || null;
  } catch {
    return null;
  }
};

export const assertContentImportCommitTarget = (env: NodeJS.ProcessEnv = process.env) => {
  const expectedProjectRef = env[EXPECTED_PROJECT_REF_ENV]?.trim();
  if (!expectedProjectRef) {
    throw new Error(`${EXPECTED_PROJECT_REF_ENV} is required for content import --commit.`);
  }

  const targetProjectRef = getSupabaseProjectRef(env.SUPABASE_URL || env.VITE_SUPABASE_URL);
  if (!targetProjectRef) {
    throw new Error('Unable to resolve Supabase project ref from SUPABASE_URL/VITE_SUPABASE_URL.');
  }
  if (targetProjectRef !== expectedProjectRef) {
    throw new Error(`Content import target mismatch: expected ${expectedProjectRef}, received ${targetProjectRef}.`);
  }
  return targetProjectRef;
};
