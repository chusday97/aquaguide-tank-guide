import fs from 'node:fs';

const main = fs.readFileSync('src/main.tsx', 'utf8');
const inbox = fs.readFileSync('src/pages/AdminFeedback.tsx', 'utf8');
const service = fs.readFileSync('src/services/admin/feedback-admin.service.ts', 'utf8');
const backend = fs.readFileSync('apps/api/src/routes/feedback.ts', 'utf8');

const requireMarker = (source, marker, message) => {
  if (!source.includes(marker)) throw new Error(message || `Missing marker: ${marker}`);
};

requireMarker(backend, "adminFeedbackRouter.get('/feedback'", 'Backend must expose authenticated admin feedback listing.');
requireMarker(backend, "adminFeedbackRouter.patch('/feedback/:id/status'", 'Backend must expose feedback status mutation.');

requireMarker(service, "apiRequest<AdminFeedbackPage>(`/admin/feedback?", 'Admin frontend must list real feedback through the protected API.');
requireMarker(service, "`/admin/feedback/${id}/status`", 'Admin frontend must mutate feedback status through the protected API.');
requireMarker(service, "createIdempotencyKey('admin-feedback-status')", 'Feedback status writes must satisfy the admin idempotency contract.');
requireMarker(service, "error.code === 'AUTH_REQUIRED'", 'Admin service must distinguish missing authentication.');
requireMarker(service, "error.code === 'FORBIDDEN'", 'Admin service must distinguish non-admin accounts.');

requireMarker(inbox, 'data-admin-quality-inbox', 'Quality Inbox page marker is required.');
requireMarker(inbox, "type FilterStatus = 'all' | AdminFeedbackStatus", 'Quality Inbox must support server-backed status filtering.');
requireMarker(inbox, "updateStatus(record, 'reviewed')", 'Quality Inbox must support reviewed state.');
requireMarker(inbox, "updateStatus(record, 'closed')", 'Quality Inbox must support closed state.');
requireMarker(inbox, "updateStatus(record, 'new')", 'Closed feedback must be reopenable.');
requireMarker(inbox, '没有使用本地假数据替代', 'Request failures must not silently fall back to fake inbox data.');

requireMarker(main, "import AdminFeedback from './pages/AdminFeedback';", 'Application entry must mount the Quality Inbox without rewriting the primary App router.');
requireMarker(main, "const isAdminFeedback = pathname === '/admin/feedback';", 'Application entry must isolate the /admin/feedback route.');
requireMarker(main, '<Route path="/admin/feedback" element={<AdminFeedback />} />', 'Admin feedback entry must have an explicit BrowserRouter route.');
requireMarker(main, 'data-admin-quality-link', 'Existing Content Admin route must expose a discoverable Quality Inbox shortcut.');
requireMarker(main, 'showAdminQualityShortcut = pathname === \'/admin/content\'', 'Quality shortcut must only appear on the Content Admin route.');

if (/fake|mock|fixture/i.test(service)) {
  throw new Error('Admin feedback service must not ship mock/fake/fixture data fallbacks.');
}

console.log('Admin Quality Inbox V1 source contract passed: real protected feedback API + status workflow + explicit auth states + isolated entry route + discoverable Content Admin shortcut.');
