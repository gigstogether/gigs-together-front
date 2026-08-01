'use client';

import { Plus } from 'lucide-react';

import {
  ADMIN_ALL_TRANSLATION_LOCALES,
  ADMIN_ALL_TRANSLATION_NAMESPACES,
} from '@/app/admin/_lib/adminKeys';
import AdminTranslationsFilterSelect from '@/app/admin/translations/_components/AdminTranslationsFilterSelect';
import {
  ADMIN_TRANSLATION_KIND_FILTER_OPTIONS,
  ADMIN_TRANSLATION_STATUS_FILTER_OPTIONS,
  getAdminTranslationKindFilterLabel,
  getAdminTranslationStatusFilterLabel,
  isAdminTranslationKindFilter,
  isAdminTranslationLocaleFilter,
  isAdminTranslationNamespaceFilter,
  isAdminTranslationStatusFilter,
} from '@/app/admin/translations/_lib/admin-translations-filters';
import type {
  AdminTranslationFilterOption,
  AdminTranslationKindFilter,
  AdminTranslationLocaleFilter,
  AdminTranslationNamespaceFilter,
  AdminTranslationStatusFilter,
} from '@/app/admin/translations/_lib/admin-translations-filters';
import { Button } from '@/components/ui/button';
import type { SupportedLocale } from '@/app/admin/_lib/admin-api';

function buildLocaleFilterOptions(
  locales: readonly SupportedLocale[],
): readonly AdminTranslationFilterOption[] {
  const localeOptions = locales.map((locale) => ({
    value: locale.iso,
    label: `${locale.nativeName} (${locale.iso})`,
  }));

  return [{ value: ADMIN_ALL_TRANSLATION_LOCALES, label: 'All locales' }, ...localeOptions];
}

function buildNamespaceFilterOptions(
  namespaces: readonly string[],
): readonly AdminTranslationFilterOption[] {
  const namespaceOptions = namespaces.map((namespace) => ({
    value: namespace,
    label: namespace,
  }));

  return [
    { value: ADMIN_ALL_TRANSLATION_NAMESPACES, label: 'All namespaces' },
    ...namespaceOptions,
  ];
}

function getNamespaceFilterLabel(selectedNamespace: AdminTranslationNamespaceFilter): string {
  if (selectedNamespace === ADMIN_ALL_TRANSLATION_NAMESPACES) {
    return 'All namespaces';
  }

  return selectedNamespace;
}

function getLocaleFilterLabel(
  selectedLocaleFilter: AdminTranslationLocaleFilter,
  locales: readonly SupportedLocale[],
): string {
  if (selectedLocaleFilter === ADMIN_ALL_TRANSLATION_LOCALES) {
    return 'All locales';
  }

  const locale = locales.find((item) => item.iso === selectedLocaleFilter);
  if (!locale) {
    return selectedLocaleFilter;
  }

  return `${locale.nativeName} (${locale.iso})`;
}

interface AdminTranslationsFilterControlsProps {
  readonly namespaces: readonly string[];
  readonly selectedNamespace: AdminTranslationNamespaceFilter;
  readonly onNamespaceChange: (namespace: AdminTranslationNamespaceFilter) => void;
  readonly isNamespacesLoading: boolean;
  readonly locales: readonly SupportedLocale[];
  readonly selectedLocaleFilter: AdminTranslationLocaleFilter;
  readonly onLocaleFilterChange: (locale: AdminTranslationLocaleFilter) => void;
  readonly isLocalesLoading: boolean;
  readonly selectedKindFilter: AdminTranslationKindFilter;
  readonly onKindFilterChange: (kind: AdminTranslationKindFilter) => void;
  readonly selectedStatusFilter: AdminTranslationStatusFilter;
  readonly onStatusFilterChange: (status: AdminTranslationStatusFilter) => void;
  readonly isDisabled: boolean;
  readonly onCreateClick: () => void;
  readonly isCreateDisabled: boolean;
}

export default function AdminTranslationsFilterControls(
  props: AdminTranslationsFilterControlsProps,
) {
  const {
    namespaces,
    selectedNamespace,
    onNamespaceChange,
    isNamespacesLoading,
    locales,
    selectedLocaleFilter,
    onLocaleFilterChange,
    isLocalesLoading,
    selectedKindFilter,
    onKindFilterChange,
    selectedStatusFilter,
    onStatusFilterChange,
    isDisabled,
    onCreateClick,
    isCreateDisabled,
  } = props;

  const isFiltersDisabled = isDisabled || isNamespacesLoading || isLocalesLoading;
  const namespaceOptions = buildNamespaceFilterOptions(namespaces);
  const localeOptions = buildLocaleFilterOptions(locales);

  return (
    <nav
      className="shrink-0 border-b bg-muted/20 p-2"
      aria-label="Filter translations"
    >
      {isNamespacesLoading ? (
        <p className="mb-2 px-0.5 text-xs text-muted-foreground">Loading namespaces…</p>
      ) : null}

      {isLocalesLoading ? (
        <p className="mb-2 px-0.5 text-xs text-muted-foreground">Loading locales…</p>
      ) : locales.length === 0 ? (
        <p className="mb-2 px-0.5 text-xs text-muted-foreground">
          No locales configured. Add locales in Admin → Locales first.
        </p>
      ) : null}

      <div className="flex min-w-0 w-full">
        <AdminTranslationsFilterSelect
          ariaLabel="Namespace"
          triggerLabel={getNamespaceFilterLabel(selectedNamespace)}
          selectedValue={selectedNamespace}
          options={namespaceOptions}
          isDisabled={isFiltersDisabled}
          isFirst
          onSelect={(value) => {
            if (isAdminTranslationNamespaceFilter(value)) {
              onNamespaceChange(value);
            }
          }}
        />
        <AdminTranslationsFilterSelect
          ariaLabel="Locale"
          triggerLabel={getLocaleFilterLabel(selectedLocaleFilter, locales)}
          selectedValue={selectedLocaleFilter}
          options={localeOptions}
          isDisabled={isFiltersDisabled || localeOptions.length === 0}
          isFirst={false}
          onSelect={(value) => {
            if (isAdminTranslationLocaleFilter(value, locales)) {
              onLocaleFilterChange(value);
            }
          }}
        />
        <AdminTranslationsFilterSelect
          ariaLabel="Kind"
          triggerLabel={getAdminTranslationKindFilterLabel(selectedKindFilter)}
          selectedValue={selectedKindFilter}
          options={ADMIN_TRANSLATION_KIND_FILTER_OPTIONS}
          isDisabled={isFiltersDisabled}
          isFirst={false}
          onSelect={(value) => {
            if (isAdminTranslationKindFilter(value)) {
              onKindFilterChange(value);
            }
          }}
        />
        <AdminTranslationsFilterSelect
          ariaLabel="Status"
          triggerLabel={getAdminTranslationStatusFilterLabel(selectedStatusFilter)}
          selectedValue={selectedStatusFilter}
          options={ADMIN_TRANSLATION_STATUS_FILTER_OPTIONS}
          isDisabled={isFiltersDisabled}
          isFirst={false}
          onSelect={(value) => {
            if (isAdminTranslationStatusFilter(value)) {
              onStatusFilterChange(value);
            }
          }}
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 shrink-0 -ml-px rounded-l-none rounded-r-md focus-visible:z-10"
          title="New translation"
          disabled={isCreateDisabled}
          onClick={onCreateClick}
        >
          <Plus aria-hidden />
          <span className="sr-only">New translation</span>
        </Button>
      </div>
    </nav>
  );
}
