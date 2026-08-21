const json = (body, init = {}) => new Response(JSON.stringify(body), {
  ...init,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    ...(init.headers || {}),
  },
});

export function onRequestGet({ env }) {
  const isConfiguredApiKey = (apiKey) => Boolean(apiKey && apiKey !== 'MY_DEEPSEEK_API_KEY' && apiKey !== 'MY_AI_API_KEY');
  const textConfigured = isConfiguredApiKey(env.AI_API_KEY) || isConfiguredApiKey(env.DEEPSEEK_API_KEY);
  const visionConfigured = Boolean(env.VISION_API_KEY && env.VISION_BASE_URL && env.VISION_MODEL);
  return json({
    ok: true,
    provider: 'deepseek',
    aiProvider: 'deepseek',
    model: env.AI_MODEL || env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
    configured: textConfigured,
    text: {
      configured: textConfigured,
      provider: 'deepseek',
      model: env.AI_MODEL || env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
    },
    vision: { configured: visionConfigured, mode: visionConfigured ? 'model' : 'manual_confirmation' },
  });
}
