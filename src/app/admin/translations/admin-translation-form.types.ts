import type { AdminTranslationKind } from '@/lib/admin-api';

export interface AdminTranslationFormValues {
  readonly namespace: string;
  readonly locale: string;
  readonly key: string;
  readonly value: string;
  readonly kind: AdminTranslationKind;
  readonly isActive: boolean;
}
