import type { FeedbackCreateInput, FeedbackSubmissionReceipt } from '../../../packages/contracts/src/business';
import { apiRequest } from '../api/api-client';

export const submitFeedback = (input: FeedbackCreateInput) => apiRequest<FeedbackSubmissionReceipt>('/feedback', {
  method: 'POST',
  authenticated: 'optional',
  body: input,
});
