import 'server-only';

import { apiPublicRequest } from '@/lib/api';
import { parseCountries } from '@/lib/api-boundary-schemas';

export interface Country {
  iso: string;
}

export async function getCountries(): Promise<Country[]> {
  const raw = await apiPublicRequest<unknown>('/v1/location/countries', 'GET', undefined, {
    cache: 'force-cache',
  });
  return parseCountries(raw);
}
