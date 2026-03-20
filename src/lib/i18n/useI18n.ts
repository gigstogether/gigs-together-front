'use client';

import { useContext } from 'react';
import { I18nContext } from './i18n-context';
import type { I18nContextValue, TFunction } from './i18n-context';

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback (so components won't crash if provider isn't mounted yet).
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
