'use client';

import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { V1TranslationsByNamespace } from '@/lib/translations.server';
import type { I18nContextValue, TFunction } from './i18n-context';
import { I18nContext, interpolate } from './i18n-context';

export function I18nProvider(props: {
  locale: string;
  translations: V1TranslationsByNamespace;
  children: ReactNode;
}) {
  const { locale, translations, children } = props;

  const t: TFunction = useCallback(
    (namespace, key, params) => {
      const ns = (namespace || 'default').toString().trim().toLowerCase();
      const k = key.toString();
      const entry = translations?.[ns]?.[k];
      const value = entry?.value;
      if (typeof value !== 'string') return k;
      return interpolate(value, params);
    },
    [translations],
  );

  const ctx = useMemo<I18nContextValue>(
    () => ({ locale, translations, t }),
    [locale, translations, t],
  );

  return <I18nContext.Provider value={ctx}>{children}</I18nContext.Provider>;
}
