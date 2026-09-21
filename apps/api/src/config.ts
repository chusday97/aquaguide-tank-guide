import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(currentDir, '../../..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

export const buildApiConfig = (env: NodeJS.ProcessEnv = process.env) => ({
  port: Number(env.PORT || env.API_PORT || 8787),
  supabaseUrl: env.SUPABASE_URL || env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
  shareTokenSecret: env.SHARE_TOKEN_SECRET || env.SUPABASE_SERVICE_ROLE_KEY || '',
  webBaseUrl: env.WEB_BASE_URL || '',
  aiApiKey: env.AI_API_KEY || env.DEEPSEEK_API_KEY || '',
  aiBaseUrl: (env.AI_BASE_URL || env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, ''),
  aiModel: env.AI_MODEL || env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
  aiTimeoutMs: Number(env.AI_TIMEOUT_MS || 20_000),
  // VISION_* is the AquaGuide contract. GLM_* remains accepted for older
  // deployments that configured the provider before the names were scoped.
  visionApiKey: env.VISION_API_KEY || env.GLM_API_KEY || '',
  visionBaseUrl: (env.VISION_BASE_URL || env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/, ''),
  visionModel: env.VISION_MODEL || env.GLM_MODEL || 'glm-4.6v-flash',
  visionFallbackModel: env.VISION_FALLBACK_MODEL || env.GLM_FALLBACK_MODEL || 'glm-4v-flash',
  visionTimeoutMs: Number(env.VISION_TIMEOUT_MS || env.GLM_TIMEOUT_MS || 20_000),
  resendApiKey: env.RESEND_API_KEY || '',
  feedbackEmailTo: env.FEEDBACK_EMAIL_TO || '',
  feedbackEmailFrom: env.FEEDBACK_EMAIL_FROM || '',
});

export const apiConfig = buildApiConfig();

export const isBusinessDatabaseConfigured = () => Boolean(
  apiConfig.supabaseUrl && apiConfig.supabaseAnonKey,
);
