import { api, unwrap } from '@/lib/api';
export const onboardingApi = {
    state: async () => unwrap(await api.get('/onboarding/state')),
    patchState: async (data) => unwrap(await api.patch('/onboarding/state', data)),
    complete: async (payload) => {
        const flat = {
            companyName: payload.company?.name?.trim() || 'Minha empresa',
            industry: payload.company?.industry,
            employeesRange: payload.company?.employeesRange,
            country: payload.company?.country,
            currency: payload.company?.currency || 'BRL',
            role: payload.personal?.role,
            useCase: payload.survey?.useCase,
            feedbackScore: payload.feedbackScore,
        };
        return unwrap(await api.post('/onboarding/complete', flat));
    },
};
