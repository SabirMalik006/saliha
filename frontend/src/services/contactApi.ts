import { http } from './apiClient';
import type { ContactInquiryInput } from '@/types';

/** Response shape for a successful submission. */
export interface SubmissionResult {
  id: string;
  received: true;
  status?: string;
}

export const contactApi = {
  /**
   * Sends a public contact inquiry to the backend so clinic staff can see it
   * in the admin dashboard. Throws `ApiError` when submission genuinely fails.
   */
  async submit(payload: ContactInquiryInput): Promise<SubmissionResult> {
    return http.post<SubmissionResult>('/contact', payload);
  },
};