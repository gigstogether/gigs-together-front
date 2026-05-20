import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { authKeys } from '@/lib/auth-keys';
import { fetchAuthMeProfile } from '@/lib/auth-me';
import type { AuthClientProfile } from '@/types/auth-client-profile';

// TODO: Cross-tab session sync — each tab has its own QueryClient cache after
// removing profile localStorage. Consider `refetchOnWindowFocus: true` here and/or a BroadcastChannel
// (or storage event) listener that invalidates `authKeys.me()` when another tab signs in or out.
export function useMe(): UseQueryResult<AuthClientProfile | null, Error> {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: fetchAuthMeProfile,
    retry: false,
    staleTime: Infinity,
  });
}
