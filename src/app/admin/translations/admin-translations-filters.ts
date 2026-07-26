import {
  ADMIN_ALL_TRANSLATION_KINDS,
  ADMIN_ALL_TRANSLATION_LOCALES,
  ADMIN_ALL_TRANSLATION_NAMESPACES,
  ADMIN_ALL_TRANSLATION_STATUSES,
} from '@/app/admin/adminKeys';

import type {
  AdminTranslationKind,
  AdminTranslationRecord,
  SupportedLocale,
} from '@/lib/admin-api';
import { isValidTranslationNamespace } from '@/lib/translation-identifiers';

export interface AdminTranslationFilterOption<TValue extends string = string> {
  readonly value: TValue;
  readonly label: string;
}

export type AdminTranslationNamespaceFilter = typeof ADMIN_ALL_TRANSLATION_NAMESPACES | string;

export type AdminTranslationLocaleFilter = typeof ADMIN_ALL_TRANSLATION_LOCALES | string;

export type AdminTranslationKindFilter = typeof ADMIN_ALL_TRANSLATION_KINDS | AdminTranslationKind;

export type AdminTranslationStatusFilter =
  | typeof ADMIN_ALL_TRANSLATION_STATUSES
  | 'active'
  | 'inactive';

export interface AdminTranslationMetadataFilters {
  readonly kindFilter: AdminTranslationKindFilter;
  readonly statusFilter: AdminTranslationStatusFilter;
}

export const ADMIN_TRANSLATION_KIND_FILTER_OPTIONS: readonly AdminTranslationFilterOption<AdminTranslationKindFilter>[] =
  [
    { value: ADMIN_ALL_TRANSLATION_KINDS, label: 'All kinds' },
    { value: 'text', label: 'Text' },
    { value: 'template', label: 'Template' },
  ];

export const ADMIN_TRANSLATION_STATUS_FILTER_OPTIONS: readonly AdminTranslationFilterOption<AdminTranslationStatusFilter>[] =
  [
    { value: ADMIN_ALL_TRANSLATION_STATUSES, label: 'All statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

function getFilterOptionLabel<TValue extends string>(
  options: readonly AdminTranslationFilterOption<TValue>[],
  value: TValue,
): string {
  const option = options.find((item) => item.value === value);
  if (!option) {
    throw new Error(`Unknown filter value: ${value}`);
  }

  return option.label;
}

export function isAdminTranslationNamespaceFilter(
  value: string,
): value is AdminTranslationNamespaceFilter {
  return value === ADMIN_ALL_TRANSLATION_NAMESPACES || isValidTranslationNamespace(value);
}

export function isAdminTranslationLocaleFilter(
  value: string,
  locales: readonly SupportedLocale[],
): value is AdminTranslationLocaleFilter {
  return value === ADMIN_ALL_TRANSLATION_LOCALES || locales.some((locale) => locale.iso === value);
}

export function isAdminTranslationKindFilter(value: string): value is AdminTranslationKindFilter {
  return ADMIN_TRANSLATION_KIND_FILTER_OPTIONS.some((option) => option.value === value);
}

export function isAdminTranslationStatusFilter(
  value: string,
): value is AdminTranslationStatusFilter {
  return value === ADMIN_ALL_TRANSLATION_STATUSES || value === 'active' || value === 'inactive';
}

export function getAdminTranslationKindFilterLabel(value: AdminTranslationKindFilter): string {
  return getFilterOptionLabel(ADMIN_TRANSLATION_KIND_FILTER_OPTIONS, value);
}

export function getAdminTranslationStatusFilterLabel(value: AdminTranslationStatusFilter): string {
  return getFilterOptionLabel(ADMIN_TRANSLATION_STATUS_FILTER_OPTIONS, value);
}

export function filterAdminTranslationRecordsByMetadata(
  records: readonly AdminTranslationRecord[],
  filters: AdminTranslationMetadataFilters,
): readonly AdminTranslationRecord[] {
  return records.filter((record) => {
    if (filters.kindFilter !== ADMIN_ALL_TRANSLATION_KINDS && record.kind !== filters.kindFilter) {
      return false;
    }

    if (filters.statusFilter === 'active' && !record.isActive) {
      return false;
    }

    if (filters.statusFilter === 'inactive' && record.isActive) {
      return false;
    }

    return true;
  });
}
