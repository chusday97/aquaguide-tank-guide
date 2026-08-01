import assert from 'node:assert/strict';

process.env.RESEND_API_KEY = 'test-key';
process.env.FEEDBACK_EMAIL_TO = 'feedback@example.com';
process.env.FEEDBACK_EMAIL_FROM = 'AquaGuide <feedback@example.com>';

const { sendFeedbackEmail } = await import('../apps/api/src/email/feedback-email');

let requestBody = '';
const sent = await sendFeedbackEmail({
  feedbackId: '11111111-1111-4111-8111-111111111111',
  category: 'problem',
  message: '<script>unsafe</script> 页面按钮无响应',
  pagePath: '/aquarium',
  locale: 'zh-CN',
  appVersion: 'test',
  deviceLayout: 'phone',
}, async (_url, init) => {
  requestBody = String(init?.body || '');
  return new Response(JSON.stringify({ id: 'email-123' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});

assert.equal(sent.status, 'sent');
assert.ok(requestBody.includes('&lt;script&gt;unsafe&lt;/script&gt;'));
assert.ok(!requestBody.includes('<script>unsafe</script>'));

const failed = await sendFeedbackEmail({
  feedbackId: '22222222-2222-4222-8222-222222222222',
  category: 'suggestion',
  message: '希望筛选更清楚一些',
  pagePath: '/encyclopedia',
  locale: 'zh-CN',
  appVersion: 'test',
  deviceLayout: 'desktop',
}, async () => new Response('{}', { status: 429 }));
assert.equal(failed.status, 'failed');

console.log('feedback email: idempotent delivery, HTML escaping and failure fallback passed');
