'use client';

import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { V1TranslationsByNamespace } from '@/lib/api-boundary-schemas';
import { resolveTranslationValue, TranslationValueResolutionError } from './translation-value';
import type { I18nContextValue, TFunction } from './i18n-context';
import { I18nContext } from './i18n-context';

const TRANSLATION_NAMESPACE_PATTERN = /^[a-z][a-zA-Z0-9]{0,63}$/;

function isValidTranslationNamespace(namespace: string): boolean {
  return namespace === 'default' || TRANSLATION_NAMESPACE_PATTERN.test(namespace);
}

export function I18nProvider(props: {
  locale: string;
  translations: V1TranslationsByNamespace;
  children: ReactNode;
}) {
  const { locale, translations, children } = props;

  const t: TFunction = useCallback(
    (namespace, key, params) => {
      const ns = namespace.trim();
      if (!isValidTranslationNamespace(ns)) {
        throw new TranslationValueResolutionError(`Invalid translation namespace "${namespace}".`);
      }

      return resolveTranslationValue({
        entry: translations[ns]?.[key],
        namespace: ns,
        key,
        params,
      });
    },
    [translations],
  );

  const ctx = useMemo<I18nContextValue>(
    () => ({ locale, translations, t }),
    [locale, translations, t],
  );

  return <I18nContext.Provider value={ctx}>{children}</I18nContext.Provider>;
}
