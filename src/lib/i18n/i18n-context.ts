'use client';

import { createContext } from 'react';
import type { V1TranslationsByNamespace } from '@/lib/api-boundary-schemas';
import type { TParams } from './translation-value';

export type { TParams };

export type TFunction = (namespace: string, key: string, params?: TParams) => string;

export interface I18nContextValue {
  readonly locale: string;
  readonly translations: V1TranslationsByNamespace;
  readonly t: TFunction;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
