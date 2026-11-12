import { ADMIN_LOCATION_LOCALE } from './admin-location-display';

export type LocationCatalogKind = 'country' | 'region' | 'locality' | 'place';

export const LOCATION_CATALOG_KINDS = [
  'country',
  'region',
  'locality',
  'place',
] satisfies LocationCatalogKind[];

export interface AdminLocationCatalogProps {
  activeCatalog: LocationCatalogKind;
  onCatalogChange: (catalog: LocationCatalogKind) => void;
}

export function getCatalogLabel(kind: LocationCatalogKind): string {
  switch (kind) {
    case 'country':
      return 'Country';
    case 'region':
      return 'Region';
    case 'locality':
      return 'Locality';
    case 'place':
      return 'Place';
  }
}

export function getCatalogPluralLabel(kind: LocationCatalogKind): string {
  if (kind === 'country') {
    return 'Countries';
  }
  return kind === 'locality' ? 'Localities' : `${getCatalogLabel(kind)}s`;
}

export function matchesLocationSearch(values: string[], search: string): boolean {
  const normalizedSearch = search.trim().toLocaleLowerCase(ADMIN_LOCATION_LOCALE);
  if (normalizedSearch.length === 0) {
    return true;
  }

  return values.some((value) =>
    value.toLocaleLowerCase(ADMIN_LOCATION_LOCALE).includes(normalizedSearch),
  );
}

export function getAdminLocationOperationError(e: unknown): string {
  return e instanceof Error ? e.message : 'The location operation failed.';
}
