import 'server-only';

import { apiPublicRequest } from '@/lib/api';
import { parseLocaleGetTranslationsResponseBody } from '@/lib/api-boundary-schemas';
import type { V1LocaleGetTranslationsResponseBody } from '@/lib/api-boundary-schemas';
import {
  buildTranslationNamespaceCacheTag,
  isValidTranslationNamespace,
} from '@/lib/i18n/translation-identifiers';
import { serverEnv } from '@/env/server-env';
import type { LocaleIso } from '@/lib/types';

export type {
  TranslationFormat,
  TranslationKind,
  V1LocaleGetTranslationsResponseBody,
  V1TranslationValue,
  V1TranslationsByNamespace,
} from '@/lib/api-boundary-schemas';

export class GetTranslationsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GetTranslationsError';
  }
}

const DEFAULT_LOCALE: LocaleIso = 'en';

function parseRequestedTranslationNamespaces(
  namespaces: string | readonly string[],
): readonly string[] {
  const rawList =
    typeof namespaces === 'string'
      ? namespaces
          .split(',')
          .map((segment) => segment.trim())
          .filter(Boolean)
      : [...namespaces];

  return [...new Set(rawList)];
}

/**
 * Server-side translations loader (cached for 1h).
 *
 * - Requires explicit namespace(s); front never fetches all API namespaces (e.g. telegram).
 * - Uses `accept-language` header by default (primary locale tag like "en", "es", "ru")
 */
export async function getTranslations(
  locale: LocaleIso = DEFAULT_LOCALE,
  namespaces: string | readonly string[],
): Promise<V1LocaleGetTranslationsResponseBody> {
  const namespacesList = parseRequestedTranslationNamespaces(namespaces);

  if (namespacesList.length === 0) {
    throw new GetTranslationsError('getTranslations requires at least one namespace.');
  }

  for (const namespace of namespacesList) {
    if (!isValidTranslationNamespace(namespace)) {
      throw new GetTranslationsError(`Invalid translation namespace "${namespace}".`);
    }
  }

  const nsQuery = namespacesList.join(',');

  const url = `/v1/locale/translations?namespaces=${encodeURIComponent(nsQuery)}`;

  const raw = await apiPublicRequest<unknown>(url, 'GET', undefined, {
    headers: { 'accept-language': locale },
    next: {
      revalidate: serverEnv.translationsRevalidateSeconds,
      tags: namespacesList.map((namespace) => buildTranslationNamespaceCacheTag(namespace)),
    },
  });

  return parseLocaleGetTranslationsResponseBody(raw);
}
