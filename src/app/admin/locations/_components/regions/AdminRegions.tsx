'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { adminKeys } from '@/app/admin/_lib/adminKeys';
import AdminRegionFormDialog from './AdminRegionFormDialog';
import type { AdminRegionFormSubmission } from './AdminRegionFormDialog';
import AdminRegionsCatalog from './AdminRegionsCatalog';
import AdminLocationCatalogControls from '../shared/AdminLocationCatalogControls';
import AdminLocationDeleteDialog from '../shared/AdminLocationDeleteDialog';
import {
  getAdminLocationOperationError,
  matchesLocationSearch,
} from '../shared/admin-location-catalog';
import type { AdminLocationCatalogProps } from '../shared/admin-location-catalog';
import { ADMIN_LOCATION_LOCALE } from '../shared/admin-location-display';
import { fetchAdminCountries } from '../../_lib/admin-countries-api';
import {
  createAdminRegion,
  deleteAdminRegion,
  fetchAdminRegions,
  updateAdminRegion,
} from '../../_lib/admin-locations-api';
import type { AdminRegion } from '../../_lib/admin-locations-api';
import { getCountryDisplayName } from '@/lib/i18n/country-display-name';

export default function AdminRegions(props: AdminLocationCatalogProps) {
  const { activeCatalog, onCatalogChange } = props;

  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formValue, setFormValue] = useState<AdminRegion | null | undefined>(undefined);
  const [deleteValue, setDeleteValue] = useState<AdminRegion | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const countriesQuery = useQuery({
    queryKey: adminKeys.countries(),
    queryFn: fetchAdminCountries,
  });
  const regionsQuery = useQuery({
    queryKey: adminKeys.regions(),
    queryFn: fetchAdminRegions,
  });
  const countries = useMemo(() => countriesQuery.data ?? [], [countriesQuery.data]);
  const regions = useMemo(() => regionsQuery.data ?? [], [regionsQuery.data]);
  const visibleRegions = useMemo(
    () =>
      regions.filter((region) =>
        matchesLocationSearch(
          [
            region.name,
            region.countryIso,
            getCountryDisplayName(region.countryIso, ADMIN_LOCATION_LOCALE),
            ...region.aliases,
          ],
          search,
        ),
      ),
    [regions, search],
  );

  const invalidateRegions = async () => {
    await queryClient.invalidateQueries({ queryKey: adminKeys.regions() });
  };
  const saveMutation = useMutation({
    mutationFn: async (submission: AdminRegionFormSubmission) => {
      if (submission.id === null) {
        await createAdminRegion({
          countryIso: submission.countryIso,
          name: submission.name,
          aliases: submission.aliases,
        });
        return;
      }

      await updateAdminRegion(submission.id, {
        name: submission.name,
        aliases: submission.aliases,
      });
    },
    onSuccess: invalidateRegions,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminRegion,
    onSuccess: invalidateRegions,
  });

  const handleSave = async (submission: AdminRegionFormSubmission): Promise<void> => {
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
  const isLoading = countriesQuery.isLoading || regionsQuery.isLoading;
  const isLoadError = countriesQuery.isError || regionsQuery.isError;

  return (
    <>
      <AdminLocationCatalogControls
        activeCatalog={activeCatalog}
        actionLabel="New region"
        isActionDisabled={isLoading || countries.length === 0}
        search={{ value: search, onChange: setSearch }}
        onCatalogChange={onCatalogChange}
        onAction={() => setFormValue(null)}
      />

      {isLoadError ? (
        <p className="mb-4 text-sm text-destructive">Could not load regions.</p>
      ) : null}
      {isLoading ? (
        <p className="py-10 text-sm text-muted-foreground">Loading regions…</p>
      ) : (
        <AdminRegionsCatalog
          regions={visibleRegions}
          onEdit={setFormValue}
          onDelete={(region) => {
            setDeleteError(null);
            setDeleteValue(region);
          }}
        />
      )}

      {formValue !== undefined ? (
        <AdminRegionFormDialog
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
          entityLabel="region"
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
