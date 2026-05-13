import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingDraft {
  personal: {
    fullName: string;
    phone: string;
    role: string;
  };
  company: {
    name: string;
    industry: string;
    employeesRange: string;
    country: string;
    website: string;
    currency: string;
  };
  feedbackScore: number | null;
}

interface State extends OnboardingDraft {
  setPersonal: (p: Partial<OnboardingDraft['personal']>) => void;
  setCompany: (p: Partial<OnboardingDraft['company']>) => void;
  setFeedbackScore: (n: number) => void;
  reset: () => void;
}

const empty: OnboardingDraft = {
  personal: { fullName: '', phone: '', role: '' },
  company: {
    name: '',
    industry: '',
    employeesRange: '',
    country: 'BR',
    website: '',
    currency: 'BRL',
  },
  feedbackScore: null,
};

export const useOnboardingDraft = create<State>()(
  persist(
    (set) => ({
      ...empty,
      setPersonal: (p) =>
        set((s) => ({ personal: { ...s.personal, ...p } })),
      setCompany: (p) => set((s) => ({ company: { ...s.company, ...p } })),
      setFeedbackScore: (n) => set({ feedbackScore: n }),
      reset: () => set(empty),
    }),
    { name: 'crmvendas.onboarding-draft' },
  ),
);
