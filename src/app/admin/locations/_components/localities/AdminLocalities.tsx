'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { adminKeys } from '@/app/admin/_lib/adminKeys';
import AdminLocalitiesCatalog from './AdminLocalitiesCatalog';
import AdminLocalityFormDialog from './AdminLocalityFormDialog';
import type { AdminLocalityFormSubmission } from './AdminLocalityFormDialog';
import AdminLocationCatalogControls from '../shared/AdminLocationCatalogControls';
import AdminLocationDeleteDialog from '../shared/AdminLocationDeleteDialog';
import {
  getAdminLocationOperationError,
  matchesLocationSearch,
} from '../shared/admin-location-catalog';
import type { AdminLocationCatalogProps } from '../shared/admin-location-catalog';
import { ADMIN_LOCATION_LOCALE, getAdminLocalityLabel } from '../shared/admin-location-display';
import {
  createAdminLocality,
  deleteAdminLocality,
  fetchAdminLocalities,
  updateAdminLocality,
} from '../../_lib/admin-locations-api';
import type { AdminLocality, CreateAdminLocalityBody } from '../../_lib/admin-locations-api';
import { fetchCountries } from '@/lib/countries';
import { getCountryDisplayName } from '@/lib/i18n/country-display-name';

export default function AdminLocalities(props: AdminLocationCatalogProps) {
  const { activeCatalog, onCatalogChange } = props;

  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formValue, setFormValue] = useState<AdminLocality | null | undefined>(undefined);
  const [deleteValue, setDeleteValue] = useState<AdminLocality | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const countriesQuery = useQuery({
    queryKey: adminKeys.countryReferences(),
    queryFn: () => fetchCountries(),
  });
  const localitiesQuery = useQuery({
    queryKey: adminKeys.localities(),
    queryFn: fetchAdminLocalities,
  });
  const countries = useMemo(() => countriesQuery.data ?? [], [countriesQuery.data]);
  const localities = useMemo(() => localitiesQuery.data ?? [], [localitiesQuery.data]);
  const visibleLocalities = useMemo(
    () =>
      localities.filter((locality) =>
        matchesLocationSearch(
          [
            locality.name,
            locality.qualifier ?? '',
            locality.timeZone,
            ...locality.aliases,
            locality.countryIso,
            getCountryDisplayName(locality.countryIso, ADMIN_LOCATION_LOCALE),
          ],
          search,
        ),
      ),
    [localities, search],
  );

  const invalidateLocalities = async () => {
    await queryClient.invalidateQueries({ queryKey: adminKeys.localities() });
  };
  const saveMutation = useMutation({
    mutationFn: async (submission: AdminLocalityFormSubmission) => {
      if (submission.id === null) {
        const body: CreateAdminLocalityBody = {
          countryIso: submission.countryIso,
          name: submission.name,
          aliases: submission.aliases,
          timeZone: submission.timeZone,
        };
        if (submission.qualifier !== null) {
          body.qualifier = submission.qualifier;
        }

        await createAdminLocality(body);
        return;
      }

      await updateAdminLocality(submission.id, {
        name: submission.name,
        qualifier: submission.qualifier,
        aliases: submission.aliases,
        timeZone: submission.timeZone,
      });
    },
    onSuccess: invalidateLocalities,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminLocality,
    onSuccess: invalidateLocalities,
  });

  const handleSave = async (submission: AdminLocalityFormSubmission): Promise<void> => {
    await saveMutation.mutateAsync(submission);
    setFormValue(undefined);
  };
  const handleDelete = async () => {
    if (!deleteValue) {
      return;
    }

    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(deleteValue.id);
      setDeleteValue(null);
    } catch (e) {
      setDeleteError(getAdminLocationOperationError(e));
    }
  };
  const isLoading = countriesQuery.isLoading || localitiesQuery.isLoading;
  const isLoadError = countriesQuery.isError || localitiesQuery.isError;

  return (
    <>
      <AdminLocationCatalogControls
        activeCatalog={activeCatalog}
        actionLabel="New locality"
        isActionDisabled={isLoading || countries.length === 0}
        search={{ value: search, onChange: setSearch }}
        onCatalogChange={onCatalogChange}
        onAction={() => setFormValue(null)}
      />

      {isLoadError ? (
        <p className="mb-4 text-sm text-destructive">Could not load localities.</p>
      ) : null}
      {isLoading ? (
        <p className="py-10 text-sm text-muted-foreground">Loading localities…</p>
      ) : (
        <AdminLocalitiesCatalog
          localities={visibleLocalities}
          onEdit={setFormValue}
          onDelete={(locality) => {
            setDeleteError(null);
            setDeleteValue(locality);
          }}
        />
      )}

      {formValue !== undefined ? (
        <AdminLocalityFormDialog
          key={formValue?.id ?? 'new'}
          value={formValue}
          countries={countries}
          isSaving={saveMutation.isPending}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setFormValue(undefined);
            }
          }}
          onSubmit={handleSave}
        />
      ) : null}

      {deleteValue ? (
        <AdminLocationDeleteDialog
          entityLabel="locality"
          name={getAdminLocalityLabel(deleteValue.name, deleteValue.qualifier)}
          error={deleteError}
          isDeleting={deleteMutation.isPending}
          onCancel={() => {
            setDeleteValue(null);
            setDeleteError(null);
          }}
          onDelete={handleDelete}
        />
      ) : null}
    </>
  );
}
