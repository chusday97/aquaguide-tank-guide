export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const isConfiguredApiKey = (value) => Boolean(value && value !== 'MY_DEEPSEEK_API_KEY' && value !== 'MY_AI_API_KEY');
  const textConfigured = isConfiguredApiKey(process.env.AI_API_KEY) || isConfiguredApiKey(process.env.DEEPSEEK_API_KEY);
  const visionConfigured = Boolean(process.env.VISION_API_KEY && process.env.VISION_BASE_URL && process.env.VISION_MODEL);
  const provider = 'deepseek';
  const model = process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
  res.status(200).json({
    ok: true,
    provider,
    aiProvider: provider,
    model,
    configured: textConfigured,
    text: { configured: textConfigured, provider, model },
    vision: { configured: visionConfigured, mode: visionConfigured ? 'model' : 'manual_confirmation' },
  });
}
