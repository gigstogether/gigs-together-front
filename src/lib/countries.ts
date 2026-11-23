import { parseCountries } from '@/lib/api-boundary-schemas';
import type { Country } from '@/lib/api-boundary-schemas';
import { apiPublicRequest } from '@/lib/api-public';
import type { ApiPublicRequestInit } from '@/lib/api-public';

const V1_COUNTRIES_ENDPOINT = '/v1/countries';

export async function fetchCountries(init?: ApiPublicRequestInit): Promise<Country[]> {
  const raw = await apiPublicRequest<unknown>(V1_COUNTRIES_ENDPOINT, 'GET', undefined, init);

  return parseCountries(raw);
}
