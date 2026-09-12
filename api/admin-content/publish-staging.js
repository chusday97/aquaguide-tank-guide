import { requireRepoAdmin, requireSameOriginMutation } from '../../server/admin-repo/auth.mjs';
import { appendRepoActivity, publishRepoStagingSelection } from '../../server/admin-repo/store.mjs';

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
    const result = await publishRepoStagingSelection({ catalogKeys: payload.catalogKeys, groupKeys: payload.groupKeys, batchId: String(payload.batchId || '').trim() });
    try {
      await appendRepoActivity({
        kind: 'staging_publish',
        title: 'Staging 发布已完成',
        detail: `${result.snapshot.import_batch_id ? `${result.snapshot.import_batch_id} · ` : ''}${result.snapshot.selected_catalog_keys.length} 个 Species`,
        metadata: {
          batch_id: result.snapshot.import_batch_id || '', selected_catalog_keys: result.snapshot.selected_catalog_keys, branch: result.write.branch,
          filename: result.import_batch?.filename || '', source: result.import_batch?.source || '', locale: result.import_batch?.locale || '',
          page_count: result.import_batch?.page_count || result.snapshot.selected_catalog_keys.length,
        },
      });
    } catch {
      // Publishing already succeeded. Activity logging must never turn a successful release into a retryable failure.
    }
    return res.status(200).json({
      data: {
        commit_sha: result.write.commitSha,
        branch: result.write.branch,
        path: result.write.path,
        selected_catalog_keys: result.snapshot.selected_catalog_keys,
        import_batch: result.import_batch || null,
      },
      error: null,
    });
  } catch (error) {
    return res.status(400).json({ data: null, error: { message: error.message || 'Staging publish failed.' } });
  }
}
