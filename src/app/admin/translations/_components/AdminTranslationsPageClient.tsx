'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import AdminTranslationFormDialog from '@/app/admin/translations/_components/AdminTranslationFormDialog';
import AdminTranslationsFilterControls from '@/app/admin/translations/_components/AdminTranslationsFilterControls';
import AdminTranslationsTable from '@/app/admin/translations/_components/AdminTranslationsTable';
import type { AdminTranslationFormValues } from '@/app/admin/translations/_lib/admin-translation-form.types';
import { filterAdminTranslationRecordsByMetadata } from '@/app/admin/translations/_lib/admin-translations-filters';
import type {
  AdminTranslationKindFilter,
  AdminTranslationLocaleFilter,
  AdminTranslationNamespaceFilter,
  AdminTranslationStatusFilter,
} from '@/app/admin/translations/_lib/admin-translations-filters';
import { useAdminTranslationsMutations } from '@/app/admin/translations/_hooks/use-admin-translations-mutations';
import {
  ADMIN_ALL_TRANSLATION_KINDS,
  ADMIN_ALL_TRANSLATION_LOCALES,
  ADMIN_ALL_TRANSLATION_NAMESPACES,
  ADMIN_ALL_TRANSLATION_STATUSES,
  adminKeys,
} from '@/app/admin/_lib/adminKeys';
import {
  fetchAdminLocales,
  fetchAdminTranslationNamespaces,
  fetchAdminTranslations,
} from '@/app/admin/_lib/admin-api';
import type {
  AdminTranslationKind,
  AdminTranslationRecord,
  PutAdminTranslationBody,
} from '@/app/admin/_lib/admin-api';
import { isValidTranslationNamespace } from '@/lib/translation-identifiers';

const DEFAULT_NEW_TRANSLATION_KIND: AdminTranslationKind = 'text';

interface BuildCreateFormValuesParams {
  readonly namespace: string;
  readonly locale: string;
}

type TranslationDialogState =
  | {
      readonly mode: 'create';
      readonly values: AdminTranslationFormValues;
    }
  | {
      readonly mode: 'edit';
      readonly values: AdminTranslationFormValues;
    };

function recordToFormValues(record: AdminTranslationRecord): AdminTranslationFormValues {
  return {
    namespace: record.namespace,
    locale: record.locale,
    key: record.key,
    value: record.value,
    kind: record.kind,
    isActive: record.isActive,
  };
}

function buildCreateFormValues(params: BuildCreateFormValuesParams): AdminTranslationFormValues {
  return {
    namespace: params.namespace,
    locale: params.locale,
    key: '',
    value: '',
    kind: DEFAULT_NEW_TRANSLATION_KIND,
    isActive: true,
  };
}

