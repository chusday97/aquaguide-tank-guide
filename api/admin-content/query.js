import { requireRepoAdmin, requireSameOriginMutation } from '../../server/admin-repo/auth.mjs';
import { executeRepoOperation } from '../../server/admin-repo/store.mjs';

export const config = { maxDuration: 20 };

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ data: null, error: { message: 'Method not allowed.' } });
  }
  if (!requireSameOriginMutation(req, res)) return;
  if (!requireRepoAdmin(req, res)) return;
  const operation = body(req);
  const result = await executeRepoOperation(operation);
  return res.status(result.error ? 400 : 200).json(result);
}
