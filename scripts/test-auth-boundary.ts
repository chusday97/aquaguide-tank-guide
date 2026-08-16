import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path: string) => fs.readFileSync(path, 'utf8');
const auth = read('src/services/auth/auth.service.ts');
const login = read('src/pages/Login.tsx');
const settings = read('src/pages/Settings.tsx');
const storage = read('src/services/storage/local-app-state.ts');

// No fake user or password flow: public MVP uses real Supabase sessions + Magic Link.
assert.doesNotMatch(auth, /local-user/);
assert.doesNotMatch(auth, /signInWithPassword/);
assert.match(auth, /supabase\.auth\.getSession\(\)/);
assert.match(auth, /supabase\.auth\.signInWithOtp\(\{/);
assert.match(auth, /shouldCreateUser: true/);
assert.match(auth, /const redirectTo = `\$\{window\.location\.origin\}\/login\?callback=1`/);
assert.doesNotMatch(auth, /vercel\.app|pages\.dev|https:\/\/ydiygvhuqpogmqlcvgob/);

// Sign-out is fail-closed: cloud session must be gone before browser business mirrors are cleared.
const signOutIndex = auth.indexOf('const { error } = await supabase.auth.signOut();');
const clearIndex = auth.indexOf('clearSignedInUserLocalData();');
assert.ok(signOutIndex >= 0 && clearIndex > signOutIndex, 'local user data must only clear after Supabase sign-out');
assert.match(auth, /if \(error\) \{[\s\S]*?return \{[\s\S]*?ok: false[\s\S]*?\};[\s\S]*?\}[\s\S]*?clearSignedInUserLocalData\(\)/);
assert.match(auth, /CARE_FAVORITES_STORAGE_KEY/);
assert.match(auth, /CARE_REMINDERS_STORAGE_KEY/);
assert.match(auth, /CARE_COMPLETED_OPERATIONS_STORAGE_KEY/);
assert.match(auth, /CARE_SAVED_CHECKLISTS_STORAGE_KEY/);
assert.match(auth, /clearLocalAppState\(\)/);

// A pending debounced app-state write must not resurrect a signed-out user's cloud mirror.
assert.match(storage, /if \(pendingTimer !== null && typeof window !== 'undefined'\) window\.clearTimeout\(pendingTimer\)/);
assert.match(storage, /pendingTimer = null;\s+pendingState = null;/s);
assert.match(storage, /emitAppStateChanged\(\)/);

// Login is an actual passwordless account surface, not a placeholder.
assert.match(login, /type="email"/);
assert.match(login, /authService\.sendMagicLink\(email\)/);
assert.match(login, /supabase\.auth\.onAuthStateChange/);
assert.match(login, /callbackMode/);
assert.match(login, /if \(current && callbackMode\) navigate\('\/', \{ replace: true \}\)/);
assert.match(login, /authService\.signOut\(\)/);
assert.match(login, /window\.location\.replace\('\/login'\)/);
assert.match(login, /role="status"/);
assert.match(login, /role="alert"/);
assert.match(login, /暂不登录，继续使用本机数据/);
assert.doesNotMatch(login, /type="password"|功能建设中|COMING SOON/);

// Settings exposes account management without turning device preferences into cloud data.
assert.match(settings, /id="settings-account"/);
assert.match(settings, /navigate\('\/login\?mode=account'\)/);
assert.match(settings, /账户与同步/);

console.log('auth boundary passed: magic-link session entry, callback routing, fail-closed sign-out, and local privacy cleanup verified');
