import {
  apiRequest,
  AquaGuideApiError,
  createIdempotencyKey,
} from '../api/api-client';

export type AdminFeedbackStatus = 'new' | 'reviewed' | 'closed';
export type AdminFeedbackCategory = 'suggestion' | 'problem' | 'content' | 'other';
export type AdminFeedbackDeliveryStatus = 'not_configured' | 'sent' | 'failed';

export type AdminFeedbackRecord = {
  id: string;
  ownerId?: string | null;
  category: AdminFeedbackCategory;
  message: string;
  pagePath: string;
  locale: 'zh-CN' | 'en';
  appVersion: string;
  deviceLayout: 'phone' | 'desktop';
  status: AdminFeedbackStatus;
  emailDeliveryStatus?: AdminFeedbackDeliveryStatus;
  emailDeliveryError?: string | null;
  emailedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  version?: number;
};

export type AdminFeedbackPage = {
  items: AdminFeedbackRecord[];
  nextCursor?: string;
};

export const feedbackAdminService = {
  list: (options: { status?: AdminFeedbackStatus; cursor?: string; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (options.status) query.set('status', options.status);
    if (options.cursor) query.set('cursor', options.cursor);
    query.set('limit', String(options.limit || 30));
    return apiRequest<AdminFeedbackPage>(`/admin/feedback?${query.toString()}`);
  },

  updateStatus: (id: string, status: AdminFeedbackStatus) => apiRequest<AdminFeedbackRecord>(`/admin/feedback/${id}/status`, {
    method: 'PATCH',
    body: { status },
    idempotencyKey: createIdempotencyKey('admin-feedback-status'),
  }),
};

export const getAdminFeedbackErrorState = (error: unknown) => {
  if (error instanceof AquaGuideApiError) {
    if (error.code === 'AUTH_REQUIRED') return 'auth_required' as const;
    if (error.code === 'FORBIDDEN') return 'forbidden' as const;
    return 'request_failed' as const;
  }
  return 'request_failed' as const;
};
