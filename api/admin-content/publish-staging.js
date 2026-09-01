import { requireRepoAdmin, requireSameOriginMutation } from '../../server/admin-repo/auth.mjs';
import { publishRepoStagingSelection } from '../../server/admin-repo/store.mjs';

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
  try {
    const payload = body(req);
    const result = await publishRepoStagingSelection({ catalogKeys: payload.catalogKeys, groupKeys: payload.groupKeys });
    return res.status(200).json({
      data: {
        commit_sha: result.write.commitSha,
        branch: result.write.branch,
        path: result.write.path,
        selected_catalog_keys: result.snapshot.selected_catalog_keys,
      },
      error: null,
    });
  } catch (error) {
    return res.status(400).json({ data: null, error: { message: error.message || 'Staging publish failed.' } });
  }
}
