import { useQuery } from '@tanstack/react-query';
import { settingsApi, type OrgAccess } from '@/api/settings.api';
import { useAuthStore } from '@/store/auth.store';

/**
 * Busca a org atual (com `access` de trial/assinatura). Fonte do badge/popup e do
 * paywall no frontend. A regra real de bloqueio é server-side (402).
 */
export function useOrgAccess() {
  const role = useAuthStore((s) => s.user?.role);
  const orgId = useAuthStore((s) => s.user?.organizationId);
  const enabled = !!orgId && role !== 'SUPER_ADMIN';

  const q = useQuery({
    queryKey: ['org-access'],
    queryFn: settingsApi.currentOrg,
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const access: OrgAccess | undefined = q.data?.access;
  return {
    access,
    isLoading: q.isLoading,
    isTrial: access?.status === 'trial',
    isBlocked: access?.status === 'expired' || access?.status === 'none',
    daysLeft: access?.daysLeft ?? 0,
  };
}
