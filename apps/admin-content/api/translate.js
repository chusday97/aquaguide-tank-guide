import { createClient } from '@supabase/supabase-js';
import { cleanTranslationObject, parseJsonObject, validateProtectedTokens, hasCjkText } from './_translation-core.js';

const aiBaseUrl = (process.env.AI_BASE_URL || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
const aiModel = process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
const apiKey = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || '';
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const config = { maxDuration: 30 };

const isConfiguredKey = (value) => Boolean(
  value && value !== 'MY_AI_API_KEY' && value !== 'MY_DEEPSEEK_API_KEY'
);

const fetchWithTimeout = async (url, options, timeoutMs = 20_000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
};

async function requireAdmin(req) {
  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token || !supabaseUrl || !supabaseAnonKey) return { ok: false, status: 401 };

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData?.user) return { ok: false, status: 401 };
  const { data: roleRow, error: roleError } = await client
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .is('deleted_at', null)
    .maybeSingle();
  if (roleError || roleRow?.role !== 'admin') return { ok: false, status: 403 };
  return { ok: true, user: userData.user };
}

function buildPrompt(scope, source, context) {
  const common = [
    'You are the bilingual localization editor for AquaGuide aquarium Species SEO content.',
    'Translate from Simplified Chinese (zh-CN) to natural international English.',
    'Do not invent care facts, measurements, compatibility claims, or taxonomy.',
    'Keep Latin scientific names, catalog keys and aquarium terminology accurate.',
    'Any {{template_token}} must be copied exactly, with the same spelling and braces.',
    'If a source override field is empty, keep the translated override field empty so inheritance is preserved.',
    'Return valid JSON only. No markdown and no commentary.',
  ];

  if (scope === 'base') {
    return `${common.join('\n')}\nTranslate this Base Species shared SEO layer.\nContext: ${JSON.stringify(context)}\nSource: ${JSON.stringify(source)}\nReturn exactly: {"seoTitleTemplate":"","metaDescriptionTemplate":"","h1Template":"","sharedIntro":""}`;
  }
  return `${common.join('\n')}\nTranslate this Variant editorial layer. localizedName should be a standard English common/trade name when confidently known; otherwise use a concise English descriptive name without changing the scientific name.\nContext: ${JSON.stringify(context)}\nSource: ${JSON.stringify(source)}\nReturn exactly: {"localizedName":"","seoTitle":"","metaDescription":"","h1":"","intro":"","imageAlt":"","focusKeyword":""}`;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const auth = await requireAdmin(req);
  if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.status === 403 ? 'Admin access required' : 'Authentication required' });
  if (!isConfiguredKey(apiKey)) return res.status(503).json({ ok: false, error: 'AI translation provider is not configured', failureReason: 'not_configured' });

  const scope = req.body?.scope === 'base' ? 'base' : req.body?.scope === 'variant' ? 'variant' : '';
  const source = req.body?.source && typeof req.body.source === 'object' ? req.body.source : null;
  const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {};
  if (!scope || !source) return res.status(400).json({ ok: false, error: 'Invalid translation request' });

  const prompt = buildPrompt(scope, source, context).slice(0, 18_000);
  try {
    const upstream = await fetchWithTimeout(`${aiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: aiModel,
        messages: [{ role: 'system', content: 'You are a precise localization engine. JSON only.' }, { role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1200,
        stream: false,
        thinking: { type: 'disabled' },
      }),
    });
    const responseText = await upstream.text();
    if (!upstream.ok) {
      console.error('AquaGuide translation provider error', upstream.status, responseText.slice(0, 220));
      return res.status(502).json({ ok: false, error: 'AI translation provider request failed', failureReason: upstream.status === 429 ? 'rate_limited' : 'provider_error' });
    }
    const payload = JSON.parse(responseText);
    const raw = parseJsonObject(payload?.choices?.[0]?.message?.content || '');
    const data = cleanTranslationObject(scope, raw);
    const tokenErrors = validateProtectedTokens(scope, source, data);
    if (tokenErrors.length) return res.status(422).json({ ok: false, error: tokenErrors.join('; '), failureReason: 'token_mismatch' });

    const warnings = [];
    if (Object.values(data).some((value) => hasCjkText(value))) warnings.push('English suggestion still contains CJK text; review before saving.');
    return res.status(200).json({
      ok: true,
      sourceLocale: 'zh-CN',
      targetLocale: 'en',
      scope,
      model: payload?.model || aiModel,
      warnings,
      data,
    });
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    return res.status(timedOut ? 504 : 500).json({ ok: false, error: timedOut ? 'AI translation timed out' : 'AI translation failed' });
  }
}
