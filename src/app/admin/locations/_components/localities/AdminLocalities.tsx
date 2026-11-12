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
import { ADMIN_LOCATION_LOCALE } from '../shared/admin-location-display';
import {
  createAdminLocality,
  deleteAdminLocality,
  fetchAdminLocalities,
  fetchAdminRegions,
  updateAdminLocality,
} from '../../_lib/admin-locations-api';
import type { AdminLocality, AdminRegion } from '../../_lib/admin-locations-api';
import { getCountryDisplayName } from '@/lib/i18n/country-display-name';

export default function AdminLocalities(props: AdminLocationCatalogProps) {
  const { activeCatalog, onCatalogChange } = props;

  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formValue, setFormValue] = useState<AdminLocality | null | undefined>(undefined);
  const [deleteValue, setDeleteValue] = useState<AdminLocality | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const regionsQuery = useQuery({
    queryKey: adminKeys.regions(),
    queryFn: fetchAdminRegions,
  });
  const localitiesQuery = useQuery({
    queryKey: adminKeys.localities(),
    queryFn: fetchAdminLocalities,
  });
  const regions = useMemo(() => regionsQuery.data ?? [], [regionsQuery.data]);
  const localities = useMemo(() => localitiesQuery.data ?? [], [localitiesQuery.data]);
  const regionById = useMemo(
    () => new Map<string, AdminRegion>(regions.map((region) => [region.id, region])),
    [regions],
  );
  const visibleLocalities = useMemo(
    () =>
      localities.filter((locality) => {
        const region = regionById.get(locality.regionId);
        return matchesLocationSearch(
          [
            locality.name,
            locality.timeZone,
            ...locality.aliases,
            region?.name ?? '',
            region?.countryIso ?? '',
            region ? getCountryDisplayName(region.countryIso, ADMIN_LOCATION_LOCALE) : '',
          ],
          search,
        );
      }),
    [localities, regionById, search],
  );

  const invalidateLocalities = async () => {
    await queryClient.invalidateQueries({ queryKey: adminKeys.localities() });
  };
  const saveMutation = useMutation({
    mutationFn: async (submission: AdminLocalityFormSubmission) => {
      if (submission.id === null) {
        await createAdminLocality({
          regionId: submission.regionId,
          name: submission.name,
          aliases: submission.aliases,
          timeZone: submission.timeZone,
        });
        return;
      }

      await updateAdminLocality(submission.id, {
        name: submission.name,
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
  const isLoading = regionsQuery.isLoading || localitiesQuery.isLoading;
  const isLoadError = regionsQuery.isError || localitiesQuery.isError;

  return (
    <>
      <AdminLocationCatalogControls
        activeCatalog={activeCatalog}
        actionLabel="New locality"
        isActionDisabled={isLoading || regions.length === 0}
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
          regionById={regionById}
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
          regions={regions}
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
          name={deleteValue.name}
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
