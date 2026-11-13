'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';

import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';
import AdminLocalities from './localities/AdminLocalities';
import AdminVenues from './venues/AdminVenues';
import type {
  AdminLocationCatalogProps,
  LocationCatalogKind,
} from './shared/admin-location-catalog';

const CATALOG_COMPONENT_BY_KIND = {
  locality: AdminLocalities,
  venue: AdminVenues,
} satisfies Record<LocationCatalogKind, ComponentType<AdminLocationCatalogProps>>;

export default function AdminLocationCatalogPageClient() {
  const [activeCatalog, setActiveCatalog] = useState<LocationCatalogKind>('venue');
  const ActiveCatalog = CATALOG_COMPONENT_BY_KIND[activeCatalog];

  return (
    <>
      <AdminPageHeader
        title="Locations"
        description="Manage the Locality and Venue catalogs used by gigs."
      />
      <ActiveCatalog
        activeCatalog={activeCatalog}
        onCatalogChange={setActiveCatalog}
      />
    </>
  );
}
