import { apiPublicRequest } from '@/lib/api-public';
import type { ApiPublicRequestInit } from '@/lib/api-public';
import { parseCommunitiesResponse } from '@/lib/api-boundary-schemas';
import type { CommunitiesResponse } from '@/lib/api-boundary-schemas';

export interface FetchCommunitiesParams {
  requestInit?: ApiPublicRequestInit;
}

export async function fetchCommunities(
  params: FetchCommunitiesParams = {},
): Promise<CommunitiesResponse> {
  const raw = await apiPublicRequest<unknown>(
    '/v1/communities',
    'GET',
    undefined,
    params.requestInit,
  );

  return parseCommunitiesResponse(raw);
}
