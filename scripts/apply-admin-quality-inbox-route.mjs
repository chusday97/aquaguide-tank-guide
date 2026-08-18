// One-shot deterministic migration. Remove after the source anchors are applied.
import fs from 'node:fs';

const appPath = 'src/App.tsx';
const adminContentPath = 'src/pages/AdminContent.tsx';

let app = fs.readFileSync(appPath, 'utf8');
let adminContent = fs.readFileSync(adminContentPath, 'utf8');
let changed = false;

if (!app.includes("const loadAdminFeedback = () => import('./pages/AdminFeedback');")) {
  const loaderAnchor = "const loadAdminContent = () => import('./pages/AdminContent');";
  if (!app.includes(loaderAnchor)) throw new Error('Admin loader anchor changed; refusing broad rewrite.');
  app = app.replace(loaderAnchor, `${loaderAnchor}\nconst loadAdminFeedback = () => import('./pages/AdminFeedback');`);

  const lazyAnchor = "const AdminContent = lazyWithRecovery(loadAdminContent, 'admin-content');";
  if (!app.includes(lazyAnchor)) throw new Error('Admin lazy route anchor changed; refusing broad rewrite.');
  app = app.replace(lazyAnchor, `${lazyAnchor}\nconst AdminFeedback = lazyWithRecovery(loadAdminFeedback, 'admin-feedback');`);
  changed = true;
}

if (app.includes("const isAdminContent = location.pathname === '/admin/content';")) {
  app = app.replace(
    "const isAdminContent = location.pathname === '/admin/content';",
    "const isAdminContent = location.pathname.startsWith('/admin/');",
  );
  changed = true;
}

if (!app.includes('page="admin-feedback"')) {
  const routeAnchor = '          <Route path="/admin/content" element={<RouteErrorBoundary page="admin-content"><AdminContent /></RouteErrorBoundary>} />';
  if (!app.includes(routeAnchor)) throw new Error('Admin early route anchor changed; refusing broad rewrite.');
  app = app.replace(
    routeAnchor,
    `${routeAnchor}\n          <Route path="/admin/feedback" element={<RouteErrorBoundary page="admin-feedback"><AdminFeedback /></RouteErrorBoundary>} />`,
  );

  const workspaceAnchor = '          <Route path="/admin/content" element={page(<AdminContent />, \'admin-content\')} />';
  if (!app.includes(workspaceAnchor)) throw new Error('Admin workspace route anchor changed; refusing broad rewrite.');
  app = app.replace(
    workspaceAnchor,
    `${workspaceAnchor}\n          <Route path="/admin/feedback" element={page(<AdminFeedback />, 'admin-feedback')} />`,
  );
  changed = true;
}

if (!adminContent.includes('data-admin-quality-link')) {
  const headerAnchor = `          <div className="flex rounded-full bg-bg p-1">
            <button type="button" onClick={() => { if (!isDirty || window.confirm('当前修改尚未保存，确定切换栏目吗？')) setType('species'); }} className={\`h-10 rounded-full px-4 text-sm font-black \${type === 'species' ? 'bg-accent text-white' : 'text-ink/55'}\`}>物种</button>
            <button type="button" onClick={() => { if (!isDirty || window.confirm('当前修改尚未保存，确定切换栏目吗？')) setType('care'); }} className={\`h-10 rounded-full px-4 text-sm font-black \${type === 'care' ? 'bg-accent text-white' : 'text-ink/55'}\`}>养护文章</button>
          </div>`;
  if (!adminContent.includes(headerAnchor)) throw new Error('Admin content tab anchor changed; refusing broad rewrite.');
  const replacement = `          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-admin-quality-link
              onClick={() => { if (!isDirty || window.confirm('当前修改尚未保存，确定离开内容编辑吗？')) navigate('/admin/feedback'); }}
              className="min-h-10 rounded-full border border-emerald-100 bg-white px-4 text-sm font-black text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              用户反馈
            </button>
            <div className="flex rounded-full bg-bg p-1">
              <button type="button" onClick={() => { if (!isDirty || window.confirm('当前修改尚未保存，确定切换栏目吗？')) setType('species'); }} className={\`h-10 rounded-full px-4 text-sm font-black \${type === 'species' ? 'bg-accent text-white' : 'text-ink/55'}\`}>物种</button>
              <button type="button" onClick={() => { if (!isDirty || window.confirm('当前修改尚未保存，确定切换栏目吗？')) setType('care'); }} className={\`h-10 rounded-full px-4 text-sm font-black \${type === 'care' ? 'bg-accent text-white' : 'text-ink/55'}\`}>养护文章</button>
            </div>
          </div>`;
  adminContent = adminContent.replace(headerAnchor, replacement);
  changed = true;
}

if (changed) {
  fs.writeFileSync(appPath, app);
  fs.writeFileSync(adminContentPath, adminContent);
  console.log('Applied Admin Quality Inbox routing and navigation migration.');
} else {
  console.log('Admin Quality Inbox routing migration already applied.');
}
