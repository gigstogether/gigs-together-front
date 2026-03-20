import { createContext } from 'react';
import type { V1TranslationsByNamespace } from '@/lib/translations.server';

export type TParams = Readonly<Record<string, string | number | boolean | null | undefined>>;

export type TFunction = (namespace: string, key: string, params?: TParams) => string;

export interface I18nContextValue {
  readonly locale: string;
  readonly translations: V1TranslationsByNamespace;
  readonly t: TFunction;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, rawKey: string) => {
    const v = params[rawKey];
    if (v === null || v === undefined) return match;
    return String(v);
  });
}
