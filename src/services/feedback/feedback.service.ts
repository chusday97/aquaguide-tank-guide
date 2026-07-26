import type { FeedbackCreateInput } from '../../../packages/contracts/src/business';
import { apiRequest } from '../api/api-client';

export type FeedbackSubmissionReceipt = {
  id: string;
  status: 'new' | 'reviewed' | 'closed';
  createdAt: string;
};

export const submitFeedback = (input: FeedbackCreateInput) => apiRequest<FeedbackSubmissionReceipt>('/feedback', {
  method: 'POST',
  authenticated: 'optional',
  body: input,
});