export default function AdminTranslationsPageClient() {
  const [selectedNamespaceFilter, setSelectedNamespaceFilter] =
    useState<AdminTranslationNamespaceFilter>(ADMIN_ALL_TRANSLATION_NAMESPACES);
  const [selectedLocaleFilter, setSelectedLocaleFilter] = useState<AdminTranslationLocaleFilter>(
    ADMIN_ALL_TRANSLATION_LOCALES,
  );
  const [selectedKindFilter, setSelectedKindFilter] = useState<AdminTranslationKindFilter>(
    ADMIN_ALL_TRANSLATION_KINDS,
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<AdminTranslationStatusFilter>(
    ADMIN_ALL_TRANSLATION_STATUSES,
  );
  const [dialogState, setDialogState] = useState<TranslationDialogState | null>(null);

  const namespacesQuery = useQuery({
    queryKey: adminKeys.translationNamespaces(),
    queryFn: fetchAdminTranslationNamespaces,
  });

  const localesQuery = useQuery({
    queryKey: adminKeys.locales(),
    queryFn: fetchAdminLocales,
  });

  const knownNamespaces = useMemo(() => namespacesQuery.data ?? [], [namespacesQuery.data]);
  const knownLocales = useMemo(() => localesQuery.data ?? [], [localesQuery.data]);

  const isViewingAllNamespaces = selectedNamespaceFilter === ADMIN_ALL_TRANSLATION_NAMESPACES;
  const appliedNamespaceFilter = isViewingAllNamespaces ? undefined : selectedNamespaceFilter;
  const appliedLocaleFilter =
    selectedLocaleFilter === ADMIN_ALL_TRANSLATION_LOCALES ? undefined : selectedLocaleFilter;

  const canFetchTranslations =
    isViewingAllNamespaces ||
    (selectedNamespaceFilter.length > 0 && isValidTranslationNamespace(selectedNamespaceFilter));

  const translationsQuery = useQuery({
    queryKey: adminKeys.translations(selectedNamespaceFilter, appliedLocaleFilter),
    queryFn: () =>
      fetchAdminTranslations({
        namespace: appliedNamespaceFilter,
        locale: appliedLocaleFilter,
      }),
    enabled: canFetchTranslations,
  });

  const { isSaving, saveErrorMessage, upsertAsync, setActive } = useAdminTranslationsMutations({
    namespaceFilter: selectedNamespaceFilter,
    localeFilter: appliedLocaleFilter,
  });

  const defaultCreateLocale = knownLocales[0]?.iso ?? '';
  const isCreateDisabled = isSaving;

  const handleNamespaceChange = (namespace: AdminTranslationNamespaceFilter) => {
    setSelectedNamespaceFilter(namespace);
  };

  const handleLocaleFilterChange = (locale: AdminTranslationLocaleFilter) => {
    setSelectedLocaleFilter(locale);
  };

  const handleKindFilterChange = (kind: AdminTranslationKindFilter) => {
    setSelectedKindFilter(kind);
  };

  const handleStatusFilterChange = (status: AdminTranslationStatusFilter) => {
    setSelectedStatusFilter(status);
  };

  const openCreateDialog = () => {
    if (knownLocales.length === 0) {
      return;
    }

    const createNamespace = isViewingAllNamespaces ? '' : selectedNamespaceFilter;

    setDialogState({
      mode: 'create',
      values: buildCreateFormValues({
        namespace: createNamespace,
        locale: defaultCreateLocale,
      }),
    });
  };

  const openEditDialog = (record: AdminTranslationRecord) => {
    setDialogState({
      mode: 'edit',
      values: recordToFormValues(record),
    });
  };

  const handleDialogSubmit = async (body: PutAdminTranslationBody) => {
    await upsertAsync(body);
    setDialogState(null);
  };

  const allRecords = useMemo(() => translationsQuery.data ?? [], [translationsQuery.data]);
  const filteredRecords = useMemo(
    () =>
      filterAdminTranslationRecordsByMetadata(allRecords, {
        kindFilter: selectedKindFilter,
        statusFilter: selectedStatusFilter,
      }),
    [allRecords, selectedKindFilter, selectedStatusFilter],
  );

  const isViewingAllLocales = selectedLocaleFilter === ADMIN_ALL_TRANSLATION_LOCALES;
  const isShowingFilteredSubset = filteredRecords.length !== allRecords.length;

  const emptyTranslationsMessage = !canFetchTranslations
    ? 'Select a valid namespace to load translations.'
    : allRecords.length === 0
      ? isViewingAllNamespaces
        ? 'No translations yet.'
        : isViewingAllLocales
          ? 'No translations in this namespace.'
          : 'No translations match the selected locale.'
      : 'No translations match the selected filters.';

  const isDialogOpen = dialogState !== null;
  const dialogMode = dialogState?.mode ?? 'create';
  const dialogInitialValues =
    dialogState?.values ??
    buildCreateFormValues({
      namespace: isViewingAllNamespaces ? '' : selectedNamespaceFilter,
      locale: defaultCreateLocale,
    });

  return (
    <>
      {namespacesQuery.isError ? (
        <p className="mb-4 text-sm text-destructive">Could not load translation namespaces.</p>
      ) : null}
      {localesQuery.isError ? (
        <p className="mb-4 text-sm text-destructive">Could not load locales.</p>
      ) : null}
      {translationsQuery.isError ? (
        <p className="mb-4 text-sm text-destructive">
          Could not load translations.
          {translationsQuery.error instanceof Error ? ` ${translationsQuery.error.message}` : null}
        </p>
      ) : null}
      {saveErrorMessage ? (
        <p className="mb-4 text-sm text-destructive">
          Could not save translation changes. {saveErrorMessage}
        </p>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-col rounded-lg border sm:min-h-[calc(100dvh-var(--header-h)-8rem)] sm:overflow-hidden">
        <AdminTranslationsFilterControls
          namespaces={knownNamespaces}
          selectedNamespace={selectedNamespaceFilter}
          onNamespaceChange={handleNamespaceChange}
          isNamespacesLoading={namespacesQuery.isLoading}
          locales={knownLocales}
          selectedLocaleFilter={selectedLocaleFilter}
          onLocaleFilterChange={handleLocaleFilterChange}
          isLocalesLoading={localesQuery.isLoading}
          selectedKindFilter={selectedKindFilter}
          onKindFilterChange={handleKindFilterChange}
          selectedStatusFilter={selectedStatusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          isDisabled={isSaving}
          onCreateClick={openCreateDialog}
          isCreateDisabled={isCreateDisabled}
        />

        {translationsQuery.isLoading ? (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">
            Loading translations…
          </p>
        ) : filteredRecords.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">
            {emptyTranslationsMessage}
          </p>
        ) : (
          <AdminTranslationsTable
            records={filteredRecords}
            locales={knownLocales}
            showNamespaceColumn={isViewingAllNamespaces}
            isSaving={isSaving}
            onEdit={openEditDialog}
            onSetActive={setActive}
          />
        )}

        {filteredRecords.length > 0 ? (
          <p className="shrink-0 border-t px-3 py-2 text-xs text-muted-foreground">
            {isShowingFilteredSubset
              ? `Showing ${filteredRecords.length} of ${allRecords.length} translation${allRecords.length === 1 ? '' : 's'}.`
              : `Showing ${filteredRecords.length} translation${filteredRecords.length === 1 ? '' : 's'}.`}
          </p>
        ) : null}
      </div>

      <AdminTranslationFormDialog
        mode={dialogMode}
        open={isDialogOpen}
        initialValues={dialogInitialValues}
        namespaces={knownNamespaces}
        locales={knownLocales}
        isSaving={isSaving}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState(null);
          }
        }}
        onSubmit={handleDialogSubmit}
      />
    </>
  );
}
