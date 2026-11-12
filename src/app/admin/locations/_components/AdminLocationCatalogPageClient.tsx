'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';

import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';
import AdminCountries from './countries/AdminCountries';
import AdminLocalities from './localities/AdminLocalities';
import AdminPlaces from './places/AdminPlaces';
import type {
  AdminLocationCatalogProps,
  LocationCatalogKind,
} from './shared/admin-location-catalog';

const CATALOG_COMPONENT_BY_KIND = {
  country: AdminCountries,
  locality: AdminLocalities,
  place: AdminPlaces,
} satisfies Record<LocationCatalogKind, ComponentType<AdminLocationCatalogProps>>;

export default function AdminLocationCatalogPageClient() {
  const [activeCatalog, setActiveCatalog] = useState<LocationCatalogKind>('place');
  const ActiveCatalog = CATALOG_COMPONENT_BY_KIND[activeCatalog];

  return (
    <>
      <AdminPageHeader
        title="Locations"
        description="Manage the Country, Locality, and Place catalogs used by gigs."
      />
      <ActiveCatalog
        activeCatalog={activeCatalog}
        onCatalogChange={setActiveCatalog}
      />
    </>
  );
}
