'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { adminKeys } from '@/app/admin/_lib/adminKeys';
import AdminVenueFormDialog from './AdminVenueFormDialog';
import type { AdminVenueFormSubmission } from './AdminVenueFormDialog';
import AdminVenuesCatalog from './AdminVenuesCatalog';
import AdminLocationCatalogControls from '../shared/AdminLocationCatalogControls';
import AdminLocationDeleteDialog from '../shared/AdminLocationDeleteDialog';
import {
  getAdminLocationOperationError,
  matchesLocationSearch,
} from '../shared/admin-location-catalog';
import type { AdminLocationCatalogProps } from '../shared/admin-location-catalog';
import { ADMIN_LOCATION_LOCALE } from '../shared/admin-location-display';
import {
  createAdminVenue,
  deleteAdminVenue,
  fetchAdminLocalities,
  fetchAdminVenues,
  updateAdminVenue,
} from '../../_lib/admin-locations-api';
import type { AdminLocality, AdminVenue } from '../../_lib/admin-locations-api';
import { getCountryDisplayName } from '@/lib/i18n/country-display-name';

export default function AdminVenues(props: AdminLocationCatalogProps) {
  const { activeCatalog, onCatalogChange } = props;

  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formValue, setFormValue] = useState<AdminVenue | null | undefined>(undefined);
  const [deleteValue, setDeleteValue] = useState<AdminVenue | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const localitiesQuery = useQuery({
    queryKey: adminKeys.localities(),
    queryFn: fetchAdminLocalities,
  });
  const venuesQuery = useQuery({
    queryKey: adminKeys.venues(),
    queryFn: fetchAdminVenues,
  });
  const localities = useMemo(() => localitiesQuery.data ?? [], [localitiesQuery.data]);
  const venues = useMemo(() => venuesQuery.data ?? [], [venuesQuery.data]);
  const localityById = useMemo(
    () => new Map<string, AdminLocality>(localities.map((locality) => [locality.id, locality])),
    [localities],
  );
  const visibleVenues = useMemo(
    () =>
      venues.filter((venue) => {
        const locality = localityById.get(venue.localityId);
        return matchesLocationSearch(
          [
            venue.name,
            ...venue.aliases,
            locality?.name ?? '',
            locality?.qualifier ?? '',
            locality?.countryIso ?? '',
            locality ? getCountryDisplayName(locality.countryIso, ADMIN_LOCATION_LOCALE) : '',
          ],
          search,
        );
      }),
    [localityById, venues, search],
  );

  const invalidateVenues = async () => {
    await queryClient.invalidateQueries({ queryKey: adminKeys.venues() });
  };
  const saveMutation = useMutation({
    mutationFn: async (submission: AdminVenueFormSubmission) => {
      if (submission.id === null) {
        await createAdminVenue({
          localityId: submission.localityId,
          name: submission.name,
          aliases: submission.aliases,
          isActive: submission.isActive,
        });
        return;
      }

      await updateAdminVenue(submission.id, {
        name: submission.name,
        aliases: submission.aliases,
        isActive: submission.isActive,
      });
    },
    onSuccess: invalidateVenues,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminVenue,
    onSuccess: invalidateVenues,
  });

  const handleSave = async (submission: AdminVenueFormSubmission): Promise<void> => {
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
  const isLoading = localitiesQuery.isLoading || venuesQuery.isLoading;
  const isLoadError = localitiesQuery.isError || venuesQuery.isError;

  return (
    <>
      <AdminLocationCatalogControls
        activeCatalog={activeCatalog}
        actionLabel="New venue"
        isActionDisabled={isLoading || localities.length === 0}
        search={{ value: search, onChange: setSearch }}
        onCatalogChange={onCatalogChange}
        onAction={() => setFormValue(null)}
      />

      {isLoadError ? <p className="mb-4 text-sm text-destructive">Could not load venues.</p> : null}
      {isLoading ? (
        <p className="py-10 text-sm text-muted-foreground">Loading venues…</p>
      ) : (
        <AdminVenuesCatalog
          venues={visibleVenues}
          localityById={localityById}
          onEdit={setFormValue}
          onDelete={(venue) => {
            setDeleteError(null);
            setDeleteValue(venue);
          }}
        />
      )}

      {formValue !== undefined ? (
        <AdminVenueFormDialog
          key={formValue?.id ?? 'new'}
          value={formValue}
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
          entityLabel="venue"
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
