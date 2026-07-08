import 'server-only';

import { apiRequest } from '@/lib/api';
import { parseLocaleGetTranslationsResponseBody } from '@/lib/api-boundary-schemas';
import type { V1LocaleGetTranslationsResponseBody } from '@/lib/api-boundary-schemas';
import { serverEnv } from '@/env/server-env';
import type { LocaleIso } from '@/lib/types';

export type {
  TranslationFormat,
  TranslationKind,
  V1LocaleGetTranslationsResponseBody,
  V1TranslationValue,
  V1TranslationsByNamespace,
} from '@/lib/api-boundary-schemas';

const DEFAULT_LOCALE: LocaleIso = 'en';

/**
 * Server-side translations loader (cached for 1h).
 *
 * - Uses `accept-language` header by default (primary locale tag like "en", "es", "ru")
 * - Supports namespaces: `?namespaces=common,feed`
 */
export async function getTranslations(
  locale: LocaleIso = DEFAULT_LOCALE,
  namespaces: string | readonly string[] = [],
): Promise<V1LocaleGetTranslationsResponseBody> {
  const namespacesList =
    typeof namespaces === 'string'
      ? namespaces
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
      : namespaces;

  const nsQuery = namespacesList?.join(',');

  const qs = new URLSearchParams();
  if (nsQuery) qs.set('namespaces', nsQuery);

  const url = `/v1/locale/translations${qs.size ? `?${qs.toString()}` : ''}`;

  const raw = await apiRequest<unknown>(url, 'GET', undefined, {
    headers: { 'accept-language': locale },
    next: {
      revalidate: serverEnv.translationsRevalidateSeconds,
    },
  });

  return parseLocaleGetTranslationsResponseBody(raw);
}
