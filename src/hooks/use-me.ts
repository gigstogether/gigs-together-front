import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { authKeys } from '@/lib/auth-keys';
import { fetchAuthMeProfile } from '@/lib/auth-me';
import type { AuthClientProfile } from '@/types/auth-client-profile';

export function useMe(): UseQueryResult<AuthClientProfile | null, Error> {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: fetchAuthMeProfile,
    retry: false,
    staleTime: Infinity,
  });
}
