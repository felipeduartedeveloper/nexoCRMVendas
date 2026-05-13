import { api, unwrap } from '@/lib/api';

export type OnboardingStep =
  | 'PERSONAL_INFO'
  | 'COMPANY_INFO'
  | 'SETUP_TOUR'
  | 'COMPLETED';

export interface OnboardingState {
  id: string;
  userId: string;
  step: OnboardingStep;
  surveyData: Record<string, any>;
  feedbackScore: number | null;
  completedAt: string | null;
}

export interface CompletePayload {
  personal: {
    fullName: string;
    phone?: string;
    role: string;
  };
  company: {
    name: string;
    industry?: string;
    employeesRange?: string;
    country?: string;
    website?: string;
    currency?: string;
  };
  survey?: Record<string, any>;
  feedbackScore?: number;
}

export const onboardingApi = {
  state: async () => unwrap<OnboardingState>(await api.get('/onboarding/state')),
  patchState: async (data: Partial<OnboardingState>) =>
    unwrap<OnboardingState>(await api.patch('/onboarding/state', data)),
  complete: async (payload: CompletePayload) =>
    unwrap<{ organizationId: string }>(await api.post('/onboarding/complete', payload)),
};
