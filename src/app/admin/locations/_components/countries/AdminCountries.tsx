'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { adminKeys } from '@/app/admin/_lib/adminKeys';
import AdminCountriesCatalog from './AdminCountriesCatalog';
import AdminCountryDialog from './AdminCountryDialog';
import AdminLocationCatalogControls from '../shared/AdminLocationCatalogControls';
import type { AdminLocationCatalogProps } from '../shared/admin-location-catalog';
import { fetchAdminCountries } from '../../_lib/admin-countries-api';

export default function AdminCountries(props: AdminLocationCatalogProps) {
  const { activeCatalog, onCatalogChange } = props;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const countriesQuery = useQuery({
    queryKey: adminKeys.countries(),
    queryFn: fetchAdminCountries,
  });
  const countries = countriesQuery.data ?? [];

  return (
    <>
      <AdminLocationCatalogControls
        activeCatalog={activeCatalog}
        actionLabel="Add country"
        isActionDisabled={countriesQuery.isLoading}
        onCatalogChange={onCatalogChange}
        onAction={() => setIsDialogOpen(true)}
      />

      <AdminCountriesCatalog
        countries={countries}
        isLoading={countriesQuery.isLoading}
        isError={countriesQuery.isError}
        onRetry={() => void countriesQuery.refetch()}
      />

      {isDialogOpen ? <AdminCountryDialog onOpenChange={setIsDialogOpen} /> : null}
    </>
  );
}
