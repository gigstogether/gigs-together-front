import 'server-only';

import { fetchCountries } from '@/lib/countries';
import type { Country } from '@/lib/api-boundary-schemas';

export function getCountries(): Promise<Country[]> {
  return fetchCountries({
    cache: 'force-cache',
  });
}
