import { create } from 'zustand';
import { persist } from 'zustand/middleware';
const empty = {
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
export const useOnboardingDraft = create()(persist((set) => ({
    ...empty,
    setPersonal: (p) => set((s) => ({ personal: { ...s.personal, ...p } })),
    setCompany: (p) => set((s) => ({ company: { ...s.company, ...p } })),
    setFeedbackScore: (n) => set({ feedbackScore: n }),
    reset: () => set(empty),
}), { name: 'crmvendas.onboarding-draft' }));
