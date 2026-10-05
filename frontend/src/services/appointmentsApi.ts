import { http } from './apiClient';
import type { SubmissionResult } from './contactApi';
import type { AppointmentRequestInput } from '@/types';

export const appointmentsApi = {
  /**
   * Creates an appointment **request**. Nothing is auto-confirmed — clinic
   * staff confirm availability by contacting the patient.
   */
  async requestAppointment(
    payload: AppointmentRequestInput,
  ): Promise<SubmissionResult> {
    return http.post<SubmissionResult>('/appointments', payload);
  },
};