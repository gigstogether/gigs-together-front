import 'server-only';

import { apiPublicRequest } from '@/lib/api-public';
import { parseCountries } from '@/lib/api-boundary-schemas';
import type { Country } from '@/lib/api-boundary-schemas';

export async function getCountries(): Promise<Country[]> {
  const raw = await apiPublicRequest<unknown>('/v1/location/countries', 'GET', undefined, {
    cache: 'force-cache',
  });
  return parseCountries(raw);
}
