import { runCompatibilityResearchBatchPreview } from './v1/_business-app.bundle.mjs';

export const config = {
  maxDuration: 60,
};

const integerInRange = (value, min, max, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (process.env.VERCEL_ENV !== 'preview') {
    return res.status(404).json({ ok: false, error: 'Not found' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const offset = integerInRange(body.offset, 0, 10_000, 0);
  const limit = integerInRange(body.limit, 1, 2, 1);
  const concurrency = integerInRange(body.concurrency, 1, 2, 1);

  try {
    const result = await runCompatibilityResearchBatchPreview({ offset, limit, concurrency });
    if (result.status === 'provider_unavailable') {
      return res.status(503).json({ ok: false, ...result });
    }
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      status: 'research_batch_failed',
      reason: error instanceof Error ? error.message : 'compatibility_research_failed',
      writesAuthority: false,
    });
  }
}
