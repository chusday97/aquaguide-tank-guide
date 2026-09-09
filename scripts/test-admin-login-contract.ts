import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync('src/App.tsx', 'utf8');
const publicLogin = readFileSync('src/pages/Login.tsx', 'utf8');
const adminLogin = readFileSync('src/pages/AdminLogin.tsx', 'utf8');
const authService = readFileSync('src/services/auth/auth.service.ts', 'utf8');
const adminRoute = readFileSync('apps/api/src/routes/admin.ts', 'utf8');
const adminHub = readFileSync('src/pages/AdminHub.tsx', 'utf8');

assert.match(app, /path="\/admin\/login"/);
assert.match(app, /path="\/login"/);
assert.match(publicLogin, /功能建设中|COMING SOON/, 'public cloud-sync login must remain closed');
assert.doesNotMatch(publicLogin, /signInWithEmailPassword/, 'public login must not silently become Admin auth');
assert.match(adminLogin, /signInWithEmailPassword/);
assert.match(adminLogin, /apiRequest<\{ userId: string; role: 'admin' \}>\('\/admin\/session'\)/);
assert.match(adminLogin, /raw\.startsWith\('\/admin\/'\)/);
assert.match(adminLogin, /!raw\.startsWith\('\/admin\/login'\)/);
assert.match(adminLogin, /cause\.code === 'FORBIDDEN'/);
assert.match(adminLogin, /authService\.signOut\(\)/);
assert.match(authService, /signOut: async \(\)/);
assert.match(adminRoute, /adminRouter\.get\('\/session'/);
assert.match(adminRoute, /role: 'admin' as const/);
assert.match(adminHub, /availability === 'auth_required'/);
assert.match(adminHub, /\/admin\/login\?next=%2Fadmin%2Fcontent/);
assert.match(adminHub, /登录管理员账号/);
console.log('Admin login contract verified: dedicated route, Admin session check, safe return path, public login remains closed.');
