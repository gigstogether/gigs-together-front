'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { V1TranslationsByNamespace } from '@/lib/api-boundary-schemas';
import type { TParams } from '@/lib/i18n/translation-value';
import {
  resolveTranslationValue,
  TranslationValueResolutionError,
} from '@/lib/i18n/translation-value';
import { isValidTranslationNamespace } from '@/lib/i18n/translation-identifiers';

export type { TParams };

export type TFunction = (namespace: string, key: string, params?: TParams) => string;

export interface I18nContextValue {
  readonly locale: string;
  readonly translations: V1TranslationsByNamespace;
  readonly t: TFunction;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  readonly locale: string;
  readonly translations: V1TranslationsByNamespace;
  readonly children: ReactNode;
}

export function I18nProvider(props: I18nProviderProps) {
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

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    const t: TFunction = (_ns, key, params) => {
      void params;
      return key;
    };
    return { locale: 'en', translations: {}, t };
  }
  return ctx;
}

export function useT(): TFunction {
  return useI18n().t;
}
