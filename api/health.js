const aiProvider = 'deepseek';
const aiBaseUrl = (process.env.AI_BASE_URL || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
const aiModel = process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
const aiRequestTimeoutMs = Number(process.env.AI_TIMEOUT_MS || 20_000);

const isConfiguredApiKey = (apiKey) => Boolean(
  apiKey
  && apiKey !== 'MY_DEEPSEEK_API_KEY'
  && apiKey !== 'MY_AI_API_KEY'
);

const apiKey = [process.env.AI_API_KEY, process.env.DEEPSEEK_API_KEY].find(isConfiguredApiKey) || '';

export const config = {
  maxDuration: 15,
};

const fetchWithTimeout = async (url, options, timeoutMs = 8_000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const requestUrl = new URL(req.url || '/api/health', 'https://aquaguide.local');
  const shouldProbe = requestUrl.searchParams.get('probe') === '1';
  const configured = isConfiguredApiKey(apiKey);

  const base = {
    ok: true,
    provider: aiProvider,
    aiProvider,
    model: aiModel,
    configured,
    timeoutMs: aiRequestTimeoutMs,
  };

  if (!shouldProbe) {
    return res.status(200).json(base);
  }

  if (!configured) {
    return res.status(503).json({
      ...base,
      ok: false,
      upstream: {
        ok: false,
        reason: 'not_configured',
      },
    });
  }

  try {
    const upstreamResponse = await fetchWithTimeout(`${aiBaseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const responseText = await upstreamResponse.text();
    let models = [];
    try {
      const payload = JSON.parse(responseText);
      models = Array.isArray(payload?.data)
        ? payload.data.map(item => item?.id).filter(Boolean)
        : [];
    } catch {
      // The HTTP status is still enough for the health check if the body is not JSON.
    }

    const modelAvailable = models.length > 0 ? models.includes(aiModel) : null;

    return res.status(upstreamResponse.ok ? 200 : 502).json({
      ...base,
      ok: upstreamResponse.ok,
      upstream: {
        ok: upstreamResponse.ok,
        status: upstreamResponse.status,
        modelAvailable,
        reason: upstreamResponse.ok
          ? 'ok'
          : upstreamResponse.status === 401 || upstreamResponse.status === 403
            ? 'authentication_failed'
            : upstreamResponse.status === 429
              ? 'rate_limited'
              : 'provider_error',
      },
    });
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    return res.status(502).json({
      ...base,
      ok: false,
      upstream: {
        ok: false,
        reason: timedOut ? 'timeout' : 'network_error',
      },
    });
  }
}
