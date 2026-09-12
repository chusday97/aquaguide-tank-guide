import crypto from 'node:crypto';

const COOKIE_NAME = 'aquaguide_admin_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function b64url(value) {
  return Buffer.from(value).toString('base64url');
}

function unb64url(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function sessionSecret() {
  const value = process.env.ADMIN_REPO_SESSION_SECRET || '';
  if (value.length < 32) throw new Error('ADMIN_REPO_SESSION_SECRET must be at least 32 characters.');
  return value;
}

function configuredEmail() {
  return String(process.env.ADMIN_REPO_EMAIL || '').trim().toLowerCase();
}

function verifyPassword(password) {
  const encoded = process.env.ADMIN_REPO_PASSWORD_HASH || '';
  if (encoded.startsWith('scrypt:')) {
    const [, saltHex, hashHex] = encoded.split(':');
    if (!saltHex || !hashHex) return false;
    const actual = crypto.scryptSync(String(password || ''), Buffer.from(saltHex, 'hex'), Buffer.from(hashHex, 'hex').length);
    return safeEqual(actual.toString('hex'), hashHex);
  }
  const fallback = process.env.ADMIN_REPO_PASSWORD || '';
  return Boolean(fallback) && safeEqual(password, fallback);
}

export function isRepoAuthConfigured() {
  return Boolean(configuredEmail() && (process.env.ADMIN_REPO_PASSWORD_HASH || process.env.ADMIN_REPO_PASSWORD) && process.env.ADMIN_REPO_SESSION_SECRET);
}

export function authenticateCredentials(email, password) {
  if (!isRepoAuthConfigured()) return { ok: false, reason: 'not_configured' };
  const validEmail = safeEqual(String(email || '').trim().toLowerCase(), configuredEmail());
  const validPassword = verifyPassword(password);
  if (!validEmail || !validPassword) return { ok: false, reason: 'invalid_credentials' };
  return { ok: true, user: { id: 'repo-admin', email: configuredEmail() } };
}

export function createSessionToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(JSON.stringify({ sub: user.id, email: user.email, iat: now, exp: now + SESSION_TTL_SECONDS }));
  const signature = crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function readSessionToken(token) {
  if (!token) return null;
  try {
    const [payload, signature] = String(token).split('.');
    if (!payload || !signature) return null;
    const expected = crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
    if (!safeEqual(signature, expected)) return null;
    const decoded = JSON.parse(unb64url(payload));
    if (!decoded?.exp || decoded.exp <= Math.floor(Date.now() / 1000)) return null;
    if (decoded.email !== configuredEmail()) return null;
    return { user: { id: decoded.sub || 'repo-admin', email: decoded.email } };
  } catch {
    return null;
  }
}

export function parseCookies(req) {
  const header = req.headers?.cookie || '';
  return Object.fromEntries(header.split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
    const index = part.indexOf('=');
    return index < 0 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
}

export function getRequestSession(req) {
  return readSessionToken(parseCookies(req)[COOKIE_NAME]);
}

export function setSessionCookie(res, token) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production';
  const attrs = [`${COOKIE_NAME}=${encodeURIComponent(token)}`, 'HttpOnly', 'Path=/', 'SameSite=Lax', `Max-Age=${SESSION_TTL_SECONDS}`];
  if (secure) attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

export function clearSessionCookie(res) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production';
  const attrs = [`${COOKIE_NAME}=`, 'HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

export function requireSameOriginMutation(req, res) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(String(req.method || '').toUpperCase())) return true;
  const origin = req.headers?.origin;
  if (!origin) return true; // same-origin non-browser/server tests may omit Origin.
  const expectedHost = String(req.headers?.['x-forwarded-host'] || req.headers?.host || '').split(',')[0].trim();
  if (!expectedHost) {
    res.status(403).json({ data: null, error: { message: 'Unable to verify request origin.' } });
    return false;
  }
  try {
    const actualHost = new URL(origin).host;
    if (actualHost !== expectedHost) {
      res.status(403).json({ data: null, error: { message: 'Cross-origin Admin mutation blocked.' } });
      return false;
    }
  } catch {
    res.status(403).json({ data: null, error: { message: 'Invalid request origin.' } });
    return false;
  }
  return true;
}

export function requireRepoAdmin(req, res) {
  const session = getRequestSession(req);
  if (!session) {
    res.status(401).json({ data: null, error: { message: 'Admin session required.' } });
    return null;
  }
  return session;
}

export function generatePasswordHash(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, 32);
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}
