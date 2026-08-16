import { createClient } from '@supabase/supabase-js';

const runtimeEnv: Record<string, string | undefined> = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
const supabaseUrl = runtimeEnv.VITE_SUPABASE_URL;
const supabasePublishableKey = runtimeEnv.VITE_SUPABASE_PUBLISHABLE_KEY || runtimeEnv.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
