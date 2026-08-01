import { apiConfig } from '../config';

type FeedbackEmailInput = {
  feedbackId: string;
  category: string;
  message: string;
  pagePath: string;
  locale: string;
  appVersion: string;
  deviceLayout: string;
};

export type FeedbackEmailResult =
  | { status: 'not_configured' }
  | { status: 'sent'; deliveryId: string; emailedAt: string }
  | { status: 'failed'; error: string };

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const sendFeedbackEmail = async (
  input: FeedbackEmailInput,
  fetchImpl: typeof fetch = fetch,
): Promise<FeedbackEmailResult> => {
  if (!apiConfig.resendApiKey || !apiConfig.feedbackEmailTo || !apiConfig.feedbackEmailFrom) {
    return { status: 'not_configured' };
  }
  try {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiConfig.resendApiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `aquaguide-feedback-${input.feedbackId}`,
      },
      body: JSON.stringify({
        from: apiConfig.feedbackEmailFrom,
        to: [apiConfig.feedbackEmailTo],
        subject: `[AquaGuide 反馈] ${input.category} · ${input.feedbackId.slice(0, 8)}`,
        html: `<h2>AquaGuide 用户反馈</h2><p><strong>分类：</strong>${escapeHtml(input.category)}</p><p><strong>页面：</strong>${escapeHtml(input.pagePath)}</p><p><strong>语言 / 布局：</strong>${escapeHtml(input.locale)} / ${escapeHtml(input.deviceLayout)}</p><p><strong>版本：</strong>${escapeHtml(input.appVersion)}</p><hr><p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>`,
      }),
    });
    if (!response.ok) return { status: 'failed', error: `Resend HTTP ${response.status}` };
    const payload = await response.json() as { id?: string };
    if (!payload.id) return { status: 'failed', error: 'Resend response did not include an id' };
    return { status: 'sent', deliveryId: payload.id, emailedAt: new Date().toISOString() };
  } catch (error) {
    return { status: 'failed', error: error instanceof Error ? error.message.slice(0, 500) : 'Unknown email delivery error' };
  }
};
