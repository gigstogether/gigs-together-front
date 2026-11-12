'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { adminKeys } from '@/app/admin/_lib/adminKeys';
import AdminPlaceFormDialog from './AdminPlaceFormDialog';
import type { AdminPlaceFormSubmission } from './AdminPlaceFormDialog';
import AdminPlacesCatalog from './AdminPlacesCatalog';
import AdminLocationCatalogControls from '../shared/AdminLocationCatalogControls';
import AdminLocationDeleteDialog from '../shared/AdminLocationDeleteDialog';
import {
  getAdminLocationOperationError,
  matchesLocationSearch,
} from '../shared/admin-location-catalog';
import type { AdminLocationCatalogProps } from '../shared/admin-location-catalog';
import { ADMIN_LOCATION_LOCALE } from '../shared/admin-location-display';
import {
  createAdminPlace,
  deleteAdminPlace,
  fetchAdminLocalities,
  fetchAdminPlaces,
  fetchAdminRegions,
  updateAdminPlace,
} from '../../_lib/admin-locations-api';
import type { AdminLocality, AdminPlace, AdminRegion } from '../../_lib/admin-locations-api';
import { getCountryDisplayName } from '@/lib/i18n/country-display-name';

export default function AdminPlaces(props: AdminLocationCatalogProps) {
  const { activeCatalog, onCatalogChange } = props;

  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formValue, setFormValue] = useState<AdminPlace | null | undefined>(undefined);
  const [deleteValue, setDeleteValue] = useState<AdminPlace | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const regionsQuery = useQuery({
    queryKey: adminKeys.regions(),
    queryFn: fetchAdminRegions,
  });
  const localitiesQuery = useQuery({
    queryKey: adminKeys.localities(),
    queryFn: fetchAdminLocalities,
  });
  const placesQuery = useQuery({
    queryKey: adminKeys.places(),
    queryFn: fetchAdminPlaces,
  });
  const regions = useMemo(() => regionsQuery.data ?? [], [regionsQuery.data]);
  const localities = useMemo(() => localitiesQuery.data ?? [], [localitiesQuery.data]);
  const places = useMemo(() => placesQuery.data ?? [], [placesQuery.data]);
  const regionById = useMemo(
    () => new Map<string, AdminRegion>(regions.map((region) => [region.id, region])),
    [regions],
  );
  const localityById = useMemo(
    () => new Map<string, AdminLocality>(localities.map((locality) => [locality.id, locality])),
    [localities],
  );
  const visiblePlaces = useMemo(
    () =>
      places.filter((place) => {
        const locality = localityById.get(place.localityId);
        const region = locality ? regionById.get(locality.regionId) : undefined;
        return matchesLocationSearch(
          [
            place.name,
            ...place.aliases,
            locality?.name ?? '',
            region?.name ?? '',
            region?.countryIso ?? '',
            region ? getCountryDisplayName(region.countryIso, ADMIN_LOCATION_LOCALE) : '',
          ],
          search,
        );
      }),
    [localityById, places, regionById, search],
  );

  const invalidatePlaces = async () => {
    await queryClient.invalidateQueries({ queryKey: adminKeys.places() });
  };
  const saveMutation = useMutation({
    mutationFn: async (submission: AdminPlaceFormSubmission) => {
      if (submission.id === null) {
        await createAdminPlace({
          localityId: submission.localityId,
          name: submission.name,
          aliases: submission.aliases,
          isActive: submission.isActive,
        });
        return;
      }

      await updateAdminPlace(submission.id, {
        name: submission.name,
        aliases: submission.aliases,
        isActive: submission.isActive,
      });
    },
    onSuccess: invalidatePlaces,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminPlace,
    onSuccess: invalidatePlaces,
  });

  const handleSave = async (submission: AdminPlaceFormSubmission): Promise<void> => {
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
  const isLoading = regionsQuery.isLoading || localitiesQuery.isLoading || placesQuery.isLoading;
  const isLoadError = regionsQuery.isError || localitiesQuery.isError || placesQuery.isError;

  return (
    <>
      <AdminLocationCatalogControls
        activeCatalog={activeCatalog}
        actionLabel="New place"
        isActionDisabled={isLoading || localities.length === 0}
        search={{ value: search, onChange: setSearch }}
        onCatalogChange={onCatalogChange}
        onAction={() => setFormValue(null)}
      />

      {isLoadError ? <p className="mb-4 text-sm text-destructive">Could not load places.</p> : null}
      {isLoading ? (
        <p className="py-10 text-sm text-muted-foreground">Loading places…</p>
      ) : (
        <AdminPlacesCatalog
          places={visiblePlaces}
          localityById={localityById}
          regionById={regionById}
          onEdit={setFormValue}
          onDelete={(place) => {
            setDeleteError(null);
            setDeleteValue(place);
          }}
        />
      )}

      {formValue !== undefined ? (
        <AdminPlaceFormDialog
          key={formValue?.id ?? 'new'}
          value={formValue}
          regions={regions}
          localities={localities}
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
          entityLabel="place"
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
