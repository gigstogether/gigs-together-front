import 'server-only';

import { apiRequest } from '@/lib/api';
import { parseLocaleGetTranslationsResponseBody } from '@/lib/api-boundary-schemas';
import { serverEnv } from '@/env/server-env';
import type { LocaleIso } from '@/lib/types';

export type TranslationFormat = 'plain' | 'icu';

export type V1TranslationValue = {
  readonly value: string;
  readonly format: TranslationFormat;
};

export type V1TranslationsByNamespace = Readonly<
  Record<string, Readonly<Record<string, V1TranslationValue>>>
>;

export interface V1LocaleGetTranslationsResponseBody {
  readonly locale: string;
  readonly translations: V1TranslationsByNamespace;
}

const DEFAULT_LOCALE: LocaleIso = 'en';

// const TRANSLATIONS_TAG_ALL = 'translations';
// const tagLocale = (locale: string) => `translations:locale:${locale}`;
// const tagNamespace = (ns: string) => `translations:ns:${ns}`;

/**
 * Server-side translations loader (cached for 1h).
 *
 * - Uses `accept-language` header by default (primary locale tag like "en", "es", "ru")
 * - Supports namespaces: `?namespaces=common,feed`
 * - Adds cache tags so you can manually revalidate via `revalidateTag()`
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
    // Explicitly set accept-language; otherwise some runtimes send "*" by default.
    headers: { 'accept-language': locale },
    next: {
      revalidate: serverEnv.translationsRevalidateSeconds,
      // tags: [
      //   TRANSLATIONS_TAG_ALL,
      //   ...(acceptLanguage ? [tagLocale(acceptLanguage)] : []),
      //   ...(namespacesList ? namespacesList.map(tagNamespace) : []),
      // ],
    },
  });

  return parseLocaleGetTranslationsResponseBody(raw);
}
