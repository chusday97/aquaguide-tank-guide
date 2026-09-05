import {
  authenticateCredentials, clearSessionCookie, createSessionToken,
  getRequestSession, isRepoAuthConfigured, requireSameOriginMutation, setSessionCookie,
} from '../../server/admin-repo/auth.mjs';

export const config = { maxDuration: 10 };

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    return res.status(200).json({
      configured: isRepoAuthConfigured(),
      session: getRequestSession(req),
    });
  }
  if (req.method === 'POST') {
    if (!requireSameOriginMutation(req, res)) return;
    const credentials = body(req);
    const result = authenticateCredentials(credentials.email, credentials.password);
    if (!result.ok) {
      return res.status(result.reason === 'not_configured' ? 503 : 401).json({
        data: { session: null },
        error: { message: result.reason === 'not_configured' ? 'Repository Admin auth is not configured.' : 'Invalid admin email or password.' },
      });
    }
    const token = createSessionToken(result.user);
    setSessionCookie(res, token);
    return res.status(200).json({ data: { session: { user: result.user } }, error: null });
  }
  if (req.method === 'DELETE') {
    if (!requireSameOriginMutation(req, res)) return;
    clearSessionCookie(res);
    return res.status(200).json({ data: {}, error: null });
  }
  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({ data: null, error: { message: 'Method not allowed.' } });
}
